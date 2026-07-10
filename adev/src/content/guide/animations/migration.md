# Миграция с пакета Angular Animations

Пакет `@angular/animations` устарел начиная с v20.2, которая также представила новые возможности `animate.enter` и `animate.leave` для добавления анимаций в приложение. Используя эти новые возможности, можно заменить все анимации на основе `@angular/animations` обычным CSS или JS-библиотеками анимаций. Удаление `@angular/animations` из приложения может значительно уменьшить размер JavaScript-бандла. Нативные CSS-анимации обычно дают лучшую производительность, так как могут использовать аппаратное ускорение. Это руководство проводит через процесс рефакторинга кода с `@angular/animations` на нативные CSS-анимации.

## Как писать анимации на нативном CSS {#how-to-write-animations-in-native-css}

Если вы никогда не писали нативные CSS-анимации, есть ряд отличных руководств для старта. Вот некоторые из них:  
[MDN's CSS Animations guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)  
[W3Schools CSS3 Animations guide](https://www.w3schools.com/css/css3_animations.asp)  
[The Complete CSS Animations Tutorial](https://www.lambdatest.com/blog/css-animations-tutorial/)  
[CSS Animation for Beginners](https://thoughtbot.com/blog/css-animation-for-beginners)

и пара видео:  
[Learn CSS Animation in 9 Minutes](https://www.youtube.com/watch?v=z2LQYsZhsFw)  
[Net Ninja CSS Animation Tutorial Playlist](https://www.youtube.com/watch?v=jgw82b5Y2MU&list=PL4cUxeGkcC9iGYgmEd2dm3zAKzyCGDtM5)

Ознакомьтесь с этими руководствами и туториалами, затем вернитесь к этому гайду.

## Создание переиспользуемых анимаций {#creating-reusable-animations}

Как и с пакетом animations, можно создавать переиспользуемые анимации, которыми можно делиться по всему приложению. Версия пакета animations требовала использования функции `animation()` в общем typescript-файле. Нативная CSS-версия похожа, но живёт в общем CSS-файле.

#### С пакетом Animations {#with-animations-package}

<docs-code header="animations.ts" path="adev/src/content/examples/animations/src/app/animations.1.ts" region="animation-example"/>

#### С нативным CSS {#with-native-css}

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-shared"/>

Добавление класса `animated-class` к элементу запускает анимацию на этом элементе.

## Анимация перехода {#animating-a-transition}

### Анимация состояний и стилей {#animating-state-and-styles}

Пакет animations позволял определять различные состояния с помощью функции [`state()`](api/animations/state) внутри компонента. Примеры — состояния `open` или `closed`, содержащие стили для каждого соответствующего состояния в определении. Например:

#### С пакетом Animations {#with-animations-package-1}

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.ts" region="state1"/>

То же поведение можно реализовать нативно с помощью CSS-классов — либо с keyframe-анимацией, либо с transition-стилями.

#### С нативным CSS {#with-native-css-1}

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-states"/>

Запуск состояния `open` или `closed` выполняется переключением классов на элементе в компоненте. Примеры того, как это сделать, есть в нашем [руководстве по шаблонам](guide/templates/binding#css-class-and-style-property-bindings).

Похожие примеры есть в руководстве по шаблонам для [прямой анимации стилей](guide/templates/binding#css-style-properties).

### Transitions, timing и easing {#transitions-timing-and-easing}

Функция `animate()` пакета animations позволяет задавать timing — duration, delays и easing. Это можно сделать нативно в CSS с помощью нескольких CSS-свойств или shorthand-свойств.

Укажите `animation-duration`, `animation-delay` и `animation-timing-function` для keyframe-анимации в CSS, либо используйте shorthand-свойство `animation`.

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="animation-timing"/>

Аналогично можно использовать `transition-duration`, `transition-delay` и `transition-timing-function` и shorthand `transition` для анимаций, не использующих `@keyframes`.

<docs-code header="animations.css" path="adev/src/content/examples/animations/src/app/animations.css" region="transition-timing"/>

### Запуск анимации {#triggering-an-animation}

Пакет animations требовал указывать triggers с помощью функции `trigger()` и вкладывать все состояния внутрь. С нативным CSS это не нужно. Анимации можно запускать переключением CSS-стилей или классов. Как только класс присутствует на элементе, анимация произойдёт. Удаление класса вернёт элемент к тому CSS, который определён для этого элемента. В результате значительно меньше кода для той же анимации. Вот пример:

#### С пакетом Animations {#with-animations-package-2}

<docs-code-multifile>
    <docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/animations-package/open-close.ts" />
    <docs-code header="open-close.html" path="adev/src/content/examples/animations/src/app/animations-package/open-close.html" />
    <docs-code header="open-close.css" path="adev/src/content/examples/animations/src/app/animations-package/open-close.css"/>
</docs-code-multifile>

#### С нативным CSS {#with-native-css-2}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/open-close.ts">
    <docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/native-css/open-close.ts" />
    <docs-code header="open-close.html" path="adev/src/content/examples/animations/src/app/native-css/open-close.html" />
    <docs-code header="open-close.css" path="adev/src/content/examples/animations/src/app/native-css/open-close.css"/>
</docs-code-multifile>

## Transition и triggers {#transition-and-triggers}

### Предопределённые состояния и wildcard matching {#predefined-state-and-wildcard-matching}

Пакет animations предлагает возможность сопоставлять определённые состояния с transition через строки. Например, анимация из open в closed была бы `open => closed`. Можно использовать wildcards для сопоставления любого состояния с целевым, например `* => closed`, а ключевое слово `void` можно использовать для состояний входа и выхода. Например: `* => void` когда элемент покидает view, или `void => *` когда элемент входит в view.

Эти паттерны сопоставления состояний вообще не нужны при анимации напрямую через CSS. Можно управлять тем, какие transitions и `@keyframes`-анимации применяются, на основе классов и/или стилей, которые вы задаёте на элементах. Также можно добавить `@starting-style`, чтобы контролировать, как элемент выглядит сразу при входе в DOM.

### Автоматический расчёт свойств с wildcards {#automatic-property-calculation-with-wildcards}

Пакет animations предлагает возможность анимировать то, что исторически было сложно анимировать — например, анимацию заданной высоты до `height: auto`. Теперь это можно сделать и на чистом CSS.

#### С пакетом Animations {#with-animations-package-3}

<docs-code-multifile>
    <docs-code header="auto-height.ts" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.ts" />
    <docs-code header="auto-height.html" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.html" />
    <docs-code header="auto-height.css" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.css" />
</docs-code-multifile>

Можно использовать CSS Grid для анимации до auto height.

#### С нативным CSS {#with-native-css-3}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/auto-height.ts">
    <docs-code header="auto-height.ts" path="adev/src/content/examples/animations/src/app/native-css/auto-height.ts" />
    <docs-code header="auto-height.html" path="adev/src/content/examples/animations/src/app/native-css/auto-height.html" />
    <docs-code header="auto-height.css" path="adev/src/content/examples/animations/src/app/native-css/auto-height.css"  />
</docs-code-multifile>

Если не нужно поддерживать все браузеры, также можно посмотреть `calc-size()` — настоящее решение для анимации auto height. См. [документацию MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/calc-size) и [этот туториал](https://frontendmasters.com/blog/one-of-the-boss-battles-of-css-is-almost-won-transitioning-to-auto/) для дополнительной информации.

### Анимация входа и выхода из view {#animate-entering-and-leaving-a-view}

Пакет animations предлагал упомянутое выше сопоставление паттернов для входа и выхода, а также включал shorthand-алиасы `:enter` и `:leave`.

#### С пакетом Animations {#with-animations-package-4}

<docs-code-multifile>
    <docs-code header="insert-remove.ts" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.ts" />
    <docs-code header="insert-remove.html" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.html" />
    <docs-code header="insert-remove.css" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.css" />
</docs-code-multifile>

#### С нативным CSS {#with-native-css-4}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/insert.ts">
    <docs-code header="insert.ts" path="adev/src/content/examples/animations/src/app/native-css/insert.ts" />
    <docs-code header="insert.html" path="adev/src/content/examples/animations/src/app/native-css/insert.html" />
    <docs-code header="insert.css" path="adev/src/content/examples/animations/src/app/native-css/insert.css"  />
</docs-code-multifile>

#### С нативным CSS {#with-native-css-5}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/remove.ts">
    <docs-code header="remove.ts" path="adev/src/content/examples/animations/src/app/native-css/remove.ts" />
    <docs-code header="remove.html" path="adev/src/content/examples/animations/src/app/native-css/remove.html" />
    <docs-code header="remove.css" path="adev/src/content/examples/animations/src/app/native-css/remove.css"  />
</docs-code-multifile>

Подробнее о `animate.enter` и `animate.leave` см. в [руководстве Enter and Leave animations](guide/animations).

### Анимация increment и decrement {#animating-increment-and-decrement}

Наряду с упомянутыми `:enter` и `:leave` есть также `:increment` и `:decrement`. Их тоже можно анимировать добавлением и удалением классов. В отличие от встроенных алиасов пакета animations, нет автоматического применения классов при увеличении или уменьшении значений. Можно применять соответствующие классы программно. Вот пример:

#### С пакетом Animations {#with-animations-package-5}

<docs-code-multifile>
    <docs-code header="increment-decrement.ts" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.ts" />
    <docs-code header="increment-decrement.html" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.html" />
    <docs-code header="increment-decrement.css" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.css" />
</docs-code-multifile>

#### С нативным CSS {#with-native-css-6}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.ts">
    <docs-code header="increment-decrement.ts" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.ts" />
    <docs-code header="increment-decrement.html" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.html" />
    <docs-code header="increment-decrement.css" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.css" />
</docs-code-multifile>

### Parent / Child анимации {#parent-child-animations}

В отличие от пакета animations, когда в компоненте указано несколько анимаций, ни одна анимация не имеет приоритета над другой и ничто не блокирует запуск любой анимации. Любая последовательность анимаций должна обрабатываться определением вашей CSS-анимации — через animation / transition delay и/или используя `animationend` или `transitionend` для добавления следующего CSS для анимации.

### Отключение анимации или всех анимаций {#disabling-an-animation-or-all-animations}

С нативными CSS-анимациями, если нужно отключить указанные анимации, есть несколько вариантов.

1. Создайте пользовательский класс, который принудительно задаёт animation и transition в `none`.

```css
.no-animation {
  animation: none !important;
  transition: none !important;
}
```

Применение этого класса к элементу предотвращает запуск любой анимации на этом элементе. Можно также ограничить область действия всем DOM или секцией DOM, чтобы обеспечить это поведение. Однако это предотвращает срабатывание animation events. Если вы ждёте animation events для удаления элемента, это решение не сработает. Обходной путь — задать duration в 1 миллисекунду.

2. Используйте media query [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), чтобы гарантировать, что анимации не воспроизводятся для пользователей, предпочитающих меньше анимации.

3. Не добавляйте animation-классы программно

### Callbacks анимаций {#animation-callbacks}

Пакет animations предоставлял callbacks на случай, если нужно что-то сделать, когда анимация завершилась. У нативных CSS-анимаций тоже есть эти callbacks.

[`OnAnimationStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationstart_event)  
[`OnAnimationEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event)  
[`OnAnimationIteration`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationitration_event)  
[`OnAnimationCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationcancel_event)

[`OnTransitionStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionstart_event)  
[`OnTransitionRun`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionrun_event)  
[`OnTransitionEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event)  
[`OnTransitionCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitioncancel_event)

Web Animations API имеет много дополнительной функциональности. [Посмотрите документацию](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API), чтобы увидеть все доступные animation API.

NOTE: Учитывайте проблемы bubbling с этими callbacks. Если анимируете детей и родителей, события всплывают от детей к родителям. Рассмотрите остановку propagation или просмотр деталей события, чтобы определить, что вы реагируете на желаемый event target, а не на событие, всплывающее от дочернего узла. Можно проверить свойство `animationname` или свойства, которые transition'ятся, чтобы убедиться, что у вас правильные узлы.

## Сложные последовательности {#complex-sequences}

Пакет animations имеет встроенную функциональность для создания сложных последовательностей. Все эти последовательности полностью возможны и без пакета animations.

### Таргетинг конкретных элементов {#targeting-specific-elements}

В пакете animations можно было таргетировать конкретные элементы с помощью функции `query()`, чтобы находить элементы по имени CSS-класса, аналогично [`document.querySelector()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector). В мире нативных CSS-анимаций это не нужно. Вместо этого можно использовать CSS-селекторы для таргетинга подклассов и применять любой желаемый `transform` или `animation`.

Чтобы переключать классы для дочерних узлов в шаблоне, можно использовать class и style bindings для добавления анимаций в нужных точках.

### Stagger() {#stagger}

Функция `stagger()` позволяла задерживать анимацию каждого элемента в списке на указанное время, чтобы создать cascade-эффект. Это поведение можно воспроизвести в нативном CSS, используя `animation-delay` или `transition-delay`. Вот пример того, как может выглядеть такой CSS.

#### С пакетом Animations {#with-animations-package-6}

<docs-code-multifile>
    <docs-code header="stagger.ts" path="adev/src/content/examples/animations/src/app/animations-package/stagger.ts" />
    <docs-code header="stagger.html" path="adev/src/content/examples/animations/src/app/animations-package/stagger.html" />
    <docs-code header="stagger.css" path="adev/src/content/examples/animations/src/app/animations-package/stagger.css" />
</docs-code-multifile>

#### С нативным CSS {#with-native-css-7}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/stagger.ts">
    <docs-code header="stagger.ts" path="adev/src/content/examples/animations/src/app/native-css/stagger.ts" />
    <docs-code header="stagger.html" path="adev/src/content/examples/animations/src/app/native-css/stagger.html" />
    <docs-code header="stagger.css" path="adev/src/content/examples/animations/src/app/native-css/stagger.css" />
</docs-code-multifile>

### Параллельные анимации {#parallel-animations}

Пакет animations имеет функцию `group()` для одновременного воспроизведения нескольких анимаций. В CSS у вас полный контроль над timing анимации. Если определено несколько анимаций, можно применить их все сразу.

```css
.target-element {
  animation:
    rotate 3s,
    fade-in 2s;
}
```

В этом примере анимации `rotate` и `fade-in` запускаются одновременно.

### Анимация элементов переупорядочиваемого списка {#animating-the-items-of-a-reordering-list}

Переупорядочивание элементов в списке работает из коробки с помощью ранее описанных техник. Дополнительная специальная работа не требуется. Элементы в цикле `@for` будут корректно удаляться и добавляться заново, что запустит анимации с использованием `@starting-styles` для entry-анимаций. Альтернативно можно использовать `animate.enter` для того же поведения. Используйте `animate.leave` для анимации элементов при удалении, как видно в примере выше.

#### С пакетом Animations {#with-animations-package-7}

<docs-code-multifile>
    <docs-code header="reorder.ts" path="adev/src/content/examples/animations/src/app/animations-package/reorder.ts" />
    <docs-code header="reorder.html" path="adev/src/content/examples/animations/src/app/animations-package/reorder.html" />
    <docs-code header="reorder.css" path="adev/src/content/examples/animations/src/app/animations-package/reorder.css" />
</docs-code-multifile>

#### С нативным CSS {#with-native-css-8}

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/reorder.ts">
    <docs-code header="reorder.ts" path="adev/src/content/examples/animations/src/app/native-css/reorder.ts" />
    <docs-code header="reorder.html" path="adev/src/content/examples/animations/src/app/native-css/reorder.html" />
    <docs-code header="reorder.css" path="adev/src/content/examples/animations/src/app/native-css/reorder.css" />
</docs-code-multifile>

## Миграция использований AnimationPlayer {#migrating-usages-of-animationplayer}

Класс `AnimationPlayer` позволяет получать доступ к анимации для более продвинутых вещей — pause, play, restart и finish анимации через код. Всё это также можно обработать нативно.

Можно получить анимации с элемента напрямую через [`Element.getAnimations()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations). Это возвращает массив каждого [`Animation`](https://developer.mozilla.org/en-US/docs/Web/API/Animation) на этом элементе. API `Animation` позволяет делать гораздо больше, чем предлагал `AnimationPlayer` из пакета animations. Отсюда можно `cancel()`, `play()`, `pause()`, `reverse()` и многое другое. Этот нативный API должен предоставить всё необходимое для управления анимациями.

## Route Transitions {#route-transitions}

Можно использовать view transitions для анимации между маршрутами. См. [Route Transition Animations Guide](guide/routing/route-transition-animations), чтобы начать.
