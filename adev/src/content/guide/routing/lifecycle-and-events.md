# Жизненный цикл и события роутера

Angular Router предоставляет полный набор хуков жизненного цикла и событий, которые позволяют реагировать на изменения
навигации и выполнять пользовательскую логику в процессе маршрутизации.

## Общие события роутера

Angular Router генерирует события навигации, на которые можно подписаться для отслеживания жизненного цикла навигации.
Эти события доступны через Observable `Router.events`. В этом разделе рассматриваются общие события жизненного цикла
маршрутизации для навигации и отслеживания ошибок (в хронологическом порядке).

| События                                             | Описание                                                                                                                   |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [`NavigationStart`](api/router/NavigationStart)     | Происходит, когда начинается навигация, и содержит запрошенный URL.                                                        |
| [`RoutesRecognized`](api/router/RoutesRecognized)   | Происходит после того, как роутер определяет, какой маршрут соответствует URL, и содержит информацию о состоянии маршрута. |
| [`GuardsCheckStart`](api/router/GuardsCheckStart)   | Начинает фазу проверки Guard-ов. Роутер оценивает Guard-ы маршрута, такие как `canActivate` и `canDeactivate`.             |
| [`GuardsCheckEnd`](api/router/GuardsCheckEnd)       | Сигнализирует о завершении оценки Guard-ов. Содержит результат (разрешено/запрещено).                                      |
| [`ResolveStart`](api/router/ResolveStart)           | Начинает фазу разрешения данных (data resolution). Resolver-ы маршрута начинают выборку данных.                            |
| [`ResolveEnd`](api/router/ResolveEnd)               | Разрешение данных завершено. Все необходимые данные становятся доступными.                                                 |
| [`NavigationEnd`](api/router/NavigationEnd)         | Финальное событие, когда навигация успешно завершается. Роутер обновляет URL.                                              |
| [`NavigationSkipped`](api/router/NavigationSkipped) | Происходит, когда роутер пропускает навигацию (например, навигация на тот же URL).                                         |

Ниже приведены распространенные события ошибок:

| Событие                                           | Описание                                                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [`NavigationCancel`](api/router/NavigationCancel) | Происходит, когда роутер отменяет навигацию. Часто из-за того, что Guard возвращает `false`.           |
| [`NavigationError`](api/router/NavigationError)   | Происходит при сбое навигации. Может быть вызвано недопустимыми маршрутами или ошибками в Resolver-ах. |

Список всех событий жизненного цикла можно найти в [полной таблице этого руководства](#all-router-events).

## Как подписаться на события роутера

Если вы хотите выполнить код во время определенных событий жизненного цикла навигации, вы можете сделать это,
подписавшись на `router.events` и проверив экземпляр события:

```ts
// Example of subscribing to router events
import { Component, inject, signal, effect } from '@angular/core';
import { Event, Router, NavigationStart, NavigationEnd } from '@angular/router';

@Component({ ... })
export class RouterEventsComponent {
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

Примечание: Тип [`Event`](api/router/Event) из `@angular/router` имеет то же имя, что и обычный глобальный тип [
`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event), но отличается от типа [
`RouterEvent`](api/router/RouterEvent).

## Как отлаживать события маршрутизации

Отладка проблем навигации роутера может быть сложной без видимости последовательности событий. Angular предоставляет
встроенную функцию отладки, которая выводит все события роутера в консоль, помогая понять поток навигации и определить,
где возникают проблемы.

Когда нужно проверить последовательность событий роутера, можно включить логирование внутренних событий навигации для
отладки. Это настраивается передачей опции конфигурации (`withDebugTracing()`), которая включает подробный вывод всех
событий маршрутизации в консоль.

```ts
import { provideRouter, withDebugTracing } from '@angular/router';

const appRoutes: Routes = [];
bootstrapApplication(AppComponent,
  {
    providers: [
      provideRouter(appRoutes, withDebugTracing())
    ]
  }
);
```

Для получения дополнительной информации ознакомьтесь с официальной документацией по [
`withDebugTracing`](api/router/withDebugTracing).

## Распространенные сценарии использования

События роутера позволяют реализовать множество практических функций в реальных приложениях. Вот некоторые
распространенные паттерны, используемые с событиями роутера.

### Индикаторы загрузки

Отображение индикаторов загрузки во время навигации:

```angular-ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-loading',
  template: `
    @if (loading()) {
      <div class="loading-spinner">Loading...</div>
    }
  `
})
export class AppComponent {
  private router = inject(Router);

  readonly loading = toSignal(
    this.router.events.pipe(
      map(() => !!this.router.getCurrentNavigation())
    ),
    { initialValue: false }
  );
}
```

