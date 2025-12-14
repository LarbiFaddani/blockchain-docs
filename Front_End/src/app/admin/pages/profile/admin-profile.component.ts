import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { AdminApiService } from '../../services/admin-api.service';

type UserRole = 'ADMIN' | 'ECOLE_ADMIN' | 'ENTREPRISE_ADMIN' | 'ETUDIANT' | string;

interface UserMe {
  id: number;
  email: string;
  role: UserRole;
  enabled: boolean;
}

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css']
})
export class AdminProfileComponent implements OnInit {
  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  me: UserMe | null = null;

  userId: number | null = null;

  form!: FormGroup;
  showOld = false;
  showNew = false;
  showConfirm = false;

  constructor(
    private api: AdminApiService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        currentPassword: ['', [Validators.required, Validators.minLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
      },
      { validators: [this.passwordsMatchValidator] }
    );

    const idStr = localStorage.getItem('docs_user_id');
    const id = Number(idStr);
    this.userId = Number.isFinite(id) && id > 0 ? id : null;

    if (!this.userId) {
      this.errorMessage = "userId introuvable (localStorage). Stocke l'id après login.";
      this.cdr.detectChanges();
      return;
    }

    this.loadMe();
  }

  // ---------------- LOAD PROFILE ----------------
  loadMe(): void {
    if (!this.userId) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.getUserById(this.userId).subscribe({
      next: (data: any) => {
        this.me = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || "Erreur chargement profil.";
        this.cdr.detectChanges();
      }
    });
  }

  // ---------------- CHANGE PASSWORD ----------------
  submit(): void {
    if (!this.userId) return;

    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    // ✅ même structure que Postman
    const payload = {
      currentPassword: v.currentPassword,
      newPassword: v.newPassword
    };

    this.saving = true;

    this.api.changePassword(this.userId, payload).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Mot de passe modifié avec succès.';
        this.form.reset();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        // si backend renvoie du text en erreur, err.error peut être string
        this.errorMessage =
          (typeof err?.error === 'string' ? err.error : err?.error?.message) ||
          'Erreur changement mot de passe.';
        this.cdr.detectChanges();
      }
    });
  }

  // ---------------- UI HELPERS ----------------
  safe(v: any, fb = '—'): string {
    if (v === null || v === undefined || String(v).trim() === '') return fb;
    return String(v);
  }

  badgeLabel(enabled: boolean | undefined): string {
    if (enabled === false) return 'Désactivé';
    return 'Actif';
  }

  // ---------------- VALIDATOR ----------------
  private passwordsMatchValidator(group: FormGroup) {
    const a = group.get('newPassword')?.value;
    const b = group.get('confirmPassword')?.value;
    if (!a || !b) return null;
    return a === b ? null : { passwordsNotMatch: true };
  }
}
