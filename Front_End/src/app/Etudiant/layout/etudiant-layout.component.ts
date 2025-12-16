import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { VerifyApiService } from '../../entreprise/services/verify-api.service'; 
import { StudentResponse } from '../models/etudiant.models';

@Component({
  selector: 'app-etudiant-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './etudiant-layout.component.html',
  styleUrls: ['./etudiant-layout.component.css']
})
export class EtudiantLayoutComponent implements OnInit {

  loading = false;
  errorMessage = '';

  student: StudentResponse | null = null;
  userId: number | null = null;

  constructor(
    private verifyApi: VerifyApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  get studentName(): string {
    if (!this.student) return 'Docs-Blockchain';
    const fn = this.student.firstName || '';
    const ln = this.student.lastName || '';
    const name = `${fn} ${ln}`.trim();
    return name || 'Étudiant';
  }

  get studentEmail(): string {
    return this.student?.personalEmail || '—';
  }

  ngOnInit(): void {
    this.bootstrapUser();
  }

  private bootstrapUser(): void {
    const raw = localStorage.getItem('docs_user_id');
    const id = Number(raw);
    this.userId = Number.isFinite(id) && id > 0 ? id : null;

    if (!this.userId) {
      this.errorMessage = "docs_user_id introuvable dans localStorage. Stocke-le après login.";
      this.cdr.detectChanges();
      return;
    }

    this.loadStudent();
  }

  private loadStudent(): void {
    if (!this.userId) return;

    this.loading = true;
    this.errorMessage = '';

    this.verifyApi.getStudentByUserIid(this.userId).subscribe({
      next: (stu: any) => {
        this.student = stu;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.student = null;
        this.loading = false;
        this.errorMessage = err?.message || err?.error?.message || 'Impossible de charger les informations de l’étudiant.';
        this.cdr.detectChanges();
      }
    });
  }

  goProfile(): void {
    this.router.navigate(['/etudiant/profile']);
  }

  logout(): void {
    localStorage.removeItem('docs_user_id');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/auth/login']);
  }
}
