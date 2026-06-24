# Настройка поведения маршрутизации

Angular Router предоставляет мощные точки расширения, которые позволяют настраивать поведение маршрутов в вашем
приложении. Хотя стандартное поведение маршрутизации хорошо работает для большинства приложений, специфические
требования часто требуют пользовательских реализаций для оптимизации производительности, специальной обработки URL или
сложной логики маршрутизации.

Настройка маршрутов может стать полезной, когда вашему приложению требуются:

- **Сохранение состояния компонентов** при навигации, чтобы избежать повторной загрузки данных
- **Стратегическая ленивая загрузка модулей** (lazy loading) на основе поведения пользователя или условий сети
- **Интеграция внешних URL** или обработка маршрутов Angular наряду с устаревшими системами
- **Динамическое сопоставление маршрутов** на основе условий времени выполнения, выходящих за рамки простых шаблонов
  путей

ПРИМЕЧАНИЕ: Перед внедрением пользовательских стратегий убедитесь, что стандартное поведение роутера не удовлетворяет
вашим потребностям. Стандартная маршрутизация Angular оптимизирована для общих случаев использования и обеспечивает
лучший баланс производительности и простоты. Настройка стратегий маршрутизации может создать дополнительную сложность
кода и повлиять на использование памяти, если не управлять этим осторожно.

## Опции конфигурации роутера

Функция `withRouterConfig` или метод `RouterModule.forRoot` позволяют предоставить дополнительные опции
`RouterConfigOptions` для настройки поведения Роутера.

### Обработка отмененных навигаций

