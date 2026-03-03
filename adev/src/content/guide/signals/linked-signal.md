# Зависимое состояние с `linkedSignal` {#dependent-state-with-linkedsignal}

Вы можете использовать функцию `signal` для хранения состояния в коде Angular. Иногда это состояние зависит от _другого_ состояния. Например, представьте компонент, который позволяет пользователю выбрать способ доставки для заказа:

```typescript
@Component({
  /* ... */
})
export class ShippingMethodPicker {
  shippingOptions: Signal<ShippingMethod[]> = getShippingOptions();

  // Select the first shipping option by default.
  selectedOption = signal(this.shippingOptions()[0]);

  changeShipping(newOptionIndex: number) {
    this.selectedOption.set(this.shippingOptions()[newOptionIndex]);
  }
}
```

В этом примере `selectedOption` по умолчанию установлен на первый вариант, но изменяется, если пользователь выбирает другой. Однако `shippingOptions` — это сигнал, и его значение может измениться! Если `shippingOptions` изменится, `selectedOption` может содержать значение, которое больше не является допустимым вариантом.

**Функция `linkedSignal` позволяет создать сигнал для хранения состояния, которое по своей сути _связано_ с другим состоянием.** Возвращаясь к примеру выше, `linkedSignal` может заменить `signal`:

```ts
@Component({
  /* ... */
})
export class ShippingMethodPicker {
  shippingOptions: Signal<ShippingMethod[]> = getShippingOptions();

  // Initialize selectedOption to the first shipping option.
  selectedOption = linkedSignal(() => this.shippingOptions()[0]);

  changeShipping(index: number) {
    this.selectedOption.set(this.shippingOptions()[index]);
  }
}
```

`linkedSignal` работает аналогично `signal` с одним ключевым отличием — вместо передачи значения по умолчанию вы передаёте _функцию вычисления_, как в `computed`. Когда значение вычисления изменяется, значение `linkedSignal` обновляется на результат вычисления. Это помогает обеспечить, что `linkedSignal` всегда имеет допустимое значение.

Следующий пример показывает, как значение `linkedSignal` может изменяться на основе связанного состояния:

```ts
const shippingOptions = signal(['Ground', 'Air', 'Sea']);
const selectedOption = linkedSignal(() => shippingOptions()[0]);
console.log(selectedOption()); // 'Ground'

selectedOption.set(shippingOptions()[2]);
console.log(selectedOption()); // 'Sea'

shippingOptions.set(['Email', 'Will Call', 'Postal service']);
console.log(selectedOption()); // 'Email'
```

## Учёт предыдущего состояния {#accounting-for-previous-state}

В некоторых случаях вычисление для `linkedSignal` должно учитывать предыдущее значение `linkedSignal`.

В примере выше `selectedOption` всегда возвращается к первому варианту при изменении `shippingOptions`. Однако вы можете захотеть сохранить выбор пользователя, если его выбранный вариант всё ещё присутствует в списке. Для этого можно создать `linkedSignal` с отдельными _source_ и _computation_:

```ts
interface ShippingMethod {
  id: number;
  name: string;
}

@Component({
  /* ... */
})
export class ShippingMethodPicker {
  constructor() {
    this.changeShipping(2);
    this.changeShippingOptions();
    console.log(this.selectedOption()); // {"id":2,"name":"Postal Service"}
  }

  shippingOptions = signal<ShippingMethod[]>([
    {id: 0, name: 'Ground'},
    {id: 1, name: 'Air'},
    {id: 2, name: 'Sea'},
  ]);

  selectedOption = linkedSignal<ShippingMethod[], ShippingMethod>({
    // `selectedOption` is set to the `computation` result whenever this `source` changes.
    source: this.shippingOptions,
    computation: (newOptions, previous) => {
      // If the newOptions contain the previously selected option, preserve that selection.
      // Otherwise, default to the first option.
      return newOptions.find((opt) => opt.id === previous?.value.id) ?? newOptions[0];
    },
  });

  changeShipping(index: number) {
    this.selectedOption.set(this.shippingOptions()[index]);
  }

  changeShippingOptions() {
    this.shippingOptions.set([
      {id: 0, name: 'Email'},
      {id: 1, name: 'Sea'},
      {id: 2, name: 'Postal Service'},
    ]);
  }
}
```

При создании `linkedSignal` вы можете передать объект с отдельными свойствами `source` и `computation` вместо предоставления только функции вычисления.

`source` может быть любым сигналом, например `computed` или `input` компонента. `linkedSignal` обновляет своё значение при изменении `source` или любого сигнала, на который ссылается `computation`, устанавливая новое значение на результат предоставленной `computation`.

`computation` — это функция, которая получает новое значение `source` и объект `previous`. Объект `previous` имеет два свойства: `previous.source` — предыдущее значение `source`, и `previous.value` — предыдущее значение `linkedSignal`. Вы можете использовать эти предыдущие значения для определения нового результата вычисления.

HELPFUL: При использовании параметра `previous` необходимо явно указывать обобщённые типы `linkedSignal`. Первый обобщённый тип соответствует типу `source`, а второй — определяет тип результата `computation`.

## Пользовательское сравнение на равенство {#custom-equality-comparison}

`linkedSignal`, как и любой другой сигнал, может быть настроен с пользовательской функцией сравнения. Эта функция используется зависимыми потребителями для определения, изменилось ли значение `linkedSignal` (результат вычисления):

```typescript
const activeUser = signal({id: 123, name: 'Morgan', isAdmin: true});

const activeUserEditCopy = linkedSignal(() => activeUser(), {
  // Consider the user as the same if it's the same `id`.
  equal: (a, b) => a.id === b.id,
});

// Or, if separating `source` and `computation`
const activeUserEditCopy = linkedSignal({
  source: activeUser,
  computation: (user) => user,
  equal: (a, b) => a.id === b.id,
});
```
