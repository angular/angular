// #docplaster
// #docregion imports
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { DataService } from '../data.service';
// #enddocregion imports

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
// #docregion props-services, submit
export class CartComponent {
  checkoutForm;
  items;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) {
    this.checkoutForm = this.formBuilder.group({
      name: '',
      address: ''
    });

    this.items = this.dataService.getCartItems();
  }

// #enddocregion props-services
  onSubmit(customerData) {
    // Process checkout data here
    console.warn('Your order has been submitted', customerData);

    this.items = this.dataService.clearCart();
    this.checkoutForm.reset();
  }
// #docregion props-services
}
