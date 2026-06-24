# Добавление прослушивателей событий

Angular позволяет определять прослушиватели событий для элементов шаблона. Для этого имя события указывается в круглых
скобках вместе с инструкцией, которая выполняется при каждом наступлении события.

## Прослушивание нативных событий

Чтобы добавить прослушиватель событий к HTML-элементу, заключите имя события в круглые скобки `()`. Это позволит указать
инструкцию для обработки события.

```angular-ts
@Component({
  template: `
    <input type="text" (keyup)="updateField()" />
  `,
  ...
})
export class AppComponent{
  updateField(): void {
    console.log('Field is updated!');
  }
}
```

В этом примере Angular вызывает `updateField` каждый раз, когда элемент `<input>` генерирует событие `keyup`.

Вы можете добавлять прослушиватели для любых нативных событий, таких как: `click`, `keydown`, `mouseover` и т.д. Чтобы
узнать больше, ознакомьтесь
со [всеми доступными событиями элементов на MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element#events).

## Доступ к аргументу события

В каждом прослушивателе событий в шаблоне Angular предоставляет переменную `$event`, содержащую ссылку на объект
события.

```angular-ts
@Component({
  template: `
    <input type="text" (keyup)="updateField($event)" />
  `,
  ...
})
export class AppComponent {
  updateField(event: KeyboardEvent): void {
    console.log(`The user pressed: ${event.key}`);
  }
}
```

## Использование модификаторов клавиш

Если нужно перехватить события клавиатуры для конкретной клавиши, можно написать следующий код:

```angular-ts
@Component({
  template: `
    <input type="text" (keyup)="updateField($event)" />
  `,
  ...
})
export class AppComponent {
  updateField(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      console.log('The user pressed enter in the text field.');
    }
  }
}
```

Однако, поскольку это распространенный сценарий, Angular позволяет фильтровать события, указывая конкретную клавишу
через точку (`.`). Это позволяет упростить код:

```angular-ts
@Component({
  template: `
    <input type="text" (keyup.enter)="updateField($event)" />
  `,
  ...
})
export class AppComponent{
  updateField(event: KeyboardEvent): void {
    console.log('The user pressed enter in the text field.');
  }
}
```

Вы также можете добавить дополнительные модификаторы клавиш:

```angular-html
<!-- Соответствует нажатию shift и enter -->
<input type="text" (keyup.shift.enter)="updateField($event)" />
```

Angular поддерживает модификаторы `alt`, `control`, `meta` и `shift`.

Вы можете указать `key` или `code`, которые хотите привязать к событиям клавиатуры. Поля `key` и `code` являются
нативной частью объекта события клавиатуры браузера. По умолчанию привязка событий предполагает
использование [значений Key для событий клавиатуры](https://developer.mozilla.org/docs/Web/API/UI_Events/Keyboard_event_key_values).

Angular также позволяет
указывать [значения Code для событий клавиатуры](https://developer.mozilla.org/docs/Web/API/UI_Events/Keyboard_event_code_values),
используя встроенный суффикс `code`.

```angular-html
<!-- Соответствует нажатию alt и левого shift -->
<input type="text" (keydown.code.alt.shiftleft)="updateField($event)" />
```

Это может быть полезно для единообразной обработки событий клавиатуры в разных операционных системах. Например, при
использовании клавиши Alt на устройствах MacOS свойство `key` сообщает клавишу с учетом символа, измененного нажатием
Alt. Это означает, что комбинация Alt + S вернет значение `key`, равное `'ß'`. Однако свойство `code` соответствует
нажатой физической или виртуальной кнопке, а не полученному символу.

## Предотвращение стандартного поведения события

Если обработчик события должен заменить стандартное поведение браузера, можно использовать [метод
`preventDefault`](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault) объекта события:

```angular-ts
@Component({
  template: `
    <a href="#overlay" (click)="showOverlay($event)">
  `,
  ...
})
export class AppComponent{
  showOverlay(event: PointerEvent): void {
    event.preventDefault();
    console.log('Show overlay without updating the URL!');
  }
}
```

Если выражение обработчика события вычисляется как `false`, Angular автоматически вызывает `preventDefault()`,
подобно [атрибутам нативных обработчиков событий](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes#event_handler_attributes).
_Всегда отдавайте предпочтение явному вызову `preventDefault`_, так как этот подход делает намерения кода очевидными.

## Расширение обработки событий

Система событий Angular расширяема с помощью пользовательских плагинов событий, зарегистрированных через токен внедрения
`EVENT_MANAGER_PLUGINS`.

### Реализация плагина событий

Чтобы создать пользовательский плагин событий, расширьте класс `EventManagerPlugin` и реализуйте необходимые методы.

```ts
import { Injectable } from '@angular/core';
import { EventManagerPlugin } from '@angular/platform-browser';

@Injectable()
export class DebounceEventPlugin extends EventManagerPlugin {
  constructor() {
    super(document);
  }

  // Определяем, какие события поддерживает этот плагин
  override supports(eventName: string) {
    return /debounce/.test(eventName);
  }

  // Обрабатываем регистрацию события
  override addEventListener(
    element: HTMLElement,
    eventName: string,
    handler: Function
  ) {
    // Парсим событие: например, "click.debounce.500"
    // событие: "click", задержка: 500
    const [event, method , delay = 300 ] = eventName.split('.');

    let timeoutId: number;

    const listener = (event: Event) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
          handler(event);
      }, delay);
    };

    element.addEventListener(event, listener);

    // Возвращаем функцию очистки
    return () => {
      clearTimeout(timeoutId);
      element.removeEventListener(event, listener);
    };
  }
}
```

Зарегистрируйте свой пользовательский плагин, используя токен `EVENT_MANAGER_PLUGINS` в провайдерах вашего приложения:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { DebounceEventPlugin } from './debounce-event-plugin';

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: EVENT_MANAGER_PLUGINS,
      useClass: DebounceEventPlugin,
      multi: true
    }
  ]
});
```

После регистрации вы можете использовать синтаксис вашего пользовательского события в шаблонах, а также в свойстве
`host`:

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
