<docs-decorative-header title="Встроенные директивы" imgSrc="adev/src/assets/images/directives.svg"> <!-- markdownlint-disable-line -->
Директивы — это классы, добавляющие дополнительное поведение элементам в ваших Angular-приложениях.
</docs-decorative-header>

Используйте встроенные директивы Angular для управления формами, списками, стилями и тем, что видят пользователи.

Типы директив Angular:

| Типы директив                                                    | Подробности                                                                                        |
| :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| [Компоненты](guide/components)                                   | Используются с шаблоном. Это наиболее распространённый тип директив.                               |
| [Директивы атрибута](#built-in-attribute-directives)             | Изменяют внешний вид или поведение элемента, компонента или другой директивы.                      |
| [Структурные директивы](/guide/directives/structural-directives) | Изменяют структуру DOM, добавляя и удаляя DOM-элементы.                                            |

Это руководство охватывает встроенные [директивы атрибута](#built-in-attribute-directives).

## Встроенные директивы атрибута {#built-in-attribute-directives}

Директивы атрибута прослушивают и изменяют поведение других HTML-элементов, атрибутов, свойств и компонентов.

Наиболее распространённые директивы атрибута:

| Распространённые директивы                                     | Подробности                                                  |
| :------------------------------------------------------------- | :----------------------------------------------------------- |
| [`NgClass`](#adding-and-removing-classes-with-ngclass)         | Добавляет и удаляет набор CSS-классов.                       |
| [`NgStyle`](#setting-inline-styles-with-ngstyle)               | Добавляет и удаляет набор HTML-стилей.                       |
| [`NgModel`](guide/forms/template-driven-forms)                 | Добавляет двустороннюю привязку данных к HTML-элементу формы.|

HELPFUL: Встроенные директивы используют только публичные API. Они не имеют специального доступа к приватным API, недоступным другим директивам.

## Добавление и удаление классов с помощью `NgClass` {#adding-and-removing-classes-with-ngclass}

Добавляйте или удаляйте несколько CSS-классов одновременно с помощью `ngClass`.

HELPFUL: Для добавления или удаления _одного_ класса используйте [привязку класса](/guide/templates/binding#css-class-and-style-property-bindings) вместо `NgClass`.

### Импортирование `NgClass` в компонент {#import-ngclass-in-the-component}

Чтобы использовать `NgClass`, добавьте его в список `imports` компонента.

```angular-ts
import {NgClass} from '@angular/common';

@Component({
  /* ... */
  imports: [NgClass],
})
export class AppComponent {}
```

### Использование `NgClass` с выражением {#using-ngclass-with-an-expression}

На элементе, который нужно стилизовать, добавьте `[ngClass]` и установите его равным выражению.
В данном случае `isSpecial` — это булево значение, установленное в `true` в `app.component.ts`.
Поскольку `isSpecial` равно true, `ngClass` применяет класс `special` к элементу `<div>`.

<docs-code header="app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" region="special-div"/>

### Использование `NgClass` с методом {#using-ngclass-with-a-method}

1. Чтобы использовать `NgClass` с методом, добавьте метод в класс компонента.
   В следующем примере `setCurrentClasses()` устанавливает свойство `currentClasses` с объектом, который добавляет или удаляет три класса в зависимости от состояния `true` или `false` трёх других свойств компонента.

   Каждый ключ объекта — это имя CSS-класса.
   Если ключ равен `true`, `ngClass` добавляет класс.
   Если ключ равен `false`, `ngClass` удаляет класс.

   <docs-code header="app.component.ts" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" region="setClasses"/>

1. В шаблоне добавьте привязку свойства `ngClass` к `currentClasses` для установки классов элемента:

   <docs-code header="app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" region="NgClass-1"/>

В этом случае Angular применяет классы при инициализации и при изменениях, вызванных переназначением объекта `currentClasses`.
В полном примере `setCurrentClasses()` вызывается изначально с `ngOnInit()` и когда пользователь нажимает кнопку `Refresh currentClasses`.
Эти шаги не обязательны для реализации `ngClass`.

## Установка инлайн-стилей с помощью `NgStyle` {#setting-inline-styles-with-ngstyle}

HELPFUL: Для добавления или удаления _одного_ стиля используйте [привязку стиля](guide/templates/binding#css-class-and-style-property-bindings) вместо `NgStyle`.

### Импортирование `NgStyle` в компонент {#import-ngstyle-in-the-component}

Чтобы использовать `NgStyle`, добавьте его в список `imports` компонента.

```angular-ts
import {NgStyle} from '@angular/common';

@Component({
  /* ... */
  imports: [NgStyle],
})
export class AppComponent {}
```

Используйте `NgStyle` для одновременной установки нескольких инлайн-стилей в зависимости от состояния компонента.

1. Чтобы использовать `NgStyle`, добавьте метод в класс компонента.

   В следующем примере `setCurrentStyles()` устанавливает свойство `currentStyles` с объектом, определяющим три стиля на основе состояния трёх других свойств компонента.

   <docs-code header="app.component.ts" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" region="setStyles"/>

1. Чтобы установить стили элемента, добавьте привязку свойства `ngStyle` к `currentStyles`.

   <docs-code header="app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" region="NgStyle-2"/>

В этом случае Angular применяет стили при инициализации и при изменениях.
Для этого в полном примере `setCurrentStyles()` вызывается изначально с `ngOnInit()` и при изменении зависимых свойств по нажатию кнопки.
Однако эти шаги не обязательны для реализации `ngStyle` самостоятельно.

## Размещение директивы без DOM-элемента {#hosting-a-directive-without-a-dom-element}

Angular `<ng-container>` — это группирующий элемент, не мешающий стилям или макету, поскольку Angular не помещает его в DOM.

Используйте `<ng-container>`, когда нет единого элемента для размещения директивы.

Вот условный абзац с использованием `<ng-container>`.

<docs-code header="app.component.html (ngif-ngcontainer)" path="adev/src/content/examples/structural-directives/src/app/app.component.html" region="ngif-ngcontainer"/>

<img alt="ngcontainer paragraph with proper style" src="assets/images/guide/structural-directives/good-paragraph.png">

1. Импортируйте директиву `ngModel` из `FormsModule`.

1. Добавьте `FormsModule` в раздел imports соответствующего Angular-модуля.

1. Чтобы условно исключить `<option>`, оберните `<option>` в `<ng-container>`.

   <docs-code header="app.component.html (select-ngcontainer)" path="adev/src/content/examples/structural-directives/src/app/app.component.html" region="select-ngcontainer"/>

   <img alt="ngcontainer options work properly" src="assets/images/guide/structural-directives/select-ngcontainer-anim.gif">

## Что дальше {#whats-next}

<docs-pill-row>
  <docs-pill href="guide/directives/attribute-directives" title="Директивы атрибута"/>
  <docs-pill href="guide/directives/structural-directives" title="Структурные директивы"/>
  <docs-pill href="guide/directives/directive-composition-api" title="API композиции директив"/>
</docs-pill-row>
