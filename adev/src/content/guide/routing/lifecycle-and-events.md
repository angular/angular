# Жизненный цикл и события Router

Angular Router предоставляет полный набор lifecycle hooks и событий, которые позволяют реагировать на изменения навигации и выполнять пользовательскую логику во время процесса маршрутизации.

## Распространённые события router {#common-router-events}

Angular Router испускает события навигации, на которые можно подписаться, чтобы отслеживать жизненный цикл навигации. Эти события доступны через observable `Router.events`. Этот раздел охватывает распространённые события жизненного цикла маршрутизации для навигации и отслеживания ошибок (в хронологическом порядке).

| События                                             | Описание                                                                                                 |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [`NavigationStart`](api/router/NavigationStart)     | Происходит, когда начинается навигация, и содержит запрошенный URL.                                      |
| [`RoutesRecognized`](api/router/RoutesRecognized)   | Происходит после того, как router определяет, какой маршрут соответствует URL, и содержит информацию о состоянии маршрута. |
| [`GuardsCheckStart`](api/router/GuardsCheckStart)   | Начинает фазу route guards. Router оценивает route guards вроде `canActivate` и `canDeactivate`.         |
| [`GuardsCheckEnd`](api/router/GuardsCheckEnd)       | Сигнализирует о завершении оценки guards. Содержит результат (разрешено/запрещено).                      |
| [`ResolveStart`](api/router/ResolveStart)           | Начинает фазу разрешения данных. Route resolvers начинают получать данные.                               |
| [`ResolveEnd`](api/router/ResolveEnd)               | Разрешение данных завершается. Все необходимые данные становятся доступны.                               |
| [`NavigationEnd`](api/router/NavigationEnd)         | Финальное событие, когда навигация успешно завершается. Router обновляет URL.                            |
| [`NavigationSkipped`](api/router/NavigationSkipped) | Происходит, когда router пропускает навигацию (например, навигация на тот же URL).                       |

Следующие — распространённые события ошибок:

| Событие                                           | Описание                                                                         |
| ------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`NavigationCancel`](api/router/NavigationCancel) | Происходит, когда router отменяет навигацию. Часто из-за того, что guard вернул false. |
| [`NavigationError`](api/router/NavigationError)   | Происходит, когда навигация завершается с ошибкой. Может быть из-за невалидных маршрутов или ошибок resolver. |

Полный список всех событий жизненного цикла см. в [полной таблице этого руководства](#all-router-events).

## Как подписаться на события router {#how-to-subscribe-to-router-events}

Когда нужно выполнить код во время конкретных событий жизненного цикла навигации, можно подписаться на `router.events` и проверить экземпляр события:

```ts
// Example of subscribing to router events
import {Component, inject, signal, effect} from '@angular/core';
import {Event, Router, NavigationStart, NavigationEnd} from '@angular/router';

@Component(/* ... */)
export class RouterEvents {
  private readonly router = inject(Router);

  constructor() {
    // Subscribe to router events and react to events
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        // Navigation starting
        console.log('Navigation starting:', event.url);
      }
      if (event instanceof NavigationEnd) {
        // Navigation completed
        console.log('Navigation completed:', event.url);
      }
    });
  }
}
```

NOTE: Тип [`Event`](api/router/Event) из `@angular/router` называется так же, как обычный глобальный тип [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event), но он отличается от типа [`RouterEvent`](api/router/RouterEvent).

## Как отлаживать события маршрутизации {#how-to-debug-routing-events}

Отладка проблем навигации router может быть сложной без видимости последовательности событий. Angular предоставляет встроенную возможность отладки, которая логирует все события router в консоль, помогая понять поток навигации и определить, где возникают проблемы.

Когда нужно исследовать последовательность событий Router, можно включить логирование внутренних событий навигации для отладки. Это настраивается передачей опции конфигурации (`withDebugTracing()`), которая включает подробное логирование всех событий маршрутизации в консоль.

```ts
import {provideRouter, withDebugTracing} from '@angular/router';

const appRoutes: Routes = [];
bootstrapApplication(App, {
  providers: [provideRouter(appRoutes, withDebugTracing())],
});
```

Подробнее см. официальную документацию по [`withDebugTracing`](api/router/withDebugTracing).

## Распространённые сценарии использования {#common-use-cases}

События router позволяют реализовать множество практических возможностей в реальных приложениях. Вот некоторые распространённые паттерны, используемые с событиями router.

### Индикаторы загрузки {#loading-indicators}

Показывайте индикаторы загрузки во время навигации:

```angular-ts
import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    @if (isNavigating()) {
      <div class="loading-bar">Loading...</div>
    }
    <router-outlet />
  `,
})
export class App {
  private router = inject(Router);
  isNavigating = computed(() => !!this.router.currentNavigation());
}
```

### Отслеживание аналитики {#analytics-tracking}

Отслеживайте просмотры страниц для аналитики:

```ts
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {inject, DestroyRef, Service} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';

