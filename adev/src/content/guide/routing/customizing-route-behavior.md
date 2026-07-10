# Настройка поведения маршрутов

Angular Router предоставляет мощные точки расширения, позволяющие настраивать поведение маршрутов в приложении. Хотя поведение маршрутизации по умолчанию подходит большинству приложений, конкретные требования часто требуют пользовательских реализаций для оптимизации производительности, специализированной обработки URL или сложной логики маршрутизации.

Настройка маршрутов может быть ценной, когда приложению нужно:

- **Сохранение состояния компонентов** между навигациями, чтобы избежать повторной загрузки данных
- **Стратегическая ленивая загрузка модулей** на основе поведения пользователя или условий сети
- **Интеграция внешних URL** или обработка маршрутов Angular наряду с legacy-системами
- **Динамическое сопоставление маршрутов** на основе условий времени выполнения, выходящих за рамки простых
  паттернов path

NOTE: Перед реализацией пользовательских стратегий убедитесь, что поведение роутера по умолчанию не удовлетворяет ваши потребности. Маршрутизация Angular по умолчанию оптимизирована для типичных сценариев и обеспечивает лучший баланс производительности и простоты. Настройка стратегий маршрутов может создать дополнительную сложность кода и повлиять на использование памяти, если управлять ею неаккуратно.

## Опции конфигурации роутера {#router-configuration-options}

`withRouterConfig` или `RouterModule.forRoot` позволяют предоставить дополнительные `RouterConfigOptions` для настройки поведения Router.

### Обработка отменённых навигаций {#handle-canceled-navigations}

`canceledNavigationResolution` управляет тем, как Router восстанавливает историю браузера, когда навигация отменена. Значение по умолчанию — `'replace'`, которое возвращает к URL до навигации через `location.replaceState`. На практике это означает, что каждый раз, когда адресная строка уже обновлена для навигации (например, кнопками «назад» или «вперёд» браузера), запись истории перезаписывается «откатом», если навигация завершается неудачей или отклоняется guard.
Переключение на `'computed'` синхронизирует индекс истории в полёте с навигацией Angular, поэтому отмена навигации кнопкой «назад» запускает навигацию вперёд (и наоборот), чтобы вернуться на исходную страницу.

Этот параметр наиболее полезен, когда приложение использует `urlUpdateStrategy: 'eager'` или когда guards часто отменяют popstate-навигации, инициированные браузером.

```ts
provideRouter(routes, withRouterConfig({canceledNavigationResolution: 'computed'}));
```

### Реакция на навигации на тот же URL {#react-to-same-url-navigations}

`onSameUrlNavigation` настраивает, что должно происходить, когда пользователь запрашивает навигацию на текущий URL. Значение по умолчанию `'ignore'` пропускает работу, а `'reload'` повторно запускает guards и resolvers и обновляет экземпляры компонентов.

Это полезно, когда нужно, чтобы повторные клики по фильтру списка, пункту левой навигации или кнопке обновления запускали новую загрузку данных, даже если URL не меняется.

```ts
provideRouter(routes, withRouterConfig({onSameUrlNavigation: 'reload'}));
```

Этим поведением также можно управлять на отдельных навигациях, а не глобально. Это позволяет сохранить значение по умолчанию `'ignore'`, выборочно включая поведение reload для конкретных сценариев:

```ts
router.navigate(['/some-path'], {onSameUrlNavigation: 'reload'});
```

### Управление наследованием параметров {#control-parameter-inheritance}

`paramsInheritanceStrategy` определяет, как параметры маршрута и данные передаются от родительских маршрутов.

По умолчанию (`'always'`) дочерние маршруты автоматически наследуют параметры, данные маршрута и resolved-значения от родительских маршрутов.

```ts
provideRouter(routes, withRouterConfig({paramsInheritanceStrategy: 'emptyOnly'}));
```

```ts
export const routes: Routes = [
  {
    path: 'org/:orgId',
    component: Organization,
    children: [
      {
        path: 'projects/:projectId',
        component: Project,
        children: [
          {
            path: 'customers/:customerId',
            component: Customer,
          },
        ],
      },
    ],
  },
];
```

