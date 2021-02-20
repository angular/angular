// #docplaster
// #docregion import-http, props
// #enddocregion props
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// #enddocregion import-http
// #docregion get-shipping-import
import { Observable } from 'rxjs';
// #enddocregion get-shipping-import
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
    return this.http.get('/assets/shipping.json') as Observable<ShippingPrice[]>;
  }
// #docregion props, methods, inject-http
}
// #enddocregion props, methods, inject-http

export interface ShippingPrice {
  type: string;
  price: number;
}
