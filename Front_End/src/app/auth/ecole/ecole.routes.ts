import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ecole-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem; color: #e5e7eb;">
      <h2>Dashboard Ecole</h2>
      <p>Placeholder – on fera le vrai design après.</p>
    </div>
  `
})
export class EcoleDashboardComponent {}

export const ECOLE_ROUTES: Routes = [
  {
    path: 'dashboard',
    component: EcoleDashboardComponent
  }
];
