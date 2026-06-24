# Запрос дочерних элементов с помощью сигнальных запросов

Теперь, когда вы узнали, [как использовать сигналы с директивами](/tutorials/signals/8-using-signals-with-directives),
давайте изучим API запросов на основе сигналов. Они предоставляют реактивный способ доступа и взаимодействия с дочерними
компонентами и директивами. Как компоненты, так и директивы могут выполнять запросы, а также сами выступать в качестве
объектов запроса. В отличие от традиционного ViewChild, сигнальные запросы обновляются автоматически и обеспечивают
типобезопасный доступ к дочерним компонентам и директивам.

В этом задании вы добавите запросы viewChild для программного взаимодействия с дочерними компонентами.

<hr />

<docs-workflow>

<docs-step title="Добавьте импорт viewChild">
Сначала добавьте импорт `viewChild` для доступа к дочерним компонентам в `app.ts`.

```ts
import {Component, signal, computed, viewChild, ChangeDetectionStrategy} from '@angular/core';
```

</docs-step>

<docs-step title="Создайте запросы viewChild">
Добавьте запросы viewChild в компонент App для доступа к дочерним компонентам.

```ts
// Query APIs to access child components
firstProduct = viewChild(ProductCard);
cartSummary = viewChild(CartSummary);
```

Эти запросы создают сигналы, которые ссылаются на экземпляры дочерних компонентов.
</docs-step>

<docs-step title="Реализуйте методы родителя">
Используйте запросы viewChild для вызова методов дочерних компонентов в `app.ts`:

```ts
showFirstProductDetails() {
  const product = this.firstProduct();
  if (product) {
    product.highlight();
  }
}

initiateCheckout() {
  const summary = this.cartSummary();
  if (summary) {
    summary.initiateCheckout();
  }
}
```

</docs-step>

<docs-step title="Протестируйте взаимодействия">
Кнопки управления теперь должны работать:

- **"Show First Product Details"** — вызывает `highlight()` в ProductCard
- **"Initiate Checkout"** — вызывает `initiateCheckout()` в CartSummary

Нажмите на кнопки, чтобы увидеть, как запросы viewChild позволяют родительским компонентам управлять поведением дочерних
элементов.
</docs-step>

</docs-workflow>

Отлично! Вы узнали, как использовать API запросов на основе сигналов для взаимодействия с дочерними компонентами:

В следующем уроке вы узнаете о
том, [как реагировать на изменения сигналов с помощью effect](/tutorials/signals/10-reacting-to-signal-changes-with-effect)!
