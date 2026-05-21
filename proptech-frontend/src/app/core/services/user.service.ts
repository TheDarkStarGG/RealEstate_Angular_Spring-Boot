import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  roles: string[];
}

export interface ProfileUpdateRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserCreateRequest {
  username: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  roles?: string[];
}
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private adminApiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  /**
   * Get current user profile
   */
  getMyProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}/me`);
  }

  /**
   * Update current user profile
   */
  updateProfile(
    request: ProfileUpdateRequest
  ): Observable<ApiResponse<UserProfile>> {
    return this.http.put<ApiResponse<UserProfile>>(
      `${this.apiUrl}/profile`,
      request
    );
  }

  /**
   * Change password
   */
  changePassword(
    request: PasswordChangeRequest
  ): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/change-password`,
      request
    );
  }

  /**
   * Get user by ID (for public profiles)
   */
  getUser(id: number): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get all users (admin only)
   */
  getAllUsers(
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PagedResponse<User>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PagedResponse<User>>>(
      `${this.apiUrl}/all`,
      { params }
    );
  }

  /**
   * Search users by name or email
   */
  searchUsers(query: string): Observable<ApiResponse<User[]>> {
    let params = new HttpParams().set('query', query);
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/search`, {
      params,
    });
  }

  /**
   * Get all realtors
   */
  getRealtors(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/realtors`);
  }

  /**
   * Create a new regular user (admin only)
   */
  createUser(user: UserCreateRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.adminApiUrl}/users`, user);
  }

  /**
   * Create a new realtor (admin only)
   */
  createRealtor(user: UserCreateRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(
      `${this.adminApiUrl}/realtors`,
      user
    );
  }

  /**
   * Create a new admin (admin only)
   */
  createAdmin(user: UserCreateRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(
      `${this.adminApiUrl}/admins`,
      user
    );
  }

  /**
   * Update a user (admin only)
   */
  updateUser(
    userId: number,
    user: UserCreateRequest
  ): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(
      `${this.adminApiUrl}/users/${userId}`,
      user
    );
  }

  /**
   * Delete a user (admin only)
   */
  deleteUser(userId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.adminApiUrl}/users/${userId}`
    );
  }

  /**
   * Get user details by ID (admin only)
   */
  getUserDetails(userId: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(
      `${this.adminApiUrl}/users/${userId}`
    );
  }
}
