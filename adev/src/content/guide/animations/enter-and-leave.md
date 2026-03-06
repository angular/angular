# Анимация приложений с помощью `animate.enter` и `animate.leave` {#animating-your-applications-with-animate-enter-and-animate-leave}

Хорошо спроектированные анимации делают приложение более удобным и понятным для использования, и это не просто косметика.
Анимации способны улучшить приложение и пользовательский опыт несколькими способами:

- Без анимаций переходы между страницами могут выглядеть резкими и неприятными
- Движение значительно улучшает пользовательский опыт: анимации дают пользователям возможность отследить реакцию приложения на их действия
- Хорошие анимации могут плавно направлять внимание пользователя через весь рабочий процесс

Angular предоставляет `animate.enter` и `animate.leave` для анимации элементов приложения. Эти два компонента применяют CSS-классы входа и ухода в нужное время или вызывают функции для применения анимаций из сторонних библиотек. `animate.enter` и `animate.leave` не являются директивами. Это специальный API, поддерживаемый непосредственно компилятором Angular. Их можно использовать непосредственно на элементах, а также в качестве привязки хоста.

## `animate.enter` {#animate-enter}

`animate.enter` позволяет анимировать элементы при _входе_ в DOM. Анимации входа можно определить с помощью CSS-классов, используя переходы или keyframe-анимации.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.ts">
    <docs-code header="enter.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.ts" />
    <docs-code header="enter.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.html" />
    <docs-code header="enter.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.css"/>
</docs-code-multifile>

По завершении анимации Angular удаляет из DOM класс или классы, указанные в `animate.enter`. Классы анимации присутствуют только во время её выполнения.

NOTE: При использовании нескольких keyframe-анимаций или свойств перехода на элементе Angular удаляет все классы только _после_ завершения самой длинной анимации.

`animate.enter` можно использовать вместе с любыми другими функциями Angular, такими как управляющие конструкции или динамические выражения. `animate.enter` принимает как одну строку классов \(с несколькими классами, разделёнными пробелами\), так и массив строк классов.

Небольшое замечание об использовании CSS-переходов: если вы выбираете переходы вместо keyframe-анимаций, классы, добавляемые к элементу через `animate.enter`, представляют состояние, _к_ которому будет анимироваться переход. Базовый CSS элемента описывает его вид при отсутствии анимаций, что, вероятно, близко к конечному состоянию CSS-перехода. Поэтому для корректной работы перехода всё равно нужно добавить `@starting-style` — чтобы задать начальное состояние.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.ts">
    <docs-code header="enter-binding.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.ts" />
    <docs-code header="enter-binding.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.html" />
    <docs-code header="enter-binding.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.css"/>
</docs-code-multifile>

## `animate.leave` {#animate-leave}

`animate.leave` позволяет анимировать элементы при _уходе_ из DOM. Анимации ухода можно определить с помощью CSS-классов, используя трансформации или keyframe-анимации.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.ts">
    <docs-code header="leave.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.ts" />
    <docs-code header="leave.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.html" />
    <docs-code header="leave.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.css"/>
</docs-code-multifile>

По завершении анимации Angular автоматически удаляет анимируемый элемент из DOM.

NOTE: При использовании нескольких keyframe-анимаций или свойств перехода на элементе Angular ожидает удаления элемента только _после_ завершения самой длинной из них.

`animate.leave` также можно использовать с сигналами и другими привязками. `animate.leave` поддерживает как один класс, так и несколько. Укажите их в виде простой строки с пробелами или массива строк.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.ts">
    <docs-code header="leave-binding.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.ts" />
    <docs-code header="leave-binding.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.html" />
    <docs-code header="leave-binding.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.css"/>
</docs-code-multifile>

### Порядок удаления элементов имеет значение {#element-removal-order-matters}

Выполнение анимаций `animate.leave` и момент их срабатывания имеют нюансы. `animate.leave` работает, если размещён на удаляемом элементе. Однако `animate.leave` **не** будет анимировать, если он находится на элементе, являющемся _потомком_ удаляемого элемента. Это происходит потому, что при удалении родительского узла всё поддерево удаляется вместе с ним, и поскольку на этом родительском узле нет анимаций, он удаляется немедленно. Это означает, что анимировать уход с помощью `animate.leave` становится невозможно. Учитывайте это при использовании `animate.leave`.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-parent.ts">
    <docs-code header="leave.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-parent.ts" />
    <docs-code header="leave.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-parent.html" />
    <docs-code header="leave.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-parent.css"/>
</docs-code-multifile>

## Привязки событий, функции и сторонние библиотеки {#event-bindings-functions-and-third-party-libraries}

`animate.enter` и `animate.leave` поддерживают синтаксис привязки событий для вызовов функций. Этот синтаксис позволяет вызывать функцию в коде компонента или использовать сторонние библиотеки анимаций, такие как [GSAP](https://gsap.com/), [anime.js](https://animejs.com/) или любую другую JavaScript-библиотеку анимаций.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.ts">
    <docs-code header="leave-event.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.ts" />
    <docs-code header="leave-event.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.html" />
    <docs-code header="leave-event.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.css"/>
</docs-code-multifile>

Объект `$event` имеет тип `AnimationCallbackEvent`. Он включает элемент в качестве `target` и предоставляет функцию `animationComplete()` для уведомления фреймворка о завершении анимации.

IMPORTANT: При использовании `animate.leave` **необходимо** вызывать функцию `animationComplete()`, чтобы Angular удалил элемент.

Если `animationComplete()` не вызвана при использовании `animate.leave`, Angular вызовет функцию автоматически после четырёхсекундной задержки. Длительность задержки можно настроить, указав токен `MAX_ANIMATION_TIMEOUT` в миллисекундах.

```typescript
  { provide: MAX_ANIMATION_TIMEOUT, useValue: 6000 }
```

## Совместимость с устаревшими анимациями Angular {#compatibility-with-legacy-angular-animations}

Нельзя использовать устаревшие анимации совместно с `animate.enter` и `animate.leave` в одном компоненте. Это привело бы к тому, что классы входа остаются на элементе или уходящие узлы не удаляются. В остальном допустимо использовать как устаревшие анимации, так и новые `animate.enter` и `animate.leave` в одном _приложении_. Единственное исключение — проецирование контента. Проецирование контента из компонента с устаревшими анимациями в компонент с `animate.enter` или `animate.leave` (и наоборот) приведёт к такому же поведению, как при их совместном использовании в одном компоненте. Это не поддерживается.

## Тестирование {#testing}

TestBed обеспечивает встроенную поддержку для включения и отключения анимаций в тестовой среде. CSS-анимации требуют браузера для работы, и многие API недоступны в тестовой среде. По умолчанию TestBed отключает анимации в тестовых средах.

Если нужно проверить анимации в браузерном тесте, например в end-to-end тесте, можно настроить TestBed для включения анимаций, указав `animationsEnabled: true` в конфигурации теста.

```typescript
TestBed.configureTestingModule({animationsEnabled: true});
```

Это настроит анимации в тестовой среде для нормального поведения.

NOTE: Некоторые тестовые среды не генерируют события анимации, такие как `animationstart`, `animationend` и их эквиваленты для переходов.

## Дополнительные материалы по анимациям Angular {#more-on-angular-animations}

Вас также могут заинтересовать следующие материалы:

<docs-pill-row>
  <docs-pill href="guide/animations/css" title="Сложные анимации с CSS"/>
  <docs-pill href="guide/routing/route-transition-animations" title="Анимации переходов маршрутов"/>
</docs-pill-row>
