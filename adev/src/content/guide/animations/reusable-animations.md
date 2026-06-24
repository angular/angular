# Переиспользуемые анимации

IMPORTANT: Пакет `@angular/animations` теперь считается устаревшим. Команда Angular рекомендует использовать нативный
CSS с `animate.enter` и `animate.leave` для анимаций во всем новом коде. Подробнее читайте в
новом [руководстве по анимации](guide/animations/enter-and-leave) enter и leave. Также ознакомьтесь
с [Миграцией с пакета Angular Animations](guide/animations/migration), чтобы узнать, как начать переход на чистые
CSS-анимации в ваших приложениях.

В этой теме приведены примеры создания переиспользуемых анимаций.

## Создание переиспользуемых анимаций

Чтобы создать переиспользуемую анимацию, используйте функцию [`animation()`](api/animations/animation) для определения
анимации в отдельном `.ts` файле и объявите это определение как экспортируемую переменную `const`.
Затем вы можете импортировать и повторно использовать эту анимацию в любых компонентах вашего приложения с помощью
функции [`useAnimation()`](api/animations/useAnimation).

<docs-code header="animations.ts" path="adev/src/content/examples/animations/src/app/animations.1.ts" region="animation-const"/>

В предыдущем фрагменте кода `transitionAnimation` становится переиспользуемой благодаря объявлению её как экспортируемой
переменной.

HELPFUL: Входные параметры `height`, `opacity`, `backgroundColor` и `time` заменяются во время выполнения.

Вы также можете экспортировать часть анимации.
Например, следующий фрагмент экспортирует `trigger` анимации.

<docs-code header="animations.1.ts" path="adev/src/content/examples/animations/src/app/animations.1.ts" region="trigger-const"/>

С этого момента вы можете импортировать переменные переиспользуемой анимации в класс вашего компонента.
Например, следующий фрагмент кода импортирует переменную `transitionAnimation` и использует её через функцию
`useAnimation()`.

<docs-code header="open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.3.ts" region="reusable"/>

## Дополнительно об анимациях в Angular

Вас также может заинтересовать следующее:

<docs-pill-row>
  <docs-pill href="guide/legacy-animations" title="Введение в анимации Angular"/>
  <docs-pill href="guide/legacy-animations/transition-and-triggers" title="Переходы и триггеры"/>
  <docs-pill href="guide/legacy-animations/complex-sequences" title="Сложные последовательности анимации"/>
  <docs-pill href="guide/routing/route-transition-animations" title="Анимации переходов маршрутов"/>
  <docs-pill href="guide/animations/migration" title="Миграция на нативные CSS-анимации"/>
</docs-pill-row>
