# Анимации переходов между маршрутами

Анимации переходов между маршрутами улучшают пользовательский опыт, обеспечивая плавные визуальные переходы при навигации между различными представлениями приложения Angular. [Angular Router](/guide/routing) включает встроенную поддержку браузерного View Transitions API, обеспечивая бесшовные анимации при смене маршрутов в поддерживаемых браузерах.

HELPFUL: Нативная интеграция View Transitions в маршрутизаторе в настоящее время находится в [режиме предварительного просмотра для разработчиков](/reference/releases#developer-preview). Нативные View Transitions — это относительно новая функция браузера с ограниченной поддержкой во всех браузерах.

## Как работают View Transitions {#how-view-transitions-work}

View Transitions используют нативный [`document.startViewTransition` API](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition) браузера для создания плавных анимаций между различными состояниями приложения. API работает следующим образом:

1. **Захват текущего состояния** — браузер делает снимок текущей страницы
2. **Выполнение обновления DOM** — функция обратного вызова выполняется для обновления DOM
3. **Захват нового состояния** — браузер захватывает обновлённое состояние страницы
4. **Воспроизведение перехода** — браузер анимирует переход между старым и новым состояниями

Вот базовая структура API `startViewTransition`:

```ts
document.startViewTransition(async () => {
  await updateTheDOMSomehow();
});
```

Дополнительные сведения о браузерном API см. в [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions).

## Как маршрутизатор использует View Transitions {#how-the-router-uses-view-transitions}

Angular Router интегрирует View Transitions в жизненный цикл навигации для создания бесшовной смены маршрутов. Во время навигации маршрутизатор:

1. **Завершает подготовку навигации** — выполняется сопоставление маршрутов, [ленивая загрузка](guide/routing/loading-strategies#lazily-loaded-components-and-routes), [Guard-ы](/guide/routing/route-guards) и [Resolver-ы](/guide/routing/data-resolvers)
2. **Инициирует View Transition** — маршрутизатор вызывает `startViewTransition`, когда маршруты готовы к активации
3. **Обновляет DOM** — маршрутизатор активирует новые маршруты и деактивирует старые в обратном вызове перехода
4. **Завершает переход** — Promise перехода разрешается, когда Angular завершает рендеринг

Интеграция View Transitions в маршрутизаторе действует как [прогрессивное улучшение](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement). Когда браузеры не поддерживают View Transitions API, маршрутизатор выполняет обычные обновления DOM без анимации, обеспечивая работу приложения во всех браузерах.

## Включение View Transitions в маршрутизаторе {#enabling-view-transitions-in-the-router}

Включите View Transitions, добавив функцию `withViewTransitions` в [конфигурацию маршрутизатора](guide/routing/define-routes#adding-the-router-to-your-application). Angular поддерживает как автономную, так и NgModule-подходы начальной загрузки:

### Автономная начальная загрузка {#standalone-bootstrap}

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, withViewTransitions} from '@angular/router';
import {routes} from './app.routes';

bootstrapApplication(MyApp, {
  providers: [provideRouter(routes, withViewTransitions())],
});
```

### Начальная загрузка NgModule {#ngmodule-bootstrap}

```ts
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableViewTransitions: true})],
})
export class AppRouting {}
```

[Попробуйте пример «count» на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-2dnvtm?file=src%2Fmain.ts)

Этот пример демонстрирует, как навигация маршрутизатора может заменить прямые вызовы `startViewTransition` для обновлений счётчика.

## Настройка переходов с помощью CSS {#customizing-transitions-with-css}

Можно настраивать View Transitions с помощью CSS для создания уникальных эффектов анимации. Браузер создаёт отдельные элементы перехода, которые можно выбирать с помощью CSS-селекторов.

Для создания пользовательских переходов:

1. **Добавьте view-transition-name** — присвойте уникальные имена элементам, которые нужно анимировать
2. **Определите глобальные анимации** — создайте CSS-анимации в глобальных стилях
3. **Выберите псевдоэлементы перехода** — используйте селекторы `::view-transition-old()` и `::view-transition-new()`

Вот пример, добавляющий эффект вращения к элементу счётчика:

```css
/* Define keyframe animations */
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

/* Target view transition pseudo-elements */
::view-transition-old(count),
::view-transition-new(count) {
  animation-duration: 200ms;
  animation-name: -ua-view-transition-fade-in, rotate-in;
}

