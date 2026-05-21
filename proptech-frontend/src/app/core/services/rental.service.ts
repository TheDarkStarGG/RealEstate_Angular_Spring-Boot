import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Rental, RentalStatus } from '../models/rental.model';

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

export interface RentalRequest {
  listingId: number;
  tenantId: number;
  monthlyRate: number;
  securityDeposit: number;
  commission: number;
  startDate: string; // ISO format date
  endDate: string; // ISO format date
  notes?: string;
  status?: RentalStatus;
}

@Injectable({
  providedIn: 'root',
})
export class RentalService {
  private apiUrl = `${environment.apiUrl}/rentals`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new rental agreement
   */
  createRental(rentalRequest: RentalRequest): Observable<ApiResponse<Rental>> {
    return this.http.post<ApiResponse<Rental>>(this.apiUrl, rentalRequest);
  }

  /**
   * Get rental by ID
   */
  getRental(id: number): Observable<ApiResponse<Rental>> {
    return this.http.get<ApiResponse<Rental>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get rentals by tenant ID
   */
  getRentalsByTenant(tenantId: number): Observable<ApiResponse<Rental[]>> {
    return this.http.get<ApiResponse<Rental[]>>(
      `${this.apiUrl}/by-tenant/${tenantId}`
    );
  }

  /**
   * Get my rentals (for logged in Realtor0)
   */
  getMyRentals(): Observable<ApiResponse<Rental[]>> {
    return this.http.get<ApiResponse<Rental[]>>(`${this.apiUrl}/my-rentals`);
  }
  /**
   * Get user's rentals (for any tenant by ID)
   * @param tenantId - ID của người thuê cần lấy thông tin giao dịch thuê
   */
  getUserRentals(tenantId: number): Observable<ApiResponse<Rental[]>> {
    if (!tenantId) {
      return throwError(() => new Error('Tenant ID is required'));
    }

    return this.http
      .get<ApiResponse<Rental[]>>(`${this.apiUrl}/by-tenant/${tenantId}`)
      .pipe(
        tap((response) =>
          console.log(`Tenant ${tenantId} rentals response:`, response)
        ),
        catchError((error) => {
          console.error(
            `Error fetching rentals for tenant ${tenantId}:`,
            error
          );
          return throwError(() => error);
        })
      );
  }
  /**
   * Get rentals by realtor ID
   */
  getRentalsByRealtor(realtorId: number): Observable<ApiResponse<Rental[]>> {
    return this.http.get<ApiResponse<Rental[]>>(
      `${this.apiUrl}/by-realtor/${realtorId}`
    );
  }

  /**
   * Get rentals by status (Admin only)
   */
  getRentalsByStatus(
    status: RentalStatus,
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PagedResponse<Rental>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PagedResponse<Rental>>>(
      `${this.apiUrl}/by-status/${status}`,
      { params }
    );
  }

  /**
   * Get realtor's rentals by status
   */
  getMyRentalsByStatus(
    status: RentalStatus,
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PagedResponse<Rental>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PagedResponse<Rental>>>(
      `${this.apiUrl}/my-rentals/by-status/${status}`,
      { params }
    );
  }

  /**
   * Get active rentals (Admin only)
   */
  getActiveRentals(
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PagedResponse<Rental>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PagedResponse<Rental>>>(
      `${this.apiUrl}/active`,
      { params }
    );
  }

  /**
   * Update rental status
   */
  updateRentalStatus(
    rentalId: number,
    status: RentalStatus,
    notes?: string
  ): Observable<ApiResponse<Rental>> {
    let params = new HttpParams().set('status', status);

    if (notes) params = params.set('notes', notes);

    return this.http.put<ApiResponse<Rental>>(
      `${this.apiUrl}/${rentalId}/status`,
      null,
      { params }
    );
  }
  updateRental(
    rentalId: number,
    rentalRequest: RentalRequest
  ): Observable<ApiResponse<Rental>> {
    return this.http.put<ApiResponse<Rental>>(
      `${this.apiUrl}/${rentalId}`,
      rentalRequest
    );
  }

  /**
   * Extend rental agreement
   */
  extendRental(
    rentalId: number,
    newEndDate: string // ISO format date
  ): Observable<ApiResponse<Rental>> {
    let params = new HttpParams().set('newEndDate', newEndDate);

    return this.http.put<ApiResponse<Rental>>(
      `${this.apiUrl}/${rentalId}/extend`,
      null,
      { params }
    );
  }
}
