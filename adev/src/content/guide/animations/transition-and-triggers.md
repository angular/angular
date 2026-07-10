# Animation transitions и triggers

IMPORTANT: Пакет `@angular/animations` теперь устарел. Команда Angular рекомендует использовать нативный CSS с `animate.enter` и `animate.leave` для анимаций во всём новом коде. Подробнее в новом руководстве по enter и leave [анимациям](guide/animations). Также см. [Migrating away from Angular's Animations package](guide/animations/migration), чтобы узнать, как начать миграцию на чистые CSS-анимации в приложениях.

Это руководство подробно рассматривает специальные состояния переходов, такие как wildcard `*` и `void`. Также показывает, как эти состояния используются для элементов, входящих в view и покидающих его.
Этот раздел также исследует несколько animation triggers, animation callbacks и sequence-based анимацию с использованием keyframes.

## Предопределённые состояния и wildcard matching {#predefined-states-and-wildcard-matching}

В Angular состояния переходов можно определить явно через функцию [`state()`](api/animations/state) или используя предопределённые состояния `*` wildcard и `void`.

### Wildcard-состояние {#wildcard-state}

Звёздочка `*` или _wildcard_ совпадает с любым состоянием анимации.
Это полезно для определения переходов, которые применяются независимо от начального или конечного состояния HTML-элемента.

Например, переход `open => *` применяется, когда состояние элемента меняется из open на что угодно ещё.

<img alt="wildcard state expressions" src="assets/images/guide/animations/wildcard-state-500.png">

Ниже ещё один пример кода, использующий wildcard-состояние вместе с предыдущим примером с состояниями `open` и `closed`.
Вместо определения каждой пары переходов state-to-state любой переход в `closed` занимает 1 секунду, а любой переход в `open` — 0.5 секунды.

Это позволяет добавлять новые состояния без необходимости включать отдельные переходы для каждого.

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.ts" region="trigger-wildcard1"/>

Используйте синтаксис двойной стрелки для указания переходов state-to-state в обоих направлениях.

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.ts" region="trigger-wildcard2"/>

### Использование wildcard-состояния с несколькими состояниями перехода {#use-wildcard-state-with-multiple-transition-states}

В примере кнопки с двумя состояниями wildcard не так полезен, потому что есть только два возможных состояния — `open` и `closed`.
В общем случае используйте wildcard-состояния, когда у элемента несколько потенциальных состояний, в которые он может перейти.
Если кнопка может перейти из `open` либо в `closed`, либо во что-то вроде `inProgress`, использование wildcard-состояния может уменьшить объём необходимого кода.

<img alt="wildcard state with 3 states" src="assets/images/guide/animations/wildcard-3-states.png">

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.ts" region="trigger-transition"/>

Переход `* => *` применяется, когда происходит любое изменение между двумя состояниями.

Переходы сопоставляются в порядке, в котором они определены.
Таким образом, можно применять другие переходы поверх перехода `* => *`.
Например, определите изменения стилей или анимации, которые применялись бы только к `open => closed`, затем используйте `* => *` как fallback для пар состояний, которые иначе не указаны.

Для этого перечислите более специфичные переходы _перед_ `* => *`.

### Использование wildcards со стилями {#use-wildcards-with-styles}

Используйте wildcard `*` со стилем, чтобы сообщить анимации использовать текущее значение стиля и анимировать с ним.
Wildcard — fallback-значение, используемое, если анимируемое состояние не объявлено внутри trigger.

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.ts" region="transition4"/>

### Состояние void {#void-state}

Используйте состояние `void` для настройки переходов для элемента, входящего на страницу или покидающего её.
См. [Animating entering and leaving a view](guide/legacy-animations/transition-and-triggers#aliases-enter-and-leave).

### Комбинирование wildcard и void состояний {#combine-wildcard-and-void-states}

Комбинируйте wildcard и void состояния в переходе, чтобы запускать анимации входа и выхода со страницы:

- Переход `* => void` применяется, когда элемент покидает view, независимо от того, в каком состоянии он был до ухода
- Переход `void => *` применяется, когда элемент входит в view, независимо от того, какое состояние он принимает при входе
- Wildcard-состояние `*` совпадает с _любым_ состоянием, включая `void`

## Анимация входа и выхода из view {#animate-entering-and-leaving-a-view}

Этот раздел показывает, как анимировать элементы, входящие на страницу или покидающие её.

Добавьте новое поведение:

- Когда вы добавляете hero в список heroes, он кажется влетающим на страницу слева
- Когда вы удаляете hero из списка, он кажется улетающим вправо

<docs-code header="hero-list-enter-leave.ts" path="adev/src/content/examples/animations/src/app/hero-list-enter-leave.ts" region="animationdef"/>

В предыдущем коде вы применили состояние `void`, когда HTML-элемент не прикреплён к view.

## Алиасы :enter и :leave {#aliases-enter-and-leave}

`:enter` и `:leave` — алиасы для переходов `void => *` и `* => void`.
Эти алиасы используются несколькими функциями анимации.

```ts {hideCopy}

transition ( ':enter', [ … ] ); // alias for void => _
transition ( ':leave', [ … ] ); // alias for _ => void

```

Сложнее таргетировать элемент, входящий в view, потому что его ещё нет в DOM.
Используйте алиасы `:enter` и `:leave` для таргетинга HTML-элементов, вставляемых в view или удаляемых из него.

### Использование `*ngIf` и `*ngFor` с :enter и :leave {#use-ngif-and-ngfor-with-enter-and-leave}

Переход `:enter` выполняется, когда любые views `*ngIf` или `*ngFor` помещаются на страницу, а `:leave` выполняется, когда эти views удаляются со страницы.

IMPORTANT: Поведение входа/выхода иногда может быть запутанным.
Как правило, считайте, что любой элемент, добавляемый в DOM Angular, проходит через переход `:enter`. Только элементы, напрямую удаляемые из DOM Angular, проходят через переход `:leave`. Например, view элемента удаляется из DOM, потому что его родитель удаляется из DOM.

В этом примере есть специальный trigger для анимации enter и leave под названием `myInsertRemoveTrigger`.
HTML-шаблон содержит следующий код.

<docs-code header="insert-remove.html" path="adev/src/content/examples/animations/src/app/insert-remove.html" region="insert-remove"/>

В файле компонента переход `:enter` задаёт начальную opacity 0. Затем анимирует её до изменения opacity на 1, когда элемент вставляется в view.

<docs-code header="insert-remove.ts" path="adev/src/content/examples/animations/src/app/insert-remove.ts" region="enter-leave-trigger"/>

Обратите внимание, что этому примеру не нужно использовать [`state()`](api/animations/state).

## Переходы :increment и :decrement {#transition-increment-and-decrement}

Функция `transition()` принимает другие значения селектора — `:increment` и `:decrement`.
Используйте их, чтобы запустить переход, когда числовое значение увеличилось или уменьшилось.

HELPFUL: Следующий пример использует методы `query()` и `stagger()`.
Подробнее об этих методах см. на странице [complex sequences](guide/legacy-animations/complex-sequences).

<docs-code header="hero-list-page.ts" path="adev/src/content/examples/animations/src/app/hero-list-page.ts" region="increment"/>

## Boolean-значения в переходах {#boolean-values-in-transitions}

Если trigger содержит Boolean-значение как значение привязки, то это значение можно сопоставить с помощью выражения `transition()`, сравнивающего `true` и `false`, или `1` и `0`.

<docs-code header="open-close.html" path="adev/src/content/examples/animations/src/app/open-close.2.html" region="trigger-boolean"/>

В фрагменте кода выше HTML-шаблон привязывает элемент `<div>` к trigger с именем `openClose` с выражением статуса `isOpen` и возможными значениями `true` и `false`.
Этот паттерн — альтернатива практике создания двух именованных состояний вроде `open` и `close`.

Внутри метаданных `@Component` в свойстве `animations:` когда состояние вычисляется в `true`, высота ассоциированного HTML-элемента — wildcard-стиль или значение по умолчанию.
В этом случае анимация использует ту высоту, которая уже была у элемента до начала анимации.
Когда элемент `closed`, элемент анимируется до высоты 0, что делает его невидимым.

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.2.ts" region="trigger-boolean"/>

## Несколько animation triggers {#multiple-animation-triggers}

Можно определить более одного animation trigger для компонента.
Прикрепляйте animation triggers к разным элементам, и parent-child отношения между элементами влияют на то, как и когда выполняются анимации.

### Parent-child анимации {#parent-child-animations}

Каждый раз, когда анимация запускается в Angular, parent-анимация всегда получает приоритет, а child-анимации блокируются.
Чтобы child-анимация выполнилась, parent-анимация должна сделать query каждого из элементов, содержащих child-анимации. Затем она позволяет анимациям выполняться с помощью функции [`animateChild()`](api/animations/animateChild).

#### Отключение анимации на HTML-элементе {#disable-an-animation-on-an-html-element}

Специальную привязку управления анимацией `@.disabled` можно поместить на HTML-элемент, чтобы отключить анимации на этом элементе, а также на любых вложенных элементах.
Когда true, привязка `@.disabled` предотвращает отрисовку всех анимаций.

Следующий пример кода показывает, как использовать эту возможность.

<docs-code-multifile>
    <docs-code header="open-close.html" path="adev/src/content/examples/animations/src/app/open-close.4.html" region="toggle-animation"/>
    <docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.4.ts" region="toggle-animation" language="typescript"/>
</docs-code-multifile>

Когда привязка `@.disabled` равна true, trigger `@childAnimation` не запускается.

Когда у элемента в HTML-шаблоне анимации отключены с помощью host binding `@.disabled`, анимации отключаются и на всех внутренних элементах.
Нельзя выборочно отключить несколько анимаций на одном элементе.<!-- vale off -->

Выборочные child-анимации всё ещё могут выполняться на отключённом родителе одним из следующих способов:

- Parent-анимация может использовать функцию [`query()`](api/animations/query) для сбора внутренних элементов, расположенных в отключённых областях HTML-шаблона.
Эти элементы всё ещё могут анимироваться.
<!-- vale on -->

- Child-анимация может быть найдена query родителем и затем позже анимирована функцией `animateChild()`

#### Отключение всех анимаций {#disable-all-animations}

Чтобы отключить все анимации для приложения Angular, поместите host binding `@.disabled` на самый верхний компонент Angular.

<docs-code header="app.ts" path="adev/src/content/examples/animations/src/app/app.ts" region="toggle-app-animations"/>

HELPFUL: Отключение анимаций на уровне всего приложения полезно во время end-to-end \(E2E\) тестирования.

## Callbacks анимаций {#animation-callbacks}

Функция анимации `trigger()` испускает _callbacks_, когда начинается и когда заканчивается.
Следующий пример демонстрирует компонент, содержащий trigger `openClose`.

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.ts" region="events1"/>

В HTML-шаблоне событие анимации передаётся обратно через `$event` как `@triggerName.start` и `@triggerName.done`, где `triggerName` — имя используемого trigger.
В этом примере trigger `openClose` выглядит так.

<docs-code header="open-close.html" path="adev/src/content/examples/animations/src/app/open-close.3.html" region="callbacks"/>

Потенциальное использование animation callbacks — прикрыть медленный API-вызов, например поиск в базе данных.
Например, кнопку **InProgress** можно настроить так, чтобы у неё была собственная looping-анимация, пока операция backend-системы завершается.

Другую анимацию можно вызвать, когда текущая анимация завершится.
Например, кнопка переходит из состояния `inProgress` в состояние `closed`, когда API-вызов завершён.

Анимация может повлиять на конечного пользователя так, чтобы он _воспринимал_ операцию как более быструю, даже когда это не так.

Callbacks могут служить инструментом отладки — например, в сочетании с `console.warn()` для просмотра прогресса приложения в Developer JavaScript Console браузера.
Следующий фрагмент кода создаёт вывод console log для исходного примера — кнопки с двумя состояниями `open` и `closed`.

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.ts" region="events"/>

## Keyframes {#keyframes}

Чтобы создать анимацию с несколькими шагами, выполняемыми последовательно, используйте _keyframes_.

Функция Angular `keyframe()` позволяет несколько изменений стилей в одном сегменте timing.
Например, кнопка вместо затухания могла бы несколько раз менять цвет в течение одного 2-секундного промежутка времени.

<img alt="keyframes" src="assets/images/guide/animations/keyframes-500.png">

Код для этого изменения цвета может выглядеть так.

<docs-code header="status-slider.ts" path="adev/src/content/examples/animations/src/app/status-slider.ts" region="keyframes"/>

### Offset {#offset}

Keyframes включают `offset`, который определяет точку в анимации, где происходит каждое изменение стиля.
Offsets — относительные меры от нуля до единицы, отмечающие начало и конец анимации. Их следует применять к каждому шагу keyframe, если они используются хотя бы один раз.

Определение offsets для keyframes опционально.
Если их опустить, автоматически назначаются равномерно распределённые offsets.
Например, три keyframes без предопределённых offsets получают offsets 0, 0.5 и 1.
Указание offset 0.8 для среднего перехода в предыдущем примере может выглядеть так.

<img alt="keyframes with offset" src="assets/images/guide/animations/keyframes-offset-500.png">

Код с указанными offsets был бы следующим.

<docs-code header="status-slider.ts" path="adev/src/content/examples/animations/src/app/status-slider.ts" region="keyframesWithOffsets"/>

Можно комбинировать keyframes с `duration`, `delay` и `easing` в одной анимации.

### Keyframes с пульсацией {#keyframes-with-a-pulsation}

Используйте keyframes для создания эффекта пульсации в анимациях, определяя стили на конкретных offsets на протяжении анимации.

Вот пример использования keyframes для создания эффекта пульсации:

- Исходные состояния `open` и `closed` с исходными изменениями высоты, цвета и opacity, происходящими в течение 1 секунды
- Последовательность keyframes, вставленная в середину, которая заставляет кнопку казаться пульсирующей нерегулярно в течение того же 1-секундного промежутка времени

<img alt="keyframes with irregular pulsation" src="assets/images/guide/animations/keyframes-pulsation.png">

Фрагмент кода для этой анимации может выглядеть так.

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.1.ts" region="trigger"/>

### Animatable-свойства и единицы {#animatable-properties-and-units}

Анимации Angular построены поверх web animations, поэтому можно анимировать любое свойство, которое браузер считает animatable.
Это включает позиции, размеры, transforms, цвета, borders и многое другое.
W3C поддерживает список animatable-свойств на странице [CSS Transitions](https://www.w3.org/TR/css-transitions-1).

Для свойств с числовым значением определите единицу, предоставив значение как строку в кавычках с соответствующим суффиксом:

- 50 пикселей:
  `'50px'`

- Относительный размер шрифта:
  `'3em'`

- Процент:
  `'100%'`

Также можно предоставить значение как число. В таких случаях Angular предполагает единицу по умолчанию — пиксели, или `px`.
Выражение 50 пикселей как `50` то же самое, что сказать `'50px'`.

HELPFUL: Строка `"50"` вместо этого не считалась бы валидной\).

### Автоматический расчёт свойств с wildcards {#automatic-property-calculation-with-wildcards}

Иногда значение dimensional style property неизвестно до runtime.
Например, у элементов часто есть ширины и высоты, зависящие от их контента или размера экрана.
Эти свойства часто сложно анимировать с помощью CSS.

В этих случаях можно использовать специальное значение свойства wildcard `*` в `style()`. Значение этого конкретного style property вычисляется в runtime и затем подставляется в анимацию.

Следующий пример имеет trigger под названием `shrinkOut`, используемый, когда HTML-элемент покидает страницу.
Анимация берёт ту высоту, которая есть у элемента до ухода, и анимирует от этой высоты до нуля.

<docs-code header="hero-list-auto.ts" path="adev/src/content/examples/animations/src/app/hero-list-auto.ts" region="auto-calc"/>

### Сводка по keyframes {#keyframes-summary}

Функция `keyframes()` в Angular позволяет указать несколько промежуточных стилей в одном переходе. Опциональный `offset` можно использовать для определения точки в анимации, где должно происходить каждое изменение стиля.

## Ещё об анимациях Angular {#more-on-angular-animations}

Вас также могут заинтересовать:

<docs-pill-row>
  <docs-pill href="guide/legacy-animations" title="Introduction to Angular animations"/>
  <docs-pill href="guide/legacy-animations/complex-sequences" title="Complex animation sequences"/>
  <docs-pill href="guide/legacy-animations/reusable-animations" title="Reusable animations"/>
  <docs-pill href="guide/routing/route-transition-animations" title="Route transition animations"/>
  <docs-pill href="guide/animations/migration" title="Migrating to Native CSS Animations"/>
</docs-pill-row>
