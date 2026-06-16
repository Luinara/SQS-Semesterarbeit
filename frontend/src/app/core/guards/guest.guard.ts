import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStateService } from '../services/app-state.service';

export const guestGuard: CanActivateFn = async () => {
  const appState = inject(AppStateService);
  const router = inject(Router);

  if (appState.isAuthenticated() || (await appState.restoreSession())) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
