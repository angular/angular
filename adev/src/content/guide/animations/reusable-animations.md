# Переиспользуемые анимации

IMPORTANT: Пакет `@angular/animations` теперь устарел. Команда Angular рекомендует использовать нативный CSS с `animate.enter` и `animate.leave` для анимаций во всём новом коде. Подробнее — в новом руководстве по enter- и leave-[анимациям](guide/animations). Также см. [Миграция с пакета Angular Animations](guide/animations/migration), чтобы начать переход на чистые CSS-анимации в приложениях.

В этой теме приведены примеры создания переиспользуемых анимаций.

## Создание переиспользуемых анимаций {#create-reusable-animations}

Чтобы создать переиспользуемую анимацию, используйте функцию [`animation()`](api/animations/animation), определите анимацию в отдельном `.ts`-файле и объявите это определение как экспортируемую переменную `const`.
Затем можно импортировать и переиспользовать эту анимацию в компонентах приложения с помощью функции [`useAnimation()`](api/animations/useAnimation).

<docs-code header="animations.ts" path="adev/src/content/examples/animations/src/app/animations.1.ts" region="animation-const"/>

В приведённом фрагменте кода `transitionAnimation` сделана переиспользуемой за счёт объявления как экспортируемой переменной.

HELPFUL: Входные параметры `height`, `opacity`, `backgroundColor` и `time` подставляются во время выполнения.

Можно также экспортировать часть анимации.
Например, следующий фрагмент экспортирует `trigger` анимации.

<docs-code header="animations.1.ts" path="adev/src/content/examples/animations/src/app/animations.1.ts" region="trigger-const"/>

Далее можно импортировать переиспользуемые переменные анимации в класс компонента.
Например, следующий фрагмент импортирует переменную `transitionAnimation` и использует её через функцию `useAnimation()`.

<docs-code header="open-close.ts" path="adev/src/content/examples/animations/src/app/open-close.3.ts" region="reusable"/>

## Дополнительно об анимациях Angular {#more-on-angular-animations}

Вас также могут заинтересовать:

<docs-pill-row>
  <docs-pill href="guide/legacy-animations" title="Introduction to Angular animations"/>
  <docs-pill href="guide/legacy-animations/transition-and-triggers" title="Transition and triggers"/>
  <docs-pill href="guide/legacy-animations/complex-sequences" title="Complex animation sequences"/>
  <docs-pill href="guide/routing/route-transition-animations" title="Route transition animations"/>
  <docs-pill href="guide/animations/migration" title="Migrating to Native CSS Animations"/>
</docs-pill-row>
