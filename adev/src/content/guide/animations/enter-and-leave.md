# Анимация элементов с помощью `animate.enter` и `animate.leave` {#animating-your-applications-with-animate-enter-and-animate-leave}

Хорошо спроектированные анимации делают приложение более удобным и приятным в использовании, но они не только косметические.
Анимации могут улучшить ваше приложение и пользовательский опыт несколькими способами:

- Без анимаций переходы на веб-страницах могут казаться резкими и раздражающими
- Движение значительно улучшает пользовательский опыт: анимации дают пользователям возможность заметить реакцию приложения на их действия
- Хорошие анимации могут плавно направлять внимание пользователя в ходе рабочего процесса

Angular предоставляет `animate.enter` и `animate.leave` для анимации элементов приложения. Эти две функции применяют CSS-классы enter и leave в нужный момент или вызывают функции для применения анимаций из сторонних библиотек. `animate.enter` и `animate.leave` — не директивы. Это специальный API, поддерживаемый непосредственно компилятором Angular. Они могут использоваться как на элементах напрямую, так и в качестве host-привязки.

## `animate.enter` {#animate-enter}

Можно использовать `animate.enter` для анимации элементов при их _появлении_ в DOM. Анимации входа можно определять с помощью CSS-классов, используя либо переходы, либо анимации ключевых кадров.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.ts">
    <docs-code header="enter.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.ts" />
    <docs-code header="enter.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.html" />
    <docs-code header="enter.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.css"/>
</docs-code-multifile>

По завершении анимации Angular удаляет из DOM класс или классы, указанные в `animate.enter`. Классы анимации присутствуют только во время активной анимации.

ПРИМЕЧАНИЕ: При использовании нескольких анимаций ключевых кадров или свойств перехода на элементе Angular удаляет все классы только _после_ завершения самой длинной анимации.

Можно использовать `animate.enter` с любыми другими функциями Angular, например с потоком управления или динамическими выражениями. `animate.enter` принимает как одну строку с классами \(несколько классов, разделённых пробелами\), так и массив строк с классами.

Несколько слов об использовании CSS-переходов: если вы выбираете переходы вместо анимаций ключевых кадров, классы, добавленные к элементу с помощью `animate.enter`, представляют состояние, _к которому_ перейдёт переход. Базовый CSS элемента определяет его внешний вид при отсутствии анимации, что, вероятно, похоже на конечное состояние CSS-перехода. Поэтому для правильного начального состояния перехода нужно дополнительно использовать `@starting-style`.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.ts">
    <docs-code header="enter-binding.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.ts" />
    <docs-code header="enter-binding.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.html" />
    <docs-code header="enter-binding.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.css"/>
</docs-code-multifile>

## `animate.leave` {#animate-leave}

Можно использовать `animate.leave` для анимации элементов при их _уходе_ из DOM. Анимации выхода можно определять с помощью CSS-классов, используя либо трансформации, либо анимации ключевых кадров.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.ts">
    <docs-code header="leave.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.ts" />
    <docs-code header="leave.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.html" />
    <docs-code header="leave.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.css"/>
</docs-code-multifile>

По завершении анимации Angular автоматически удаляет анимированный элемент из DOM.

ПРИМЕЧАНИЕ: При использовании нескольких анимаций ключевых кадров или свойств перехода на элементе Angular ждёт удаления элемента только _после_ завершения самой длинной из этих анимаций.

`animate.leave` также можно использовать с сигналами и другими привязками. Можно указать один класс или несколько классов — в виде простой строки с пробелами или массива строк.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.ts">
    <docs-code header="leave-binding.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.ts" />
    <docs-code header="leave-binding.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.html" />
    <docs-code header="leave-binding.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.css"/>
</docs-code-multifile>

### Порядок удаления элементов {#element-removal-order}

Есть некоторые тонкости в том, как запускаются анимации `animate.leave` и когда анимация произойдёт. `animate.leave` работает, если он размещён на удаляемом элементе, а если `animate.leave` размещён на элементе, являющемся _потомком_ удаляемого элемента, дочерние анимации произойдут _до_ удаления родительского узла из DOM. Это гарантирует, что можно уверенно анимировать дочерние элементы без преждевременного исчезновения родительского узла.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-parent.ts">
    <docs-code header="leave.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-parent.ts" />
    <docs-code header="leave.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-parent.html" />
    <docs-code header="leave.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-parent.css"/>
</docs-code-multifile>

## Привязки событий, функции и сторонние библиотеки {#event-bindings-functions-and-third-party-libraries}

И `animate.enter`, и `animate.leave` поддерживают синтаксис привязки событий, позволяющий вызывать функции. Этот синтаксис можно использовать для вызова функций в коде компонента или для работы со сторонними библиотеками анимации, такими как [GSAP](https://gsap.com/), [anime.js](https://animejs.com/) или любой другой JavaScript-библиотекой анимации.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.ts">
    <docs-code header="leave-event.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.ts" />
    <docs-code header="leave-event.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.html" />
    <docs-code header="leave-event.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.css"/>
</docs-code-multifile>

Объект `$event` имеет тип `AnimationCallbackEvent`. Он включает элемент в качестве `target` и предоставляет функцию `animationComplete()` для уведомления фреймворка о завершении анимации.

ВАЖНО: При использовании `animate.leave` **необходимо** вызывать функцию `animationComplete()`, чтобы Angular удалил элемент.

Если не вызвать `animationComplete()` при использовании `animate.leave`, Angular автоматически вызовет функцию после четырёхсекундной задержки. Длительность задержки можно настроить, предоставив токен `MAX_ANIMATION_TIMEOUT` в миллисекундах.

```typescript
  { provide: MAX_ANIMATION_TIMEOUT, useValue: 6000 }
```

## Совместимость с устаревшими анимациями Angular {#compatibility-with-legacy-angular-animations}

Нельзя использовать устаревшие анимации вместе с `animate.enter` и `animate.leave` в одном компоненте. Это приведёт к тому, что классы enter останутся на элементе или покидающие узлы не будут удалены. В остальном допустимо использовать как устаревшие анимации, так и новые анимации `animate.enter` и `animate.leave` в одном _приложении_. Единственная оговорка касается проецирования контента. Если контент из компонента с устаревшими анимациями проецируется в компонент с `animate.enter` или `animate.leave`, или наоборот, это приведёт к тому же поведению, как если бы они использовались вместе в одном компоненте. Это не поддерживается.

## Тестирование {#testing}

TestBed обеспечивает встроенную поддержку включения и отключения анимаций в тестовой среде. CSS-анимации требуют браузера для работы, и многие API недоступны в тестовой среде. По умолчанию TestBed отключает анимации в тестовых средах.

Если нужно проверить, что анимации воспроизводятся в браузерном тесте, например в сквозном тесте, можно настроить TestBed для включения анимаций, указав `animationsEnabled: true` в конфигурации теста.

```typescript
TestBed.configureTestingModule({animationsEnabled: true});
```

Это настроит анимации в тестовой среде для нормального поведения.

ПРИМЕЧАНИЕ: Некоторые тестовые среды не генерируют события анимации, такие как `animationstart`, `animationend` и их аналоги для переходов.

## Подробнее об анимациях Angular {#more-on-angular-animations}

Также вас может заинтересовать следующее:

<docs-pill-row>
  <docs-pill href="guide/animations/css" title="Сложные анимации с CSS"/>
  <docs-pill href="guide/routing/route-transition-animations" title="Анимации переходов маршрутов"/>
</docs-pill-row>