```ts
@Component({
  /* ... */
})
export class Customer {
  private route = inject(ActivatedRoute);

  orgId = this.route.parent?.parent?.snapshot.params['orgId'];
  projectId = this.route.parent?.snapshot.params['projectId'];
  customerId = this.route.snapshot.params['customerId'];
}
```

Это гарантирует, что matrix-параметры, данные маршрута и resolved-значения доступны ниже по дереву маршрутов — удобно, когда контекстные идентификаторы используются в разных областях функциональности, например:

```text {hideCopy}
/org/:orgId/projects/:projectId/customers/:customerId
```

```ts
@Component({
  /* ... */
})
export class Customer {
  private route = inject(ActivatedRoute);

  // All parent parameters are available directly
  orgId = this.route.snapshot.params['orgId'];
  projectId = this.route.snapshot.params['projectId'];
  customerId = this.route.snapshot.params['customerId'];
}
```

### Решение, когда обновляется URL {#decide-when-the-url-updates}

`urlUpdateStrategy` определяет, когда Angular записывает в адресную строку браузера. Значение по умолчанию `'deferred'` ждёт успешной навигации перед изменением URL. Используйте `'eager'`, чтобы обновлять сразу при начале навигации. Eager-обновления упрощают показ запрошенного URL, если навигация завершается неудачей из-за guards или ошибок, но могут кратко показать URL в процессе, если есть долго выполняющиеся guards.

Рассмотрите это, когда pipeline аналитики должен видеть запрошенный маршрут, даже если guards его блокируют.

```ts
provideRouter(routes, withRouterConfig({urlUpdateStrategy: 'eager'}));
```

### Выбор обработки query-параметров по умолчанию {#choose-default-query-parameter-handling}

`defaultQueryParamsHandling` задаёт поведение по умолчанию для `Router.createUrlTree`, когда вызов не указывает `queryParamsHandling`. `'replace'` — значение по умолчанию и заменяет существующую query-строку. `'merge'` объединяет переданные значения с текущими, а `'preserve'` сохраняет существующие query-параметры, если явно не переданы новые.

```ts
provideRouter(routes, withRouterConfig({defaultQueryParamsHandling: 'merge'}));
```

Это особенно полезно для страниц поиска и фильтров, чтобы автоматически сохранять существующие фильтры при передаче дополнительных параметров.

### Настройка обработки завершающего слэша {#configure-trailing-slash-handling}

По умолчанию сервис `Location` удаляет завершающие слэши из URL при чтении.

Можно настроить сервис `Location` так, чтобы он принудительно добавлял завершающий слэш ко всем URL, записываемым в браузер, предоставив `TrailingSlashPathLocationStrategy` в приложении.

```ts
import {LocationStrategy, TrailingSlashPathLocationStrategy} from '@angular/common';

bootstrapApplication(App, {
  providers: [{provide: LocationStrategy, useClass: TrailingSlashPathLocationStrategy}],
});
```

Также можно заставить сервис `Location` никогда не иметь завершающий слэш на всех URL, записываемых в браузер, предоставив `NoTrailingSlashPathLocationStrategy` в приложении.

```ts
import {LocationStrategy, NoTrailingSlashPathLocationStrategy} from '@angular/common';

bootstrapApplication(App, {
  providers: [{provide: LocationStrategy, useClass: NoTrailingSlashPathLocationStrategy}],
});
```

Эти стратегии влияют только на URL, записываемый в браузер.
`Location.path()` и `Location.normalize()` по-прежнему будут удалять завершающие слэши при чтении URL.

Angular Router предоставляет четыре основные области для настройки:

  <docs-pill-row>
    <docs-pill href="#route-reuse-strategy" title="Route reuse strategy"/>
    <docs-pill href="#preloading-strategy" title="Preloading strategy"/>
    <docs-pill href="#url-handling-strategy" title="URL handling strategy"/>
    <docs-pill href="#custom-route-matchers" title="Custom route matchers"/>
  </docs-pill-row>

## Стратегия повторного использования маршрутов {#route-reuse-strategy}

