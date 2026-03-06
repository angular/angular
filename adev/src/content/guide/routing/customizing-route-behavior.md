# Настройка поведения маршрутов {#customizing-route-behavior}

Angular Router предоставляет мощные точки расширения, позволяющие настраивать поведение маршрутов в приложении. Хотя поведение маршрутизации по умолчанию хорошо подходит для большинства приложений, конкретные требования часто диктуют необходимость пользовательских реализаций для оптимизации производительности, специализированной обработки URL или сложной логики маршрутизации.

Настройка маршрутов может быть полезна, когда приложению требуется:

- **Сохранение состояния Компонента** между навигациями для предотвращения повторного получения данных
- **Стратегическая ленивая загрузка модулей** на основе поведения пользователя или сетевых условий
- **Интеграция внешних URL** или обработка маршрутов Angular совместно с устаревшими системами
- **Динамическое сопоставление маршрутов** на основе условий выполнения, выходящих за рамки простых шаблонов путей

NOTE: Перед реализацией пользовательских стратегий убедитесь, что поведение Роутера по умолчанию не удовлетворяет вашим потребностям. Маршрутизация Angular по умолчанию оптимизирована для распространённых случаев использования и обеспечивает наилучший баланс производительности и простоты. Настройка стратегий маршрутов может создать дополнительную сложность кода и иметь последствия для производительности в части использования памяти, если она не управляется тщательно.

## Параметры конфигурации Роутера {#router-configuration-options}

`withRouterConfig` или `RouterModule.forRoot` позволяют предоставлять дополнительные `RouterConfigOptions` для настройки поведения Роутера.

### Обработка отменённых навигаций {#handle-canceled-navigations}

`canceledNavigationResolution` управляет тем, как Роутер восстанавливает историю браузера при отмене навигации. Значение по умолчанию — `'replace'`, которое возвращается к URL до начала навигации с помощью `location.replaceState`. На практике это означает, что когда адресная строка уже обновлена для навигации, например при нажатии кнопок «назад» или «вперёд» браузера, запись истории перезаписывается «откатом», если навигация не удалась или была отклонена Guard.
Переключение на `'computed'` синхронизирует индекс истории в процессе с навигацией Angular, поэтому отмена навигации по кнопке «назад» инициирует навигацию «вперёд» (и наоборот) для возврата на исходную страницу.

Этот параметр наиболее полезен, когда приложение использует `urlUpdateStrategy: 'eager'` или когда Guard часто отменяют навигации popstate, инициированные браузером.

```ts
provideRouter(routes, withRouterConfig({canceledNavigationResolution: 'computed'}));
```

### Реакция на навигации к тому же URL {#react-to-same-url-navigations}

`onSameUrlNavigation` настраивает поведение при попытке пользователя перейти к текущему URL. Значение по умолчанию `'ignore'` пропускает обработку, тогда как `'reload'` повторно запускает Guard и резолверы и обновляет экземпляры компонентов.

Это полезно, когда нужно, чтобы повторные нажатия на фильтр списка, элемент левой навигации или кнопку обновления инициировали новое получение данных, даже если URL не изменяется.

```ts
provideRouter(routes, withRouterConfig({onSameUrlNavigation: 'reload'}));
```

Это поведение также можно контролировать для отдельных навигаций, а не глобально. Это позволяет сохранять значение по умолчанию `'ignore'`, выборочно включая поведение перезагрузки для конкретных случаев:

```ts
router.navigate(['/some-path'], {onSameUrlNavigation: 'reload'});
```

### Управление наследованием параметров {#control-parameter-inheritance}

`paramsInheritanceStrategy` определяет, как параметры и данные маршрута передаются от родительских маршрутов.

При значении по умолчанию `'emptyOnly'` дочерние маршруты наследуют параметры только в случае пустого пути или отсутствия компонента у родительского маршрута.

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

Использование `'always'` гарантирует, что матричные параметры, данные маршрута и разрешённые значения доступны глубже по дереву маршрутов — удобно при использовании контекстных идентификаторов в нескольких функциональных областях, например:

```text {hideCopy}
/org/:orgId/projects/:projectId/customers/:customerId
```

```ts
@Component({
  /* ... */
})
export class Customer {
  private route = inject(ActivatedRoute);

  // Все родительские параметры доступны напрямую
  orgId = this.route.snapshot.params['orgId'];
  projectId = this.route.snapshot.params['projectId'];
  customerId = this.route.snapshot.params['customerId'];
}
```

