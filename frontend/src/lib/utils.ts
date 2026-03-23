import { AxiosError } from 'axios';
import { clsx, type ClassValue } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const titleize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    return error.response?.data.message ?? 'An error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

export const notifyError = (
  error: unknown,
  fallbackMessage = 'An unexpected error occurred',
) => {
  const message = getErrorMessage(error);
  toast.error(message === 'An unexpected error occurred' ? fallbackMessage : message);
};
