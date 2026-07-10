# Анимация приложений с `animate.enter` и `animate.leave`

Хорошо продуманные анимации делают приложение понятнее и привлекательнее — и это не только косметика.
Анимации улучшают приложение и пользовательский опыт несколькими способами:

- Без анимаций переходы на веб-странице могут казаться резкими и неприятными
- Движение сильно улучшает UX, поэтому анимации дают пользователям шанс заметить реакцию приложения на их действия
- Хорошие анимации плавно направляют внимание пользователя по всему workflow

Angular предоставляет `animate.enter` и `animate.leave` для анимации элементов приложения. Эти две возможности в нужный момент применяют enter- и leave-CSS-классы или вызывают функции для анимаций из сторонних библиотек. `animate.enter` и `animate.leave` — не директивы. Это специальный API, поддерживаемый напрямую компилятором Angular. Их можно использовать прямо на элементах, а также как host binding.

## `animate.enter` {#animateenter}

`animate.enter` позволяет анимировать элементы при их _появлении_ в DOM. Enter-анимации можно задавать CSS-классами с transitions или keyframe-анимациями.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.ts">
    <docs-code header="enter.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.ts" />
    <docs-code header="enter.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.html" />
    <docs-code header="enter.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.css"/>
</docs-code-multifile>

Когда анимация завершается, Angular удаляет из DOM класс или классы, указанные в `animate.enter`. Классы анимации присутствуют только пока анимация активна.

NOTE: При нескольких keyframe-анимациях или transition-свойствах на элементе Angular удаляет все классы только _после_ завершения самой длинной анимации.

`animate.enter` можно использовать с любыми другими возможностями Angular — control flow, динамическими выражениями и т.д. `animate.enter` принимает как одну строку классов (несколько классов через пробел), так и массив строк классов.

Кратко о CSS transitions: если вы выбираете transitions вместо keyframe-анимаций, классы, добавленные к элементу через `animate.enter`, представляют состояние, _к которому_ будет анимироваться transition. Базовый CSS элемента — это то, как элемент выглядит без анимаций, что обычно похоже на конечное состояние CSS transition. Поэтому его всё равно нужно сочетать с `@starting-style`, чтобы у transition было корректное состояние _from_.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.ts">
    <docs-code header="enter-binding.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.ts" />
    <docs-code header="enter-binding.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.html" />
    <docs-code header="enter-binding.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.css"/>
</docs-code-multifile>

## `animate.leave` {#animateleave}

`animate.leave` позволяет анимировать элементы при их _удалении_ из DOM. Leave-анимации можно задавать CSS-классами с transforms или keyframe-анимациями.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.ts">
    <docs-code header="leave.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.ts" />
    <docs-code header="leave.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.html" />
    <docs-code header="leave.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.css"/>
</docs-code-multifile>

Когда анимация завершается, Angular автоматически удаляет анимированный элемент из DOM.

NOTE: При нескольких keyframe-анимациях или transition-свойствах на элементе Angular ждёт удаления элемента только _после_ завершения самой длинной из этих анимаций.

`animate.leave` также можно использовать с сигналами и другими привязками. Можно указать один класс или несколько — простой строкой с пробелами или массивом строк.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.ts">
    <docs-code header="leave-binding.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.ts" />
    <docs-code header="leave-binding.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.html" />
    <docs-code header="leave-binding.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.css"/>
</docs-code-multifile>

### Порядок удаления элементов {#element-removal-order}

В том, как запускаются анимации `animate.leave` и когда анимация произойдёт, есть нюансы. `animate.leave` работает, если размещён на удаляемом элементе; если `animate.leave` размещён на элементе, который является _потомком_ удаляемого, дочерние анимации произойдут _до_ удаления родительского узла из DOM. Так можно уверенно анимировать уход дочерних элементов, не давая родителю исчезнуть раньше времени.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-parent.ts">
    <docs-code header="leave.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-parent.ts" />
    <docs-code header="leave.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-parent.html" />
    <docs-code header="leave.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-parent.css"/>
</docs-code-multifile>

## Привязки событий, функции и сторонние библиотеки {#event-bindings-functions-and-third-party-libraries}

И `animate.enter`, и `animate.leave` поддерживают синтаксис привязки событий с вызовами функций. Так можно вызвать функцию в коде компонента или использовать сторонние библиотеки анимаций — [GSAP](https://gsap.com/), [anime.js](https://animejs.com/) или любую другую JavaScript-библиотеку анимаций.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.ts">
    <docs-code header="leave-event.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.ts" />
    <docs-code header="leave-event.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.html" />
    <docs-code header="leave-event.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.css"/>
</docs-code-multifile>

Объект `$event` имеет тип `AnimationCallbackEvent`. Он включает элемент как `target` и предоставляет функцию `animationComplete()`, чтобы уведомить фреймворк о завершении анимации.

IMPORTANT: При использовании `animate.leave` вы **должны** вызвать `animationComplete()`, чтобы Angular удалил элемент.

Если при `animate.leave` не вызвать `animationComplete()`, Angular вызовет функцию автоматически через четыре секунды. Длительность задержки можно настроить, предоставив токен `MAX_ANIMATION_TIMEOUT` в миллисекундах.

```typescript
  { provide: MAX_ANIMATION_TIMEOUT, useValue: 6000 }
```

## Совместимость с устаревшими Angular Animations {#compatibility-with-legacy-angular-animations}

Нельзя использовать legacy-анимации вместе с `animate.enter` и `animate.leave` в одном компоненте. Это приведёт к тому, что enter-классы останутся на элементе или уходящие узлы не будут удалены. В остальном можно использовать и legacy-анимации, и новые `animate.enter` / `animate.leave` в одном _приложении_. Единственная оговорка — проекция контента. Если проецировать контент из компонента с legacy-анимациями в компонент с `animate.enter` или `animate.leave` (или наоборот), поведение будет таким же, как при совместном использовании в одном компоненте. Это не поддерживается.

## Тестирование {#testing}

TestBed предоставляет встроенную поддержку включения и отключения анимаций в тестовом окружении. CSS-анимации требуют браузера, и многие API в тестовом окружении недоступны. По умолчанию TestBed отключает анимации в тестах.

Если нужно проверить, что анимации работают в браузерном тесте (например, end-to-end), можно настроить TestBed на включение анимаций, указав `animationsEnabled: true` в конфигурации теста.

```typescript
TestBed.configureTestingModule({animationsEnabled: true});
```

Это настроит анимации в тестовом окружении на обычное поведение.

NOTE: Некоторые тестовые окружения не эмитят события анимации вроде `animationstart`, `animationend` и их transition-эквиваленты.

## Дополнительно об анимациях Angular {#more-on-angular-animations}

Вас также могут заинтересовать:

<docs-pill-row>
  <docs-pill href="guide/animations/css" title="Complex Animations with CSS"/>
  <docs-pill href="guide/routing/route-transition-animations" title="Route transition animations"/>
</docs-pill-row>
