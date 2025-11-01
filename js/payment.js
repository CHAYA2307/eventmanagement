// js/payment.js
// Small helper to open Razorpay - extract to reuse in dashboard/admin
export function openRazorpay({amount, name, description, prefill={}, onSuccess}) {
  const options = {
    key: 'rzp_test_1DP5mmOlF5G5ag', // REPLACE with your test/live key
    amount: Math.round(amount * 100),
    currency: 'INR',
    name,
    description,
    handler(res) { if (onSuccess) onSuccess(res); },
    prefill
  };
  const rzp = new Razorpay(options);
  rzp.open();
}
