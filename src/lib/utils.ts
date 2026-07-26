import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a price string from Shopify (e.g. "49.99") to a localized
 * currency string.
 *
 * @param amount - The price amount as a string (e.g. "49.99")
 * @param currencyCode - The ISO 4217 currency code (default: "EUR")
 * @returns A localized currency string (e.g. "49,99 €")
 */
export function formatPrice(
  amount: string,
  currencyCode: string = "EUR"
): string {
  const numericAmount = parseFloat(amount)
  if (isNaN(numericAmount)) return amount

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount)
}
