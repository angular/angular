import {Injectable, signal} from '@angular/core';
import {CartItem} from './cart-types';

@Injectable({
  providedIn: 'root',
})
export class CartStore {
  private items = signal<CartItem[]>([]);

  // TODO: Create readonly signal for cartItems using this.items.asReadonly()
  // readonly cartItems = ???

  // TODO: Create computed signal for totalQuantity
  // readonly totalQuantity = computed(() => ???)

  // TODO: Create computed signal for totalPrice
  // readonly totalPrice = computed(() => ???)

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
