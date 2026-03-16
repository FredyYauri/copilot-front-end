import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators, NonNullableFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserManagementService } from '../../services/user-management.service';
import { RoleManagementService } from '../../services/role-management.service';
import { Role } from '../../models/role.model';

interface UserFormControls {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  roleId: FormControl<string>;
  isActive: FormControl<boolean>;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly userService = inject(UserManagementService);
  private readonly roleService = inject(RoleManagementService);

  readonly isEditMode = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly userId = signal('');
  readonly roles = signal<Role[]>([]);

  form = this.fb.group<UserFormControls>({
    firstName: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
    lastName: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
    email: this.fb.control('', [Validators.required, Validators.email, Validators.maxLength(256)]),
    password: this.fb.control('', [Validators.required, Validators.minLength(8)]),
    roleId: this.fb.control('', [Validators.required]),
    isActive: this.fb.control(true)
  });

  ngOnInit(): void {
    this.loadRoles();
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
    const { firstName, lastName, email, password, roleId } = this.form.getRawValue();

    this.userService.createUser({ firstName, lastName, email, password, roleId }).subscribe({
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
    const { firstName, lastName, email, roleId, isActive } = this.form.getRawValue();

    this.userService.updateUser(this.userId(), { firstName, lastName, email, roleId, isActive }).subscribe({
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
          roleId: user.roleId,
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

  private loadRoles(): void {
    this.roleService.getRoles(1, 100).subscribe({
      next: (result) => {
        this.roles.set(result.items.filter(r => r.isActive));
      },
      error: () => {
        this.errorMessage.set('Error al cargar los roles.');
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
