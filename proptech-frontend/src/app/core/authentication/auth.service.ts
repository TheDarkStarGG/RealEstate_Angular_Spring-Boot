import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import { User } from '../models/user.model';

interface LoginRequest {
  username: string;
  password: string;
}

interface SignupRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  roles?: string[];
}

interface JwtResponse {
  accessToken: string;
  tokenType: string;
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
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
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient, private tokenService: TokenService) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      this.tokenService.getUser()
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<ApiResponse<JwtResponse>> {
    return this.http
      .post<ApiResponse<JwtResponse>>(`${this.apiUrl}/signin`, credentials)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.tokenService.saveToken(response.data.accessToken);
            this.tokenService.saveUser({
              id: response.data.id,
              username: response.data.username,
              email: response.data.email,
              fullName: response.data.fullName,
              roles: response.data.roles,
            });

            this.currentUserSubject.next(this.tokenService.getUser());
          }
        })
      );
  }

  register(user: SignupRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/signup`, user);
  }

  logout(): void {
    this.tokenService.clearStorage();
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.tokenService.getToken();
    return !!token;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    if (!user) return false;
    return user.roles.includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  isRealtor(): boolean {
    return this.hasRole('ROLE_REALTOR');
  }

  isUser(): boolean {
    return this.hasRole('ROLE_USER');
  }
}
