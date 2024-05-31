import {CanActivateFn, Router} from '@angular/router';
import {AuthenticationService} from "./services/authentication.service";
import {inject} from "@angular/core";

export const authGuard: CanActivateFn = (route, state) => {
  const authenticationService = inject(AuthenticationService)
  const router = inject(Router);

  if (!authenticationService.isAuthenticated()) {
    router.navigate(['/users/login']);
    return false;
  }

  return true;

};
