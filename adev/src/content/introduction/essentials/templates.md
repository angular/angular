<docs-decorative-header title="Шаблоны" imgSrc="adev/src/assets/images/templates.svg"> <!-- markdownlint-disable-line -->
Используйте синтаксис шаблонов Angular для создания динамических пользовательских интерфейсов.
</docs-decorative-header>

Шаблоны компонентов — это не просто статический HTML: они могут использовать данные из класса компонента и настраивать обработчики пользовательского взаимодействия.

## Отображение динамического текста {#showing-dynamic-text}

В Angular _привязка (binding)_ создаёт динамическое соединение между шаблоном компонента и его данными. Это соединение гарантирует, что изменения данных компонента автоматически обновляют отрисованный шаблон.

Чтобы отобразить динамический текст в шаблоне, создайте привязку с помощью двойных фигурных скобок:

```angular-ts
@Component({
  selector: 'user-profile',
  template: `<h1>Profile for {{ userName() }}</h1>`,
})
export class UserProfile {
  userName = signal('pro_programmer_123');
}
```

Когда Angular отрисовывает компонент, вы увидите:

```html
<h1>Profile for pro_programmer_123</h1>
```

Angular автоматически поддерживает привязку актуальной при изменении значения сигнала. Развивая приведённый выше пример: если мы обновим значение сигнала `userName`:

```typescript
this.userName.set('cool_coder_789');
```

Отрисованная страница обновится, отражая новое значение:

```html
<h1>Profile for cool_coder_789</h1>
```

## Установка динамических свойств и атрибутов {#setting-dynamic-properties-and-attributes}

Angular поддерживает привязку динамических значений к DOM-свойствам с помощью квадратных скобок:

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

Вы также можете привязываться к HTML-_атрибутам_, добавив префикс `attr.` к имени атрибута:

```angular-html
<!-- Bind the `role` attribute on the `<ul>` element to value of `listRole`. -->
<ul [attr.role]="listRole()"></ul>
```

Angular автоматически обновляет DOM-свойства и атрибуты при изменении привязанного значения.

## Обработка пользовательского взаимодействия {#handling-user-interaction}

Angular позволяет добавлять обработчики событий к элементам в шаблоне с помощью круглых скобок:

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

Если вам нужно передать объект [события](https://developer.mozilla.org/docs/Web/API/Event) в обработчик, вы можете использовать встроенную переменную Angular `$event` внутри вызова функции:

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

Вы можете условно скрывать и показывать части шаблона с помощью блока `@if` Angular:

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

Вы можете повторять часть шаблона несколько раз с помощью блока `@for` Angular:

```angular-html
<h1>User profile</h1>

<ul class="user-badge-list">
  @for (badge of badges(); track badge.id) {
    <li class="user-badge">{{ badge.name }}</li>
  }
</ul>
```

Angular использует ключевое слово `track`, показанное в примере выше, для связи данных с DOM-элементами, создаваемыми `@for`. Смотрите [_Почему track в блоках @for важен?_](guide/templates/control-flow#why-is-track-in-for-blocks-important) для получения дополнительной информации.

TIP: Хотите узнать больше о шаблонах Angular? Смотрите [Углубленное руководство по шаблонам](guide/templates) для получения полной информации.

## Следующий шаг {#next-step}

Теперь, когда в приложении есть динамические данные и шаблоны, пришло время узнать, как расширить шаблоны — условно скрывать или показывать элементы, перебирать элементы и многое другое.

<docs-pill-row>
  <docs-pill title="Модульный дизайн с внедрением зависимостей" href="essentials/dependency-injection" />
  <docs-pill title="Углубленное руководство по шаблонам" href="guide/templates" />
</docs-pill-row>
