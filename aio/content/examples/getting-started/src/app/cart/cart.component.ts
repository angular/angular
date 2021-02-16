// #docplaster
// #docregion imports
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { CartService } from '../cart.service';
// #enddocregion imports

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
// #docregion inject-form-builder, checkout-form-group
export class CartComponent {
  // #enddocregion inject-form-builder
  items = this.cartService.getItems();
  checkoutForm = this.formBuilder.group({
    name: '',
    address: ''
  });
// #docregion inject-form-builder
  constructor(
    private cartService: CartService,
    private formBuilder: FormBuilder,
    ) {}
// #enddocregion inject-form-builder, checkout-form-group

  onSubmit(): void {
    // Process checkout data here
    this.items = this.cartService.clearCart();
    console.warn('Your order has been submitted', this.checkoutForm.value);
    this.checkoutForm.reset();
  }
// #docregion inject-form-builder, checkout-form-group
}
