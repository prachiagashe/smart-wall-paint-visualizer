import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  isLoginMode = false;
  
  showRegisterPassword = false;
  showConfirmPassword = false;
  showLoginPassword = false;
  
  registerForm!: FormGroup;
  loginForm!: FormGroup;

  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.successMessage = '';
    this.showRegisterPassword = false;
    this.showConfirmPassword = false;
    this.showLoginPassword = false;
    this.registerForm.reset();
    this.loginForm.reset();
  }

  useDemoAccount() {
    this.loginForm.patchValue({
      email: 'demo@smartpaint.com',
      password: 'demo123'
    });
    this.onLoginSubmit();
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      if (this.registerForm.hasError('mismatch')) {
        this.errorMessage = 'Passwords do not match';
      } else {
        this.errorMessage = 'Please fill out the form correctly.';
      }
      return;
    }

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.successMessage = 'Registration successful! Please login to continue.';
        this.isLoginMode = true; // Switch to login mode
        this.registerForm.reset();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed';
      }
    });
  }

  onLoginSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill out the login form correctly.';
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        this.successMessage = 'Login successful!';
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Invalid email or password';
      }
    });
  }
}
