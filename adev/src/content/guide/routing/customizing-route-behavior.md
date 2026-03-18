# Настройка поведения маршрутов {#customizing-route-behavior}

Angular Router предоставляет мощные точки расширения, позволяющие настраивать поведение маршрутов в приложении. Хотя поведение маршрутизации по умолчанию хорошо работает для большинства приложений, конкретные требования часто требуют пользовательских реализаций для оптимизации производительности, специализированной обработки URL или сложной логики маршрутизации.

Настройка маршрутов может стать ценной, когда приложению нужно:

- **Сохранение состояния компонента** между навигациями во избежание повторного получения данных
- **Стратегическая ленивая загрузка модулей** на основе поведения пользователя или сетевых условий
- **Интеграция внешних URL** или обработка маршрутов Angular рядом с устаревшими системами
- **Динамическое сопоставление маршрутов** на основе условий во время выполнения, выходящих за рамки простых шаблонов путей

NOTE: Перед реализацией пользовательских стратегий убедитесь, что поведение маршрутизатора по умолчанию не соответствует вашим потребностям. Маршрутизация Angular по умолчанию оптимизирована для распространённых сценариев использования и обеспечивает наилучший баланс производительности и простоты. Настройка стратегий маршрутов может создать дополнительную сложность кода и повлиять на использование памяти, если не управлять этим тщательно.

## Параметры конфигурации маршрутизатора {#router-configuration-options}

`withRouterConfig` или `RouterModule.forRoot` позволяют предоставлять дополнительные `RouterConfigOptions` для настройки поведения маршрутизатора.

### Обработка отменённых навигаций {#handle-canceled-navigations}

`canceledNavigationResolution` управляет тем, как маршрутизатор восстанавливает историю браузера при отмене навигации. Значение по умолчанию — `'replace'`, которое возвращается к URL до навигации с помощью `location.replaceState`. На практике это означает, что всякий раз, когда адресная строка уже была обновлена для навигации — например, при нажатии кнопок «назад» или «вперёд» браузера, — запись истории перезаписывается «откатом», если навигация не удалась или была отклонена Guard-ом.
Переключение на `'computed'` сохраняет синхронизацию текущего индекса истории с навигацией Angular, поэтому отмена навигации по кнопке «назад» вызывает навигацию «вперёд» (и наоборот) для возврата на исходную страницу.

Этот параметр наиболее полезен, когда приложение использует `urlUpdateStrategy: 'eager'` или когда Guard-ы часто отменяют popstate-навигации, инициированные браузером.

```ts
provideRouter(routes, withRouterConfig({canceledNavigationResolution: 'computed'}));
```

### Реакция на навигации к тому же URL {#react-to-same-url-navigations}

`onSameUrlNavigation` настраивает поведение при попытке пользователя перейти к текущему URL. Значение по умолчанию `'ignore'` пропускает обработку, тогда как `'reload'` перезапускает Guard-ы и Resolver-ы и обновляет экземпляры компонентов.

Это полезно, когда нужно, чтобы повторные клики по фильтру списка, элементу левой навигации или кнопке обновления вызывали новое получение данных, даже если URL не меняется.

```ts
provideRouter(routes, withRouterConfig({onSameUrlNavigation: 'reload'}));
```

Также можно управлять этим поведением для отдельных навигаций, а не глобально. Это позволяет сохранять значение по умолчанию `'ignore'`, выборочно включая поведение перезагрузки для конкретных случаев:

```ts
router.navigate(['/some-path'], {onSameUrlNavigation: 'reload'});
```

### Управление наследованием параметров {#control-parameter-inheritance}

`paramsInheritanceStrategy` определяет, как параметры маршрута и данные передаются из родительских маршрутов.

При значении по умолчанию `'emptyOnly'` дочерние маршруты наследуют параметры только тогда, когда их путь пуст или родитель не объявляет компонент.

