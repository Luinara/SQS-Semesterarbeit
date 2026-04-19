import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService } from '../../core/services/app-state.service';
import { DEMO_ACCOUNT } from '../../shared/mock/mock-data';
import { AuthMode, AuthSubmission } from '../../shared/models/auth.model';
import { AuthFormComponent } from './auth-form/auth-form.component';

@Component({
  selector: 'sqs-auth-page',
  standalone: true,
  imports: [AuthFormComponent],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPageComponent {
  private readonly router = inject(Router);
  private readonly appState = inject(AppStateService);

  readonly mode = signal<AuthMode>('login');
  readonly feedbackMessage = signal<string | null>(null);
  readonly hasError = signal(false);
  readonly demoEmail = DEMO_ACCOUNT.email;
  readonly demoPassword = DEMO_ACCOUNT.password;

  showMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.feedbackMessage.set(null);
    this.hasError.set(false);
  }

  async submitCredentials(submission: AuthSubmission): Promise<void> {
    const result = 'userName' in submission ? this.appState.register(submission) : this.appState.login(submission);

    if (!result.success) {
      this.feedbackMessage.set(result.message);
      this.hasError.set(true);
      return;
    }

    this.feedbackMessage.set(result.message);
    this.hasError.set(false);
    await this.router.navigateByUrl('/dashboard');
  }
}
