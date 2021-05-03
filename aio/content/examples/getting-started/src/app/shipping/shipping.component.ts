// #docplaster
// #docregion imports
import { Component } from '@angular/core';

import { CartService } from '../cart.service';
// #enddocregion

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.css']
})
// #docregion props
export class ShippingComponent {
  shippingCosts = this.cartService.getShippingPrices();
// #enddocregion props



// #docregion inject-cart-service
  constructor(private cartService: CartService) {
  }
// #enddocregion inject-cart-service


// #docregion props
}
