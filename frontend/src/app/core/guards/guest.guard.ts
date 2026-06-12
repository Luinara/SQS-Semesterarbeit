import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStateService } from '../services/app-state.service';

export const guestGuard: CanActivateFn = () => {
  const appState = inject(AppStateService);
  const router = inject(Router);

  return appState.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
};
