# Серверный и гибридный рендеринг

По умолчанию Angular поставляет все приложения как client-side rendered (CSR). Такой подход даёт лёгкий начальный payload, но вводит компромиссы: более медленную загрузку, худшие метрики производительности и более высокие требования к ресурсам, так как большую часть вычислений выполняет устройство пользователя. Поэтому многие приложения существенно выигрывают в производительности, интегрируя server-side rendering (SSR) в гибридную стратегию рендеринга.

## Что такое гибридный рендеринг? {#what-is-hybrid-rendering}

Гибридный рендеринг позволяет использовать преимущества server-side rendering (SSR), pre-rendering (также известного как «static site generation» или SSG) и client-side rendering (CSR) для оптимизации Angular-приложения. Он даёт гранулярный контроль над тем, как рендерятся разные части приложения, чтобы обеспечить пользователям лучший опыт.

## Настройка гибридного рендеринга {#setting-up-hybrid-rendering}

Можно создать **новый** проект с гибридным рендерингом, используя флаг server-side rendering (т.е. `--ssr`) с командой Angular CLI `ng new`:

```shell
ng new --ssr
```

Также можно включить гибридный рендеринг, добавив server-side rendering в существующий проект командой `ng add`:

```shell
ng add @angular/ssr
```

NOTE: По умолчанию Angular prerender'ит всё приложение и генерирует server-файл. Чтобы отключить это и создать полностью статическое приложение, задайте `outputMode` в `static`. Чтобы включить SSR, обновите server routes, используя `RenderMode.Server`. Подробнее см. [`Server routing`](#server-routing) и [`Generate a fully static application`](#generate-a-fully-static-application).

## Server routing {#server-routing}

### Настройка server routes {#configuring-server-routes}

Конфиг server routes создаётся объявлением массива объектов [`ServerRoute`](api/ssr/ServerRoute 'API reference'). Обычно эта конфигурация живёт в файле `app.routes.server.ts`.

```typescript
// app.routes.server.ts
import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '', // This renders the "/" route on the client (CSR)
    renderMode: RenderMode.Client,
  },
  {
    path: 'about', // This page is static, so we prerender it (SSG)
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'profile', // This page requires user-specific data, so we use SSR
    renderMode: RenderMode.Server,
  },
  {
    path: '**', // All other routes will be rendered on the server (SSR)
    renderMode: RenderMode.Server,
  },
];
```

Этот конфиг можно добавить в приложение через [`provideServerRendering`](api/ssr/provideServerRendering 'API reference') с функцией [`withRoutes`](api/ssr/withRoutes 'API reference'):

```typescript
import {provideServerRendering, withRoutes} from '@angular/ssr';
import {serverRoutes} from './app.routes.server';

// app.config.server.ts
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // ... other providers ...
  ],
};
```

При использовании [паттерна App shell](ecosystem/service-workers/app-shell) нужно указать компонент, который будет использоваться как app shell для маршрутов с клиентским рендерингом. Для этого используйте feature [`withAppShell`](api/ssr/withAppShell 'API reference'):

```typescript
import {provideServerRendering, withRoutes, withAppShell} from '@angular/ssr';
import {AppShell} from './app-shell';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes), withAppShell(AppShell)),
    // ... other providers ...
  ],
};
```

### Режимы рендеринга {#rendering-modes}

Конфигурация server routing позволяет указать, как должен рендериться каждый маршрут приложения, задав [`RenderMode`](api/ssr/RenderMode 'API reference'):

| Режим рендеринга    | Описание                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Server (SSR)**    | Рендерит приложение на сервере для каждого запроса, отправляя в браузер полностью заполненную HTML-страницу. |
| **Client (CSR)**    | Рендерит приложение в браузере. Это поведение Angular по умолчанию.                                           |
| **Prerender (SSG)** | Prerender'ит приложение на этапе сборки, генерируя статические HTML-файлы для каждого маршрута.               |

#### Выбор режима рендеринга {#choosing-a-rendering-mode}

У каждого режима рендеринга свои плюсы и минусы. Режим можно выбирать исходя из конкретных потребностей приложения.

##### Client-side rendering (CSR) {#client-side-rendering-csr}

