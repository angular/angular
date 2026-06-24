<docs-decorative-header title="Шаблоны" imgSrc="adev/src/assets/images/templates.svg"> <!-- markdownlint-disable-line -->
Используйте синтаксис шаблонов Angular для создания динамических пользовательских интерфейсов.
</docs-decorative-header>

Шаблоны компонентов — это не просто статический HTML; они могут использовать данные из класса вашего компонента и
устанавливать обработчики для взаимодействия с пользователем.

## Отображение динамического текста

В Angular _привязка (binding)_ создает динамическую связь между шаблоном компонента и его данными. Эта связь
гарантирует, что изменения данных компонента автоматически обновляют отрисованный шаблон.

Вы можете создать привязку для отображения динамического текста в шаблоне, используя двойные фигурные скобки:

```angular-ts
@Component({
  selector: 'user-profile',
  template: `<h1>Profile for {{userName()}}</h1>`,
})
export class UserProfile {
  userName = signal('pro_programmer_123');
}
```

Когда Angular отрисовывает компонент, вы видите:

```html
<h1>Profile for pro_programmer_123</h1>
```

Angular автоматически поддерживает актуальность привязки при изменении значения сигнала. Основываясь на примере выше,
если мы обновим значение сигнала `userName`:

```typescript
this.userName.set('cool_coder_789');
```

Отрисованная страница обновится, чтобы отразить новое значение:

```html
<h1>Profile for cool_coder_789</h1>
```

## Установка динамических свойств и атрибутов

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

Вы также можете привязываться к _атрибутам_ HTML, добавляя префикс `attr.` к имени атрибута:

```angular-html
<!-- Bind the `role` attribute on the `<ul>` element to value of `listRole`. -->
<ul [attr.role]="listRole()">
```

Angular автоматически обновляет свойства и атрибуты DOM, когда изменяется связанное значение.

## Обработка взаимодействия с пользователем

Angular позволяет добавлять слушатели событий к элементу в вашем шаблоне с помощью круглых скобок:

```angular-ts
@Component({
  /*...*/
  // Add an 'click' event handler that calls the `cancelSubscription` method.
  template: `<button (click)="cancelSubscription()">Cancel subscription</button>`,
})
export class UserProfile {
  /* ... */

  cancelSubscription() { /* Your event handling code goes here. */  }
}
```

Если вам нужно передать объект [события (event)](https://developer.mozilla.org/docs/Web/API/Event) в ваш слушатель, вы
можете использовать встроенную переменную Angular `$event` внутри вызова функции:

```angular-ts
@Component({
  /*...*/
  // Add an 'click' event handler that calls the `cancelSubscription` method.
  template: `<button (click)="cancelSubscription($event)">Cancel subscription</button>`,
})
export class UserProfile {
  /* ... */

  cancelSubscription(event: Event) { /* Your event handling code goes here. */  }
}
```

## Управление потоком (Control flow) с `@if` и `@for`

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
    <li class="user-badge">{{badge.name}}</li>
  }
</ul>
```

Angular использует ключевое слово `track`, показанное в примере выше, чтобы связать данные с элементами DOM, созданными
с помощью `@for`. См. [_Почему track в блоках @for
важен?_](guide/templates/control-flow#why-is-track-in-for-blocks-important) для получения дополнительной информации.

TIP: Хотите узнать больше о шаблонах Angular? Смотрите [Углубленное руководство по шаблонам](guide/templates) для
получения полной информации.

## Следующий шаг

Теперь, когда у вас есть динамические данные и шаблоны в приложении, пришло время узнать, как улучшить шаблоны, условно
скрывая или показывая определенные элементы, перебирая элементы и многое другое.

<docs-pill-row>
  <docs-pill title="Модульный дизайн с внедрением зависимостей" href="essentials/dependency-injection" />
  <docs-pill title="Углубленное руководство по шаблонам" href="guide/templates" />
</docs-pill-row>
