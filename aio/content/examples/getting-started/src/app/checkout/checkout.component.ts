// #docplaster
// #docregion, forms-imports, cart-imports
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
// #enddocregion forms-imports

import { CartService, CartItem } from '../cart.service';
// #enddocregion cart-imports

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
// #docregion cart-items, checkout-form, submitted
export class CheckoutComponent implements OnInit {
  items: CartItem[];
// #enddocregion cart-items
  checkoutForm: FormGroup;
// #enddocregion checkout-form
  submitted = false;
// #enddocregion submitted

// #docregion cart-service, formbuilder
  constructor(
    private fb: FormBuilder,
    private cartService: CartService
  ) {
// #enddocregion cart-service
// #docregion checkout-form-group
    this.checkoutForm = this.fb.group({
      name: '',
      address: '',
    });
// #enddocregion checkout-form-group
// #docregion cart-service
  }
// #enddocregion cart-service, formbuilder

// #docregion on-init
  ngOnInit() {
    this.cartService.all()
      .subscribe(items => this.items = items);
  }
// #enddocregion on-init

// #docregion on-submit, set-submitted
  onSubmit(customerData: any) {
    const checkoutData = {
      customer: customerData,
      items: this.items
    };
// #enddocregion on-submit
    this.submitted = true;
// #docregion on-submit
    // Process checkout data here
    console.log(checkoutData);
  }
// #enddocregion on-submit, set-submitted
// #docregion cart-items, checkout-form, submitted
}
// #enddocregion cart-items, checkout-form, submitted
