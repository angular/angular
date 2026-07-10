<docs-decorative-header title="Шаблоны" imgSrc="adev/src/assets/images/templates.svg"> <!-- markdownlint-disable-line -->
Используйте синтаксис шаблонов Angular для создания динамических пользовательских интерфейсов.
</docs-decorative-header>

Шаблоны компонентов — это не просто статический HTML: они могут использовать данные из класса компонента и настраивать обработчики взаимодействия с пользователем.

## Отображение динамического текста {#showing-dynamic-text}

В Angular _привязка_ создаёт динамическую связь между шаблоном компонента и его данными. Эта связь гарантирует, что изменения данных компонента автоматически обновляют отображаемый шаблон.

Вы можете создать привязку для отображения динамического текста в шаблоне с помощью двойных фигурных скобок:

```angular-ts
@Component({
  selector: 'user-profile',
  template: `<h1>Profile for {{ userName() }}</h1>`,
})
export class UserProfile {
  userName = signal('pro_programmer_123');
}
```

Когда Angular отрисовывает компонент, вы видите:

```html
<h1>Profile for pro_programmer_123</h1>
```

Angular автоматически поддерживает привязку в актуальном состоянии при изменении значения сигнала. Развивая
пример выше, если мы обновим значение сигнала `userName`:

```typescript
this.userName.set('cool_coder_789');
```

Отображаемая страница обновится с новым значением:

```html
<h1>Profile for cool_coder_789</h1>
```

## Установка динамических свойств и атрибутов {#setting-dynamic-properties-and-attributes}

Angular поддерживает привязку динамических значений к свойствам DOM с помощью квадратных скобок:

```angular-ts
@Component({
  /*...*/
  // Set the `disabled` property of the button based on the value of `isValidUserId`.
  template: `<button [disabled]="!isValidUserId()">Save changes</button>`,
})
export class UserProfile {
  isValidUserId = signal(false);
}
```

Вы также можете привязываться к HTML _атрибутам_, добавляя префикс `attr.` к имени атрибута:

```angular-html
<!-- Bind the `role` attribute on the `<ul>` element to value of `listRole`. -->
<ul [attr.role]="listRole()"></ul>
```

Angular автоматически обновляет свойства и атрибуты DOM при изменении привязанного значения.

## Обработка взаимодействия с пользователем {#handling-user-interaction}

Angular позволяет добавлять обработчики событий к элементу в шаблоне с помощью круглых скобок:

```angular-ts
@Component({
  /*...*/
  // Add an 'click' event handler that calls the `cancelSubscription` method.
  template: `<button (click)="cancelSubscription()">Cancel subscription</button>`,
})
export class UserProfile {
  /* ... */

  cancelSubscription() {
    /* Your event handling code goes here. */
  }
}
```

Если нужно передать [объект события](https://developer.mozilla.org/docs/Web/API/Event) в обработчик, можно использовать встроенную переменную Angular `$event` внутри вызова функции:

```angular-ts
@Component({
  /*...*/
  // Add an 'click' event handler that calls the `cancelSubscription` method.
  template: `<button (click)="cancelSubscription($event)">Cancel subscription</button>`,
})
export class UserProfile {
  /* ... */

  cancelSubscription(event: Event) {
    /* Your event handling code goes here. */
  }
}
```

## Управление потоком с `@if` и `@for` {#control-flow-with-if-and-for}

Вы можете условно скрывать и показывать части шаблона с помощью блока `@if` в Angular:

```angular-html
<h1>User profile</h1>

@if (isAdmin()) {
  <h2>Admin settings</h2>
  <!-- ... -->
}
```

Блок `@if` также поддерживает необязательный блок `@else`:

```angular-html
<h1>User profile</h1>

@if (isAdmin()) {
  <h2>Admin settings</h2>
  <!-- ... -->
} @else {
  <h2>User settings</h2>
  <!-- ... -->
}
```

Вы можете повторять часть шаблона несколько раз с помощью блока `@for` в Angular:

```angular-html
<h1>User profile</h1>

<ul class="user-badge-list">
  @for (badge of badges(); track badge.id) {
    <li class="user-badge">{{ badge.name }}</li>
  }
</ul>
```

Angular использует ключевое слово `track`, показанное в примере выше, для связывания данных с элементами DOM, созданными `@for`. Подробнее см. [_Why is track in @for blocks important?_](guide/templates/control-flow#why-is-track-in-for-blocks-important).

TIP: Хотите узнать больше о шаблонах Angular? См. [Подробное руководство по шаблонам](guide/templates) для полной информации.

## Следующий шаг {#next-step}

Теперь, когда в приложении есть динамические данные и шаблоны, пора узнать, как улучшать шаблоны — условно скрывая или показывая элементы, перебирая их и многое другое.

<docs-pill-row>
  <docs-pill title="Формы с Сигналами" href="essentials/signal-forms" />
  <docs-pill title="Подробное руководство по шаблонам" href="guide/templates" />
</docs-pill-row>
