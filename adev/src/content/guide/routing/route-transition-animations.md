# Анимации переходов между маршрутами {#route-transition-animations}

Анимации переходов между маршрутами улучшают пользовательский опыт, обеспечивая плавные визуальные переходы при навигации между различными представлениями в Angular-приложении. [Angular Router](/guide/routing) включает встроенную поддержку View Transitions API браузера, обеспечивая бесшовные анимации при смене маршрутов в поддерживаемых браузерах.

HELPFUL: Встроенная интеграция View Transitions в Роутере находится в режиме [предварительного просмотра для разработчиков](/reference/releases#developer-preview). Нативные View Transitions — относительно новая функция браузера с ограниченной поддержкой во всех браузерах.

## Как работают View Transitions {#how-view-transitions-work}

View Transitions используют нативный API браузера [`document.startViewTransition`](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition) для создания плавных анимаций между различными состояниями приложения. API работает следующим образом:

1. **Захват текущего состояния** — браузер делает скриншот текущей страницы
2. **Выполнение обновления DOM** — функция обратного вызова запускается для обновления DOM
3. **Захват нового состояния** — браузер захватывает обновлённое состояние страницы
4. **Воспроизведение перехода** — браузер анимирует переход между старым и новым состояниями

Вот базовая структура API `startViewTransition`:

```ts
document.startViewTransition(async () => {
  await updateTheDOMSomehow();
});
```

Подробнее об API браузера — в [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions).

## Как Роутер использует View Transitions {#how-the-router-uses-view-transitions}

Angular Router интегрирует View Transitions в жизненный цикл навигации для создания бесшовных смен маршрутов. При навигации Роутер:

1. **Завершает подготовку навигации** — выполняются сопоставление маршрутов, [ленивая загрузка](guide/routing/loading-strategies#lazily-loaded-components-and-routes), [Guard](/guide/routing/route-guards) и [Resolver](/guide/routing/data-resolvers)
2. **Инициирует View Transition** — Роутер вызывает `startViewTransition`, когда маршруты готовы к активации
3. **Обновляет DOM** — Роутер активирует новые маршруты и деактивирует старые внутри callback перехода
4. **Завершает переход** — Promise перехода разрешается после завершения рендеринга Angular

Интеграция View Transitions в Роутере работает как [прогрессивное улучшение](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement). Когда браузеры не поддерживают View Transitions API, Роутер выполняет обычные обновления DOM без анимации, обеспечивая работу приложения во всех браузерах.

## Включение View Transitions в Роутере {#enabling-view-transitions-in-the-router}

Включите View Transitions, добавив функцию `withViewTransitions` в [конфигурацию Роутера](/guide/routing/define-routes#adding-the-router-to-your-application). Angular поддерживает как standalone, так и NgModule подходы бутстрапинга:

### Standalone bootstrap {#standalone-bootstrap}

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, withViewTransitions} from '@angular/router';
import {routes} from './app.routes';

bootstrapApplication(MyApp, {
  providers: [provideRouter(routes, withViewTransitions())],
});
```

### NgModule bootstrap {#ngmodule-bootstrap}

```ts
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableViewTransitions: true})],
})
export class AppRouting {}
```

[Попробуйте пример «count» на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-2dnvtm?file=src%2Fmain.ts)

Этот пример демонстрирует, как навигация Роутера может заменить прямые вызовы `startViewTransition` для обновления счётчика.

## Настройка переходов с помощью CSS {#customizing-transitions-with-css}

Можно настраивать View Transitions с помощью CSS для создания уникальных эффектов анимации. Браузер создаёт отдельные элементы перехода, которые можно адресовать с помощью CSS-селекторов.

Для создания пользовательских переходов:

1. **Добавьте view-transition-name** — назначьте уникальные имена элементам для анимации
2. **Определите глобальные анимации** — создайте CSS-анимации в глобальных стилях
3. **Адресуйте псевдоэлементы перехода** — используйте селекторы `::view-transition-old()` и `::view-transition-new()`

Вот пример, добавляющий эффект вращения к элементу счётчика:

```css
/* Определение анимации ключевых кадров */
@keyframes rotate-out {
  to {
    transform: rotate(90deg);
  }
}

@keyframes rotate-in {
  from {
    transform: rotate(-90deg);
  }
}

/* Адресация псевдоэлементов View Transition */
::view-transition-old(count),
::view-transition-new(count) {
  animation-duration: 200ms;
  animation-name: -ua-view-transition-fade-in, rotate-in;
}

