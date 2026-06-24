# Атрибутивные директивы

Изменяйте внешний вид или поведение DOM-элементов и компонентов Angular с помощью атрибутивных директив.

## Создание атрибутивной директивы

В этом разделе описывается создание директивы подсветки, которая устанавливает желтый цвет фона для хост-элемента.

1. Чтобы создать директиву, используйте команду CLI [`ng generate directive`](tools/cli/schematics).

   ```shell
   ng generate directive highlight
   ```

   CLI создает `src/app/highlight.directive.ts` и соответствующий файл теста `src/app/highlight.directive.spec.ts`.

   <docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.0.ts"/>

   Свойство конфигурации декоратора `@Directive()` определяет CSS-селектор атрибута директивы, `[appHighlight]`.

1. Импортируйте `ElementRef` из `@angular/core`.
   `ElementRef` предоставляет прямой доступ к хост-элементу DOM через свойство `nativeElement`.

1. Добавьте `ElementRef` в `constructor()` директивы, чтобы [внедрить](guide/di) ссылку на хост-элемент DOM — элемент, к
   которому вы применяете `appHighlight`.

1. Добавьте в класс `HighlightDirective` логику, которая устанавливает желтый фон.

<docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.1.ts"/>

ПОЛЕЗНО: Директивы _не_ поддерживают пространства имен.

<docs-code header="app.component.avoid.html (unsupported)" path="adev/src/content/examples/attribute-directives/src/app/app.component.avoid.html" visibleRegion="unsupported"/>

## Применение атрибутивной директивы

1. Чтобы использовать `HighlightDirective`, добавьте элемент `<p>` в HTML-шаблон с директивой в качестве атрибута.

<docs-code header="app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.1.html" visibleRegion="applied"/>

Angular создает экземпляр класса `HighlightDirective` и внедряет ссылку на элемент `<p>` в конструктор директивы,
который устанавливает стиль фона элемента `<p>` в желтый цвет.

## Обработка событий пользователя

В этом разделе показано, как обнаружить, когда пользователь наводит курсор мыши на элемент или уводит его, и реагировать
установкой или очисткой цвета подсветки.

1. Настройте привязки событий хоста, используя свойство `host` в декораторе `@Directive()`.

<docs-code header="src/app/highlight.directive.ts (decorator)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.2.ts" visibleRegion="decorator"/>

1. Добавьте два метода-обработчика событий и сопоставьте с ними события хост-элемента через свойство `host`.

<docs-code header="highlight.directive.ts (mouse-methods)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.2.ts" visibleRegion="mouse-methods"/>

