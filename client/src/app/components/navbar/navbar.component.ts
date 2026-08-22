import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  isMobileMenuOpen: boolean = false;
  isProfileMenuOpen: boolean = false;
  isCartOpen: boolean = false;
  cartCount: number = 0;
  cartItems: any[] = [];
  cartTotal: number = 0;
  isScrolled: boolean = false;
  
  private cartSub!: Subscription;
  private cartItemsSub!: Subscription;
  private cartOpenSub!: Subscription;

  constructor(public authService: AuthService, private router: Router, private cartService: CartService) {
    // Listen to router events to close mobile menu on navigation
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isMobileMenuOpen = false;
      }
    });
  }

  ngOnInit() {
    this.cartSub = this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
    this.cartItemsSub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cartTotal = this.cartService.getCartTotal();
    });
    this.cartOpenSub = this.cartService.isCartOpen$.subscribe(isOpen => {
      this.isCartOpen = isOpen;
      if (isOpen) {
        this.isProfileMenuOpen = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.cartSub) this.cartSub.unsubscribe();
    if (this.cartItemsSub) this.cartItemsSub.unsubscribe();
    if (this.cartOpenSub) this.cartOpenSub.unsubscribe();
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
    event.preventDefault();
    event.stopPropagation();
    this.cartService.toggleCart();
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

  // Cart helper methods
  increaseQuantity(item: any, event: Event) {
    event.stopPropagation();
    this.cartService.updateQuantity(item.id, item.quantity + 1);
  }

  decreaseQuantity(item: any, event: Event) {
    event.stopPropagation();
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1);
    }
  }

  removeItem(item: any, event: Event) {
    event.stopPropagation();
    this.cartService.removeFromCart(item.id);
  }

  goToCheckout() {
    this.cartService.closeCart();
    this.router.navigate(['/checkout']);
  }
}
