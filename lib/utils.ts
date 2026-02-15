import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getImageUrl = (url: string) => {
  if (!url) return "";
  // Agregar timestamp para evitar cache
  return `${url}?t=${new Date().getTime()}`;
};
