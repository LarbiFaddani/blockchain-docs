import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { AuthService } from '../../../auth/services/auth.service';
import { EcoleApiService } from '../../services/ecole-api.service';
import { FiliereApiService } from '../../services/filiere-api.service';

import { Filiere, EcoleDetails, StatutAccreditation } from '../../models/ecole.models';

@Component({
  selector: 'app-ecole-filieres',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './ecole-filieres.component.html',
  styleUrls: ['./ecole-filieres.component.css']
})
export class EcoleFilieresComponent implements OnInit {
  ecoleId!: number;
  ecole?: EcoleDetails;

  filieres: Filiere[] = [];

  loading = false;
  errorMessage = '';
  successMessage = '';

  showModal = false;
  editMode = false;
  selected?: Filiere;

  form!: FormGroup;

  statutOptions: StatutAccreditation[] = ['En_Cours', 'RENOUVLEE', 'EXPIREE', 'ACCREDITE'];

  constructor(
    private auth: AuthService,
    private ecoleApi: EcoleApiService,
    private filiereApi: FiliereApiService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(2)]],
      nomResponsableFiliere: [''],
      description: [''],
      accreditation: [''],
      statutAccreditation: [''],
      dateDebutAccreditation: [''],
      dateFinAccreditation: ['']
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
        this.loadFilieres();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Impossible de charger l’école';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadFilieres(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.filiereApi.getFilieresByEcoleId(this.ecoleId).subscribe({
      next: (data) => {
        this.filieres = data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Erreur chargement filières';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ✅ IMPORTANT : fonctions SAFE pour template (PAS de "as any" dans le HTML)
  safeText(v: any, fallback = '-'): string {
    if (v === null || v === undefined || String(v).trim() === '') return fallback;
    return String(v);
  }

  safeDate(v: any, fallback = '-'): string {
    if (!v) return fallback;
    const s = String(v);
    return s.length >= 10 ? s.substring(0, 10) : s;
  }

  getDebut(f: Filiere): string {
    return this.safeDate((f as any)?.dateDebutAccreditation ?? f.dateDebutAccreditation);
  }

  getFin(f: Filiere): string {
    return this.safeDate((f as any)?.dateFinAccreditation ?? f.dateFinAccreditation);
  }

  getAccreditation(f: Filiere): string {
    return this.safeText((f as any)?.accreditation ?? f.accreditation);
  }

  getStatut(f: Filiere): string {
    return this.safeText((f as any)?.statutAccreditation ?? f.statutAccreditation);
  }

  openCreate(): void {
    this.editMode = false;
    this.selected = undefined;
    this.form.reset({
      nom: '',
      code: '',
      nomResponsableFiliere: '',
      description: '',
      accreditation: '',
      statutAccreditation: '',
      dateDebutAccreditation: '',
      dateFinAccreditation: ''
    });
    this.showModal = true;
  }

  openEdit(f: Filiere): void {
    this.editMode = true;
    this.selected = f;

    this.form.patchValue({
      nom: f.nom ?? '',
      code: f.code ?? '',
      nomResponsableFiliere: (f as any)?.nomResponsableFiliere ?? f.nomResponsableFiliere ?? '',
      description: (f as any)?.description ?? f.description ?? '',
      accreditation: (f as any)?.accreditation ?? f.accreditation ?? '',
      statutAccreditation: (f as any)?.statutAccreditation ?? f.statutAccreditation ?? '',
      dateDebutAccreditation: (f as any)?.dateDebutAccreditation ?? f.dateDebutAccreditation ?? '',
      dateFinAccreditation: (f as any)?.dateFinAccreditation ?? f.dateFinAccreditation ?? ''
    });

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.form.reset();
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: any = {
      ...this.form.value,
      ecoleId: this.ecoleId
    };

    this.loading = true;

    if (!this.editMode) {
      this.filiereApi.createFiliere(payload).subscribe({
        next: () => {
          this.successMessage = 'Filière créée avec succès';
          this.closeModal();
          this.loadFilieres();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Erreur création filière';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      const id = this.selected?.id;
      if (!id) {
        this.errorMessage = 'ID filière manquant';
        this.loading = false;
        return;
      }

      this.filiereApi.updateFiliere(id, payload).subscribe({
        next: () => {
          this.successMessage = 'Filière mise à jour';
          this.closeModal();
          this.loadFilieres();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Erreur mise à jour filière';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteFiliere(f: Filiere): void {
    const id = f?.id;
    if (!id) return;

    if (!confirm('Supprimer cette filière ?')) return;

    this.filiereApi.deleteFiliere(id).subscribe({
      next: () => {
        this.successMessage = 'Filière supprimée';
        this.loadFilieres();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Erreur suppression filière';
        this.cdr.detectChanges();
      }
    });
  }

  trackById = (_: number, f: Filiere) => f.id;
}
