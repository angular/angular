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
// #docregion props-services, submit, inject-form-builder, checkout-form, checkout-form-group
export class CartComponent {
  items;
// #enddocregion inject-form-builder
  checkoutForm;
// #enddocregion checkout-form
// #docregion inject-form-builder

  constructor(
    private cartService: CartService,
    private formBuilder: FormBuilder,
  ) {
// #enddocregion inject-form-builder
    this.items = this.cartService.getItems();

    this.checkoutForm = this.formBuilder.group({
      name: '',
      address: ''
    });
// #docregion inject-form-builder
  }
// #enddocregion inject-form-builder, checkout-form-group

  // #enddocregion props-services
  onSubmit(customerData) {
    // Process checkout data here
    console.warn('Your order has been submitted', customerData);

    this.items = this.cartService.clearCart();
    this.checkoutForm.reset();
  }
// #docregion props-services, inject-form-builder, checkout-form, checkout-form-group
}
