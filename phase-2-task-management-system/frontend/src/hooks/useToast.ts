/**
 * useToast Hook
 * Wrapper for Sonner toast notifications
 * Based on: /specs/004-frontend-nextjs-spec/plan.md
 */

import { toast } from "sonner";

/**
 * Toast hook providing consistent notification API
 * @returns Object with success, error, info, and promise toast methods
 */
export function useToast() {
  return {
    /**
     * Show success toast
     * @param message - Success message to display
     */
    success: (message: string) => {
      toast.success(message);
    },

    /**
     * Show error toast
     * @param message - Error message to display
     */
    error: (message: string) => {
      toast.error(message);
    },

    /**
     * Show info toast
     * @param message - Info message to display
     */
    info: (message: string) => {
      toast.info(message);
    },

    /**
     * Show loading toast that updates on promise resolution
     * @param promise - Promise to track
     * @param messages - Loading, success, and error messages
     */
    promise: <T>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      }
    ) => {
      toast.promise(promise, messages);
    },
  };
}
