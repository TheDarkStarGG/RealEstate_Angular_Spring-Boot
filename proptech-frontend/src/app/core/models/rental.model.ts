import { Listing } from './listing.model';
import { User } from './user.model';

export enum RentalStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Rental {
  id: number;
  listing: Listing;
  tenant: User;
  realtor: User;
  monthlyRate: number;
  securityDeposit: number;
  commission: number;
  startDate: string;
  endDate: string;
  status: RentalStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
