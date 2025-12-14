import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { AuthService } from '../../../auth/services/auth.service';
import { EcoleApiService } from '../../services/ecole-api.service';
import { EcoleDetails, UpdateEcolePayload } from '../../models/ecole.models';
import { HttpClient } from '@angular/common/http';

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
  savingPwd = false;

  errorMessage = '';
  successMessage = '';

  ecole?: EcoleDetails;
  ecoleId!: number;

  // userId de l'admin école (pour changer le mot de passe)
  userId!: number;

  // ✅ forms
  form!: FormGroup;
  pwdForm!: FormGroup;

  // show/hide
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  // API gateway/base (si tu n'as pas un service dédié auth)
  private readonly API = 'http://localhost:8080';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private ecoleApi: EcoleApiService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // ------------------ Profil École ------------------
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

    // ------------------ Mot de passe ------------------
    this.pwdForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required, Validators.minLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
      },
      { validators: [this.passwordsMatchValidator] }
    );

    const uid = this.auth.getUserId();
    if (!uid) {
      this.errorMessage = 'Utilisateur non connecté';
      this.cdr.detectChanges();
      return;
    }
    this.userId = uid;

    this.loadProfile();
  }

  // ------------------ LOAD PROFILE ------------------
  loadProfile(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.ecoleApi.getEcoleByAdmin(this.userId).subscribe({
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

  // ------------------ SAVE PROFILE ------------------
  save(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: UpdateEcolePayload = { ...this.form.value } as any;

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

  // ------------------ CHANGE PASSWORD ------------------
  changePassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.pwdForm.invalid) {
      this.pwdForm.markAllAsTouched();
      return;
    }

    const v = this.pwdForm.value;

    // backend attendu : currentPassword / newPassword
    const payload = {
      currentPassword: v.currentPassword,
      newPassword: v.newPassword
    };

    this.savingPwd = true;

    this.http
      .put(`${this.API}/auth/users/${this.userId}/password`, payload, { responseType: 'text' })
      .subscribe({
        next: (msg) => {
          this.savingPwd = false;
          this.successMessage = msg || 'Mot de passe modifié avec succès.';
          this.pwdForm.reset();
          this.showCurrent = false;
          this.showNew = false;
          this.showConfirm = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.savingPwd = false;
          // si backend renvoie {message:"..."} ou du texte
          this.errorMessage =
            err?.error?.message ||
            (typeof err?.error === 'string' ? err.error : null) ||
            'Erreur changement mot de passe.';
          this.cdr.detectChanges();
        }
      });
  }

  resetPwdForm(): void {
    this.pwdForm.reset();
    this.showCurrent = false;
    this.showNew = false;
    this.showConfirm = false;
  }

  // ------------------ Helpers ------------------
  safe(v: any, fb = '—'): string {
    if (v === null || v === undefined || String(v).trim() === '') return fb;
    return String(v);
  }

  getAnneeCreation(): string {
    const value = (this.ecole as any)?.anneeCreation ?? this.ecole?.anneeCreation;
    return value ? String(value) : '—';
  }

  // validator confirm
  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const a = control.get('newPassword')?.value;
    const b = control.get('confirmPassword')?.value;
    if (!a || !b) return null;
    return a === b ? null : { passwordsNotMatch: true };
  }
}