::view-transition-old(count) {
  animation-name: -ua-view-transition-fade-out, rotate-out;
}
```

IMPORTANT: Определяйте анимации View Transitions в глобальном файле стилей, а не в стилях компонентов. [Инкапсуляция представления](/guide/components/styling#style-scoping) Angular ограничивает область видимости стилей компонентов, что не позволяет им корректно выбирать псевдоэлементы перехода.

[Попробуйте обновлённый пример «count» на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-fwn4i7?file=src%2Fmain.ts)

## Расширенное управление переходами с помощью onViewTransitionCreated {#advanced-transition-control-with-onviewtransitioncreated}

Функция `withViewTransitions` принимает объект параметров с обратным вызовом `onViewTransitionCreated` для расширенного управления View Transitions. Этот обратный вызов:

- Выполняется в [контексте внедрения](/guide/di/dependency-injection-context#run-within-an-injection-context)
- Получает объект [`ViewTransitionInfo`](/api/router/ViewTransitionInfo), содержащий:
  - Экземпляр `ViewTransition` из `startViewTransition`
  - [`ActivatedRouteSnapshot`](/api/router/ActivatedRouteSnapshot) для маршрута, с которого выполняется навигация
  - [`ActivatedRouteSnapshot`](/api/router/ActivatedRouteSnapshot) для маршрута, к которому выполняется навигация

Используйте этот обратный вызов для настройки поведения перехода в зависимости от контекста навигации. Например, можно пропускать переходы для определённых типов навигации:

```ts
import {inject} from '@angular/core';
import {Router, withViewTransitions, isActive} from '@angular/router';

withViewTransitions({
  onViewTransitionCreated: ({transition}) => {
    const router = inject(Router);
    const targetUrl = router.currentNavigation()!.finalUrl!;

    // Skip transition if only fragment or query params change
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

Этот пример пропускает View Transition, когда навигация изменяет только [фрагмент URL или параметры запроса](guide/routing/read-route-state#query-parameters) (например, якорные ссылки на той же странице). Метод `skipTransition()` предотвращает анимацию, при этом позволяя навигации завершиться.

## Примеры из Chrome Explainer, адаптированные для Angular {#examples-from-the-chrome-explainer-adapted-to-angular}

Следующие примеры демонстрируют различные техники View Transitions, адаптированные из документации команды Chrome для использования с Angular Router:

### Переходящие элементы не обязаны быть одним и тем же DOM-элементом {#transitioning-elements-dont-need-to-be-the-same-dom-element}

Элементы могут плавно переходить между различными DOM-элементами, если у них одинаковое `view-transition-name`.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#transitioning_elements_dont_need_to_be_the_same_dom_element)
- [Пример Angular на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-dh8npr?file=src%2Fmain.ts)

### Пользовательские анимации входа и выхода {#custom-entry-and-exit-animations}

Создавайте уникальные анимации для элементов, появляющихся и исчезающих из области просмотра при переходах между маршрутами.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#custom_entry_and_exit_transitions)
- [Пример Angular на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-8kly3o)

### Асинхронные обновления DOM и ожидание контента {#async-dom-updates-and-waiting-for-content}

Angular Router отдаёт приоритет немедленным переходам, не ожидая загрузки дополнительного контента.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#async_dom_updates_and_waiting_for_content)

NOTE: Angular Router не предоставляет способа задержки View Transitions. Это проектное решение предотвращает неинтерактивность страниц во время ожидания дополнительного контента. Как отмечает документация Chrome: «В это время страница заморожена, поэтому задержки следует сводить к минимуму… в некоторых случаях лучше полностью избежать задержки и использовать уже имеющийся контент».

### Управление несколькими стилями View Transitions с помощью типов переходов {#handle-multiple-view-transition-styles-with-view-transition-types}

Используйте типы View Transitions для применения различных стилей анимации в зависимости от контекста навигации.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#view-transition-types)
- [Пример Angular на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-vxzcam)

### Управление несколькими стилями View Transitions с помощью имени класса на корне перехода (устарело) {#handle-multiple-view-transition-styles-with-a-class-name-on-the-view-transition-root-deprecated}

Этот подход использует CSS-классы на корневом элементе перехода для управления стилями анимации.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#changing-on-navigation-type)
- [Пример Angular на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-nmnzzg?file=src%2Fmain.ts)

### Переходы без заморозки других анимаций {#transitioning-without-freezing-other-animations}

Поддерживайте другие анимации страницы во время View Transitions для создания более динамичного пользовательского опыта.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#transitioning-without-freezing)
- [Пример Angular на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-76kgww)

### Анимация с помощью JavaScript {#animating-with-javascript}

Управляйте View Transitions программно через JavaScript API для сложных сценариев анимации.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#animating-with-javascript)
- [Пример Angular на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-cklnkm)
