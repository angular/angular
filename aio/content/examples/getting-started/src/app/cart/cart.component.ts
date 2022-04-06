// #docplaster
// #docregion imports
import { Component , OnInit } from '@angular/core';
import { FormBuilder , FormGroup } from '@angular/forms';

import { CartService } from '../cart.service';
import { Product } from '../products';

// #enddocregion imports

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
// #docregion inject-form-builder, checkout-form-group
export class CartComponent implements OnInit {

  // #enddocregion inject-form-builder
  items: Product[] = [];

  checkoutForm: FormGroup;

// #docregion inject-form-builder
  constructor(
    private cartService: CartService,
    private formBuilder: FormBuilder,
  ) {}
// #enddocregion inject-form-builder, checkout-form-group

  ngOnInit(): void {
    // first initialize the checkout-form
    this.checkoutForm = this.formBuilder.group({
        name:  '',
        address: ''
    });

    // get items from cartService
    this.items = this.cartService.getItems();
  }

// #enddocregion initialize form, checkout-form group

  onSubmit(): void {
    // Process checkout data here
    this.items = this.cartService.clearCart();
    console.warn('Your order has been submitted', this.checkoutForm.value);
    this.checkoutForm.reset();
  }
// #docregion inject-form-builder, checkout-form-group
}