Стратегия повторного использования маршрутов управляет тем, уничтожает и пересоздаёт ли Angular компоненты при навигации или сохраняет их для повторного использования. По умолчанию Angular уничтожает экземпляры компонентов при уходе с маршрута и создаёт новые экземпляры при возврате.

### Когда реализовывать повторное использование маршрутов {#when-to-implement-route-reuse}

Пользовательские стратегии повторного использования маршрутов полезны приложениям, которым нужно:

- **Сохранение состояния формы** — сохранять частично заполненные формы, когда пользователи уходят и возвращаются
- **Сохранение дорогих данных** — избегать повторной загрузки больших наборов данных или сложных вычислений
- **Сохранение позиции прокрутки** — сохранять позиции прокрутки в длинных списках или реализациях infinite scroll
- **Интерфейсы в стиле вкладок** — сохранять состояние компонентов при переключении между вкладками

### Создание пользовательской стратегии повторного использования маршрутов {#creating-a-custom-route-reuse-strategy}

Класс `RouteReuseStrategy` Angular позволяет настраивать поведение навигации через концепцию «detached route handles».

«Detached route handles» — способ Angular хранить экземпляры компонентов и всю их иерархию представлений. Когда маршрут отсоединён (detached), Angular сохраняет экземпляр компонента, его дочерние компоненты и всё связанное состояние в памяти. Это сохранённое состояние можно позже повторно присоединить при навигации обратно к маршруту.

Класс `RouteReuseStrategy` предоставляет следующие методы, управляющие жизненным циклом компонентов маршрута:

