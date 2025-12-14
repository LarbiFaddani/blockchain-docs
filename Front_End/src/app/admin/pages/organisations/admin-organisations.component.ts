import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { AdminApiService } from '../../services/admin-api.service';
import {
  Ecole,
  Entreprise,
  OrgType,
  RegisterOrganisationRequest
} from '../../models/admin.models';

@Component({
  selector: 'app-admin-organisations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-organisations.component.html',
  styleUrls: ['./admin-organisations.component.css']
})
export class AdminOrganisationsComponent implements OnInit {
  loading = false;
  errorMessage = '';
  successMessage = '';

  tab: OrgType = 'ECOLE';

  ecoles: Ecole[] = [];
  entreprises: Entreprise[] = [];

  showModal = false;
  form!: FormGroup;

  // ---- TypeEcole options
  typeEcoleOptions = ['PUBLIC', 'SEMI_PUBLIC', 'PRIVEE'] as const;

  // ---- Pagination
  pageSize = 6;

  ecolesPage = 1;
  entreprisesPage = 1;

  constructor(
    private api: AdminApiService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      orgType: ['ECOLE', Validators.required],

      // common org
      name: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(3)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      emailContact: ['', [Validators.required, Validators.email]],

      // admin user
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: ['', [Validators.required, Validators.minLength(6)]],
      adminRole: ['ECOLE_ADMIN', Validators.required],

      // ecole specific
      numeroAutorisation: [''],
      typeEcole: [''],
      anneeCreation: [''],
      nombreEtudiants: [''],

      // entreprise specific
      ice: [''],
      secteurActivite: [''],
      statutJuridique: ['']
    });

    this.loadAll();
    this.bindOrgTypeRules();
  }

  // ------------------ LOAD ------------------
  loadAll(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.getAllEcoles().subscribe({
      next: (data) => {
        this.ecoles = data ?? [];

        this.api.getAllEntreprises().subscribe({
          next: (d2) => {
            this.entreprises = d2 ?? [];
            this.loading = false;

            // reset pagination after load
            this.ecolesPage = 1;
            this.entreprisesPage = 1;

            this.cdr.detectChanges();
          },
          error: (err) => {
            this.loading = false;
            this.errorMessage = err?.error?.message || 'Erreur chargement entreprises.';
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Erreur chargement écoles.';
        this.cdr.detectChanges();
      }
    });
  }

  // ------------------ UI ------------------
  setTab(t: OrgType): void {
    this.tab = t;
    // reset current tab pagination
    if (t === 'ECOLE') this.ecolesPage = 1;
    if (t === 'ENTREPRISE') this.entreprisesPage = 1;
  }

  openCreate(type: OrgType): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.form.reset({
      orgType: type,

      name: '',
      address: '',
      city: '',
      emailContact: '',

      adminEmail: '',
      adminPassword: '',
      adminRole: type === 'ECOLE' ? 'ECOLE_ADMIN' : 'ENTREPRISE_ADMIN',

      numeroAutorisation: '',
      typeEcole: '',
      anneeCreation: '',
      nombreEtudiants: '',

      ice: '',
      secteurActivite: '',
      statutJuridique: ''
    });

    this.showModal = true;
    this.applyDynamicValidators(type);
  }

  closeModal(): void {
    this.showModal = false;
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  safe(v: any, fb = '—'): string {
    if (v === null || v === undefined || String(v).trim() === '') return fb;
    return String(v);
  }

  // ------------------ CREATE ------------------
  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const type: OrgType = this.form.get('orgType')?.value;

    this.applyDynamicValidators(type);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;

    const payload: RegisterOrganisationRequest = {
      orgType: raw.orgType,

      name: raw.name,
      address: raw.address,
      city: raw.city,
      emailContact: raw.emailContact,

      adminEmail: raw.adminEmail,
      adminPassword: raw.adminPassword,
      adminRole: raw.adminRole,

      // ecole
      numeroAutorisation: raw.orgType === 'ECOLE' ? raw.numeroAutorisation : undefined,
      typeEcole: raw.orgType === 'ECOLE' ? raw.typeEcole : undefined,
      anneeCreation: raw.orgType === 'ECOLE' ? raw.anneeCreation : undefined,
      nombreEtudiants:
        raw.orgType === 'ECOLE' && raw.nombreEtudiants !== '' ? Number(raw.nombreEtudiants) : undefined,

      // entreprise
      ice: raw.orgType === 'ENTREPRISE' ? raw.ice : undefined,
      secteurActivite: raw.orgType === 'ENTREPRISE' ? raw.secteurActivite : undefined,
      statutJuridique: raw.orgType === 'ENTREPRISE' ? raw.statutJuridique : undefined
    };

    this.loading = true;

    this.api.registerOrganisation(payload).subscribe({
      next: (res) => {
        this.successMessage = `Organisation créée: ${res.name} (admin: ${res.adminEmail})`;
        this.closeModal();
        this.loadAll();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Erreur création organisation.';
        this.cdr.detectChanges();
      }
    });
  }

  // ------------------ Dynamic validators ------------------
  private bindOrgTypeRules(): void {
    this.form.get('orgType')?.valueChanges.subscribe((t: OrgType) => {
      this.form.patchValue({
        adminRole: t === 'ECOLE' ? 'ECOLE_ADMIN' : 'ENTREPRISE_ADMIN'
      });
      this.applyDynamicValidators(t);
    });
  }

  private applyDynamicValidators(type: OrgType): void {
    const numeroAutorisation = this.form.get('numeroAutorisation');
    const typeEcole = this.form.get('typeEcole');

    const ice = this.form.get('ice');
    const secteurActivite = this.form.get('secteurActivite');

    // reset
    numeroAutorisation?.clearValidators();
    typeEcole?.clearValidators();
    ice?.clearValidators();
    secteurActivite?.clearValidators();

    if (type === 'ECOLE') {
      numeroAutorisation?.setValidators([Validators.required, Validators.minLength(2)]);
      typeEcole?.setValidators([Validators.required]);
    } else {
      ice?.setValidators([Validators.required, Validators.minLength(3)]);
      secteurActivite?.setValidators([Validators.required]);
    }

    numeroAutorisation?.updateValueAndValidity({ emitEvent: false });
    typeEcole?.updateValueAndValidity({ emitEvent: false });
    ice?.updateValueAndValidity({ emitEvent: false });
    secteurActivite?.updateValueAndValidity({ emitEvent: false });
  }

  isEcole(): boolean {
    return (this.form.get('orgType')?.value as OrgType) === 'ECOLE';
  }

  // ------------------ Pagination ECOLES ------------------
  get ecolesTotalPages(): number {
    return Math.max(1, Math.ceil((this.ecoles?.length || 0) / this.pageSize));
  }

  get pagedEcoles(): Ecole[] {
    const start = (this.ecolesPage - 1) * this.pageSize;
    return (this.ecoles || []).slice(start, start + this.pageSize);
  }

  nextEcolesPage(): void {
    this.ecolesPage = Math.min(this.ecolesPage + 1, this.ecolesTotalPages);
  }

  prevEcolesPage(): void {
    this.ecolesPage = Math.max(this.ecolesPage - 1, 1);
  }

  // ------------------ Pagination ENTREPRISES ------------------
  get entreprisesTotalPages(): number {
    return Math.max(1, Math.ceil((this.entreprises?.length || 0) / this.pageSize));
  }

  get pagedEntreprises(): Entreprise[] {
    const start = (this.entreprisesPage - 1) * this.pageSize;
    return (this.entreprises || []).slice(start, start + this.pageSize);
  }

  nextEntreprisesPage(): void {
    this.entreprisesPage = Math.min(this.entreprisesPage + 1, this.entreprisesTotalPages);
  }

  prevEntreprisesPage(): void {
    this.entreprisesPage = Math.max(this.entreprisesPage - 1, 1);
  }
}