`canceledNavigationResolution` управляет тем, как Роутер восстанавливает историю браузера при отмене навигации. Значение
по умолчанию — `'replace'`, которое возвращает URL к состоянию до навигации с помощью `location.replaceState`. На
практике это означает, что если адресная строка уже была обновлена для навигации (например, кнопками "Назад" или "
Вперед" в браузере), запись в истории перезаписывается "откатом", если навигация не удалась или была отклонена Guard-ом.
Переключение на `'computed'` поддерживает индекс истории в синхронизации с навигацией Angular, поэтому отмена навигации
кнопкой "Назад" вызывает навигацию "Вперед" (и наоборот), чтобы вернуться на исходную страницу.

Эта настройка наиболее полезна, когда ваше приложение использует `urlUpdateStrategy: 'eager'` или когда Guard-ы часто
отменяют popstate-навигации, инициированные браузером.

```ts
provideRouter(routes, withRouterConfig({ canceledNavigationResolution: 'computed' }));
```

### Реакция на навигацию по тому же URL

`onSameUrlNavigation` настраивает, что должно происходить, когда пользователь запрашивает переход на текущий URL.
Значение по умолчанию `'ignore'` пропускает действия, тогда как `'reload'` повторно запускает Guard-ы и Resolver-ы, а
также обновляет экземпляры компонентов.

Это полезно, когда вы хотите, чтобы повторные клики по фильтру списка, элементу левого меню или кнопке обновления
вызывали новое получение данных, даже если URL не меняется.

```ts
provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' }));
```

Вы также можете управлять этим поведением для отдельных навигаций, а не глобально. Это позволяет сохранить значение по
умолчанию `'ignore'`, выборочно включая поведение перезагрузки для конкретных случаев:

```ts
router.navigate(['/some-path'], { onSameUrlNavigation: 'reload' });
```

### Управление наследованием параметров

`paramsInheritanceStrategy` определяет, как параметры маршрута и данные передаются от родительских маршрутов.

При значении по умолчанию `'emptyOnly'`, дочерние маршруты наследуют параметры только тогда, когда их путь пуст или
родитель не объявляет компонент.

```ts
provideRouter(routes, withRouterConfig({ paramsInheritanceStrategy: 'always' }));
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
            component: Customer
          }
        ]
      }
    ]
  }
];
```

```ts
@Component({ /* ... */})
export class CustomerComponent {
  private route = inject(ActivatedRoute);

  orgId = this.route.parent?.parent?.snapshot.params['orgId'];
  projectId = this.route.parent?.snapshot.params['projectId'];
  customerId = this.route.snapshot.params['customerId'];
}
```

Использование `'always'` гарантирует, что матричные параметры, данные маршрута и разрешенные значения (resolved values)
будут доступны ниже по дереву маршрутов — это удобно, когда вы используете общие контекстные идентификаторы в разных
функциональных областях, например `/org/:orgId/projects/:projectId/customers/:customerId`.

```ts
@Component({ /* ... */})
export class CustomerComponent {
  private route = inject(ActivatedRoute);

  // Все родительские параметры доступны напрямую
  orgId = this.route.snapshot.params['orgId'];
  projectId = this.route.snapshot.params['projectId'];
  customerId = this.route.snapshot.params['customerId'];
}
```

### Решение о моменте обновления URL

`urlUpdateStrategy` определяет, когда Angular записывает изменения в адресную строку браузера. Значение по умолчанию
`'deferred'` ожидает успешной навигации перед изменением URL. Используйте `'eager'` для немедленного обновления при
начале навигации. "Нетерпеливые" (eager) обновления упрощают отображение URL, к которому была попытка перехода, если
навигация не удалась из-за Guard-ов или ошибок, но могут кратковременно показывать URL "в процессе", если у вас есть
долго выполняющиеся Guard-ы.

Учитывайте это, если вашей системе аналитики необходимо видеть маршрут, к которому была попытка перехода, даже если
Guard-ы его заблокировали.

```ts
provideRouter(routes, withRouterConfig({ urlUpdateStrategy: 'eager' }));
```

### Выбор обработки параметров запроса по умолчанию

`defaultQueryParamsHandling` устанавливает резервное поведение для `Router.createUrlTree`, когда вызов не указывает
`queryParamsHandling`. `'replace'` используется по умолчанию и заменяет существующую строку запроса. `'merge'`
объединяет предоставленные значения с текущими, а `'preserve'` сохраняет существующие параметры запроса, если вы явно не
предоставите новые.

```ts
provideRouter(routes, withRouterConfig({ defaultQueryParamsHandling: 'merge' }));
```

Это особенно полезно для страниц поиска и фильтрации, чтобы автоматически сохранять существующие фильтры при добавлении
дополнительных параметров.

Angular Router предоставляет четыре основные области для настройки:

  <docs-pill-row>
    <docs-pill href="#route-reuse-strategy" title="Стратегия повторного использования маршрутов"/>
    <docs-pill href="#preloading-strategy" title="Стратегия предварительной загрузки"/>
    <docs-pill href="#url-handling-strategy" title="Стратегия обработки URL"/>
    <docs-pill href="#custom-route-matchers" title="Пользовательские сопоставители маршрутов"/>
  </docs-pill-row>

## Стратегия повторного использования маршрутов {#route-reuse-strategy}

Стратегия повторного использования маршрутов (Route reuse strategy) управляет тем, уничтожает ли Angular компоненты и
создает их заново во время навигации или сохраняет их для повторного использования. По умолчанию Angular уничтожает
экземпляры компонентов при уходе с маршрута и создает новые экземпляры при возвращении.

### Когда реализовывать повторное использование маршрутов

Пользовательские стратегии повторного использования маршрутов полезны для приложений, которым требуются:

- **Сохранение состояния формы** — сохранение частично заполненных форм, когда пользователи уходят и возвращаются.
- **Сохранение "дорогих" данных** — избежание повторного получения больших наборов данных или выполнения сложных
  вычислений.
- **Сохранение позиции прокрутки** — сохранение позиций прокрутки в длинных списках или реализациях бесконечной
  прокрутки.
- **Интерфейсы с вкладками** — сохранение состояния компонента при переключении между вкладками.

### Создание пользовательской стратегии повторного использования маршрутов

Класс `RouteReuseStrategy` в Angular позволяет настраивать поведение навигации через концепцию "дескрипторов
отсоединенных маршрутов" (detached route handles).

"Дескрипторы отсоединенных маршрутов" — это способ Angular хранить экземпляры компонентов и всю их иерархию
представлений. Когда маршрут отсоединяется, Angular сохраняет экземпляр компонента, его дочерние компоненты и все
связанное состояние в памяти. Это сохраненное состояние может быть позже присоединено обратно при навигации на этот
маршрут.

Класс `RouteReuseStrategy` предоставляет пять методов, управляющих жизненным циклом компонентов маршрута:

| Метод                                                                | Описание                                                                                             |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [`shouldDetach`](api/router/RouteReuseStrategy#shouldDetach)         | Определяет, следует ли сохранить маршрут для последующего использования при уходе с него             |
| [`store`](api/router/RouteReuseStrategy#store)                       | Сохраняет дескриптор отсоединенного маршрута, когда `shouldDetach` возвращает true                   |
| [`shouldAttach`](api/router/RouteReuseStrategy#shouldAttach)         | Определяет, следует ли повторно присоединить сохраненный маршрут при переходе на него                |
| [`retrieve`](api/router/RouteReuseStrategy#retrieve)                 | Возвращает ранее сохраненный дескриптор маршрута для повторного присоединения                        |
| [`shouldReuseRoute`](api/router/RouteReuseStrategy#shouldReuseRoute) | Определяет, должен ли роутер повторно использовать текущий экземпляр маршрута вместо его уничтожения |

Следующий пример демонстрирует пользовательскую стратегию повторного использования маршрутов, которая выборочно
сохраняет состояние компонентов на основе метаданных маршрута:

```ts
import { RouteReuseStrategy, Route, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private handlers = new Map<Route | null, DetachedRouteHandle>();

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // Определяет, следует ли сохранить маршрут для последующего использования
    return route.data['reuse'] === true;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    // Сохраняет дескриптор отсоединенного маршрута, когда shouldDetach возвращает true
    if (handle && route.data['reuse'] === true) {
      const key = this.getRouteKey(route);
      this.handlers.set(key, handle);
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    // Проверяет, следует ли повторно присоединить сохраненный маршрут
    const key = this.getRouteKey(route);
    return route.data['reuse'] === true && this.handlers.has(key);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    // Возвращает сохраненный дескриптор маршрута для повторного присоединения
    const key = this.getRouteKey(route);
    return route.data['reuse'] === true ? this.handlers.get(key) ?? null : null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // Определяет, должен ли роутер повторно использовать текущий экземпляр маршрута
    return future.routeConfig === curr.routeConfig;
  }

  private getRouteKey(route: ActivatedRouteSnapshot): Route | null {
    return route.routeConfig;
  }
}
```

ПРИМЕЧАНИЕ: Избегайте использования пути маршрута в качестве ключа, если используются Guard-ы `canMatch`, так как это
может привести к дублированию записей.

### Настройка маршрута для использования пользовательской стратегии

Маршруты могут включать поведение повторного использования через метаданные конфигурации маршрута. Этот подход отделяет
логику повторного использования от кода компонента, что позволяет легко настраивать поведение без изменения компонентов:

```ts
export const routes: Routes = [
  {
    path: 'products',
    component: ProductListComponent,
    data: { reuse: true }  // Состояние компонента сохраняется между навигациями
  },
  {
    path: 'products/:id',
    component: ProductDetailComponent,
    // Нет флага reuse - компонент пересоздается при каждой навигации
  },
  {
    path: 'search',
    component: SearchComponent,
    data: { reuse: true }  // Сохраняет результаты поиска и состояние фильтров
  }
];
```

Вы также можете настроить пользовательскую стратегию повторного использования маршрутов на уровне приложения через
систему внедрения зависимостей (DI) Angular. В этом случае Angular создает единственный экземпляр стратегии, который
управляет всеми решениями о повторном использовании маршрутов во всем приложении:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy }
  ]
};
```

## Стратегия предварительной загрузки {#preloading-strategy}

Стратегии предварительной загрузки (Preloading strategies) определяют, когда Angular загружает ленивые модули
маршрутов (lazy-loaded modules) в фоновом режиме. Хотя ленивая загрузка улучшает время начальной загрузки, откладывая
загрузку модулей, пользователи все же испытывают задержку при первом переходе на ленивый маршрут. Стратегии
предварительной загрузки устраняют эту задержку, загружая модули до того, как пользователи их запросят.

### Встроенные стратегии предварительной загрузки

Angular предоставляет две стратегии предварительной загрузки "из коробки":

| Стратегия                                           | Описание                                                                                                              |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [`NoPreloading`](api/router/NoPreloading)           | Стратегия по умолчанию, которая отключает всю предварительную загрузку. Модули загружаются только при переходе на них |
| [`PreloadAllModules`](api/router/PreloadAllModules) | Загружает все ленивые модули сразу после начальной навигации                                                          |

Стратегию `PreloadAllModules` можно настроить следующим образом:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules)
    )
  ]
};
```

Стратегия `PreloadAllModules` хорошо работает для малых и средних приложений, где загрузка всех модулей не оказывает
существенного влияния на производительность. Однако более крупные приложения с множеством функциональных модулей могут
выиграть от более выборочной предварительной загрузки.

### Создание пользовательской стратегии предварительной загрузки

Пользовательские стратегии предварительной загрузки реализуют интерфейс `PreloadingStrategy`, который требует наличия
одного метода `preload`. Этот метод получает конфигурацию маршрута и функцию, запускающую фактическую загрузку модуля.
Стратегия возвращает Observable, который эмитит значение по завершении предварительной загрузки, или пустой Observable,
чтобы пропустить предварительную загрузку:

```ts
import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Предварительно загружать только маршруты, помеченные data: { preload: true }
    if (route.data?.['preload']) {
      return load();
    }
    return of(null);
  }
}
```

Эта выборочная стратегия проверяет метаданные маршрута для определения поведения предварительной загрузки. Маршруты
могут включать предварительную загрузку через свою конфигурацию:

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes'),
    data: { preload: true }  // Предварительная загрузка сразу после начальной навигации
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.routes'),
    data: { preload: false } // Загрузка только при переходе пользователя в отчеты
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes')
    // Нет флага preload - не будет предварительно загружен
  }
];
```

### Соображения производительности при предварительной загрузке

Предварительная загрузка влияет как на использование сети, так и на потребление памяти. Каждый предварительно
загруженный модуль потребляет пропускную способность и увеличивает объем памяти, занимаемый приложением. Мобильные
пользователи с лимитированным трафиком могут предпочесть минимальную предварительную загрузку, в то время как
пользователи настольных компьютеров с быстрыми сетями могут справиться с агрессивными стратегиями.

Время предварительной загрузки также имеет значение. Немедленная предварительная загрузка после начальной загрузки может
конкурировать с другими критически важными ресурсами, такими как изображения или вызовы API. Стратегии должны учитывать
поведение приложения после загрузки и координироваться с другими фоновыми задачами, чтобы избежать снижения
производительности.

Ограничения ресурсов браузера также влияют на поведение предварительной загрузки. Браузеры ограничивают количество
одновременных HTTP-соединений, поэтому агрессивная предварительная загрузка может встать в очередь за другими запросами.
Service Worker-ы могут помочь, предоставляя детальный контроль над кэшированием и сетевыми запросами, дополняя стратегию
предварительной загрузки.

## Стратегия обработки URL {#url-handling-strategy}

Стратегии обработки URL (URL handling strategies) определяют, какие URL обрабатывает роутер Angular, а какие игнорирует.
По умолчанию Angular пытается обрабатывать все события навигации внутри приложения, но реальным приложениям часто
требуется сосуществовать с другими системами, обрабатывать внешние ссылки или интегрироваться с устаревшими
приложениями, которые управляют своими собственными маршрутами.

Класс `UrlHandlingStrategy` дает вам контроль над этой границей между маршрутами, управляемыми Angular, и внешними URL.
Это становится необходимым при постепенной миграции приложений на Angular или когда приложения Angular должны делить
пространство URL с другими фреймворками.

### Реализация пользовательской стратегии обработки URL

Пользовательские стратегии обработки URL расширяют класс `UrlHandlingStrategy` и реализуют три метода. Метод
`shouldProcessUrl` определяет, должен ли Angular обрабатывать данный URL, `extract` возвращает часть URL, которую должен
обработать Angular, а `merge` объединяет фрагмент URL с остальной частью URL:

```ts
import { Injectable } from '@angular/core';
import { UrlHandlingStrategy, UrlTree } from '@angular/router';

@Injectable()
export class CustomUrlHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url: UrlTree): boolean {
    // Обрабатывать только URL, начинающиеся с /app или /admin
    return url.toString().startsWith('/app') ||
           url.toString().startsWith('/admin');
  }

  extract(url: UrlTree): UrlTree {
    // Вернуть URL без изменений, если мы должны его обработать
    return url;
  }

  merge(newUrlPart: UrlTree, rawUrl: UrlTree): UrlTree {
    // Объединить фрагмент URL с остальной частью URL
    return newUrlPart;
  }
}
```

Эта стратегия создает четкие границы в пространстве URL. Angular обрабатывает пути `/app` и `/admin`, игнорируя все
остальное. Этот паттерн хорошо работает при миграции устаревших приложений, где Angular контролирует определенные
разделы, в то время как устаревшая система поддерживает другие.

### Настройка пользовательской стратегии обработки URL

Вы можете зарегистрировать пользовательскую стратегию через систему внедрения зависимостей (DI) Angular:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { UrlHandlingStrategy } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: UrlHandlingStrategy, useClass: CustomUrlHandlingStrategy }
  ]
};
```

