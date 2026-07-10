# Анимация приложения с CSS

CSS предлагает мощный набор инструментов для создания красивых и вовлекающих анимаций в приложении.

## Как писать анимации на нативном CSS {#how-to-write-animations-in-native-css}

Если вы никогда не писали нативные CSS-анимации, есть ряд отличных руководств для старта. Вот некоторые из них:
[MDN's CSS Animations guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)
[W3Schools CSS3 Animations guide](https://www.w3schools.com/css/css3_animations.asp)
[The Complete CSS Animations Tutorial](https://www.lambdatest.com/blog/css-animations-tutorial/)
[CSS Animation for Beginners](https://thoughtbot.com/blog/css-animation-for-beginners)

и несколько видео:
[Learn CSS Animation in 9 Minutes](https://www.youtube.com/watch?v=z2LQYsZhsFw)
[Net Ninja CSS Animation Tutorial Playlist](https://www.youtube.com/watch?v=jgw82b5Y2MU&list=PL4cUxeGkcC9iGYgmEd2dm3zAKzyCGDtM5)

Изучите эти руководства и туториалы, затем вернитесь к этому гайду.

## Создание переиспользуемых анимаций {#creating-reusable-animations}

Можно создавать переиспользуемые анимации, которыми можно делиться по всему приложению, используя `@keyframes`. Определите keyframe-анимации в общем CSS-файле — и сможете переиспользовать их где угодно в приложении.

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-shared"/>

Добавление класса `animated-class` к элементу запустит анимацию на этом элементе.

## Анимация перехода {#animating-a-transition}

### Анимация состояния и стилей {#animating-state-and-styles}

Может понадобиться анимировать переход между двумя состояниями — например, когда элемент открыт или закрыт. Это можно сделать через CSS-классы — с keyframe-анимацией или transition-стилями.

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-states"/>

Состояние `open` или `closed` включается переключением классов на элементе в компоненте. Примеры — в нашем [руководстве по шаблонам](guide/templates/binding#css-class-and-style-property-bindings).

Похожие примеры — в руководстве по шаблонам для [прямой анимации стилей](guide/templates/binding#css-style-properties).

### Transitions, Timing и Easing {#transitions-timing-and-easing}

Анимация часто требует настройки тайминга, задержек и easing. Это делается через несколько CSS-свойств или shorthand-свойства.

Задайте `animation-duration`, `animation-delay` и `animation-timing-function` для keyframe-анимации в CSS либо используйте shorthand-свойство `animation`.

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-timing"/>

Аналогично можно использовать `transition-duration`, `transition-delay` и `transition-timing-function` и shorthand `transition` для анимаций без `@keyframes`.

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="transition-timing"/>

### Запуск анимации {#triggering-an-animation}

Анимации запускаются переключением CSS-стилей или классов. Как только класс присутствует на элементе, анимация произойдёт. Удаление класса вернёт элемент к CSS, определённому для него. Пример:

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/open-close.ts">
    <docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/native-css/open-close.ts" />
    <docs-code header="open-close.html" path="adev/src/content/examples/animations/src/app/native-css/open-close.html" />
    <docs-code header="open-close.css" path="adev/src/content/examples/animations/src/app/native-css/open-close.css"/>
</docs-code-multifile>

## Transition и Triggers {#transition-and-triggers}

### Анимация Auto Height {#animating-auto-height}

Можно использовать CSS Grid для анимации к auto height.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/auto-height.ts">
    <docs-code header="auto-height.ts" path="adev/src/content/examples/animations/src/app/native-css/auto-height.ts" />
    <docs-code header="auto-height.html" path="adev/src/content/examples/animations/src/app/native-css/auto-height.html" />
    <docs-code header="auto-height.css" path="adev/src/content/examples/animations/src/app/native-css/auto-height.css"  />
</docs-code-multifile>

Если не нужно поддерживать все браузеры, также посмотрите `calc-size()` — настоящее решение для анимации auto height. Подробнее — в [документации MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/calc-size) и [этом туториале](https://frontendmasters.com/blog/one-of-the-boss-battles-of-css-is-almost-won-transitioning-to-auto/).

### Анимация появления и ухода из view {#animate-entering-and-leaving-a-view}

Можно создавать анимации для появления элемента во view или ухода из view. Начнём с анимации появления. Используем `animate.enter`, который применяет классы анимации, когда элемент входит во view.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/insert.ts">
    <docs-code header="insert.ts" path="adev/src/content/examples/animations/src/app/native-css/insert.ts" />
    <docs-code header="insert.html" path="adev/src/content/examples/animations/src/app/native-css/insert.html" />
    <docs-code header="insert.css" path="adev/src/content/examples/animations/src/app/native-css/insert.css"  />
</docs-code-multifile>

Анимация элемента при уходе из view похожа на анимацию появления. Используйте `animate.leave`, чтобы указать, какие CSS-классы применить, когда элемент покидает view.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/remove.ts">
    <docs-code header="remove.ts" path="adev/src/content/examples/animations/src/app/native-css/remove.ts" />
    <docs-code header="remove.html" path="adev/src/content/examples/animations/src/app/native-css/remove.html" />
    <docs-code header="remove.css" path="adev/src/content/examples/animations/src/app/native-css/remove.css"  />
</docs-code-multifile>

Подробнее о `animate.enter` и `animate.leave` — в [руководстве по Enter и Leave анимациям](guide/animations).

### Анимация increment и decrement {#animating-increment-and-decrement}

Анимация при increment и decrement — распространённый паттерн в приложениях. Вот пример, как этого добиться.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.ts">
    <docs-code header="increment-decrement.ts" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.ts" />
    <docs-code header="increment-decrement.html" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.html" />
    <docs-code header="increment-decrement.css" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.css" />
</docs-code-multifile>

### Отключение анимации или всех анимаций {#disabling-an-animation-or-all-animations}

Если нужно отключить указанные анимации, есть несколько вариантов.

1. Создайте кастомный класс, который принудительно задаёт animation и transition в `none`.

```css
.no-animation {
  animation: none !important;
  transition: none !important;
}
```

Применение этого класса к элементу предотвращает запуск любой анимации на нём. Можно также ограничить область действия всем DOM или секцией DOM. Однако это предотвращает срабатывание событий анимации. Если вы ждёте события анимации для удаления элемента, это решение не подойдёт. Обходной путь — задать длительности в 1 миллисекунду.

2. Используйте media query [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), чтобы анимации не воспроизводились для пользователей, предпочитающих меньше анимации.

3. Не добавляйте классы анимации программно

### Callback'и анимации {#animation-callbacks}

Если есть действия, которые нужно выполнить в определённые моменты анимаций, есть ряд доступных событий, на которые можно подписаться. Вот некоторые из них.

[`OnAnimationStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationstart_event)  
[`OnAnimationEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event)  
[`OnAnimationIteration`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationitration_event)  
[`OnAnimationCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationcancel_event)

[`OnTransitionStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionstart_event)  
[`OnTransitionRun`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionrun_event)  
[`OnTransitionEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event)  
[`OnTransitionCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitioncancel_event)

У Web Animations API много дополнительных возможностей. [Смотрите документацию](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API), чтобы увидеть все доступные animation API.

NOTE: Учитывайте проблемы bubbling с этими callback'ами. Если анимируете детей и родителей, события всплывают от детей к родителям. Рассмотрите остановку propagation или просмотр деталей события, чтобы реагировать на нужный target, а не на событие, всплывшее от дочернего узла. Можно проверить свойство `animationname` или свойства, участвующие в transition, чтобы убедиться, что у вас правильные узлы.

## Сложные последовательности {#complex-sequences}

Анимации часто сложнее простого fade in или fade out. Может быть много сложных последовательностей анимаций. Рассмотрим некоторые из таких сценариев.

### Stagger-анимации в списке {#staggering-animations-in-a-list}

Распространённый эффект — stagger-анимации каждого элемента списка для cascade-эффекта. Это достигается через `animation-delay` или `transition-delay`. Пример того, как может выглядеть такой CSS.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/stagger.ts">
    <docs-code header="stagger.ts" path="adev/src/content/examples/animations/src/app/native-css/stagger.ts" />
    <docs-code header="stagger.html" path="adev/src/content/examples/animations/src/app/native-css/stagger.html" />
    <docs-code header="stagger.css" path="adev/src/content/examples/animations/src/app/native-css/stagger.css" />
</docs-code-multifile>

### Параллельные анимации {#parallel-animations}

К элементу можно применить несколько анимаций сразу через shorthand-свойство `animation`. У каждой могут быть свои длительности и задержки. Это позволяет компоновать анимации и создавать сложные эффекты.

```css
.target-element {
  animation:
    rotate 3s,
    fade-in 2s;
}
```

В этом примере анимации `rotate` и `fade-in` запускаются одновременно, но имеют разные длительности.

### Анимация элементов переупорядочиваемого списка {#animating-the-items-of-a-reordering-list}

Элементы в цикле `@for` будут удаляться и добавляться заново, что запустит анимации с `@starting-styles` для entry-анимаций. Альтернативно можно использовать `animate.enter` для того же поведения. Используйте `animate.leave` для анимации элементов при удалении, как в примере ниже.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/reorder.ts">
    <docs-code header="reorder.ts" path="adev/src/content/examples/animations/src/app/native-css/reorder.ts" />
    <docs-code header="reorder.html" path="adev/src/content/examples/animations/src/app/native-css/reorder.html" />
    <docs-code header="reorder.css" path="adev/src/content/examples/animations/src/app/native-css/reorder.css" />
</docs-code-multifile>

## Программное управление анимациями {#programmatic-control-of-animations}

Анимации с элемента можно получить напрямую через [`Element.getAnimations()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations). Это возвращает массив каждого [`Animation`](https://developer.mozilla.org/en-US/docs/Web/API/Animation) на этом элементе. API `Animation` позволяет делать гораздо больше, чем предлагал `AnimationPlayer` из пакета animations. Отсюда можно `cancel()`, `play()`, `pause()`, `reverse()` и многое другое. Этот нативный API должен предоставить всё необходимое для управления анимациями.

## Дополнительно об анимациях Angular {#more-on-angular-animations}

Вас также могут заинтересовать:

<docs-pill-row>
  <docs-pill href="guide/animations" title="Enter and Leave animations"/>
  <docs-pill href="guide/routing/route-transition-animations" title="Route transition animations"/>
</docs-pill-row>
