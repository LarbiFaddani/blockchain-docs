import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { DocsApiService } from '../../services/docs-api.service';
import { StudentApiService } from '../../services/student-api.service';
import { EcoleApiService } from '../../services/ecole-api.service';
import { AuthService } from '../../../auth/services/auth.service';

import { VerifyApiService } from '../../../entreprise/services/verify-api.service'; 
import { Filiere, Student, DocumentModel } from '../../models/ecole.models';

@Component({
  selector: 'app-ecole-document',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ecole-document.component.html',
  styleUrls: ['./ecole-document.component.css']
})
export class EcoleDocumentComponent implements OnInit {

  documents: DocumentModel[] = [];
  isLoadingDocs = false;
  documentsLoaded = false;

  orgId: number | null = null;
  isResolvingOrg = false;

  successMessage = '';
  errorMessage = '';

  isModalOpen = false;

  form!: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;

  filieres: Filiere[] = [];
  students: Student[] = [];
  studentsFiltered: Student[] = [];
  isLoadingFilieres = false;
  isLoadingStudents = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // ✅ CACHE: userId -> "Nom Prenom"
  studentNameByUserId: Record<number, string> = {};
  // optionnel (pour affichage "Chargement..." si tu veux)
  loadingStudentNames = false;

  docTypes = [
    { value: 'ATTESTATION_SCOLARITE', label: 'Attestation de scolarité' },
    { value: 'RELEVE_NOTES', label: 'Relevé de notes' },
    { value: 'DIPLOME', label: 'Diplôme' },
    { value: 'CONVENTION_STAGE', label: 'Convention de stage' },
    { value: 'ATTESTATION_REUSSITE', label: 'Attestation de réussite' },
    { value: 'AUTRE', label: 'Autre' }
  ];

