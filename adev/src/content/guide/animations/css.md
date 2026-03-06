# Анимация приложения с помощью CSS {#animating-with-css}

CSS предлагает мощный набор инструментов для создания красивых и привлекательных анимаций в вашем приложении.

## Как писать анимации на нативном CSS {#how-to-write-native-css-animations}

Если вы никогда не писали нативные CSS-анимации, существует множество отличных руководств, которые помогут вам начать.
Вот некоторые из них:
[Руководство по CSS-анимациям от MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)
[Руководство по CSS3-анимациям от W3Schools](https://www.w3schools.com/css/css3_animations.asp)
[Полный учебник по CSS-анимациям](https://www.lambdatest.com/blog/css-animations-tutorial/)
[CSS-анимация для начинающих](https://thoughtbot.com/blog/css-animation-for-beginners)

и пара видео:
[Изучите CSS-анимацию за 9 минут](https://www.youtube.com/watch?v=z2LQYsZhsFw)
[Плейлист с уроками по CSS-анимации от Net Ninja](https://www.youtube.com/watch?v=jgw82b5Y2MU&list=PL4cUxeGkcC9iGYgmEd2dm3zAKzyCGDtM5)

Изучите некоторые из этих руководств и учебников, а затем возвращайтесь к этому руководству.

## Создание повторно используемых анимаций {#creating-reusable-animations}

Вы можете создавать повторно используемые анимации, общие для всего приложения, используя `@keyframes`. Определите
анимации ключевых кадров в общем CSS-файле, и вы сможете повторно использовать их в любом месте вашего приложения.

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-shared"/>

Добавление класса `animated-class` к элементу запустит анимацию на этом элементе.

## Анимация перехода {#transition-animations}

### Анимация состояния и стилей {#animating-state-and-styles}

Возможно, вы захотите анимировать переход между двумя различными состояниями, например, когда элемент открывается или
закрывается. Этого можно достичь с помощью CSS-классов, используя анимацию ключевых кадров или стилизацию переходов.

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-states"/>

Переключение состояний `open` или `closed` выполняется путём переключения классов на элементе в вашем компоненте.
Примеры того, как это сделать, можно найти в
нашем [руководстве по шаблонам](guide/templates/binding#css-class-and-style-property-bindings).

Похожие примеры [прямой анимации стилей](guide/templates/binding#css-style-properties) можно найти в руководстве по
шаблонам.

### Переходы, тайминг и плавность (Easing) {#transitions-timing-and-easing}

Анимация часто требует настройки времени, задержек и поведения плавности (easing). Это можно сделать с помощью
нескольких CSS-свойств или сокращённых свойств.

Укажите `animation-duration`, `animation-delay` и `animation-timing-function` для анимации ключевых кадров в CSS или
используйте сокращённое свойство `animation`.

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-timing"/>

Аналогично, вы можете использовать `transition-duration`, `transition-delay`, `transition-timing-function` и сокращение
`transition` для анимаций, которые не используют `@keyframes`.

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="transition-timing"/>

### Запуск анимации {#triggering-animations}

Анимации могут запускаться переключением CSS-стилей или классов. Как только класс появляется на элементе, происходит
анимация. Удаление класса вернёт элемент к исходному CSS, определённому для этого элемента. Вот пример:

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/open-close.ts">
    <docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/native-css/open-close.ts" />
    <docs-code header="open-close.html" path="adev/src/content/examples/animations/src/app/native-css/open-close.html" />
    <docs-code header="open-close.css" path="adev/src/content/examples/animations/src/app/native-css/open-close.css"/>
</docs-code-multifile>

## Переходы и триггеры {#transitions-and-triggers}

### Анимация автоматической высоты (Auto Height) {#auto-height-animation}

Вы можете использовать css-grid для анимации автоматической высоты.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/auto-height.ts">
    <docs-code header="auto-height.ts" path="adev/src/content/examples/animations/src/app/native-css/auto-height.ts" />
    <docs-code header="auto-height.html" path="adev/src/content/examples/animations/src/app/native-css/auto-height.html" />
    <docs-code header="auto-height.css" path="adev/src/content/examples/animations/src/app/native-css/auto-height.css"  />
</docs-code-multifile>

Если вам не нужно беспокоиться о поддержке всех браузеров, вы также можете обратить внимание на `calc-size()`, который
является настоящим решением для анимации автоматической высоты.
См. [документацию MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/calc-size)
и [этот учебник](https://frontendmasters.com/blog/one-of-the-boss-battles-of-css-is-almost-won-transitioning-to-auto/)
для получения дополнительной информации.

### Анимация входа и выхода из представления {#animating-entering-and-leaving-view}

Вы можете создавать анимации для моментов, когда элемент появляется в представлении или покидает его. Начнём с
рассмотрения того, как анимировать элемент, входящий в представление. Мы сделаем это с помощью `animate.enter`, который
применит классы анимации, когда элемент войдёт в представление.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/insert.ts">
    <docs-code header="insert.ts" path="adev/src/content/examples/animations/src/app/native-css/insert.ts" />
    <docs-code header="insert.html" path="adev/src/content/examples/animations/src/app/native-css/insert.html" />
    <docs-code header="insert.css" path="adev/src/content/examples/animations/src/app/native-css/insert.css"  />
</docs-code-multifile>

Анимация элемента при выходе из представления аналогична анимации при входе. Используйте `animate.leave`, чтобы указать,
какие CSS-классы применять, когда элемент покидает представление.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/remove.ts">
    <docs-code header="remove.ts" path="adev/src/content/examples/animations/src/app/native-css/remove.ts" />
    <docs-code header="remove.html" path="adev/src/content/examples/animations/src/app/native-css/remove.html" />
    <docs-code header="remove.css" path="adev/src/content/examples/animations/src/app/native-css/remove.css"  />
</docs-code-multifile>

Для получения дополнительной информации об `animate.enter` и `animate.leave` см. руководство
по [анимации входа и выхода](guide/animations).

### Анимация увеличения и уменьшения {#increment-and-decrement-animation}

Анимация при увеличении и уменьшении значений — распространённый паттерн в приложениях. Вот пример того, как можно
реализовать такое поведение.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.ts">
    <docs-code header="increment-decrement.ts" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.ts" />
    <docs-code header="increment-decrement.html" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.html" />
    <docs-code header="increment-decrement.css" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.css" />
</docs-code-multifile>

### Отключение одной или всех анимаций {#disabling-animations}

Если вы хотите отключить указанные вами анимации, у вас есть несколько вариантов.

1. Создайте пользовательский класс, который принудительно устанавливает анимацию и переход в значение `none`.

```css
.no-animation {
  animation: none !important;
  transition: none !important;
}
```

Применение этого класса к элементу предотвращает запуск любой анимации на этом элементе. В качестве альтернативы вы
можете применить это ко всему DOM или его части, чтобы принудительно использовать это поведение. Однако это
предотвращает срабатывание событий анимации. Если вы ожидаете событий анимации для удаления элемента, это решение не
сработает. Обходной путь — установить длительность в 1 миллисекунду.

2. Используйте медиа-запрос [
   `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), чтобы
   гарантировать отсутствие анимации для пользователей, которые предпочитают меньше движения.

3. Предотвратите программное добавление классов анимации.

### Колбэки анимации {#animation-callbacks}

Если у вас есть действия, которые вы хотите выполнить в определённые моменты анимации, существует ряд доступных событий,
которые можно прослушивать. Вот некоторые из них.

[`OnAnimationStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationstart_event)
[`OnAnimationEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event)
[`OnAnimationIteration`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationitration_event)
[`OnAnimationCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationcancel_event)

[`OnTransitionStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionstart_event)
[`OnTransitionRun`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionrun_event)
[`OnTransitionEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event)
[`OnTransitionCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitioncancel_event)

Web Animations API имеет множество дополнительных
функций. [Взгляните на документацию](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API), чтобы увидеть
все доступные API анимации.

NOTE: Помните о проблемах всплытия (bubbling) с этими колбэками. Если вы анимируете дочерние и родительские
элементы, события всплывают от детей к родителям. Рассмотрите возможность остановки распространения (stopping
propagation) или изучения деталей внутри события, чтобы определить, реагируете ли вы на желаемую цель события, а не на
событие, всплывающее от дочернего узла. Вы можете проверить свойство `animationname` или свойства, в которых происходит
переход, чтобы убедиться, что у вас правильные узлы.

## Сложные последовательности {#complex-sequences}

Анимации часто сложнее, чем простое появление или исчезновение. У вас могут быть сложные последовательности анимаций,
которые вы хотите запустить. Давайте рассмотрим некоторые из возможных сценариев.

### Каскадная анимация (Staggering) в списке {#staggering-animations-in-a-list}

Один из распространённых эффектов — каскадная анимация каждого элемента в списке для создания эффекта "лесенки". Этого
можно достичь, используя `animation-delay` или `transition-delay`. Вот пример того, как может выглядеть этот CSS.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/stagger.ts">
    <docs-code header="stagger.ts" path="adev/src/content/examples/animations/src/app/native-css/stagger.ts" />
    <docs-code header="stagger.html" path="adev/src/content/examples/animations/src/app/native-css/stagger.html" />
    <docs-code header="stagger.css" path="adev/src/content/examples/animations/src/app/native-css/stagger.css" />
</docs-code-multifile>

### Параллельные анимации {#parallel-animations}

Вы можете применить несколько анимаций к элементу одновременно, используя сокращённое свойство `animation`. Каждая из
них может иметь свою длительность и задержку. Это позволяет компоновать анимации вместе и создавать сложные эффекты.

```css
.target-element {
  animation:
    rotate 3s,
    fade-in 2s;
}
```

В этом примере анимации `rotate` и `fade-in` запускаются одновременно, но имеют разную длительность.

### Анимация элементов переупорядочиваемого списка {#animating-reorder-list-items}

Элементы в цикле `@for` будут удалены и добавлены заново, что запустит анимацию с использованием `@starting-styles` для
анимации входа. В качестве альтернативы вы можете использовать `animate.enter` для того же поведения. Используйте
`animate.leave` для анимации элементов при их удалении, как показано в примере ниже.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/reorder.ts">
    <docs-code header="reorder.ts" path="adev/src/content/examples/animations/src/app/native-css/reorder.ts" />
    <docs-code header="reorder.html" path="adev/src/content/examples/animations/src/app/native-css/reorder.html" />
    <docs-code header="reorder.css" path="adev/src/content/examples/animations/src/app/native-css/reorder.css" />
</docs-code-multifile>

## Программное управление анимацией {#programmatic-animation-control}

Вы можете получить анимации элемента напрямую, используя [
`Element.getAnimations()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations). Это возвращает
массив всех объектов [`Animation`](https://developer.mozilla.org/en-US/docs/Web/API/Animation) на этом элементе. Вы
можете использовать API `Animation`, чтобы сделать гораздо больше, чем предлагал `AnimationPlayer` из пакета animations.
Отсюда вы можете вызывать `cancel()`, `play()`, `pause()`, `reverse()` и многое другое. Этот нативный API должен
предоставить всё необходимое для управления вашими анимациями.

## Подробнее об анимациях в Angular {#more-on-angular-animations}

Вас также может заинтересовать следующее:

<docs-pill-row>
  <docs-pill href="guide/animations" title="Анимации входа и выхода"/>
  <docs-pill href="guide/routing/route-transition-animations" title="Анимации перехода между маршрутами"/>
</docs-pill-row>
