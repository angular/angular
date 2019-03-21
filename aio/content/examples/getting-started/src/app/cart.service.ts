// #docplaster
// #docregion imports-inject
import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
// #docregion props, methods, import-inject, shipping
export class CartService {
// #enddocregion methods, import-inject, shipping
  items = [];

// #enddocregion props
// #docregion import-inject
  constructor(private http: HttpClient) {}

// #enddocregion import-inject
// #docregion methods
  addToCart(product) {
    this.items.push(product);
  }

  getItems() {
    return this.items;
  }

  clearCart() {
    this.items = [];
    return this.items;
  }
// #enddocregion methods

// #docregion shipping
  getShippingPrices() {
    return this.http.get('/assets/shipping.json');
  }
// #docregion props, methods, import-inject
}
