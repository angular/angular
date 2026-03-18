# Зависимое состояние с `linkedSignal`

Для хранения состояния в коде Angular можно использовать функцию `signal`. Иногда это состояние зависит от _другого_ состояния. Например, представьте компонент, позволяющий пользователю выбрать способ доставки для заказа:

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

В этом примере `selectedOption` по умолчанию равен первому варианту, но меняется, если пользователь выбирает другой. Однако `shippingOptions` — это сигнал, его значение может измениться! Если `shippingOptions` изменится, `selectedOption` может содержать значение, которое больше не является допустимым вариантом.

**Функция `linkedSignal` позволяет создать сигнал для хранения состояния, которое неразрывно _связано_ с другим состоянием.** Возвращаясь к примеру выше, `linkedSignal` может заменить `signal`:

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

`linkedSignal` работает аналогично `signal` с одним ключевым отличием — вместо начального значения передаётся _функция вычисления_, как в `computed`. Когда результат вычисления изменяется, значение `linkedSignal` меняется на результат вычисления. Это гарантирует, что `linkedSignal` всегда содержит допустимое значение.

Следующий пример показывает, как значение `linkedSignal` может меняться в зависимости от связанного состояния:

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

В некоторых случаях вычисление для `linkedSignal` должно учитывать предыдущее значение самого `linkedSignal`.

В примере выше `selectedOption` всегда сбрасывается к первому варианту при изменении `shippingOptions`. Однако может потребоваться сохранить выбор пользователя, если выбранный им вариант всё ещё присутствует в списке. Для этого можно создать `linkedSignal` с отдельными свойствами _source_ и _computation_:

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

При создании `linkedSignal` вместо одной функции вычисления можно передать объект с отдельными свойствами `source` и `computation`.

`source` может быть любым сигналом, например `computed` или входным параметром компонента (`input`). `linkedSignal` обновляет своё значение при изменении `source` или любого сигнала, упомянутого в `computation`, устанавливая результат переданной функции `computation`.

`computation` — это функция, получающая новое значение `source` и объект `previous`. Объект `previous` имеет два свойства: `previous.source` — предыдущее значение `source`, и `previous.value` — предыдущее значение самого `linkedSignal`. Эти предыдущие значения можно использовать для определения нового результата вычисления.

HELPFUL: При использовании параметра `previous` необходимо явно указывать аргументы обобщённого типа для `linkedSignal`. Первый обобщённый тип соответствует типу `source`, второй определяет тип вывода `computation`.

## Пользовательское сравнение на равенство {#custom-equality-comparison}

`linkedSignal`, как и любой другой сигнал, можно настроить с помощью пользовательской функции равенства. Эта функция используется зависимостями ниже по потоку для определения того, изменилось ли значение `linkedSignal` (результат вычисления):

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
