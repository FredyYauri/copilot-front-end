import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators, NonNullableFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PermissionManagementService } from '../../services/permission-management.service';
import { PERMISSION_TYPES } from '../../models/permission-management.model';

interface PermissionFormControls {
  resource: FormControl<string>;
  action: FormControl<string>;
  description: FormControl<string>;
  type: FormControl<string>;
}

@Component({
  selector: 'app-permission-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './permission-form.component.html',
  styleUrl: './permission-form.component.scss'
})
export class PermissionFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly permissionService = inject(PermissionManagementService);

  readonly isEditMode = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly permissionId = signal('');
  readonly permissionTypes = PERMISSION_TYPES;

  form = this.fb.group<PermissionFormControls>({
    resource: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
    action: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
    description: this.fb.control('', [Validators.required, Validators.maxLength(500)]),
    type: this.fb.control('page', [Validators.required])
  });

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.permissionId.set(id);
      this.loadPermission();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    if (this.isEditMode()) {
      this.updatePermission();
    } else {
      this.createPermission();
    }
  }

  private createPermission(): void {
    const formValue = this.form.getRawValue();

    this.permissionService.createPermission(formValue).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.detail ?? 'Error al crear el permiso.');
      }
    });
  }

  private updatePermission(): void {
    const formValue = this.form.getRawValue();

    this.permissionService.updatePermission(this.permissionId(), formValue).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['../../'], { relativeTo: this.route });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.detail ?? 'Error al actualizar el permiso.');
      }
    });
  }

  private loadPermission(): void {
    this.loading.set(true);
    this.permissionService.getPermissions(1, 100).subscribe({
      next: (result) => {
        const permission = result.items.find(p => p.id === this.permissionId());
        if (permission) {
          this.form.patchValue({
            resource: permission.resource,
            action: permission.action,
            description: permission.description,
            type: permission.type
          });
        } else {
          this.errorMessage.set('Permiso no encontrado.');
        }
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar el permiso.');
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