### Отслеживание аналитики

Отслеживание просмотров страниц для аналитики:

```ts
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { inject, Injectable, DestroyRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  startTracking() {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
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
    }
  };
}
```

### Обработка ошибок

Корректная обработка ошибок навигации и предоставление обратной связи пользователю:

```angular-ts
import { Component, inject, signal } from '@angular/core';
import { Router, NavigationStart, NavigationError, NavigationCancel, NavigationCancellationCode } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-error-handler',
  template: `
    @if (errorMessage()) {
      <div class="error-banner">
        {{ errorMessage() }}
        <button (click)="dismissError()">Dismiss</button>
      </div>
    }
  `
})
export class ErrorHandlerComponent {
  private router = inject(Router);
  readonly errorMessage = signal('');

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
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

## Все события роутера {#all-router-events}

Для справки, вот полный список всех событий роутера, доступных в Angular. Эти события организованы по категориям и
перечислены в том порядке, в котором они обычно происходят во время навигации.

### События навигации

Эти события отслеживают основной процесс навигации от начала до распознавания маршрута, проверки Guard-ов и разрешения
данных. Они обеспечивают видимость каждой фазы жизненного цикла навигации.

| Событие                                                   | Описание                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| [`NavigationStart`](api/router/NavigationStart)           | Происходит, когда начинается навигация                       |
| [`RouteConfigLoadStart`](api/router/RouteConfigLoadStart) | Происходит перед ленивой загрузкой конфигурации маршрута     |
| [`RouteConfigLoadEnd`](api/router/RouteConfigLoadEnd)     | Происходит после загрузки ленивой конфигурации маршрута      |
| [`RoutesRecognized`](api/router/RoutesRecognized)         | Происходит, когда роутер разбирает URL и распознает маршруты |
| [`GuardsCheckStart`](api/router/GuardsCheckStart)         | Происходит в начале фазы проверки Guard-ов                   |
| [`GuardsCheckEnd`](api/router/GuardsCheckEnd)             | Происходит в конце фазы проверки Guard-ов                    |
| [`ResolveStart`](api/router/ResolveStart)                 | Происходит в начале фазы разрешения данных (resolve)         |
| [`ResolveEnd`](api/router/ResolveEnd)                     | Происходит в конце фазы разрешения данных (resolve)          |

### События активации

Эти события происходят во время фазы активации, когда создаются и инициализируются компоненты маршрута. События
активации срабатывают для каждого маршрута в дереве маршрутов, включая родительские и дочерние маршруты.

| Событие                                                   | Описание                                         |
| --------------------------------------------------------- | ------------------------------------------------ |
| [`ActivationStart`](api/router/ActivationStart)           | Происходит в начале активации маршрута           |
| [`ChildActivationStart`](api/router/ChildActivationStart) | Происходит в начале активации дочернего маршрута |
| [`ActivationEnd`](api/router/ActivationEnd)               | Происходит в конце активации маршрута            |
| [`ChildActivationEnd`](api/router/ChildActivationEnd)     | Происходит в конце активации дочернего маршрута  |

### События завершения навигации

Эти события представляют собой окончательный результат попытки навигации. Каждая навигация заканчивается ровно одним из
этих событий, указывающим, была ли она успешной, отмененной, неудачной или пропущенной.

| Событие                                             | Описание                                                                          |
| --------------------------------------------------- | --------------------------------------------------------------------------------- |
| [`NavigationEnd`](api/router/NavigationEnd)         | Происходит, когда навигация успешно завершается                                   |
| [`NavigationCancel`](api/router/NavigationCancel)   | Происходит, когда роутер отменяет навигацию                                       |
| [`NavigationError`](api/router/NavigationError)     | Происходит, когда навигация завершается сбоем из-за непредвиденной ошибки         |
| [`NavigationSkipped`](api/router/NavigationSkipped) | Происходит, когда роутер пропускает навигацию (например, навигация на тот же URL) |

### Другие события

Существует одно дополнительное событие, которое происходит вне основного жизненного цикла навигации, но все же является
частью системы событий роутера.

| Событие                       | Описание                      |
| ----------------------------- | ----------------------------- |
| [`Scroll`](api/router/Scroll) | Происходит во время прокрутки |

## Следующие шаги

Узнайте больше о [Guard-ах маршрутов](/guide/routing/route-guards)
и [общих задачах роутера](/guide/routing/common-router-tasks).
