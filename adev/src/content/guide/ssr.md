# Серверный и гибридный рендеринг

Angular поставляет все приложения с рендерингом на стороне клиента (CSR) по умолчанию. Хотя такой подход обеспечивает лёгкий начальный пакет, он имеет свои компромиссы: медленное время загрузки, ухудшение метрик производительности и высокие требования к ресурсам, так как большинство вычислений выполняется на устройстве пользователя. В результате многие приложения получают значительный прирост производительности, интегрируя рендеринг на стороне сервера (SSR) в стратегию гибридного рендеринга.

## Что такое гибридный рендеринг? {#what-is-hybrid-rendering}

Гибридный рендеринг позволяет разработчикам использовать преимущества серверного рендеринга (SSR), предварительного рендеринга (также известного как «генерация статических сайтов» или SSG) и рендеринга на стороне клиента (CSR) для оптимизации Angular-приложения. Он даёт детальный контроль над тем, как отдельные части вашего приложения рендерятся, чтобы обеспечить пользователям наилучший опыт.

## Настройка гибридного рендеринга {#setting-up-hybrid-rendering}

Вы можете создать **новый** проект с гибридным рендерингом, используя флаг серверного рендеринга (т. е. `--ssr`) с командой Angular CLI `ng new`:

```shell
ng new --ssr
```

Также можно включить гибридный рендеринг, добавив серверный рендеринг к существующему проекту с помощью команды `ng add`:

```shell
ng add @angular/ssr
```

