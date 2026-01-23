import {Injectable, signal, computed} from '@angular/core';
import {CartItem} from './cart-types';

@Injectable({
  providedIn: 'root',
})
export class CartStore {
  private items = signal<CartItem[]>([]);

  // Readonly signals
  readonly cartItems = this.items.asReadonly();

  // Computed signals
  readonly totalQuantity = computed(() => {
    return this.items().reduce((sum, item) => sum + item.quantity, 0);
  });

  readonly totalPrice = computed(() => {
    return this.items().reduce((sum, item) => sum + item.price * item.quantity, 0);
  });

  addItem(id: string, name: string, price: number) {
    this.items.update((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === id ? {...item, quantity: item.quantity + 1} : item,
        );
      } else {
        return [...currentItems, {id, name, price, quantity: 1}];
      }
    });
  }

  removeItem(id: string) {
    this.items.update((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(id);
      return;
    }

    this.items.update((currentItems) =>
      currentItems.map((item) => (item.id === id ? {...item, quantity} : item)),
    );
  }

  clearCart() {
    this.items.set([]);
  }
}
