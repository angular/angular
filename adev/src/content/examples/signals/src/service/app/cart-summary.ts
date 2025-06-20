import {Component, inject} from '@angular/core';
import {CartService} from './cart';

@Component({
  selector: 'app-cart-summary',
  templateUrl: './cart-summary.html',
  styleUrl: './cart-summary.css',
})
export class CartSummary {
  cartService = inject(CartService);
}