### Управление временем обновления URL {#decide-when-the-url-updates}

`urlUpdateStrategy` определяет, когда Angular записывает изменения в адресную строку браузера. Значение по умолчанию `'deferred'` ожидает успешной навигации перед изменением URL. Используйте `'eager'` для немедленного обновления при начале навигации. Немедленное обновление упрощает отображение попытки URL в случае сбоя навигации из-за Guard или ошибок, но может кратко показывать URL в процессе выполнения, если Guard работают долго.

Учитывайте это, когда конвейер аналитики должен видеть попытку маршрута, даже если Guard блокирует его.

```ts
provideRouter(routes, withRouterConfig({urlUpdateStrategy: 'eager'}));
```

### Настройка обработки параметров запроса по умолчанию {#choose-default-query-parameter-handling}

`defaultQueryParamsHandling` задаёт резервное поведение для `Router.createUrlTree`, когда вызов не указывает `queryParamsHandling`. `'replace'` — значение по умолчанию, заменяющее существующую строку запроса. `'merge'` объединяет предоставленные значения с текущими, а `'preserve'` сохраняет существующие параметры запроса, если новые не указаны явно.

```ts
provideRouter(routes, withRouterConfig({defaultQueryParamsHandling: 'merge'}));
```

Это особенно полезно для страниц поиска и фильтров, чтобы автоматически сохранять существующие фильтры при добавлении дополнительных параметров.

### Настройка обработки завершающей косой черты {#configure-trailing-slash-handling}

По умолчанию Сервис `Location` удаляет завершающие косые черты из URL при чтении.

Можно настроить Сервис `Location` для принудительного добавления завершающей косой черты ко всем URL, записываемым в браузер, предоставив `TrailingSlashPathLocationStrategy` в приложении.

```ts
import {LocationStrategy, TrailingSlashPathLocationStrategy} from '@angular/common';

bootstrapApplication(App, {
  providers: [{provide: LocationStrategy, useClass: TrailingSlashPathLocationStrategy}],
});
```

Также можно принудить Сервис `Location` никогда не добавлять завершающую косую черту ко всем URL, предоставив `NoTrailingSlashPathLocationStrategy` в приложении.

```ts
import {LocationStrategy, NoTrailingSlashPathLocationStrategy} from '@angular/common';

bootstrapApplication(App, {
  providers: [{provide: LocationStrategy, useClass: NoTrailingSlashPathLocationStrategy}],
});
```

Эти стратегии влияют только на URL, записываемые в браузер.
`Location.path()` и `Location.normalize()` продолжат удалять завершающие косые черты при чтении URL.

Angular Router предоставляет четыре основные области для настройки:

  <docs-pill-row>
    <docs-pill href="#route-reuse-strategy" title="Стратегия повторного использования маршрутов"/>
    <docs-pill href="#preloading-strategy" title="Стратегия предзагрузки"/>
    <docs-pill href="#url-handling-strategy" title="Стратегия обработки URL"/>
    <docs-pill href="#custom-route-matchers" title="Пользовательские сопоставители маршрутов"/>
  </docs-pill-row>

## Стратегия повторного использования маршрутов {#route-reuse-strategy}

Стратегия повторного использования маршрутов управляет тем, уничтожает ли Angular компоненты при навигации или сохраняет их для повторного использования. По умолчанию Angular уничтожает экземпляры компонентов при переходе с маршрута и создаёт новые при возврате.

### Когда реализовывать повторное использование маршрутов {#when-to-implement-route-reuse}

Пользовательские стратегии повторного использования маршрутов полезны для приложений, которым требуется:

- **Сохранение состояния формы** — сохранять частично заполненные формы при переходах пользователя
- **Сохранение дорогостоящих данных** — избегать повторного получения больших наборов данных или сложных вычислений
- **Сохранение позиции прокрутки** — сохранять позиции прокрутки в длинных списках или при бесконечной прокрутке
- **Интерфейсы в стиле вкладок** — сохранять состояние компонента при переключении между вкладками

### Создание пользовательской стратегии повторного использования маршрутов {#creating-a-custom-route-reuse-strategy}

Класс `RouteReuseStrategy` Angular позволяет настраивать поведение навигации через концепцию «отсоединённых дескрипторов маршрутов».

«Отсоединённые дескрипторы маршрутов» — это способ Angular хранить экземпляры компонентов и всю их иерархию представлений. При отсоединении маршрута Angular сохраняет экземпляр компонента, его дочерние компоненты и всё связанное состояние в памяти. Это сохранённое состояние впоследствии можно снова присоединить при возврате к маршруту.

