// #docplaster
// #docregion imports
import { Component } from '@angular/core';
import { CartService } from '../cart.service';
// #enddocregion imports

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
// #docregion inject-cart, items
export class CartComponent {

// #enddocregion inject-cart
  items = this.cartService.getItems();
// #docregion inject-cart

  constructor(
    private cartService: CartService
  ) { }
}
