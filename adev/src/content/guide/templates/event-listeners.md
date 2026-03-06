# Добавление обработчиков событий {#adding-event-listeners}

Angular поддерживает определение обработчиков событий на элементах в шаблоне путем указания имени события в круглых скобках вместе с инструкцией, которая выполняется при каждом возникновении события.

## Прослушивание нативных событий {#listening-to-native-events}

Для добавления обработчиков событий к HTML-элементу имя события оборачивается в круглые скобки `()`, что позволяет указать инструкцию-обработчик.

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

Вы можете добавлять обработчики для любых нативных событий, таких как: `click`, `keydown`, `mouseover` и т.д. Для получения дополнительной информации см. [все доступные события элементов на MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element#events).

## Доступ к аргументу события {#accessing-the-event-argument}

В каждом обработчике событий шаблона Angular предоставляет переменную с именем `$event`, которая содержит ссылку на объект события.

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

Когда необходимо перехватывать определенные события клавиатуры для конкретной клавиши, можно написать примерно такой код:

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

Однако, поскольку это распространенный сценарий, Angular позволяет фильтровать события, указывая конкретную клавишу с помощью символа точки (`.`). Благодаря этому код можно упростить:

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

Вы также можете добавить дополнительные модификаторы клавиш:

```angular-html
<!-- Matches shift and enter -->
<input type="text" (keyup.shift.enter)="updateField($event)" />
```

Angular поддерживает модификаторы `alt`, `control`, `meta` и `shift`.

Вы можете указать клавишу (key) или код (code), к которым хотите привязать события клавиатуры. Поля key и code являются нативной частью объекта события клавиатуры браузера. По умолчанию привязка событий использует [значения Key для событий клавиатуры](https://developer.mozilla.org/docs/Web/API/UI_Events/Keyboard_event_key_values).

Angular также позволяет указывать [значения Code для событий клавиатуры](https://developer.mozilla.org/docs/Web/API/UI_Events/Keyboard_event_code_values) с помощью встроенного суффикса `code`.

```angular-html
<!-- Matches alt and left shift -->
<input type="text" (keydown.code.alt.shiftleft)="updateField($event)" />
```

Это может быть полезно для единообразной обработки событий клавиатуры на разных операционных системах. Например, при использовании клавиши Alt на устройствах MacOS свойство `key` сообщает клавишу, уже модифицированную клавишей Alt. Это означает, что комбинация Alt + S сообщает значение `key` равное `'ß'`. Свойство `code`, однако, соответствует физической или виртуальной нажатой кнопке, а не сгенерированному символу.

## Прослушивание глобальных целей {#listening-on-global-targets}

Имена глобальных целей могут использоваться в качестве префикса для события. Поддерживаются 3 глобальные цели: `window`, `document` и `body`.

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

## Предотвращение стандартного поведения события {#preventing-event-default-behavior}

Если обработчик события должен заменить стандартное поведение браузера, можно использовать метод [`preventDefault`](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault) объекта события:

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

Если инструкция обработчика события вычисляется в `false`, Angular автоматически вызывает `preventDefault()`, аналогично [нативным атрибутам обработчиков событий](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes#event_handler_attributes). _Всегда предпочитайте явный вызов `preventDefault`_, так как такой подход делает намерение кода очевидным.

## Расширение обработки событий {#extend-event-handling}

Система событий Angular расширяема через пользовательские плагины событий, зарегистрированные с помощью токена внедрения `EVENT_MANAGER_PLUGINS`.

### Реализация плагина событий {#implementing-event-plugin}

Для создания пользовательского плагина событий наследуйте класс `EventManagerPlugin` и реализуйте необходимые методы.

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

Зарегистрируйте пользовательский плагин с помощью токена `EVENT_MANAGER_PLUGINS` в провайдерах вашего приложения:

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

После регистрации вы можете использовать пользовательский синтаксис событий в шаблонах, а также в свойстве `host`:

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
