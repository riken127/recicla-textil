import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);

  return authenticationService.isAuthenticated().pipe(
    map(result => {
      if (!result) {
        router.navigate(['/users/login']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      router.navigate(['/users/login']);
      return of(false);
    })
  );
};
