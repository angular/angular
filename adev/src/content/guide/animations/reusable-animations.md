# Переиспользуемые анимации {#reusable-animations}

ВАЖНО: Пакет `@angular/animations` теперь устарел (deprecated). Команда Angular рекомендует использовать нативный CSS с `animate.enter` и `animate.leave` для всего нового кода. Подробнее в новом [руководстве по анимациям](guide/animations). Также см. [Миграция с пакета Angular Animations](guide/animations/migration), чтобы узнать, как начать переход на чистые CSS-анимации.

В этой теме приведены примеры создания переиспользуемых анимаций.

## Создание переиспользуемых анимаций {#create-reusable-animations}

Для создания переиспользуемой анимации используйте функцию [`animation()`](api/animations/animation) для определения анимации в отдельном файле `.ts` и объявите это определение анимации в виде экспортируемой переменной `const`.
Затем можно импортировать и переиспользовать эту анимацию в любых компонентах приложения с помощью функции [`useAnimation()`](api/animations/useAnimation).

<docs-code header="animations.ts" path="adev/src/content/examples/animations/src/app/animations.1.ts" region="animation-const"/>

В приведённом фрагменте кода `transitionAnimation` сделана переиспользуемой путём объявления её как экспортируемой переменной.

ПОЛЕЗНО: Входные параметры `height`, `opacity`, `backgroundColor` и `time` заменяются во время выполнения.

Также можно экспортировать часть анимации.
Например, в следующем фрагменте экспортируется _триггер_ анимации.

<docs-code header="animations.1.ts" path="adev/src/content/examples/animations/src/app/animations.1.ts" region="trigger-const"/>

С этого момента можно импортировать переиспользуемые переменные анимации в класс компонента.
Например, в следующем фрагменте импортируется переменная `transitionAnimation` и используется через функцию `useAnimation()`.

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.3.ts" region="reusable"/>

## Подробнее об анимациях Angular {#more-on-angular-animations}

Также вас может заинтересовать следующее:

<docs-pill-row>
  <docs-pill href="guide/legacy-animations" title="Введение в анимации Angular"/>
  <docs-pill href="guide/legacy-animations/transition-and-triggers" title="Переходы и триггеры"/>
  <docs-pill href="guide/legacy-animations/complex-sequences" title="Сложные последовательности анимаций"/>
  <docs-pill href="guide/routing/route-transition-animations" title="Анимации переходов маршрутов"/>
  <docs-pill href="guide/animations/migration" title="Миграция на нативные CSS-анимации"/>
</docs-pill-row>