@Service()
export class AnalyticsService {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  startTracking() {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      // Track page views when URL changes
      if (event instanceof NavigationEnd) {
        // Send page view to analytics
        this.analytics.trackPageView(event.url);
      }
    });
  }

  private analytics = {
    trackPageView: (url: string) => {
      console.log('Page view tracked:', url);
    },
  };
}
```

### Обработка ошибок {#error-handling}

Обрабатывайте ошибки навигации корректно и предоставляйте обратную связь пользователю:

```angular-ts
import {Component, inject, signal} from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationError,
  NavigationCancel,
  NavigationCancellationCode,
} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-error-handler',
  template: `
    @if (errorMessage()) {
      <div class="error-banner">
        {{ errorMessage() }}
        <button (click)="dismissError()">Dismiss</button>
      </div>
    }
  `,
})
export class ErrorHandler {
  private router = inject(Router);
  readonly errorMessage = signal('');

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.errorMessage.set('');
      } else if (event instanceof NavigationError) {
        console.error('Navigation error:', event.error);
        this.errorMessage.set('Failed to load page. Please try again.');
      } else if (event instanceof NavigationCancel) {
        console.warn('Navigation cancelled:', event.reason);
        if (event.code === NavigationCancellationCode.GuardRejected) {
          this.errorMessage.set('Access denied. Please check your permissions.');
        }
      }
    });
  }

  dismissError() {
    this.errorMessage.set('');
  }
}
```

## Все события router {#all-router-events}

Для справки ниже полный список всех событий router, доступных в Angular. Эти события организованы по категориям и перечислены в порядке, в котором они обычно происходят во время навигации.

### События навигации {#navigation-events}

Эти события отслеживают основной процесс навигации от старта через распознавание маршрута, проверки guards и разрешение данных. Они дают видимость каждой фазы жизненного цикла навигации.

| Событие                                                   | Описание                                                        |
| --------------------------------------------------------- | --------------------------------------------------------------- |
| [`NavigationStart`](api/router/NavigationStart)           | Происходит, когда начинается навигация                          |
| [`RouteConfigLoadStart`](api/router/RouteConfigLoadStart) | Происходит перед lazy loading конфигурации маршрута             |
| [`RouteConfigLoadEnd`](api/router/RouteConfigLoadEnd)     | Происходит после загрузки lazy-loaded конфигурации маршрута     |
| [`RoutesRecognized`](api/router/RoutesRecognized)         | Происходит, когда router разбирает URL и распознаёт маршруты    |
| [`GuardsCheckStart`](api/router/GuardsCheckStart)         | Происходит в начале фазы guards                                 |
| [`GuardsCheckEnd`](api/router/GuardsCheckEnd)             | Происходит в конце фазы guards                                  |
| [`ResolveStart`](api/router/ResolveStart)                 | Происходит в начале фазы resolve                                |
| [`ResolveEnd`](api/router/ResolveEnd)                     | Происходит в конце фазы resolve                                 |

### События активации {#activation-events}

Эти события происходят во время фазы активации, когда создаются и инициализируются компоненты маршрута. События активации срабатывают для каждого маршрута в дереве маршрутов, включая родительские и дочерние маршруты.

| Событие                                                   | Описание                                      |
| --------------------------------------------------------- | --------------------------------------------- |
| [`ActivationStart`](api/router/ActivationStart)           | Происходит в начале активации маршрута        |
| [`ChildActivationStart`](api/router/ChildActivationStart) | Происходит в начале активации дочернего маршрута |
| [`ActivationEnd`](api/router/ActivationEnd)               | Происходит в конце активации маршрута         |
| [`ChildActivationEnd`](api/router/ChildActivationEnd)     | Происходит в конце активации дочернего маршрута |

### События завершения навигации {#navigation-completion-events}

Эти события представляют финальный исход попытки навигации. Каждая навигация завершится ровно одним из этих событий, указывая, успешна ли она, отменена, завершилась с ошибкой или была пропущена.

| Событие                                             | Описание                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| [`NavigationEnd`](api/router/NavigationEnd)         | Происходит, когда навигация успешно завершается                     |
| [`NavigationCancel`](api/router/NavigationCancel)   | Происходит, когда router отменяет навигацию                         |
| [`NavigationError`](api/router/NavigationError)     | Происходит, когда навигация завершается из-за неожиданной ошибки    |
| [`NavigationSkipped`](api/router/NavigationSkipped) | Происходит, когда router пропускает навигацию (например, на тот же URL) |

### Другие события {#other-events}

Есть ещё одно событие, которое происходит вне основного жизненного цикла навигации, но всё же является частью системы событий router.

| Событие                       | Описание                |
| ----------------------------- | ----------------------- |
| [`Scroll`](api/router/Scroll) | Происходит во время прокрутки |

## Следующие шаги {#next-steps}

Узнайте больше о [route guards](/guide/routing/route-guards) и [распространённых задачах router](/guide/routing/common-router-tasks).
