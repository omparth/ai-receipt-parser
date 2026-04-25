import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatCurrency(value: number, currency: string = "INR") {
  if (value === null || value === undefined) return "N/A";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
  }).format(vvalue);
}
