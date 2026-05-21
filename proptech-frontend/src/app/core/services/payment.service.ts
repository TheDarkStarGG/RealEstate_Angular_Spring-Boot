import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment, PaymentStatus, PaymentType } from '../models/payment.model';

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

export interface PaymentRequest {
  paymentType: PaymentType;
  referenceId: string;
  userId: number;
  amount: number;
  commission: number;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  /**
   * Get all payments with pagination (Admin only)
   */
  getAllPayments(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Observable<ApiResponse<PagedResponse<Payment>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<ApiResponse<PagedResponse<Payment>>>(this.apiUrl, {
      params,
    });
  }

  /**
   * Create a new payment (Admin only)
   */
  createPayment(
    paymentRequest: PaymentRequest
  ): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(this.apiUrl, paymentRequest);
  }

  /**
   * Get payment by ID
   */
  getPayment(id: number): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get payments by user ID
   */
  getUserPayments(userId: number): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(
      `${this.apiUrl}/by-user/${userId}`
    );
  }

  /**
   * Get my payments (for logged in user)
   */
  getMyPayments(): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(`${this.apiUrl}/my-payments`);
  }

  /**
   * Get payments by type (Admin only)
   */
  getPaymentsByType(
    paymentType: PaymentType,
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PagedResponse<Payment>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PagedResponse<Payment>>>(
      `${this.apiUrl}/by-type/${paymentType}`,
      { params }
    );
  }

  /**
   * Get payments by status (Admin only)
   */
  getPaymentsByStatus(
    status: PaymentStatus,
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PagedResponse<Payment>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PagedResponse<Payment>>>(
      `${this.apiUrl}/by-status/${status}`,
      { params }
    );
  }
  // Add this method to your PaymentService class

  /**
   * Delete a payment (Admin only)
   */
  deletePayment(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
  /**
   * Get payments by date range (Admin only)
   */
  getPaymentsByDateRange(
    startDate: string, // ISO format date-time
    endDate: string, // ISO format date-time
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PagedResponse<Payment>>> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PagedResponse<Payment>>>(
      `${this.apiUrl}/by-date-range`,
      { params }
    );
  }
  // Add this method to your PaymentService class

  /**
   * Update a payment (Admin only)
   */
  updatePayment(
    id: number,
    paymentRequest: PaymentRequest
  ): Observable<ApiResponse<Payment>> {
    return this.http.put<ApiResponse<Payment>>(
      `${this.apiUrl}/${id}`,
      paymentRequest
    );
  }
  /**
   * Update payment status (Admin only)
   */
  updatePaymentStatus(
    paymentId: number,
    status: PaymentStatus,
    transactionId?: string,
    notes?: string
  ): Observable<ApiResponse<Payment>> {
    let params = new HttpParams().set('status', status);

    if (transactionId) params = params.set('transactionId', transactionId);
    if (notes) params = params.set('notes', notes);

    return this.http.put<ApiResponse<Payment>>(
      `${this.apiUrl}/${paymentId}/status`,
      null,
      { params }
    );
  }

  /**
   * Get payments by reference ID (Admin only)
   */
  getPaymentsByReferenceId(
    referenceId: string
  ): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(
      `${this.apiUrl}/by-reference/${referenceId}`
    );
  }
}
