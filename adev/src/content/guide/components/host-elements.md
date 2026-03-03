# Хост-элементы компонента {#component-host-elements}

TIP: В этом руководстве предполагается, что вы уже ознакомились с [Руководством по основам](essentials). Прочитайте его в первую очередь, если вы новичок в Angular.

Angular создаёт экземпляр компонента для каждого HTML-элемента, соответствующего селектору компонента. DOM-элемент, соответствующий селектору компонента, является **хост-элементом** этого компонента. Содержимое шаблона компонента отображается внутри его хост-элемента.

```angular-ts
// Component source
@Component({
  selector: 'profile-photo',
  template: `<img src="profile-photo.jpg" alt="Your profile photo" />`,
})
export class ProfilePhoto {}
```

```angular-html
<!-- Using the component -->
<h3>Your profile photo</h3>
<profile-photo />
<button>Upload a new profile photo</button>
```

```angular-html
<!-- Rendered DOM -->
<h3>Your profile photo</h3>
<profile-photo>
  <img src="profile-photo.jpg" alt="Your profile photo" />
</profile-photo>
<button>Upload a new profile photo</button>
```

В приведённом выше примере `<profile-photo>` является хост-элементом компонента `ProfilePhoto`.

## Привязка к хост-элементу {#binding-to-the-host-element}

Компонент может привязывать свойства, атрибуты, стили и события к своему хост-элементу. Это работает аналогично привязкам к элементам внутри шаблона компонента, но определяется с помощью свойства `host` в декораторе `@Component`:

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

NOTE: Глобальные целевые имена, которые можно использовать в качестве префикса для имени события: `document:`, `window:` и `body:`.

## Декораторы `@HostBinding` и `@HostListener` {#the-hostbinding-and-hostlistener-decorators}

Вы также можете привязывать данные к хост-элементу, применяя декораторы `@HostBinding` и `@HostListener` к членам класса.

`@HostBinding` позволяет привязывать свойства и атрибуты хоста к свойствам и геттерам:

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

`@HostListener` позволяет привязывать обработчики событий к хост-элементу. Декоратор принимает имя события и необязательный массив аргументов:

```ts
export class CustomSlider {
  @HostListener('keydown', ['$event'])
  updateValue(event: KeyboardEvent) {
    /* ... */
  }
}
```

<docs-callout critical title="Отдавайте предпочтение свойству `host` вместо декораторов">
  **Всегда отдавайте предпочтение свойству `host` вместо `@HostBinding` и `@HostListener`.** Эти декораторы существуют исключительно для обратной совместимости.
</docs-callout>

## Конфликты привязок {#binding-collisions}

Когда вы используете компонент в шаблоне, вы можете добавить привязки к элементу этого экземпляра компонента. Компонент _также_ может определять привязки к хосту для тех же свойств или атрибутов.

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

В таких случаях следующие правила определяют, какое значение будет использовано:

- Если оба значения статические, побеждает привязка экземпляра.
- Если одно значение статическое, а другое динамическое, побеждает динамическое значение.
- Если оба значения динамические, побеждает привязка к хосту компонента.

## Стилизация с помощью пользовательских CSS-свойств {#styling-with-css-custom-properties}

Разработчики часто используют [пользовательские CSS-свойства](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties) для гибкой настройки стилей компонента. Вы можете задать такие пользовательские свойства на хост-элементе с помощью [привязки стилей](guide/templates/binding#css-style-properties).

```angular-ts
@Component({
  /* ... */
  host: {
    '[style.--my-background]': 'color()',
  },
})
export class MyComponent {
  color = signal('lightgreen');
}
```

В этом примере пользовательское CSS-свойство `--my-background` привязано к сигналу `color`. Значение пользовательского свойства будет автоматически обновляться при изменении сигнала `color`. Это повлияет на текущий компонент и все его дочерние элементы, которые зависят от данного пользовательского свойства.

### Установка пользовательских свойств для дочерних компонентов {#setting-custom-properties-on-children-components}

Также можно задавать пользовательские CSS-свойства на хост-элементе дочерних компонентов с помощью [привязки стилей](guide/templates/binding#css-style-properties).

```angular-ts
@Component({
  selector: 'my-component',
  template: `<my-child [style.--my-background]="color()" />`,
})
export class MyComponent {
  color = signal('lightgreen');
}
```

## Внедрение атрибутов хост-элемента {#injecting-host-element-attributes}

Компоненты и директивы могут читать статические атрибуты своего хост-элемента, используя `HostAttributeToken` вместе с функцией [`inject`](api/core/inject).

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

HELPFUL: `HostAttributeToken` вызывает ошибку, если атрибут отсутствует, за исключением случаев, когда внедрение помечено как необязательное.
