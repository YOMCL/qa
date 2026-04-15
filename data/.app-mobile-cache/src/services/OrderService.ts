import { SellerOrderPayload } from '../types/order.payload';
import { OrderData } from '../types/realm.types';
import { AuthService } from './AuthService';

export interface OrderSubmissionResponse {
  _id: string;
  discountErrors?: {
    errorMessage?: string;
  };
}

export interface OrderSubmissionError {
  code: number;
  message: string;
  isDiscountLimitError?: boolean;
}

export class OrderService {
  private static instance: OrderService;
  private authService: AuthService | null = null;

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  public setAuthService(authService: AuthService) {
    this.authService = authService;
  }

  public async saveOrder(orderData: OrderData | SellerOrderPayload): Promise<OrderSubmissionResponse> {
    try {
      if (!this.authService) {
        throw new Error('Auth service not initialized');
      }

      const response = await this.authService.request('POST', '/orders/seller', orderData);

      if (response.status < 200 || response.status >= 300) {
        const errorText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        const isDiscountLimitError = errorText.includes('tp40033');
        
        throw {
          code: response.status,
          message: errorText,
          isDiscountLimitError
        } as OrderSubmissionError;
      }

      return response.data as OrderSubmissionResponse;
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      
      throw {
        code: 0,
        message: error instanceof Error ? error.message : 'Error desconocido'
      } as OrderSubmissionError;
    }
  }
}