NOTE: По умолчанию Angular предварительно рендерит всё приложение и генерирует серверный файл. Чтобы отключить это и создать полностью статическое приложение, установите `outputMode` в значение `static`. Чтобы включить SSR, обновите серверные маршруты, используя `RenderMode.Server`. Подробнее см. в разделах [`Серверная маршрутизация`](#server-routing) и [`Генерация полностью статического приложения`](#generate-a-fully-static-application).

## Серверная маршрутизация {#server-routing}

### Настройка серверных маршрутов {#configuring-server-routes}

Вы можете создать конфигурацию серверных маршрутов, объявив массив объектов [`ServerRoute`](api/ssr/ServerRoute 'Справочник API'). Эта конфигурация обычно находится в файле `app.routes.server.ts`.

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

Вы можете добавить эту конфигурацию в приложение с помощью [`provideServerRendering`](api/ssr/provideServerRendering 'Справочник API') и функции [`withRoutes`](api/ssr/withRoutes 'Справочник API'):

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

При использовании [паттерна App shell](ecosystem/service-workers/app-shell) необходимо указать компонент, который будет использоваться в качестве оболочки приложения для маршрутов, рендеримых на стороне клиента. Для этого используйте функцию [`withAppShell`](api/ssr/withAppShell 'Справочник API'):

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

Конфигурация серверных маршрутов позволяет указать, как должен рендериться каждый маршрут в вашем приложении, задав [`RenderMode`](api/ssr/RenderMode 'Справочник API'):

| Режим рендеринга      | Описание                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Server (SSR)**      | Рендерит приложение на сервере для каждого запроса, отправляя браузеру полностью заполненную HTML-страницу.        |
| **Client (CSR)**      | Рендерит приложение в браузере. Это поведение Angular по умолчанию.                                               |
| **Prerender (SSG)**   | Выполняет предварительный рендеринг приложения во время сборки, генерируя статические HTML-файлы для каждого маршрута. |

#### Выбор режима рендеринга {#choosing-a-rendering-mode}

Каждый режим рендеринга имеет свои преимущества и недостатки. Вы можете выбирать режимы рендеринга исходя из конкретных потребностей вашего приложения.

##### Рендеринг на стороне клиента (CSR) {#client-side-rendering-csr}

Рендеринг на стороне клиента имеет самую простую модель разработки, поскольку позволяет писать код, предполагающий выполнение в браузере. Это позволяет использовать широкий спектр клиентских библиотек, также предполагающих работу в браузере.

Рендеринг на стороне клиента, как правило, имеет худшую производительность по сравнению с другими режимами рендеринга, так как перед отображением контента необходимо загрузить, разобрать и выполнить JavaScript страницы. Если страница запрашивает дополнительные данные с сервера в процессе рендеринга, пользователям также приходится ждать этих дополнительных запросов перед просмотром полного контента.

Если ваша страница индексируется поисковыми роботами, рендеринг на стороне клиента может негативно повлиять на поисковую оптимизацию (SEO), поскольку у поисковых роботов есть ограничения на количество выполняемого JavaScript при индексации страницы.

При рендеринге на стороне клиента серверу не нужно выполнять никакой работы для рендеринга страницы, кроме обслуживания статических JavaScript-ресурсов. Этот фактор стоит учитывать, если стоимость сервера является проблемой.

Приложения, поддерживающие устанавливаемый офлайн-опыт с [service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), могут полагаться на рендеринг на стороне клиента без необходимости общаться с сервером.

##### Рендеринг на стороне сервера (SSR) {#server-side-rendering-ssr}

Рендеринг на стороне сервера обеспечивает более быструю загрузку страниц по сравнению с рендерингом на стороне клиента. Вместо ожидания загрузки и выполнения JavaScript сервер непосредственно рендерит HTML-документ при получении запроса из браузера. Пользователь испытывает только задержку, необходимую серверу для получения данных и рендеринга запрошенной страницы. Этот режим также исключает необходимость дополнительных сетевых запросов из браузера, поскольку код может получать данные во время рендеринга на сервере.

Рендеринг на стороне сервера, как правило, обеспечивает отличную поисковую оптимизацию (SEO), поскольку поисковые роботы получают полностью отрендеренный HTML-документ.

Рендеринг на стороне сервера требует написания кода, не зависящего строго от браузерных API, и ограничивает выбор JavaScript-библиотек, предполагающих работу в браузере.

При серверном рендеринге ваш сервер выполняет Angular для формирования HTML-ответа на каждый запрос, что может увеличить стоимость хостинга сервера.

##### Предварительный рендеринг во время сборки {#build-time-prerendering}

Предварительный рендеринг обеспечивает более быструю загрузку страниц, чем как рендеринг на стороне клиента, так и рендеринг на стороне сервера. Поскольку предварительный рендеринг создаёт HTML-документы во _время сборки_, сервер может напрямую отвечать на запросы статическим HTML-документом без какой-либо дополнительной работы.

Предварительный рендеринг требует, чтобы вся информация, необходимая для рендеринга страницы, была доступна во _время сборки_. Это означает, что предварительно отрендеренные страницы не могут содержать данные, специфичные для конкретного пользователя, загружающего страницу. Предварительный рендеринг полезен прежде всего для страниц, одинаковых для всех пользователей вашего приложения.

Поскольку предварительный рендеринг выполняется во время сборки, он может значительно увеличить время производственных сборок. Использование [`getPrerenderParams`](api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'Справочник API') для генерации большого количества HTML-документов может повлиять на общий размер файлов при развёртывании и, следовательно, привести к более медленному развёртыванию.

Предварительный рендеринг, как правило, обеспечивает отличную поисковую оптимизацию (SEO), поскольку поисковые роботы получают полностью отрендеренный HTML-документ.

Предварительный рендеринг требует написания кода, не зависящего строго от браузерных API, и ограничивает выбор JavaScript-библиотек, предполагающих работу в браузере.

Предварительный рендеринг несёт крайне малые накладные расходы на каждый серверный запрос, поскольку сервер отвечает статическими HTML-документами. Статические файлы также легко кэшируются сетями доставки контента (CDN), браузерами и промежуточными уровнями кэширования для ещё более быстрой последующей загрузки страниц. Полностью статические сайты также можно развёртывать исключительно через CDN или статический файловый сервер, устраняя необходимость поддерживать собственную серверную среду выполнения для приложения. Это повышает масштабируемость, снимая нагрузку с веб-сервера приложения, что особенно полезно для высоконагруженных приложений.

NOTE: При использовании Angular service worker первый запрос рендерится на сервере, но все последующие запросы обрабатываются service worker и рендерятся на стороне клиента.

### Установка заголовков и кодов состояния {#setting-headers-and-status-codes}

Вы можете устанавливать пользовательские заголовки и коды состояния для отдельных серверных маршрутов, используя свойства `headers` и `status` в конфигурации `ServerRoute`.

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

### Перенаправления {#redirects}

Angular обрабатывает перенаправления, заданные свойством [`redirectTo`](api/router/Route#redirectTo 'Справочник API') в конфигурациях маршрутов, на стороне сервера иначе.

**Серверный рендеринг (SSR)**
Перенаправления выполняются с использованием стандартных HTTP-перенаправлений (например, 301, 302) в процессе серверного рендеринга.

**Предварительный рендеринг (SSG)**
Перенаправления реализуются как «мягкие перенаправления» с использованием тегов [`<meta http-equiv="refresh">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#refresh) в предварительно отрендеренном HTML.

### Настройка предварительного рендеринга во время сборки (SSG) {#customizing-build-time-prerendering-ssg}

При использовании [`RenderMode.Prerender`](api/ssr/RenderMode#Prerender 'Справочник API') можно указать несколько параметров конфигурации для настройки процесса предварительного рендеринга и обслуживания.

#### Параметризованные маршруты {#parameterized-routes}

Для каждого маршрута с [`RenderMode.Prerender`](api/ssr/RenderMode#Prerender 'Справочник API') можно указать функцию [`getPrerenderParams`](api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'Справочник API'). Эта функция позволяет контролировать, какие конкретные параметры создают отдельные предварительно отрендеренные документы.

Функция [`getPrerenderParams`](api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'Справочник API') возвращает `Promise`, разрешающийся в массив объектов. Каждый объект — это карта ключ-значение, где ключ — имя параметра маршрута, а значение — его значение. Например, если вы определите маршрут как `post/:id`, `getPrerenderParams` может вернуть массив `[{id: 123}, {id: 456}]` и тем самым отрендерить отдельные документы для `post/123` и `post/456`.

Тело функции [`getPrerenderParams`](api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'Справочник API') может использовать функцию Angular [`inject`](api/core/inject 'Справочник API') для внедрения зависимостей и выполнения любой работы по определению маршрутов для предварительного рендеринга. Обычно это включает запросы для получения данных для формирования массива значений параметров.

Эту функцию также можно использовать с catch-all маршрутами (например, `/**`), где имя параметра будет `"**"`, а возвращаемое значение — сегменты пути, такие как `foo/bar`. Их можно комбинировать с другими параметрами (например, `/post/:id/**`) для обработки более сложных конфигураций маршрутов.

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

Поскольку [`getPrerenderParams`](api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'Справочник API') применяется исключительно к [`RenderMode.Prerender`](api/ssr/RenderMode#Prerender 'Справочник API'), эта функция всегда выполняется во _время сборки_. `getPrerenderParams` не должна зависеть от каких-либо браузерных или серверных API для получения данных.

IMPORTANT: При использовании [`inject`](api/core/inject 'Справочник API') внутри `getPrerenderParams` помните, что `inject` должен использоваться синхронно. Его нельзя вызывать в асинхронных обратных вызовах или после операторов `await`. Подробнее см. в `runInInjectionContext`.

#### Стратегии резервного поведения {#fallback-strategies}

При использовании режима [`RenderMode.Prerender`](api/ssr/RenderMode#Prerender 'Справочник API') можно указать стратегию резервного поведения для обработки запросов к путям, которые не были предварительно отрендерены.

Доступные стратегии резервного поведения:

- **Server:** Переходит к серверному рендерингу. Это **поведение по умолчанию**, если свойство `fallback` не указано.
- **Client:** Переходит к рендерингу на стороне клиента.
- **None:** Нет резервного поведения. Angular не будет обрабатывать запросы к непредварительно-отрендеренным путям.

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

## Создание совместимых с сервером компонентов {#authoring-server-compatible-components}

Некоторые распространённые браузерные API и возможности могут быть недоступны на сервере. Приложения не могут использовать браузерно-специфичные глобальные объекты, такие как `window`, `document`, `navigator` или `location`, а также некоторые свойства `HTMLElement`.

В целом, код, зависящий от браузерных символов, должен выполняться только в браузере, а не на сервере. Это можно обеспечить с помощью хуков жизненного цикла `afterEveryRender` и `afterNextRender`. Они выполняются только в браузере и пропускаются на сервере.

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

NOTE: Предпочитайте [платформо-специфичные провайдеры](guide/ssr#providing-platform-specific-implementations) проверкам времени выполнения с `isPlatformBrowser` или `isPlatformServer`.

IMPORTANT: Избегайте использования `isPlatformBrowser` в шаблонах с `@if` или другими условиями для рендеринга разного контента на сервере и клиенте. Это вызывает несоответствия гидратации и сдвиги макета, негативно влияя на пользовательский опыт и [Core Web Vitals](https://web.dev/learn-core-web-vitals/). Вместо этого используйте `afterNextRender` для браузерной инициализации и сохраняйте рендеримый контент согласованным на всех платформах.

## Установка провайдеров на сервере {#setting-providers-on-the-server}

На стороне сервера значения провайдеров верхнего уровня устанавливаются один раз при первоначальном разборе и вычислении кода приложения.
Это означает, что провайдеры, настроенные с `useValue`, будут сохранять своё значение на протяжении нескольких запросов до перезапуска серверного приложения.

Если вы хотите генерировать новое значение для каждого запроса, используйте фабричный провайдер с `useFactory`. Фабричная функция будет выполняться для каждого входящего запроса, гарантируя создание и присвоение нового значения токену каждый раз.

## Предоставление платформо-специфичных реализаций {#providing-platform-specific-implementations}

Когда вашему приложению требуется разное поведение в браузере и на сервере, предоставляйте отдельные реализации сервисов для каждой платформы. Такой подход централизует логику платформы в выделенных сервисах.

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

Зарегистрируйте реализацию для браузера в основной конфигурации приложения:

```ts
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [{provide: AnalyticsService, useClass: BrowserAnalyticsService}],
};
```

Переопределите серверной реализацией в конфигурации сервера:

```ts
// app.config.server.ts
const serverConfig: ApplicationConfig = {
  providers: [{provide: AnalyticsService, useClass: ServerAnalyticsService}],
};
```

Внедрите и используйте сервис в ваших компонентах:

```ts
@Component({
  /*...*/
})
export class Checkout {
  private analytics = inject(AnalyticsService);

  onAction() {
    this.analytics.trackEvent('action');
  }
}
```

## Доступ к Document через DI {#accessing-document-via-di}

При работе с серверным рендерингом следует избегать прямых ссылок на браузерные глобальные объекты, такие как `document`. Вместо этого используйте токен [`DOCUMENT`](api/core/DOCUMENT) для доступа к объекту документа платформо-независимым способом.

```ts
import {Injectable, inject, DOCUMENT} from '@angular/core';

@Injectable({providedIn: 'root'})
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

HELPFUL: Для управления мета-тегами Angular предоставляет сервис `Meta`.

## Доступ к Request и Response через DI {#accessing-request-and-response-via-di}

Пакет `@angular/core` предоставляет несколько токенов для взаимодействия со средой серверного рендеринга. Эти токены предоставляют доступ к важной информации и объектам в Angular-приложении во время SSR.

- **[`REQUEST`](api/core/REQUEST 'Справочник API'):** Предоставляет доступ к текущему объекту запроса типа [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) из Web API. Позволяет получить доступ к заголовкам, cookies и другой информации запроса.
- **[`RESPONSE_INIT`](api/core/RESPONSE_INIT 'Справочник API'):** Предоставляет доступ к параметрам инициализации ответа типа [`ResponseInit`](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#parameters) из Web API. Позволяет динамически устанавливать заголовки и код состояния ответа. Используйте этот токен для установки заголовков или кодов состояния, которые должны определяться во время выполнения.
- **[`REQUEST_CONTEXT`](api/core/REQUEST_CONTEXT 'Справочник API'):** Предоставляет доступ к дополнительному контексту, связанному с текущим запросом. Этот контекст может передаваться в качестве второго параметра функции [`handle`](api/ssr/AngularAppEngine#handle 'Справочник API'). Как правило, используется для предоставления дополнительной информации, связанной с запросом, которая не является частью стандартного Web API.

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

IMPORTANT: Вышеуказанные токены будут `null` в следующих сценариях:<ul class="docs-list">
  <li>В процессе сборки.</li>
  <li>Когда приложение рендерится в браузере (CSR).</li>
  <li>При генерации статического сайта (SSG).</li>
  <li>При извлечении маршрутов в режиме разработки (во время запроса).</li>
</ul>

<!-- prettier-ignore-end -->

## Генерация полностью статического приложения {#generate-a-fully-static-application}

По умолчанию Angular выполняет предварительный рендеринг всего приложения и генерирует серверный файл для обработки запросов. Это позволяет приложению обслуживать предварительно отрендеренный контент пользователям. Однако если вы предпочитаете полностью статический сайт без сервера, вы можете отказаться от этого поведения, установив `outputMode` в значение `static` в файле конфигурации `angular.json`.

Когда `outputMode` установлен в `static`, Angular генерирует предварительно отрендеренные HTML-файлы для каждого маршрута во время сборки, но не генерирует серверный файл и не требует сервера Node.js для обслуживания приложения. Это полезно для развёртывания на хостинг-провайдерах статических сайтов, где серверный бэкенд не нужен.

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

`HttpClient` кэширует исходящие сетевые запросы при работе на сервере. Эта информация сериализуется и передаётся в браузер как часть начального HTML, отправляемого с сервера. В браузере `HttpClient` проверяет, есть ли данные в кэше, и если есть, повторно использует их вместо нового HTTP-запроса во время начального рендеринга приложения. `HttpClient` перестаёт использовать кэш, как только приложение становится [стабильным](api/core/ApplicationRef#isStable) при работе в браузере.

### Настройка параметров кэширования {#configuring-the-caching-options}

Вы можете настроить, как Angular кэширует HTTP-ответы во время серверного рендеринга (SSR) и повторно использует их во время гидратации, конфигурируя `HttpTransferCacheOptions`.
Эта конфигурация предоставляется глобально с помощью `withHttpTransferCacheOptions` внутри `provideClientHydration()`.

По умолчанию `HttpClient` кэширует все `HEAD` и `GET` запросы, не содержащие заголовков `Authorization` или `Proxy-Authorization`. Вы можете переопределить эти настройки, используя `withHttpTransferCacheOptions` в конфигурации гидратации.

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

---

### `includeHeaders`

Указывает, какие заголовки из ответа сервера должны включаться в кэшированные записи.
По умолчанию заголовки не включаются.

```ts
withHttpTransferCacheOptions({
  includeHeaders: ['ETag', 'Cache-Control'],
});
```

IMPORTANT: Избегайте включения чувствительных заголовков, таких как токены аутентификации. Они могут передавать пользовательские данные между запросами.

---

### `includePostRequests`

По умолчанию кэшируются только `GET` и `HEAD` запросы.
Вы можете включить кэширование для `POST` запросов, когда они используются как операции чтения, например, GraphQL-запросы.

```ts
withHttpTransferCacheOptions({
  includePostRequests: true,
});
```

Используйте это только тогда, когда `POST` запросы являются **идемпотентными** и безопасны для повторного использования между серверным и клиентским рендерингом.

---

### `includeRequestsWithAuthHeaders`

Определяет, имеют ли право на кэширование запросы, содержащие заголовки `Authorization` или `Proxy-Authorization`.
По умолчанию они исключены для предотвращения кэширования пользовательских ответов.

```ts
withHttpTransferCacheOptions({
  includeRequestsWithAuthHeaders: true,
});
```

Включайте только тогда, когда заголовки аутентификации **не влияют** на содержимое ответа (например, публичные токены для аналитических API).

### Переопределения на уровне запроса {#per-request-overrides}

Вы можете переопределить поведение кэширования для конкретного запроса с помощью параметра `transferCache` запроса.

```ts
// Include specific headers for this request
http.get('/api/profile', {transferCache: {includeHeaders: ['CustomHeader']}});
```

### Отключение кэширования {#disabling-caching}

Вы можете отключить HTTP-кэширование запросов, отправляемых с сервера, глобально или по отдельности.

#### Глобально {#globally}

Чтобы отключить кэширование для всех запросов в вашем приложении, используйте функцию `withNoHttpTransferCache`:

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

Также можно выборочно отключить кэширование для определённых запросов с помощью параметра [`filter`](api/common/http/HttpTransferCacheOptions) в `withHttpTransferCacheOptions`. Например, можно отключить кэширование для конкретной конечной точки API:

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

Используйте эту опцию для исключения конечных точек с пользовательскими или динамическими данными (например, `/api/profile`).

#### На уровне запроса {#per-request}

Чтобы отключить кэширование для отдельного запроса, укажите параметр [`transferCache`](api/common/http/HttpRequest#transferCache) в `HttpRequest`.

```ts
httpClient.get('/api/sensitive-data', {transferCache: false});
```

NOTE: Если ваше приложение использует разные HTTP-источники для API-запросов на сервере и клиенте, токен `HTTP_TRANSFER_CACHE_ORIGIN_MAP` позволяет установить соответствие между этими источниками, чтобы функция `HttpTransferCache` могла распознавать эти запросы как одинаковые и повторно использовать данные, кэшированные на сервере, во время гидратации на клиенте.

## Настройка сервера {#configuring-a-server}

### Node.js {#nodejs}

Пакет `@angular/ssr/node` расширяет `@angular/ssr` специально для сред Node.js. Он предоставляет API, упрощающие реализацию серверного рендеринга в вашем Node.js-приложении. Полный список функций и примеры использования см. в [справочнике API `@angular/ssr/node`](api/ssr/node/AngularNodeAppEngine).

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

### Не-Node.js платформы {#non-nodejs}

Пакет `@angular/ssr` предоставляет основные API для серверного рендеринга Angular-приложения на платформах, отличных от Node.js. Он использует стандартные объекты [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) и [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) из Web API, позволяя интегрировать Angular SSR в различные серверные среды. Подробную информацию и примеры см. в [справочнике API `@angular/ssr`](api/ssr/AngularAppEngine).

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

Подробную информацию о предотвращении подделки серверных запросов (SSRF) и настройке разрешённых хостов см. в руководстве [Безопасность на стороне сервера](best-practices/security#preventing-server-side-request-forgery-ssrf).