Подпишитесь на события DOM-элемента, который содержит атрибутивную директиву (в данном случае `<p>`), настроив слушатели
событий в [свойстве `host`](guide/components/host-elements#binding-to-the-host-element) директивы.

ПОЛЕЗНО: Обработчики делегируют выполнение вспомогательному методу `highlight()`, который устанавливает цвет на
хост-элементе DOM, `el`.

Полная директива выглядит следующим образом:

<docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.2.ts"/>

Цвет фона появляется, когда указатель наводится на элемент абзаца, и исчезает, когда указатель уходит.

<img alt="Second Highlight" src="assets/images/guide/attribute-directives/highlight-directive-anim.gif">

## Передача значений в атрибутивную директиву

В этом разделе описывается установка цвета подсветки при применении `HighlightDirective`.

1. В `highlight.directive.ts` импортируйте `Input` из `@angular/core`.

<docs-code header="highlight.directive.ts (imports)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.3.ts" visibleRegion="imports"/>

2. Добавьте `input`-свойство `appHighlight`.

   <docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.3.ts" visibleRegion="input"/>

   Функция `input()` добавляет метаданные к классу, что делает свойство директивы `appHighlight` доступным для привязки.

3. В `app.component.ts` добавьте свойство `color` в `AppComponent`.

<docs-code header="app.component.ts (class)" path="adev/src/content/examples/attribute-directives/src/app/app.component.1.ts" visibleRegion="class"/>

4. Чтобы одновременно применить директиву и цвет, используйте привязку свойств с селектором директивы `appHighlight`,
   установив его равным `color`.

   <docs-code header="app.component.html (color)" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" visibleRegion="color"/>

   Привязка атрибута `[appHighlight]` выполняет две задачи:

- Применяет директиву подсветки к элементу `<p>`
- Устанавливает цвет подсветки директивы с помощью привязки свойства

### Установка значения с помощью пользовательского ввода

В этом разделе описывается добавление радиокнопок для привязки выбора цвета к директиве `appHighlight`.

1. Добавьте разметку в `app.component.html` для выбора цвета следующим образом:

<docs-code header="app.component.html (v2)" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" visibleRegion="v2"/>

1. Измените `AppComponent.color` так, чтобы у него не было начального значения.

<docs-code header="app.component.ts (class)" path="adev/src/content/examples/attribute-directives/src/app/app.component.ts" visibleRegion="class"/>

1. В `highlight.directive.ts` измените метод `onMouseEnter` так, чтобы он сначала пытался подсветить с помощью
   `appHighlight`, и возвращался к `red`, если `appHighlight` имеет значение `undefined`.

<docs-code header="highlight.directive.ts (mouse-enter)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.3.ts" visibleRegion="mouse-enter"/>

1. Запустите приложение, чтобы убедиться, что пользователь может выбирать цвет с помощью радиокнопок.

<img alt="Animated gif of the refactored highlight directive changing color according to the radio button the user selects" src="assets/images/guide/attribute-directives/highlight-directive-v2-anim.gif">

## Привязка ко второму свойству

В этом разделе описывается настройка приложения, позволяющая разработчику устанавливать цвет по умолчанию.

1. Добавьте второе `input()`-свойство в `HighlightDirective` с именем `defaultColor`.

<docs-code header="highlight.directive.ts (defaultColor)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.ts" visibleRegion="defaultColor"/>

1. Измените `onMouseEnter` директивы так, чтобы он сначала пытался подсветить с помощью `appHighlight`, затем с помощью
   `defaultColor`, и возвращался к `red`, если оба свойства имеют значение `undefined`.

<docs-code header="highlight.directive.ts (mouse-enter)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.ts" visibleRegion="mouse-enter"/>

1. Чтобы привязаться к `AppComponent.color` и использовать «violet» в качестве цвета по умолчанию, добавьте следующий
   HTML.
   В этом случае привязка `defaultColor` не использует квадратные скобки `[]`, так как она статична.

   <docs-code header="app.component.html (defaultColor)" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" visibleRegion="defaultColor"/>

   Как и в случае с компонентами, вы можете добавить несколько привязок свойств директивы к хост-элементу.

Цвет по умолчанию — красный, если привязка цвета по умолчанию отсутствует.
Когда пользователь выбирает цвет, выбранный цвет становится активным цветом подсветки.

<img alt="Animated gif of final highlight directive that shows red color with no binding and violet with the default color set. When user selects color, the selection takes precedence." src="assets/images/guide/attribute-directives/highlight-directive-final-anim.gif">

## Отключение обработки Angular с помощью `NgNonBindable`

Чтобы предотвратить вычисление выражений в браузере, добавьте `ngNonBindable` к хост-элементу.
`ngNonBindable` отключает интерполяцию, директивы и привязку в шаблонах.

В следующем примере выражение `{{ 1 + 1 }}` отображается так же, как в редакторе кода, и не выводит `2`.

<docs-code header="app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" visibleRegion="ngNonBindable"/>

Применение `ngNonBindable` к элементу останавливает привязку для дочерних элементов этого элемента.
Однако `ngNonBindable` все еще позволяет директивам работать на элементе, к которому вы применяете `ngNonBindable`.
В следующем примере директива `appHighlight` все еще активна, но Angular не вычисляет выражение `{{ 1 + 1 }}`.

<docs-code header="app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" visibleRegion="ngNonBindable-with-directive"/>

Если вы примените `ngNonBindable` к родительскому элементу, Angular отключит интерполяцию и любые виды привязки, такие
как привязка свойств или событий, для дочерних элементов.
