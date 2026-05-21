import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Listing, PropertyType, ListingType } from '../models/listing.model';

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

@Injectable({
  providedIn: 'root',
})
export class ListingService {
  private apiUrl = `${environment.apiUrl}/listings`;

  constructor(private http: HttpClient) {}

  getListings(
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PagedResponse<Listing>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PagedResponse<Listing>>>(
      `${this.apiUrl}/public`,
      { params }
    );
  }

  getListing(id: number): Observable<ApiResponse<Listing>> {
    return this.http.get<ApiResponse<Listing>>(`${this.apiUrl}/${id}`);
  }

  getMyListings(
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PagedResponse<Listing>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PagedResponse<Listing>>>(
      `${this.apiUrl}/my-listings`,
      { params }
    );
  }
  searchMyListings(
    propertyType?: PropertyType,
    listingType?: ListingType,
    city?: string,
    minPrice?: number,
    maxPrice?: number,
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PagedResponse<Listing>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (propertyType) {
      params = params.set('propertyType', propertyType);
    }

    if (listingType) {
      params = params.set('listingType', listingType);
    }

    if (city) {
      params = params.set('city', city);
    }

    if (minPrice) {
      params = params.set('minPrice', minPrice.toString());
    }

    if (maxPrice) {
      params = params.set('maxPrice', maxPrice.toString());
    }

    // This endpoint should be created in your backend to filter only current user's listings
    return this.http.get<ApiResponse<PagedResponse<Listing>>>(
      `${this.apiUrl}/my-listings/search`,
      { params }
    );
  }
  searchListings(
    propertyType?: PropertyType,
    listingType?: ListingType,
    city?: string,
    minPrice?: number,
    maxPrice?: number,
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PagedResponse<Listing>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (propertyType) {
      params = params.set('propertyType', propertyType);
    }

    if (listingType) {
      params = params.set('listingType', listingType);
    }

    if (city) {
      params = params.set('city', city);
    }

    if (minPrice) {
      params = params.set('minPrice', minPrice.toString());
    }

    if (maxPrice) {
      params = params.set('maxPrice', maxPrice.toString());
    }

    return this.http.get<ApiResponse<PagedResponse<Listing>>>(
      `${this.apiUrl}/search`,
      { params }
    );
  }

  createListing(listing: Partial<Listing>): Observable<ApiResponse<Listing>> {
    return this.http.post<ApiResponse<Listing>>(this.apiUrl, listing);
  }

  updateListing(
    id: number,
    listing: Partial<Listing>
  ): Observable<ApiResponse<Listing>> {
    return this.http.put<ApiResponse<Listing>>(`${this.apiUrl}/${id}`, listing);
  }

  deleteListing(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
  getAllListings(
    page: number = 0,
    size: number = 10,
    propertyType?: string,
    listingType?: string,
    active?: string
  ): Observable<ApiResponse<PagedResponse<Listing>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // Thêm các tham số lọc nếu chúng được cung cấp
    if (propertyType) {
      params = params.set('propertyType', propertyType);
    }

    if (listingType) {
      params = params.set('listingType', listingType);
    }

    if (active !== undefined && active !== '') {
      params = params.set('active', active);
    }

    return this.http.get<ApiResponse<PagedResponse<Listing>>>(
      `${environment.apiUrl}/admin/listings`,
      { params }
    );
  }
}
