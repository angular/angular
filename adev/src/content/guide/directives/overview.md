<docs-decorative-header title="Встроенные директивы" imgSrc="adev/src/assets/images/directives.svg"> <!-- markdownlint-disable-line -->
Директивы — это классы, которые добавляют дополнительное поведение элементам в приложениях Angular.
</docs-decorative-header>

Используйте встроенные директивы Angular для управления формами, списками, стилями и тем, что видит пользователь.

Типы директив Angular:

| Тип директивы                                                    | Подробности                                                                           |
| :--------------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| [Компоненты](guide/components)                                   | Используются с шаблоном. Самый распространённый тип директивы.                        |
| [Attribute-директивы](#built-in-attribute-directives)           | Изменяют внешний вид или поведение элемента, компонента или другой директивы.         |
| [Структурные директивы](/guide/directives/structural-directives) | Изменяют раскладку DOM, добавляя и удаляя DOM-элементы.                               |

Это руководство охватывает встроенные [attribute-директивы](#built-in-attribute-directives).

## Встроенные attribute-директивы {#built-in-attribute-directives}

Attribute-директивы слушают и изменяют поведение других HTML-элементов, атрибутов, свойств и компонентов.

Самые распространённые attribute-директивы:

| Распространённые директивы                             | Подробности                                            |
| :----------------------------------------------------- | :----------------------------------------------------- |
| [`NgClass`](#adding-and-removing-classes-with-ngclass) | Добавляет и удаляет набор CSS-классов.                 |
| [`NgStyle`](#setting-inline-styles-with-ngstyle)       | Добавляет и удаляет набор HTML-стилей.                 |
| [`NgModel`](guide/forms/template-driven-forms)         | Добавляет двустороннюю привязку данных к элементу HTML-формы. |

HELPFUL: Встроенные директивы используют только публичные API. У них нет особого доступа к приватным API, недоступным другим директивам.

## Добавление и удаление классов с `NgClass` {#adding-and-removing-classes-with-ngclass}

Добавляйте или удаляйте несколько CSS-классов одновременно с помощью `ngClass`.

HELPFUL: Чтобы добавить или удалить _один_ класс, используйте [привязку class](/guide/templates/binding#css-class-and-style-property-bindings), а не `NgClass`.

### Импорт `NgClass` в компонент {#import-ngclass-in-the-component}

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

На элементе, который нужно стилизовать, добавьте `[ngClass]` и приравняйте его к выражению.
В этом случае `isSpecial` — boolean, установленный в `true` в `app.component.ts`.
Поскольку `isSpecial` равен true, `ngClass` применяет класс `special` к `<div>`.

<docs-code header="app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" region="special-div"/>

### Использование `NgClass` с методом {#using-ngclass-with-a-method}

1. Чтобы использовать `NgClass` с методом, добавьте метод в класс компонента.
   В следующем примере `setCurrentClasses()` задаёт свойство `currentClasses` объектом, который добавляет или удаляет три класса в зависимости от состояния `true` или `false` трёх других свойств компонента.

   Каждый ключ объекта — имя CSS-класса.
   Если ключ `true`, `ngClass` добавляет класс.
   Если ключ `false`, `ngClass` удаляет класс.

   <docs-code header="app.component.ts" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" region="setClasses"/>

1. В шаблоне добавьте привязку свойства `ngClass` к `currentClasses`, чтобы задать классы элемента:

   <docs-code header="app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" region="NgClass-1"/>

В этом сценарии Angular применяет классы при инициализации и при изменениях, вызванных переназначением объекта `currentClasses`.
Полный пример вызывает `setCurrentClasses()` изначально через `ngOnInit()` при клике пользователя на кнопку `Refresh currentClasses`.
Эти шаги не обязательны для реализации `ngClass`.

## Задание inline-стилей с `NgStyle` {#setting-inline-styles-with-ngstyle}

HELPFUL: Чтобы добавить или удалить _один_ стиль, используйте [привязки style](guide/templates/binding#css-class-and-style-property-bindings), а не `NgStyle`.

### Импорт `NgStyle` в компонент {#import-ngstyle-in-the-component}

Чтобы использовать `NgStyle`, добавьте его в список `imports` компонента.

```angular-ts
import {NgStyle} from '@angular/common';

@Component({
  /* ... */
  imports: [NgStyle],
})
export class AppComponent {}
```

Используйте `NgStyle`, чтобы одновременно задавать несколько inline-стилей в зависимости от состояния компонента.

1. Чтобы использовать `NgStyle`, добавьте метод в класс компонента.

   В следующем примере `setCurrentStyles()` задаёт свойство `currentStyles` объектом, определяющим три стиля на основе состояния трёх других свойств компонента.

   <docs-code header="app.component.ts" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" region="setStyles"/>

1. Чтобы задать стили элемента, добавьте привязку свойства `ngStyle` к `currentStyles`.

   <docs-code header="app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" region="NgStyle-2"/>

В этом сценарии Angular применяет стили при инициализации и при изменениях.
Для этого полный пример вызывает `setCurrentStyles()` изначально через `ngOnInit()` и при изменении зависимых свойств по клику на кнопку.
Однако эти шаги не обязательны для реализации самого `ngStyle`.

## Что дальше {#whats-next}

<docs-pill-row>
  <docs-pill href="guide/directives/attribute-directives" title="Attribute Directives"/>
  <docs-pill href="guide/directives/structural-directives" title="Structural Directives"/>
  <docs-pill href="guide/directives/directive-composition-api" title="Directive composition API"/>
</docs-pill-row>
