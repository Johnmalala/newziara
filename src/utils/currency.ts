const KES_RATE = 130; // Static exchange rate: 1 USD = 130 KES

/**
 * Converts a price from USD to KES and formats it as a currency string.
 * @param priceInUsd The price in USD to convert.
 * @returns A formatted string representing the price in KES (e.g., "KSh 13,000.00").
 */
export const formatToKes = (priceInUsd: number): string => {
  const amountInKes = priceInUsd * KES_RATE;
  
  // Use Intl.NumberFormat for proper Kenyan Shilling formatting.
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amountInKes);
};
