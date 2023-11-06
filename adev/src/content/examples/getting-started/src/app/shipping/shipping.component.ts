// #docplaster
// #docregion imports
import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { CartService } from '../cart.service';
// #enddocregion

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.css']
})
// #docregion props
export class ShippingComponent implements OnInit {

  shippingCosts!: Observable<{ type: string, price: number }[]>;
// #enddocregion props

// #docregion inject-cart-service
  constructor(private cartService: CartService) { }
// #enddocregion inject-cart-service
// #docregion props

  ngOnInit(): void {
    this.shippingCosts =  this.cartService.getShippingPrices();
  }

}
