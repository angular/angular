# Атрибутные директивы {#attribute-directives}

Изменяйте внешний вид или поведение DOM-элементов и Angular-компонентов с помощью атрибутных директив.

## Создание атрибутной директивы {#building-an-attribute-directive}

В этом разделе описывается создание директивы подсветки (`highlight`), которая устанавливает жёлтый цвет фона у хост-элемента.

1. Для создания директивы используйте команду CLI [`ng generate directive`](tools/cli/schematics).

   ```shell
   ng generate directive highlight
   ```

   CLI создаёт файл `src/app/highlight.directive.ts` и соответствующий тестовый файл `src/app/highlight.directive.spec.ts`.

   <docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.0.ts"/>

   Свойство конфигурации декоратора `@Directive()` задаёт CSS-селектор атрибута директивы — `[appHighlight]`.

1. Импортируйте `ElementRef` из `@angular/core`.
   `ElementRef` предоставляет прямой доступ к хост-элементу DOM через свойство `nativeElement`.

1. Добавьте `ElementRef` в `constructor()` директивы для [внедрения](guide/di) ссылки на хост-элемент DOM — элемент, к которому применяется `appHighlight`.

1. Добавьте логику в класс `HighlightDirective`, устанавливающую жёлтый цвет фона.

<docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.1.ts"/>

HELPFUL: Директивы _не_ поддерживают пространства имён.

<docs-code header="app.component.avoid.html (unsupported)" path="adev/src/content/examples/attribute-directives/src/app/app.component.avoid.html" region="unsupported"/>

## Применение атрибутной директивы {#applying-an-attribute-directive}

Чтобы использовать `HighlightDirective`, добавьте элемент `<p>` в HTML-шаблон с директивой в качестве атрибута.

<docs-code header="app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.1.html" region="applied"/>

Angular создаёт экземпляр класса `HighlightDirective` и внедряет ссылку на элемент `<p>` в конструктор директивы, который устанавливает жёлтый цвет фона для элемента `<p>`.

## Обработка событий пользователя {#handling-user-events}

В этом разделе показано, как отслеживать наведение курсора мыши на элемент и уход с него, а также реагировать на это — устанавливать или убирать цвет подсветки.

1. Настройте привязки событий хоста с помощью свойства `host` в декораторе `@Directive()`.

   <docs-code header="src/app/highlight.directive.ts (decorator)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.2.ts" region="decorator"/>

1. Добавьте два метода-обработчика событий и сопоставьте им события хост-элемента через свойство `host`.

   <docs-code header="highlight.directive.ts (mouse-methods)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.2.ts" region="mouse-methods"/>

