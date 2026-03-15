import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators, NonNullableFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UserManagementService } from '../../services/user-management.service';

interface UserFormControls {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  role: FormControl<string>;
  isActive: FormControl<boolean>;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserManagementService);

  readonly isEditMode = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly userId = signal('');

  form = this.fb.group<UserFormControls>({
    firstName: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
    lastName: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
    email: this.fb.control('', [Validators.required, Validators.email, Validators.maxLength(256)]),
    password: this.fb.control('', [Validators.required, Validators.minLength(8)]),
    role: this.fb.control('User', [Validators.required]),
    isActive: this.fb.control(true)
  });

  readonly roles = ['User', 'Admin', 'Manager'];

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.userId.set(id);
      this.form.controls.password.clearValidators();
      this.form.controls.password.updateValueAndValidity();
      this.loadUser(id);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    if (this.isEditMode()) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  private createUser(): void {
    const { firstName, lastName, email, password, role } = this.form.getRawValue();

    this.userService.createUser({ firstName, lastName, email, password, role }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.detail ?? 'Error al crear el usuario.');
      }
    });
  }

  private updateUser(): void {
    const { firstName, lastName, email, role, isActive } = this.form.getRawValue();

    this.userService.updateUser(this.userId(), { firstName, lastName, email, role, isActive }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['../../'], { relativeTo: this.route });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.detail ?? 'Error al actualizar el usuario.');
      }
    });
  }

  private loadUser(id: string): void {
    this.loading.set(true);
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar el usuario.');
        this.loading.set(false);
      }
    });
  }
}