| Метод                                                                         | Описание                                                                                                         |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| [`shouldDetach`](api/router/RouteReuseStrategy#shouldDetach)                   | Определяет, следует ли сохранить маршрут для последующего повторного использования при уходе                                         |
| [`store`](api/router/RouteReuseStrategy#store)                                 | Сохраняет detached route handle, когда `shouldDetach` возвращает true                                                   |
| [`shouldAttach`](api/router/RouteReuseStrategy#shouldAttach)                   | Определяет, следует ли повторно присоединить сохранённый маршрут при навигации к нему                                             |
| [`retrieve`](api/router/RouteReuseStrategy#retrieve)                           | Возвращает ранее сохранённый route handle для повторного присоединения                                                         |
| [`shouldReuseRoute`](api/router/RouteReuseStrategy#shouldReuseRoute)           | Определяет, должен ли роутер повторно использовать текущий экземпляр маршрута вместо уничтожения при навигации         |
| [`shouldDestroyInjector`](api/router/RouteReuseStrategy#shouldDestroyInjector) | (Экспериментально) Определяет, должен ли роутер уничтожить injector отсоединённого маршрута, когда он больше не хранится |

Следующий пример демонстрирует пользовательскую стратегию повторного использования маршрутов, которая выборочно сохраняет состояние компонента на основе метаданных маршрута:

```ts
import {
  RouteReuseStrategy,
  Route,
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
} from '@angular/router';
import {Injectable} from '@angular/core';

@Injectable()
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private handlers = new Map<Route | null, DetachedRouteHandle>();

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // Determines if a route should be stored for later reuse
    return route.data['reuse'] === true;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    // Stores the detached route handle when shouldDetach returns true
    if (handle && route.data['reuse'] === true) {
      const key = this.getRouteKey(route);
      this.handlers.set(key, handle);
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    // Checks if a stored route should be reattached
    const key = this.getRouteKey(route);
    return route.data['reuse'] === true && this.handlers.has(key);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    // Returns the stored route handle for reattachment
    const key = this.getRouteKey(route);
    return route.data['reuse'] === true ? (this.handlers.get(key) ?? null) : null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // Determines if the router should reuse the current route instance
    return future.routeConfig === curr.routeConfig;
  }

  private getRouteKey(route: ActivatedRouteSnapshot): Route | null {
    return route.routeConfig;
  }
}
```

### Ручное уничтожение detached route handles {#manually-destroying-detached-route-handles}

При реализации пользовательского `RouteReuseStrategy` может потребоваться вручную уничтожить `DetachedRouteHandle`, если вы решите отбросить его без повторного присоединения. Например, если у стратегии есть лимит размера кэша или handles истекают через определённое время, нужно убедиться, что компонент и его состояние корректно уничтожены, чтобы избежать утечек памяти.

Поскольку `DetachedRouteHandle` — opaque type, нельзя вызвать метод destroy напрямую на нём. Вместо этого используйте функцию `destroyDetachedRouteHandle`, предоставляемую Router.

```ts
import {destroyDetachedRouteHandle} from '@angular/router';

// ... inside your strategy
if (this.handles.size > MAX_CACHE_SIZE) {
  const handle = this.handles.get(oldestKey);
  if (handle) {
    destroyDetachedRouteHandle(handle);
    this.handles.delete(oldestKey);
  }
}
```

NOTE: Избегайте использования path маршрута в качестве ключа, когда задействованы guards `canMatch`, так как это может привести к дублирующимся записям.

### (Экспериментально) Автоматическая очистка неиспользуемых injector маршрутов {#experimental-automatic-cleanup-of-unused-route-injectors}

По умолчанию Angular не уничтожает injectors отсоединённых маршрутов, даже если они больше не хранятся `RouteReuseStrategy`. В первую очередь потому, что такой уровень управления памятью обычно не нужен большинству приложений.

Чтобы включить автоматическую очистку неиспользуемых injector маршрутов, можно использовать функцию `withExperimentalAutoCleanupInjectors` в конфигурации роутера. Эта функция проверяет, какие маршруты в настоящее время хранятся стратегией после навигаций, и уничтожает injectors любых отсоединённых маршрутов, которые в настоящее время не хранятся стратегией повторного использования.

```ts
import {provideRouter, withExperimentalAutoCleanupInjectors} from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withExperimentalAutoCleanupInjectors())],
};
```

Если вы не предоставляете пользовательский `RouteReuseStrategy` или ваш пользовательский strategy расширяет `BaseRouteReuseStrategy`, injectors теперь будут уничтожаться, когда маршрут неактивен.

#### Очистка с пользовательским `RouteReuseStrategy` {#cleanup-with-a-custom-routereusestrategy}

Если приложение использует пользовательский `RouteReuseStrategy` _и_ стратегия не расширяет `BaseRouteReuseStrategy`, нужно реализовать `shouldDestroyInjector`, чтобы сообщить роутеру, у каких маршрутов следует уничтожить injectors:

```ts
@Injectable()
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  // ... other methods

  shouldDestroyInjector(route: Route): boolean {
    return !route.data['retainInjector'];
  }
}
```

Если стратегия когда-либо хранит `DetachedRouteHandle`, также нужно сообщить Router об этих handles, чтобы он не уничтожал injectors, нужные этому отсоединённому handle:

```ts
@Injectable()
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private readonly handles = new Map<Route, DetachedRouteHandle>();

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null) {
    this.handles.set(route.routeConfig!, handle);
  }

  retrieveStoredRouteHandles(): DetachedRouteHandle {
    return Array.from(this.handles.values());
  }

  // ... other methods
}
```

### Настройка маршрута для использования пользовательской стратегии повторного использования {#configuring-a-route-to-use-a-custom-route-reuse-strategy}

Маршруты могут включать поведение повторного использования через метаданные конфигурации маршрута. Этот подход отделяет логику повторного использования от кода компонента, упрощая настройку поведения без изменения компонентов:

```ts
export const routes: Routes = [
  {
    path: 'products',
    component: ProductList,
    data: {reuse: true}, // Component state persists across navigations
  },
  {
    path: 'products/:id',
    component: ProductDetail,
    // No reuse flag - component recreates on each navigation
  },
  {
    path: 'search',
    component: Search,
    data: {reuse: true}, // Preserves search results and filter state
  },
];
```

Также можно настроить пользовательскую стратегию повторного использования маршрутов на уровне приложения через систему внедрения зависимостей Angular. В этом случае Angular создаёт один экземпляр стратегии, который управляет всеми решениями о повторном использовании маршрутов во всём приложении:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy},
  ],
};
```

## Стратегия предзагрузки {#preloading-strategy}

Стратегии предзагрузки определяют, когда Angular загружает лениво загружаемые модули маршрутов в фоне. Хотя ленивая загрузка улучшает время начальной загрузки, откладывая скачивание модулей, пользователи всё ещё испытывают задержку при первой навигации к ленивому маршруту. Стратегии предзагрузки устраняют эту задержку, загружая модули до того, как пользователи их запросят.

### Встроенные стратегии предзагрузки {#built-in-preloading-strategies}

Angular предоставляет две стратегии предзагрузки «из коробки»:

| Стратегия                                            | Описание                                                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [`NoPreloading`](api/router/NoPreloading)           | Стратегия по умолчанию, отключающая всю предзагрузку. Иными словами, модули загружаются только когда пользователи переходят к ним |
| [`PreloadAllModules`](api/router/PreloadAllModules) | Загружает все лениво загружаемые модули сразу после начальной навигации                                           |

Стратегию `PreloadAllModules` можно настроить следующим образом:

```ts
import {ApplicationConfig} from '@angular/core';
import {provideRouter, withPreloading, PreloadAllModules} from '@angular/router';
import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withPreloading(PreloadAllModules))],
};
```

Стратегия `PreloadAllModules` хорошо подходит для малых и средних приложений, где скачивание всех модулей существенно не влияет на производительность. Однако более крупные приложения с множеством feature-модулей могут выиграть от более избирательной предзагрузки.

### Создание пользовательской стратегии предзагрузки {#creating-a-custom-preloading-strategy}

Пользовательские стратегии предзагрузки реализуют интерфейс `PreloadingStrategy`, который требует один метод `preload`. Этот метод получает конфигурацию маршрута и функцию, запускающую фактическую загрузку модуля. Стратегия возвращает Observable, который испускает значение при завершении предзагрузки, или пустой Observable, чтобы пропустить предзагрузку:

```ts
import {Injectable} from '@angular/core';
import {PreloadingStrategy, Route} from '@angular/router';
import {Observable, of, timer} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

