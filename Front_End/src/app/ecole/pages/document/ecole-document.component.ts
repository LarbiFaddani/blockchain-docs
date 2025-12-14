import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DocsApiService, DocumentBlockchainResult } from '../../services/docs-api.service';
import { StudentApiService } from '../../services/student-api.service';

import { Filiere, Student } from '../../models/ecole.models';
import { DocumentModel } from '../../models/ecole.models';

@Component({
  selector: 'app-ecole-document',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ecole-document.component.html',
  styleUrls: ['./ecole-document.component.css']
})
export class EcoleDocumentComponent implements OnInit {
  form!: FormGroup;

  filieres: Filiere[] = [];
  students: Student[] = [];
  studentsFiltered: Student[] = [];

  selectedFile: File | null = null;

  isLoadingFilieres = false;
  isLoadingStudents = false;
  isSubmitting = false;

  successMessage = '';
  errorMessage = '';

  result: DocumentBlockchainResult | null = null;

  // ⚠️ Remplace par ta vraie source si nécessaire
  private ecoleIdFallback = 1;

  constructor(
    private fb: FormBuilder,
    private docsApi: DocsApiService,
    private studentApi: StudentApiService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      filiereId: ['', Validators.required],
      studentId: ['', Validators.required],
      docType: ['', [Validators.required, Validators.minLength(2)]]
    });

    const ecoleId = this.resolveEcoleId();

    // ✅ Load filieres + students (une seule fois)
    this.loadFilieres(ecoleId);
    this.loadStudents(ecoleId);

    // ✅ Filtrer les étudiants quand la filière change
    this.form.get('filiereId')!.valueChanges.subscribe((val) => {
      this.form.get('studentId')!.setValue('');
      this.result = null;
      this.applyStudentFilter(Number(val));
    });
  }

  /* ==============================
   * LOAD DATA
   * ============================== */

  private loadFilieres(ecoleId: number): void {
    this.isLoadingFilieres = true;
    this.errorMessage = '';

    this.docsApi.getFilieresByEcoleId(ecoleId).subscribe({
      next: (data) => {
        this.filieres = (data || []).slice().sort((a, b) =>
          String(a.code || '').localeCompare(String(b.code || ''))
        );
        this.isLoadingFilieres = false;
      },
      error: (err) => {
        this.isLoadingFilieres = false;
        this.errorMessage = this.normalizeHttpError(err, 'Impossible de charger les filières.');
      }
    });
  }

  private loadStudents(ecoleId: number): void {
    this.isLoadingStudents = true;
    this.errorMessage = '';

    this.studentApi.getStudentsByEcoleId(ecoleId).subscribe({
      next: (data) => {
        this.students = data || [];
        // Au départ, pas de filière sélectionnée => liste vide
        this.studentsFiltered = [];
        this.isLoadingStudents = false;

        // Si filière déjà sélectionnée (cas retour navigation)
        const filiereId = Number(this.form.value.filiereId);
        if (filiereId) this.applyStudentFilter(filiereId);
      },
      error: (err) => {
        this.isLoadingStudents = false;
        this.errorMessage = this.normalizeHttpError(err, 'Impossible de charger les étudiants.');
      }
    });
  }

  private applyStudentFilter(filiereId: number): void {
    if (!filiereId) {
      this.studentsFiltered = [];
      return;
    }

    // ⚠️ IMPORTANT : adapte selon ton modèle Student
    // Ici on suppose que Student possède filiereId (ou filiere?.id)
    const filtered = (this.students || []).filter((s: any) => {
      const sid = Number(s?.filiereId ?? s?.filiere?.id);
      return sid === filiereId;
    });

    // Tri : lastName puis firstName
    this.studentsFiltered = filtered.sort((a: any, b: any) => {
      const ln = String(a.lastName || '').localeCompare(String(b.lastName || ''));
      return ln !== 0 ? ln : String(a.firstName || '').localeCompare(String(b.firstName || ''));
    });
  }

  /* ==============================
   * FILE
   * ============================== */

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const maxBytes = 10 * 1024 * 1024;

    if (file.size > maxBytes) {
      this.errorMessage = 'Fichier trop volumineux (max 10MB).';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
    this.result = null;
    this.successMessage = '';
    this.errorMessage = '';
  }

  removeFile(): void {
    this.selectedFile = null;
    this.result = null;
    this.successMessage = '';
    this.errorMessage = '';
  }

  /* ==============================
   * SUBMIT (Upload + Create)
   * ============================== */

  submitCreateDocument(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.result = null;

    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Merci de sélectionner une filière, un étudiant et un type de document.';
      return;
    }

    const orgId = this.resolveEcoleId();
    const filiereId = Number(this.form.value.filiereId);
    const userId = Number(this.form.value.studentId);
    const docType = String(this.form.value.docType || '').trim();

    this.isSubmitting = true;

    this.docsApi.createDocument({
      orgId,
      userId,
      docType,
      file: this.selectedFile,
      filiereId
    }).subscribe({
      next: (doc: DocumentModel) => {
        this.isSubmitting = false;

        this.successMessage = 'Document créé avec succès.';
        this.result = {
          valid: true,
          message: 'Document enregistré avec succès.',
          blockchainTx: doc.blockchainTx || '',
          network: 'Ganache',
          timestamp: doc.createdAt,
          meta: this.buildMetaForResult(filiereId, userId, docType)
        };
      },
      error: (err) => {
        this.isSubmitting = false;

        if (err?.status === 409) {
          this.errorMessage = 'Ce document existe déjà (hash déjà enregistré).';
        } else {
          this.errorMessage = this.normalizeHttpError(err, 'Erreur lors de la création du document.');
        }
      }
    });
  }

  private buildMetaForResult(filiereId: number, studentId: number, docType: string) {
    const f = this.filieres.find((x) => Number(x.id) === filiereId);
    const s: any = this.students.find((x: any) => Number(x.id) === studentId);

    const studentName = s ? `${s.lastName || ''} ${s.firstName || ''}`.trim() : '—';
    const studentCin = s?.cin || '—';

    return {
      studentName,
      studentCin,
      filiereName: f?.code || '—',
      docType
    };
  }

  resetVerification(): void {
    this.form.reset({ filiereId: '', studentId: '', docType: '' });
    this.selectedFile = null;
    this.result = null;
    this.successMessage = '';
    this.errorMessage = '';
    this.studentsFiltered = [];
  }

  /* ==============================
   * HELPERS
   * ============================== */

  private resolveEcoleId(): number {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        const id = Number(u?.ecoleId ?? u?.orgId ?? u?.organisationId ?? u?.id);
        if (id && !Number.isNaN(id)) return id;
      }
    } catch {
      // ignore
    }
    return this.ecoleIdFallback;
  }

  private normalizeHttpError(err: any, fallback: string): string {
    const msg = err?.error?.message || err?.message;
    if (typeof msg === 'string' && msg.trim().length > 0) return msg;
    return fallback;
  }
}
