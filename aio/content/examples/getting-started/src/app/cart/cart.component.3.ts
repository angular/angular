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
// #docregion props-services, submit
export class CartComponent {
  items;

  constructor(
    private cartService: CartService
  ) {
    this.items = this.cartService.getItems();
  }
}
