// #docregion import-http
import { HttpClient } from '@angular/common/http';
// #docregion props
import { Product } from './products';
import { Injectable } from '@angular/core';
// #enddocregion props, import-http

// #docregion props, methods, inject-http, get-shipping
@Injectable({
  providedIn: 'root'
})
export class CartService {
// #enddocregion get-shipping
  items: Product[] = [];
// #enddocregion props, methods

  constructor(
    private http: HttpClient
  ) {}
// #enddocregion inject-http
// #docregion methods

  addToCart(product: Product) {
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
