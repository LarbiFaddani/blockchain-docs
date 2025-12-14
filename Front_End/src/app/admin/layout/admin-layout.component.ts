import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  loading = false;
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  get adminName(): string {
    const full = (this.auth as any).getUserFullName?.() || localStorage.getItem('fullName') || '';
    if (full?.trim()) return full.trim();
    const email = this.adminEmail;
    if (email.includes('@')) return email.split('@')[0];
    return 'Administrateur';
  }

  get adminEmail(): string {
    return (this.auth as any).getUserEmail?.() || '—';
  }

  get adminInitials(): string {
    const n = this.adminName.trim();
    const parts = n.split(/[.\s_-]+/).filter(Boolean);
    const a = parts[0]?.[0] ?? 'A';
    const b = parts[1]?.[0] ?? 'D';
    return (a + b).toUpperCase();
  }

  logout(): void {
    if ((this.auth as any).logout) (this.auth as any).logout();
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('fullName');
    this.router.navigate(['/auth/login']);
  }

  goProfile(): void {
    this.router.navigate(['/admin/profile']);
  }
}
