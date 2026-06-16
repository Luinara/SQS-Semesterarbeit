import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { AuthMode, AuthSubmission } from '../../../shared/models/auth.model';
import { STARTER_POKEMON_OPTIONS } from '../../../shared/mock/mock-data';
import { StarterPokemonSpeciesName } from '../../../shared/models/pet.model';
import { UiButtonComponent } from '../../../shared/ui/button/ui-button.component';

export function createAuthSubmission(
  mode: AuthMode,
  username: string,
  password: string,
  starterPokemonSpecies: StarterPokemonSpeciesName = 'bulbasaur'
): AuthSubmission {
  const trimmedUsername = username.trim();

  if (mode === 'register') {
    return {
      username: trimmedUsername,
      password,
      userName: trimmedUsername,
      starterPokemonSpecies,
    };
  }

  return {
    username: trimmedUsername,
    password,
  };
}

export function getUsernameErrorText(errors: ValidationErrors | null): string {
  if (errors?.['required']) {
    return 'Bitte gib deinen Spielernamen ein.';
  }

  if (errors?.['maxlength']) {
    return 'Der Spielername darf höchstens 32 Zeichen lang sein.';
  }

  if (errors?.['pattern']) {
    return 'Erlaubt sind Buchstaben, Zahlen, Punkt, Unterstrich und Bindestrich.';
  }

  return 'Der Spielername sollte mindestens 2 Zeichen lang sein.';
}

export function getPasswordErrorText(errors: ValidationErrors | null): string {
  if (errors?.['required']) {
    return 'Bitte gib ein Passwort ein.';
  }

  if (errors?.['minlength']) {
    return 'Das Passwort sollte mindestens 8 Zeichen haben.';
  }

  return 'Bitte prüfe das Passwort.';
}

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
  readonly starterPokemonOptions = STARTER_POKEMON_OPTIONS;

  readonly mode = input.required<AuthMode>();
  readonly feedbackMessage = input<string | null>(null);
  readonly hasError = input(false);
  readonly isSubmitting = input(false);
  readonly credentialsSubmitted = output<AuthSubmission>();

  readonly form = this.formBuilder.group({
    username: this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(32),
      Validators.pattern(/^[a-zA-Z0-9._-]+$/),
    ]),
    password: this.formBuilder.control('', [Validators.required]),
    starterPokemonSpecies: this.formBuilder.control<StarterPokemonSpeciesName>('bulbasaur'),
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
    if (this.isSubmitting()) {
      return;
    }

    this.hasSubmittedAttempt = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    this.credentialsSubmitted.emit(
      createAuthSubmission(
        this.mode(),
        formValue.username,
        formValue.password,
        formValue.starterPokemonSpecies
      )
    );
  }

  shouldShowError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.hasSubmittedAttempt);
  }

  usernameErrorText(): string {
    return getUsernameErrorText(this.form.controls.username.errors);
  }

  passwordErrorText(): string {
    return getPasswordErrorText(this.form.controls.password.errors);
  }

  selectStarterPokemon(starterPokemonSpecies: StarterPokemonSpeciesName): void {
    if (this.isSubmitting()) {
      return;
    }

    this.form.controls.starterPokemonSpecies.setValue(starterPokemonSpecies);
    this.form.controls.starterPokemonSpecies.markAsDirty();
  }
}
