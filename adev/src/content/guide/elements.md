# Обзор Angular elements

_Angular elements_ — это Angular-компоненты, упакованные как _custom elements_ (также называемые Web Components) — веб-стандарт для определения новых HTML-элементов независимо от фреймворка.

[Custom elements](https://developer.mozilla.org/docs/Web/Web_Components/Using_custom_elements) — это функция веб-платформы, доступная во всех браузерах, поддерживаемых Angular.
Custom element расширяет HTML, позволяя определить тег, содержимое которого создаётся и управляется кодом JavaScript.
Браузер поддерживает `CustomElementRegistry` определённых custom elements, который сопоставляет инстанцируемый JavaScript-класс с HTML-тегом.

Пакет `@angular/elements` экспортирует API `createCustomElement()`, который обеспечивает мост между интерфейсом компонента Angular, функциональностью обнаружения изменений и встроенным DOM API.

Преобразование компонента в custom element делает всю необходимую инфраструктуру Angular доступной браузеру.
Создание custom element простое и прямолинейное, и автоматически связывает представление компонента с обнаружением изменений и привязкой данных, сопоставляя функциональность Angular с соответствующими встроенными HTML-эквивалентами.

## Использование custom elements {#using-custom-elements}

Custom elements загружаются самостоятельно — они запускаются при добавлении в DOM и уничтожаются при удалении из DOM.
После добавления custom element на любую страницу он выглядит и ведёт себя как любой другой HTML-элемент и не требует специальных знаний терминологии или соглашений Angular.

Чтобы добавить пакет `@angular/elements` в рабочее пространство, выполните следующую команду:

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm install @angular/elements
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn add @angular/elements
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm add @angular/elements
  </docs-code>
  <docs-code header="bun" language="shell">
    bun add @angular/elements
  </docs-code>
</docs-code-multifile>

### Как это работает {#how-it-works}

Функция `createCustomElement()` преобразует компонент в класс, который можно зарегистрировать в браузере как custom element.
После регистрации настроенного класса в реестре custom elements браузера используйте новый элемент так же, как встроенный HTML-элемент в содержимом, добавляемом напрямую в DOM:

```html
<my-popup message="Use Angular!" />
```

Когда custom element размещается на странице, браузер создаёт экземпляр зарегистрированного класса и добавляет его в DOM.
Содержимое предоставляется шаблоном компонента, который использует синтаксис шаблонов Angular, и рендерится с использованием данных компонента и DOM.
Input-свойства компонента соответствуют input-атрибутам элемента.

## Преобразование компонентов в custom elements {#transforming-components-to-custom-elements}

Angular предоставляет функцию `createCustomElement()` для преобразования Angular-компонента вместе с его зависимостями в custom element.

Процесс преобразования реализует интерфейс `NgElementConstructor` и создаёт
класс-конструктор, настроенный на создание самозагружаемого экземпляра компонента.

Используйте нативную функцию браузера [`customElements.define()`](https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define) для регистрации настроенного конструктора и связанного с ним тега custom element в [`CustomElementRegistry`](https://developer.mozilla.org/docs/Web/API/CustomElementRegistry) браузера.
Когда браузер встречает тег зарегистрированного элемента, он использует конструктор для создания экземпляра custom element.

IMPORTANT: Избегайте использования селектора компонента в качестве имени тега custom element.
Это может привести к неожиданному поведению, поскольку Angular создаёт два экземпляра компонента для одного DOM-элемента:
один обычный Angular-компонент и второй с использованием custom element.

### Сопоставление {#mapping}

Custom element _хостит_ Angular-компонент, обеспечивая мост между данными и логикой, определёнными в компоненте, и стандартными DOM API.
Свойства и логика компонента напрямую сопоставляются с HTML-атрибутами и системой событий браузера.

- API создания анализирует компонент в поисках input-свойств и определяет соответствующие атрибуты для custom element.
  Имена свойств преобразуются для совместимости с custom elements, которые не различают регистр.
  Полученные имена атрибутов используют строчные буквы с дефисами.
  Например, для компонента с `inputProp = input({alias: 'myInputProp'})` соответствующий custom element определяет атрибут `my-input-prop`.

- Output компонента отправляются как HTML [Custom Events](https://developer.mozilla.org/docs/Web/API/CustomEvent), имя custom event совпадает с именем output.
  Например, для компонента с `valueChanged = output()` соответствующий custom element отправляет события с именем «valueChanged», а переданные данные хранятся в свойстве `detail` события.
  Если указан alias, используется это значение; например, `clicks = output<string>({alias: 'myClick'});` приводит к отправке событий с именем «myClick».

Подробнее см. документацию Web Components по [созданию пользовательских событий](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Events#creating_custom_events).

## Пример: сервис Popup {#example-a-popup-service}

Чтобы добавить компонент в приложение во время выполнения, можно [программно отрендерить его](guide/components/programmatic-rendering) с помощью API `createComponent`.
При таком подходе вы отвечаете за окружающую инфраструктуру: присоединение host view компонента к `ApplicationRef` для запуска обнаружения изменений, установку его inputs, подписку на outputs, а также отсоединение и очистку view при удалении компонента.

Использование Angular custom element упрощает и делает прозрачным этот процесс, автоматически предоставляя всю инфраструктуру — достаточно определить нужную обработку событий.

В следующем примере приложения Popup Service определяется компонент, который можно либо загрузить динамически, либо преобразовать в custom element.

| Files              | Details                                                                                                                                                                                                             |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `popup.ts`         | Defines a simple pop-up element that displays an input message, with some animation and styling.                                                                                                                    |
| `popup.service.ts` | Creates an injectable service that provides two different ways to invoke the `Popup`; as a dynamic component, or as a custom element. Notice how much more setup is required for the dynamic-loading method.        |
| `app.ts`           | Defines the application's root component, which uses the `PopupService` to add the pop-up to the DOM at run time. When the application runs, the root component's constructor converts `Popup` to a custom element. |

Для сравнения демо показывает оба метода.
Одна кнопка добавляет popup методом динамической загрузки, другая — через custom element.
Результат одинаковый, но подготовка различается.

<docs-code-multifile>
    <docs-code language="angular-ts" header="popup.ts" path="adev/src/content/examples/elements/src/app/popup.ts"/>
    <docs-code header="popup.service.ts" path="adev/src/content/examples/elements/src/app/popup.service.ts"/>
    <docs-code header="app.ts" path="adev/src/content/examples/elements/src/app/app.ts"/>
</docs-code-multifile>

## Типизация для custom elements {#typings-for-custom-elements}

Общие DOM API, такие как `document.createElement()` или `document.querySelector()`, возвращают тип элемента, соответствующий указанным аргументам.
Например, вызов `document.createElement('a')` возвращает `HTMLAnchorElement`, у которого TypeScript знает о свойстве `href`.
Аналогично, `document.createElement('div')` возвращает `HTMLDivElement`, у которого TypeScript знает, что нет свойства `href`.

При вызове с неизвестными элементами, например именем custom element (`popup-element` в нашем примере), методы возвращают общий тип, например `HTMLElement`, поскольку TypeScript не может вывести правильный тип возвращаемого элемента.

Custom elements, созданные с Angular, расширяют `NgElement` (который в свою очередь расширяет `HTMLElement`).
Кроме того, эти custom elements будут иметь свойство для каждого input соответствующего компонента.
Например, наш `popup-element` имеет свойство `message` типа `string`.

Есть несколько вариантов получить корректные типы для custom elements.
Предположим, вы создаёте custom element `my-dialog` на основе следующего компонента:

```ts
@Component(/* ... */)
class MyDialog {
  content = input('');
}
```

Самый простой способ получить точную типизацию — привести возвращаемое значение соответствующих DOM-методов к правильному типу.
Для этого используйте типы `NgElement` и `WithProperties` (оба экспортируются из `@angular/elements`):

```ts
const aDialog = document.createElement('my-dialog') as NgElement &
  WithProperties<{content: string}>;
aDialog.content = 'Hello, world!';
aDialog.content = 123; // <-- ERROR: TypeScript knows this should be a string.
aDialog.body = 'News'; // <-- ERROR: TypeScript knows there is no `body` property on `aDialog`.
```

Это хороший способ быстро получить возможности TypeScript, такие как проверка типов и автодополнение, для custom element.
Но это может быть громоздко, если нужно в нескольких местах, поскольку приведение типа нужно делать при каждом использовании.

Альтернативный способ, требующий определения типа каждого custom element только один раз, — расширение `HTMLElementTagNameMap`, который TypeScript использует для вывода типа возвращаемого элемента по имени тега (для DOM-методов вроде `document.createElement()`, `document.querySelector()` и т.д.):

```ts

declare global {
  interface HTMLElementTagNameMap {
    'my-dialog': NgElement & WithProperties<{content: string}>;
    'my-other-element': NgElement & WithProperties<{foo: 'bar'}>;
    …
  }
}

```

Теперь TypeScript может вывести правильный тип так же, как для встроенных элементов:

```ts
document.createElement('div'); //--> HTMLDivElement (built-in element)
document.querySelector('foo'); //--> Element        (unknown element)
document.createElement('my-dialog'); //--> NgElement & WithProperties<{content: string}> (custom element)
document.querySelector('my-other-element'); //--> NgElement & WithProperties<{foo: 'bar'}>      (custom element)
```

## Ограничения {#limitations}

Следует быть осторожным при уничтожении и повторном присоединении custom elements, созданных с `@angular/elements`, из-за проблем с callback [disconnect()](https://github.com/angular/angular/issues/38778). Случаи, когда может возникнуть эта проблема:

- Рендеринг компонента в `ng-if` или `ng-repeat` в `AngularJS`
- Ручное отсоединение и повторное присоединение элемента к DOM
