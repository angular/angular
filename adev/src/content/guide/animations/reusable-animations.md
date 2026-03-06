# Повторно используемые анимации {#reusable-animations}

IMPORTANT: Пакет `@angular/animations` устарел. Команда Angular рекомендует использовать нативный CSS с `animate.enter` и `animate.leave` для анимаций во всём новом коде. Подробнее в новом [руководстве по анимациям](guide/animations). Также ознакомьтесь с разделом [Миграция с пакета Angular Animations](guide/animations/migration), чтобы узнать, как начать переход на чистые CSS-анимации.

В этом разделе приведены примеры создания повторно используемых анимаций.

## Создание повторно используемых анимаций {#create-reusable-animations}

Для создания повторно используемой анимации используйте функцию [`animation()`](api/animations/animation) для определения анимации в отдельном файле `.ts` и объявите это определение анимации как экспортируемую переменную `const`.
Затем можно импортировать и повторно использовать эту анимацию в любых компонентах приложения с помощью функции [`useAnimation()`](api/animations/useAnimation).

<docs-code header="animations.ts" path="adev/src/content/examples/animations/src/app/animations.1.ts" region="animation-const"/>

В приведённом фрагменте кода `transitionAnimation` становится повторно используемой за счёт объявления как экспортируемой переменной.

HELPFUL: Входные значения `height`, `opacity`, `backgroundColor` и `time` заменяются во время выполнения.

Также можно экспортировать часть анимации.
Например, следующий фрагмент экспортирует триггер анимации.

<docs-code header="animations.1.ts" path="adev/src/content/examples/animations/src/app/animations.1.ts" region="trigger-const"/>

С этого момента можно импортировать переменные повторно используемых анимаций в класс компонента.
Например, следующий фрагмент кода импортирует переменную `transitionAnimation` и использует её через функцию `useAnimation()`.

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.3.ts" region="reusable"/>

## Дополнительные материалы по анимациям Angular {#more-on-angular-animations}

Вас также могут заинтересовать следующие материалы:

<docs-pill-row>
  <docs-pill href="guide/legacy-animations" title="Введение в анимации Angular"/>
  <docs-pill href="guide/legacy-animations/transition-and-triggers" title="Переходы и триггеры"/>
  <docs-pill href="guide/legacy-animations/complex-sequences" title="Сложные последовательности анимаций"/>
  <docs-pill href="guide/routing/route-transition-animations" title="Анимации переходов маршрутов"/>
  <docs-pill href="guide/animations/migration" title="Миграция на нативные CSS-анимации"/>
</docs-pill-row>