## Пользовательские сопоставители маршрутов {#custom-route-matchers}

По умолчанию роутер Angular перебирает маршруты в порядке их определения, пытаясь сопоставить путь URL с шаблоном пути
каждого маршрута. Он поддерживает статические сегменты, параметризованные сегменты (`:id`) и подстановочные знаки (
`**`). Первый совпавший маршрут побеждает, и роутер прекращает поиск.

Когда приложениям требуется более сложная логика сопоставления на основе условий времени выполнения, сложных шаблонов
URL или других пользовательских правил, пользовательские сопоставители (matchers) обеспечивают эту гибкость без ущерба
для простоты стандартных маршрутов.

Роутер оценивает пользовательские сопоставители на этапе сопоставления маршрутов, до того как происходит сопоставление
путей. Когда сопоставитель возвращает успешное совпадение, он также может извлекать параметры из URL, делая их
доступными для активированного компонента так же, как стандартные параметры маршрута.

### Создание пользовательского сопоставителя

Пользовательский сопоставитель — это функция, которая получает сегменты URL и возвращает либо результат сопоставления с
потребленными сегментами и параметрами, либо `null`, чтобы указать на отсутствие совпадения. Функция сопоставителя
запускается до того, как Angular оценивает свойство `path` маршрута:

```ts
import { Route, UrlSegment, UrlSegmentGroup, UrlMatchResult } from '@angular/router';

export function customMatcher(
  segments: UrlSegment[],
  group: UrlSegmentGroup,
  route: Route
): UrlMatchResult | null {
  // Логика сопоставления здесь
  if (matchSuccessful) {
    return {
      consumed: segments,
      posParams: {
        paramName: new UrlSegment('paramValue', {})
      }
    };
  }
  return null;
}
```

