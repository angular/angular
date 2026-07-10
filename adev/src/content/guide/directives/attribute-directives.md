# Attribute-директивы

Изменяйте внешний вид или поведение DOM-элементов и компонентов Angular с помощью attribute-директив.

## Создание attribute-директивы {#building-an-attribute-directive}

В этом разделе вы создадите директиву подсветки, которая задаёт жёлтый цвет фона host-элемента.

1. Чтобы создать директиву, используйте команду CLI [`ng generate directive`](tools/cli/schematics).

   ```shell
   ng generate directive highlight
   ```

   CLI создаёт `src/app/highlight.directive.ts` и соответствующий тестовый файл `src/app/highlight.directive.spec.ts`.

   ```angular-ts
   import {Directive} from '@angular/core';

   @Directive({
     selector: '[appHighlight]',
   })
   export class HighlightDirective {}
   ```

   Свойство конфигурации декоратора `@Directive()` задаёт CSS attribute-селектор директивы `[appHighlight]`.

1. Импортируйте `ElementRef` и `inject` из `@angular/core`.
   `ElementRef` даёт прямой доступ к host DOM-элементу через свойство `nativeElement`.

1. Используйте [`inject`](guide/di), чтобы получить ссылку на host DOM-элемент — элемент, к которому применяется `appHighlight`.

1. Добавьте в класс `HighlightDirective` логику, задающую жёлтый фон.

   <docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.1.ts"/>

IMPORTANT: Директивы _не_ поддерживают пространства имён.

```angular-html {avoid}
<p app:Highlight>This is invalid</p>
```

## Применение attribute-директивы {#applying-an-attribute-directive}

Чтобы использовать `HighlightDirective`, добавьте в HTML-шаблон элемент `<p>` с директивой в качестве атрибута.

<docs-code header="app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.1.html" region="applied"/>

Angular создаёт экземпляр класса `HighlightDirective`, который через `inject(ElementRef)` получает ссылку на элемент `<p>` и задаёт ему жёлтый стиль фона.

## Обработка событий пользователя {#handling-user-events}

В этом разделе показано, как отслеживать наведение и уход указателя с элемента и реагировать установкой или сбросом цвета подсветки.

1. Настройте привязки событий host через свойство `host` в декораторе `@Directive()`.

   <docs-code header="src/app/highlight.directive.ts (decorator)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.2.ts" region="decorator"/>

1. Добавьте два метода-обработчика событий и сопоставьте им события host-элемента через свойство `host`.

   <docs-code header="highlight.directive.ts (mouse-methods)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.2.ts" region="mouse-methods"/>

