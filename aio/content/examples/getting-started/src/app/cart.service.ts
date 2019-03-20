// #docregion
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ProductService } from './products/product.service';
import { Product } from './products/product';
import { Observable } from 'rxjs';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  items: Product[] = [];

  constructor(private productsService: ProductService) {}

  add(product: Product) {
    this.items.push(product);
  }

  all(): Observable<CartItem[]> {
    return this.productsService.getAll()
      .pipe(map(products => {
        // create an object of each product and its total
        const cartItems = this.items.reduce((items, product) => {
          if (!items[product.id]) {
            items[product.id] = this.items.filter(item => item.id === product.id).length;
          }

          return items;
        }, {});

        // get the ids from the cartItems object
        const ids = Object.keys(cartItems);

        // map the into an array of products with their quantity
        return ids.map(id => {
          const product = products.find(prod => prod.id === +id);
          const quantity = cartItems[id];

          return { product, quantity };
        });
    }));
  }

}