```ts
provideRouter(routes, withRouterConfig({paramsInheritanceStrategy: 'always'}));
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

Использование `'always'` гарантирует, что матричные параметры, данные маршрута и разрешённые значения доступны глубже в дереве маршрутов — удобно при совместном использовании контекстных идентификаторов в различных функциональных областях, например:

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

### Управление обновлением URL {#decide-when-the-url-updates}

`urlUpdateStrategy` определяет, когда Angular записывает в адресную строку браузера. Значение по умолчанию `'deferred'` ожидает успешной навигации перед изменением URL. Используйте `'eager'` для немедленного обновления при начале навигации. Немедленное обновление упрощает отображение запрошенного URL в случае сбоя навигации из-за Guard-ов или ошибок, но может кратковременно показывать URL в процессе выполнения при наличии долго работающих Guard-ов.

Учитывайте это, когда аналитической системе нужно видеть запрошенный маршрут, даже если Guard-ы его блокируют.

```ts
provideRouter(routes, withRouterConfig({urlUpdateStrategy: 'eager'}));
```

### Выбор обработки параметров запроса по умолчанию {#choose-default-query-parameter-handling}

`defaultQueryParamsHandling` устанавливает резервное поведение для `Router.createUrlTree`, когда вызов не указывает `queryParamsHandling`. `'replace'` является значением по умолчанию и заменяет существующую строку запроса. `'merge'` объединяет предоставленные значения с текущими, а `'preserve'` сохраняет существующие параметры запроса, если не предоставлены новые.

```ts
provideRouter(routes, withRouterConfig({defaultQueryParamsHandling: 'merge'}));
```

Это особенно полезно для страниц поиска и фильтрации для автоматического сохранения существующих фильтров при предоставлении дополнительных параметров.

### Настройка обработки конечного слеша {#configure-trailing-slash-handling}

По умолчанию сервис `Location` удаляет конечные слеши из URL при чтении.

Можно настроить сервис `Location` для добавления конечного слеша ко всем URL, записываемым в браузер, предоставив `TrailingSlashPathLocationStrategy` в приложении.

```ts
import {LocationStrategy, TrailingSlashPathLocationStrategy} from '@angular/common';

bootstrapApplication(App, {
  providers: [{provide: LocationStrategy, useClass: TrailingSlashPathLocationStrategy}],
});
```

Также можно принудительно запретить сервису `Location` добавлять конечный слеш ко всем URL, предоставив `NoTrailingSlashPathLocationStrategy`.

```ts
import {LocationStrategy, NoTrailingSlashPathLocationStrategy} from '@angular/common';

