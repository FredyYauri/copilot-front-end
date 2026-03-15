import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators, NonNullableFormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

interface ForgotPasswordForm {
  email: FormControl<string>;
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly success = signal(false);
  readonly errorMessage = signal('');

  form = this.fb.group<ForgotPasswordForm>({
    email: this.fb.control('', [Validators.required, Validators.email])
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');
    this.success.set(false);

    const { email } = this.form.getRawValue();

    this.authService.forgotPassword({ email }).subscribe({
      next: (result) => {
        this.loading.set(false);
        if (result) {
          this.success.set(true);
          this.form.reset();
        } else {
          this.errorMessage.set('No se pudo procesar la solicitud.');
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Error de conexión. Intenta más tarde.');
      }
    });
  }
}
