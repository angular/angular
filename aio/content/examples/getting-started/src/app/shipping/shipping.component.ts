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
// #docregion props, ctor
export class ShippingComponent {
  shippingCosts;
// #enddocregion props

// #docregion inject-cart-service
  constructor(
    private cartService: CartService
  ) {
// #enddocregion inject-cart-service
    this.shippingCosts = this.cartService.getShippingPrices();
// #docregion inject-cart-service
  }
// #enddocregion inject-cart-service
// #docregion props
}
