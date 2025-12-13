import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../auth/services/auth.service';
import { EcoleApiService } from '../../services/ecole-api.service';
import { EcoleDetails } from '../../models/ecole.models';

@Component({
  selector: 'app-ecole-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ecole-layout.component.html',
  styleUrls: ['./ecole-layout.component.css']
})
export class EcoleLayoutComponent implements OnInit {
  loading = false;
  errorMessage = '';

  ecole?: EcoleDetails;
  ecoleId!: number;

  constructor(
    private auth: AuthService,
    private ecoleApi: EcoleApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  get ecoleName(): string {
    return this.ecole?.name ?? 'Docs-Blockchain';
  }

  get ecoleMetaLine(): string {
    // ✅ Important: inclure anneeCreation si elle existe
    const city = this.ecole?.city ?? '';
    const auth = (this.ecole as any)?.numeroAutorisation ?? '';
    const type = (this.ecole as any)?.typeEcole ?? '';
    const annee = (this.ecole as any)?.anneeCreation ?? this.ecole?.anneeCreation ?? null;

    const parts = [
      city,
      auth ? `Autorisation : ${auth}` : '',
      type ? String(type) : '',
      annee ? `Créée en : ${annee}` : ''
    ].filter(Boolean);

    return parts.join(' • ');
  }

  ngOnInit(): void {
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
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Impossible de charger les informations de l’école.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goProfile(): void {
    this.router.navigate(['/ecole/profile']);
  }

  logout(): void {
    // ✅ adapte selon ton AuthService (remove token, userId, etc.)
    this.auth.logout?.(); // si tu as une méthode logout()
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');

    this.router.navigate(['/auth/login']);
  }
}
