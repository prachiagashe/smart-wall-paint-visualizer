import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CartItem } from './cart.service';

export interface OrderPayload {
  items: CartItem[];
  customerName: string;
  email: string;
  phone: string;
  address: {
    line: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
  customerName: string;
  email: string;
  phone: string;
  address: any;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:5000/api/orders';
  private tempCheckoutItems: CartItem[] = [];

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }

  // Used to pass items from "Buy Now" to checkout page
  setTempCheckoutItems(items: CartItem[]) {
    this.tempCheckoutItems = items;
  }

  getTempCheckoutItems(): CartItem[] {
    return this.tempCheckoutItems;
  }

  clearTempCheckoutItems() {
    this.tempCheckoutItems = [];
  }

  async createOrder(payload: OrderPayload): Promise<Order> {
    try {
      return await firstValueFrom(this.http.post<Order>(this.apiUrl, payload, this.getAuthHeaders()));
    } catch (error) {
      console.error('Failed to create order', error);
      throw error;
    }
  }

  async getMyOrders(): Promise<Order[]> {
    try {
      return await firstValueFrom(this.http.get<Order[]>(this.apiUrl, this.getAuthHeaders()));
    } catch (error) {
      console.error('Failed to fetch orders', error);
      return [];
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    try {
      return await firstValueFrom(this.http.get<Order>(`${this.apiUrl}/${id}`, this.getAuthHeaders()));
    } catch (error) {
      console.error('Failed to fetch order', error);
      return null;
    }
  }
}
