import {
  Component,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  form: FormGroup;
  loading = false;
  hidePassword = true;
  errorMessage = '';

  private sliderInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngAfterViewInit(): void {
    this.initSlider();
  }

  ngOnDestroy(): void {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
  }

  private initSlider(): void {
    const slides = Array.from(
      document.querySelectorAll<HTMLElement>('.slide')
    );
    const dots = Array.from(
      document.querySelectorAll<HTMLElement>('.dot')
    );

    if (!slides.length || slides.length !== dots.length) {
      return;
    }

    let index = 0;

    const activate = (i: number) => {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));

      slides[i].classList.add('active');
      dots[i].classList.add('active');
      index = i;
    };

    // auto-slide
    this.sliderInterval = setInterval(() => {
      const next = (index + 1) % slides.length;
      activate(next);
    }, 4500);

    // clic sur les dots
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        activate(i);
      });
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.form.value as any).subscribe({
      next: () => {
        this.loading = false;
        // redirection éventuelle ici
      },
      error: err => {
        this.loading = false;
        this.errorMessage =
          err.error?.message ||
          'Échec de connexion. Vérifiez vos identifiants.';
      }
    });
  }
}
