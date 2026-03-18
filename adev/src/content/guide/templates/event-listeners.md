# Добавление обработчиков событий {#adding-event-listeners}

Angular поддерживает определение обработчиков событий на элементах шаблона путём указания имени события в скобках и оператора, выполняемого при каждом возникновении события.

## Прослушивание нативных событий {#listening-to-native-events}

Чтобы добавить обработчики событий на HTML-элемент, событие оборачивается в круглые скобки `()`, позволяя указать оператор-обработчик.

```angular-ts
@Component({
  template: `
    <input type="text" (keyup)="updateField()" />
  `,
  ...
})
export class App{
  updateField(): void {
    console.log('Field is updated!');
  }
}
```

В этом примере Angular вызывает `updateField` каждый раз, когда элемент `<input>` генерирует событие `keyup`.

Можно добавлять обработчики любых нативных событий, таких как `click`, `keydown`, `mouseover` и др. Подробнее см. в разделе [все доступные события элементов на MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element#events).

## Доступ к аргументу события {#accessing-the-event-argument}

В каждом обработчике событий шаблона Angular предоставляет переменную `$event`, содержащую ссылку на объект события.

```angular-ts
@Component({
  template: `
    <input type="text" (keyup)="updateField($event)" />
  `,
  ...
})
export class App {
  updateField(event: KeyboardEvent): void {
    console.log(`The user pressed: ${event.key}`);
  }
}
```

## Использование модификаторов клавиш {#using-key-modifiers}

Для перехвата конкретных событий клавиатуры для определённой клавиши можно написать код наподобие следующего:

```angular-ts
@Component({
  template: `
    <input type="text" (keyup)="updateField($event)" />
  `,
  ...
})
export class App {
  updateField(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      console.log('The user pressed enter in the text field.');
    }
  }
}
```

Однако, поскольку это распространённый сценарий, Angular позволяет фильтровать события, указывая конкретную клавишу с помощью символа точки (`.`). Благодаря этому код можно упростить:

```angular-ts
@Component({
  template: `
    <input type="text" (keyup.enter)="updateField($event)" />
  `,
  ...
})
export class App{
  updateField(event: KeyboardEvent): void {
    console.log('The user pressed enter in the text field.');
  }
}
```

Можно также добавлять дополнительные модификаторы клавиш:

```angular-html
<!-- Matches shift and enter -->
<input type="text" (keyup.shift.enter)="updateField($event)" />
```

Angular поддерживает модификаторы `alt`, `control`, `meta` и `shift`.

Можно указать клавишу или код, к которому нужно привязать события клавиатуры. Поля `key` и `code` являются нативной частью объекта события клавиатуры браузера. По умолчанию привязка событий предполагает использование [значений Key для событий клавиатуры](https://developer.mozilla.org/docs/Web/API/UI_Events/Keyboard_event_key_values).

Angular также позволяет указывать [значения Code для событий клавиатуры](https://developer.mozilla.org/docs/Web/API/UI_Events/Keyboard_event_code_values) с помощью встроенного суффикса `code`.

```angular-html
<!-- Matches alt and left shift -->
<input type="text" (keydown.code.alt.shiftleft)="updateField($event)" />
```

Это может быть полезно для единообразной обработки событий клавиатуры в разных операционных системах. Например, при использовании клавиши Alt на устройствах macOS свойство `key` сообщает клавишу с учётом изменения, внесённого Alt. Это означает, что сочетание Alt + S сообщает значение `key` равное `'ß'`. Однако свойство `code` соответствует физической или виртуальной нажатой кнопке, а не произведённому символу.

## Прослушивание глобальных целей {#listening-on-global-targets}

Глобальные имена целей можно использовать в качестве префикса события. Поддерживаются 3 глобальные цели: `window`, `document` и `body`.

```angular-ts
@Component({
  /* ... */
  host: {
    'window:click': 'onWindowClick()',
    'document:click': 'onDocumentClick()',
    'body:click': 'onBodyClick()',
  },
})
export class MyView {}
```

## Предотвращение поведения события по умолчанию {#preventing-event-default-behavior}

Если обработчик события должен заменить нативное поведение браузера, можно использовать метод [`preventDefault`](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault) объекта события:

```angular-ts
@Component({
  template: `
    <a href="#overlay" (click)="showOverlay($event)">
  `,
  ...
})
export class App{
  showOverlay(event: PointerEvent): void {
    event.preventDefault();
    console.log('Show overlay without updating the URL!');
  }
}
```

Если оператор обработчика события принимает значение `false`, Angular автоматически вызывает `preventDefault()`, аналогично [нативным атрибутам обработчиков событий](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes#event_handler_attributes). _Всегда предпочтительнее явно вызывать `preventDefault`_, поскольку такой подход делает намерение кода очевидным.

## Расширение обработки событий {#extend-event-handling}

Система событий Angular расширяема через пользовательские плагины событий, регистрируемые с помощью токена внедрения `EVENT_MANAGER_PLUGINS`.

### Реализация плагина событий {#implementing-event-plugin}

Для создания пользовательского плагина событий расширьте класс `EventManagerPlugin` и реализуйте необходимые методы.

```ts
import {Injectable} from '@angular/core';
import {EventManagerPlugin} from '@angular/platform-browser';

@Injectable()
export class DebounceEventPlugin extends EventManagerPlugin {
  constructor() {
    super(document);
  }

  // Define which events this plugin supports
  override supports(eventName: string) {
    return /debounce/.test(eventName);
  }

  // Handle the event registration
  override addEventListener(element: HTMLElement, eventName: string, handler: Function) {
    // Parse the event: e.g., "click.debounce.500"
    // event: "click", delay: 500
    const [event, method, delay = 300] = eventName.split('.');

    let timeoutId: number;

    const listener = (event: Event) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handler(event);
      }, delay);
    };

    element.addEventListener(event, listener);

    // Return cleanup function
    return () => {
      clearTimeout(timeoutId);
      element.removeEventListener(event, listener);
    };
  }
}
```

Зарегистрируйте пользовательский плагин с помощью токена `EVENT_MANAGER_PLUGINS` в провайдерах приложения:

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {EVENT_MANAGER_PLUGINS} from '@angular/platform-browser';
import {App} from './app';
import {DebounceEventPlugin} from './debounce-event-plugin';

bootstrapApplication(App, {
  providers: [
    {
      provide: EVENT_MANAGER_PLUGINS,
      useClass: DebounceEventPlugin,
      multi: true,
    },
  ],
});
```

После регистрации пользовательский синтаксис событий можно использовать в шаблонах, а также со свойством `host`:

```angular-ts
@Component({
  template: `
    <input
      type="text"
      (input.debounce.500)="onSearch($event.target.value)"
      placeholder="Search..."
    />
  `,
  ...
})
export class Search {
 onSearch(query: string): void {
    console.log('Searching for:', query);
  }
}
```

```ts
@Component({
  ...,
  host: {
    '(click.debounce.500)': 'handleDebouncedClick()',
  },
})
export class AwesomeCard {
  handleDebouncedClick(): void {
   console.log('Debounced click!');
  }
}
```
