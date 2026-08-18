import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  searchQuery: string = '';
  isMobileMenuOpen: boolean = false;
  isProfileMenuOpen: boolean = false;
  isCartOpen: boolean = false;
  cartCount: number = 0;
  isScrolled: boolean = false;

  constructor(public authService: AuthService, private router: Router) {
    // Listen to router events to close mobile menu on navigation
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isMobileMenuOpen = false;
      }
    });
  }

  // Auth Gating Methods
  requireLogin(fallbackRoute: string) {
    this.authService.requireLogin(undefined, fallbackRoute);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/colors'], { queryParams: { search: this.searchQuery } });
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isCartOpen = false;
  }

  toggleCart(event: Event) {
    event.stopPropagation();
    this.isCartOpen = !this.isCartOpen;
    this.isProfileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick() {
    this.isProfileMenuOpen = false;
    this.isCartOpen = false;
  }

  logout() {
    this.authService.logout();
    this.isProfileMenuOpen = false;
    this.router.navigate(['/']);
  }
}
