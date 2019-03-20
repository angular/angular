import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  items = [];

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
}
