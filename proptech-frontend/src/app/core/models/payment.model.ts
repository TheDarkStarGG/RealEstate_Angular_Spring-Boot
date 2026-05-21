import { User } from './user.model';

export enum PaymentType {
  SALE_COMMISSION = 'SALE_COMMISSION',
  RENTAL_COMMISSION = 'RENTAL_COMMISSION',
  DEPOSIT = 'DEPOSIT',
  MONTHLY_RENT = 'MONTHLY_RENT',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Payment {
  id: number;
  paymentType: PaymentType;
  referenceId: string;
  user: User;
  amount: number;
  commission: number;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