У клиентского рендеринга самая простая модель разработки: можно писать код, предполагая, что он всегда выполняется в веб-браузере. Это позволяет использовать широкий спектр клиентских библиотек, которые также предполагают работу в браузере.

Клиентский рендеринг обычно хуже по производительности, чем другие режимы: нужно скачать, разобрать и выполнить JavaScript страницы, прежде чем пользователь увидит какой-либо отрендеренный контент. Если страница при рендере запрашивает дополнительные данные с сервера, пользователям также приходится ждать эти запросы, прежде чем увидеть полный контент.

Если страница индексируется поисковыми краулерами, клиентский рендеринг может негативно влиять на search engine optimization (SEO), так как у краулеров есть ограничения на объём JavaScript, который они выполняют при индексации.

При клиентском рендеринге серверу не нужно делать работу по рендеру страницы сверх отдачи статических JavaScript-ассетов. Этот фактор можно учитывать, если важна стоимость сервера.

Приложения, поддерживающие устанавливаемый offline-опыт с [service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), могут опираться на клиентский рендеринг без необходимости общаться с сервером.

##### Server-side rendering (SSR) {#server-side-rendering-ssr}

Серверный рендеринг даёт более быструю загрузку страниц, чем клиентский. Вместо ожидания скачивания и выполнения JavaScript сервер напрямую рендерит HTML-документ при получении запроса от браузера. Пользователь испытывает только задержку, необходимую серверу для получения данных и рендера запрошенной страницы. Этот режим также устраняет необходимость в дополнительных сетевых запросах из браузера, так как код может получать данные во время рендера на сервере.

Серверный рендеринг обычно отлично подходит для SEO: поисковые краулеры получают полностью отрендеренный HTML-документ.

Серверный рендеринг требует писать код, который не строго зависит от browser API, и ограничивает выбор JavaScript-библиотек, предполагающих работу в браузере.

При серверном рендеринге сервер запускает Angular для создания HTML-ответа на каждый запрос, что может увеличить стоимость хостинга.

##### Build-time prerendering {#build-time-prerendering}

Prerendering даёт более быструю загрузку страниц, чем и клиентский, и серверный рендеринг. Поскольку prerendering создаёт HTML-документы на этапе _сборки_, сервер может напрямую отвечать на запросы статическим HTML-документом без дополнительной работы.

Prerendering требует, чтобы вся информация, необходимая для рендера страницы, была доступна на этапе _сборки_. Это значит, что prerender'енные страницы не могут включать данные, специфичные для пользователя, загружающего страницу. Prerendering в первую очередь полезен для страниц, одинаковых для всех пользователей приложения.

Поскольку prerendering происходит на этапе сборки, он может существенно увеличить время production-сборок. Использование [`getPrerenderParams`](api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'API reference') для создания большого числа HTML-документов может повлиять на общий размер файлов развёртывания и замедлить deployments.

Prerendering обычно отлично подходит для SEO: поисковые краулеры получают полностью отрендеренный HTML-документ.

Prerendering требует писать код, который не строго зависит от browser API, и ограничивает выбор JavaScript-библиотек, предполагающих работу в браузере.

Prerendering почти не добавляет overhead на запрос сервера: сервер отвечает статическими HTML-документами. Статические файлы также легко кэшируются Content Delivery Networks (CDN), браузерами и промежуточными слоями кэширования для ещё более быстрых последующих загрузок. Полностью статические сайты можно разворачивать только через CDN или static file server, без поддержки кастомного server runtime. Это повышает масштабируемость, снимая нагрузку с application web server, и особенно полезно для приложений с высоким трафиком.

NOTE: При использовании Angular service worker первый запрос рендерится на сервере, а все последующие обрабатываются service worker и рендерятся на клиенте.

### Установка заголовков и status codes {#setting-headers-and-status-codes}

Для отдельных server routes можно задать кастомные заголовки и status codes через свойства `headers` и `status` в конфигурации `ServerRoute`.

```typescript
// app.routes.server.ts
import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'profile',
    renderMode: RenderMode.Server,
    headers: {
      'X-My-Custom-Header': 'some-value',
    },
    status: 201,
  },
  // ... other routes
];
```

### Редиректы {#redirects}

