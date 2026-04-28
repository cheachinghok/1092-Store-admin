import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export const formatKHR = (amount: number) =>
  '៛' + new Intl.NumberFormat('en-US').format(Math.round(amount));
