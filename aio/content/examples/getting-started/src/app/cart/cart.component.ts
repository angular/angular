// #docplaster
// #docregion imports
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { CartService } from '../cart.service';
// #enddocregion imports

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
// #docregion props-services, submit, inject-form-builder, checkout-form, checkout-form-group
export class CartComponent implements OnInit {
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
    this.checkoutForm = this.formBuilder.group({
      name: '',
      address: ''
    });
// #docregion inject-form-builder
  }

  ngOnInit() {
    this.items = this.cartService.getItems();
  }
// #enddocregion inject-form-builder, checkout-form-group

  // #enddocregion props-services
  onSubmit(customerData) {
    // Process checkout data here
    this.items = this.cartService.clearCart();
    this.checkoutForm.reset();

    console.warn('Your order has been submitted', customerData);
  }
// #docregion props-services, inject-form-builder, checkout-form, checkout-form-group
}
