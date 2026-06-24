# Анимации переходов между маршрутами

Анимации переходов между маршрутами улучшают пользовательский опыт, обеспечивая плавные визуальные переходы при
навигации между различными представлениями в вашем Angular-приложении. [Angular Router](/guide/routing/overview)
включает встроенную поддержку браузерного API View Transitions, что позволяет создавать бесшовные анимации при смене
маршрутов в поддерживаемых браузерах.

HELPFUL: Нативная интеграция View Transitions в Роутер в настоящее время находится
в [developer preview](/reference/releases#developer-preview). Нативные View Transitions — это относительно новая
возможность браузеров с ограниченной поддержкой.

## Как работают View Transitions

View Transitions используют нативный браузерный [
`document.startViewTransition` API](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition) для
создания плавных анимаций между различными состояниями вашего приложения. API работает следующим образом:

1. **Захват текущего состояния** — Браузер делает снимок текущей страницы.
2. **Выполнение обновления DOM** — Запускается ваша функция обратного вызова для обновления DOM.
3. **Захват нового состояния** — Браузер захватывает обновленное состояние страницы.
4. **Воспроизведение перехода** — Браузер анимирует переход между старым и новым состояниями.

Вот базовая структура API `startViewTransition`:

```ts
document.startViewTransition(async () => {
  await updateTheDOMSomehow();
});
```

Для получения более подробной информации о браузерном API
см. [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions).

## Как Роутер использует View Transitions

Angular Router интегрирует View Transitions в жизненный цикл навигации для создания бесшовных изменений маршрутов. Во
время навигации Роутер:

1. **Завершает подготовку навигации** — Выполняются сопоставление
   маршрутов, [ленивая загрузка](/guide/routing/define-routes#lazily-loaded-components), [Guards](/guide/routing/route-guards)
   и [Resolvers](/guide/routing/data-resolvers).
2. **Инициализирует View Transition** — Роутер вызывает `startViewTransition`, когда маршруты готовы к активации.
3. **Обновляет DOM** — Роутер активирует новые маршруты и деактивирует старые внутри колбэка перехода.
4. **Завершает переход** — Promise перехода разрешается, когда Angular завершает рендеринг.

Интеграция View Transitions в Роутер действует
как [прогрессивное улучшение](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement). Если браузеры
не поддерживают API View Transitions, Роутер выполняет обычные обновления DOM без анимации, гарантируя работу вашего
приложения во всех браузерах.

## Включение View Transitions в Роутере

Включите View Transitions, добавив функцию `withViewTransitions` в
вашу [конфигурацию роутера](/guide/routing/define-routes#adding-the-router-to-your-application). Angular поддерживает
как Standalone, так и NgModule подходы к загрузке приложения:

### Загрузка Standalone-приложения

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';

bootstrapApplication(MyApp, {
  providers: [
    provideRouter(routes, withViewTransitions()),
  ]
});
```

### Загрузка с NgModule

```ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableViewTransitions: true})]
})
export class AppRouting {}
```

[Попробуйте пример "count" на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-2dnvtm?file=src%2Fmain.ts)

Этот пример демонстрирует, как навигация роутера может заменить прямые вызовы `startViewTransition` для обновления
счетчика.

## Настройка переходов с помощью CSS

Вы можете настроить View Transitions с помощью CSS для создания уникальных эффектов анимации. Браузер создает отдельные
элементы перехода, к которым можно обращаться с помощью CSS-селекторов.

Чтобы создать пользовательские переходы:

1. **Добавьте view-transition-name** — Назначьте уникальные имена элементам, которые вы хотите анимировать.
2. **Определите глобальные анимации** — Создайте CSS-анимации в ваших глобальных стилях.
3. **Используйте псевдоэлементы перехода** — Используйте селекторы `::view-transition-old()` и
   `::view-transition-new()`.

Вот пример, добавляющий эффект вращения к элементу счетчика:

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

IMPORTANT: Определяйте анимации View Transitions в файле глобальных стилей, а не в стилях
компонента. [Инкапсуляция представления](/guide/components/styling#view-encapsulation) в Angular изолирует стили
компонента, что не позволяет им корректно воздействовать на псевдоэлементы перехода.

[Попробуйте обновленный пример "count" на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-fwn4i7?file=src%2Fmain.ts)

## Расширенное управление переходами с помощью onViewTransitionCreated

Функция `withViewTransitions` принимает объект опций с колбэком `onViewTransitionCreated` для расширенного управления
переходами. Этот колбэк:

- Выполняется
  в [контексте внедрения зависимостей](/guide/di/dependency-injection-context#run-within-an-injection-context).
- Получает объект [`ViewTransitionInfo`](/api/router/ViewTransitionInfo), содержащий:
  - Экземпляр `ViewTransition` из `startViewTransition`.
  - [`ActivatedRouteSnapshot`](/api/router/ActivatedRouteSnapshot) для маршрута, с которого осуществляется переход.
  - [`ActivatedRouteSnapshot`](/api/router/ActivatedRouteSnapshot) для маршрута, на который осуществляется переход.

Используйте этот колбэк для настройки поведения перехода в зависимости от контекста навигации. Например, вы можете
пропустить переходы для определенных типов навигации:

```ts
import { inject } from '@angular/core';
import { Router, withViewTransitions } from '@angular/router';

