<docs-decorative-header title="Встроенные директивы" imgSrc="adev/src/assets/images/directives.svg"> <!-- markdownlint-disable-line -->
Директивы — это классы, добавляющие дополнительное поведение элементам Angular-приложений.
</docs-decorative-header>

Используйте встроенные директивы Angular для управления формами, списками, стилями и отображаемым содержимым.

Типы директив Angular:

| Типы директив                                                           | Описание                                                                                     |
| :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| [Компоненты](guide/components)                                          | Используются вместе с шаблоном. Наиболее распространённый тип директив.                      |
| [Атрибутные директивы](#built-in-attribute-directives)                  | Изменяют внешний вид или поведение элемента, компонента или другой директивы.                |
| [Структурные директивы](/guide/directives/structural-directives)        | Изменяют структуру DOM, добавляя и удаляя DOM-элементы.                                      |

В этом руководстве рассматриваются встроенные [атрибутные директивы](#built-in-attribute-directives).

## Встроенные атрибутные директивы {#built-in-attribute-directives}

Атрибутные директивы отслеживают и изменяют поведение других HTML-элементов, атрибутов, свойств и компонентов.

Наиболее распространённые атрибутные директивы:

| Директивы                                                      | Описание                                                   |
| :------------------------------------------------------------- | :--------------------------------------------------------- |
| [`NgClass`](#adding-and-removing-classes-with-ngclass)         | Добавляет и удаляет набор CSS-классов.                     |
| [`NgStyle`](#setting-inline-styles-with-ngstyle)               | Добавляет и удаляет набор HTML-стилей.                     |
| [`NgModel`](guide/forms/template-driven-forms)                 | Добавляет двустороннюю привязку данных к элементу формы.   |

HELPFUL: Встроенные директивы используют только публичные API и не имеют доступа к каким-либо приватным API.

## Добавление и удаление классов с помощью `NgClass` {#adding-and-removing-classes-with-ngclass}

Одновременно добавляйте или удаляйте несколько CSS-классов с помощью `ngClass`.

HELPFUL: Для добавления или удаления _одного_ класса используйте [привязку классов](/guide/templates/binding#css-class-and-style-property-bindings) вместо `NgClass`.

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

На элементе, который нужно стилизовать, добавьте `[ngClass]` и присвойте ему выражение.
В данном примере `isSpecial` — это булево значение, равное `true` в `app.component.ts`.
Так как `isSpecial` равно `true`, `ngClass` применяет класс `special` к элементу `<div>`.

<docs-code header="app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" region="special-div"/>

### Использование `NgClass` с методом {#using-ngclass-with-a-method}

1. Для использования `NgClass` с методом добавьте метод в класс компонента.
   В следующем примере `setCurrentClasses()` устанавливает свойство `currentClasses` объектом, который добавляет или удаляет три класса в зависимости от состояния трёх других свойств компонента (`true` или `false`).

   Каждый ключ объекта — это имя CSS-класса.
   Если ключ равен `true`, `ngClass` добавляет класс.
   Если ключ равен `false`, `ngClass` удаляет класс.

   <docs-code header="app.component.ts" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" region="setClasses"/>

1. В шаблоне добавьте привязку свойства `ngClass` к `currentClasses`, чтобы задать классы элемента:

   <docs-code header="app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" region="NgClass-1"/>

В этом случае Angular применяет классы при инициализации и при изменениях, вызванных переприсвоением объекта `currentClasses`.
Полный пример вызывает `setCurrentClasses()` изначально через `ngOnInit()`, а также при нажатии кнопки `Refresh currentClasses`.
Эти шаги не обязательны для работы `ngClass`.

## Установка встроенных стилей с помощью `NgStyle` {#setting-inline-styles-with-ngstyle}

HELPFUL: Для добавления или удаления _одного_ стиля используйте [привязку стилей](guide/templates/binding#css-class-and-style-property-bindings) вместо `NgStyle`.

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

Используйте `NgStyle` для одновременной установки нескольких встроенных стилей в зависимости от состояния компонента.

1. Для использования `NgStyle` добавьте метод в класс компонента.

   В следующем примере `setCurrentStyles()` устанавливает свойство `currentStyles` объектом, определяющим три стиля на основе состояния трёх других свойств компонента.

   <docs-code header="app.component.ts" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" region="setStyles"/>

1. Чтобы задать стили элемента, добавьте привязку свойства `ngStyle` к `currentStyles`.

   <docs-code header="app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" region="NgStyle-2"/>

В этом случае Angular применяет стили при инициализации и при изменениях.
Для этого полный пример вызывает `setCurrentStyles()` изначально через `ngOnInit()` и при изменении зависимых свойств по нажатию кнопки.
Однако эти шаги не обязательны для самостоятельного использования `ngStyle`.

## Размещение директивы без DOM-элемента {#hosting-a-directive-without-a-dom-element}

`<ng-container>` в Angular — это группирующий элемент, не влияющий на стили и макет, поскольку Angular не добавляет его в DOM.

Используйте `<ng-container>`, когда нет единственного элемента для размещения директивы.

Ниже показан условный параграф с использованием `<ng-container>`.

<docs-code header="app.component.html (ngif-ngcontainer)" path="adev/src/content/examples/structural-directives/src/app/app.component.html" region="ngif-ngcontainer"/>

<img alt="ngcontainer paragraph with proper style" src="assets/images/guide/structural-directives/good-paragraph.png">

1. Импортируйте директиву `ngModel` из `FormsModule`.

1. Добавьте `FormsModule` в секцию `imports` соответствующего Angular-модуля.

1. Чтобы условно исключить элемент `<option>`, оберните его в `<ng-container>`.

   <docs-code header="app.component.html (select-ngcontainer)" path="adev/src/content/examples/structural-directives/src/app/app.component.html" region="select-ngcontainer"/>

   <img alt="ngcontainer options work properly" src="assets/images/guide/structural-directives/select-ngcontainer-anim.gif">

## Что дальше {#whats-next}

<docs-pill-row>
  <docs-pill href="guide/directives/attribute-directives" title="Атрибутные директивы"/>
  <docs-pill href="guide/directives/structural-directives" title="Структурные директивы"/>
  <docs-pill href="guide/directives/directive-composition-api" title="API компоновки директив"/>
</docs-pill-row>