  constructor(
    private fb: FormBuilder,
    private docsApi: DocsApiService,
    private studentApi: StudentApiService,
    private ecoleApi: EcoleApiService,
    private auth: AuthService,
    private verifyApi: VerifyApiService,        // ✅ injection
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      filiereId: ['', Validators.required],
      studentId: ['', Validators.required],
      docType: ['', Validators.required]
    });

    this.form.get('filiereId')!.valueChanges.subscribe((val) => {
      this.form.get('studentId')!.setValue('');
      this.applyStudentFilter(Number(val));
    });

    this.initAndLoadDocuments();
  }

  private initAndLoadDocuments(): void {
    this.clearBanners();

    const cachedOrgId = Number(localStorage.getItem('docs_org_id'));
    if (cachedOrgId && !Number.isNaN(cachedOrgId) && cachedOrgId > 0) {
      this.orgId = cachedOrgId;
      this.loadDocuments();
      return;
    }

    this.resolveOrgIdAndLoadDocuments();
  }

  private resolveOrgIdAndLoadDocuments(): void {
    this.isResolvingOrg = true;

    const authUserId = (this.auth.getUserId?.() as any);
    const fallbackLocal = Number(localStorage.getItem('docs_user_id'));
    const userId = Number(authUserId ?? fallbackLocal);

    if (!userId || Number.isNaN(userId) || userId <= 0) {
      this.isResolvingOrg = false;
      this.documentsLoaded = true;
      this.errorMessage = 'Utilisateur non connecté (userId introuvable).';
      this.cdr.detectChanges();
      return;
    }

    this.ecoleApi.getEcoleByAdmin(userId).pipe(
      finalize(() => {
        this.isResolvingOrg = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (ecole: any) => {
        const id = Number(ecole?.id ?? ecole?.orgId ?? ecole?.organisationId);
        if (!id || Number.isNaN(id) || id <= 0) {
          this.documentsLoaded = true;
          this.errorMessage = 'Organisation introuvable (id non retourné).';
          return;
        }

        this.orgId = id;
        localStorage.setItem('docs_org_id', String(id));
        this.loadDocuments();
      },
      error: (err) => {
        this.documentsLoaded = true;
        this.errorMessage = this.normalizeHttpError(err, 'Erreur lors de getEcoleByAdmin.');
      }
    });
  }

  loadDocuments(): void {
    if (!this.orgId) return;

    this.errorMessage = '';
    this.isLoadingDocs = true;
    this.documentsLoaded = false;

    this.docsApi.getDocumentsByEcoleId(this.orgId).pipe(
      finalize(() => {
        this.isLoadingDocs = false;
        this.documentsLoaded = true;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (docs) => {
        this.documents = (docs || []).slice().sort((a: any, b: any) => {
          const ta = new Date(a?.createdAt || 0).getTime();
          const tb = new Date(b?.createdAt || 0).getTime();
          return tb - ta;
        });

        // ✅ après chargement docs => charger les noms des étudiants
        this.loadStudentNamesForDocs();
      },
      error: (err) => {
        this.documents = [];
        this.errorMessage = this.normalizeHttpError(err, 'Impossible de charger les documents.');
      }
    });
  }

  refreshDocuments(): void {
    this.clearBanners();
    this.loadDocuments();
  }

  // ✅ Affichage dans le HTML
  getStudentLabel(userId: any): string {
    const id = Number(userId);
    if (!id || Number.isNaN(id) || id <= 0) return '—';

    const name = this.studentNameByUserId[id];
    return name ? name : `User #${id}`; // fallback propre
  }

  // ✅ Charge les noms (avec cache)
  private loadStudentNamesForDocs(): void {
    const ids = (this.documents || [])
      .map(d => Number((d as any)?.userId))
      .filter(id => Number.isFinite(id) && id > 0);

    const uniqueIds = Array.from(new Set(ids));

    // ne charger que ceux qui ne sont pas déjà en cache
    const missing = uniqueIds.filter(id => !this.studentNameByUserId[id]);

    if (missing.length === 0) return;

    this.loadingStudentNames = true;

    const calls = missing.map(id =>
      this.verifyApi.getStudentByUserId(id).pipe(
        map(stu => {
          const fn = (stu as any)?.firstName ?? '';
          const ln = (stu as any)?.lastName ?? '';
          const full = `${ln} ${fn}`.trim(); // ex: "ERRAAD Soufiane"
          return { id, name: full || `User #${id}` };
        }),
        catchError(() => of({ id, name: `User #${id}` }))
      )
    );

    forkJoin(calls).pipe(
      finalize(() => {
        this.loadingStudentNames = false;
        this.cdr.detectChanges();
      })
    ).subscribe((results) => {
      for (const r of results) {
        this.studentNameByUserId[r.id] = r.name;
      }
    });
  }

  // ---------------- MODAL (inchangé) ----------------
  openModal(): void {
    this.clearBanners();
    this.isModalOpen = true;
    this.resetDocumentForm();
    this.ensureModalDataLoaded();
    this.cdr.detectChanges();
  }

  closeModal(): void {
    if (this.isSubmitting) return;
    this.isModalOpen = false;
    this.resetDocumentForm();
    this.cdr.detectChanges();
  }

  onOverlayClick(_: MouseEvent): void {
    if (this.isSubmitting) return;
    this.closeModal();
  }

  onModalClick(evt: MouseEvent): void {
    evt.stopPropagation();
  }

  private ensureModalDataLoaded(): void {
    if (!this.orgId) {
      this.errorMessage = 'orgId introuvable.';
      return;
    }
    if (this.filieres.length === 0) this.loadFilieres();
    if (this.students.length === 0) this.loadStudents();
  }

  private loadFilieres(): void {
    if (!this.orgId) return;

    this.isLoadingFilieres = true;
    this.docsApi.getFilieresByEcoleId(this.orgId).pipe(
      finalize(() => {
        this.isLoadingFilieres = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.filieres = (data || []).slice().sort((a: any, b: any) =>
          String(a.code || '').localeCompare(String(b.code || ''))
        );
      },
      error: (err) => {
        this.errorMessage = this.normalizeHttpError(err, 'Impossible de charger les filières.');
      }
    });
  }

  private loadStudents(): void {
    if (!this.orgId) return;

    this.isLoadingStudents = true;
    this.studentApi.getStudentsByEcoleId(this.orgId).pipe(
      finalize(() => {
        this.isLoadingStudents = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.students = data || [];
        this.studentsFiltered = [];
      },
      error: (err) => {
        this.errorMessage = this.normalizeHttpError(err, 'Impossible de charger les étudiants.');
      }
    });
  }

  private applyStudentFilter(filiereId: number): void {
    if (!filiereId) {
      this.studentsFiltered = [];
      return;
    }

    const filtered = (this.students || []).filter((s: any) => {
      const sid = Number(s?.filiereId ?? s?.filiere?.id);
      return sid === filiereId;
    });

    this.studentsFiltered = filtered.sort((a: any, b: any) => {
      const ln = String(a.lastName || '').localeCompare(String(b.lastName || ''));
      return ln !== 0 ? ln : String(a.firstName || '').localeCompare(String(b.firstName || ''));
    });
  }

  pickFile(): void { this.fileInput?.nativeElement?.click(); }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.clearBanners();

    const file = input.files[0];
    const maxBytes = 10 * 1024 * 1024;

    if (file.size > maxBytes) {
      this.errorMessage = 'Fichier trop volumineux (max 10MB).';
      this.selectedFile = null;
      input.value = '';
      return;
    }

    this.selectedFile = file;
    input.value = '';
    this.cdr.detectChanges();
  }

  removeFile(): void {
    this.selectedFile = null;
    this.cdr.detectChanges();
  }

  private resetDocumentForm(): void {
    this.form.reset({ filiereId: '', studentId: '', docType: '' });
    this.selectedFile = null;
    this.studentsFiltered = [];
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  submitCreateDocument(): void {
    this.clearBanners();

    if (!this.orgId) {
      this.errorMessage = 'orgId introuvable.';
      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Merci de sélectionner une filière, un étudiant et un type de document.';
      return;
    }

    const filiereId = Number(this.form.value.filiereId);
    const userId = Number(this.form.value.studentId);
    const docType = String(this.form.value.docType || '').trim();

    this.isSubmitting = true;
    this.cdr.detectChanges();

    this.docsApi.createDocument({
      orgId: this.orgId,
      userId,
      docType,
      file: this.selectedFile,
      filiereId
    }).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.successMessage = 'Document ajouté avec succès.';
        this.closeModal();
        this.loadDocuments();
      },
      error: (err) => {
        if (err?.status === 409) {
          this.errorMessage = 'Ce document existe déjà (hash déjà enregistré).';
        } else {
          this.errorMessage = this.normalizeHttpError(err, 'Erreur lors de l’upload du document.');
        }
      }
    });
  }

  get totalDocs(): number { return this.documents?.length || 0; }

  private clearBanners(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private normalizeHttpError(err: any, fallback: string): string {
    const msg = err?.error?.message || err?.message;
    if (typeof msg === 'string' && msg.trim().length > 0) return msg;
    return fallback;
  }
}