@Injectable()
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Only preload routes marked with data: { preload: true }
    if (route.data?.['preload']) {
      return load();
    }
    return of(null);
  }
}
```

Эта избирательная стратегия проверяет метаданные маршрута, чтобы определить поведение предзагрузки. Маршруты могут включить предзагрузку через свою конфигурацию:

```ts
import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes'),
    data: {preload: true}, // Preload immediately after initial navigation
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.routes'),
    data: {preload: false}, // Only load when user navigates to reports
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes'),
    // No preload flag - won't be preloaded
  },
];
```

### Соображения производительности для предзагрузки {#performance-considerations-for-preloading}

Предзагрузка влияет и на использование сети, и на потребление памяти. Каждый предзагруженный модуль потребляет пропускную способность и увеличивает объём памяти приложения. Мобильные пользователи на тарифицируемых соединениях могут предпочесть минимальную предзагрузку, тогда как пользователи десктопа на быстрых сетях могут выдержать агрессивные стратегии предзагрузки.

Время предзагрузки также важно. Немедленная предзагрузка после начальной загрузки может конкурировать с другими критичными ресурсами, такими как изображения или API-вызовы. Стратегии должны учитывать поведение приложения после загрузки и координироваться с другими фоновыми задачами, чтобы избежать деградации производительности.

Лимиты ресурсов браузера также влияют на поведение предзагрузки. Браузеры ограничивают одновременные HTTP-соединения, поэтому агрессивная предзагрузка может встать в очередь за другими запросами. Service workers могут помочь, предоставляя тонкий контроль над кэшированием и сетевыми запросами, дополняя стратегию предзагрузки.

## Стратегия обработки URL {#url-handling-strategy}

Стратегии обработки URL определяют, какие URL обрабатывает Angular router, а какие игнорирует. По умолчанию Angular пытается обработать все события навигации внутри приложения, но реальные приложения часто должны сосуществовать с другими системами, обрабатывать внешние ссылки или интегрироваться с legacy-приложениями, управляющими своими маршрутами.

Класс `UrlHandlingStrategy` даёт контроль над этой границей между маршрутами, управляемыми Angular, и внешними URL. Это становится необходимым при постепенной миграции приложений на Angular или когда приложениям Angular нужно разделять пространство URL с другими фреймворками.

### Реализация пользовательской стратегии обработки URL {#implementing-a-custom-url-handling-strategy}

Пользовательские стратегии обработки URL расширяют класс `UrlHandlingStrategy` и реализуют три метода. Метод `shouldProcessUrl` определяет, должен ли Angular обрабатывать данный URL, `extract` возвращает часть URL, которую Angular должен обработать, а `merge` объединяет фрагмент URL с остальной частью URL:

```ts
import {Injectable} from '@angular/core';
import {UrlHandlingStrategy, UrlTree} from '@angular/router';

