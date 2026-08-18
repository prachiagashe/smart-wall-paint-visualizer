import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  
  // Modal State
  private authModalOpenSubject = new BehaviorSubject<boolean>(false);
  public isAuthModalOpen$ = this.authModalOpenSubject.asObservable();
  
  // Cache the action to execute after login
  private pendingAction: (() => void) | null = null;
  private pendingRoute: string | null = null;

  constructor(private http: HttpClient, private router: Router) { }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(loginData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, loginData);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser(): any {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { return JSON.parse(userStr); } catch (e) { return null; }
    }
    return null;
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user && user.role === 'admin';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear any pending actions just in case
    this.pendingAction = null;
    this.pendingRoute = null;
  }

  // --- Auth Gating Logic ---

  openAuthModal() {
    this.authModalOpenSubject.next(true);
  }

  closeAuthModal() {
    this.authModalOpenSubject.next(false);
    this.pendingAction = null;
    this.pendingRoute = null;
  }

  /**
   * Requires login to execute an action.
   * If logged in, executes immediately.
   * If not logged in, opens the modal and caches the action/route.
   */
  requireLogin(action?: () => void, fallbackRoute?: string): boolean {
    if (this.isLoggedIn()) {
      if (action) action();
      else if (fallbackRoute) this.router.navigate([fallbackRoute]);
      return true;
    } else {
      this.pendingAction = action || null;
      this.pendingRoute = fallbackRoute || null;
      this.openAuthModal();
      return false;
    }
  }

  executePendingAction() {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    } else if (this.pendingRoute) {
      this.router.navigate([this.pendingRoute]);
      this.pendingRoute = null;
    }
    this.closeAuthModal();
  }

  // --- Google Auth Stub ---
  continueWithGoogle() {
    // In a real app, integrate with Angular Social Login or Firebase Auth here.
    console.warn("Google Auth is stubbed. Please configure Google Cloud credentials.");
    alert("Google Sign-In is not yet configured. Please use email/password.");
  }
}
