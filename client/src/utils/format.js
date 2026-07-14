// Central currency formatter — Indian Rupee, lakh/crore grouping (en-IN),
// no decimal paise shown since all catalog prices are whole rupees.
const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatPrice = (amount) => formatter.format(Number(amount) || 0);