### Реализация маршрутизации на основе версий

Рассмотрим сайт документации API, которому необходимо выполнять маршрутизацию на основе номеров версий в URL. Разные
версии могут иметь разную структуру компонентов или наборы функций:

```ts
import { Routes, UrlSegment, UrlMatchResult } from '@angular/router';

export function versionMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  // Сопоставление шаблонов типа /v1/docs, /v2.1/docs, /v3.0.1/docs
  if (segments.length >= 2 && segments[0].path.match(/^v\d+(\.\d+)*$/)) {
    return {
      consumed: segments.slice(0, 2),  // Потребляем версию и 'docs'
      posParams: {
        version: segments[0],  // Делаем версию доступной как параметр
        section: segments[1]   // Делаем раздел доступным тоже
      }
    };
  }
  return null;
}

// Конфигурация маршрута
export const routes: Routes = [
  {
    matcher: versionMatcher,
    component: DocumentationComponent
  },
  {
    path: 'latest/docs',
    redirectTo: 'v3/docs'
  }
];
```

Компонент получает извлеченные параметры через input-ы маршрута:

```angular-ts
import { Component, input, inject } from '@angular/core';
import { resource } from '@angular/core';

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
  `
})
export class DocumentationComponent {
  // Параметры маршрута автоматически привязываются к input-сигналам
  version = input.required<string>();  // Получает параметр версии
  section = input.required<string>();  // Получает параметр раздела

