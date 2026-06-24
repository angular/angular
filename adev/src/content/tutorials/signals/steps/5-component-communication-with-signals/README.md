# Передача данных в компоненты с помощью input-сигналов

Теперь, когда вы
изучили [управление асинхронными данными с помощью сигналов](/tutorials/signals/4-managing-async-data-with-signals),
давайте рассмотрим API `input()` в Angular, основанный на сигналах. Он предназначен для передачи данных от родительских
компонентов к дочерним, делая поток данных компонентов более реактивным и эффективным. Если вы знакомы со свойствами (
props) компонентов из других фреймворков, то input'ы — это та же идея.

В этом задании вы добавите input-сигналы в компонент карточки товара и увидите, как данные от родителя передаются
реактивно.

<hr />

<docs-workflow>

<docs-step title="Добавление input-сигналов в ProductCard">
Добавьте функции сигналов `input()` для получения данных в компоненте `product-card`.

```ts
// Add imports for signal inputs
import {Component, input, ChangeDetectionStrategy} from '@angular/core';

// Add these signal inputs
name = input.required<string>();
price = input.required<number>();
available = input<boolean>(true);
```

Обратите внимание, что `input.required()` создает input, который должен быть обязательно передан, в то время как
`input()` со значением по умолчанию является необязательным.
</docs-step>

<docs-step title="Подключение input'ов к шаблону">
Обновите шаблон в `product-card`, чтобы отобразить значения input-сигналов.

```angular-html
<div class="product-card">
  <h3>{{ name() }}</h3>
  <p class="price">\${{ price() }}</p>
  <p class="status">Status:
    @if (available()) {
      Available
    } @else {
      Out of Stock
    }
  </p>
</div>
```

Input-сигналы работают в шаблонах так же, как и обычные сигналы — вызывайте их как функции для доступа к их значениям.
</docs-step>

<docs-step title="Подключение родительских сигналов к дочерним input'ам">
Обновите использование `product-card` в `app.ts`, чтобы передавать динамические значения сигналов вместо статических.

```html
<!-- Change from static values: -->
<product-card
  name="Static Product"
  price="99"
  available="true"
/>

<!-- To dynamic signals: -->
<product-card
  [name]="productName()"
  [price]="productPrice()"
  [available]="productAvailable()"
/>
```

Квадратные скобки `[]` создают привязку свойств, которая передает текущие значения сигналов дочернему компоненту.
</docs-step>

<docs-step title="Тестирование реактивных обновлений">
Добавьте методы в `app.ts` для обновления родительских сигналов и посмотрите, как дочерний компонент автоматически реагирует на это.

```ts
updateProduct() {
  this.productName.set('Updated Product');
  this.productPrice.set(149);
}

toggleAvailability() {
  this.productAvailable.set(!this.productAvailable());
}
```

```html
<!-- Add controls to test reactivity -->
<div class="controls">
  <button (click)="updateProduct()">Update Product Info</button>
  <button (click)="toggleAvailability()">Toggle Availability</button>
</div>
```

Когда родительские сигналы изменяются, дочерний компонент автоматически получает и отображает новые значения!
</docs-step>

</docs-workflow>

Отлично! Вы узнали, как работают input-сигналы:

- **Input-сигналы** — Используйте `input()` и `input.required()` для получения данных от родительских компонентов.
- **Реактивные обновления** — Дочерние компоненты автоматически обновляются при изменении значений родительских
  сигналов.
- **Безопасность типов** — Input-сигналы обеспечивают полную проверку типов TypeScript.
- **Значения по умолчанию** — Необязательные input'ы могут иметь значения по умолчанию, тогда как обязательные должны
  быть предоставлены.

Input-сигналы делают взаимодействие компонентов более реактивным и во многих случаях устраняют необходимость в хуке
жизненного цикла `OnChanges`.

В следующем уроке вы узнаете
о [двусторонней привязке с помощью model-сигналов](/tutorials/signals/6-two-way-binding-with-model-signals)!
