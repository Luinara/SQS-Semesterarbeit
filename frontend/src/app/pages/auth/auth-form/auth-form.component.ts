import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { AuthMode, AuthSubmission } from '../../../shared/models/auth.model';
import { UiButtonComponent } from '../../../shared/ui/button/ui-button.component';

@Component({
  selector: 'sqs-auth-form',
  standalone: true,
  imports: [ReactiveFormsModule, UiButtonComponent],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthFormComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private hasSubmittedAttempt = false;

  readonly mode = input.required<AuthMode>();
  readonly feedbackMessage = input<string | null>(null);
  readonly hasError = input(false);
  readonly credentialsSubmitted = output<AuthSubmission>();

  readonly form = this.formBuilder.group({
    username: this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(32),
      Validators.pattern(/^[a-zA-Z0-9._-]+$/),
    ]),
    password: this.formBuilder.control('', [Validators.required]),
  });

  constructor() {
    effect(() => {
      const passwordControl = this.form.controls.password;
      const validators =
        this.mode() === 'register'
          ? [Validators.required, Validators.minLength(8)]
          : [Validators.required];

      passwordControl.setValidators(validators);
      passwordControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  submitForm(): void {
    this.hasSubmittedAttempt = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const username = formValue.username.trim();

    if (this.mode() === 'register') {
      this.credentialsSubmitted.emit({
        username,
        password: formValue.password,
        userName: username,
      });

      return;
    }

    this.credentialsSubmitted.emit({
      username,
      password: formValue.password,
    });
  }

  shouldShowError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.hasSubmittedAttempt);
  }

  usernameErrorText(): string {
    if (this.form.controls.username.hasError('required')) {
      return 'Bitte gib deinen Backend-Username ein.';
    }

    if (this.form.controls.username.hasError('maxlength')) {
      return 'Der Username darf hoechstens 32 Zeichen lang sein.';
    }

    if (this.form.controls.username.hasError('pattern')) {
      return 'Erlaubt sind Buchstaben, Zahlen, Punkt, Unterstrich und Bindestrich.';
    }

    return 'Der Username sollte mindestens 2 Zeichen lang sein.';
  }

  passwordErrorText(): string {
    if (this.form.controls.password.hasError('required')) {
      return 'Bitte gib ein Passwort ein.';
    }

    if (this.form.controls.password.hasError('minlength')) {
      return 'Das Passwort sollte mindestens 8 Zeichen haben.';
    }

    return 'Bitte pruefe das Passwort.';
  }
}
