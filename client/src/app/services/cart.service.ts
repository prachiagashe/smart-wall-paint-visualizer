import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  colorId: string | number;
  colorName: string;
  hexCode: string;
  finish: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartCountSubject = new BehaviorSubject<number>(0);
  
  cartCount$ = this.cartCountSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  private loadCart() {
    const saved = localStorage.getItem('smartpaint_cart');
    if (saved) {
      try {
        this.cartItems = JSON.parse(saved);
        this.updateCount();
      } catch (e) {
        console.error('Failed to parse cart items', e);
      }
    }
  }

  private saveCart() {
    localStorage.setItem('smartpaint_cart', JSON.stringify(this.cartItems));
  }

  private updateCount() {
    const count = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCountSubject.next(count);
  }

  addToCart(item: CartItem) {
    const existing = this.cartItems.find(i => i.colorId === item.colorId && i.finish === item.finish);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.cartItems.push(item);
    }
    
    this.saveCart();
    this.updateCount();
  }

  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  clearCart() {
    this.cartItems = [];
    this.saveCart();
    this.updateCount();
  }
}