  private docsService = inject(DocumentationService);

  // Resource автоматически загружает документацию при изменении версии или раздела
  documentation = resource({
    params: () => {
      if (!this.version() || !this.section()) return;

      return {
        version: this.version(),
        section: this.section()
      }
    },
    loader: ({ params }) => {
      return this.docsService.loadDocumentation(params.version, params.section);
    }
  })
}
```

### Маршрутизация с учетом локали

Международные приложения часто кодируют информацию о локали в URL. Пользовательский сопоставитель может извлекать коды
локали и направлять к соответствующим компонентам, делая локаль доступной в качестве параметра:

```ts
// Поддерживаемые локали
const locales = ['en', 'es', 'fr', 'de', 'ja', 'zh'];

export function localeMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length > 0) {
    const potentialLocale = segments[0].path;

    if (locales.includes(potentialLocale)) {
      // Это префикс локали, потребляем его и продолжаем сопоставление
      return {
        consumed: [segments[0]],
        posParams: {
          locale: segments[0]
        }
      };
    } else {
      // Нет префикса локали, используем локаль по умолчанию
      return {
        consumed: [],  // Не потребляем никаких сегментов
        posParams: {
          locale: new UrlSegment('en', {})
        }
      };
    }
  }

  return null;
}
```

### Сопоставление сложной бизнес-логики

Пользовательские сопоставители отлично подходят для реализации бизнес-правил, которые было бы неудобно выражать в
шаблонах путей. Рассмотрим сайт электронной коммерции, где URL продуктов следуют разным шаблонам в зависимости от типа
продукта:

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
        identifier: new UrlSegment(firstSegment.substring(5), {})
      }
    };
  }

  // Электроника: /sku/ABC123
  if (firstSegment === 'sku' && segments.length > 1) {
    return {
      consumed: segments.slice(0, 2),
      posParams: {
        productType: new UrlSegment('electronics', {}),
        identifier: segments[1]
      }
    };
  }

  // Одежда: /style/BRAND/ITEM
  if (firstSegment === 'style' && segments.length > 2) {
    return {
      consumed: segments.slice(0, 3),
      posParams: {
        productType: new UrlSegment('clothing', {}),
        brand: segments[1],
        identifier: segments[2]
      }
    };
  }

  return null;
}
```

### Соображения производительности для пользовательских сопоставителей

Пользовательские сопоставители запускаются при каждой попытке навигации, пока не будет найдено совпадение. В результате
сложная логика сопоставления может повлиять на производительность навигации, особенно в приложениях с большим
количеством маршрутов. Делайте сопоставители сфокусированными и эффективными:

- Возвращайте результат как можно раньше, если совпадение невозможно
- Избегайте дорогостоящих операций, таких как вызовы API или сложные регулярные выражения
- Рассмотрите возможность кэширования результатов для повторяющихся шаблонов URL

Хотя пользовательские сопоставители элегантно решают сложные задачи маршрутизации, их чрезмерное использование может
затруднить понимание и поддержку конфигурации маршрутов. Прибегайте к пользовательским сопоставителям только в тех
случаях, когда стандартное сопоставление путей действительно не справляется.
