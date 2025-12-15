import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerifyApiService } from '../services/verify-api.service';
import { VerifyResponse } from '../models/entreprise.models';
import { EcoleApiService } from '../../ecole/services/ecole-api.service';
import { EcoleDetails } from '../../ecole/models/ecole.models';

type ActivePage = 'verification' | 'profile';

@Component({
  selector: 'app-entreprise-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entreprise-dashboard.component.html',
  styleUrls: ['./entreprise-dashboard.component.css']
})
export class EntrepriseDashboardComponent {

  ecoleDetails: EcoleDetails | null = null;

  activePage: ActivePage = 'verification';

  companyName = 'Acme Corporation';
  companyEmail = 'acme@entreprise.com';
  companyInitials = 'AM';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  isDragOver = false;

  selectedFile: File | null = null;
  fileSizeLabel = '';

  isVerifying = false;

  verifyResponse: VerifyResponse | null = null;

  errorMessage = '';

  constructor(
    private verifyApi: VerifyApiService,
    private cdr: ChangeDetectorRef,
  private ecoleApi: EcoleApiService
  ) {}

  showPage(page: ActivePage): void {
    this.activePage = page;
    this.clearMessages();
  }

  logout(): void {
    this.clearMessages();
    alert('Déconnexion (à connecter à ton AuthService).');
  }

  openFilePicker(): void {
    this.fileInput?.nativeElement?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.setFile(input.files[0]);

    // permettre de re-sélectionner le même fichier
    input.value = '';

    // ✅ force l’UI à se mettre à jour immédiatement
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

    // ✅ force l’UI à se mettre à jour immédiatement
    this.cdr.detectChanges();
  }

  private setFile(file: File): void {
    this.clearMessages();
    this.verifyResponse = null;

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

    // ✅ (optionnel) encore plus sûr
    this.cdr.detectChanges();
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileSizeLabel = '';
    this.verifyResponse = null;
    this.clearMessages();
    this.cdr.detectChanges();
  }

  verifyDocument(): void {
    this.clearMessages();

    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez choisir un fichier avant de vérifier.';
      return;
    }

    this.isVerifying = true;
    this.verifyResponse = null;
    this.cdr.detectChanges();

    this.verifyApi.verifyDocument(this.selectedFile).subscribe({
  next: (res: VerifyResponse) => {
    this.verifyResponse = res;
    this.isVerifying = false;

    // 🔹 Enrichissement : récupération de l'école
    if (res.valid && res.orgId) {
      this.ecoleApi.getEcoleById(res.orgId).subscribe({
        next: (ecole) => {
          this.ecoleDetails = ecole;
          this.cdr.detectChanges();
        },
        error: () => {
          this.ecoleDetails = null;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.ecoleDetails = null;
      this.cdr.detectChanges();
    }
  },
  error: (e: any) => {
    this.errorMessage = e?.message || 'Erreur lors de la vérification.';
    this.isVerifying = false;
    this.ecoleDetails = null;
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
  }

  private formatBytes(bytes: number): string {
    const mb = bytes / 1024 / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  }
}
