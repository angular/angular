# Хост-элементы компонента

TIP: В этом руководстве предполагается, что вы уже ознакомились с [Руководством по основам](essentials). Прочитайте его
в первую очередь, если вы новичок в Angular.

Angular создает экземпляр компонента для каждого HTML-элемента, соответствующего селектору компонента. DOM-элемент,
соответствующий селектору компонента, является его **хост-элементом** (host element). Содержимое шаблона компонента
рендерится внутри его хост-элемента.

```angular-ts
// Исходный код компонента
@Component({
  selector: 'profile-photo',
  template: `
    <img src="profile-photo.jpg" alt="Your profile photo" />
  `,
})
export class ProfilePhoto {}
```

```angular-html
<!-- Использование компонента -->
<h3>Your profile photo</h3>
<profile-photo />
<button>Upload a new profile photo</button>
```

```angular-html
<!-- Отрисованный DOM -->
<h3>Your profile photo</h3>
<profile-photo>
  <img src="profile-photo.jpg" alt="Your profile photo" />
</profile-photo>
<button>Upload a new profile photo</button>
```

В примере выше `<profile-photo>` является хост-элементом компонента `ProfilePhoto`.

## Привязка к хост-элементу

Компонент может привязывать свойства, атрибуты, стили и события к своему хост-элементу. Это работает так же, как
привязки к элементам внутри шаблона компонента, но определяется с помощью свойства `host` в декораторе `@Component`:

```angular-ts
@Component({
  ...,
  host: {
    'role': 'slider',
    '[attr.aria-valuenow]': 'value',
    '[class.active]': 'isActive()',
    '[style.background]' : `hasError() ? 'red' : 'green'`,
    '[tabIndex]': 'disabled ? -1 : 0',
    '(keydown)': 'updateValue($event)',
  },
})
export class CustomSlider {
  value: number = 0;
  disabled: boolean = false;
  isActive = signal(false);
  hasError = signal(false);
  updateValue(event: KeyboardEvent) { /* ... */ }

  /* ... */
}
```

## Декораторы `@HostBinding` и `@HostListener`

В качестве альтернативы вы можете выполнить привязку к хост-элементу, применив декораторы `@HostBinding` и
`@HostListener` к членам класса.

`@HostBinding` позволяет привязывать свойства и атрибуты хоста к свойствам и геттерам класса:

```ts
@Component({
  /* ... */
})
export class CustomSlider {
  @HostBinding('attr.aria-valuenow')
  value: number = 0;

  @HostBinding('tabIndex')
  get tabIndex() {
    return this.disabled ? -1 : 0;
  }

  /* ... */
}
```

`@HostListener` позволяет привязывать слушатели событий к хост-элементу. Декоратор принимает имя события и
необязательный массив аргументов:

```ts
export class CustomSlider {
  @HostListener('keydown', ['$event'])
  updateValue(event: KeyboardEvent) {
    /* ... */
  }
}
```

<docs-callout critical title="Отдавайте предпочтение свойству host вместо декораторов">
  **Всегда отдавайте предпочтение использованию свойства `host` вместо `@HostBinding` и `@HostListener`.** Эти декораторы существуют исключительно для обратной совместимости.
</docs-callout>

## Конфликты привязок

Когда вы используете компонент в шаблоне, вы можете добавить привязки к элементу экземпляра этого компонента. Компонент
может _также_ определять хост-привязки для тех же свойств или атрибутов.

```angular-ts
@Component({
  ...,
  host: {
    'role': 'presentation',
    '[id]': 'id',
  }
})
export class ProfilePhoto { /* ... */ }
```

```angular-html
<profile-photo role="group" [id]="otherId" />
```

В таких случаях следующие правила определяют, какое значение победит:

- Если оба значения статические, побеждает привязка экземпляра (в шаблоне).
- Если одно значение статическое, а другое динамическое, побеждает динамическое значение.
- Если оба значения динамические, побеждает хост-привязка компонента.

## Стилизация с помощью пользовательских свойств CSS

Разработчики часто полагаются
на [пользовательские свойства CSS (CSS Custom Properties)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties)
для обеспечения гибкой настройки стилей своих компонентов.
Вы можете установить такие пользовательские свойства на хост-элементе с
помощью [привязки стилей][style binding](guide/templates/binding#css-style-properties).

```angular-ts
@Component({
  /* ... */
  host: {
    '[style.--my-background]': 'color()',
  }
})
export class MyComponent {
  color = signal('lightgreen');
}
```

В этом примере пользовательское CSS-свойство `--my-background` привязано к сигналу `color`. Значение пользовательского
свойства будет автоматически обновляться при каждом изменении сигнала `color`. Это повлияет на текущий компонент и все
его дочерние элементы, которые зависят от этого пользовательского свойства.

### Установка пользовательских свойств на дочерних компонентах

В качестве альтернативы также можно установить пользовательские свойства CSS на хост-элементе дочерних компонентов с
помощью [привязки стилей](guide/templates/binding#css-style-properties).

```angular-ts
@Component({
  selector: 'my-component',
  template: `<my-child [style.--my-background]="color()">`,
})
export class MyComponent {
  color = signal('lightgreen');
}
```

## Внедрение атрибутов хост-элемента

Компоненты и директивы могут считывать статические атрибуты со своего хост-элемента, используя `HostAttributeToken`
вместе с функцией [`inject`](api/core/inject).

```ts
import { Component, HostAttributeToken, inject } from '@angular/core';

@Component({
  selector: 'app-button',
  ...,
})
export class Button {
  variation = inject(new HostAttributeToken('variation'));
}
```

```angular-html
<app-button variation="primary">Click me</app-button>
```

HELPFUL: `HostAttributeToken` выбрасывает ошибку, если атрибут отсутствует, за исключением случаев, когда внедрение
помечено как необязательное.
