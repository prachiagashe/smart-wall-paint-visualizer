import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  
  cartCount$ = this.cartCountSubject.asObservable();
  cartItems$ = this.cartItemsSubject.asObservable();
  isCartOpen$ = this.isCartOpenSubject.asObservable();

  constructor() {
    this.loadCart();
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
    localStorage.setItem('smartpaint_cart', JSON.stringify(this.cartItems));
  }

  addToCart(item: Partial<CartItem>) {
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

  updateQuantity(itemId: string | number, newQuantity: number) {
    if (newQuantity < 1) newQuantity = 1;
    
    const index = this.cartItems.findIndex(i => i.id === itemId);
    if (index > -1) {
      this.cartItems[index].quantity = newQuantity;
      this.cartItems[index].subtotal = newQuantity * this.cartItems[index].price;
      this.saveCart();
      this.updateCartState();
    }
  }

  removeFromCart(itemId: string | number) {
    this.cartItems = this.cartItems.filter(i => i.id !== itemId);
    this.saveCart();
    this.updateCartState();
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

  clearCart() {
    this.cartItems = [];
    this.saveCart();
    this.updateCartState();
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