@Injectable()
export class CustomUrlHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url: UrlTree): boolean {
    // Only handle URLs that start with /app or /admin
    return url.toString().startsWith('/app') || url.toString().startsWith('/admin');
  }

  extract(url: UrlTree): UrlTree {
    // Return the URL unchanged if we should process it
    return url;
  }

  merge(newUrlPart: UrlTree, rawUrl: UrlTree): UrlTree {
    // Combine the URL fragment with the rest of the URL
    return newUrlPart;
  }
}
```

Эта стратегия создаёт чёткие границы в пространстве URL. Angular обрабатывает пути `/app` и `/admin`, игнорируя всё остальное. Этот паттерн хорошо работает при миграции legacy-приложений, где Angular контролирует конкретные разделы, а legacy-система поддерживает остальные.

### Настройка пользовательской стратегии обработки URL {#configuring-a-custom-url-handling-strategy}

Пользовательскую стратегию можно зарегистрировать через систему внедрения зависимостей Angular:

```ts
import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';
import {UrlHandlingStrategy} from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {provide: UrlHandlingStrategy, useClass: CustomUrlHandlingStrategy},
  ],
};
```

## Пользовательские matchers маршрутов {#custom-route-matchers}

По умолчанию роутер Angular перебирает маршруты в порядке их определения, пытаясь сопоставить path URL с паттерном path каждого маршрута. Он поддерживает статические сегменты, параметризованные сегменты (`:id`) и wildcards (`**`). Побеждает первый совпавший маршрут, и роутер прекращает поиск.

Когда приложениям требуется более сложная логика сопоставления на основе условий времени выполнения, сложных паттернов URL или других пользовательских правил, пользовательские matchers дают эту гибкость, не жертвуя простотой стандартных маршрутов.

Роутер оценивает пользовательские matchers на этапе сопоставления маршрутов, до сопоставления path. Когда matcher возвращает успешное совпадение, он также может извлечь параметры из URL, делая их доступными активированному компоненту так же, как стандартные параметры маршрута.

### Создание пользовательского matcher {#creating-a-custom-matcher}

Пользовательский matcher — это функция, которая получает сегменты URL и возвращает либо результат совпадения с потреблёнными сегментами и параметрами, либо null, чтобы указать отсутствие совпадения. Функция matcher выполняется до того, как Angular оценит свойство path маршрута:

```ts
import {Route, UrlSegment, UrlSegmentGroup, UrlMatchResult} from '@angular/router';

export function customMatcher(
  segments: UrlSegment[],
  group: UrlSegmentGroup,
  route: Route,
): UrlMatchResult | null {
  // Matching logic here
  if (matchSuccessful) {
    return {
      consumed: segments,
      posParams: {
        paramName: new UrlSegment('paramValue', {}),
      },
    };
  }
  return null;
}
```

### Реализация маршрутизации на основе версий {#implementing-version-based-routing}

Рассмотрим сайт документации API, которому нужно маршрутизировать на основе номеров версий в URL. Разные версии могут иметь разные структуры компонентов или наборы функций:

```ts
import {Routes, UrlSegment, UrlMatchResult} from '@angular/router';

export function versionMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  // Match patterns like /v1/docs, /v2.1/docs, /v3.0.1/docs
  if (segments.length >= 2 && segments[0].path.match(/^v\d+(\.\d+)*$/)) {
    return {
      consumed: segments.slice(0, 2), // Consume version and 'docs'
      posParams: {
        version: segments[0], // Make version available as a parameter
        section: segments[1], // Make section available too
      },
    };
  }
  return null;
}

