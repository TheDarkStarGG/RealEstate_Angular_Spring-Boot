import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    // Check if route has data and roles specified
    if (route.data && route.data['roles']) {
      const requiredRoles = route.data['roles'] as string[];
      const canAccess = requiredRoles.some((role) =>
        this.authService.hasRole(role)
      );

      if (!canAccess) {
        // Navigate to access denied or home page
        this.router.navigate(['/access-denied']);
        return false;
      }
    }

    return true;
  }
}
