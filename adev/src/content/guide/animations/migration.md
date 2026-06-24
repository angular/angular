# Миграция с пакета Angular Animations

Пакет `@angular/animations` объявлен устаревшим (deprecated) начиная с версии 20.2, в которой также были представлены
новые функции `animate.enter` и `animate.leave` для добавления анимаций в ваше приложение. Используя эти новые
возможности, вы можете заменить все анимации, основанные на `@angular/animations`, на чистый CSS или JS-библиотеки
анимации. Удаление `@angular/animations` из приложения может значительно уменьшить размер JavaScript-бандла. Нативные
CSS-анимации обычно обеспечивают лучшую производительность, так как могут использовать аппаратное ускорение. Это
руководство описывает процесс рефакторинга кода с `@angular/animations` на нативные CSS-анимации.

## Как писать анимации на нативном CSS

Если вы никогда не писали нативные CSS-анимации, существует множество отличных руководств, которые помогут вам начать.
Вот некоторые из них:
[Руководство по CSS-анимациям от MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)
[Руководство по CSS3-анимациям от W3Schools](https://www.w3schools.com/css/css3_animations.asp)
[Полное руководство по CSS-анимациям](https://www.lambdatest.com/blog/css-animations-tutorial/)
[CSS-анимация для начинающих](https://thoughtbot.com/blog/css-animation-for-beginners)

и пара видео:
[Изучите CSS-анимацию за 9 минут](https://www.youtube.com/watch?v=z2LQYsZhsFw)
[Плейлист с уроками по CSS-анимации от Net Ninja](https://www.youtube.com/watch?v=jgw82b5Y2MU&list=PL4cUxeGkcC9iGYgmEd2dm3zAKzyCGDtM5)

Ознакомьтесь с некоторыми из этих руководств и уроков, а затем возвращайтесь к этому руководству.

## Создание переиспользуемых анимаций

Как и в случае с пакетом animations, вы можете создавать переиспользуемые анимации, общие для всего приложения. В версии
с пакетом animations для этого использовалась функция `animation()` в общем TypeScript-файле. Версия на нативном CSS
похожа, но находится в общем CSS-файле.

#### С пакетом Animations

<docs-code header="animations.ts" path="adev/src/content/examples/animations/src/app/animations.1.ts" region="animation-example"/>

#### С нативным CSS

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-shared"/>

Добавление класса `animated-class` к элементу запустит анимацию на этом элементе.

## Анимация перехода (Transition)

### Анимация состояния и стилей

Пакет animations позволял определять различные состояния с помощью функции [`state()`](api/animations/state) внутри
компонента. Примерами могут служить состояния `open` или `closed`, содержащие стили для каждого соответствующего
состояния внутри определения. Например:

#### С пакетом Animations

<docs-code header="open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.ts" region="state1"/>

Такого же поведения можно добиться нативно, используя CSS-классы с keyframe-анимацией или стилизацией переходов (
transitions).

#### С нативным CSS

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-states"/>

Запуск состояния `open` или `closed` осуществляется путем переключения классов на элементе в вашем компоненте. Примеры
того, как это сделать, можно найти в
нашем [руководстве по шаблонам](guide/templates/binding#css-class-and-style-property-bindings).

Вы можете увидеть похожие примеры в руководстве по шаблонам
для [прямой анимации стилей](guide/templates/binding#css-style-properties).

### Переходы, тайминг и плавность (Easing)

Функция `animate()` из пакета animations позволяет задавать тайминг, например, длительность, задержки и плавность (
easing). Это можно сделать нативно с помощью CSS, используя несколько CSS-свойств или сокращенные свойства (shorthand).

Укажите `animation-duration`, `animation-delay` и `animation-timing-function` для keyframe-анимации в CSS или
используйте сокращенное свойство `animation`.

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-timing"/>

Аналогично, вы можете использовать `transition-duration`, `transition-delay`, `transition-timing-function` и сокращение
`transition` для анимаций, которые не используют `@keyframes`.

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="transition-timing"/>

### Запуск анимации

Пакет animations требовал указания триггеров с помощью функции `trigger()` и вложения всех состояний внутрь нее. С
нативным CSS это не нужно. Анимации могут запускаться переключением CSS-стилей или классов. Как только класс появляется
на элементе, происходит анимация. Удаление класса вернет элемент к тому CSS, который определен для этого элемента. Это
приводит к значительно меньшему количеству кода для выполнения той же анимации. Вот пример:

#### С пакетом Animations

<docs-code-multifile>
    <docs-code header="open-close.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/open-close.component.ts" />
    <docs-code header="open-close.component.html" path="adev/src/content/examples/animations/src/app/animations-package/open-close.component.html" />
    <docs-code header="open-close.component.css" path="adev/src/content/examples/animations/src/app/animations-package/open-close.component.css"/>
</docs-code-multifile>

#### С нативным CSS

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/open-close.component.ts">
    <docs-code header="open-close.component.ts" path="adev/src/content/examples/animations/src/app/native-css/open-close.component.ts" />
    <docs-code header="open-close.component.html" path="adev/src/content/examples/animations/src/app/native-css/open-close.component.html" />
    <docs-code header="open-close.component.css" path="adev/src/content/examples/animations/src/app/native-css/open-close.component.css"/>
</docs-code-multifile>

## Переходы и триггеры

### Предопределенные состояния и сопоставление с подстановочными знаками (wildcards)

Пакет animations предлагает возможность сопоставлять определенные вами состояния с переходом через строки. Например,
анимация от открытого к закрытому будет `open => closed`. Вы можете использовать подстановочные знаки (wildcards) для
сопоставления любого состояния с целевым состоянием, например `* => closed`, а ключевое слово `void` можно использовать
для состояний входа и выхода. Например: `* => void`, когда элемент покидает представление, или `void => *`, когда
элемент входит в представление.

Эти шаблоны сопоставления состояний вообще не нужны при анимации напрямую через CSS. Вы можете управлять тем, какие
переходы и анимации `@keyframes` применяются, основываясь на любых установленных вами классах и/или стилях элементов. Вы
также можете добавить `@starting-style`, чтобы контролировать, как элемент выглядит при непосредственном появлении в
DOM.

### Автоматический расчет свойств с помощью Wildcards

Пакет animations предлагает возможность анимировать вещи, которые исторически было сложно анимировать, например,
анимацию фиксированной высоты в `height: auto`. Теперь вы можете делать это и на чистом CSS.

#### С пакетом Animations

<docs-code-multifile>
    <docs-code header="auto-height.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.component.ts" />
    <docs-code header="auto-height.component.html" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.component.html" />
    <docs-code header="auto-height.component.css" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.component.css" />
</docs-code-multifile>

Вы можете использовать css-grid для анимации к автоматической высоте.

#### С нативным CSS

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/auto-height.component.ts">
    <docs-code header="auto-height.component.ts" path="adev/src/content/examples/animations/src/app/native-css/auto-height.component.ts" />
    <docs-code header="auto-height.component.html" path="adev/src/content/examples/animations/src/app/native-css/auto-height.component.html" />
    <docs-code header="auto-height.component.css" path="adev/src/content/examples/animations/src/app/native-css/auto-height.component.css"  />
</docs-code-multifile>

Если вам не нужно беспокоиться о поддержке всех браузеров, вы также можете проверить `calc-size()`, что является
истинным решением для анимации автоматической высоты.
См. [документацию MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/calc-size)
и [этот урок](https://frontendmasters.com/blog/one-of-the-boss-battles-of-css-is-almost-won-transitioning-to-auto/) для
получения дополнительной информации.

### Анимация входа и выхода из представления

Пакет animations предлагал упомянутое ранее сопоставление шаблонов для входа и выхода, а также включал сокращенные
псевдонимы `:enter` и `:leave`.

#### С пакетом Animations

<docs-code-multifile>
    <docs-code header="insert-remove.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.component.ts" />
    <docs-code header="insert-remove.component.html" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.component.html" />
    <docs-code header="insert-remove.component.css" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.component.css" />
</docs-code-multifile>

Вот как то же самое можно выполнить без пакета animations, используя `animate.enter`.

#### С нативным CSS

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/insert.component.ts">
    <docs-code header="insert.component.ts" path="adev/src/content/examples/animations/src/app/native-css/insert.component.ts" />
    <docs-code header="insert.component.html" path="adev/src/content/examples/animations/src/app/native-css/insert.component.html" />
    <docs-code header="insert.component.css" path="adev/src/content/examples/animations/src/app/native-css/insert.component.css"  />
</docs-code-multifile>

Используйте `animate.leave` для анимации элементов, когда они покидают представление, что применит указанные CSS-классы
к элементу в момент его выхода.

#### С нативным CSS

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/remove.component.ts">
    <docs-code header="remove.component.ts" path="adev/src/content/examples/animations/src/app/native-css/remove.component.ts" />
    <docs-code header="remove.component.html" path="adev/src/content/examples/animations/src/app/native-css/remove.component.html" />
    <docs-code header="remove.component.css" path="adev/src/content/examples/animations/src/app/native-css/remove.component.css"  />
</docs-code-multifile>

Для получения дополнительной информации о `animate.enter` и `animate.leave`
см. [руководство по анимациям входа и выхода](guide/animations).

### Анимация увеличения и уменьшения (increment/decrement)

Наряду с вышеупомянутыми `:enter` и `:leave`, существуют также `:increment` и `:decrement`. Вы также можете анимировать
их, добавляя и удаляя классы. В отличие от встроенных псевдонимов пакета анимации, здесь нет автоматического применения
классов при увеличении или уменьшении значений. Вы можете применять соответствующие классы программно. Вот пример:

#### С пакетом Animations

<docs-code-multifile>
    <docs-code header="increment-decrement.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.component.ts" />
    <docs-code header="increment-decrement.component.html" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.component.html" />
    <docs-code header="increment-decrement.component.css" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.component.css" />
</docs-code-multifile>

#### С нативным CSS

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.component.ts">
    <docs-code header="increment-decrement.component.ts" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.component.ts" />
    <docs-code header="increment-decrement.component.html" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.component.html" />
    <docs-code header="increment-decrement.component.css" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.component.css" />
</docs-code-multifile>

### Анимации родительских и дочерних элементов

В отличие от пакета animations, когда в данном компоненте указано несколько анимаций, ни одна анимация не имеет
приоритета над другой, и ничто не блокирует запуск любой анимации. Любая последовательность анимаций должна
обрабатываться вашим определением CSS-анимации, используя задержку анимации/перехода (delay), и/или используя
`animationend` или `transitionend` для обработки добавления следующего CSS для анимации.

### Отключение одной или всех анимаций

С нативными CSS-анимациями, если вы хотите отключить указанные вами анимации, у вас есть несколько вариантов.

1. Создать пользовательский класс, который принудительно устанавливает animation и transition в `none`.

```css
.no-animation {
  animation: none !important;
  transition: none !important;
}
```

Применение этого класса к элементу предотвращает запуск любой анимации на этом элементе. Вы также можете применить это
ко всему DOM или разделу DOM, чтобы обеспечить такое поведение. Однако это предотвращает срабатывание событий анимации.
Если вы ожидаете событий анимации для удаления элемента, это решение не сработает. Обходной путь — установить
длительность в 1 миллисекунду.

2. Использовать медиа-запрос [
   `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), чтобы
   гарантировать отсутствие анимации для пользователей, предпочитающих меньше движения.

3. Предотвратить добавление классов анимации программно.

### Колбэки анимации

Пакет animations предоставлял колбэки для использования в случае, если вы хотите сделать что-то, когда анимация
завершилась. Нативные CSS-анимации также имеют эти колбэки.

[`OnAnimationStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationstart_event)
[`OnAnimationEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event)
[`OnAnimationIteration`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationitration_event)
[`OnAnimationCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationcancel_event)

[`OnTransitionStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionstart_event)
[`OnTransitionRun`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionrun_event)
[`OnTransitionEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event)
[`OnTransitionCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitioncancel_event)

Web Animations API имеет много дополнительных функциональных
возможностей. [Взгляните на документацию](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API), чтобы
увидеть все доступные API анимации.

ПРИМЕЧАНИЕ: Помните о проблемах всплытия (bubbling) с этими колбэками. Если вы анимируете дочерние и родительские
элементы, события всплывают от детей к родителям. Рассмотрите возможность остановки распространения (propagation) или
просмотра более подробной информации внутри события, чтобы определить, реагируете ли вы на желаемую цель события, а не
на событие, всплывающее от дочернего узла. Вы можете проверить свойство `animationname` или свойства, в которых
происходит переход, чтобы убедиться, что у вас правильные узлы.

## Сложные последовательности

Пакет animations имеет встроенную функциональность для создания сложных последовательностей. Все эти последовательности
полностью возможны без пакета animations.

### Выбор конкретных элементов

В пакете animations вы могли выбирать конкретные элементы, используя функцию `query()` для поиска элементов по имени
CSS-класса, аналогично [
`document.querySelector()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector). В мире нативных
CSS-анимаций это не нужно. Вместо этого вы можете использовать свои CSS-селекторы для выбора подклассов и применения
любого желаемого `transform` или `animation`.

Чтобы переключать классы для дочерних узлов внутри шаблона, вы можете использовать привязки классов и стилей для
добавления анимаций в нужные моменты.

### Stagger()

Функция `stagger()` позволяла задерживать анимацию каждого элемента в списке элементов на определенное время для
создания каскадного эффекта. Вы можете воспроизвести это поведение в нативном CSS, используя `animation-delay` или
`transition-delay`. Вот пример того, как может выглядеть этот CSS.

#### С пакетом Animations

<docs-code-multifile>
    <docs-code header="stagger.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/stagger.component.ts" />
    <docs-code header="stagger.component.html" path="adev/src/content/examples/animations/src/app/animations-package/stagger.component.html" />
    <docs-code header="stagger.component.css" path="adev/src/content/examples/animations/src/app/animations-package/stagger.component.css" />
</docs-code-multifile>

#### С нативным CSS

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/stagger.component.ts">
    <docs-code header="stagger.component.ts" path="adev/src/content/examples/animations/src/app/native-css/stagger.component.ts" />
    <docs-code header="stagger.component.html" path="adev/src/content/examples/animations/src/app/native-css/stagger.component.html" />
    <docs-code header="stagger.component.css" path="adev/src/content/examples/animations/src/app/native-css/stagger.component.css" />
</docs-code-multifile>

### Параллельные анимации

Пакет animations имеет функцию `group()` для воспроизведения нескольких анимаций одновременно. В CSS у вас есть полный
контроль над таймингом анимации. Если у вас определено несколько анимаций, вы можете применить их все сразу.

```css
.target-element {
  animation: rotate 3s, fade-in 2s;
}
```

В этом примере анимации `rotate` и `fade-in` запускаются одновременно.

### Анимация элементов переупорядочиваемого списка

Переупорядочивание элементов в списке работает "из коробки" с использованием описанных ранее техник. Никакой
дополнительной специальной работы не требуется. Элементы в цикле `@for` будут удаляться и добавляться правильно, что
запустит анимации с использованием `@starting-styles` для анимаций входа. В качестве альтернативы вы можете использовать
`animate.enter` для того же поведения. Используйте `animate.leave` для анимации элементов при их удалении, как показано
в примере выше.

#### С пакетом Animations

<docs-code-multifile>
    <docs-code header="reorder.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/reorder.component.ts" />
    <docs-code header="reorder.component.html" path="adev/src/content/examples/animations/src/app/animations-package/reorder.component.html" />
    <docs-code header="reorder.component.css" path="adev/src/content/examples/animations/src/app/animations-package/reorder.component.css" />
</docs-code-multifile>

#### С нативным CSS

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/reorder.component.ts">
    <docs-code header="reorder.component.ts" path="adev/src/content/examples/animations/src/app/native-css/reorder.component.ts" />
    <docs-code header="reorder.component.html" path="adev/src/content/examples/animations/src/app/native-css/reorder.component.html" />
    <docs-code header="reorder.component.css" path="adev/src/content/examples/animations/src/app/native-css/reorder.component.css" />
</docs-code-multifile>

## Миграция использования AnimationPlayer

Класс `AnimationPlayer` позволяет получить доступ к анимации для выполнения более сложных действий, таких как пауза,
воспроизведение, перезапуск и завершение анимации через код. Все эти вещи также можно обрабатывать нативно.

Вы можете получить анимации непосредственно с элемента, используя [
`Element.getAnimations()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations). Это возвращает
массив всех [`Animation`](https://developer.mozilla.org/en-US/docs/Web/API/Animation) на этом элементе. Вы можете
использовать API `Animation`, чтобы сделать гораздо больше, чем вы могли бы с тем, что предлагал `AnimationPlayer` из
пакета animations. Отсюда вы можете вызывать `cancel()`, `play()`, `pause()`, `reverse()` и многое другое. Этот нативный
API должен предоставить все необходимое для управления вашими анимациями.

## Переходы маршрутов (Route Transitions)

Вы можете использовать View Transitions для анимации между маршрутами.
См. [Руководство по анимации переходов маршрутов](guide/routing/route-transition-animations), чтобы начать.
