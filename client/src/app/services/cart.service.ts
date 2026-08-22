import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export interface CartItem {
  _id?: string;
  productId: string;
  colorName: string;
  colorCode: string;
  hexCode: string;
  finish: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Cart {
  _id?: string;
  userId: string;
  items: CartItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:5000/api/cart';
  private cartItems: CartItem[] = [];
  private cartCountSubject = new BehaviorSubject<number>(0);
  
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCart();
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }

  async loadCart() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.cartItems = [];
      this.updateCount();
      return;
    }

    try {
      const cart = await firstValueFrom(this.http.get<Cart>(this.apiUrl, this.getAuthHeaders()));
      this.cartItems = cart?.items || [];
      this.updateCount();
    } catch (error) {
      console.error('Failed to load cart', error);
      this.cartItems = [];
      this.updateCount();
    }
  }

  private updateCount() {
    const count = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCountSubject.next(count);
  }

  async addToCart(item: { productId: string | number, finish: string, quantity: number }) {
    try {
      const cart = await firstValueFrom(this.http.post<Cart>(this.apiUrl, item, this.getAuthHeaders()));
      this.cartItems = cart?.items || [];
      this.updateCount();
    } catch (error) {
      console.error('Failed to add to cart', error);
      throw error;
    }
  }

  async updateQuantity(itemId: string, quantity: number) {
    try {
      const cart = await firstValueFrom(this.http.put<Cart>(`${this.apiUrl}/${itemId}`, { quantity }, this.getAuthHeaders()));
      this.cartItems = cart?.items || [];
      this.updateCount();
    } catch (error) {
      console.error('Failed to update quantity', error);
      throw error;
    }
  }

  async removeItem(itemId: string) {
    try {
      const cart = await firstValueFrom(this.http.delete<Cart>(`${this.apiUrl}/${itemId}`, this.getAuthHeaders()));
      this.cartItems = cart?.items || [];
      this.updateCount();
    } catch (error) {
      console.error('Failed to remove item', error);
      throw error;
    }
  }

  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }
  
  getCartTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  async clearCart() {
    try {
      await firstValueFrom(this.http.delete(this.apiUrl, this.getAuthHeaders()));
      this.cartItems = [];
      this.updateCount();
    } catch (error) {
      console.error('Failed to clear cart', error);
    }
  }
}
