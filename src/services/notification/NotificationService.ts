import { toast } from 'sonner';

export class NotificationService {
  static success(message: string, description?: string): void {
    toast.success(message, { description });
  }

  static error(message: string, description?: string): void {
    toast.error(message, { description });
  }

  static info(message: string, description?: string): void {
    toast.info(message, { description });
  }

  static warning(message: string, description?: string): void {
    toast.warning(message, { description });
  }
}
