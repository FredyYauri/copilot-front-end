import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, NonNullableFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientService } from '../../services/client.service';

type TabId = 'general' | 'contacts' | 'commercial';

interface ClientGeneralForm {
  nombre: FormControl<string>;
  ruc: FormControl<string>;
  dni: FormControl<string>;
  direccion: FormControl<string>;
  distrito: FormControl<string>;
  referencia: FormControl<string>;
  telefono: FormControl<string>;
}

interface ClientContactForm {
  nombre: FormControl<string>;
  cargo: FormControl<string>;
  telefono: FormControl<string>;
  correo: FormControl<string>;
  comentarios: FormControl<string>;
}

interface ClientCommercialForm {
  asesorComercial: FormControl<string>;
  codigoAsesor: FormControl<string>;
  medioCaptacion: FormControl<string>;
  centralRiesgo: FormControl<string>;
  lineaCredito: FormControl<string>;
  comentarios: FormControl<string>;
}

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss'
})
export class ClientFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly clientService = inject(ClientService);

  readonly isEditMode = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly clientId = signal('');
  readonly activeTab = signal<TabId>('general');

  readonly tabs: { id: TabId; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'contacts', label: 'Contactos' },
    { id: 'commercial', label: 'Info Comercial' }
  ];

  generalForm = this.fb.group<ClientGeneralForm>({
    nombre: this.fb.control('', [Validators.required, Validators.maxLength(200)]),
    ruc: this.fb.control('', [Validators.pattern(/^\d{11}$/)]),
    dni: this.fb.control('', [Validators.pattern(/^\d{8}$/)]),
    direccion: this.fb.control('', [Validators.required, Validators.maxLength(500)]),
    distrito: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
    referencia: this.fb.control('', [Validators.maxLength(500)]),
    telefono: this.fb.control('', [Validators.required, Validators.maxLength(19)])
  });

  contactsForm = this.fb.array<FormGroup<ClientContactForm>>([]);

  commercialForm = this.fb.group<ClientCommercialForm>({
    asesorComercial: this.fb.control('', [Validators.maxLength(200)]),
    codigoAsesor: this.fb.control('', [Validators.maxLength(50)]),
    medioCaptacion: this.fb.control('', [Validators.maxLength(100)]),
    centralRiesgo: this.fb.control('', [Validators.maxLength(100)]),
    lineaCredito: this.fb.control(''),
    comentarios: this.fb.control('', [Validators.maxLength(500)])
  });

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.clientId.set(id);
      this.loadClient(id);
    }
  }

  setTab(tab: TabId): void {
    this.activeTab.set(tab);
  }

  addContact(): void {
    this.contactsForm.push(this.createContactGroup());
  }

  removeContact(index: number): void {
    this.contactsForm.removeAt(index);
  }

  onSubmit(): void {
    if (this.generalForm.invalid) {
      this.activeTab.set('general');
      this.generalForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    if (this.isEditMode()) {
      this.updateClient();
    } else {
      this.createClient();
    }
  }

  goBack(): void {
    this.location.back();
  }

  private createClient(): void {
    const general = this.generalForm.getRawValue();
    const contacts = this.contactsForm.getRawValue();
    const commercial = this.commercialForm.getRawValue();

    this.clientService.createClient({
      nombre: general.nombre,
      ruc: general.ruc || null,
      dni: general.dni || null,
      direccion: general.direccion,
      distrito: general.distrito,
      referencia: general.referencia || null,
      telefono: general.telefono,
      contacts: contacts.length > 0
        ? contacts.map(c => ({
            nombre: c.nombre,
            cargo: c.cargo || null,
            telefono: c.telefono || null,
            correo: c.correo || null,
            comentarios: c.comentarios || null
          }))
        : null,
      commercialInfo: this.hasCommercialInfo(commercial)
        ? {
            asesorComercial: commercial.asesorComercial || null,
            codigoAsesor: commercial.codigoAsesor || null,
            medioCaptacion: commercial.medioCaptacion || null,
            centralRiesgo: commercial.centralRiesgo || null,
            lineaCredito: commercial.lineaCredito ? Number.parseFloat(commercial.lineaCredito) : null,
            comentarios: commercial.comentarios || null
          }
        : null
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.detail ?? 'Error al crear el cliente.');
      }
    });
  }

  private updateClient(): void {
    const general = this.generalForm.getRawValue();
    const contacts = this.contactsForm.getRawValue();
    const commercial = this.commercialForm.getRawValue();

    this.clientService.updateClient(this.clientId(), {
      nombre: general.nombre,
      ruc: general.ruc || null,
      dni: general.dni || null,
      direccion: general.direccion,
      distrito: general.distrito,
      referencia: general.referencia || null,
      telefono: general.telefono,
      isActive: true,
      contacts: contacts.length > 0
        ? contacts.map(c => ({
            nombre: c.nombre,
            cargo: c.cargo || null,
            telefono: c.telefono || null,
            correo: c.correo || null,
            comentarios: c.comentarios || null
          }))
        : null,
      commercialInfo: this.hasCommercialInfo(commercial)
        ? {
            asesorComercial: commercial.asesorComercial || null,
            codigoAsesor: commercial.codigoAsesor || null,
            medioCaptacion: commercial.medioCaptacion || null,
            centralRiesgo: commercial.centralRiesgo || null,
            lineaCredito: commercial.lineaCredito ? Number.parseFloat(commercial.lineaCredito) : null,
            comentarios: commercial.comentarios || null
          }
        : null
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['../../'], { relativeTo: this.route });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.detail ?? 'Error al actualizar el cliente.');
      }
    });
  }

  private loadClient(id: string): void {
    this.loading.set(true);
    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.generalForm.patchValue({
          nombre: client.nombre,
          ruc: client.ruc ?? '',
          dni: client.dni ?? '',
          direccion: client.direccion,
          distrito: client.distrito,
          referencia: client.referencia ?? '',
          telefono: client.telefono
        });

        this.contactsForm.clear();
        for (const contact of client.contacts) {
          const group = this.createContactGroup();
          group.patchValue({
            nombre: contact.nombre,
            cargo: contact.cargo ?? '',
            telefono: contact.telefono ?? '',
            correo: contact.correo ?? '',
            comentarios: contact.comentarios ?? ''
          });
          this.contactsForm.push(group);
        }

        if (client.commercialInfo) {
          this.commercialForm.patchValue({
            asesorComercial: client.commercialInfo.asesorComercial ?? '',
            codigoAsesor: client.commercialInfo.codigoAsesor ?? '',
            medioCaptacion: client.commercialInfo.medioCaptacion ?? '',
            centralRiesgo: client.commercialInfo.centralRiesgo ?? '',
            lineaCredito: client.commercialInfo.lineaCredito?.toString() ?? '',
            comentarios: client.commercialInfo.comentarios ?? ''
          });
        }

        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar el cliente.');
        this.loading.set(false);
      }
    });
  }

  private createContactGroup(): FormGroup<ClientContactForm> {
    return this.fb.group<ClientContactForm>({
      nombre: this.fb.control('', [Validators.required, Validators.maxLength(200)]),
      cargo: this.fb.control('', [Validators.maxLength(100)]),
      telefono: this.fb.control('', [Validators.maxLength(19)]),
      correo: this.fb.control('', [Validators.email]),
      comentarios: this.fb.control('', [Validators.maxLength(500)])
    });
  }

  private hasCommercialInfo(info: Record<string, string>): boolean {
    return Object.values(info).some(v => v !== '');
  }
}
