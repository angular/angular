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

  constructor(private cartService: CartService) {
    this.shippingCosts = this.cartService.getShippingPrices();
  }
// #docregion props
}
