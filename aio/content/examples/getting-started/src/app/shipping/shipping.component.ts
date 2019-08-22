// #docplaster
// #docregion imports
import { Component, OnInit } from '@angular/core';

import { CartService } from '../cart.service';
// #enddocregion

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.css']
})
// #docregion props, ctor
export class ShippingComponent implements OnInit {
  shippingCosts;
// #enddocregion props

// #docregion inject-cart-service
  constructor(
    private cartService: CartService
  ) {
  }
// #enddocregion inject-cart-service

  ngOnInit() {
    this.shippingCosts = this.cartService.getShippingPrices();
  }

// #docregion props
}
