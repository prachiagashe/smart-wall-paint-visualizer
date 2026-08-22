import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService, OrderPayload } from '../../services/order.service';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutItems: CartItem[] = [];
  
  // Form Model
  customerName = '';
  email = '';
  phone = '';
  addressLine = '';
  city = '';
  state = '';
  pincode = '';
  paymentMethod = 'Online';
  
  isProcessing = false;
  errorMessage = '';

  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Priority: Try to get items from "Buy Now" flow (OrderService temp state)
    this.checkoutItems = this.orderService.getTempCheckoutItems();
    
    // Fallback: If not from "Buy Now", fetch the entire cart
    if (!this.checkoutItems || this.checkoutItems.length === 0) {
      this.cartService.loadCart();
      this.checkoutItems = this.cartService.getCartItems();
    }
    
    if (this.checkoutItems.length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  get subtotal(): number {
    return this.checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get tax(): number {
    return Math.round(this.subtotal * 0.18);
  }

  get deliveryCharge(): number {
    return this.subtotal > 1000 ? 0 : 50;
  }

  get grandTotal(): number {
    return this.subtotal + this.tax + this.deliveryCharge;
  }

  async placeOrder() {
    if (!this.customerName || !this.email || !this.phone || !this.addressLine || !this.city || !this.pincode) {
      this.errorMessage = 'Please fill out all required fields.';
      return;
    }
    
    this.isProcessing = true;
    this.errorMessage = '';

    const payload: OrderPayload = {
      items: this.checkoutItems,
      customerName: this.customerName,
      email: this.email,
      phone: this.phone,
      address: {
        line: this.addressLine,
        city: this.city,
        state: this.state,
        pincode: this.pincode
      },
      paymentMethod: this.paymentMethod
    };

    try {
      // Simulate network delay for "payment processing"
      if (this.paymentMethod === 'Online' || this.paymentMethod === 'UPI') {
        await new Promise(r => setTimeout(r, 1500)); 
      }
      
      const order = await this.orderService.createOrder(payload);
      this.orderService.clearTempCheckoutItems();
      // Ensure local cart count is synced if they bought the entire cart
      this.cartService.loadCart(); 
      this.router.navigate(['/order-success'], { queryParams: { orderId: order._id } });
    } catch (error: any) {
      this.isProcessing = false;
      this.errorMessage = error.error?.message || 'Failed to place order. Please try again.';
    }
  }
}
