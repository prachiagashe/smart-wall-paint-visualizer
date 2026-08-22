import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cartService.loadCart();
    this.cartItems = this.cartService.getCartItems();
  }

  get subtotal(): number {
    return this.cartService.getCartTotal();
  }

  get tax(): number {
    return Math.round(this.subtotal * 0.18);
  }

  get deliveryCharge(): number {
    if (this.subtotal === 0) return 0;
    return this.subtotal > 1000 ? 0 : 50;
  }

  get grandTotal(): number {
    return this.subtotal + this.tax + this.deliveryCharge;
  }

  async increaseQuantity(item: CartItem) {
    if (item._id) {
      await this.cartService.updateQuantity(item._id, item.quantity + 1);
      this.cartItems = this.cartService.getCartItems();
    }
  }

  async decreaseQuantity(item: CartItem) {
    if (item._id && item.quantity > 1) {
      await this.cartService.updateQuantity(item._id, item.quantity - 1);
      this.cartItems = this.cartService.getCartItems();
    }
  }

  async removeItem(item: CartItem) {
    if (item._id) {
      await this.cartService.removeItem(item._id);
      this.cartItems = this.cartService.getCartItems();
    }
  }

  proceedToCheckout() {
    this.orderService.setTempCheckoutItems(this.cartItems);
    this.router.navigate(['/checkout']);
  }
}
