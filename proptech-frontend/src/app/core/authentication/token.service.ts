import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor() {}

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  clearStorage(): void {
    if (this.isBrowser()) {
      window.localStorage.clear();
    }
  }

  saveToken(token: string): void {
    if (this.isBrowser()) {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.setItem(TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return window.localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  saveUser(user: User): void {
    if (this.isBrowser()) {
      window.localStorage.removeItem(USER_KEY);
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  getUser(): User | null {
    if (this.isBrowser()) {
      const user = window.localStorage.getItem(USER_KEY);
      if (user) {
        return JSON.parse(user);
      }
    }
    return null;
  }
}
