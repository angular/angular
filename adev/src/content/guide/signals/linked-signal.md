# Зависимое состояние с помощью `linkedSignal`

Вы можете использовать функцию `signal` для хранения состояния в вашем Angular-коде. Иногда это состояние зависит от
_другого_ состояния. Например, представьте компонент, который позволяет пользователю выбрать способ доставки для заказа:

```typescript
@Component({/* ... */})
export class ShippingMethodPicker {
  shippingOptions: Signal<ShippingMethod[]> = getShippingOptions();

  // Select the first shipping option by default.
  selectedOption = signal(this.shippingOptions()[0]);

  changeShipping(newOptionIndex: number) {
    this.selectedOption.set(this.shippingOptions()[newOptionIndex]);
  }
}
```

В этом примере `selectedOption` по умолчанию выбирает первую опцию, но меняется, если пользователь выбирает другую. Но
`shippingOptions` — это сигнал, его значение может измениться! Если `shippingOptions` изменится, `selectedOption` может
содержать значение, которое больше не является допустимой опцией.

**Функция `linkedSignal` позволяет создать сигнал для хранения состояния, которое неразрывно _связано_ с другим
состоянием.** Возвращаясь к примеру выше, `linkedSignal` может заменить `signal`:

```typescript
@Component({/* ... */})
export class ShippingMethodPicker {
  shippingOptions: Signal<ShippingMethod[]> = getShippingOptions();

  // Initialize selectedOption to the first shipping option.
  selectedOption = linkedSignal(() => this.shippingOptions()[0]);

  changeShipping(index: number) {
    this.selectedOption.set(this.shippingOptions()[index]);
  }
}
```

`linkedSignal` работает аналогично `signal` с одним ключевым отличием: вместо передачи значения по умолчанию вы
передаете _функцию вычисления_ (computation function), точно так же, как в `computed`. Когда значение вычисления
меняется, значение `linkedSignal` меняется на результат вычисления. Это помогает гарантировать, что `linkedSignal`
всегда имеет допустимое значение.

Следующий пример показывает, как значение `linkedSignal` может изменяться в зависимости от связанного с ним состояния:

```typescript
const shippingOptions = signal(['Ground', 'Air', 'Sea']);
const selectedOption = linkedSignal(() => shippingOptions()[0]);
console.log(selectedOption()); // 'Ground'

selectedOption.set(shippingOptions()[2]);
console.log(selectedOption()); // 'Sea'

shippingOptions.set(['Email', 'Will Call', 'Postal service']);
console.log(selectedOption()); // 'Email'
```

## Учет предыдущего состояния

В некоторых случаях вычисление для `linkedSignal` должно учитывать предыдущее значение самого `linkedSignal`.

В примере выше `selectedOption` всегда сбрасывается на первую опцию при изменении `shippingOptions`. Однако вы можете
захотеть сохранить выбор пользователя, если выбранная им опция все еще присутствует в списке. Чтобы добиться этого,
можно создать `linkedSignal` с отдельными свойствами _source_ (источник) и _computation_ (вычисление):

```typescript
interface ShippingMethod {
  id: number;
  name: string;
}

@Component({/* ... */})
export class ShippingMethodPicker {
  constructor() {
    this.changeShipping(2);
    this.changeShippingOptions();
    console.log(this.selectedOption()); // {"id":2,"name":"Postal Service"}
  }

  shippingOptions = signal<ShippingMethod[]>([
    { id: 0, name: 'Ground' },
    { id: 1, name: 'Air' },
    { id: 2, name: 'Sea' },
  ]);

  selectedOption = linkedSignal<ShippingMethod[], ShippingMethod>({
    // `selectedOption` is set to the `computation` result whenever this `source` changes.
    source: this.shippingOptions,
    computation: (newOptions, previous) => {
      // If the newOptions contain the previously selected option, preserve that selection.
      // Otherwise, default to the first option.
      return (
        newOptions.find((opt) => opt.id === previous?.value.id) ?? newOptions[0]
      );
    },
  });

  changeShipping(index: number) {
    this.selectedOption.set(this.shippingOptions()[index]);
  }

  changeShippingOptions() {
    this.shippingOptions.set([
      { id: 0, name: 'Email' },
      { id: 1, name: 'Sea' },
      { id: 2, name: 'Postal Service' },
    ]);
  }
}
```

При создании `linkedSignal` вы можете передать объект с отдельными свойствами `source` и `computation` вместо
предоставления только функции вычисления.

Свойством `source` может быть любой сигнал, например `computed` или `input` компонента. Когда значение `source`
меняется, `linkedSignal` обновляет свое значение результатом предоставленного `computation`.

`computation` — это функция, которая получает новое значение `source` и объект `previous`. Объект `previous` имеет два
свойства: `previous.source` — это предыдущее значение источника, и `previous.value` — это предыдущее значение
`linkedSignal`. Вы можете использовать эти предыдущие значения для определения нового результата вычисления.

ПОЛЕЗНО: При использовании параметра `previous` необходимо явно указывать аргументы обобщенного типа (generic type
arguments) для `linkedSignal`. Первый обобщенный тип соответствует типу `source`, а второй определяет тип возвращаемого
значения `computation`.

## Пользовательское сравнение на равенство

`linkedSignal`, как и любой другой сигнал, может быть настроен с пользовательской функцией равенства. Эта функция
используется зависимостями ниже по потоку для определения того, изменилось ли значение `linkedSignal` (результат
вычисления):

```typescript
const activeUser = signal({id: 123, name: 'Morgan', isAdmin: true});

const activeUserEditCopy = linkedSignal(() => activeUser(), {
  // Consider the user as the same if it's the same `id`.
  equal: (a, b) => a.id === b.id,
});

// Or, if separating `source` and `computation`
const activeUserEditCopy = linkedSignal({
  source: activeUser,
  computation: user => user,
  equal: (a, b) => a.id === b.id,
});
```
