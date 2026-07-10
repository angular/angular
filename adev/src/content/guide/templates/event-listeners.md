# Добавление слушателей событий

Angular поддерживает определение слушателей событий на элементе в шаблоне: укажите имя события в круглых скобках вместе со statement, который выполняется каждый раз при возникновении события.

## Прослушивание нативных событий {#listening-to-native-events}

Когда нужно добавить слушатели событий к HTML-элементу, оберните событие в круглые скобки `()` — это позволяет указать listener statement.

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

В этом примере Angular вызывает `updateField` каждый раз, когда элемент `<input>` эмитит событие `keyup`.

Можно добавлять слушатели для любых нативных событий, например: `click`, `keydown`, `mouseover` и т.д. Подробнее — [все доступные события на элементах на MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element#events).

## Доступ к аргументу события {#accessing-the-event-argument}

В каждом слушателе события шаблона Angular предоставляет переменную `$event`, содержащую ссылку на объект события.

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

## Использование key modifiers {#using-key-modifiers}

Когда нужно перехватить конкретные клавиатурные события для конкретной клавиши, можно написать код вроде следующего:

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

Однако, поскольку это распространённый сценарий, Angular позволяет фильтровать события, указав конкретную клавишу через символ точки (`.`). Тогда код упрощается до:

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

Также можно добавить дополнительные key modifiers:

```angular-html
<!-- Matches shift and enter -->
<input type="text" (keyup.shift.enter)="updateField($event)" />
```

Angular поддерживает модификаторы `alt`, `control`, `meta` и `shift`.

Можно указать key или code, к которым нужно привязать клавиатурные события. Поля key и code — нативная часть объекта keyboard event браузера. По умолчанию event binding предполагает использование [Key values for keyboard events](https://developer.mozilla.org/docs/Web/API/UI_Events/Keyboard_event_key_values).

Angular также позволяет указать [Code values for keyboard events](https://developer.mozilla.org/docs/Web/API/UI_Events/Keyboard_event_code_values), предоставив встроенный суффикс `code`.

```angular-html
<!-- Matches alt and left shift -->
<input type="text" (keydown.code.alt.shiftleft)="updateField($event)" />
```

Это полезно для согласованной обработки клавиатурных событий на разных операционных системах. Например, при использовании клавиши Alt на устройствах macOS свойство `key` сообщает клавишу на основе символа, уже изменённого Alt. Это значит, что комбинация вроде Alt + S сообщает значение `key` `'ß'`. Свойство `code`, однако, соответствует нажатой физической или виртуальной кнопке, а не произведённому символу.

## Прослушивание на глобальных targets {#listening-on-global-targets}

Глобальные имена target можно использовать как префикс события. Поддерживаются 3 глобальных target: `window`, `document` и `body`.

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

Если обработчик события должен заменить нативное поведение браузера, можно использовать метод объекта события [`preventDefault`](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault):

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

Если statement обработчика события вычисляется в `false`, Angular автоматически вызывает `preventDefault()`, подобно [нативным атрибутам обработчиков событий](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes#event_handler_attributes). _Всегда предпочитайте явный вызов `preventDefault`_ — так намерение кода очевидно.

## Расширение обработки событий {#extend-event-handling}

Система событий Angular расширяема через кастомные event plugins, зарегистрированные с injection token `EVENT_MANAGER_PLUGINS`.

### Реализация Event Plugin {#implementing-event-plugin}

Чтобы создать кастомный event plugin, расширьте класс `EventManagerPlugin` и реализуйте необходимые методы.

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

Зарегистрируйте кастомный plugin через токен `EVENT_MANAGER_PLUGINS` в провайдерах приложения:

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

После регистрации можно использовать кастомный синтаксис событий в шаблонах, а также со свойством `host`:

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