Подписывайтесь на события DOM-элемента, который является host attribute-директивы (в данном случае `<p>`), настраивая слушатели событий в свойстве [`host`](guide/components/host-elements#binding-to-the-host-element) директивы.

HELPFUL: Обработчики делегируют вспомогательному методу `highlight()`, который задаёт цвет на host DOM-элементе `el`.

Полная директива выглядит так:

<docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.2.ts"/>

Цвет фона появляется, когда указатель наводится на элемент абзаца, и исчезает, когда указатель уходит.

<img alt="Second Highlight" src="assets/images/guide/attribute-directives/highlight-directive-anim.gif">

## Передача значений в attribute-директиву {#passing-values-into-an-attribute-directive}

В этом разделе вы зададите цвет подсветки при применении `HighlightDirective`.

1. В `highlight.directive.ts` импортируйте `input` из `@angular/core`.

   <docs-code header="highlight.directive.ts (imports)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.3.ts" region="imports"/>

1. Добавьте свойство `input` с именем `appHighlight`.

   <docs-code header="highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.3.ts" region="input"/>

   Функция `input()` добавляет в класс метаданные, делающие свойство `appHighlight` директивы доступным для привязки.

1. В `app.component.ts` добавьте свойство `color` в `AppComponent`.

   <docs-code header="app.component.ts (class)" path="adev/src/content/examples/attribute-directives/src/app/app.component.1.ts" region="class"/>

1. Чтобы одновременно применить директиву и цвет, используйте привязку свойства с селектором директивы `appHighlight`, приравняв его к `color`.

   <docs-code header="app.component.html (color)" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" region="color"/>

   Привязка атрибута `[appHighlight]` выполняет две задачи:
   - Применяет директиву подсветки к элементу `<p>`
   - Задаёт цвет подсветки директивы через привязку свойства

### Задание значения через ввод пользователя {#setting-the-value-with-user-input}

В этом разделе вы добавите radio-кнопки для привязки выбора цвета к директиве `appHighlight`.

1. Добавьте разметку в `app.component.html` для выбора цвета:

   <docs-code header="app.component.html (v2)" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" region="v2"/>

2. Измените `AppComponent.color` так, чтобы у него не было начального значения.

   <docs-code header="app.component.ts (class)" path="adev/src/content/examples/attribute-directives/src/app/app.component.ts" region="class"/>

3. В `highlight.directive.ts` измените метод `onMouseEnter` так, чтобы он сначала пытался подсветить с `appHighlight` и откатывался к `red`, если `appHighlight` равен `undefined`.
   <docs-code header="highlight.directive.ts (mouse-enter)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.3.ts" region="mouse-enter"/>

4. Запустите приложение и убедитесь, что пользователь может выбирать цвет radio-кнопками.

   <img alt="Animated gif of the refactored highlight directive changing color according to the radio button the user selects" src="assets/images/guide/attribute-directives/highlight-directive-v2-anim.gif">

## Привязка ко второму свойству {#binding-to-a-second-property}

В этом разделе вы настроите приложение так, чтобы разработчик мог задать цвет по умолчанию.

1. Добавьте второе свойство `input()` в `HighlightDirective` с именем `defaultColor`.

   <docs-code header="highlight.directive.ts (defaultColor)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.ts" region="defaultColor"/>

2. Измените `onMouseEnter` директивы так, чтобы он сначала пытался подсветить с `appHighlight`, затем с `defaultColor`, и откатывался к `red`, если оба свойства `undefined`.

   <docs-code header="highlight.directive.ts (mouse-enter)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.ts" region="mouse-enter"/>

3. Чтобы привязаться к `AppComponent.color` и откатываться к «violet» как цвету по умолчанию, добавьте следующий HTML.
   В этом случае привязка `defaultColor` не использует квадратные скобки `[]`, потому что значение — статическая строка, а не динамическое выражение.

   <docs-code header="app.component.html (defaultColor)" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" region="defaultColor"/>

   Как и у компонентов, к host-элементу можно добавить несколько привязок свойств директивы.

Цвет по умолчанию — красный, если нет привязки цвета по умолчанию.
Когда пользователь выбирает цвет, выбранный цвет становится активным цветом подсветки.

<img alt="Animated gif of final highlight directive that shows red color with no binding and violet with the default color set. When user selects color, the selection takes precedence." src="assets/images/guide/attribute-directives/highlight-directive-final-anim.gif">

## Отключение обработки Angular с `NgNonBindable` {#deactivating-angular-processing-with-ngnonbindable}

Чтобы предотвратить вычисление выражений в браузере, добавьте `ngNonBindable` к host-элементу.
`ngNonBindable` отключает интерполяцию, директивы и привязки в шаблонах.

В следующем примере выражение `{{ 1 + 1 }}` отображается так же, как в редакторе кода, и не показывает `2`.

<docs-code header="app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" region="ngNonBindable"/>

Применение `ngNonBindable` к элементу останавливает привязку для дочерних элементов этого элемента.
Однако `ngNonBindable` по-прежнему позволяет директивам работать на элементе, к которому применён `ngNonBindable`.
В следующем примере директива `appHighlight` всё ещё активна, но Angular не вычисляет выражение `{{ 1 + 1 }}`.

<docs-code header="app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" region="ngNonBindable-with-directive"/>

Если применить `ngNonBindable` к родительскому элементу, Angular отключает интерполяцию и привязки любого вида — привязку свойств или событий — для дочерних элементов.
