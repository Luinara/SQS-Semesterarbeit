import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
    email: this.formBuilder.control('', [Validators.required, Validators.email]),
    password: this.formBuilder.control('', [Validators.required, Validators.minLength(6)]),
    userName: this.formBuilder.control(''),
  });

  constructor() {
    // Der Benutzername wird nur im Registrierungsmodus gebraucht.
    // Die Validierung bleibt dadurch praezise und vermeidet Sonderfaelle im Submit-Flow.
    effect(() => {
      const userNameControl = this.form.controls.userName;

      if (this.mode() === 'register') {
        userNameControl.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(24)]);
      } else {
        userNameControl.clearValidators();
        userNameControl.setValue('', { emitEvent: false });
      }

      userNameControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  submitForm(): void {
    this.hasSubmittedAttempt = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    if (this.mode() === 'register') {
      this.credentialsSubmitted.emit({
        email: formValue.email.trim(),
        password: formValue.password,
        userName: formValue.userName.trim(),
      });

      return;
    }

    this.credentialsSubmitted.emit({
      email: formValue.email.trim(),
      password: formValue.password,
    });
  }

  shouldShowError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.hasSubmittedAttempt);
  }

  emailErrorText(): string {
    if (this.form.controls.email.hasError('required')) {
      return 'Bitte gib eine E-Mail-Adresse ein.';
    }

    return 'Bitte verwende ein gueltiges E-Mail-Format.';
  }

  passwordErrorText(): string {
    if (this.form.controls.password.hasError('required')) {
      return 'Bitte gib ein Passwort ein.';
    }

    return 'Das Passwort sollte mindestens 6 Zeichen haben.';
  }

  userNameErrorText(): string {
    if (this.form.controls.userName.hasError('required')) {
      return 'Bitte waehle einen Benutzernamen.';
    }

    if (this.form.controls.userName.hasError('maxlength')) {
      return 'Der Benutzername darf hoechstens 24 Zeichen lang sein.';
    }

    return 'Der Benutzername sollte mindestens 2 Zeichen lang sein.';
  }
}