bootstrapApplication(App, {
  providers: [{provide: LocationStrategy, useClass: NoTrailingSlashPathLocationStrategy}],
});
```

Эти стратегии влияют только на URL, записываемый в браузер.
`Location.path()` и `Location.normalize()` по-прежнему будут удалять конечные слеши при чтении URL.

Angular Router предоставляет четыре основные области для настройки:

  <docs-pill-row>
    <docs-pill href="#route-reuse-strategy" title="Стратегия повторного использования маршрутов"/>
    <docs-pill href="#preloading-strategy" title="Стратегия предварительной загрузки"/>
    <docs-pill href="#url-handling-strategy" title="Стратегия обработки URL"/>
    <docs-pill href="#custom-route-matchers" title="Пользовательские сопоставители маршрутов"/>
  </docs-pill-row>

## Стратегия повторного использования маршрутов {#route-reuse-strategy}

Стратегия повторного использования маршрутов управляет тем, уничтожает ли Angular компоненты и воссоздаёт их при навигации или сохраняет для повторного использования. По умолчанию Angular уничтожает экземпляры компонентов при переходе с маршрута и создаёт новые при возврате.

### Когда реализовывать повторное использование маршрутов {#when-to-implement-route-reuse}

Пользовательские стратегии повторного использования маршрутов полезны для приложений, которым нужно:

- **Сохранение состояния форм** — сохранять частично заполненные формы при уходе пользователя и возврате
- **Удержание затратных данных** — избегать повторного получения больших наборов данных или сложных вычислений
- **Поддержание позиции прокрутки** — сохранять позиции прокрутки в длинных списках или реализациях бесконечной прокрутки
- **Интерфейсы с вкладками** — поддерживать состояние компонентов при переключении между вкладками

### Создание пользовательской стратегии повторного использования маршрутов {#creating-a-custom-route-reuse-strategy}

Класс `RouteReuseStrategy` Angular позволяет настраивать поведение навигации через концепцию «отсоединённых дескрипторов маршрутов».

«Отсоединённые дескрипторы маршрутов» — это способ Angular хранить экземпляры компонентов и всю иерархию представлений. При отсоединении маршрута Angular сохраняет в памяти экземпляр компонента, его дочерние компоненты и всё связанное состояние. Это сохранённое состояние позже можно повторно прикрепить при возврате к маршруту.

Класс `RouteReuseStrategy` предоставляет следующие методы, управляющие жизненным циклом компонентов маршрутов:

| Метод                                                                          | Описание                                                                                                                                                      |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`shouldDetach`](api/router/RouteReuseStrategy#shouldDetach)                   | Определяет, должен ли маршрут быть сохранён для последующего повторного использования при уходе с него                                                        |
| [`store`](api/router/RouteReuseStrategy#store)                                 | Сохраняет отсоединённый дескриптор маршрута, когда `shouldDetach` возвращает `true`                                                                           |
| [`shouldAttach`](api/router/RouteReuseStrategy#shouldAttach)                   | Определяет, должен ли сохранённый маршрут быть повторно прикреплён при переходе к нему                                                                        |
| [`retrieve`](api/router/RouteReuseStrategy#retrieve)                           | Возвращает ранее сохранённый дескриптор маршрута для повторного прикрепления                                                                                  |
| [`shouldReuseRoute`](api/router/RouteReuseStrategy#shouldReuseRoute)           | Определяет, должен ли маршрутизатор повторно использовать текущий экземпляр маршрута вместо его уничтожения при навигации                                     |
| [`shouldDestroyInjector`](api/router/RouteReuseStrategy#shouldDestroyInjector) | (Экспериментально) Определяет, должен ли маршрутизатор уничтожить инжектор отсоединённого маршрута, когда он больше не хранится                               |

Следующий пример демонстрирует пользовательскую стратегию повторного использования маршрутов, которая выборочно сохраняет состояние компонентов на основе метаданных маршрута:

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

### Ручное уничтожение отсоединённых дескрипторов маршрутов {#manually-destroying-detached-route-handles}

При реализации пользовательской стратегии `RouteReuseStrategy` может потребоваться вручную уничтожить `DetachedRouteHandle`, если он больше не нужен без повторного прикрепления. Например, если стратегия имеет ограничение размера кэша или срок действия дескрипторов, необходимо обеспечить правильное уничтожение компонента и его состояния во избежание утечек памяти.

Поскольку `DetachedRouteHandle` является непрозрачным типом, нельзя напрямую вызвать метод уничтожения. Вместо этого используйте функцию `destroyDetachedRouteHandle`, предоставляемую маршрутизатором.

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

NOTE: Избегайте использования пути маршрута в качестве ключа при наличии Guard-ов `canMatch`, так как это может привести к дублирующимся записям.

### (Экспериментально) Автоматическая очистка неиспользуемых инжекторов маршрутов {#experimental-automatic-cleanup-of-unused-route-injectors}

По умолчанию Angular не уничтожает инжекторы отсоединённых маршрутов, даже если они больше не хранятся в `RouteReuseStrategy`. Это главным образом потому, что такой уровень управления памятью не нужен большинству приложений.

Для включения автоматической очистки неиспользуемых инжекторов маршрутов можно использовать функцию `withExperimentalAutoCleanupInjectors` в конфигурации маршрутизатора. Эта функция проверяет, какие маршруты в настоящее время хранятся стратегией после навигаций, и уничтожает инжекторы отсоединённых маршрутов, не хранящихся стратегией повторного использования.

```ts
import {provideRouter, withExperimentalAutoCleanupInjectors} from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withExperimentalAutoCleanupInjectors())],
};
```

Если пользовательская стратегия `RouteReuseStrategy` не предоставлена или расширяет `BaseRouteReuseStrategy`, инжекторы теперь будут уничтожаться при неактивном маршруте.

#### Очистка с пользовательской стратегией `RouteReuseStrategy` {#cleanup-with-a-custom-routereusestrategy}

Если приложение использует пользовательскую стратегию `RouteReuseStrategy` _и_ она не расширяет `BaseRouteReuseStrategy`, необходимо реализовать `shouldDestroyInjector`, чтобы указать маршрутизатору, у каких маршрутов следует уничтожать инжекторы:

```ts
@Injectable()
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  // ... other methods

  shouldDestroyInjector(route: Route): boolean {
    return !route.data['retainInjector'];
  }
}
```

Если стратегия когда-либо хранит `DetachedRouteHandle`, также необходимо сообщить об этом маршрутизатору, чтобы он не уничтожил инжекторы, необходимые для отсоединённого дескриптора:

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

Маршруты могут подключаться к поведению повторного использования через метаданные конфигурации маршрута. Этот подход отделяет логику повторного использования от кода компонента, упрощая настройку поведения без изменения компонентов:

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

Также можно настроить пользовательскую стратегию повторного использования маршрутов на уровне приложения через систему внедрения зависимостей Angular. В этом случае Angular создаёт единственный экземпляр стратегии, управляющей всеми решениями о повторном использовании маршрутов в приложении:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy},
  ],
};
```

