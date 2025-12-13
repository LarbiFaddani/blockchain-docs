import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { AuthService } from '../../../auth/services/auth.service';
import { EcoleApiService } from '../../services/ecole-api.service';
import { EcoleDetails, UpdateEcolePayload } from '../../models/ecole.models';

@Component({
  selector: 'app-ecole-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ecole-profile.component.html',
  styleUrls: ['./ecole-profile.component.css']
})
export class EcoleProfileComponent implements OnInit {
  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  ecole?: EcoleDetails;
  ecoleId!: number;

  // ✅ IMPORTANT : le form est initialisé dans ngOnInit
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private ecoleApi: EcoleApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // ✅ initialisation ici => plus d’erreur TS2729
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      city: [''],
      address: [''],
      emailContact: ['', [Validators.email]],
      numeroAutorisation: [''],
      typeEcole: ['PRIVEE'],
      anneeCreation: [null],
      nombreEtudiants: [null]
    });

    const userId = this.auth.getUserId();
    if (!userId) {
      this.errorMessage = 'Utilisateur non connecté';
      return;
    }

    this.loading = true;

    this.ecoleApi.getEcoleByAdmin(userId).subscribe({
      next: (ecole) => {
        this.ecole = ecole;
        this.ecoleId = ecole.id;

        this.form.patchValue({
          name: ecole.name ?? '',
          city: ecole.city ?? '',
          address: ecole.address ?? '',
          emailContact: ecole.emailContact ?? '',
          numeroAutorisation: (ecole as any)?.numeroAutorisation ?? '',
          typeEcole: (ecole as any)?.typeEcole ?? 'PRIVEE',
          anneeCreation: (ecole as any)?.anneeCreation ?? null,
          nombreEtudiants: (ecole as any)?.nombreEtudiants ?? null
        });

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Impossible de charger le profil.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ✅ Méthode SAFE pour l’affichage (PAS de logique dans le HTML)
  getAnneeCreation(): string {
    const value =
      (this.ecole as any)?.anneeCreation ??
      this.ecole?.anneeCreation;

    return value ? String(value) : '—';
  }

  save(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: UpdateEcolePayload = {
      ...this.form.value
    } as any;

    this.saving = true;

    this.ecoleApi.updateEcole(this.ecoleId, payload).subscribe({
      next: (updated) => {
        this.ecole = updated;
        this.successMessage = 'Profil mis à jour avec succès.';
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Erreur lors de la mise à jour.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
