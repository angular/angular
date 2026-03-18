# Host-элементы компонентов

СОВЕТ: Это руководство предполагает, что вы уже ознакомились с [Руководством по основам](essentials). Прочитайте его в первую очередь, если вы новичок в Angular.

Angular создаёт экземпляр компонента для каждого HTML-элемента, соответствующего его
селектору. DOM-элемент, соответствующий селектору компонента, является **host-элементом** этого компонента.
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

В примере выше `<profile-photo>` является host-элементом компонента `ProfilePhoto`.

## Привязка к host-элементу {#binding-to-the-host-element}

Компонент может привязывать свойства, атрибуты, стили и события к своему host-элементу. Это ведёт себя
идентично привязкам для элементов внутри шаблона компонента, но вместо этого определяется через
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

ПРИМЕЧАНИЕ: Глобальные имена целей, которые можно использовать как префикс имени события: `document:`, `window:` и `body:`.

## Декораторы `@HostBinding` и `@HostListener` {#the-hostbinding-and-hostlistener-decorators}

Привязку к host-элементу также можно выполнять с помощью декораторов `@HostBinding` и `@HostListener`,
применяемых к членам класса.

`@HostBinding` позволяет привязывать свойства и атрибуты host-элемента к свойствам и геттерам:

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

`@HostListener` позволяет привязывать обработчики событий к host-элементу. Декоратор принимает имя
события и необязательный массив аргументов:

```ts
export class CustomSlider {
  @HostListener('keydown', ['$event'])
  updateValue(event: KeyboardEvent) {
    /* ... */
  }
}
```

<docs-callout critical title="Предпочитайте свойство `host` вместо декораторов">
  **Всегда предпочитайте свойство `host` использованию `@HostBinding` и `@HostListener`.** Эти
декораторы существуют исключительно для обратной совместимости.
</docs-callout>

## Конфликты привязок {#binding-collisions}

При использовании компонента в шаблоне можно добавить привязки к элементу этого экземпляра компонента.
Компонент _также_ может определять host-привязки для тех же свойств или атрибутов.

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

В таких случаях приоритет определяется следующими правилами:

- Если оба значения статические, побеждает привязка экземпляра.
- Если одно значение статическое, а другое динамическое, побеждает динамическое значение.
- Если оба значения динамические, побеждает host-привязка компонента.

## Стилизация с помощью CSS-переменных {#styling-with-css-custom-properties}

Разработчики часто используют [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties) для гибкой настройки стилей компонента.
Такие пользовательские свойства можно задавать для host-элемента с помощью [привязки стилей](guide/templates/binding#css-style-properties).

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

В этом примере CSS-переменная `--my-background` привязана к сигналу `color`. Значение переменной автоматически обновляется при каждом изменении сигнала `color`. Это затронет текущий компонент и всех его дочерних элементов, использующих данную переменную.

### Установка пользовательских свойств на дочерних компонентах {#setting-custom-properties-on-children-components}

Также можно задавать CSS-переменные на host-элементе дочерних компонентов с помощью [привязки стилей](guide/templates/binding#css-style-properties).

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

Компоненты и директивы могут читать статические атрибуты своего host-элемента с помощью `HostAttributeToken` в сочетании с функцией [`inject`](api/core/inject).

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

ПОЛЕЗНО: `HostAttributeToken` выбрасывает ошибку, если атрибут отсутствует, если только внедрение не помечено как опциональное.
