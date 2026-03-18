import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, NonNullableFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { SupplierService } from '../../services/supplier.service';

interface SupplierGeneralForm {
  nombre: FormControl<string>;
  ruc: FormControl<string>;
  telefono: FormControl<string>;
  direccion: FormControl<string>;
  distrito: FormControl<string>;
  ciudad: FormControl<string>;
  correo: FormControl<string>;
  paginaWeb: FormControl<string>;
}

interface SupplierCommercialForm {
  numeroCuenta: FormControl<string>;
  banco: FormControl<string>;
  productos: FormControl<string>;
  observaciones: FormControl<string>;
}

interface SupplierContactForm {
  nombre: FormControl<string>;
  cargo: FormControl<string>;
  telefono: FormControl<string>;
  correo: FormControl<string>;
}

interface StepConfig {
  id: string;
  label: string;
  number: number;
}

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.scss'
})
export class SupplierFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly supplierService = inject(SupplierService);

  readonly isEditMode = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly supplierId = signal('');
  readonly currentStep = signal(0);

  // Per-section state for edit mode
  readonly sectionSaving = signal<Record<string, boolean>>({});
  readonly sectionSuccess = signal<Record<string, string>>({});
  readonly sectionError = signal<Record<string, string>>({});
  readonly generalDirty = signal(false);
  readonly contactsDirty = signal(false);
  readonly commercialDirty = signal(false);

  readonly hasUnsavedChanges = computed(() =>
    this.generalDirty() || this.contactsDirty() || this.commercialDirty()
  );

  readonly steps: StepConfig[] = [
    { id: 'general', label: 'Proveedor', number: 1 },
    { id: 'contacts', label: 'Contactos', number: 2 },
    { id: 'commercial', label: 'Info Comercial', number: 3 }
  ];

  generalForm = this.fb.group<SupplierGeneralForm>({
    nombre: this.fb.control('', [Validators.required, Validators.maxLength(200)]),
    ruc: this.fb.control('', [Validators.pattern(/^(\d{11}|999)$/)]),
    telefono: this.fb.control('', [Validators.maxLength(19)]),
    direccion: this.fb.control('', [Validators.maxLength(500)]),
    distrito: this.fb.control('', [Validators.maxLength(100)]),
    ciudad: this.fb.control('', [Validators.maxLength(100)]),
    correo: this.fb.control('', [Validators.email]),
    paginaWeb: this.fb.control('', [Validators.maxLength(300)])
  });

  private readonly generalFormValid = toSignal(
    this.generalForm.statusChanges.pipe(map(() => this.generalForm.valid)),
    { initialValue: this.generalForm.valid }
  );

  readonly isFirstStep = computed(() => this.currentStep() === 0);
  readonly isLastStep = computed(() => this.currentStep() === this.steps.length - 1);
  readonly canAdvance = computed(() => {
    if (this.currentStep() === 0) {
      return this.generalFormValid();
    }
    return true;
  });

  contactsForm = this.fb.array<FormGroup<SupplierContactForm>>([]);

  commercialForm = this.fb.group<SupplierCommercialForm>({
    numeroCuenta: this.fb.control('', [Validators.maxLength(50)]),
    banco: this.fb.control('', [Validators.maxLength(100)]),
    productos: this.fb.control('', [Validators.maxLength(1000)]),
    observaciones: this.fb.control('', [Validators.maxLength(1000)])
  });

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.supplierId.set(id);
      this.loadSupplier(id);
    }
  }

  goToStep(index: number): void {
    if (!this.isEditMode()) {
      return;
    }
    this.clearSectionMessages();
    this.currentStep.set(index);
  }

  nextStep(): void {
    if (this.currentStep() === 0 && this.generalForm.invalid) {
      this.generalForm.markAllAsTouched();
      return;
    }
    if (!this.isLastStep()) {
      this.clearSectionMessages();
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (!this.isFirstStep()) {
      this.clearSectionMessages();
      this.currentStep.update(s => s - 1);
    }
  }

  addContact(): void {
    this.contactsForm.push(this.createContactGroup());
    this.contactsDirty.set(true);
  }

  removeContact(index: number): void {
    this.contactsForm.removeAt(index);
    this.contactsDirty.set(true);
  }

  markGeneralDirty(): void {
    this.generalDirty.set(true);
  }

  markContactsDirty(): void {
    this.contactsDirty.set(true);
  }

  markCommercialDirty(): void {
    this.commercialDirty.set(true);
  }

  saveAndFinish(): void {
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.generalForm.invalid) {
      this.currentStep.set(0);
      this.generalForm.markAllAsTouched();
      return;
    }
    this.persistSupplier();
  }

  /** Save only the current section in edit mode */
  saveSection(): void {
    const step = this.currentStep();
    this.clearSectionMessages();

    if (step === 0) {
      this.saveGeneralSection();
    } else if (step === 1) {
      this.saveContactsSection();
    } else if (step === 2) {
      this.saveCommercialSection();
    }
  }

  isSectionSaving(sectionId: string): boolean {
    return this.sectionSaving()[sectionId] === true;
  }

  goBack(): void {
    this.location.back();
  }

  canDeactivate(): boolean {
    if (!this.isEditMode() || !this.hasUnsavedChanges()) {
      return true;
    }
    return confirm('Hay cambios sin guardar. ¿Desea salir sin guardar?');
  }

  private saveGeneralSection(): void {
    if (this.generalForm.invalid) {
      this.generalForm.markAllAsTouched();
      return;
    }

    this.setSectionSaving('general', true);
    const general = this.generalForm.getRawValue();
    const commercial = this.commercialForm.getRawValue();

    this.supplierService.updateSupplier(this.supplierId(), {
      nombre: general.nombre,
      ruc: general.ruc || null,
      telefono: general.telefono || null,
      direccion: general.direccion || null,
      distrito: general.distrito || null,
      ciudad: general.ciudad || null,
      correo: general.correo || null,
      paginaWeb: general.paginaWeb || null,
      numeroCuenta: commercial.numeroCuenta || null,
      banco: commercial.banco || null,
      productos: commercial.productos || null,
      observaciones: commercial.observaciones || null,
      isActive: true,
      contacts: null
    }).subscribe({
      next: () => {
        this.setSectionSaving('general', false);
        this.generalDirty.set(false);
        this.setSectionSuccess('general', 'Datos del proveedor guardados exitosamente.');
      },
      error: (err) => {
        this.setSectionSaving('general', false);
        this.setSectionError('general', err?.error?.detail ?? 'Error al guardar los datos del proveedor.');
      }
    });
  }

  private saveContactsSection(): void {
    const invalidContact = this.contactsForm.controls.find(c => c.invalid);
    if (invalidContact) {
      invalidContact.markAllAsTouched();
      return;
    }

    this.setSectionSaving('contacts', true);
    const contacts = this.contactsForm.getRawValue();

    this.supplierService.updateSupplierContacts(this.supplierId(), {
      contacts: contacts.map(c => ({
        nombre: c.nombre,
        cargo: c.cargo || null,
        telefono: c.telefono || null,
        correo: c.correo || null
      }))
    }).subscribe({
      next: () => {
        this.setSectionSaving('contacts', false);
        this.contactsDirty.set(false);
        this.setSectionSuccess('contacts', 'Contactos guardados exitosamente.');
      },
      error: (err) => {
        this.setSectionSaving('contacts', false);
        this.setSectionError('contacts', err?.error?.detail ?? 'Error al guardar los contactos.');
      }
    });
  }

  private saveCommercialSection(): void {
    this.setSectionSaving('commercial', true);
    const general = this.generalForm.getRawValue();
    const commercial = this.commercialForm.getRawValue();

    this.supplierService.updateSupplier(this.supplierId(), {
      nombre: general.nombre,
      ruc: general.ruc || null,
      telefono: general.telefono || null,
      direccion: general.direccion || null,
      distrito: general.distrito || null,
      ciudad: general.ciudad || null,
      correo: general.correo || null,
      paginaWeb: general.paginaWeb || null,
      numeroCuenta: commercial.numeroCuenta || null,
      banco: commercial.banco || null,
      productos: commercial.productos || null,
      observaciones: commercial.observaciones || null,
      isActive: true,
      contacts: null
    }).subscribe({
      next: () => {
        this.setSectionSaving('commercial', false);
        this.commercialDirty.set(false);
        this.setSectionSuccess('commercial', 'Información comercial guardada exitosamente.');
      },
      error: (err) => {
        this.setSectionSaving('commercial', false);
        this.setSectionError('commercial', err?.error?.detail ?? 'Error al guardar la información comercial.');
      }
    });
  }

  private persistSupplier(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    if (this.isEditMode()) {
      this.updateSupplier();
    } else {
      this.createSupplier();
    }
  }

  private createSupplier(): void {
    const general = this.generalForm.getRawValue();
    const contacts = this.contactsForm.getRawValue();
    const commercial = this.commercialForm.getRawValue();

    this.supplierService.createSupplier({
      nombre: general.nombre,
      ruc: general.ruc || null,
      telefono: general.telefono || null,
      direccion: general.direccion || null,
      distrito: general.distrito || null,
      ciudad: general.ciudad || null,
      correo: general.correo || null,
      paginaWeb: general.paginaWeb || null,
      numeroCuenta: commercial.numeroCuenta || null,
      banco: commercial.banco || null,
      productos: commercial.productos || null,
      observaciones: commercial.observaciones || null,
      contacts: contacts.length > 0
        ? contacts.map(c => ({
            nombre: c.nombre,
            cargo: c.cargo || null,
            telefono: c.telefono || null,
            correo: c.correo || null
          }))
        : null
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.detail ?? 'Error al crear el proveedor.');
      }
    });
  }

  private updateSupplier(): void {
    const general = this.generalForm.getRawValue();
    const contacts = this.contactsForm.getRawValue();
    const commercial = this.commercialForm.getRawValue();

    this.supplierService.updateSupplier(this.supplierId(), {
      nombre: general.nombre,
      ruc: general.ruc || null,
      telefono: general.telefono || null,
      direccion: general.direccion || null,
      distrito: general.distrito || null,
      ciudad: general.ciudad || null,
      correo: general.correo || null,
      paginaWeb: general.paginaWeb || null,
      numeroCuenta: commercial.numeroCuenta || null,
      banco: commercial.banco || null,
      productos: commercial.productos || null,
      observaciones: commercial.observaciones || null,
      isActive: true,
      contacts: contacts.map(c => ({
        nombre: c.nombre,
        cargo: c.cargo || null,
        telefono: c.telefono || null,
        correo: c.correo || null
      }))
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.generalDirty.set(false);
        this.contactsDirty.set(false);
        this.commercialDirty.set(false);
        this.router.navigate(['../../'], { relativeTo: this.route });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.detail ?? 'Error al actualizar el proveedor.');
      }
    });
  }

  private loadSupplier(id: string): void {
    this.loading.set(true);
    this.supplierService.getSupplierById(id).subscribe({
      next: (supplier) => {
        this.generalForm.patchValue({
          nombre: supplier.nombre,
          ruc: supplier.ruc ?? '',
          telefono: supplier.telefono ?? '',
          direccion: supplier.direccion ?? '',
          distrito: supplier.distrito ?? '',
          ciudad: supplier.ciudad ?? '',
          correo: supplier.correo ?? '',
          paginaWeb: supplier.paginaWeb ?? ''
        });

        this.commercialForm.patchValue({
          numeroCuenta: supplier.numeroCuenta ?? '',
          banco: supplier.banco ?? '',
          productos: supplier.productos ?? '',
          observaciones: supplier.observaciones ?? ''
        });

        this.contactsForm.clear();
        for (const contact of supplier.contacts) {
          const group = this.createContactGroup();
          group.patchValue({
            nombre: contact.nombre,
            cargo: contact.cargo ?? '',
            telefono: contact.telefono ?? '',
            correo: contact.correo ?? ''
          });
          this.contactsForm.push(group);
        }

        // Reset dirty state after loading
        this.generalDirty.set(false);
        this.contactsDirty.set(false);
        this.commercialDirty.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar el proveedor.');
        this.loading.set(false);
      }
    });
  }

  private createContactGroup(): FormGroup<SupplierContactForm> {
    return this.fb.group<SupplierContactForm>({
      nombre: this.fb.control('', [Validators.required, Validators.maxLength(200)]),
      cargo: this.fb.control('', [Validators.maxLength(100)]),
      telefono: this.fb.control('', [Validators.maxLength(19)]),
      correo: this.fb.control('', [Validators.email])
    });
  }

  private setSectionSaving(section: string, value: boolean): void {
    this.sectionSaving.update(s => ({ ...s, [section]: value }));
  }

  private setSectionSuccess(section: string, message: string): void {
    this.sectionSuccess.update(s => ({ ...s, [section]: message }));
    this.sectionError.update(s => ({ ...s, [section]: '' }));
  }

  private setSectionError(section: string, message: string): void {
    this.sectionError.update(s => ({ ...s, [section]: message }));
    this.sectionSuccess.update(s => ({ ...s, [section]: '' }));
  }

  private clearSectionMessages(): void {
    this.sectionSuccess.set({});
    this.sectionError.set({});
  }
}
