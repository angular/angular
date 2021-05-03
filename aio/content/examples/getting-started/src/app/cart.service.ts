// #docplaster
// #docregion import-http
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// #enddocregion import-http

@Injectable({
  providedIn: 'root'
})
// #docregion props, methods, inject-http, get-shipping
export class CartService {
// #enddocregion get-shipping
  items = [];
// #enddocregion props, methods

  constructor(
    private http: HttpClient
  ) {}
// #enddocregion inject-http
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

// #docregion get-shipping
  getShippingPrices() {
    return this.http.get<{type: string, price: number}[]>('/assets/shipping.json');
  }
// #docregion props, methods, inject-http
}
// #enddocregion props, methods, inject-http
