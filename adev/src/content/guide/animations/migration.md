# Миграция с пакета Angular Animations

Пакет `@angular/animations` объявлен устаревшим начиная с v20.2, в которой также была представлена новая функция `animate.enter` и `animate.leave` для добавления анимаций в приложение. Используя эти новые возможности, можно заменить все анимации на основе `@angular/animations` на чистый CSS или JS-библиотеки анимации. Удаление `@angular/animations` из приложения может значительно уменьшить размер JavaScript-бандла. Нативные CSS-анимации, как правило, обеспечивают превосходную производительность, поскольку могут воспользоваться аппаратным ускорением. В этом руководстве описывается процесс рефакторинга кода с `@angular/animations` на нативные CSS-анимации.

## Как писать анимации на нативном CSS {#how-to-write-animations-in-native-css}

Если вы никогда не писали нативные CSS-анимации, существует множество отличных руководств для начала. Вот некоторые из них:
[Руководство MDN по CSS-анимациям](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)
[Руководство W3Schools по CSS3 Animations](https://www.w3schools.com/css/css3_animations.asp)
[The Complete CSS Animations Tutorial](https://www.lambdatest.com/blog/css-animations-tutorial/)
[CSS Animation for Beginners](https://thoughtbot.com/blog/css-animation-for-beginners)

и пара видео:
[Learn CSS Animation in 9 Minutes](https://www.youtube.com/watch?v=z2LQYsZhsFw)
[Net Ninja CSS Animation Tutorial Playlist](https://www.youtube.com/watch?v=jgw82b5Y2MU&list=PL4cUxeGkcC9iGYgmEd2dm3zAKzyCGDtM5)

Ознакомьтесь с этими руководствами и туториалами, а затем вернитесь к данному руководству.

## Создание переиспользуемых анимаций {#creating-reusable-animations}

Как и в пакете анимаций, можно создавать переиспользуемые анимации, которые могут использоваться в разных частях приложения. В версии с пакетом анимаций для этого использовалась функция `animation()` в общем TypeScript-файле. Нативная CSS-версия аналогична, но живёт в общем CSS-файле.

#### С пакетом Animations {#with-animations-package}

<docs-code header="animations.ts" path="adev/src/content/examples/animations/src/app/animations.1.ts" region="animation-example"/>

#### С нативным CSS {#with-native-css}

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-shared"/>

Добавление класса `animated-class` к элементу запустит анимацию на этом элементе.

## Анимация перехода {#animating-a-transition}

### Анимация состояний и стилей {#animating-state-and-styles}

Пакет анимаций позволял определять различные состояния с помощью функции [`state()`](api/animations/state) внутри компонента. Примерами могут служить состояния `open` или `closed`, содержащие стили для каждого соответствующего состояния в определении. Например:

#### С пакетом Animations {#with-animations-package}

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.ts" region="state1"/>

То же поведение можно реализовать нативно, используя CSS-классы — либо через анимацию ключевых кадров, либо через стили переходов.

#### С нативным CSS {#with-native-css}

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-states"/>

Переключение состояния `open` или `closed` осуществляется переключением классов на элементе в компоненте. Примеры того, как это сделать, см. в [руководстве по шаблонам](guide/templates/binding#css-class-and-style-property-bindings).

Аналогичные примеры для [прямой анимации стилей](guide/templates/binding#css-style-properties) также есть в руководстве по шаблонам.

### Переходы, тайминг и функции сглаживания {#transitions-timing-and-easing}

Функция `animate()` пакета анимаций позволяла задавать тайминг: длительность, задержки и функции сглаживания. Нативно это можно реализовать в CSS с помощью нескольких CSS-свойств или сокращённых свойств.

Укажите `animation-duration`, `animation-delay` и `animation-timing-function` для анимации ключевых кадров в CSS, или используйте сокращённое свойство `animation`.

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-timing"/>

Аналогично можно использовать `transition-duration`, `transition-delay` и `transition-timing-function`, а также сокращённое свойство `transition` для анимаций без `@keyframes`.

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="transition-timing"/>

### Запуск анимации {#triggering-an-animation}

Пакет анимаций требовал указания триггеров с помощью функции `trigger()` и вложения всех состояний в неё. С нативным CSS это не нужно. Анимации можно запускать, переключая CSS-стили или классы. Как только класс присутствует на элементе, анимация происходит. Удаление класса возвращает элемент к CSS, определённому для него. Это приводит к значительно меньшему объёму кода для той же анимации. Пример:

#### С пакетом Animations {#with-animations-package}

<docs-code-multifile>
    <docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/animations-package/open-close.ts" />
    <docs-code header="open-close.html" path="adev/src/content/examples/animations/src/app/animations-package/open-close.html" />
    <docs-code header="open-close.css" path="adev/src/content/examples/animations/src/app/animations-package/open-close.css"/>
</docs-code-multifile>

#### С нативным CSS {#with-native-css}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/open-close.ts">
    <docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/native-css/open-close.ts" />
    <docs-code header="open-close.html" path="adev/src/content/examples/animations/src/app/native-css/open-close.html" />
    <docs-code header="open-close.css" path="adev/src/content/examples/animations/src/app/native-css/open-close.css"/>
</docs-code-multifile>

## Переходы и триггеры {#transition-and-triggers}

### Предопределённые состояния и сопоставление с подстановочными знаками {#predefined-state-and-wildcard-matching}

Пакет анимаций предоставлял возможность сопоставлять определённые состояния с переходом через строки. Например, анимация из open в closed выглядела бы как `open => closed`. Можно использовать подстановочные знаки для сопоставления любого состояния с целевым, например `* => closed`, а ключевое слово `void` использовалось для состояний входа и выхода. Например: `* => void` для когда элемент покидает представление или `void => *` для когда элемент входит в представление.

Эти паттерны сопоставления состояний вообще не нужны при прямой анимации с CSS. Можно управлять применением переходов и анимаций `@keyframes` на основе любых классов и/или стилей, установленных на элементах. Также можно добавить `@starting-style` для управления внешним видом элемента сразу после его появления в DOM.

### Автоматическое вычисление свойств с подстановочными знаками {#automatic-property-calculation-with-wildcards}

Пакет анимаций предоставлял возможность анимировать вещи, которые исторически было сложно анимировать, например, анимацию фиксированной высоты до `height: auto`. Теперь это можно сделать и с помощью чистого CSS.

#### С пакетом Animations {#with-animations-package}

<docs-code-multifile>
    <docs-code header="auto-height.ts" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.ts" />
    <docs-code header="auto-height.html" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.html" />
    <docs-code header="auto-height.css" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.css" />
</docs-code-multifile>

Для анимации до авто-высоты можно использовать css-grid.

#### С нативным CSS {#with-native-css}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/auto-height.ts">
    <docs-code header="auto-height.ts" path="adev/src/content/examples/animations/src/app/native-css/auto-height.ts" />
    <docs-code header="auto-height.html" path="adev/src/content/examples/animations/src/app/native-css/auto-height.html" />
    <docs-code header="auto-height.css" path="adev/src/content/examples/animations/src/app/native-css/auto-height.css"  />
</docs-code-multifile>

Если не нужно беспокоиться о поддержке всех браузеров, также можно обратить внимание на `calc-size()` — истинное решение для анимации авто-высоты. Подробнее см. в [документации MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/calc-size) и [этом туториале](https://frontendmasters.com/blog/one-of-the-boss-battles-of-css-is-almost-won-transitioning-to-auto/).

### Анимация входа и выхода из представления {#animate-entering-and-leaving-a-view}

Пакет анимаций предлагал упомянутое сопоставление паттернов для входа и выхода, а также сокращённые псевдонимы `:enter` и `:leave`.

#### С пакетом Animations {#with-animations-package}

<docs-code-multifile>
    <docs-code header="insert-remove.ts" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.ts" />
    <docs-code header="insert-remove.html" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.html" />
    <docs-code header="insert-remove.css" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.css" />
</docs-code-multifile>

#### С нативным CSS {#with-native-css}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/insert.ts">
    <docs-code header="insert.ts" path="adev/src/content/examples/animations/src/app/native-css/insert.ts" />
    <docs-code header="insert.html" path="adev/src/content/examples/animations/src/app/native-css/insert.html" />
    <docs-code header="insert.css" path="adev/src/content/examples/animations/src/app/native-css/insert.css"  />
</docs-code-multifile>

#### С нативным CSS {#with-native-css}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/remove.ts">
    <docs-code header="remove.ts" path="adev/src/content/examples/animations/src/app/native-css/remove.ts" />
    <docs-code header="remove.html" path="adev/src/content/examples/animations/src/app/native-css/remove.html" />
    <docs-code header="remove.css" path="adev/src/content/examples/animations/src/app/native-css/remove.css"  />
</docs-code-multifile>

Подробнее об `animate.enter` и `animate.leave` см. в [руководстве по анимациям входа и выхода](guide/animations).

### Анимация инкремента и декремента {#animating-increment-and-decrement}

Наряду с упомянутыми `:enter` и `:leave` существуют также `:increment` и `:decrement`. Их также можно анимировать, добавляя и удаляя классы. В отличие от встроенных псевдонимов пакета анимаций, здесь нет автоматического применения классов при увеличении или уменьшении значений. Нужные классы можно применять программно. Пример:

#### С пакетом Animations {#with-animations-package}

<docs-code-multifile>
    <docs-code header="increment-decrement.ts" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.ts" />
    <docs-code header="increment-decrement.html" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.html" />
    <docs-code header="increment-decrement.css" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.css" />
</docs-code-multifile>

#### С нативным CSS {#with-native-css}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.ts">
    <docs-code header="increment-decrement.ts" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.ts" />
    <docs-code header="increment-decrement.html" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.html" />
    <docs-code header="increment-decrement.css" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.css" />
</docs-code-multifile>

### Родительские и дочерние анимации {#parent-child-animations}

В отличие от пакета анимаций, при наличии нескольких анимаций в данном компоненте ни одна анимация не имеет приоритета перед другой, и ничто не блокирует запуск анимации. Любая последовательность анимаций должна определяться в CSS-определении анимации с использованием задержки анимации/перехода и/или с помощью `animationend` или `transitionend` для добавления следующего анимируемого CSS.

### Отключение анимации или всех анимаций {#disabling-an-animation-or-all-animations}

При использовании нативных CSS-анимаций для отключения заданных анимаций есть несколько вариантов.

1. Создайте пользовательский класс, принудительно устанавливающий animation и transition в `none`.

```css
.no-animation {
  animation: none !important;
  transition: none !important;
}
```

Применение этого класса к элементу предотвращает запуск любой анимации на нём. Альтернативно можно применить это ко всему DOM или его разделу для принудительного применения такого поведения. Однако это предотвращает срабатывание событий анимации. Если ожидаются события анимации для удаления элемента, это решение не подойдёт. Обходной путь — установить продолжительность в 1 миллисекунду.

2. Используйте медиа-запрос [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), чтобы анимации не воспроизводились для пользователей, предпочитающих меньше анимации.

3. Программно предотвратить добавление классов анимации.

### Обратные вызовы анимации {#animation-callbacks}

Пакет анимаций предоставлял обратные вызовы для использования в случае, если нужно что-то сделать по завершении анимации. Нативные CSS-анимации также имеют эти обратные вызовы.

[`OnAnimationStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationstart_event)
[`OnAnimationEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event)
[`OnAnimationIteration`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationitration_event)
[`OnAnimationCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationcancel_event)

[`OnTransitionStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionstart_event)
[`OnTransitionRun`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionrun_event)
[`OnTransitionEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event)
[`OnTransitionCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitioncancel_event)

Web Animations API предоставляет множество дополнительных функций. [Ознакомьтесь с документацией](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API), чтобы увидеть все доступные API анимации.

ПРИМЕЧАНИЕ: Обратите внимание на проблемы с всплытием этих обратных вызовов. При анимации дочерних и родительских элементов события всплывают от дочерних к родительским. Рассмотрите возможность остановки распространения или проверки дополнительных деталей внутри события, чтобы убедиться, что реагируете на нужный целевой элемент, а не на событие, всплывшее от дочернего узла. Можно проверить свойство `animationname` или анимируемые свойства, чтобы убедиться, что обрабатываются нужные узлы.

## Сложные последовательности {#complex-sequences}

Пакет анимаций имеет встроенную функциональность для создания сложных последовательностей. Все эти последовательности полностью возможны без пакета анимаций.

### Выбор конкретных элементов {#targeting-specific-elements}

В пакете анимаций можно было выбирать конкретные элементы с помощью функции `query()` для поиска конкретных элементов по CSS-имени класса, аналогично [`document.querySelector()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector). В мире нативных CSS-анимаций это не нужно. Вместо этого можно использовать CSS-селекторы для выбора подклассов и применения нужных `transform` или `animation`.

Для переключения классов дочерних узлов в шаблоне можно использовать привязки классов и стилей для добавления анимаций в нужные моменты.

### `stagger()` {#stagger}

Функция `stagger()` позволяла задерживать анимацию каждого элемента в списке на указанное время для создания каскадного эффекта. Это поведение можно воспроизвести в нативном CSS, используя `animation-delay` или `transition-delay`. Пример того, как может выглядеть такой CSS:

#### С пакетом Animations {#with-animations-package}

<docs-code-multifile>
    <docs-code header="stagger.ts" path="adev/src/content/examples/animations/src/app/animations-package/stagger.ts" />
    <docs-code header="stagger.html" path="adev/src/content/examples/animations/src/app/animations-package/stagger.html" />
    <docs-code header="stagger.css" path="adev/src/content/examples/animations/src/app/animations-package/stagger.css" />
</docs-code-multifile>

#### С нативным CSS {#with-native-css}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/stagger.ts">
    <docs-code header="stagger.ts" path="adev/src/content/examples/animations/src/app/native-css/stagger.ts" />
    <docs-code header="stagger.html" path="adev/src/content/examples/animations/src/app/native-css/stagger.html" />
    <docs-code header="stagger.css" path="adev/src/content/examples/animations/src/app/native-css/stagger.css" />
</docs-code-multifile>

### Параллельные анимации {#parallel-animations}

В пакете анимаций есть функция `group()` для воспроизведения нескольких анимаций одновременно. В CSS полный контроль над таймингом анимации находится у вас. При наличии нескольких определённых анимаций можно применить их все одновременно.

```css
.target-element {
  animation:
    rotate 3s,
    fade-in 2s;
}
```

В этом примере анимации `rotate` и `fade-in` запускаются одновременно.

### Анимация элементов переупорядочиваемого списка {#animating-the-items-of-a-reordering-list}

Переупорядочивание элементов в списке работает из коробки с использованием описанных ранее техник. Никакой дополнительной специальной работы не требуется. Элементы в цикле `@for` будут корректно удаляться и добавляться снова, что запустит анимации с использованием `@starting-styles` для анимаций входа. Альтернативно для того же поведения можно использовать `animate.enter`. Используйте `animate.leave` для анимации элементов при их удалении, как показано в примере выше.

#### С пакетом Animations {#with-animations-package}

<docs-code-multifile>
    <docs-code header="reorder.ts" path="adev/src/content/examples/animations/src/app/animations-package/reorder.ts" />
    <docs-code header="reorder.html" path="adev/src/content/examples/animations/src/app/animations-package/reorder.html" />
    <docs-code header="reorder.css" path="adev/src/content/examples/animations/src/app/animations-package/reorder.css" />
</docs-code-multifile>

#### С нативным CSS {#with-native-css}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/reorder.ts">
    <docs-code header="reorder.ts" path="adev/src/content/examples/animations/src/app/native-css/reorder.ts" />
    <docs-code header="reorder.html" path="adev/src/content/examples/animations/src/app/native-css/reorder.html" />
    <docs-code header="reorder.css" path="adev/src/content/examples/animations/src/app/native-css/reorder.css" />
</docs-code-multifile>

## Миграция использования AnimationPlayer {#migrating-usages-of-animationplayer}

Класс `AnimationPlayer` предоставлял доступ к анимации для выполнения более сложных действий, таких как пауза, воспроизведение, перезапуск и завершение анимации через код. Всё это можно реализовать и нативно.

Анимации с элемента можно получить напрямую с помощью [`Element.getAnimations()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations). Это возвращает массив каждой [`Animation`](https://developer.mozilla.org/en-US/docs/Web/API/Animation) на этом элементе. Можно использовать API `Animation` для значительно большего, чем предлагал `AnimationPlayer` из пакета анимаций. Отсюда можно вызвать `cancel()`, `play()`, `pause()`, `reverse()` и многое другое. Этот нативный API должен предоставить всё необходимое для управления анимациями.

## Переходы маршрутов {#route-transitions}

Для анимации переходов между маршрутами можно использовать переходы представлений. Начало работы см. в [руководстве по анимациям переходов маршрутов](guide/routing/route-transition-animations).
