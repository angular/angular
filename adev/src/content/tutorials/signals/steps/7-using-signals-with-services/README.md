# Использование сигналов с сервисами

Теперь, когда вы
изучили [двустороннюю привязку с model-сигналами](/tutorials/signals/6-two-way-binding-with-model-signals), давайте
разберем, как использовать сигналы с сервисами Angular. Сервисы идеально подходят для совместного использования
реактивного состояния несколькими компонентами, а сигналы делают этот процесс еще мощнее, обеспечивая автоматическое
обнаружение изменений и чистые реактивные паттерны.

В этом упражнении вы научитесь создавать хранилище корзины с помощью сигналов, которые позволяют компоненту отображения
корзины автоматически реагировать на изменения состояния.

<hr />

<docs-workflow>

<docs-step title="Добавление сигналов в хранилище корзины">
Добавьте сигналы только для чтения и вычисляемые сигналы в `cart-store.ts`, чтобы сделать состояние корзины реактивным.

```ts
// Add the computed import
import {Injectable, signal, computed} from '@angular/core';

// Then add these signals to the class:

// Readonly signals
readonly cartItems = this.items.asReadonly();

// Computed signals
readonly totalQuantity = computed(() => {
  return this.items().reduce((sum, item) => sum + item.quantity, 0);
});

readonly totalPrice = computed(() => {
  return this.items().reduce((sum, item) => sum + item.price * item.quantity, 0);
});
```

Эти сигналы позволяют компонентам реактивно получать доступ к данным корзины и вычисляемым итогам. Метод `asReadonly()`
предотвращает прямое изменение товаров в корзине внешним кодом, в то время как `computed()` создает производное
состояние, которое автоматически обновляется при изменении исходного сигнала.
</docs-step>

<docs-step title="Реализация методов обновления количества">
Компонент отображения корзины в `cart-display.ts` уже использует сигналы хранилища корзины в своем шаблоне. Завершите методы обновления количества для изменения товаров в корзине:

```ts
increaseQuantity(id: string) {
  const items = this.cartStore.cartItems();
  const currentItem = items.find((item) => item.id === id);
  if (currentItem) {
    this.cartStore.updateQuantity(id, currentItem.quantity + 1);
  }
}

decreaseQuantity(id: string) {
  const items = this.cartStore.cartItems();
  const currentItem = items.find((item) => item.id === id);
  if (currentItem && currentItem.quantity > 1) {
    this.cartStore.updateQuantity(id, currentItem.quantity - 1);
  }
}
```

Эти методы считывают текущее состояние корзины с помощью `cartItems()` и обновляют количество через методы хранилища.
Пользовательский интерфейс автоматически обновляется при изменении сигналов!
</docs-step>

<docs-step title="Обновление главного компонента приложения">
Обновите главный компонент приложения в `app.ts`, чтобы использовать сервис корзины и отобразить компонент корзины.

```angular-ts
import {Component, inject} from '@angular/core';
import {CartStore} from './cart-store';
import {CartDisplay} from './cart-display';

@Component({
  selector: 'app-root',
  imports: [CartDisplay],
  template: `
    <div class="shopping-app">
      <header>
        <h1>Signals with Services Demo</h1>
        <div class="cart-badge">
          Cart: {{ cartStore.totalQuantity() }} items (\${{ cartStore.totalPrice() }})
        </div>
      </header>

      <main>
        <cart-display />
      </main>
    </div>
  `,
  styleUrl: './app.css',
})
export class App {
  cartStore = inject(CartStore);
}
```

</docs-step>

</docs-workflow>

Отлично! Теперь вы знаете, как использовать сигналы с сервисами. Ключевые концепции, которые следует запомнить:

- **Сигналы уровня сервиса**: Сервисы могут использовать сигналы для управления реактивным состоянием.
- **Внедрение зависимостей**: Используйте `inject()` для доступа к сервисам с сигналами в компонентах.
- **Вычисляемые сигналы в сервисах**: Создавайте производное состояние, которое обновляется автоматически.
- **Сигналы только для чтения**: Предоставляйте версии сигналов только для чтения, чтобы предотвратить внешние
  изменения.

В следующем уроке вы узнаете о
том, [как использовать сигналы с директивами](/tutorials/signals/8-using-signals-with-directives)!