::view-transition-old(count) {
  animation-name: -ua-view-transition-fade-out, rotate-out;
}
```

IMPORTANT: Определяйте анимации View Transition в глобальном файле стилей, а не в стилях компонента. [Инкапсуляция представления](/guide/components/styling#style-scoping) Angular ограничивает стили компонента, не позволяя им правильно адресовать псевдоэлементы перехода.

[Попробуйте обновлённый пример «count» на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-fwn4i7?file=src%2Fmain.ts)

## Расширенное управление переходами через onViewTransitionCreated {#advanced-transition-control-with-onviewtransitioncreated}

Функция `withViewTransitions` принимает объект параметров с callback `onViewTransitionCreated` для расширенного управления View Transitions. Этот callback:

- Выполняется в [контексте внедрения зависимостей](/guide/di/dependency-injection-context#run-within-an-injection-context)
- Получает объект [`ViewTransitionInfo`](/api/router/ViewTransitionInfo), содержащий:
  - Экземпляр `ViewTransition` из `startViewTransition`
  - [`ActivatedRouteSnapshot`](/api/router/ActivatedRouteSnapshot) для маршрута, от которого выполняется навигация
  - [`ActivatedRouteSnapshot`](/api/router/ActivatedRouteSnapshot) для маршрута, к которому выполняется навигация

Используйте этот callback для настройки поведения перехода на основе контекста навигации. Например, можно пропустить переходы для определённых типов навигации:

```ts
import {inject} from '@angular/core';
import {Router, withViewTransitions, isActive} from '@angular/router';

withViewTransitions({
  onViewTransitionCreated: ({transition}) => {
    const router = inject(Router);
    const targetUrl = router.currentNavigation()!.finalUrl!;

    // Пропустить переход, если изменяются только фрагмент или параметры запроса
    const config = {
      paths: 'exact',
      matrixParams: 'exact',
      fragment: 'ignored',
      queryParams: 'ignored',
    };

    const isTargetRouteCurrent = isActive(targetUrl, router, config);

    if (isTargetRouteCurrent()) {
      transition.skipTransition();
    }
  },
});
```

В этом примере View Transition пропускается, когда навигация меняет только [фрагмент URL или параметры запроса](/guide/routing/read-route-state#query-parameters) (например, якорные ссылки на той же странице). Метод `skipTransition()` предотвращает анимацию, позволяя навигации завершиться.

## Примеры из Chrome Explainer, адаптированные для Angular {#examples-from-the-chrome-explainer-adapted-to-angular}

Следующие примеры демонстрируют различные техники View Transition, адаптированные из документации команды Chrome для использования с Angular Router:

### Переходы не обязательно применяются к одному и тому же элементу DOM {#transitioning-elements-dont-need-to-be-the-same-dom-element}

Элементы могут плавно переходить между различными элементами DOM, если у них одинаковое `view-transition-name`.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#transitioning_elements_dont_need_to_be_the_same_dom_element)
- [Angular Example на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-dh8npr?file=src%2Fmain.ts)

### Пользовательские анимации появления и исчезновения {#custom-entry-and-exit-animations}

Создавайте уникальные анимации для элементов, появляющихся и исчезающих из области видимости при переходах между маршрутами.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#custom_entry_and_exit_transitions)
- [Angular Example на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-8kly3o)

### Асинхронные обновления DOM и ожидание контента {#async-dom-updates-and-waiting-for-content}

Angular Router отдаёт приоритет немедленным переходам, не ожидая загрузки дополнительного контента.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#async_dom_updates_and_waiting_for_content)

NOTE: Angular Router не предоставляет способа задержки View Transitions. Это намеренное решение — страница не должна блокировать взаимодействие в ожидании дополнительного контента. Как указано в документации Chrome: «В это время страница заморожена, поэтому задержки должны быть минимальными... в некоторых случаях лучше вообще избегать задержки и использовать уже имеющийся контент».

### Управление несколькими стилями View Transition с помощью типов переходов {#handle-multiple-view-transition-styles-with-view-transition-types}

Используйте типы View Transition для применения различных стилей анимации в зависимости от контекста навигации.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#view-transition-types)
- [Angular Example на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-vxzcam)

### Управление несколькими стилями View Transition с помощью класса на корне View Transition (устаревший подход) {#handle-multiple-view-transition-styles-with-a-class-name-on-the-view-transition-root-deprecated}

Этот подход использует CSS-классы на корневом элементе перехода для управления стилями анимации.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#changing-on-navigation-type)
- [Angular Example на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-nmnzzg?file=src%2Fmain.ts)

### Переходы без заморозки других анимаций {#transitioning-without-freezing-other-animations}

Сохраняйте другие анимации страницы во время View Transitions для создания более динамичного пользовательского опыта.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#transitioning-without-freezing)
- [Angular Example на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-76kgww)

### Анимация с помощью JavaScript {#animating-with-javascript}

Управляйте View Transitions программно с помощью JavaScript API для сложных сценариев анимации.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#animating-with-javascript)
- [Angular Example на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-cklnkm)