## Стратегия предварительной загрузки {#preloading-strategy}

Стратегии предварительной загрузки определяют, когда Angular загружает лениво загружаемые модули маршрутов в фоновом режиме. Хотя ленивая загрузка улучшает время начальной загрузки за счёт отложенной загрузки модулей, пользователи всё равно испытывают задержку при первом переходе к ленивому маршруту. Стратегии предварительной загрузки устраняют эту задержку, загружая модули до того, как пользователи их запросят.

### Встроенные стратегии предварительной загрузки {#built-in-preloading-strategies}

Angular предоставляет две стратегии предварительной загрузки из коробки:

| Стратегия                                                   | Описание                                                                                                        |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [`NoPreloading`](api/router/NoPreloading)                   | Стратегия по умолчанию, отключающая все предварительные загрузки. Модули загружаются только при переходе к ним  |
| [`PreloadAllModules`](api/router/PreloadAllModules)         | Загружает все лениво загружаемые модули сразу после первоначальной навигации                                     |

Стратегию `PreloadAllModules` можно настроить следующим образом:

```ts
import {ApplicationConfig} from '@angular/core';
import {provideRouter, withPreloading, PreloadAllModules} from '@angular/router';
import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withPreloading(PreloadAllModules))],
};
```

Стратегия `PreloadAllModules` хорошо работает для небольших и средних приложений, где загрузка всех модулей не оказывает существенного влияния на производительность. Однако большие приложения со многими функциональными модулями могут получить пользу от более избирательной предварительной загрузки.

### Создание пользовательской стратегии предварительной загрузки {#creating-a-custom-preloading-strategy}

Пользовательские стратегии предварительной загрузки реализуют интерфейс `PreloadingStrategy`, требующий единственного метода `preload`. Этот метод получает конфигурацию маршрута и функцию, запускающую фактическую загрузку модуля. Стратегия возвращает Observable, генерирующий значение при завершении предварительной загрузки, или пустой Observable для пропуска предварительной загрузки:

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

Эта избирательная стратегия проверяет метаданные маршрута для определения поведения предварительной загрузки. Маршруты могут подключаться к предварительной загрузке через свою конфигурацию:

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

### Аспекты производительности при предварительной загрузке {#performance-considerations-for-preloading}

Предварительная загрузка влияет как на использование сети, так и на потребление памяти. Каждый предварительно загруженный модуль потребляет полосу пропускания и увеличивает объём памяти приложения. Мобильные пользователи с тарифицируемыми соединениями могут предпочесть минимальную предварительную загрузку, тогда как настольные пользователи с быстрыми сетями могут справиться с агрессивными стратегиями предварительной загрузки.

Время предварительной загрузки также важно. Немедленная предварительная загрузка после первоначальной загрузки может конкурировать с другими критически важными ресурсами, такими как изображения или API-вызовы. Стратегии должны учитывать поведение приложения после загрузки и координировать работу с другими фоновыми задачами во избежание снижения производительности.

Ограничения браузера на ресурсы также влияют на поведение предварительной загрузки. Браузеры ограничивают количество одновременных HTTP-соединений, поэтому агрессивная предварительная загрузка может ставиться в очередь за другими запросами. Сервис-воркеры могут помочь, предоставляя точный контроль над кэшированием и сетевыми запросами в дополнение к стратегии предварительной загрузки.

## Стратегия обработки URL {#url-handling-strategy}

