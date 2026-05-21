import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sale, SaleStatus } from '../models/sale.model';

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

export interface SaleRequest {
  listingId: number;
  buyerId: number;
  salePrice: number;
  commission: number;
  notes?: string;
  closingDate?: string;
  status: SaleStatus; // ISO format date
}

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  private apiUrl = `${environment.apiUrl}/sales`;
  private adminApiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new sale
   */
  // Sửa method createSale trong SaleService

  createSale(saleRequest: SaleRequest): Observable<ApiResponse<Sale>> {
    console.log('Creating sale with request:', JSON.stringify(saleRequest));

    // Thêm headers để debug
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    console.log('API URL:', this.apiUrl);
    console.log('Headers being sent:', {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token?.substring(0, 15)}...`,
    });

    // Sử dụng HTTP client với log đầy đủ
    return this.http
      .post<ApiResponse<Sale>>(this.apiUrl, saleRequest, { headers })
      .pipe(
        tap((response: any) => console.log('Create sale response:', response)),
        catchError((error) => {
          console.error('Error in createSale:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          if (error.error) {
            console.error('Server error details:', error.error);
          }
          return throwError(() => error);
        })
      );
  }
  // Add this method to your SaleService class

  /**
   * Updates all fields of an existing sale
   * @param saleId - The ID of the sale to update
   * @param saleRequest - The updated sale data
   * @returns Observable with API response
   */
  updateSale(
    saleId: number,
    saleRequest: SaleRequest
  ): Observable<ApiResponse<Sale>> {
    return this.http.put<ApiResponse<Sale>>(
      `${this.apiUrl}/${saleId}`,
      saleRequest
    );
  }
  /**
   * Get sale by ID
   */
  getSale(id: number): Observable<ApiResponse<Sale>> {
    return this.http.get<ApiResponse<Sale>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get sales by buyer ID
   */
  getSalesByBuyer(buyerId: number): Observable<ApiResponse<Sale[]>> {
    return this.http.get<ApiResponse<Sale[]>>(
      `${this.apiUrl}/by-buyer/${buyerId}`
    );
  }

  /**
   * Get my purchases (for logged in buyer)
   */
  getMyPurchases(): Observable<ApiResponse<Sale[]>> {
    return this.http.get<ApiResponse<Sale[]>>(`${this.apiUrl}/my-purchases`);
  }

  /**
   * Get sales by realtor ID
   */
  getSalesByRealtor(realtorId: number): Observable<ApiResponse<Sale[]>> {
    return this.http.get<ApiResponse<Sale[]>>(
      `${this.apiUrl}/by-realtor/${realtorId}`
    );
  }

  /**
   * Get my sales (for logged in realtor)
   */
  getMySales(): Observable<ApiResponse<Sale[]>> {
    return this.http.get<ApiResponse<Sale[]>>(`${this.apiUrl}/my-sales`);
  }

  /**
   * Get sales by status (Admin only)
   */
  getSalesByStatus(
    status: SaleStatus,
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PagedResponse<Sale>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PagedResponse<Sale>>>(
      `${this.apiUrl}/by-status/${status}`,
      { params }
    );
  }
  /**
   * Get user's purchases (for any buyer by ID)
   * @param userId - ID của người dùng cần lấy giao dịch mua
   */
  getUserPurchases(userId: number): Observable<ApiResponse<Sale[]>> {
    if (!userId) {
      return throwError(() => new Error('User ID is required'));
    }

    return this.http
      .get<ApiResponse<Sale[]>>(`${this.apiUrl}/by-buyer/${userId}`)
      .pipe(
        tap((response) =>
          console.log(`User ${userId} purchases response:`, response)
        ),
        catchError((error) => {
          console.error(`Error fetching purchases for user ${userId}:`, error);
          return throwError(() => error);
        })
      );
  }
  /**
   * Get realtor's sales by status
   */
  getMySalesByStatus(
    status: SaleStatus,
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PagedResponse<Sale>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PagedResponse<Sale>>>(
      `${this.apiUrl}/my-sales/by-status/${status}`,
      { params }
    );
  }

  /**
   * Update sale status
   */
  updateSaleStatus(
    saleId: number,
    status: SaleStatus,
    notes?: string
  ): Observable<ApiResponse<Sale>> {
    let params = new HttpParams().set('status', status);

    if (notes) params = params.set('notes', notes);

    return this.http.put<ApiResponse<Sale>>(
      `${this.apiUrl}/${saleId}/status`,
      null,
      { params }
    );
  }

  /**
   * Get all sales with pagination (Admin only)
   */
  getAllSales(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Observable<ApiResponse<PagedResponse<Sale>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<ApiResponse<PagedResponse<Sale>>>(
      `${this.adminApiUrl}/sales`,
      { params }
    );
  }

  /**
   * Delete a sale (Admin only)
   * Note: This method is not explicitly shown in the controller but would be needed for admin functionality
   */
  deleteSale(saleId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.adminApiUrl}/sales/${saleId}`
    );
  }
}
