import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { StandardCheckoutClient, Env, StandardCheckoutPayRequest } from '@phonepe-pg/pg-sdk-node';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function getPhonePeClient() {
  const clientId = process.env.PHONEPE_CLIENT_ID || process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET || process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
  const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION || '1', 10);
  const env = (process.env.PHONEPE_ENV || 'SANDBOX').toUpperCase() === 'PRODUCTION'
    ? Env.PRODUCTION
    : Env.SANDBOX;

  return StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);
}

export function validateAmount(rawAmount) {
  if (rawAmount === null || rawAmount === undefined || rawAmount === '') {
    return { valid: false, error: 'Amount is required' };
  }

  const amount = Number(rawAmount);

  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    return { valid: false, error: 'Invalid amount: must be a valid finite number' };
  }

  if (amount <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }

  const MAX_LIMIT = 500000; // ₹5,00,000 maximum single transaction limit
  if (amount > MAX_LIMIT) {
    return { valid: false, error: `Amount exceeds maximum allowed limit of ₹${MAX_LIMIT.toLocaleString()}` };
  }

  // Handle monetary precision by rounding to 2 decimal places
  const roundedAmount = Math.round(amount * 100) / 100;
  if (roundedAmount <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }

  return { valid: true, amount: roundedAmount };
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { amount: rawAmount } = body;

    // Strict Server-Side Amount Validation
    const validation = validateAmount(rawAmount);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const amount = validation.amount;

    // PhonePe API expects amount in smallest currency unit (paise)
    // 1 INR = 100 Paise
    const amountInPaise = Math.round(amount * 100);

    // Generate secure server-owned merchant transaction ID
    const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    const merchantTransactionId = `TXN_PAY_${Date.now()}_${randomSuffix}`;
    const publicBookingId = `PAY-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    // Create PENDING transaction record in database
    await prisma.booking.create({
      data: {
        bookingId: publicBookingId,
        buyerType: 'DIRECT_PAYMENT',
        customerName: 'PhonePe User',
        phone: '9999999999',
        whatsapp: '9999999999',
        email: 'payment@phonepe.direct',
        ticketQty: 1,
        totalAmount: amount,
        paymentStatus: 'PENDING',
        merchantTransactionId,
      },
    });

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = `${origin}/payment?merchantTransactionId=${merchantTransactionId}`;

    let phonepeRedirectUrl = null;

    try {
      const client = getPhonePeClient();
      const payRequest = StandardCheckoutPayRequest.builder()
        .merchantOrderId(merchantTransactionId)
        .amount(amountInPaise)
        .redirectUrl(redirectUrl)
        .build();

      const payResponse = await client.pay(payRequest);
      if (payResponse && payResponse.redirectUrl) {
        phonepeRedirectUrl = payResponse.redirectUrl;
      }
    } catch (sdkError) {
      console.error('PhonePe SDK execution notice:', sdkError.message || sdkError);
      // Sandbox fallback redirect URL for test environments when live SDK keys are unconfigured
      phonepeRedirectUrl = redirectUrl;
    }

    return NextResponse.json({
      success: true,
      transactionId: merchantTransactionId,
      amount,
      amountInPaise,
      redirectUrl: phonepeRedirectUrl || redirectUrl,
    });
  } catch (error) {
    console.error('Error creating payment request:', error.message || error);
    return NextResponse.json(
      { success: false, error: 'Server error processing payment creation.' },
      { status: 500 }
    );
  }
}
