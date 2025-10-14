import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable, signal} from '@angular/core';
let CartStore = (() => {
  let _classDecorators = [
    Injectable({
      providedIn: 'root',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CartStore = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      CartStore = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    items = signal([]);
    // TODO: Create readonly signal for cartItems using this.items.asReadonly()
    // readonly cartItems = ???
    // TODO: Create computed signal for totalQuantity
    // readonly totalQuantity = computed(() => ???)
    // TODO: Create computed signal for totalPrice
    // readonly totalPrice = computed(() => ???)
    addItem(id, name, price) {
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
    removeItem(id) {
      this.items.update((currentItems) => currentItems.filter((item) => item.id !== id));
    }
    updateQuantity(id, quantity) {
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
  };
  return (CartStore = _classThis);
})();
export {CartStore};
//# sourceMappingURL=cart-store.js.map