Класс `RouteReuseStrategy` предоставляет следующие методы, управляющие жизненным циклом компонентов маршрутов:

| Метод                                                                          | Описание                                                                                                                   |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| [`shouldDetach`](api/router/RouteReuseStrategy#shouldDetach)                   | Определяет, должен ли маршрут быть сохранён для последующего повторного использования при переходе от него                |
| [`store`](api/router/RouteReuseStrategy#store)                                 | Сохраняет отсоединённый дескриптор маршрута, когда `shouldDetach` возвращает true                                         |
| [`shouldAttach`](api/router/RouteReuseStrategy#shouldAttach)                   | Определяет, должен ли сохранённый маршрут быть повторно присоединён при переходе к нему                                   |
| [`retrieve`](api/router/RouteReuseStrategy#retrieve)                           | Возвращает ранее сохранённый дескриптор маршрута для повторного присоединения                                              |
| [`shouldReuseRoute`](api/router/RouteReuseStrategy#shouldReuseRoute)           | Определяет, должен ли Роутер повторно использовать текущий экземпляр маршрута вместо его уничтожения при навигации        |
| [`shouldDestroyInjector`](api/router/RouteReuseStrategy#shouldDestroyInjector) | (Экспериментальный) Определяет, должен ли Роутер уничтожить инжектор отсоединённого маршрута, когда он больше не хранится |

Следующий пример демонстрирует пользовательскую стратегию повторного использования маршрутов, которая избирательно сохраняет состояние компонента на основе метаданных маршрута:

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
    // Определяет, должен ли маршрут быть сохранён для повторного использования
    return route.data['reuse'] === true;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    // Сохраняет отсоединённый дескриптор маршрута, когда shouldDetach возвращает true
    if (handle && route.data['reuse'] === true) {
      const key = this.getRouteKey(route);
      this.handlers.set(key, handle);
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    // Проверяет, должен ли сохранённый маршрут быть повторно присоединён
    const key = this.getRouteKey(route);
    return route.data['reuse'] === true && this.handlers.has(key);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    // Возвращает сохранённый дескриптор маршрута для повторного присоединения
    const key = this.getRouteKey(route);
    return route.data['reuse'] === true ? (this.handlers.get(key) ?? null) : null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // Определяет, должен ли Роутер повторно использовать текущий экземпляр маршрута
    return future.routeConfig === curr.routeConfig;
  }

  private getRouteKey(route: ActivatedRouteSnapshot): Route | null {
    return route.routeConfig;
  }
}
```

### Ручное уничтожение отсоединённых дескрипторов маршрутов {#manually-destroying-detached-route-handles}

При реализации пользовательской `RouteReuseStrategy` может возникнуть необходимость вручную уничтожить `DetachedRouteHandle`, если вы решаете отбросить его без повторного присоединения. Например, если стратегия имеет ограничение размера кэша или дескрипторы истекают через определённое время, необходимо обеспечить правильное уничтожение компонента и его состояния во избежание утечек памяти.

Поскольку `DetachedRouteHandle` — непрозрачный тип, вызвать метод уничтожения напрямую невозможно. Вместо этого используйте функцию `destroyDetachedRouteHandle`, предоставляемую Роутером.

```ts
import {destroyDetachedRouteHandle} from '@angular/router';

// ... внутри вашей стратегии
if (this.handles.size > MAX_CACHE_SIZE) {
  const handle = this.handles.get(oldestKey);
  if (handle) {
    destroyDetachedRouteHandle(handle);
    this.handles.delete(oldestKey);
  }
}
```

NOTE: Избегайте использования пути маршрута в качестве ключа при наличии Guard `canMatch`, так как это может привести к дублирующимся записям.

### (Экспериментальная) Автоматическая очистка неиспользуемых инжекторов маршрутов {#experimental-automatic-cleanup-of-unused-route-injectors}

По умолчанию Angular не уничтожает инжекторы отсоединённых маршрутов, даже если они больше не хранятся `RouteReuseStrategy`. Это объясняется главным образом тем, что такой уровень управления памятью не нужен большинству приложений.

Для включения автоматической очистки неиспользуемых инжекторов маршрутов можно использовать функцию `withExperimentalAutoCleanupInjectors` в конфигурации Роутера. Эта функция проверяет, какие маршруты в данный момент хранятся стратегией после навигаций, и уничтожает инжекторы любых отсоединённых маршрутов, которые в данный момент не хранятся стратегией повторного использования.

```ts
import {provideRouter, withExperimentalAutoCleanupInjectors} from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withExperimentalAutoCleanupInjectors())],
};
```

Если вы не предоставляете пользовательскую `RouteReuseStrategy` или ваша пользовательская стратегия расширяет `BaseRouteReuseStrategy`, инжекторы теперь будут уничтожаться, когда маршрут неактивен.

#### Очистка с пользовательской `RouteReuseStrategy` {#cleanup-with-a-custom-routereusestrategy}

Если приложение использует пользовательскую `RouteReuseStrategy` _и_ стратегия не расширяет `BaseRouteReuseStrategy`, необходимо реализовать `shouldDestroyInjector`, чтобы указать Роутеру, у каких маршрутов следует уничтожать инжекторы:

```ts
@Injectable()
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  // ... другие методы

  shouldDestroyInjector(route: Route): boolean {
    return !route.data['retainInjector'];
  }
}
```

Если стратегия когда-либо хранит `DetachedRouteHandle`, необходимо также сообщить об этом Роутеру, чтобы он не уничтожал инжекторы, нужные этому отсоединённому дескриптору:

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

  // ... другие методы
}
```

### Настройка маршрута для использования пользовательской стратегии повторного использования {#configuring-a-route-to-use-a-custom-route-reuse-strategy}

Маршруты могут включать поведение повторного использования через метаданные конфигурации маршрута. Такой подход отделяет логику повторного использования от кода компонента, упрощая изменение поведения без модификации компонентов:

```ts
export const routes: Routes = [
  {
    path: 'products',
    component: ProductList,
    data: {reuse: true}, // Состояние компонента сохраняется между навигациями
  },
  {
    path: 'products/:id',
    component: ProductDetail,
    // Без флага reuse — компонент воссоздаётся при каждой навигации
  },
  {
    path: 'search',
    component: Search,
    data: {reuse: true}, // Сохраняет результаты поиска и состояние фильтров
  },
];
```

Также можно настроить пользовательскую стратегию повторного использования маршрутов на уровне приложения через систему Внедрения зависимостей Angular. В этом случае Angular создаёт единственный экземпляр стратегии, управляющий всеми решениями о повторном использовании маршрутов в приложении:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy},
  ],
};
```

## Стратегия предзагрузки {#preloading-strategy}

Стратегии предзагрузки определяют, когда Angular загружает модули с ленивой загрузкой в фоновом режиме. Хотя ленивая загрузка улучшает время начальной загрузки, откладывая загрузку модулей, пользователи всё равно испытывают задержку при первом переходе к ленивому маршруту. Стратегии предзагрузки устраняют эту задержку, загружая модули до того, как пользователи их запрашивают.

### Встроенные стратегии предзагрузки {#built-in-preloading-strategies}

Angular предоставляет две стратегии предзагрузки из коробки:

| Стратегия                                                   | Описание                                                                                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`NoPreloading`](api/router/NoPreloading)                   | Стратегия по умолчанию, отключающая всю предзагрузку. Модули загружаются только при переходе пользователя к ним               |
| [`PreloadAllModules`](api/router/PreloadAllModules)         | Загружает все модули с ленивой загрузкой сразу после начальной навигации                                                        |

Стратегию `PreloadAllModules` можно настроить следующим образом:

```ts
import {ApplicationConfig} from '@angular/core';
import {provideRouter, withPreloading, PreloadAllModules} from '@angular/router';
import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withPreloading(PreloadAllModules))],
};
```

Стратегия `PreloadAllModules` хорошо работает для малых и средних приложений, где загрузка всех модулей не оказывает существенного влияния на производительность. Однако более крупные приложения со многими функциональными модулями могут выиграть от более избирательной предзагрузки.

### Создание пользовательской стратегии предзагрузки {#creating-a-custom-preloading-strategy}

Пользовательские стратегии предзагрузки реализуют интерфейс `PreloadingStrategy`, требующий единственного метода `preload`. Этот метод получает конфигурацию маршрута и функцию, инициирующую фактическую загрузку модуля. Стратегия возвращает Observable, эмитирующий значение при завершении предзагрузки, или пустой Observable для пропуска предзагрузки:

```ts
import {Injectable} from '@angular/core';
import {PreloadingStrategy, Route} from '@angular/router';
import {Observable, of, timer} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