Angular обрабатывает редиректы, заданные свойством [`redirectTo`](api/router/Route#redirectTo 'API reference') в конфигурациях маршрутов, на сервере иначе.

**Server-Side Rendering (SSR)**
Редиректы выполняются стандартными HTTP-редиректами (например, 301, 302) в процессе серверного рендеринга.

**Prerendering (SSG)**
Редиректы реализуются как «soft redirects» с помощью тегов [`<meta http-equiv="refresh">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#refresh) в prerender'енном HTML.

### Кастомизация build-time prerendering (SSG) {#customizing-build-time-prerendering-ssg}

При использовании [`RenderMode.Prerender`](api/ssr/RenderMode#Prerender 'API reference') можно указать несколько опций конфигурации для кастомизации prerendering и serving.

#### Параметризованные маршруты {#parameterized-routes}

Для каждого маршрута с [`RenderMode.Prerender`](api/ssr/RenderMode#Prerender 'API reference') можно указать функцию [`getPrerenderParams`](api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'API reference'). Она позволяет контролировать, какие конкретные параметры создают отдельные prerender'енные документы.

Функция [`getPrerenderParams`](api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'API reference') возвращает `Promise`, который разрешается в массив объектов. Каждый объект — key-value map имени параметра маршрута к значению. Например, если определён маршрут `post/:id`, `getPrerenderParams` может вернуть массив `[{id: 123}, {id: 456}]` и таким образом отрендерить отдельные документы для `post/123` и `post/456`.

Тело [`getPrerenderParams`](api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'API reference') может использовать функцию Angular [`inject`](api/core/inject 'API reference') для внедрения зависимостей и выполнения любой работы по определению маршрутов для prerender. Обычно это включает запросы для получения данных и построения массива значений параметров.

Эту функцию также можно использовать с catch-all маршрутами (например, `/**`), где имя параметра будет `"**"`, а возвращаемое значение — сегменты пути, например `foo/bar`. Их можно комбинировать с другими параметрами (например, `/post/:id/**`) для более сложных конфигураций маршрутов.

```ts
// app.routes.server.ts
import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'post/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const dataService = inject(PostService);
      const ids = await dataService.getIds(); // Assuming this returns ['1', '2', '3']

      return ids.map((id) => ({id})); // Generates paths like: /post/1, /post/2, /post/3
    },
  },
  {
    path: 'post/:id/**',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [
        {id: '1', '**': 'foo/3'},
        {id: '2', '**': 'bar/4'},
      ]; // Generates paths like: /post/1/foo/3, /post/2/bar/4
    },
  },
];
```

Поскольку [`getPrerenderParams`](api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'API reference') применяется исключительно к [`RenderMode.Prerender`](api/ssr/RenderMode#Prerender 'API reference'), эта функция всегда выполняется на этапе _сборки_. `getPrerenderParams` не должна опираться на browser-specific или server-specific API для данных.

IMPORTANT: При использовании [`inject`](api/core/inject 'API reference') внутри `getPrerenderParams` помните, что `inject` нужно использовать синхронно. Его нельзя вызывать внутри асинхронных callback'ов или после любых `await`. Подробнее см. `runInInjectionContext`.

#### Стратегии fallback {#fallback-strategies}

В режиме [`RenderMode.Prerender`](api/ssr/RenderMode#Prerender 'API reference') можно указать стратегию fallback для обработки запросов к путям, которые не были prerender'ены.

Доступные стратегии fallback:

- **Server:** Fallback на серверный рендеринг. Это поведение **по умолчанию**, если свойство `fallback` не указано.
- **Client:** Fallback на клиентский рендеринг.
- **None:** Без fallback. Angular не будет обрабатывать запросы к путям, которые не prerender'ены.

```ts
// app.routes.server.ts
import {RenderMode, PrerenderFallback, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'post/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client, // Fallback to CSR if not prerendered
    async getPrerenderParams() {
      // This function returns an array of objects representing prerendered posts at the paths:
      // `/post/1`, `/post/2`, and `/post/3`.
      // The path `/post/4` will utilize the fallback behavior if it's requested.
      return [{id: 1}, {id: 2}, {id: 3}];
    },
  },
];
```

## Написание server-compatible компонентов {#authoring-server-compatible-components}

Некоторые распространённые browser API и возможности могут быть недоступны на сервере. Приложения не могут использовать browser-specific глобальные объекты вроде `window`, `document`, `navigator` или `location`, а также некоторые свойства `HTMLElement`.

В целом код, опирающийся на browser-specific символы, должен выполняться только в браузере, а не на сервере. Это можно обеспечить через хуки жизненного цикла `afterEveryRender` и `afterNextRender`. Они выполняются только в браузере и пропускаются на сервере.

```angular-ts
import {Component, viewChild, afterNextRender} from '@angular/core';

@Component({
  selector: 'my-cmp',
  template: `<span #content>{{ ... }}</span>`,
})
export class MyComponent {
  contentRef = viewChild.required<ElementRef>('content');

  constructor() {
    afterNextRender(() => {
      // Safe to check `scrollHeight` because this will only run in the browser, not the server.
      console.log('content height: ' + this.contentRef().nativeElement.scrollHeight);
    });
  }
}
```

NOTE: Предпочитайте [platform-specific провайдеры](guide/ssr#providing-platform-specific-implementations) runtime-проверкам с `isPlatformBrowser` или `isPlatformServer`.

IMPORTANT: Избегайте использования `isPlatformBrowser` в шаблонах с `@if` или другими условными конструкциями для рендера разного контента на сервере и клиенте. Это вызывает несоответствия гидратации и сдвиги макета, негативно влияя на UX и [Core Web Vitals](https://web.dev/learn-core-web-vitals/). Вместо этого используйте `afterNextRender` для browser-specific инициализации и сохраняйте отрендеренный контент согласованным между платформами.

## Установка провайдеров на сервере {#setting-providers-on-the-server}

На стороне сервера значения top-level провайдеров задаются один раз, когда код приложения изначально разбирается и вычисляется.
Это значит, что провайдеры, настроенные с `useValue`, сохранят своё значение между несколькими запросами, пока серверное приложение не будет перезапущено.

Если нужно генерировать новое значение для каждого запроса, используйте factory-провайдер с `useFactory`. Factory-функция будет выполняться для каждого входящего запроса, гарантируя создание и назначение нового значения токену каждый раз.

## Предоставление platform-specific реализаций {#providing-platform-specific-implementations}

Когда приложению нужно разное поведение в браузере и на сервере, предоставьте отдельные реализации сервисов для каждой платформы. Этот подход централизует platform-логику в выделенных сервисах.

```ts
export abstract class AnalyticsService {
  abstract trackEvent(name: string): void;
}
```

Создайте реализацию для браузера:

```ts
@Injectable()
export class BrowserAnalyticsService implements AnalyticsService {
  trackEvent(name: string): void {
    // Sends the event to the browser-based third-party analytics provider
  }
}
```

Создайте реализацию для сервера:

```ts
@Injectable()
export class ServerAnalyticsService implements AnalyticsService {
  trackEvent(name: string): void {
    // Records the event on the server
  }
}
```

Зарегистрируйте браузерную реализацию в основной конфигурации приложения:

```ts
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [{provide: AnalyticsService, useClass: BrowserAnalyticsService}],
};
```

Переопределите серверной реализацией в серверной конфигурации:

```ts
// app.config.server.ts
const serverConfig: ApplicationConfig = {
  providers: [{provide: AnalyticsService, useClass: ServerAnalyticsService}],
};
```

Внедряйте и используйте сервис в компонентах:

```ts
@Component(/* ... */)
export class Checkout {
  private analytics = inject(AnalyticsService);

  onAction() {
    this.analytics.trackEvent('action');
  }
}
```

## Доступ к Document через DI {#accessing-document-via-di}

При работе с server-side rendering следует избегать прямых ссылок на browser-specific глобалы вроде `document`. Вместо этого используйте токен [`DOCUMENT`](api/core/DOCUMENT) для доступа к объекту document платформенно-независимым способом.

```ts
import {inject, DOCUMENT, Service} from '@angular/core';

@Service()
export class CanonicalLinkService {
  private readonly document = inject(DOCUMENT);

  // During server rendering, inject a <link rel="canonical"> tag
  // so the generated HTML includes the correct canonical URL
  setCanonical(href: string): void {
    const link = this.document.createElement('link');
    link.rel = 'canonical';
    link.href = href;
    this.document.head.appendChild(link);
  }
}
```

HELPFUL: Для управления meta-тегами Angular предоставляет сервис `Meta`.

## Доступ к Request и Response через DI {#accessing-request-and-response-via-di}

Пакет `@angular/core` предоставляет несколько токенов для взаимодействия с окружением server-side rendering. Эти токены дают доступ к важной информации и объектам внутри Angular-приложения во время SSR.

- **[`REQUEST`](api/core/REQUEST 'API reference'):** Доступ к текущему объекту запроса типа [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) из Web API. Позволяет получать заголовки, cookies и другую информацию о запросе.
- **[`RESPONSE_INIT`](api/core/RESPONSE_INIT 'API reference'):** Доступ к опциям инициализации ответа типа [`ResponseInit`](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#parameters) из Web API. Позволяет динамически задавать заголовки и status code ответа. Используйте этот токен для заголовков или status codes, которые нужно определить во время выполнения.
- **[`REQUEST_CONTEXT`](api/core/REQUEST_CONTEXT 'API reference'):** Доступ к дополнительному контексту, связанному с текущим запросом. Этот контекст можно передать как второй параметр функции [`handle`](api/ssr/AngularAppEngine#handle 'API reference'). Обычно используется для предоставления дополнительной request-related информации, не входящей в стандартный Web API.

```angular-ts
import {inject, REQUEST} from '@angular/core';

@Component({
  selector: 'app-my-component',
  template: `<h1>My Component</h1>`,
})
export class MyComponent {
  constructor() {
    const request = inject(REQUEST);
    console.log(request?.url);
  }
}
```

<!-- UL is used below as otherwise the list will not be include as part of the note. -->
<!-- prettier-ignore-start -->

IMPORTANT: Указанные выше токены будут `null` в следующих сценариях:<ul class="docs-list">
  <li>Во время процессов сборки.</li>
  <li>Когда приложение рендерится в браузере (CSR).</li>
  <li>При выполнении static site generation (SSG).</li>
  <li>Во время извлечения маршрутов в разработке (на момент запроса).</li>
</ul>

<!-- prettier-ignore-end -->

## Генерация полностью статического приложения {#generate-a-fully-static-application}

По умолчанию Angular prerender'ит всё приложение и генерирует server-файл для обработки запросов. Это позволяет отдавать пользователям pre-rendered контент. Однако если предпочтителен полностью статический сайт без сервера, можно отказаться от этого поведения, задав `outputMode` в `static` в файле конфигурации `angular.json`.

Когда `outputMode` задан как `static`, Angular генерирует pre-rendered HTML-файлы для каждого маршрута на этапе сборки, но не генерирует server-файл и не требует Node.js-сервер для отдачи приложения. Это полезно для развёртывания на static hosting, где backend-сервер не нужен.

Чтобы настроить это, обновите файл `angular.json` следующим образом:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "outputMode": "static"
          }
        }
      }
    }
  }
}
```

## Кэширование данных при использовании HttpClient {#caching-data-when-using-httpclient}

`HttpClient` кэширует исходящие сетевые запросы при работе на сервере. Эта информация сериализуется и передаётся в браузер как часть начального HTML, отправленного с сервера. В браузере `HttpClient` проверяет, есть ли данные в кэше, и если да — переиспользует их вместо нового HTTP-запроса во время начального рендера приложения. `HttpClient` перестаёт использовать кэш, как только приложение становится [stable](api/core/ApplicationRef#isStable) при работе в браузере.

### Настройка лимита размера тела ответа {#configuring-the-response-body-size-limit}

Когда `HttpClient` использует fetch backend по умолчанию во время server-side rendering, Angular ограничивает каждое тело ответа 1 MB. Этот лимит не даёт серверу буферизовать неожиданно большие ответы во время рендера. Если ответ превышает настроенный лимит, запрос завершается ошибкой [NG02825](errors/NG02825).

Если приложению нужно получать более крупные ответы во время серверного рендера, задайте `maxResponseBodySize` в опциях `provideServerRendering`:

```ts
import {provideServerRendering, withRoutes} from '@angular/ssr';
import {serverRoutes} from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(
      {
        maxResponseBodySize: 5 * 1024 * 1024, // 5MB
      },
      withRoutes(serverRoutes),
    ),
  ],
};
```

`maxResponseBodySize` задаётся в байтах и применяется глобально к server-side запросам `HttpClient`, использующим fetch backend.

IMPORTANT: Держите этот лимит настолько маленьким, насколько позволяет приложение. Увеличение позволяет server-side запросам буферизовать более крупные тела ответов, что может увеличить использование памяти и риск denial-of-service. Предпочитайте выносить крупные загрузки за пределы серверного рендера.

### Настройка опций кэширования {#configuring-the-caching-options}

Можно кастомизировать, как Angular кэширует HTTP-ответы во время server‑side rendering (SSR) и переиспользует их при гидратации, настроив `HttpTransferCacheOptions`.  
Эта конфигурация предоставляется глобально через `withHttpTransferCacheOptions` внутри `provideClientHydration()`.

По умолчанию `HttpClient` кэширует все запросы `HEAD` и `GET`, которые не содержат заголовков `Authorization`, `Proxy-Authorization` или `Cookie` и не отправлены с `withCredentials` или режимами Fetch API `credentials`, которые могут отправлять credentials. Angular также пропускает transfer cache, когда запрос или ответ включает директивы `Cache-Control`, запрещающие кэширование (`no-store`, `no-cache` или `private`), или когда опция Fetch API `cache` задана как `no-store` или `no-cache`. Ответы с заголовком `Set-Cookie` также пропускаются. Настройки фильтрации запросов можно переопределить через `withHttpTransferCacheOptions` в конфигурации гидратации.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideClientHydration, withHttpTransferCacheOptions} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [
    provideClientHydration(
      withHttpTransferCacheOptions({
        includeHeaders: ['ETag', 'Cache-Control'],
        filter: (req) => !req.url.includes('/api/profile'),
        includePostRequests: true,
        includeRequestsWithAuthHeaders: false,
      }),
    ),
  ],
});
```

### `includeHeaders` {#includeheaders}

Указывает, какие заголовки из серверного ответа должны включаться в кэшированные записи.  
По умолчанию заголовки не включаются.

```ts
withHttpTransferCacheOptions({
  includeHeaders: ['ETag', 'Cache-Control'],
});
```

IMPORTANT: Избегайте включения чувствительных заголовков вроде токенов аутентификации. Они могут утечь user‑specific данные между запросами.

Включение `Cache-Control` в `includeHeaders` только делает этот заголовок доступным на гидратированном ответе. Angular уже автоматически оценивает заголовки `Cache-Control` при решении, подходит ли запрос или ответ для transfer cache.

### `includePostRequests` {#includepostrequests}

По умолчанию кэшируются только запросы `GET` и `HEAD`.  
Можно включить кэширование для запросов `POST`, когда они используются как операции чтения, например GraphQL-запросы.

```ts
withHttpTransferCacheOptions({
  includePostRequests: true,
});
```

Используйте это только когда запросы `POST` **идемпотентны** и безопасны для переиспользования между серверным и клиентским рендером.

### `includeRequestsWithAuthHeaders` {#includerequestswithauthheaders}

Определяет, подходят ли для кэширования запросы, содержащие заголовки `Authorization`, `Proxy‑Authorization` или `Cookie`.  
По умолчанию они исключены, чтобы не кэшировать user‑specific ответы.

```ts
withHttpTransferCacheOptions({
  includeRequestsWithAuthHeaders: true,
});
```

Включайте только когда заголовки аутентификации **не** влияют на содержимое ответа (например, публичные токены для analytics API).

### `includeRequestsWithCredentials` {#includerequestswithcredentials}

Определяет, подходят ли для кэширования запросы, отправленные с `withCredentials` или режимами Fetch API `credentials` (`include` или `same-origin`).  
По умолчанию они исключены, чтобы не кэшировать user‑specific ответы.

```ts
withHttpTransferCacheOptions({
  includeRequestsWithCredentials: true,
});
```

Включайте только когда credentialed-запросы возвращают ответы, безопасные для кэширования.

### `includeNonCacheableRequests` {#includenoncacheablerequests}

Определяет, подходят ли для кэширования запросы и ответы, содержащие директивы `Cache-Control`, запрещающие кэширование (`no-store`, `no-cache` или `private`), ответы с заголовком `Set-Cookie`, или запросы с опциями Fetch API `cache` (`no-store` или `no-cache`).  
По умолчанию они исключены, чтобы уважать HTTP-контроли кэширования.

```ts
withHttpTransferCacheOptions({
  includeNonCacheableRequests: true,
});
```

Включайте только когда нужно обойти ограничения cache-control для transfer caching.

### Per‑request переопределения {#perrequest-overrides}

Поведение кэширования для конкретного запроса можно переопределить через опцию запроса `transferCache`.

```ts
// Include specific headers for this request
http.get('/api/profile', {transferCache: {includeHeaders: ['CustomHeader']}});
```

### Отключение кэширования {#disabling-caching}

HTTP-кэширование запросов, отправленных с сервера, можно отключить глобально или индивидуально.

#### Глобально {#globally}

Чтобы отключить кэширование для всех запросов в приложении, используйте feature `withNoHttpTransferCache`:

```ts
import {
  bootstrapApplication,
  provideClientHydration,
  withNoHttpTransferCache,
} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [provideClientHydration(withNoHttpTransferCache())],
});
```

#### Фильтрация {#filtering}

Также можно выборочно отключить кэширование для определённых запросов через опцию [`filter`](api/common/http/HttpTransferCacheOptions) в `withHttpTransferCacheOptions`. Например, отключить кэширование для конкретного API endpoint:

```ts
import {
  bootstrapApplication,
  provideClientHydration,
  withHttpTransferCacheOptions,
} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [
    provideClientHydration(
      withHttpTransferCacheOptions({
        filter: (req) => !req.url.includes('/api/sensitive-data'),
      }),
    ),
  ],
});
```

Используйте эту опцию, чтобы исключить endpoints с user‑specific или динамическими данными (например, `/api/profile`).

#### Per-request {#per-request}

Чтобы отключить кэширование для отдельного запроса, укажите опцию [`transferCache`](api/common/http/HttpRequest#transferCache) в `HttpRequest`.

```ts
httpClient.get('/api/sensitive-data', {transferCache: false});
```

`HttpTransferCache` не кэширует запросы или ответы, которые явно отказываются от кэширования. Angular пропускает записи transfer cache, когда запрос включает заголовок `Cache-Control` с `no-store`, `no-cache` или `private`, или когда запрос использует опцию Fetch API `cache`, заданную как `no-store` или `no-cache`. Ответы с `Cache-Control: no-store`, `Cache-Control: no-cache` или `Cache-Control: private` также не сохраняются в transfer cache. Ответы с заголовком `Set-Cookie` тоже не сохраняются, так как обычно несут user-specific состояние.

NOTE: Если приложение использует разные HTTP origins для API-вызовов на сервере и на клиенте, токен `HTTP_TRANSFER_CACHE_ORIGIN_MAP` позволяет установить соответствие между этими origins, чтобы feature `HttpTransferCache` мог распознать эти запросы как одни и те же и переиспользовать данные, закэшированные на сервере, при гидратации на клиенте.

## Настройка сервера {#configuring-a-server}

### Node.js {#nodejs}

`@angular/ssr/node` расширяет `@angular/ssr` специально для окружений Node.js. Он предоставляет API, упрощающие реализацию server-side rendering в Node.js-приложении. Полный список функций и примеры использования — в [API reference `@angular/ssr/node`](api/ssr/node/AngularNodeAppEngine).

```ts
// server.ts
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use('*', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      if (response) {
        writeResponseToNodeResponse(response, res);
      } else {
        next(); // Pass control to the next middleware
      }
    })
    .catch(next);
});

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createNodeRequestHandler(app);
```

### Non-Node.js {#non-nodejs}

`@angular/ssr` предоставляет необходимые API для server-side rendering Angular-приложения на платформах, отличных от Node.js. Он опирается на стандартные объекты [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) и [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) из Web API, позволяя интегрировать Angular SSR в различные серверные окружения. Подробности и примеры — в [API reference `@angular/ssr`](api/ssr/AngularAppEngine).

```ts
// server.ts
import {AngularAppEngine, createRequestHandler} from '@angular/ssr';

const angularApp = new AngularAppEngine();

/**
 * This is a request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(async (req: Request) => {
  const res: Response | null = await angularApp.render(req);

  // ...
});
```

## Безопасность {#security}

Подробнее о предотвращении Server-Side Request Forgery (SSRF) и настройке разрешённых hosts см. в руководстве [Server-side security](best-practices/security#preventing-server-side-request-forgery-ssrf).
