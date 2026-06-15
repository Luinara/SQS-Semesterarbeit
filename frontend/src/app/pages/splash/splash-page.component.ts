import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService } from '../../core/services/app-state.service';
import { UiButtonComponent } from '../../shared/ui/button/ui-button.component';

@Component({
  selector: 'sqs-splash-page',
  standalone: true,
  imports: [UiButtonComponent],
  templateUrl: './splash-page.component.html',
  styleUrl: './splash-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplashPageComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly appState = inject(AppStateService);
  private navigationTimeoutId: number | null = null;
  private hasNavigated = false;

  readonly ctaLabel = computed(() =>
    this.appState.isAuthenticated() ? 'Zurueck ins Spiel' : 'Spiel starten'
  );

  ngOnInit(): void {
    this.navigationTimeoutId = window.setTimeout(() => {
      void this.navigateForward();
    }, 2400);
  }

  ngOnDestroy(): void {
    if (this.navigationTimeoutId !== null) {
      window.clearTimeout(this.navigationTimeoutId);
    }
  }

  async navigateForward(): Promise<void> {
    if (this.hasNavigated) {
      return;
    }

    this.hasNavigated = true;
    const hasSession = this.appState.isAuthenticated() || (await this.appState.restoreSession());
    await this.router.navigateByUrl(hasSession ? '/dashboard' : '/auth');
  }
}
