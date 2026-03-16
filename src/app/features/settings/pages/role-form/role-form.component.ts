import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators, NonNullableFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RoleManagementService } from '../../services/role-management.service';

interface RoleFormControls {
  name: FormControl<string>;
  description: FormControl<string>;
  isActive: FormControl<boolean>;
}

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.scss'
})
export class RoleFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly roleService = inject(RoleManagementService);

  readonly isEditMode = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly roleId = signal('');
  readonly isSystem = signal(false);

  form = this.fb.group<RoleFormControls>({
    name: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
    description: this.fb.control('', [Validators.maxLength(500)]),
    isActive: this.fb.control(true)
  });

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.roleId.set(id);
      this.loadRole(id);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    if (this.isEditMode()) {
      this.updateRole();
    } else {
      this.createRole();
    }
  }

  private createRole(): void {
    const { name, description } = this.form.getRawValue();

    this.roleService.createRole({ name, description }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.detail ?? 'Error al crear el rol.');
      }
    });
  }

  private updateRole(): void {
    const { name, description, isActive } = this.form.getRawValue();

    this.roleService.updateRole(this.roleId(), { name, description, isActive }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['../../'], { relativeTo: this.route });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.detail ?? 'Error al actualizar el rol.');
      }
    });
  }

  private loadRole(id: string): void {
    this.loading.set(true);
    this.roleService.getRoleById(id).subscribe({
      next: (role) => {
        this.isSystem.set(role.isSystem);
        this.form.patchValue({
          name: role.name,
          description: role.description,
          isActive: role.isActive
        });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar el rol.');
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
