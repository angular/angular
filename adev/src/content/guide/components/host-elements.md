# Host-элементы компонентов

TIP: Это руководство предполагает, что вы уже прочитали [Essentials Guide](essentials). Если вы новичок в Angular, начните с него.

Angular создаёт экземпляр компонента для каждого HTML-элемента, соответствующего
selector компонента. DOM-элемент, соответствующий selector компонента, — это **host-элемент** этого компонента.
Содержимое шаблона компонента рендерится внутри его host-элемента.

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

В примере выше `<profile-photo>` — host-элемент компонента `ProfilePhoto`.

## Привязка к host-элементу {#binding-to-the-host-element}

Компонент может привязывать свойства, атрибуты, стили и события к своему host-элементу. Это ведёт себя
идентично привязкам на элементах внутри шаблона компонента, но определяется через
свойство `host` в декораторе `@Component`:

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

NOTE: Глобальные имена target, которыми можно префиксировать имя события: `document:`, `window:` и `body:`.

## Декораторы `@HostBinding` и `@HostListener` {#the-hostbinding-and-hostlistener-decorators}

Альтернативно можно привязаться к host-элементу, применив декораторы `@HostBinding` и `@HostListener`
к членам класса.

`@HostBinding` позволяет привязывать host-свойства и атрибуты к свойствам и getters:

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

`@HostListener` позволяет привязывать слушатели событий к host-элементу. Декоратор принимает имя события
и опциональный массив аргументов:

```ts
export class CustomSlider {
  @HostListener('keydown', ['$event'])
  updateValue(event: KeyboardEvent) {
    /* ... */
  }
}
```

<docs-callout critical title="Prefer using the `host` property over the decorators">
  **Всегда предпочитайте свойство `host` декораторам `@HostBinding` и `@HostListener`.** Эти
декораторы существуют исключительно для обратной совместимости.
</docs-callout>

## Коллизии привязок {#binding-collisions}

Когда вы используете компонент в шаблоне, к элементу экземпляра этого компонента можно добавить привязки.
Компонент может _также_ определять host bindings для тех же свойств или атрибутов.

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

В таких случаях победителя определяют следующие правила:

- Если оба значения статические, побеждает instance binding.
- Если одно значение статическое, а другое динамическое, побеждает динамическое значение.
- Если оба значения динамические, побеждает host binding компонента.

## Стилизация через CSS custom properties {#styling-with-css-custom-properties}

Разработчики часто опираются на [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties) для гибкой конфигурации стилей компонента.
Такие custom properties можно задать на host-элементе через [style binding](guide/templates/binding#css-style-properties).

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

В этом примере CSS custom property `--my-background` привязано к сигналу `color`. Значение custom property автоматически обновится при изменении сигнала `color`. Это затронет текущий компонент и всех его потомков, которые опираются на это custom property.

### Установка custom properties на дочерних компонентах {#setting-custom-properties-on-children-components}

Альтернативно CSS custom properties можно задать на host-элементе дочерних компонентов через [style binding](guide/templates/binding#css-style-properties).

```angular-ts
@Component({
  selector: 'my-component',
  template: `<my-child [style.--my-background]="color()" />`,
})
export class MyComponent {
  color = signal('lightgreen');
}
```

## Внедрение атрибутов host-элемента {#injecting-host-element-attributes}

Компоненты и директивы могут читать статические атрибуты со своего host-элемента, используя `HostAttributeToken` вместе с функцией [`inject`](api/core/inject).

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

HELPFUL: `HostAttributeToken` выбрасывает ошибку, если атрибут отсутствует, если только внедрение не помечено как optional.
