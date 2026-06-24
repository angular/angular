# Анимация приложений с помощью `animate.enter` и `animate.leave`

Хорошо спроектированные анимации могут сделать использование приложения более приятным и понятным, но они нужны не
только для красоты. Анимации могут улучшить ваше приложение и пользовательский опыт несколькими способами:

- Без анимации переходы на веб-страницах могут казаться резкими и неприятными.
- Движение значительно улучшает пользовательский опыт, позволяя пользователям заметить реакцию приложения на их
  действия.
- Хорошие анимации могут плавно направлять внимание пользователя в ходе рабочего процесса.

Angular предоставляет `animate.enter` и `animate.leave` для анимации элементов приложения. Эти две функции применяют
CSS-классы входа (enter) и выхода (leave) в подходящие моменты или вызывают функции для применения анимаций из сторонних
библиотек. `animate.enter` и `animate.leave` не являются директивами. Это специальный API, поддерживаемый
непосредственно компилятором Angular. Их можно использовать непосредственно на элементах, а также в качестве привязки к
хосту (host binding).

## `animate.enter`

Вы можете использовать `animate.enter` для анимации элементов при их _появлении_ в DOM. Вы можете определить анимации
входа, используя CSS-классы с переходами (transitions) или keyframe-анимациями.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.ts">
    <docs-code header="enter.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.ts" />
    <docs-code header="enter.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.html" />
    <docs-code header="enter.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.css"/>
</docs-code-multifile>

Когда анимация завершается, Angular удаляет класс или классы, указанные в `animate.enter`, из DOM. Классы анимации
присутствуют только пока анимация активна.

ПРИМЕЧАНИЕ: При использовании нескольких keyframe-анимаций или свойств перехода (transition) на одном элементе, Angular
удаляет все классы только _после_ завершения самой длительной анимации.

Вы можете использовать `animate.enter` с любыми другими возможностями Angular, такими как управляющие конструкции (
control flow) или динамические выражения. `animate.enter` принимает как одну строку с классом (или несколькими классами,
разделенными пробелами), так и массив строк классов.

Краткое замечание об использовании CSS-переходов: Если вы решите использовать переходы вместо keyframe-анимаций, классы,
добавленные к элементу с помощью `animate.enter`, представляют состояние, _к которому_ будет стремиться анимация.
Базовый CSS элемента — это то, как элемент будет выглядеть без анимации (что, вероятно, похоже на конечное состояние
CSS-перехода). Поэтому вам всё равно нужно использовать `@starting-style`, чтобы задать подходящее состояние _от
которого_ (from) будет работать переход.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.ts">
    <docs-code header="enter-binding.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.ts" />
    <docs-code header="enter-binding.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.html" />
    <docs-code header="enter-binding.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.css"/>
</docs-code-multifile>

## `animate.leave`

Вы можете использовать `animate.leave` для анимации элементов при их _удалении_ из DOM. Вы можете определить анимации
выхода, используя CSS-классы с трансформациями или keyframe-анимациями.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.ts">
    <docs-code header="leave.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.ts" />
    <docs-code header="leave.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.html" />
    <docs-code header="leave.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.css"/>
</docs-code-multifile>

По завершении анимации Angular автоматически удаляет анимированный элемент из DOM.

ПРИМЕЧАНИЕ: При использовании нескольких keyframe-анимаций или свойств перехода (transition) на одном элементе, Angular
ожидает удаления элемента только _после_ завершения самой длительной из этих анимаций.

`animate.leave` также можно использовать с Сигналами и другими привязками. Вы можете использовать `animate.leave` с
одним или несколькими классами. Укажите их либо как простую строку с пробелами, либо как массив строк.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.ts">
    <docs-code header="leave-binding.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.ts" />
    <docs-code header="leave-binding.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.html" />
    <docs-code header="leave-binding.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.css"/>
</docs-code-multifile>

## Привязка событий, функции и сторонние библиотеки

И `animate.enter`, и `animate.leave` поддерживают синтаксис привязки событий, позволяющий вызывать функции. Вы можете
использовать этот синтаксис для вызова функции в коде компонента или использования сторонних библиотек анимации, таких
как [GSAP](https://gsap.com/), [anime.js](https://animejs.com/) или любой другой JavaScript-библиотеки анимации.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.ts">
    <docs-code header="leave-event.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.ts" />
    <docs-code header="leave-event.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.html" />
    <docs-code header="leave-event.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.css"/>
</docs-code-multifile>

Объект `$event` имеет тип `AnimationCallbackEvent`. Он содержит элемент в свойстве `target` и предоставляет функцию
`animationComplete()` для уведомления фреймворка о завершении анимации.

ВАЖНО: Вы **должны** вызвать функцию `animationComplete()` при использовании `animate.leave`, чтобы Angular удалил
элемент.

Если вы не вызовете `animationComplete()` при использовании `animate.leave`, Angular вызовет эту функцию автоматически
после четырехсекундной задержки. Вы можете настроить длительность задержки, предоставив токен `MAX_ANIMATION_TIMEOUT` в
миллисекундах.

```typescript
  { provide: MAX_ANIMATION_TIMEOUT, useValue: 6000 }
```

## Совместимость с устаревшими анимациями Angular

Вы не можете использовать устаревшие анимации (legacy animations) вместе с `animate.enter` и `animate.leave` в одном
компоненте. Это приведет к тому, что классы входа останутся на элементе или удаляемые узлы не будут удалены. В остальном
допустимо использовать и устаревшие анимации, и новые `animate.enter` и `animate.leave` в рамках одного _приложения_.
Единственное предостережение касается проекции контента. Если вы проецируете контент из одного компонента с устаревшими
анимациями в другой компонент с `animate.enter` или `animate.leave` (или наоборот), это приведет к такому же поведению,
как если бы они использовались вместе в одном компоненте. Это не поддерживается.

## Тестирование

TestBed предоставляет встроенную поддержку включения или отключения анимаций в тестовой среде. CSS-анимации требуют
наличия браузера для запуска, а многие API недоступны в тестовой среде. По умолчанию TestBed отключает анимации в
тестовых средах.

Если вы хотите проверить, что анимации работают в браузерном тесте (например, в end-to-end тесте), вы можете настроить
TestBed на включение анимаций, указав `animationsEnabled: true` в конфигурации теста.

```typescript
  TestBed.configureTestingModule({animationsEnabled: true});
```

Это настроит анимации в вашей тестовой среде так, чтобы они вели себя как обычно.

ПРИМЕЧАНИЕ: Некоторые тестовые среды не генерируют события анимации, такие как `animationstart`, `animationend` и их
эквиваленты для переходов (transition).

## Подробнее об анимациях в Angular

Возможно, вас также заинтересует следующее:

<docs-pill-row>
  <docs-pill href="guide/animations/css" title="Сложные анимации с помощью CSS"/>
  <docs-pill href="guide/routing/route-transition-animations" title="Анимации переходов маршрутов"/>
</docs-pill-row>
