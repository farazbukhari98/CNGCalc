import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a decimal payback period (in years) into "X Years, X Months" format
 * @param paybackPeriod The payback period in years (can be decimal)
 * @returns Formatted string in "X Years, X Months" format
 */
export function formatPaybackPeriod(paybackPeriod: number): string {
  if (isNaN(paybackPeriod) || paybackPeriod < 0) return "N/A";
  
  const years = Math.floor(paybackPeriod);
  const months = Math.round((paybackPeriod - years) * 12);
  
  // Handle case where months rounds up to 12
  if (months === 12) {
    return `${years + 1} ${years + 1 === 1 ? 'Year' : 'Years'}, 0 Months`;
  }
  
  const yearText = years === 1 ? 'Year' : 'Years';
  const monthText = months === 1 ? 'Month' : 'Months';
  
  return `${years} ${yearText}, ${months} ${monthText}`;
}
