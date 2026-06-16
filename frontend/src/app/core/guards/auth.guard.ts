import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStateService } from '../services/app-state.service';

export const authGuard: CanActivateFn = async () => {
  const appState = inject(AppStateService);
  const router = inject(Router);

  if (appState.isAuthenticated()) {
    return true;
  }

  return (await appState.restoreSession()) ? true : router.createUrlTree(['/auth']);
};
