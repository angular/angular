# Control flow

Шаблоны Angular поддерживают блоки control flow, которые позволяют условно показывать, скрывать и повторять элементы.

## Условный показ контента с `@if`, `@else if` и `@else` {#conditionally-display-content-with-if-else-if-and-else}

Блок `@if` условно показывает своё содержимое, когда выражение условия truthy:

```angular-html
@if (a > b) {
  <p>{{ a }} is greater than {{ b }}</p>
}
```

Если нужно показать альтернативный контент, можно предоставить любое число блоков `@else if` и один блок `@else`.

```angular-html
@if (a > b) {
  {{ a }} is greater than {{ b }}
} @else if (b > a) {
  {{ a }} is less than {{ b }}
} @else {
  {{ a }} is equal to {{ b }}
}
```

### Ссылка на результат условного выражения {#referencing-the-conditional-expressions-result}

Условный `@if` поддерживает сохранение результата условного выражения в переменную для переиспользования внутри блока.

```angular-html
@if (user.profile.settings.startDate; as startDate) {
  {{ startDate }}
}
```

Это полезно для ссылок на более длинные выражения, которые проще читать и поддерживать внутри шаблона.

## Повтор контента блоком `@for` {#repeat-content-with-the-for-block}

Блок `@for` проходит по коллекции и многократно рендерит содержимое блока. Коллекция может быть любым JavaScript [iterable](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols), но Angular имеет дополнительные оптимизации производительности для значений `Array`.

Типичный цикл `@for` выглядит так:

```angular-html
@for (item of items; track item.id) {
  {{ item.name }}
}
```

Блок `@for` Angular не поддерживает statements, изменяющие поток, вроде JavaScript `continue` или `break`.

### Почему `track` в блоках `@for` важен? {#why-is-track-in-for-blocks-important}

Выражение `track` позволяет Angular поддерживать связь между вашими данными и DOM-узлами на странице. Это позволяет Angular оптимизировать производительность, выполняя минимум необходимых DOM-операций при изменении данных.

Эффективное использование track может значительно улучшить производительность рендеринга приложения при обходе коллекций данных.

В выражении `track` выберите свойство, которое уникально идентифицирует каждый элемент. Если модель данных включает уникально идентифицирующее свойство — обычно `id` или `uuid` — используйте это значение. Если в данных нет такого поля, настоятельно рассмотрите его добавление.

Для статических коллекций, которые никогда не меняются, можно использовать `$index`, чтобы Angular отслеживал каждый элемент по его индексу в коллекции.

Если других вариантов нет, можно использовать сам элемент как tracking key. Это говорит Angular отслеживать элемент по reference identity через оператор тройного равенства (`===`). Избегайте этого варианта по возможности: он может привести к значительно более медленным обновлениям рендера, так как Angular не сможет сопоставить, какой элемент данных соответствует каким DOM-узлам.

```angular-html
@for (item of items; track item) {
  {{ item.name }}
}
```

NOTE: В отличие от `*ngFor`, блок `@for` приоритизирует переиспользование view. Если отслеживаемое свойство изменилось, но ссылка на объект осталась той же, Angular обновляет привязки view (включая inputs компонента), а не уничтожает и заново создаёт весь элемент.

### Контекстные переменные в блоках `@for` {#contextual-variables-in-for-blocks}

Внутри блоков `@for` всегда доступны несколько неявных переменных:

| Переменная | Значение                                          |
| ---------- | ------------------------------------------------- |
| `$count`   | Число элементов в обходимой коллекции             |
| `$index`   | Индекс текущей строки                             |
| `$first`   | Является ли текущая строка первой                 |
| `$last`    | Является ли текущая строка последней              |
| `$even`    | Является ли индекс текущей строки чётным          |
| `$odd`     | Является ли индекс текущей строки нечётным        |

Эти переменные всегда доступны с этими именами, но их можно алиасить через сегмент `let`:

```angular-html
@for (item of items; track item.id; let idx = $index, e = $even) {
  <p>Item #{{ idx }}: {{ item.name }}</p>
}
```

Aliasing полезен при вложенных блоках `@for`, позволяя читать переменные внешнего блока `@for` из внутреннего блока `@for`.

### Fallback для блоков `@for` через блок `@empty` {#providing-a-fallback-for-for-blocks-with-the-empty-block}

Опционально можно включить секцию `@empty` сразу после содержимого блока `@for`. Содержимое блока `@empty` показывается, когда элементов нет:

```angular-html
@for (item of items; track item.name) {
  <li>{{ item.name }}</li>
} @empty {
  <li>There are no items.</li>
}
```

## Условный показ контента блоком `@switch` {#conditionally-display-content-with-the-switch-block}

Хотя блок `@if` подходит для большинства сценариев, блок `@switch` предоставляет альтернативный синтаксис для условного рендера данных. Его синтаксис близко напоминает statement `switch` в JavaScript.

```angular-html
@switch (userPermissions) {
  @case ('admin') {
    <app-admin-dashboard />
  }
  @case ('reviewer')
  @case ('editor') {
    <app-editor-dashboard />
  }
  @default {
    <app-viewer-dashboard />
  }
}
```

Значение условного выражения сравнивается с выражением case через оператор тройного равенства (`===`).

**У `@switch` нет fallthrough**, поэтому эквивалент statement `break` или `return` в блоке не нужен.

Можно указать несколько условий для одного блока, используя подряд идущие statements `@case`.

Опционально можно включить блок `@default`. Содержимое блока `@default` показывается, если ни одно из предшествующих выражений case не совпало со значением switch.

Если ни один `@case` не совпал с выражением и блока `@default` нет, ничего не показывается.

### Исчерпывающая проверка типов {#exhaustive-type-checking}

`@switch` поддерживает исчерпывающую проверку типов, позволяя Angular во время компиляции проверить, что все возможные значения union type обработаны.

Используя `@default never;`, вы явно объявляете, что оставшихся case быть не должно. Если union type позже расширят и новый case не покрыт `@case`, template type checker Angular сообщит об ошибке, помогая рано поймать пропущенные ветки.

```angular-html
@Component({
  template: `
    @switch (state) {
      @case ('loggedOut') {
        <button>Login</button>
      }

      @case ('loggedIn') {
        <p>Welcome back!</p>
      }

      @default never; // throws because `@case ('loading')` is missing
    }
  `,
})
export class AppComponent {
  state: 'loggedOut' | 'loading' | 'loggedIn' = 'loggedOut';
}
```

Когда переключаемое выражение вложено в union, нужно явно указать выражение для проверки исчерпываемости.

<!-- prettier-ignore -->
```angular-ts
@Component({
  template: `
    @switch (state.mode) {
      @case ('show') {
        {{ state.menu }};
      }
      @case ('hide') {}
      @default never(state);
    }
  `,
})
export class App {
  state!: {mode: 'hide'} | {mode: 'show'; menu: number};
}
```
