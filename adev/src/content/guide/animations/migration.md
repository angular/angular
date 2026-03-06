# Миграция с пакета Angular Animations {#migrating-away-from-angular-animations-package}

Пакет `@angular/animations` устарел начиная с v20.2, в которой также был представлен новый функционал `animate.enter` и `animate.leave` для добавления анимаций в приложения. Используя эти новые возможности, можно заменить все анимации на основе `@angular/animations` на чистый CSS или JavaScript-библиотеки анимаций. Удаление `@angular/animations` из приложения может значительно уменьшить размер JavaScript-бандла. Нативные CSS-анимации, как правило, обеспечивают более высокую производительность, поскольку могут использовать аппаратное ускорение. Это руководство описывает процесс рефакторинга кода с `@angular/animations` на нативные CSS-анимации.

## Как писать анимации на нативном CSS {#how-to-write-animations-in-native-css}

Если вы никогда не писали нативные CSS-анимации, существует ряд отличных руководств для начала. Вот некоторые из них:
[Руководство по CSS-анимациям на MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)
[Руководство по CSS3-анимациям на W3Schools](https://www.w3schools.com/css/css3_animations.asp)
[Полный учебник по CSS-анимациям](https://www.lambdatest.com/blog/css-animations-tutorial/)
[CSS-анимации для начинающих](https://thoughtbot.com/blog/css-animation-for-beginners)

а также пара видеороликов:
[Изучите CSS-анимации за 9 минут](https://www.youtube.com/watch?v=z2LQYsZhsFw)
[Плейлист Net Ninja по CSS-анимациям](https://www.youtube.com/watch?v=jgw82b5Y2MU&list=PL4cUxeGkcC9iGYgmEd2dm3zAKzyCGDtM5)

Ознакомьтесь с этими руководствами, а затем вернитесь к данному документу.

## Создание повторно используемых анимаций {#creating-reusable-animations}

Как и в пакете анимаций, можно создавать повторно используемые анимации, общие для всего приложения. В версии с пакетом анимаций для этого использовалась функция `animation()` в общем TypeScript-файле. В версии с нативным CSS подход аналогичный, но реализуется в общем CSS-файле.

#### С пакетом Animations {#with-animations-package}

<docs-code header="animations.ts" path="adev/src/content/examples/animations/src/app/animations.1.ts" region="animation-example"/>

#### С нативным CSS {#with-native-css}

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-shared"/>

Добавление класса `animated-class` к элементу запустит анимацию на этом элементе.

## Анимация перехода {#animating-a-transition}

### Анимация состояний и стилей {#animating-state-and-styles}

Пакет анимаций позволял определять различные состояния с помощью функции [`state()`](api/animations/state) внутри компонента. Примером могут служить состояния `open` и `closed`, содержащие стили для каждого из них в определении. Например:

#### С пакетом Animations {#with-animations-package-state}

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.ts" region="state1"/>

Того же поведения можно достичь нативно, используя CSS-классы с keyframe-анимацией или стилями переходов.

#### С нативным CSS {#with-native-css-state}

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-states"/>

Переключение между состояниями `open` и `closed` осуществляется переключением классов на элементе в компоненте. Примеры можно найти в [руководстве по шаблонам](guide/templates/binding#css-class-and-style-property-bindings).

Аналогичные примеры для [прямой анимации стилей](guide/templates/binding#css-style-properties) также есть в руководстве по шаблонам.

### Переходы, тайминг и плавность {#transitions-timing-and-easing}

Функция `animate()` пакета анимаций позволяла задавать тайминг — длительность, задержки и плавность. Нативно это можно реализовать с помощью нескольких CSS-свойств или сокращённых свойств.

Указывайте `animation-duration`, `animation-delay` и `animation-timing-function` для keyframe-анимации в CSS, или используйте сокращённое свойство `animation`.

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-timing"/>

Аналогично можно использовать `transition-duration`, `transition-delay` и `transition-timing-function`, а также сокращённое свойство `transition` для анимаций без `@keyframes`.

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="transition-timing"/>

### Запуск анимации {#triggering-an-animation}

В пакете анимаций требовалось указывать триггеры с помощью функции `trigger()` и вкладывать в неё все состояния. С нативным CSS это излишне. Анимации можно запускать переключением CSS-стилей или классов. Как только класс присутствует на элементе, анимация происходит. Удаление класса возвращает элемент к любому CSS, определённому для этого элемента. Это значительно сокращает объём кода для той же анимации. Пример:

#### С пакетом Animations {#with-animations-package-trigger}

<docs-code-multifile>
    <docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/animations-package/open-close.ts" />
    <docs-code header="open-close.html" path="adev/src/content/examples/animations/src/app/animations-package/open-close.html" />
    <docs-code header="open-close.css" path="adev/src/content/examples/animations/src/app/animations-package/open-close.css"/>
</docs-code-multifile>

#### С нативным CSS {#with-native-css-trigger}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/open-close.ts">
    <docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/native-css/open-close.ts" />
    <docs-code header="open-close.html" path="adev/src/content/examples/animations/src/app/native-css/open-close.html" />
    <docs-code header="open-close.css" path="adev/src/content/examples/animations/src/app/native-css/open-close.css"/>
</docs-code-multifile>

## Переходы и триггеры {#transition-and-triggers}

### Предопределённые состояния и сопоставление с маской {#predefined-state-and-wildcard-matching}

Пакет анимаций предоставлял возможность сопоставлять определённые состояния с переходом через строки. Например, анимация от `open` до `closed` записывалась как `open => closed`. Для сопоставления любого состояния с целевым использовались маски `*`, как `* => closed`, а ключевое слово `void` применялось для состояний входа и ухода. Например: `* => void` при уходе элемента из представления или `void => *` при его входе.

Эти шаблоны сопоставления состояний совершенно не нужны при прямой анимации с CSS. Можно управлять тем, какие переходы и `@keyframes`-анимации применяются, на основе установленных классов и/или стилей на элементах. Также можно добавить `@starting-style` для управления видом элемента сразу после входа в DOM.

### Автоматическое вычисление свойств с масками {#automatic-property-calculation-with-wildcards}

Пакет анимаций предоставлял возможность анимировать вещи, которые исторически было сложно анимировать, например анимацию заданной высоты до `height: auto`. Сейчас это также можно сделать с помощью чистого CSS.

#### С пакетом Animations {#with-animations-package-auto}

<docs-code-multifile>
    <docs-code header="auto-height.ts" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.ts" />
    <docs-code header="auto-height.html" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.html" />
    <docs-code header="auto-height.css" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.css" />
</docs-code-multifile>

Для анимации до автоматической высоты можно использовать CSS-сетку.

#### С нативным CSS {#with-native-css-auto}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/auto-height.ts">
    <docs-code header="auto-height.ts" path="adev/src/content/examples/animations/src/app/native-css/auto-height.ts" />
    <docs-code header="auto-height.html" path="adev/src/content/examples/animations/src/app/native-css/auto-height.html" />
    <docs-code header="auto-height.css" path="adev/src/content/examples/animations/src/app/native-css/auto-height.css"  />
</docs-code-multifile>

Если не нужно беспокоиться о поддержке всех браузеров, также можно рассмотреть `calc-size()` — это настоящее решение для анимации до автоматической высоты. Подробнее см. в [документации MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/calc-size) и (этом учебнике)[https://frontendmasters.com/blog/one-of-the-boss-battles-of-css-is-almost-won-transitioning-to-auto/].

### Анимация входа и ухода из представления {#animate-entering-and-leaving-a-view}

Пакет анимаций предлагал описанное выше сопоставление шаблонов для входа и ухода, а также включал сокращённые псевдонимы `:enter` и `:leave`.

#### С пакетом Animations {#with-animations-package-enter-leave}

<docs-code-multifile>
    <docs-code header="insert-remove.ts" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.ts" />
    <docs-code header="insert-remove.html" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.html" />
    <docs-code header="insert-remove.css" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.css" />
</docs-code-multifile>

#### С нативным CSS {#with-native-css-enter}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/insert.ts">
    <docs-code header="insert.ts" path="adev/src/content/examples/animations/src/app/native-css/insert.ts" />
    <docs-code header="insert.html" path="adev/src/content/examples/animations/src/app/native-css/insert.html" />
    <docs-code header="insert.css" path="adev/src/content/examples/animations/src/app/native-css/insert.css"  />
</docs-code-multifile>

#### С нативным CSS {#with-native-css-leave}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/remove.ts">
    <docs-code header="remove.ts" path="adev/src/content/examples/animations/src/app/native-css/remove.ts" />
    <docs-code header="remove.html" path="adev/src/content/examples/animations/src/app/native-css/remove.html" />
    <docs-code header="remove.css" path="adev/src/content/examples/animations/src/app/native-css/remove.css"  />
</docs-code-multifile>

Подробнее об `animate.enter` и `animate.leave` см. в [руководстве по анимациям входа и ухода](guide/animations).

### Анимация инкремента и декремента {#animating-increment-and-decrement}

Помимо упомянутых `:enter` и `:leave`, есть также `:increment` и `:decrement`. Их анимацию также можно реализовать добавлением и удалением классов. В отличие от встроенных псевдонимов пакета анимаций, автоматического применения классов при увеличении или уменьшении значений нет. Классы можно применять программно. Пример:

#### С пакетом Animations {#with-animations-package-inc-dec}

<docs-code-multifile>
    <docs-code header="increment-decrement.ts" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.ts" />
    <docs-code header="increment-decrement.html" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.html" />
    <docs-code header="increment-decrement.css" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.css" />
</docs-code-multifile>

#### С нативным CSS {#with-native-css-inc-dec}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.ts">
    <docs-code header="increment-decrement.ts" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.ts" />
    <docs-code header="increment-decrement.html" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.html" />
    <docs-code header="increment-decrement.css" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.css" />
</docs-code-multifile>

### Анимации родителя и дочерних элементов {#parent-child-animations}

В отличие от пакета анимаций, при использовании нескольких анимаций в компоненте ни одна из них не имеет приоритета над другой и ничто не блокирует срабатывание анимаций. Любая последовательность анимаций должна быть обеспечена определением CSS-анимации с использованием задержек анимации/перехода и/или обработки `animationend` или `transitionend` для добавления следующего анимируемого CSS.

### Отключение анимации или всех анимаций {#disabling-an-animation-or-all-animations}

С нативными CSS-анимациями, если нужно отключить заданные анимации, есть несколько вариантов.

1. Создайте пользовательский класс, принудительно задающий `animation` и `transition` равными `none`.

```css
.no-animation {
  animation: none !important;
  transition: none !important;
}
```

Применение этого класса к элементу предотвращает срабатывание любых анимаций на нём. Можно также распространить это правило на весь DOM или его раздел для принудительного применения. Однако это предотвращает срабатывание событий анимации. Если вы ожидаете события анимации для удаления элемента, это решение не подойдёт. Обходной путь — установить длительности равными 1 миллисекунде.

2. Используйте медиазапрос [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), чтобы анимации не воспроизводились для пользователей, предпочитающих меньше движения.

3. Программно предотвращайте добавление классов анимаций.

### Обратные вызовы анимаций {#animation-callbacks}

Пакет анимаций предоставлял обратные вызовы для выполнения действий по завершении анимации. Нативные CSS-анимации также поддерживают такие обратные вызовы.

[`OnAnimationStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationstart_event)
[`OnAnimationEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event)
[`OnAnimationIteration`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationitration_event)
[`OnAnimationCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationcancel_event)

[`OnTransitionStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionstart_event)
[`OnTransitionRun`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionrun_event)
[`OnTransitionEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event)
[`OnTransitionCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitioncancel_event)

Web Animations API имеет много дополнительных возможностей. [Ознакомьтесь с документацией](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) для изучения всех доступных API анимации.

NOTE: Учитывайте проблемы всплытия событий. При анимации дочерних и родительских элементов события всплывают от дочерних к родительским. Рассмотрите возможность остановки распространения или изучения деталей события, чтобы определить, реагируете ли вы на нужный целевой элемент, а не на всплытие события от дочернего узла. Для проверки правильности узлов можно изучить свойство `animationname` или переходные свойства.

## Сложные последовательности {#complex-sequences}

В пакете анимаций есть встроенный функционал для создания сложных последовательностей. Все эти последовательности полностью реализуемы без пакета анимаций.

### Нацеливание на конкретные элементы {#targeting-specific-elements}

В пакете анимаций можно было нацеливаться на конкретные элементы с помощью функции `query()` для поиска элементов по CSS-классу, аналогично [`document.querySelector()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector). С нативными CSS-анимациями это излишне. Вместо этого можно использовать CSS-селекторы для нацеливания на подклассы и применять любые нужные `transform` или `animation`.

Для переключения классов у дочерних узлов в шаблоне можно использовать привязки классов и стилей, добавляя анимации в нужные моменты.

### Stagger() {#stagger}

Функция `stagger()` позволяла задерживать анимацию каждого элемента в списке на заданное время, создавая каскадный эффект. Это поведение можно воспроизвести в нативном CSS, используя `animation-delay` или `transition-delay`. Пример такого CSS:

#### С пакетом Animations {#with-animations-package-stagger}

<docs-code-multifile>
    <docs-code header="stagger.ts" path="adev/src/content/examples/animations/src/app/animations-package/stagger.ts" />
    <docs-code header="stagger.html" path="adev/src/content/examples/animations/src/app/animations-package/stagger.html" />
    <docs-code header="stagger.css" path="adev/src/content/examples/animations/src/app/animations-package/stagger.css" />
</docs-code-multifile>

#### С нативным CSS {#with-native-css-stagger}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/stagger.ts">
    <docs-code header="stagger.ts" path="adev/src/content/examples/animations/src/app/native-css/stagger.ts" />
    <docs-code header="stagger.html" path="adev/src/content/examples/animations/src/app/native-css/stagger.html" />
    <docs-code header="stagger.css" path="adev/src/content/examples/animations/src/app/native-css/stagger.css" />
</docs-code-multifile>

### Параллельные анимации {#parallel-animations}

В пакете анимаций есть функция `group()` для одновременного воспроизведения нескольких анимаций. В CSS есть полный контроль над таймингом анимаций. Если определено несколько анимаций, все они могут применяться одновременно.

```css
.target-element {
  animation:
    rotate 3s,
    fade-in 2s;
}
```

В этом примере анимации `rotate` и `fade-in` запускаются одновременно.

### Анимация элементов переупорядочиваемого списка {#animating-the-items-of-a-reordering-list}

Переупорядочивание элементов в списке работает из коробки с помощью описанных выше методов. Дополнительных усилий не требуется. Элементы в цикле `@for` будут корректно удалены и добавлены, что запустит анимации с использованием `@starting-styles` для анимаций входа. Альтернативно для того же поведения можно использовать `animate.enter`. Используйте `animate.leave` для анимации элементов при их удалении, как показано в примере выше.

#### С пакетом Animations {#with-animations-package-reorder}

<docs-code-multifile>
    <docs-code header="reorder.ts" path="adev/src/content/examples/animations/src/app/animations-package/reorder.ts" />
    <docs-code header="reorder.html" path="adev/src/content/examples/animations/src/app/animations-package/reorder.html" />
    <docs-code header="reorder.css" path="adev/src/content/examples/animations/src/app/animations-package/reorder.css" />
</docs-code-multifile>

#### С нативным CSS {#with-native-css-reorder}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/reorder.ts">
    <docs-code header="reorder.ts" path="adev/src/content/examples/animations/src/app/native-css/reorder.ts" />
    <docs-code header="reorder.html" path="adev/src/content/examples/animations/src/app/native-css/reorder.html" />
    <docs-code header="reorder.css" path="adev/src/content/examples/animations/src/app/native-css/reorder.css" />
</docs-code-multifile>

## Миграция использований AnimationPlayer {#migrating-usages-of-animationplayer}

Класс `AnimationPlayer` предоставляет доступ к анимации для более сложных операций — приостановки, воспроизведения, перезапуска и завершения анимации через код. Всё это можно реализовать нативно.

Анимации можно получить непосредственно с элемента, используя [`Element.getAnimations()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations). Это возвращает массив каждой [`Animation`](https://developer.mozilla.org/en-US/docs/Web/API/Animation) на этом элементе. С помощью API `Animation` можно сделать значительно больше, чем предлагал `AnimationPlayer` из пакета анимаций. Отсюда можно выполнять `cancel()`, `play()`, `pause()`, `reverse()` и многое другое. Этот нативный API предоставляет всё необходимое для управления анимациями.

## Переходы маршрутов {#route-transitions}

Для анимации переходов между маршрутами можно использовать переходы представлений. Начало работы описано в [Руководстве по анимациям переходов маршрутов](guide/routing/route-transition-animations).