@Injectable()
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Предзагружать только маршруты, помеченные data: { preload: true }
    if (route.data?.['preload']) {
      return load();
    }
    return of(null);
  }
}
```

Эта избирательная стратегия проверяет метаданные маршрута для определения поведения предзагрузки. Маршруты могут включаться в предзагрузку через свою конфигурацию:

```ts
import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes'),
    data: {preload: true}, // Предзагрузить сразу после начальной навигации
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.routes'),
    data: {preload: false}, // Загружать только при переходе пользователя к reports
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes'),
    // Без флага preload — не будет предзагружен
  },
];
```

### Аспекты производительности при предзагрузке {#performance-considerations-for-preloading}

Предзагрузка влияет как на использование сети, так и на потребление памяти. Каждый предзагруженный модуль потребляет пропускную способность и увеличивает объём памяти приложения. Мобильные пользователи с лимитированными подключениями могут предпочесть минимальную предзагрузку, тогда как пользователи настольных компьютеров с быстрыми сетями могут использовать агрессивные стратегии предзагрузки.

Время предзагрузки также важно. Немедленная предзагрузка после начальной загрузки может конкурировать с другими критическими ресурсами — изображениями или API-вызовами. Стратегии должны учитывать постзагрузочное поведение приложения и координировать работу с другими фоновыми задачами для предотвращения снижения производительности.

Ограничения ресурсов браузера также влияют на поведение предзагрузки. Браузеры ограничивают количество одновременных HTTP-соединений, поэтому агрессивная предзагрузка может встать в очередь за другими запросами. Сервис-воркеры могут помочь, обеспечивая детальный контроль над кэшированием и сетевыми запросами в дополнение к стратегии предзагрузки.

## Стратегия обработки URL {#url-handling-strategy}

Стратегии обработки URL определяют, какие URL обрабатывает Angular Router, а какие игнорирует. По умолчанию Angular пытается обработать все события навигации внутри приложения, но реальные приложения часто должны сосуществовать с другими системами, обрабатывать внешние ссылки или интегрироваться с устаревшими приложениями, управляющими собственными маршрутами.

Класс `UrlHandlingStrategy` даёт контроль над этой границей между маршрутами, управляемыми Angular, и внешними URL. Это необходимо при постепенной миграции приложений на Angular или когда Angular-приложения должны делить URL-пространство с другими фреймворками.

### Реализация пользовательской стратегии обработки URL {#implementing-a-custom-url-handling-strategy}

Пользовательские стратегии обработки URL расширяют класс `UrlHandlingStrategy` и реализуют три метода. Метод `shouldProcessUrl` определяет, должен ли Angular обрабатывать данный URL, `extract` возвращает часть URL, которую Angular должен обработать, а `merge` объединяет фрагмент URL с остальным URL:

```ts
import {Injectable} from '@angular/core';
import {UrlHandlingStrategy, UrlTree} from '@angular/router';

