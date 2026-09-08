import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes so a later class wins over an earlier one of the same
 * kind. Plain string concatenation leaves `px-4 px-6` to CSS source order,
 * which is not the order they appear in the string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
