import { Listing } from './listing.model';
import { User } from './user.model';

export enum SaleStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Sale {
  id: number;
  listing: Listing;
  buyer: User;
  realtor: User;
  salePrice: number;
  commission: number;
  status: SaleStatus;
  notes?: string;
  closingDate?: string;
  createdAt: string;
  updatedAt: string;
}
