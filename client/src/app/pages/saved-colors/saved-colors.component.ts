import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SavedColoursService } from '../../services/saved-colours.service';
import { AppColor } from '../../services/image.service';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-saved-colors',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './saved-colors.component.html',
  styleUrls: ['./saved-colors.component.scss']
})
export class SavedColorsComponent implements OnInit, OnDestroy {
  savedColours: AppColor[] = [];
  private sub!: Subscription;

  constructor(
    private savedColoursService: SavedColoursService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.savedColoursService.savedColours$.subscribe(colours => {
      this.savedColours = colours;
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  unlikeColor(color: AppColor) {
    this.savedColoursService.removeSavedColour(color.id);
  }

  tryColor(color: AppColor) {
    const selectedFinish = (color.finishes && color.finishes[0]) || 'matte';
    this.router.navigate(['/visualizer'], {
      state: {
        color: color,
        finish: selectedFinish.toLowerCase(),
        cameFromColorsPage: true
      }
    });
  }

  addToCart(color: AppColor) {
    const finish = (color.finishes && color.finishes[0]) || 'Matte';
    this.cartService.addToCart({
      productId: color.id.toString(),
      name: color.name,
      colorName: color.name,
      colorCode: color.colorCode || '',
      hexCode: color.hex,
      finish: finish,
      quantity: 1,
      price: color.pricePerUnit || 250
    });
    this.cartService.openCart();
  }
}
