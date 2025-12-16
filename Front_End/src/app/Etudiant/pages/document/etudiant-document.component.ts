import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VerifyApiService } from '../../../entreprise/services/verify-api.service';
import { EtudiantDocumentService } from '../../services/etudiant-api.service';

import { StudentResponse, StudentDocumentDto } from '../../models/etudiant.models';

@Component({
  selector: 'app-etudiant-document',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './etudiant-document.component.html',
  styleUrls: ['./etudiant-document.component.css']
})
export class EtudiantDocumentComponent implements OnInit {

  documents: StudentDocumentDto[] = [];
  loading = false;
  errorMessage = '';

  student: StudentResponse | null = null;

  constructor(
    private verifyApi: VerifyApiService,
    private docService: EtudiantDocumentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.bootstrap();
  }

  private bootstrap(): void {
    const rawUserId = localStorage.getItem('docs_user_id');
    const userId = Number(rawUserId);

    if (!Number.isFinite(userId) || userId <= 0) {
      this.errorMessage = 'Utilisateur non connecté (docs_user_id manquant).';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // 1) Charger l'étudiant connecté via userId (auth id)
    this.verifyApi.getStudentByUserIid(userId).subscribe({
      next: (stu: StudentResponse) => {
        this.student = stu;

        // 2) Utiliser l'id étudiant (stu.id) pour récupérer ses documents
        const studentId = stu?.id;
        if (!studentId) {
          this.loading = false;
          this.errorMessage = "ID étudiant introuvable dans la réponse getStudentByUserId.";
          this.cdr.detectChanges();
          return;
        }

        this.loadDocuments(studentId);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage =
          err?.message || err?.error?.message || 'Impossible de charger les informations de l’étudiant.';
        this.cdr.detectChanges();
      }
    });
  }

  private loadDocuments(studentId: number): void {
    this.docService.getDocumentsByUser(studentId).subscribe({
      next: (docs: StudentDocumentDto[]) => {
        this.documents = docs || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.documents = [];
        this.loading = false;
        this.errorMessage =
          err?.message || err?.error?.message || 'Impossible de charger les documents.';
        this.cdr.detectChanges();
      }
    });
  }

  download(hash: string): void {
    this.docService.download(hash);
  }
}
