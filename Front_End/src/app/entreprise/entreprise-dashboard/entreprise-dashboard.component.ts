import { Component, ElementRef, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { VerifyApiService } from '../services/verify-api.service';
import {
  VerifyResponse,
  EntrepriseAdminDto,
  EntrepriseUpdateRequest,
  StudentResponse
} from '../models/entreprise.models';

import { EcoleApiService } from '../../ecole/services/ecole-api.service';
import { EcoleDetails } from '../../ecole/models/ecole.models';

type ActivePage = 'verification' | 'profile';

@Component({
  selector: 'app-entreprise-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entreprise-dashboard.component.html',
  styleUrls: ['./entreprise-dashboard.component.css']
})
export class EntrepriseDashboardComponent implements OnInit {

  activePage: ActivePage = 'verification';

  // ✅ Profil (dynamique)
  userId: number | null = null;
  loadingProfile = false;
  profileError = '';

  // ✅ ENTREPRISE liée au compte (by-admin)
  myEntreprise: EntrepriseAdminDto | null = null;

  // ✅ école enrichie via orgId après vérification
  verifiedEcole: EcoleDetails | null = null;

  // ✅ étudiant enrichi via userId après vérification
  verifiedStudent: StudentResponse | null = null;

  // ===== Edit entreprise =====
  editMode = false;
  savingProfile = false;
  saveSuccess = '';
  saveError = '';

  entrepriseForm: EntrepriseUpdateRequest = {
    name: '',
    address: '',
    city: '',
    emailContact: '',
    ice: '',
    secteurActivite: '',
    statutJuridique: ''
  };

  // ===== Upload / verify =====
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  isDragOver = false;

  selectedFile: File | null = null;
  fileSizeLabel = '';

  isVerifying = false;
  verifyResponse: VerifyResponse | null = null;

  errorMessage = '';

  constructor(
    private verifyApi: VerifyApiService,
    private ecoleApi: EcoleApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.bootstrapUser();
  }

  private bootstrapUser(): void {
    const raw = localStorage.getItem('docs_user_id');
    const id = Number(raw);
    this.userId = Number.isFinite(id) && id > 0 ? id : null;

    if (!this.userId) {
      this.profileError = "docs_user_id introuvable dans localStorage. Stocke-le après login.";
      this.cdr.detectChanges();
      return;
    }

    this.loadMyProfile();
  }

  showPage(page: ActivePage): void {
    this.activePage = page;
    this.clearMessages();

    if (page === 'profile' && !this.myEntreprise && this.userId) {
      this.loadMyProfile();
    }
  }

  logout(): void {
    localStorage.removeItem('docs_user_id');
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  // =========================
  // PROFIL (ENTREPRISE)
  // =========================
  loadMyProfile(): void {
    if (!this.userId) return;

    this.loadingProfile = true;
    this.profileError = '';
    this.saveSuccess = '';
    this.saveError = '';

    this.verifyApi.getEntrepriseByAdmin(this.userId).subscribe({
      next: (ent) => {
        this.myEntreprise = ent;
        this.loadingProfile = false;

        this.entrepriseForm = {
          name: ent.name || '',
          address: ent.address || '',
          city: ent.city || '',
          emailContact: ent.emailContact || '',
          ice: ent.ice || '',
          secteurActivite: ent.secteurActivite || '',
          statutJuridique: ent.statutJuridique || ''
        };

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.myEntreprise = null;
        this.loadingProfile = false;
        this.profileError = err?.message || err?.error?.message || "Impossible de charger votre profil (entreprise).";
        this.cdr.detectChanges();
      }
    });
  }

  startEdit(): void {
    this.saveSuccess = '';
    this.saveError = '';
    this.editMode = true;

    if (this.myEntreprise) {
      this.entrepriseForm = {
        name: this.myEntreprise.name || '',
        address: this.myEntreprise.address || '',
        city: this.myEntreprise.city || '',
        emailContact: this.myEntreprise.emailContact || '',
        ice: this.myEntreprise.ice || '',
        secteurActivite: this.myEntreprise.secteurActivite || '',
        statutJuridique: this.myEntreprise.statutJuridique || ''
      };
    }

    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.editMode = false;
    this.saveError = '';
    this.saveSuccess = '';
    this.cdr.detectChanges();
  }

  saveEntreprise(): void {
    this.saveError = '';
    this.saveSuccess = '';

    if (!this.myEntreprise?.id) {
      this.saveError = "ID entreprise introuvable.";
      this.cdr.detectChanges();
      return;
    }

    if (!this.entrepriseForm.name?.trim()) {
      this.saveError = "Le nom est obligatoire.";
      this.cdr.detectChanges();
      return;
    }

    this.savingProfile = true;
    this.cdr.detectChanges();

    this.verifyApi.updateEntreprise(this.myEntreprise.id, this.entrepriseForm).subscribe({
      next: (updated: any) => {
        this.myEntreprise = { ...this.myEntreprise!, ...updated };

        this.savingProfile = false;
        this.editMode = false;
        this.saveSuccess = "Profil entreprise mis à jour avec succès.";
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.savingProfile = false;
        this.saveError = err?.message || err?.error?.message || "Erreur lors de la mise à jour.";
        this.cdr.detectChanges();
      }
    });
  }

  get profileInitials(): string {
    const name = (this.myEntreprise?.name || '').trim();
    if (!name) return '—';
    const parts = name.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] || '';
    const b = parts[1]?.[0] || parts[0]?.[1] || '';
    return (a + b).toUpperCase();
  }

  // =========================
  // FILE PICKER / DND
  // =========================
  openFilePicker(): void {
    this.fileInput?.nativeElement?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.setFile(input.files[0]);
    input.value = '';
    this.cdr.detectChanges();
  }

  onDragOver(evt: DragEvent): void {
    evt.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(evt: DragEvent): void {
    evt.preventDefault();
    this.isDragOver = false;
  }

  onDrop(evt: DragEvent): void {
    evt.preventDefault();
    this.isDragOver = false;

    const files = evt.dataTransfer?.files;
    if (!files || files.length === 0) return;

    this.setFile(files[0]);
    this.cdr.detectChanges();
  }

  private setFile(file: File): void {
    this.clearMessages();
    this.verifyResponse = null;
    this.verifiedEcole = null;
    this.verifiedStudent = null;

    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      this.errorMessage = 'Fichier trop volumineux (max 10MB).';
      this.selectedFile = null;
      this.fileSizeLabel = '';
      return;
    }

    const allowed = ['pdf', 'docx', 'png', 'jpg', 'jpeg'];
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!allowed.includes(ext)) {
      this.errorMessage = 'Type de fichier non supporté (PDF, DOCX, PNG, JPG).';
      this.selectedFile = null;
      this.fileSizeLabel = '';
      return;
    }

    this.selectedFile = file;
    this.fileSizeLabel = this.formatBytes(file.size);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileSizeLabel = '';
    this.verifyResponse = null;
    this.verifiedEcole = null;
    this.verifiedStudent = null;
    this.clearMessages();
    this.cdr.detectChanges();
  }

  // =========================
  // VERIFY
  // =========================
  verifyDocument(): void {
    this.clearMessages();

    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez choisir un fichier avant de vérifier.';
      return;
    }

    this.isVerifying = true;
    this.verifyResponse = null;
    this.verifiedEcole = null;
    this.verifiedStudent = null;
    this.cdr.detectChanges();

    this.verifyApi.verifyDocument(this.selectedFile).subscribe({
      next: (res) => {
        this.verifyResponse = res;
        this.isVerifying = false;

        // ✅ Charger école via orgId
        const orgId = Number((res as any)?.orgId);
        if (orgId && Number.isFinite(orgId)) {
          this.ecoleApi.getEcoleById(orgId).subscribe({
            next: (ecole) => {
              this.verifiedEcole = ecole;
              this.cdr.detectChanges();
            },
            error: () => {
              this.verifiedEcole = null;
              this.cdr.detectChanges();
            }
          });
        }

        // ✅ Charger étudiant via userId (retourné par VerifyResponse)
        const userId = Number((res as any)?.userId);
        if (userId && Number.isFinite(userId)) {
          // IMPORTANT: ce endpoint doit exister: GET /orgs/student/by-user/{userId}
          this.verifyApi.getStudentByUserId(userId).subscribe({
            next: (stu) => {
              this.verifiedStudent = stu;
              this.cdr.detectChanges();
            },
            error: () => {
              this.verifiedStudent = null;
              this.cdr.detectChanges();
            }
          });
        }

        this.cdr.detectChanges();
      },
      error: (e: any) => {
        this.errorMessage = e?.message || 'Erreur lors de la vérification.';
        this.isVerifying = false;
        this.verifiedEcole = null;
        this.verifiedStudent = null;
        this.cdr.detectChanges();
      }
    });
  }

  ddownload(url: string): void {
    window.open(`http://localhost:8080${url}`, '_blank');
  }

  resetVerification(): void {
    this.removeFile();
  }

  get hasResult(): boolean {
    return !!this.verifyResponse;
  }

  get isValid(): boolean {
    return this.verifyResponse?.valid === true;
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.profileError = '';
    this.saveError = '';
    this.saveSuccess = '';
  }

  private formatBytes(bytes: number): string {
    const mb = bytes / 1024 / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  }
}
