import {Injectable, signal, computed} from '@angular/core';

export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);

  public readonly items = this.cartItems.asReadonly();

  public readonly itemCount = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.quantity, 0),
  );

  public readonly totalPrice = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.product.price * item.quantity, 0),
  );

  addToCart(product: Product) {
    this.cartItems.update((items) => {
      const existingItem = items.find((item) => item.product.id === product.id);
      if (existingItem) {
        return items.map((item) =>
          item.product.id === product.id ? {...item, quantity: item.quantity + 1} : item,
        );
      } else {
        return [...items, {product, quantity: 1}];
      }
    });
  }
}
