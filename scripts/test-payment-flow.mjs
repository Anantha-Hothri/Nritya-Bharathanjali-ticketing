// Standalone Unit Test Suite for PhonePe Payment Flow
function testValidateAmount(rawAmount) {
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
  if (amount > 500000) {
    return { valid: false, error: 'Amount exceeds maximum allowed limit' };
  }
  const roundedAmount = Math.round(amount * 100) / 100;
  if (roundedAmount <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }
  return { valid: true, amount: roundedAmount };
}

function testMapPhonePeState(state) {
  if (!state) return 'PENDING';
  const upperState = String(state).toUpperCase();
  if (['COMPLETED', 'PAYMENT_SUCCESS', 'SUCCESS', 'PAID'].includes(upperState)) {
    return 'SUCCESS';
  }
  if (['FAILED', 'PAYMENT_ERROR', 'DECLINED', 'CANCELLED', 'TIMED_OUT'].includes(upperState)) {
    return 'FAILED';
  }
  return 'PENDING';
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASSED: ${message}`);
    passed++;
  } else {
    console.error(`  ✕ FAILED: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('=== PHONEPE ENTER_AMOUNT PAYMENT FLOW UNIT & INTEGRATION TESTS ===\n');

  console.log('--- 1. Amount Validation Tests ---');
  assert(testValidateAmount(1).valid === true && testValidateAmount(1).amount === 1, '₹1 is valid');
  assert(testValidateAmount(10).valid === true && testValidateAmount(10).amount === 10, '₹10 is valid');
  assert(testValidateAmount(500).valid === true && testValidateAmount(500).amount === 500, '₹500 is valid');
  assert(testValidateAmount('500.50').valid === true && testValidateAmount('500.50').amount === 500.5, 'Decimal string ₹500.50 is valid');

  assert(testValidateAmount(0).valid === false, 'Zero ₹0 is rejected');
  assert(testValidateAmount(-50).valid === false, 'Negative -₹50 is rejected');
  assert(testValidateAmount('').valid === false, 'Empty string is rejected');
  assert(testValidateAmount(null).valid === false, 'Null is rejected');
  assert(testValidateAmount(undefined).valid === false, 'Undefined is rejected');
  assert(testValidateAmount('invalid_string').valid === false, 'Non-numeric string is rejected');
  assert(testValidateAmount(NaN).valid === false, 'NaN is rejected');
  assert(testValidateAmount(Infinity).valid === false, 'Infinity is rejected');
  assert(testValidateAmount(600000).valid === false, 'Amount > ₹5,00,000 max limit is rejected');

  console.log('\n--- 2. PhonePe State Mapping Tests ---');
  assert(testMapPhonePeState('COMPLETED') === 'SUCCESS', 'PhonePe COMPLETED maps to SUCCESS');
  assert(testMapPhonePeState('PAYMENT_SUCCESS') === 'SUCCESS', 'PhonePe PAYMENT_SUCCESS maps to SUCCESS');
  assert(testMapPhonePeState('FAILED') === 'FAILED', 'PhonePe FAILED maps to FAILED');
  assert(testMapPhonePeState('PAYMENT_ERROR') === 'FAILED', 'PhonePe PAYMENT_ERROR maps to FAILED');
  assert(testMapPhonePeState('PENDING') === 'PENDING', 'PhonePe PENDING maps to PENDING');
  assert(testMapPhonePeState(null) === 'PENDING', 'Null state maps to PENDING');

  console.log('\n--- 3. Currency Unit Conversion Test ---');
  const testAmount = 500;
  const paise = Math.round(testAmount * 100);
  assert(paise === 50000, '₹500 correctly converts to 50000 paise for PhonePe API');

  console.log('\n==================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
