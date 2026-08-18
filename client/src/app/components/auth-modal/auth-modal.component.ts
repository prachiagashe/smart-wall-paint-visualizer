import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent {
  
  constructor(public authService: AuthService) {}

  close() {
    this.authService.closeAuthModal();
  }

  continueWithGoogle() {
    this.authService.continueWithGoogle();
  }
}
