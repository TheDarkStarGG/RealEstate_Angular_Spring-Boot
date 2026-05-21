import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment, AppointmentStatus } from '../models/appointment.model';

interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface AppointmentRequest {
  listingId: number;
  clientId: number;
  appointmentDateTime: string; // ISO format date-time
  durationMinutes: number;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  /**
   * Get all appointments (Admin only)
   */
  getAllAppointments(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'appointmentDateTime',
    sortDir: string = 'asc'
  ): Observable<ApiResponse<PagedResponse<Appointment>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    // Thêm '/admin' vào đường dẫn API
    return this.http.get<ApiResponse<PagedResponse<Appointment>>>(
      `${environment.apiUrl}/admin/appointments`,
      {
        params,
      }
    );
  }

  /**
   * Create a new appointment
   */
  createAppointment(
    appointmentRequest: AppointmentRequest
  ): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(
      this.apiUrl,
      appointmentRequest
    );
  }

  /**
   * Get appointment by ID
   */
  getAppointment(id: number): Observable<ApiResponse<Appointment>> {
    return this.http.get<ApiResponse<Appointment>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get appointments for a client
   */
  getAppointmentsByClient(
    clientId: number
  ): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(
      `${this.apiUrl}/by-client/${clientId}`
    );
  }

  /**
   * Get my appointments (for logged in client)
   */
  getMyClientAppointments(): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(
      `${this.apiUrl}/my-client-appointments`
    );
  }

  /**
   * Get appointments for a realtor
   */
  getAppointmentsByRealtor(
    realtorId: number
  ): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(
      `${this.apiUrl}/by-realtor/${realtorId}`
    );
  }

  /**
   * Get my appointments (for logged in realtor)
   */
  getMyRealtorAppointments(): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(
      `${this.apiUrl}/my-appointments`
    );
  }

  /**
   * Get appointments by status (Admin only)
   */
  getAppointmentsByStatus(
    status: AppointmentStatus,
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PagedResponse<Appointment>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PagedResponse<Appointment>>>(
      `${this.apiUrl}/by-status/${status}`,
      { params }
    );
  }

  /**
   * Get realtor's appointments by status
   */
  getMyAppointmentsByStatus(
    status: AppointmentStatus,
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PagedResponse<Appointment>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PagedResponse<Appointment>>>(
      `${this.apiUrl}/my-appointments/by-status/${status}`,
      { params }
    );
  }

  /**
   * Get client's appointments by status
   */
  getMyClientAppointmentsByStatus(
    status: AppointmentStatus,
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PagedResponse<Appointment>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PagedResponse<Appointment>>>(
      `${this.apiUrl}/my-client-appointments/by-status/${status}`,
      { params }
    );
  }

  /**
   * Get appointments by date range (Admin only)
   */
  getAppointmentsByDateRange(
    startDateTime: Date,
    endDateTime: Date
  ): Observable<ApiResponse<Appointment[]>> {
    let params = new HttpParams()
      .set('startDateTime', startDateTime.toISOString())
      .set('endDateTime', endDateTime.toISOString());

    return this.http.get<ApiResponse<Appointment[]>>(
      `${this.apiUrl}/by-date-range`,
      { params }
    );
  }

  /**
   * Get my appointments by date range (for logged in realtor)
   */
  getMyAppointmentsByDateRange(
    startDateTime: string, // ISO format date-time
    endDateTime: string // ISO format date-time
  ): Observable<ApiResponse<Appointment[]>> {
    let params = new HttpParams()
      .set('startDateTime', startDateTime)
      .set('endDateTime', endDateTime);

    return this.http.get<ApiResponse<Appointment[]>>(
      `${this.apiUrl}/my-appointments/by-date-range`,
      { params }
    );
  }

  /**
   * Update appointment status (for realtors and admins)
   */
  updateAppointmentStatus(
    appointmentId: number,
    status: AppointmentStatus,
    notes?: string
  ): Observable<ApiResponse<Appointment>> {
    let params = new HttpParams().set('status', status);

    if (notes) params = params.set('notes', notes);

    return this.http.put<ApiResponse<Appointment>>(
      `${this.apiUrl}/${appointmentId}/status`,
      null,
      { params }
    );
  }

  /**
   * Reschedule appointment
   */
  rescheduleAppointment(
    appointmentId: number,
    newDateTime: string, // ISO format date-time
    newDuration?: number
  ): Observable<ApiResponse<Appointment>> {
    let params = new HttpParams().set('newDateTime', newDateTime);

    if (newDuration) params = params.set('newDuration', newDuration.toString());

    return this.http.put<ApiResponse<Appointment>>(
      `${this.apiUrl}/${appointmentId}/reschedule`,
      null,
      { params }
    );
  }
}
