import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { EtudiantDocumentService } from '../../services/etudiant-api.service';
import { AdminApiService } from '../../../admin/services/admin-api.service';
import { StudentResponse } from '../../models/etudiant.models';

@Component({
  selector: 'app-etudiant-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './etudiant-profile.component.html',
  styleUrls: ['./etudiant-profil.component.css']
})
export class EtudiantProfileComponent implements OnInit {

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  student: StudentResponse | null = null;
  userId!: number;

  form!: FormGroup;

  showOld = false;
  showNew = false;
  showConfirm = false;

  constructor(
    private etuApi: EtudiantDocumentService,
    private authApi: AdminApiService,
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
      { validators: this.passwordsMatch }
    );

    const raw = localStorage.getItem('docs_user_id');
    const id = Number(raw);

    if (!Number.isFinite(id) || id <= 0) {
      this.errorMessage = 'Utilisateur non connecté';
      return;
    }

    this.userId = id;
    this.loadStudent();
  }

  // ================= LOAD STUDENT =================
  loadStudent(): void {
    this.loading = true;
    this.errorMessage = '';

    this.etuApi.getStudentByUserId(this.userId).subscribe({
      next: (res) => {
        this.student = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ================= CHANGE PASSWORD =================
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      currentPassword: this.form.value.currentPassword,
      newPassword: this.form.value.newPassword
    };

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authApi.changePassword(this.userId, payload).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Mot de passe modifié avec succès.';
        this.form.reset();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage =
          typeof err.error === 'string'
            ? err.error
            : err?.error?.message || 'Erreur changement mot de passe';
        this.cdr.detectChanges();
      }
    });
  }

  // ================= HELPERS =================
  get fullName(): string {
    if (!this.student) return '—';
    return `${this.student.firstName} ${this.student.lastName}`;
  }

  private passwordsMatch(group: FormGroup) {
    const a = group.get('newPassword')?.value;
    const b = group.get('confirmPassword')?.value;
    return a === b ? null : { passwordsNotMatch: true };
  }
}
