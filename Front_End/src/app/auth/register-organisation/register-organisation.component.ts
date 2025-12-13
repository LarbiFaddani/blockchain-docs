// src/app/auth/register-organisation/register-organisation.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import {
  OrganisationApiService,
  OrgType,
  RegisterOrganisationRequest,
  RegisterOrganisationResponse
} from '../services/organisation-api.service';

@Component({
  selector: 'app-register-organisation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './register-organisation.component.html',
  styleUrls: ['./register-organisation.component.css']
})
export class RegisterOrganisationComponent implements OnInit {

  form!: FormGroup;
  loading = false;

  success?: RegisterOrganisationResponse | null;
  successMessage = '';
  errorMessage = '';

  hideAdminPassword = true;
  currentStep = 1;

  orgTypes = [
    { value: 'ECOLE' as OrgType, label: 'Établissement d’enseignement' },
    { value: 'ENTREPRISE' as OrgType, label: 'Entreprise / Organisation' }
  ];

  typeEcoleOptions = [
    { value: 'PUBLIC', label: 'Public' },
    { value: 'SEMI_PUBLIC', label: 'Semi public' },
    { value: 'PRIVEE', label: 'Privée' }
  ];

  constructor(
    private fb: FormBuilder,
    private orgService: OrganisationApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      orgType: ['ECOLE', Validators.required],

      name: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      emailContact: ['', [Validators.required, Validators.email]],

      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: ['', [Validators.required, Validators.minLength(6)]],

      numeroAutorisation: [''],
      typeEcole: [''],
      anneeCreation: [''],
      nombreEtudiants: [''],

      ice: [''],
      secteurActivite: [''],
      statutJuridique: [''],
    });

    // On écoute uniquement le changement de valeur de orgType
    this.form.get('orgType')!.valueChanges.subscribe((type: OrgType | string) => {
      this.updateValidatorsForType(type as OrgType);
    });

    // Initialisation
    this.updateValidatorsForType(this.form.get('orgType')!.value as OrgType);
  }

  // ---------- Stepper ----------
  goToStep(step: number): void {
    this.currentStep = step;
  }

  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // ---------- Validators dynamiques ----------
  private updateValidatorsForType(type: OrgType): void {
    const numeroAutorisation = this.form.get('numeroAutorisation')!;
    const typeEcole = this.form.get('typeEcole')!;
    const anneeCreation = this.form.get('anneeCreation')!;
    const nombreEtudiants = this.form.get('nombreEtudiants')!;

    const ice = this.form.get('ice')!;
    const secteurActivite = this.form.get('secteurActivite')!;
    const statutJuridique = this.form.get('statutJuridique')!;

    if (type === 'ECOLE') {
      numeroAutorisation.setValidators([Validators.required]);
      typeEcole.setValidators([Validators.required]);
      anneeCreation.clearValidators();
      nombreEtudiants.clearValidators();

      ice.clearValidators();
      secteurActivite.clearValidators();
      statutJuridique.clearValidators();
    } else {
      ice.setValidators([Validators.required]);
      secteurActivite.setValidators([Validators.required]);
      statutJuridique.clearValidators();

      numeroAutorisation.clearValidators();
      typeEcole.clearValidators();
      anneeCreation.clearValidators();
      nombreEtudiants.clearValidators();
    }

    // IMPORTANT : pas d’emitEvent pour éviter la boucle infinie
    numeroAutorisation.updateValueAndValidity({ emitEvent: false });
    typeEcole.updateValueAndValidity({ emitEvent: false });
    anneeCreation.updateValueAndValidity({ emitEvent: false });
    nombreEtudiants.updateValueAndValidity({ emitEvent: false });
    ice.updateValueAndValidity({ emitEvent: false });
    secteurActivite.updateValueAndValidity({ emitEvent: false });
    statutJuridique.updateValueAndValidity({ emitEvent: false });
  }

  get orgType(): OrgType {
    return this.form.get('orgType')!.value as OrgType;
  }

  // ---------- Submit ----------
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.success = null;
    this.successMessage = '';

    const v = this.form.value;
    const isEcole = v.orgType === 'ECOLE';

    const payload: RegisterOrganisationRequest = {
      orgType: v.orgType as OrgType,
      name: v.name,
      address: v.address,
      city: v.city,
      emailContact: v.emailContact,

      adminEmail: v.adminEmail,
      adminPassword: v.adminPassword,
      adminRole: isEcole ? 'ECOLE_ADMIN' : 'ENTREPRISE_ADMIN',

      // ECOLE
      numeroAutorisation: v.numeroAutorisation || null,
      typeEcole: v.typeEcole || null,
      anneeCreation: v.anneeCreation ? this.formatDate(v.anneeCreation) : null,
      nombreEtudiants: v.nombreEtudiants ? Number(v.nombreEtudiants) : 0,

      // ENTREPRISE
      ice: v.ice || null,
      secteurActivite: v.secteurActivite || null,
      statutJuridique: v.statutJuridique || null
    };

    this.orgService.registerOrganisation(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = res;
        this.successMessage = `Organisation "${res.name}" créée avec succès. Vous pouvez maintenant vous connecter.`;

        // redirection vers login après un petit délai
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Erreur register org:', err);
        this.errorMessage =
          err?.error?.message ??
          `Erreur serveur (${err.status || 'inconnu'}) lors de la création de l’organisation.`;
      }
    });
  }

  private formatDate(date: any): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