// Route configuration
export const routes: Routes = [
  {
    matcher: versionMatcher,
    component: Documentation,
  },
  {
    path: 'latest/docs',
    redirectTo: 'v3/docs',
  },
];
```

Компонент получает извлечённые параметры через input маршрута:

```angular-ts
import {Component, input, inject} from '@angular/core';
import {resource} from '@angular/core';

@Component({
  selector: 'app-documentation',
  template: `
    @if (documentation.isLoading()) {
      <div>Loading documentation...</div>
    } @else if (documentation.error()) {
      <div>Error loading documentation</div>
    } @else if (documentation.value(); as docs) {
      <article>{{ docs.content }}</article>
    }
  `,
})
export class Documentation {
  // Route parameters are automatically bound to signal inputs
  version = input.required<string>(); // Receives the version parameter
  section = input.required<string>(); // Receives the section parameter

  private docsService = inject(DocumentationService);

  // Resource automatically loads documentation when version or section changes
  documentation = resource({
    params: () => {
      if (!this.version() || !this.section()) return;

      return {
        version: this.version(),
        section: this.section(),
      };
    },
    loader: ({params}) => {
      return this.docsService.loadDocumentation(params.version, params.section);
    },
  });
}
```

### Маршрутизация с учётом локали {#locale-aware-routing}

Международные приложения часто кодируют информацию о локали в URL. Пользовательский matcher может извлечь коды локали и маршрутизировать к подходящим компонентам, делая локаль доступной как параметр:

```ts
// Supported locales
const locales = ['en', 'es', 'fr', 'de', 'ja', 'zh'];

export function localeMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length > 0) {
    const potentialLocale = segments[0].path;

    if (locales.includes(potentialLocale)) {
      // This is a locale prefix, consume it and continue matching
      return {
        consumed: [segments[0]],
        posParams: {
          locale: segments[0],
        },
      };
    } else {
      // No locale prefix, use default locale
      return {
        consumed: [], // Don't consume any segments
        posParams: {
          locale: new UrlSegment('en', {}),
        },
      };
    }
  }

  return null;
}
```

### Сложное сопоставление бизнес-логики {#complex-business-logic-matching}

Пользовательские matchers отлично подходят для реализации бизнес-правил, которые было бы неудобно выражать в паттернах path. Рассмотрим e-commerce сайт, где URL продуктов следуют разным паттернам в зависимости от типа продукта:

```ts
export function productMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length === 0) return null;

  const firstSegment = segments[0].path;

  // Books: /isbn-1234567890
  if (firstSegment.startsWith('isbn-')) {
    return {
      consumed: [segments[0]],
      posParams: {
        productType: new UrlSegment('book', {}),
        identifier: new UrlSegment(firstSegment.substring(5), {}),
      },
    };
  }

  // Electronics: /sku/ABC123
  if (firstSegment === 'sku' && segments.length > 1) {
    return {
      consumed: segments.slice(0, 2),
      posParams: {
        productType: new UrlSegment('electronics', {}),
        identifier: segments[1],
      },
    };
  }

  // Clothing: /style/BRAND/ITEM
  if (firstSegment === 'style' && segments.length > 2) {
    return {
      consumed: segments.slice(0, 3),
      posParams: {
        productType: new UrlSegment('clothing', {}),
        brand: segments[1],
        identifier: segments[2],
      },
    };
  }

  return null;
}
```

### Соображения производительности для пользовательских matchers {#performance-considerations-for-custom-matchers}

Пользовательские matchers выполняются при каждой попытке навигации, пока не будет найдено совпадение. В результате сложная логика сопоставления может повлиять на производительность навигации, особенно в приложениях с множеством маршрутов. Держите matchers сфокусированными и эффективными:

- Возвращайтесь рано, когда совпадение невозможно
- Избегайте дорогих операций, таких как API-вызовы или сложные регулярные выражения
- Рассмотрите кэширование результатов для повторяющихся паттернов URL

Хотя пользовательские matchers элегантно решают сложные требования маршрутизации, чрезмерное использование может усложнить понимание и поддержку конфигурации маршрутов. Оставляйте пользовательские matchers для сценариев, где стандартное сопоставление path действительно недостаточно.
