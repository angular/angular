<docs-decorative-header title="Встроенные директивы" imgSrc="adev/src/assets/images/directives.svg"> <!-- markdownlint-disable-line -->
Директивы — это классы, которые добавляют дополнительное поведение элементам в ваших приложениях Angular.
</docs-decorative-header>

Используйте встроенные директивы Angular для управления формами, списками, стилями и тем, что видят пользователи.

Различные типы директив Angular:

| Типы директив                                                    | Описание                                                                       |
| :--------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| [Компоненты](guide/components)                                   | Используются с шаблоном. Этот тип директив является наиболее распространенным. |
| [Директивы атрибутов](#built-in-attribute-directives)            | Изменяют внешний вид или поведение элемента, компонента или другой директивы.  |
| [Структурные директивы](/guide/directives/structural-directives) | Изменяют структуру DOM, добавляя и удаляя DOM-элементы.                        |

В этом руководстве рассматриваются встроенные [директивы атрибутов](#built-in-attribute-directives).

## Встроенные директивы атрибутов {#built-in-attribute-directives}

Директивы атрибутов отслеживают и изменяют поведение других HTML-элементов, атрибутов, свойств и компонентов.

Наиболее распространенные директивы атрибутов:

| Распространенные директивы                             | Описание                                                      |
| :----------------------------------------------------- | :------------------------------------------------------------ |
| [`NgClass`](#adding-and-removing-classes-with-ngclass) | Добавляет и удаляет набор CSS-классов.                        |
| [`NgStyle`](#setting-inline-styles-with-ngstyle)       | Добавляет и удаляет набор HTML-стилей.                        |
| [`NgModel`](guide/forms/template-driven-forms)         | Добавляет двустороннюю привязку данных к элементу формы HTML. |

HELPFUL: Встроенные директивы используют только публичные API. Они не имеют специального доступа к каким-либо приватным
API, недоступным для других директив.

## Добавление и удаление классов с помощью NgClass {#adding-and-removing-classes-with-ngclass}

Добавляйте или удаляйте несколько CSS-классов одновременно с помощью `ngClass`.

HELPFUL: Чтобы добавить или удалить _один_ класс, используйте [привязку класса](guide/templates/class-binding) вместо
`NgClass`.

### Импорт `NgClass` в компонент

Чтобы использовать `NgClass`, добавьте его в список `imports` компонента.

<docs-code header="app.component.ts (NgClass import)" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" region="import-ng-class"/>

### Использование `NgClass` с выражением

Добавьте `[ngClass]` к элементу, который вы хотите стилизовать, и присвойте ему выражение.
В этом случае `isSpecial` — это булево значение, установленное в `true` в `app.component.ts`.
Поскольку `isSpecial` имеет значение `true`, `ngClass` применяет класс `special` к `<div>`.

<docs-code header="app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" region="special-div"/>

### Использование `NgClass` с методом

1. Чтобы использовать `NgClass` с методом, добавьте метод в класс компонента.
   В следующем примере `setCurrentClasses()` присваивает свойству `currentClasses` объект, который добавляет или удаляет
   три класса на основе состояния (`true` или `false`) трех других свойств компонента.

   Каждый ключ объекта — это имя CSS-класса.
   Если значение ключа — `true`, `ngClass` добавляет класс.
   Если значение ключа — `false`, `ngClass` удаляет класс.

   <docs-code header="app.component.ts" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" region="setClasses"/>

1. В шаблоне добавьте привязку свойства `ngClass` к `currentClasses`, чтобы установить классы элемента:

<docs-code header="app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" region="NgClass-1"/>

В этом случае Angular применяет классы при инициализации и при изменениях, вызванных переназначением объекта
`currentClasses`.
В полном примере `setCurrentClasses()` вызывается при инициализации в `ngOnInit()`, а также когда пользователь нажимает
кнопку `Refresh currentClasses`.
Эти шаги не являются обязательными для самой реализации `ngClass`.

## Установка встроенных стилей с помощью NgStyle {#setting-inline-styles-with-ngstyle}

HELPFUL: Чтобы добавить или удалить _один_ стиль,
используйте [привязки стилей](guide/templates/binding#css-class-and-style-property-bindings) вместо `NgStyle`.

### Импорт `NgStyle` в компонент

Чтобы использовать `NgStyle`, добавьте его в список `imports` компонента.

<docs-code header="app.component.ts (NgStyle import)" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" region="import-ng-style"/>

Используйте `NgStyle` для одновременной установки нескольких встроенных стилей на основе состояния компонента.

1. Чтобы использовать `NgStyle`, добавьте метод в класс компонента.

   В следующем примере `setCurrentStyles()` присваивает свойству `currentStyles` объект, который определяет три стиля на
   основе состояния трех других свойств компонента.

   <docs-code header="app.component.ts" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" region="setStyles"/>

1. Чтобы установить стили элемента, добавьте привязку свойства `ngStyle` к `currentStyles`.

<docs-code header="app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" region="NgStyle-2"/>

В этом случае Angular применяет стили при инициализации и при изменениях.
Для этого в полном примере `setCurrentStyles()` вызывается при инициализации в `ngOnInit()` и при изменении зависимых
свойств по нажатию кнопки.
Однако эти шаги не являются обязательными для реализации самого `ngStyle`.

## Размещение директивы без элемента DOM

Angular `<ng-container>` — это группирующий элемент, который не влияет на стили или структуру, так как Angular не
добавляет его в DOM.

Используйте `<ng-container>`, когда нет подходящего элемента для размещения директивы.

Ниже приведен пример условного отображения абзаца с использованием `<ng-container>`.

<docs-code header="app.component.html (ngif-ngcontainer)" path="adev/src/content/examples/structural-directives/src/app/app.component.html" region="ngif-ngcontainer"/>

<img alt="ngcontainer paragraph with proper style" src="assets/images/guide/structural-directives/good-paragraph.png">

1. Импортируйте директиву `ngModel` из `FormsModule`.

1. Добавьте `FormsModule` в раздел imports соответствующего модуля Angular (или компонента).

1. Чтобы условно исключить `<option>`, оберните `<option>` в `<ng-container>`.

   <docs-code header="app.component.html (select-ngcontainer)" path="adev/src/content/examples/structural-directives/src/app/app.component.html" region="select-ngcontainer"/>

   <img alt="ngcontainer options work properly" src="assets/images/guide/structural-directives/select-ngcontainer-anim.gif">

## Что дальше

<docs-pill-row>
  <docs-pill href="guide/directives/attribute-directives" title="Директивы атрибутов"/>
  <docs-pill href="guide/directives/structural-directives" title="Структурные директивы"/>
  <docs-pill href="guide/directives/directive-composition-api" title="API композиции директив"/>
</docs-pill-row>
