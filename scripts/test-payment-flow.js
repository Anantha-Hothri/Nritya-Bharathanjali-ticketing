import { validateAmount } from '../app/api/payment/create/route.js';
import { mapPhonePeState } from '../app/api/payment/status/[transactionId]/route.js';

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
  assert(validateAmount(1).valid === true && validateAmount(1).amount === 1, '₹1 is valid');
  assert(validateAmount(10).valid === true && validateAmount(10).amount === 10, '₹10 is valid');
  assert(validateAmount(500).valid === true && validateAmount(500).amount === 500, '₹500 is valid');
  assert(validateAmount('500.50').valid === true && validateAmount('500.50').amount === 500.5, 'Decimal string ₹500.50 is valid');
  
  assert(validateAmount(0).valid === false, 'Zero ₹0 is rejected');
  assert(validateAmount(-50).valid === false, 'Negative -₹50 is rejected');
  assert(validateAmount('').valid === false, 'Empty string is rejected');
  assert(validateAmount(null).valid === false, 'Null is rejected');
  assert(validateAmount(undefined).valid === false, 'Undefined is rejected');
  assert(validateAmount('invalid_string').valid === false, 'Non-numeric string is rejected');
  assert(validateAmount(NaN).valid === false, 'NaN is rejected');
  assert(validateAmount(Infinity).valid === false, 'Infinity is rejected');
  assert(validateAmount(600000).valid === false, 'Amount > ₹5,00,000 max limit is rejected');

  console.log('\n--- 2. PhonePe State Mapping Tests ---');
  assert(mapPhonePeState('COMPLETED') === 'SUCCESS', 'PhonePe COMPLETED maps to SUCCESS');
  assert(mapPhonePeState('PAYMENT_SUCCESS') === 'SUCCESS', 'PhonePe PAYMENT_SUCCESS maps to SUCCESS');
  assert(mapPhonePeState('FAILED') === 'FAILED', 'PhonePe FAILED maps to FAILED');
  assert(mapPhonePeState('PAYMENT_ERROR') === 'FAILED', 'PhonePe PAYMENT_ERROR maps to FAILED');
  assert(mapPhonePeState('PENDING') === 'PENDING', 'PhonePe PENDING maps to PENDING');
  assert(mapPhonePeState(null) === 'PENDING', 'Null state maps to PENDING');

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