Подписывайтесь на события DOM-элемента, к которому применена атрибутная директива (в данном случае `<p>`), настраивая слушателей событий в [свойстве `host`](guide/components/host-elements#binding-to-the-host-element) директивы.

HELPFUL: Обработчики делегируют вспомогательному методу `highlight()`, который устанавливает цвет на хост-элементе `el`.

Полная директива выглядит следующим образом:

<docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.2.ts"/>

Цвет фона появляется при наведении указателя на элемент абзаца и исчезает при его уходе.

<img alt="Second Highlight" src="assets/images/guide/attribute-directives/highlight-directive-anim.gif">

## Передача значений в атрибутную директиву {#passing-values-into-an-attribute-directive}

В этом разделе описывается настройка цвета подсветки при применении `HighlightDirective`.

1. В `highlight.directive.ts` импортируйте `input` из `@angular/core`.

   <docs-code header="highlight.directive.ts (imports)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.3.ts" region="imports"/>

1. Добавьте свойство Input — `appHighlight`.

   <docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.3.ts" region="input"/>

   Функция `input()` добавляет метаданные к классу, делая свойство `appHighlight` директивы доступным для привязки.

1. В `app.component.ts` добавьте свойство `color` в `AppComponent`.

   <docs-code header="app.component.ts (class)" path="adev/src/content/examples/attribute-directives/src/app/app.component.1.ts" region="class"/>

1. Чтобы одновременно применить директиву и цвет, используйте привязку свойства с селектором директивы `appHighlight`, установив его равным `color`.

   <docs-code header="app.component.html (color)" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" region="color"/>

   Привязка атрибута `[appHighlight]` выполняет две задачи:
   - Применяет директиву подсветки к элементу `<p>`
   - Устанавливает цвет подсветки директивы через привязку свойства

### Установка значения через пользовательский ввод {#setting-the-value-with-user-input}

В этом разделе описывается добавление переключателей для привязки выбора цвета к директиве `appHighlight`.

1. Добавьте разметку в `app.component.html` для выбора цвета:

   <docs-code header="app.component.html (v2)" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" region="v2"/>

2. Измените `AppComponent.color` так, чтобы у него не было начального значения.

   <docs-code header="app.component.ts (class)" path="adev/src/content/examples/attribute-directives/src/app/app.component.ts" region="class"/>

3. В `highlight.directive.ts` измените метод `onMouseEnter` так, чтобы он сначала пытался применить подсветку с цветом `appHighlight`, а при значении `undefined` — с `red`.
   <docs-code header="highlight.directive.ts (mouse-enter)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.3.ts" region="mouse-enter"/>

4. Запустите приложение и убедитесь, что пользователь может выбрать цвет с помощью переключателей.

   <img alt="Animated gif of the refactored highlight directive changing color according to the radio button the user selects" src="assets/images/guide/attribute-directives/highlight-directive-v2-anim.gif">

## Привязка ко второму свойству {#binding-to-a-second-property}

В этом разделе описывается настройка приложения так, чтобы разработчик мог задать цвет по умолчанию.

1. Добавьте второе свойство Input — `defaultColor` — в `HighlightDirective`.

   <docs-code header="highlight.directive.ts (defaultColor)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.ts" region="defaultColor"/>

2. Измените `onMouseEnter` директивы так, чтобы сначала применялась подсветка с `appHighlight`, затем с `defaultColor`, а при `undefined` — с `red`.

   <docs-code header="highlight.directive.ts (mouse-enter)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.ts" region="mouse-enter"/>

3. Для привязки к `AppComponent.color` с использованием `"violet"` как цвета по умолчанию добавьте следующий HTML.
   В данном случае привязка `defaultColor` не использует квадратные скобки `[]`, поскольку значение является статической строкой, а не динамическим выражением.

   <docs-code header="app.component.html (defaultColor)" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" region="defaultColor"/>

   Как и в случае с компонентами, можно добавить несколько привязок свойств директивы к одному хост-элементу.

Цвет по умолчанию — красный, если привязка `defaultColor` не задана.
При выборе пользователем цвета выбранный цвет становится активным цветом подсветки.

<img alt="Animated gif of final highlight directive that shows red color with no binding and violet with the default color set. When user selects color, the selection takes precedence." src="assets/images/guide/attribute-directives/highlight-directive-final-anim.gif">

## Отключение обработки Angular с помощью `NgNonBindable` {#deactivating-angular-processing-with-ngnon-bindable}

Чтобы предотвратить вычисление выражений в браузере, добавьте `ngNonBindable` к хост-элементу.
`ngNonBindable` отключает интерполяцию, директивы и привязки в шаблонах.

В следующем примере выражение `{{ 1 + 1 }}` отображается так, как оно написано в редакторе кода, и не выводит `2`.

<docs-code header="app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" region="ngNonBindable"/>

Применение `ngNonBindable` к элементу останавливает привязку для дочерних элементов этого элемента.
Однако `ngNonBindable` по-прежнему позволяет директивам работать на элементе, к которому применяется `ngNonBindable`.
В следующем примере директива `appHighlight` остаётся активной, но Angular не вычисляет выражение `{{ 1 + 1 }}`.

<docs-code header="app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" region="ngNonBindable-with-directive"/>

Если применить `ngNonBindable` к родительскому элементу, Angular отключает интерполяцию и любые привязки — привязки свойств и событий — для дочерних элементов.
