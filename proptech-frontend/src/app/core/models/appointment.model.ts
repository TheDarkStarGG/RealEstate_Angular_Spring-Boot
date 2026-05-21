import { Listing } from './listing.model';
import { User } from './user.model';

export enum AppointmentStatus {
  REQUESTED = 'REQUESTED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface Appointment {
  id: number;
  listing: Listing;
  client: User;
  realtor: User;
  appointmentDateTime: string; // ISO format date-time
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