withViewTransitions({
  onViewTransitionCreated: ({transition}) => {
    const router = inject(Router);
    const targetUrl = router.getCurrentNavigation()!.finalUrl!;

    // Skip transition if only fragment or query params change
    const config = {
      paths: 'exact',
      matrixParams: 'exact',
      fragment: 'ignored',
      queryParams: 'ignored',
    };

    if (router.isActive(targetUrl, config)) {
      transition.skipTransition();
    }
  },
})
```

Этот пример пропускает View Transition, когда навигация изменяет
только [фрагмент URL или параметры запроса](/guide/routing/read-route-state#query-parameters) (например, якорные ссылки
на той же странице). Метод `skipTransition()` предотвращает анимацию, но позволяет навигации завершиться.

## Примеры из Chrome Explainer, адаптированные для Angular

Следующие примеры демонстрируют различные техники View Transitions, адаптированные из документации команды Chrome для
использования с Angular Router:

### Элементы перехода не обязательно должны быть одним и тем же DOM-элементом

Элементы могут плавно переходить между разными DOM-элементами, если у них одинаковое имя `view-transition-name`.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#transitioning_elements_dont_need_to_be_the_same_dom_element)
- [Пример Angular на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-dh8npr?file=src%2Fmain.ts)

### Пользовательские анимации входа и выхода

Создавайте уникальные анимации для элементов, входящих и выходящих из области просмотра во время переходов между
маршрутами.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#custom_entry_and_exit_transitions)
- [Пример Angular на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-8kly3o)

### Асинхронные обновления DOM и ожидание контента

Angular Router отдает приоритет немедленным переходам, а не ожиданию загрузки дополнительного контента.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#async_dom_updates_and_waiting_for_content)

NOTE: Angular Router не предоставляет способа задержать View Transitions. Это проектное решение предотвращает потерю
интерактивности страниц во время ожидания дополнительного контента. Как отмечается в документации Chrome: "В это время
страница заморожена, поэтому задержки здесь должны быть сведены к минимуму... в некоторых случаях лучше вообще избегать
задержки и использовать тот контент, который у вас уже есть".

### Обработка нескольких стилей View Transition с помощью типов переходов

Используйте типы переходов (view transition types) для применения различных стилей анимации в зависимости от контекста
навигации.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#view-transition-types)
- [Пример Angular на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-vxzcam)

### Обработка нескольких стилей View Transition с помощью имени класса на корне перехода (устарело)

Этот подход использует CSS-классы на корневом элементе перехода для управления стилями анимации.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#changing-on-navigation-type)
- [Пример Angular на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-nmnzzg?file=src%2Fmain.ts)

### Переход без заморозки других анимаций

Поддерживайте другие анимации на странице во время View Transitions для создания более динамичного пользовательского
опыта.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#transitioning-without-freezing)
- [Пример Angular на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-76kgww)

### Анимация с помощью JavaScript

Управляйте View Transitions программно, используя JavaScript API для сложных сценариев анимации.

- [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#animating-with-javascript)
- [Пример Angular на StackBlitz](https://stackblitz.com/edit/stackblitz-starters-cklnkm)
