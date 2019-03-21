// #docplaster
// #docregion v1, imports
import { Injectable } from '@angular/core';

// #enddocregion v1
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
// #enddocregion imports

// #docregion v1
@Injectable({
  providedIn: 'root'
})
// #docregion http-client, ctor, get-one
export class DataService {
  items = [];

// #enddocregion v1
  constructor(private http: HttpClient) { }
// #enddocregion ctor

  getOne(productId) {
    return this.http.get('/assets/products.json')
      .pipe(
        map((products: any[]) => products.find(product => product.id === productId))
      );
  }

// #enddocregion get-one
// #docregion v1
  addToCart(product) {
    this.items.push(product);
  }

  getCartItems() {
    const cartItems = this.items.reduce((items, product) => {
      if (!items[product.id]) {
        items[product.id] = this.items.filter(item => item.id === product.id).length;
      }

      return items;
    }, {});

    const ids = Object.keys(cartItems);

    return ids.map(id => {
      const product = this.items.find(prod => prod.id === +id);
      const quantity = cartItems[id];

      return { product, quantity };
    });
  }

  clearCart() {
    this.items = [];
    return this.items;
  }
// #docregion ctor, get-one
}