Стратегии обработки URL определяют, какие URL обрабатывает Angular-маршрутизатор, а какие игнорирует. По умолчанию Angular пытается обрабатывать все события навигации в приложении, но реальные приложения часто должны сосуществовать с другими системами, обрабатывать внешние ссылки или интегрироваться с устаревшими приложениями, управляющими собственными маршрутами.

Класс `UrlHandlingStrategy` даёт управление этой границей между маршрутами Angular и внешними URL. Это становится необходимым при постепенной миграции приложений на Angular или когда Angular-приложения должны совместно использовать пространство URL с другими фреймворками.

### Реализация пользовательской стратегии обработки URL {#implementing-a-custom-url-handling-strategy}

Пользовательские стратегии обработки URL расширяют класс `UrlHandlingStrategy` и реализуют три метода. Метод `shouldProcessUrl` определяет, должен ли Angular обрабатывать данный URL, `extract` возвращает часть URL, которую Angular должен обработать, а `merge` объединяет фрагмент URL с остальным URL:

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

Эта стратегия создаёт чёткие границы в пространстве URL. Angular обрабатывает пути `/app` и `/admin`, игнорируя всё остальное. Этот паттерн хорошо работает при миграции устаревших приложений, где Angular контролирует определённые разделы, а устаревшая система управляет остальными.

### Настройка пользовательской стратегии обработки URL {#configuring-a-custom-url-handling-strategy}

Зарегистрировать пользовательскую стратегию можно через систему внедрения зависимостей Angular:

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

## Пользовательские сопоставители маршрутов {#custom-route-matchers}

По умолчанию маршрутизатор Angular перебирает маршруты в порядке их определения, пытаясь сопоставить URL-путь с шаблоном пути каждого маршрута. Он поддерживает статические сегменты, параметризованные сегменты (`:id`) и подстановочные знаки (`**`). Первый совпавший маршрут выигрывает, и маршрутизатор прекращает поиск.

Когда приложениям требуется более сложная логика сопоставления на основе условий выполнения, сложных URL-шаблонов или других пользовательских правил, пользовательские сопоставители обеспечивают эту гибкость без ущерба для простоты стандартных маршрутов.

Маршрутизатор оценивает пользовательские сопоставители в фазе сопоставления маршрутов, до сопоставления путей. Когда сопоставитель возвращает успешное совпадение, он также может извлекать параметры из URL, делая их доступными для активированного компонента так же, как стандартные параметры маршрута.

### Создание пользовательского сопоставителя {#creating-a-custom-matcher}

Пользовательский сопоставитель — это функция, получающая сегменты URL и возвращающая либо результат совпадения с использованными сегментами и параметрами, либо `null` для указания отсутствия совпадения. Функция сопоставителя выполняется до того, как Angular оценивает свойство `path` маршрута:

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

Рассмотрим сайт документации API, которому нужна маршрутизация на основе номеров версий в URL. У разных версий могут быть разные структуры компонентов или наборы функций:

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

Компонент получает извлечённые параметры через входные параметры маршрута:

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

Международные приложения часто кодируют информацию о локали в URL. Пользовательский сопоставитель может извлекать коды локали и направлять к соответствующим компонентам, делая локаль доступной как параметр:

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

### Сопоставление с использованием сложной бизнес-логики {#complex-business-logic-matching}

Пользовательские сопоставители превосходны в реализации бизнес-правил, которые трудно выразить в шаблонах путей. Рассмотрим сайт электронной коммерции, где URL продуктов следуют разным шаблонам в зависимости от типа продукта:

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

### Аспекты производительности для пользовательских сопоставителей {#performance-considerations-for-custom-matchers}

Пользовательские сопоставители выполняются при каждой попытке навигации до нахождения совпадения. В результате сложная логика сопоставления может влиять на производительность навигации, особенно в приложениях со многими маршрутами. Держите сопоставители сфокусированными и эффективными:

- Завершайте работу досрочно, когда совпадение невозможно
- Избегайте затратных операций, таких как API-вызовы или сложные регулярные выражения
- Рассмотрите кэширование результатов для повторяющихся URL-шаблонов

Хотя пользовательские сопоставители элегантно решают сложные задачи маршрутизации, их избыточное использование может затруднить понимание и поддержку конфигурации маршрутов. Оставляйте пользовательские сопоставители для сценариев, где стандартное сопоставление путей действительно не справляется.
