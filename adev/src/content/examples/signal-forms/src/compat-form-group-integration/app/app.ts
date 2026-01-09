import {JsonPipe} from '@angular/common';
import {Component, computed, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {FormField} from '@angular/forms/signals';
import {compatForm} from '@angular/forms/signals/compat';

@Component({
  selector: 'app',
  imports: [ReactiveFormsModule, FormField, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // 1. A legacy address group with its own validation logic
  readonly addressGroup = new FormGroup({
    street: new FormControl('123 Angular Way', Validators.required),
    city: new FormControl('Mountain View', Validators.required),
    zip: new FormControl('94043', Validators.required),
  });

  // 2. Include it in the state like it's a value
  readonly checkoutModel = signal({
    customerName: '',
    shippingAddress: this.addressGroup,
  });

  // 3. Create the form
  readonly f = compatForm(this.checkoutModel);

  // We have to manually extract values, because JSON pipe can't serialize FormControl
  readonly formValue = computed(() => ({
    customerName: this.f.customerName().value(),
    shippingAddress: this.f.shippingAddress().value(),
  }));

  constructor() {
    console.log('Customer Name:', this.f.customerName().value());
    console.log('Street:', this.f.shippingAddress().value().street);
  }
}