@Injectable()
export class CustomUrlHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url: UrlTree): boolean {
    // Обрабатывать только URL, начинающиеся с /app или /admin
    return url.toString().startsWith('/app') || url.toString().startsWith('/admin');
  }

  extract(url: UrlTree): UrlTree {
    // Возвращать URL без изменений, если его нужно обработать
    return url;
  }

  merge(newUrlPart: UrlTree, rawUrl: UrlTree): UrlTree {
    // Объединить фрагмент URL с остальным URL
    return newUrlPart;
  }
}
```

Эта стратегия создаёт чёткие границы в URL-пространстве. Angular обрабатывает пути `/app` и `/admin`, игнорируя всё остальное. Такой шаблон хорошо работает при миграции устаревших приложений, где Angular управляет конкретными разделами, тогда как устаревшая система обслуживает остальные.

### Настройка пользовательской стратегии обработки URL {#configuring-a-custom-url-handling-strategy}

Пользовательскую стратегию можно зарегистрировать через систему Внедрения зависимостей Angular:

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

По умолчанию Роутер Angular перебирает маршруты в порядке их определения, пытаясь сопоставить URL-путь с шаблоном пути каждого маршрута. Он поддерживает статические сегменты, параметризованные сегменты (`:id`) и символы-подстановки (`**`). Первый совпавший маршрут побеждает, и Роутер прекращает поиск.

Когда приложениям требуется более сложная логика сопоставления на основе условий выполнения, сложных шаблонов URL или других пользовательских правил, пользовательские сопоставители обеспечивают эту гибкость, не нарушая простоту стандартных маршрутов.

Роутер оценивает пользовательские сопоставители во время фазы сопоставления маршрутов, до сопоставления путей. Когда сопоставитель возвращает успешное совпадение, он также может извлекать параметры из URL, делая их доступными активированному компоненту так же, как стандартные параметры маршрута.

### Создание пользовательского сопоставителя {#creating-a-custom-matcher}

Пользовательский сопоставитель — это функция, получающая сегменты URL и возвращающая либо результат совпадения с потреблёнными сегментами и параметрами, либо null для указания на отсутствие совпадения. Функция сопоставителя выполняется до оценки свойства `path` маршрута Angular:

```ts
import {Route, UrlSegment, UrlSegmentGroup, UrlMatchResult} from '@angular/router';

