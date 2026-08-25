import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription, firstValueFrom } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface CartItem {
  id: string | number;
  productId?: string;
  name: string; // Product or Color name
  colorName?: string;
  colorCode?: string;
  hexCode?: string;
  finish?: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartCountSubject = new BehaviorSubject<number>(0);
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private isCartOpenSubject = new BehaviorSubject<boolean>(false);
  
  private apiUrl = 'http://localhost:5000/api/cart';
  private authSub!: Subscription;
  
  cartCount$ = this.cartCountSubject.asObservable();
  cartItems$ = this.cartItemsSubject.asObservable();
  isCartOpen$ = this.isCartOpenSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadCartFromBackend();
      } else {
        this.loadCart();
      }
    });
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }

  async loadCartFromBackend() {
    try {
      const cart: any = await firstValueFrom(this.http.get(this.apiUrl, this.getAuthHeaders()));
      if (cart && cart.items) {
        this.cartItems = cart.items.map((i: any) => ({
          ...i,
          id: i._id,
          name: i.colorName
        }));
      } else {
        this.cartItems = [];
      }
      this.updateCartState();
    } catch (e) {
      console.error('Failed to load cart from backend', e);
      this.cartItems = [];
      this.updateCartState();
    }
  }

  loadCart() {
    const savedCart = localStorage.getItem('smartpaint_cart');
    if (savedCart) {
      try {
        this.cartItems = JSON.parse(savedCart);
      } catch (e) {
        this.cartItems = [];
      }
    } else {
      this.cartItems = [];
    }
    this.updateCartState();
  }

  saveCart() {
    if (this.authService.isLoggedIn()) {
      // Backend handles individual item adds/updates, we don't dump the whole cart.
      // But we can call loadCartFromBackend to sync state if needed, though individual methods do that.
    } else {
      localStorage.setItem('smartpaint_cart', JSON.stringify(this.cartItems));
    }
  }

  async addToCart(item: Partial<CartItem>) {
    if (this.authService.isLoggedIn()) {
      try {
        const payload = {
          productId: item.productId,
          finish: item.finish || 'Matte',
          quantity: item.quantity || 1
        };
        await firstValueFrom(this.http.post(this.apiUrl, payload, this.getAuthHeaders()));
        await this.loadCartFromBackend();
      } catch (e) {
        console.error('Error adding to cart backend', e);
      }
    } else {
      // Generate a unique ID if not present (combination of productId and finish, etc.)
      const itemId = item.id || `${item.productId || item.name}-${item.finish || 'default'}`;
      
      const existingItemIndex = this.cartItems.findIndex(i => i.id === itemId);

      if (existingItemIndex > -1) {
        // Increase quantity if item exists
        this.cartItems[existingItemIndex].quantity += (item.quantity || 1);
        this.cartItems[existingItemIndex].subtotal = this.cartItems[existingItemIndex].quantity * this.cartItems[existingItemIndex].price;
      } else {
        // Add new item
        const price = item.price || 250;
        const qty = item.quantity || 1;
        const newItem: CartItem = {
          id: itemId,
          name: item.name || 'Visualization Sheet',
          colorName: item.colorName,
          price: price,
          quantity: qty,
          subtotal: price * qty,
          colorCode: item.colorCode,
          hexCode: item.hexCode,
          finish: item.finish,
          image: item.image,
          productId: item.productId
        };
        this.cartItems.push(newItem);
      }

      this.saveCart();
      this.updateCartState();
    }
  }

  async updateQuantity(itemId: string | number, newQuantity: number) {
    if (newQuantity < 1) newQuantity = 1;
    
    if (this.authService.isLoggedIn()) {
      try {
        await firstValueFrom(this.http.put(`${this.apiUrl}/${itemId}`, { quantity: newQuantity }, this.getAuthHeaders()));
        await this.loadCartFromBackend();
      } catch (e) {
        console.error('Error updating cart backend', e);
      }
    } else {
      const index = this.cartItems.findIndex(i => i.id === itemId);
      if (index > -1) {
        this.cartItems[index].quantity = newQuantity;
        this.cartItems[index].subtotal = newQuantity * this.cartItems[index].price;
        this.saveCart();
        this.updateCartState();
      }
    }
  }

  async removeFromCart(itemId: string | number) {
    if (this.authService.isLoggedIn()) {
      try {
        await firstValueFrom(this.http.delete(`${this.apiUrl}/${itemId}`, this.getAuthHeaders()));
        await this.loadCartFromBackend();
      } catch (e) {
        console.error('Error removing cart item backend', e);
      }
    } else {
      this.cartItems = this.cartItems.filter(i => i.id !== itemId);
      this.saveCart();
      this.updateCartState();
    }
  }

  // Alias for backward compatibility if needed
  async removeItem(itemId: string | number) {
    this.removeFromCart(itemId);
  }

  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }
  
  getCartTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  async clearCart() {
    if (this.authService.isLoggedIn()) {
      try {
        await firstValueFrom(this.http.delete(this.apiUrl, this.getAuthHeaders()));
        this.cartItems = [];
        this.updateCartState();
      } catch (e) {
        console.error('Error clearing cart backend', e);
      }
    } else {
      this.cartItems = [];
      this.saveCart();
      this.updateCartState();
    }
  }

  private updateCartState() {
    this.cartItemsSubject.next([...this.cartItems]);
    this.updateCartCount();
  }

  private updateCartCount() {
    const count = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCountSubject.next(count);
  }

  // UI State Management for Cart Dropdown
  toggleCart() {
    this.isCartOpenSubject.next(!this.isCartOpenSubject.value);
  }
  
  openCart() {
    this.isCartOpenSubject.next(true);
  }
  
  closeCart() {
    this.isCartOpenSubject.next(false);
  }
}