export function customMatcher(
  segments: UrlSegment[],
  group: UrlSegmentGroup,
  route: Route,
): UrlMatchResult | null {
  // Логика сопоставления здесь
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

Рассмотрим сайт API-документации, которому необходимо маршрутизировать на основе номеров версий в URL. Разные версии могут иметь разные структуры компонентов или наборы функций:

```ts
import {Routes, UrlSegment, UrlMatchResult} from '@angular/router';

export function versionMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  // Совпадение с шаблонами вида /v1/docs, /v2.1/docs, /v3.0.1/docs
  if (segments.length >= 2 && segments[0].path.match(/^v\d+(\.\d+)*$/)) {
    return {
      consumed: segments.slice(0, 2), // Потреблять версию и 'docs'
      posParams: {
        version: segments[0], // Сделать версию доступной как параметр
        section: segments[1], // Сделать раздел доступным тоже
      },
    };
  }
  return null;
}

// Конфигурация маршрутов
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

Компонент получает извлечённые параметры через входные данные маршрута:

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
  // Параметры маршрута автоматически привязываются к сигнальным входным данным
  version = input.required<string>(); // Получает параметр version
  section = input.required<string>(); // Получает параметр section

  private docsService = inject(DocumentationService);

  // Resource автоматически загружает документацию при изменении version или section
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

Международные приложения часто кодируют информацию о локали в URL. Пользовательский сопоставитель может извлекать коды локали и маршрутизировать к соответствующим компонентам, делая локаль доступной как параметр:

```ts
// Поддерживаемые локали
const locales = ['en', 'es', 'fr', 'de', 'ja', 'zh'];

export function localeMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length > 0) {
    const potentialLocale = segments[0].path;

    if (locales.includes(potentialLocale)) {
      // Это префикс локали, потребить его и продолжить сопоставление
      return {
        consumed: [segments[0]],
        posParams: {
          locale: segments[0],
        },
      };
    } else {
      // Нет префикса локали, использовать локаль по умолчанию
      return {
        consumed: [], // Не потреблять никаких сегментов
        posParams: {
          locale: new UrlSegment('en', {}),
        },
      };
    }
  }

  return null;
}
```

### Сопоставление со сложной бизнес-логикой {#complex-business-logic-matching}

Пользовательские сопоставители превосходно справляются с реализацией бизнес-правил, которые было бы неудобно выражать в шаблонах путей. Рассмотрим сайт электронной коммерции, где URL продуктов следуют различным шаблонам в зависимости от типа продукта:

```ts
export function productMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length === 0) return null;

  const firstSegment = segments[0].path;

  // Книги: /isbn-1234567890
  if (firstSegment.startsWith('isbn-')) {
    return {
      consumed: [segments[0]],
      posParams: {
        productType: new UrlSegment('book', {}),
        identifier: new UrlSegment(firstSegment.substring(5), {}),
      },
    };
  }

  // Электроника: /sku/ABC123
  if (firstSegment === 'sku' && segments.length > 1) {
    return {
      consumed: segments.slice(0, 2),
      posParams: {
        productType: new UrlSegment('electronics', {}),
        identifier: segments[1],
      },
    };
  }

  // Одежда: /style/BRAND/ITEM
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

Пользовательские сопоставители запускаются при каждой попытке навигации до нахождения совпадения. В результате сложная логика сопоставления может влиять на производительность навигации, особенно в приложениях со многими маршрутами. Держите сопоставители сфокусированными и эффективными:

- Возвращайте значение раньше, когда совпадение невозможно
- Избегайте дорогостоящих операций, таких как вызовы API или сложные регулярные выражения
- Рассмотрите кэширование результатов для повторяющихся шаблонов URL

Хотя пользовательские сопоставители элегантно решают сложные требования к маршрутизации, их чрезмерное использование может затруднить понимание и поддержку конфигурации маршрутов. Резервируйте пользовательские сопоставители для сценариев, где стандартное сопоставление путей действительно не справляется.
