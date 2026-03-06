# Серверный и гибридный рендеринг {#server-and-hybrid-rendering}

По умолчанию Angular собирает все приложения с рендерингом на стороне клиента (CSR). Хотя этот подход обеспечивает лёгкую начальную полезную нагрузку, он имеет компромиссы: более медленное время загрузки, ухудшенные метрики производительности и повышенные требования к ресурсам, поскольку большую часть вычислений выполняет устройство пользователя. В результате многие приложения достигают значительного улучшения производительности за счёт интеграции SSR (Рендеринга на стороне сервера) в стратегию гибридного рендеринга.

## Что такое гибридный рендеринг? {#what-is-hybrid-rendering}

Гибридный рендеринг позволяет разработчикам использовать преимущества SSR (Рендеринга на стороне сервера), предварительного рендеринга (также известного как «статическая генерация сайта» или SSG) и CSR для оптимизации Angular-приложения. Он даёт детальный контроль над тем, как рендерятся различные части приложения, чтобы обеспечить пользователям наилучший опыт.

## Настройка гибридного рендеринга {#setting-up-hybrid-rendering}

Создать **новый** проект с гибридным рендерингом можно с помощью флага SSR (т.е. `--ssr`) команды Angular CLI `ng new`:

```shell
ng new --ssr
```

Также можно включить гибридный рендеринг в существующем проекте командой `ng add`:

```shell
ng add @angular/ssr
```

NOTE: По умолчанию Angular предварительно рендерит всё приложение и генерирует серверный файл. Чтобы отключить это и создать полностью статическое приложение, задайте `outputMode` равным `static`. Чтобы включить SSR, обновите серверные маршруты, указав `RenderMode.Server`. Подробнее: [`Серверные маршруты`](#server-routing) и [`Генерация полностью статического приложения`](#generate-a-fully-static-application).

## Серверные маршруты {#server-routing}

### Настройка серверных маршрутов {#configuring-server-routes}

Конфигурацию серверных маршрутов можно создать, объявив массив объектов [`ServerRoute`](api/ssr/ServerRoute 'API reference'). Обычно эта конфигурация хранится в файле `app.routes.server.ts`.

```typescript
// app.routes.server.ts
import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '', // Этот маршрут рендерится на клиенте (CSR)
    renderMode: RenderMode.Client,
  },
  {
    path: 'about', // Эта страница статична, поэтому мы предварительно рендерим её (SSG)
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'profile', // Эта страница требует данных, специфичных для пользователя, поэтому используем SSR
    renderMode: RenderMode.Server,
  },
  {
    path: '**', // Все остальные маршруты рендерятся на сервере (SSR)
    renderMode: RenderMode.Server,
  },
];
```

Добавьте эту конфигурацию в приложение с помощью [`provideServerRendering`](api/ssr/provideServerRendering 'API reference'), используя функцию [`withRoutes`](api/ssr/withRoutes 'API reference'):

```typescript
import {provideServerRendering, withRoutes} from '@angular/ssr';
import {serverRoutes} from './app.routes.server';

// app.config.server.ts
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // ... другие провайдеры ...
  ],
};
```

При использовании [паттерна App shell](ecosystem/service-workers/app-shell) необходимо указать Компонент, используемый в качестве app shell для маршрутов с CSR. Для этого используйте возможность [`withAppShell`](api/ssr/withAppShell 'API reference'):

```typescript
import {provideServerRendering, withRoutes, withAppShell} from '@angular/ssr';
import {AppShell} from './app-shell';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes), withAppShell(AppShell)),
    // ... другие провайдеры ...
  ],
};
```

### Режимы рендеринга {#rendering-modes}

Конфигурация серверных маршрутов позволяет задать способ рендеринга каждого маршрута приложения, установив [`RenderMode`](api/ssr/RenderMode 'API reference'):

| Режим рендеринга    | Описание                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Server (SSR)**    | Рендерит приложение на сервере для каждого запроса, отправляя браузеру полностью заполненную HTML-страницу.         |
| **Client (CSR)**    | Рендерит приложение в браузере. Это поведение Angular по умолчанию.                                                |
| **Prerender (SSG)** | Предварительно рендерит приложение во время сборки, генерируя статические HTML-файлы для каждого маршрута.          |

#### Выбор режима рендеринга {#choosing-a-rendering-mode}

Каждый режим рендеринга имеет свои преимущества и недостатки. Выбирайте режим исходя из конкретных потребностей вашего приложения.

##### Рендеринг на стороне клиента (CSR) {#client-side-rendering-csr}

CSR предлагает наиболее простую модель разработки, поскольку можно писать код, предполагая, что он всегда выполняется в браузере. Это позволяет использовать широкий спектр клиентских библиотек, которые также рассчитаны на работу в браузере.

CSR, как правило, уступает другим режимам по производительности, поскольку браузер должен загрузить, разобрать и выполнить JavaScript вашей страницы, прежде чем пользователь увидит отрендеренный контент. Если страница дополнительно запрашивает данные с сервера в процессе рендеринга, пользователю придётся ждать и этих запросов.

Если страница индексируется поисковыми роботами, CSR может негативно влиять на SEO, поскольку роботы ограничены в объёме выполняемого JavaScript при индексировании.

При CSR серверу не нужно выполнять никакой работы по рендерингу страницы — достаточно обслуживать статические JavaScript-ресурсы. Это следует учитывать, если важна стоимость серверных ресурсов.

Приложения, поддерживающие установку и работу в офлайн-режиме с помощью [service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), могут полагаться на CSR без необходимости обращения к серверу.

##### SSR (Рендеринг на стороне сервера) {#server-side-rendering-ssr}

SSR обеспечивает более быструю загрузку страниц по сравнению с CSR. Вместо ожидания загрузки и запуска JavaScript сервер напрямую рендерит HTML-документ при получении запроса от браузера. Пользователь испытывает только задержку, необходимую серверу для получения данных и рендеринга запрошенной страницы. Этот режим также исключает необходимость дополнительных сетевых запросов из браузера, поскольку код может получать данные в процессе серверного рендеринга.

SSR, как правило, обеспечивает отличное SEO, поскольку поисковые роботы получают полностью отрендеренный HTML-документ.

SSR требует написания кода, не зависящего строго от браузерных API, и ограничивает выбор JavaScript-библиотек, рассчитанных на работу в браузере.

При SSR сервер запускает Angular для формирования HTML-ответа на каждый запрос, что может увеличить расходы на хостинг.

##### Предварительный рендеринг во время сборки {#build-time-prerendering}

Предварительный рендеринг обеспечивает более быструю загрузку страниц по сравнению и с CSR, и с SSR. Поскольку HTML-документы создаются _во время сборки_, сервер может напрямую отвечать на запросы статическим HTML-документом без какой-либо дополнительной работы.

Предварительный рендеринг требует, чтобы вся информация, необходимая для рендеринга страницы, была доступна _во время сборки_. Это означает, что предварительно отрендеренные страницы не могут содержать данные, специфичные для конкретного пользователя. Предварительный рендеринг наиболее полезен для страниц, одинаковых для всех пользователей.

Поскольку предварительный рендеринг выполняется во время сборки, он может значительно увеличить время production-сборок. Использование [`getPrerenderParams`](api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'API reference') для генерации большого количества HTML-документов может повлиять на общий размер файлов деплоя и, следовательно, замедлить развёртывание.

Предварительный рендеринг, как правило, обеспечивает отличное SEO, поскольку поисковые роботы получают полностью отрендеренный HTML-документ.

Предварительный рендеринг требует написания кода, не зависящего строго от браузерных API, и ограничивает выбор JavaScript-библиотек, рассчитанных на работу в браузере.

Предварительный рендеринг создаёт минимальные накладные расходы на каждый запрос: сервер отвечает статическими HTML-документами. Статические файлы также легко кешируются CDN-сетями, браузерами и промежуточными слоями кеширования, обеспечивая ещё более быструю последующую загрузку. Полностью статические сайты можно развёртывать исключительно через CDN или сервер статических файлов, исключая необходимость поддержки пользовательского серверного окружения. Это повышает масштабируемость за счёт разгрузки веб-сервера приложения, что особенно выгодно для высоконагруженных приложений.

NOTE: При использовании Angular service worker первый запрос рендерится на сервере, но все последующие обрабатываются service worker и рендерятся на стороне клиента.

### Установка заголовков и статус-кодов {#setting-headers-and-status-codes}

Для отдельных серверных маршрутов можно задавать пользовательские заголовки и статус-коды, используя свойства `headers` и `status` в конфигурации `ServerRoute`.

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
  // ... другие маршруты
];
```

### Перенаправления {#redirects}

Angular по-разному обрабатывает перенаправления, заданные свойством [`redirectTo`](api/router/Route#redirectTo 'API reference') в конфигурации маршрутов, на стороне сервера.

**SSR (Рендеринг на стороне сервера)**
Перенаправления выполняются через стандартные HTTP-перенаправления (например, 301, 302) в процессе SSR.

**Предварительный рендеринг (SSG)**
Перенаправления реализуются как «мягкие перенаправления» с использованием тегов [`<meta http-equiv="refresh">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#refresh) в предварительно отрендеренном HTML.

### Настройка предварительного рендеринга во время сборки (SSG) {#customizing-build-time-prerendering-ssg}

При использовании [`RenderMode.Prerender`](api/ssr/RenderMode#Prerender 'API reference') можно задавать несколько параметров конфигурации для настройки процесса предварительного рендеринга и обслуживания.

#### Параметризованные маршруты {#parameterized-routes}

Для каждого маршрута с [`RenderMode.Prerender`](api/ssr/RenderMode#Prerender 'API reference') можно задать функцию [`getPrerenderParams`](api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'API reference'). Эта функция позволяет управлять тем, какие конкретные параметры создают отдельные предварительно отрендеренные документы.

Функция [`getPrerenderParams`](api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'API reference') возвращает `Promise`, который разрешается в массив объектов. Каждый объект — это карта «имя параметра маршрута → значение». Например, для маршрута `post/:id` функция `getPrerenderParams` может вернуть массив `[{id: 123}, {id: 456}]` и таким образом создать отдельные документы для `post/123` и `post/456`.

В теле [`getPrerenderParams`](api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'API reference') можно использовать функцию Angular [`inject`](api/core/inject 'API reference') для внедрения зависимостей и выполнения любой работы по определению маршрутов для предварительного рендеринга. Как правило, это включает запросы на получение данных для построения массива значений параметров.

Также можно использовать эту функцию с catch-all маршрутами (например, `/**`), где имя параметра будет `"**"`, а возвращаемым значением — сегменты пути, например `foo/bar`. Их можно комбинировать с другими параметрами (например, `/post/:id/**`) для обработки более сложных конфигураций маршрутов.

```ts
// app.routes.server.ts
import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'post/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const dataService = inject(PostService);
      const ids = await dataService.getIds(); // Предположим, возвращает ['1', '2', '3']

      return ids.map((id) => ({id})); // Генерирует пути: /post/1, /post/2, /post/3
    },
  },
  {
    path: 'post/:id/**',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [
        {id: '1', '**': 'foo/3'},
        {id: '2', '**': 'bar/4'},
      ]; // Генерирует пути: /post/1/foo/3, /post/2/bar/4
    },
  },
];
```

Поскольку [`getPrerenderParams`](api/ssr/ServerRoutePrerenderWithParams#getPrerenderParams 'API reference') применяется исключительно к [`RenderMode.Prerender`](api/ssr/RenderMode#Prerender 'API reference'), эта функция всегда выполняется _во время сборки_. `getPrerenderParams` не должна зависеть от браузерных или серверных API для получения данных.

IMPORTANT: При использовании [`inject`](api/core/inject 'API reference') внутри `getPrerenderParams` помните, что `inject` должен использоваться синхронно. Его нельзя вызывать внутри асинхронных коллбэков или после выражений `await`. Подробнее см. `runInInjectionContext`.

#### Стратегии запасного варианта {#fallback-strategies}

При использовании режима [`RenderMode.Prerender`](api/ssr/RenderMode#Prerender 'API reference') можно задать стратегию запасного варианта для обработки запросов к маршрутам, которые не были предварительно отрендерены.

Доступные стратегии запасного варианта:

- **Server:** Откат на SSR. Это **поведение по умолчанию**, если свойство `fallback` не задано.
- **Client:** Откат на CSR.
- **None:** Нет запасного варианта. Angular не будет обрабатывать запросы к маршрутам, которые не были предварительно отрендерены.

```ts
// app.routes.server.ts
import {RenderMode, PrerenderFallback, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'post/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client, // Откат на CSR, если не предварительно отрендерено
    async getPrerenderParams() {
      // Эта функция возвращает массив объектов, представляющих предварительно
      // отрендеренные посты по путям: `/post/1`, `/post/2` и `/post/3`.
      // Путь `/post/4` будет использовать запасной вариант при запросе.
      return [{id: 1}, {id: 2}, {id: 3}];
    },
  },
];
```

## Создание компонентов, совместимых с сервером {#authoring-server-compatible-components}

Некоторые распространённые браузерные API и возможности могут быть недоступны на сервере. Приложения не могут использовать браузерные глобальные объекты, такие как `window`, `document`, `navigator` или `location`, а также некоторые свойства `HTMLElement`.

В общем случае код, зависящий от браузерных символов, должен выполняться только в браузере, а не на сервере. Это обеспечивается с помощью хуков жизненного цикла `afterEveryRender` и `afterNextRender`. Они выполняются только в браузере и пропускаются на сервере.

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
      // Безопасно проверять `scrollHeight`, поскольку это выполняется только в браузере, не на сервере.
      console.log('content height: ' + this.contentRef().nativeElement.scrollHeight);
    });
  }
}
```

NOTE: Предпочтительнее использовать [платформо-специфичные провайдеры](guide/ssr#providing-platform-specific-implementations) вместо проверок `isPlatformBrowser` или `isPlatformServer` во время выполнения.

IMPORTANT: Избегайте использования `isPlatformBrowser` в Шаблонах с `@if` или другими условными конструкциями для рендеринга разного контента на сервере и клиенте. Это вызывает несоответствия Гидратации и сдвиги компоновки, негативно влияя на пользовательский опыт и [Core Web Vitals](https://web.dev/learn-core-web-vitals/). Вместо этого используйте `afterNextRender` для инициализации, специфичной для браузера, и сохраняйте отрендеренный контент согласованным на всех платформах.

## Настройка провайдеров на сервере {#setting-providers-on-the-server}

На стороне сервера значения провайдеров верхнего уровня задаются один раз при первоначальном разборе и выполнении кода приложения.
Это означает, что провайдеры, настроенные с `useValue`, сохранят своё значение при нескольких запросах до перезапуска серверного приложения.

Если нужно генерировать новое значение для каждого запроса, используйте фабричный провайдер с `useFactory`. Фабричная функция будет выполняться для каждого входящего запроса, гарантируя, что каждый раз будет создаваться и присваиваться токену новое значение.

## Предоставление платформо-специфичных реализаций {#providing-platform-specific-implementations}

Когда приложению требуется разное поведение в браузере и на сервере, предоставьте отдельные реализации Сервиса для каждой платформы. Этот подход централизует логику платформы в специализированных Сервисах.

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
    // Отправляет событие стороннему провайдеру аналитики на основе браузера
  }
}
```

Создайте серверную реализацию:

```ts
@Injectable()
export class ServerAnalyticsService implements AnalyticsService {
  trackEvent(name: string): void {
    // Записывает событие на сервере
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

Переопределите серверной реализацией в конфигурации сервера:

```ts
// app.config.server.ts
const serverConfig: ApplicationConfig = {
  providers: [{provide: AnalyticsService, useClass: ServerAnalyticsService}],
};
```

Внедряйте и используйте Сервис в Компонентах:

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

При работе с SSR следует избегать прямых ссылок на браузерные глобальные объекты, такие как `document`. Вместо этого используйте токен [`DOCUMENT`](api/core/DOCUMENT) для доступа к объекту document платформо-независимым способом.

```ts
import {Injectable, inject, DOCUMENT} from '@angular/core';

@Injectable({providedIn: 'root'})
export class CanonicalLinkService {
  private readonly document = inject(DOCUMENT);

  // При серверном рендеринге внедряем тег <link rel="canonical">,
  // чтобы в сгенерированном HTML был правильный канонический URL
  setCanonical(href: string): void {
    const link = this.document.createElement('link');
    link.rel = 'canonical';
    link.href = href;
    this.document.head.appendChild(link);
  }
}
```

HELPFUL: Для управления мета-тегами Angular предоставляет Сервис `Meta`.

## Доступ к Request и Response через DI {#accessing-request-and-response-via-di}

Пакет `@angular/core` предоставляет несколько токенов для взаимодействия со средой SSR. Эти токены дают доступ к важной информации и объектам в Angular-приложении во время SSR.

- **[`REQUEST`](api/core/REQUEST 'API reference'):** Предоставляет доступ к текущему объекту запроса типа [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) из Web API. Позволяет получать доступ к заголовкам, куки и другой информации запроса.
- **[`RESPONSE_INIT`](api/core/RESPONSE_INIT 'API reference'):** Предоставляет доступ к параметрам инициализации ответа типа [`ResponseInit`](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#parameters) из Web API. Позволяет динамически устанавливать заголовки и статус-код ответа. Используйте этот токен для установки заголовков или статус-кодов, которые должны определяться во время выполнения.
- **[`REQUEST_CONTEXT`](api/core/REQUEST_CONTEXT 'API reference'):** Предоставляет доступ к дополнительному контексту, связанному с текущим запросом. Этот контекст можно передать вторым параметром функции [`handle`](api/ssr/AngularAppEngine#handle 'API reference'). Как правило, используется для предоставления дополнительной информации, связанной с запросом, которая не является частью стандартного Web API.

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
  <li>При статической генерации сайта (SSG).</li>
  <li>При извлечении маршрутов в процессе разработки (в момент запроса).</li>
</ul>

<!-- prettier-ignore-end -->

## Генерация полностью статического приложения {#generate-a-fully-static-application}

По умолчанию Angular предварительно рендерит всё приложение и генерирует серверный файл для обработки запросов. Это позволяет приложению обслуживать предварительно отрендеренный контент пользователям. Однако если вы предпочитаете полностью статический сайт без сервера, можно отказаться от этого поведения, установив `outputMode` равным `static` в файле конфигурации `angular.json`.

Когда `outputMode` установлен в `static`, Angular генерирует предварительно отрендеренные HTML-файлы для каждого маршрута во время сборки, но не создаёт серверный файл и не требует Node.js-сервера для обслуживания приложения. Это полезно при развёртывании у провайдеров статического хостинга, где серверный бэкенд не нужен.

Для настройки обновите файл `angular.json` следующим образом:

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

## Кеширование данных при использовании HttpClient {#caching-data-when-using-httpclient}

`HttpClient` кеширует исходящие сетевые запросы при работе на сервере. Эта информация сериализуется и передаётся в браузер как часть начального HTML, отправляемого сервером. В браузере `HttpClient` проверяет, есть ли данные в кеше, и если да — повторно использует их вместо нового HTTP-запроса при начальном рендеринге приложения. `HttpClient` прекращает использовать кеш, как только приложение становится [стабильным](api/core/ApplicationRef#isStable) в браузере.

### Настройка параметров кеширования {#configuring-the-caching-options}

Можно настроить, как Angular кеширует HTTP-ответы при SSR и повторно использует их при Гидратации, задав `HttpTransferCacheOptions`.
Эта конфигурация предоставляется глобально через `withHttpTransferCacheOptions` внутри `provideClientHydration()`.

По умолчанию `HttpClient` кеширует все запросы `HEAD` и `GET`, не содержащие заголовков `Authorization` или `Proxy-Authorization`. Эти настройки можно переопределить через `withHttpTransferCacheOptions` в конфигурации Гидратации.

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

### `includeHeaders` {#includeheaders}

Задаёт, какие заголовки из серверного ответа должны включаться в кешированные записи.
По умолчанию заголовки не включаются.

```ts
withHttpTransferCacheOptions({
  includeHeaders: ['ETag', 'Cache-Control'],
});
```

IMPORTANT: Избегайте включения чувствительных заголовков, таких как токены аутентификации. Они могут привести к утечке пользовательских данных между запросами.

---

### `includePostRequests` {#includepostrequests}

По умолчанию кешируются только запросы `GET` и `HEAD`.
Можно включить кеширование `POST`-запросов, если они используются как операции чтения — например, для GraphQL-запросов.

```ts
withHttpTransferCacheOptions({
  includePostRequests: true,
});
```

Используйте это только тогда, когда `POST`-запросы являются **идемпотентными** и безопасны для повторного использования между серверным и клиентским рендерингом.

---

### `includeRequestsWithAuthHeaders` {#includerequestswithauthorizationheaders}

Определяет, имеют ли право на кеширование запросы, содержащие заголовки `Authorization` или `Proxy-Authorization`.
По умолчанию они исключены, чтобы предотвратить кеширование пользовательских ответов.

```ts
withHttpTransferCacheOptions({
  includeRequestsWithAuthHeaders: true,
});
```

Включайте только тогда, когда заголовки аутентификации **не влияют** на содержимое ответа (например, публичные токены для аналитических API).

### Переопределения для отдельных запросов {#per-request-overrides}

Можно переопределить поведение кеширования для конкретного запроса, используя параметр запроса `transferCache`.

```ts
// Включить конкретные заголовки для этого запроса
http.get('/api/profile', {transferCache: {includeHeaders: ['CustomHeader']}});
```

### Отключение кеширования {#disabling-caching}

Кеширование HTTP-запросов, отправляемых с сервера, можно отключить глобально или для отдельных запросов.

#### Глобально {#globally}

Чтобы отключить кеширование всех запросов в приложении, используйте возможность `withNoHttpTransferCache`:

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

Можно также выборочно отключить кеширование для определённых запросов, используя опцию [`filter`](api/common/http/HttpTransferCacheOptions) в `withHttpTransferCacheOptions`. Например, отключить кеширование для конкретной API-точки:

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

Используйте эту опцию для исключения точек с пользовательскими или динамическими данными (например, `/api/profile`).

#### Для отдельного запроса {#per-request}

Чтобы отключить кеширование для отдельного запроса, укажите опцию [`transferCache`](api/common/http/HttpRequest#transferCache) в `HttpRequest`.

```ts
httpClient.get('/api/sensitive-data', {transferCache: false});
```

NOTE: Если приложение использует разные HTTP-источники для API-запросов на сервере и на клиенте, токен `HTTP_TRANSFER_CACHE_ORIGIN_MAP` позволяет установить соответствие между этими источниками, чтобы функция `HttpTransferCache` распознавала запросы как идентичные и повторно использовала данные, кешированные на сервере, при Гидратации на клиенте.

## Настройка сервера {#configuring-a-server}

### Node.js {#nodejs}

`@angular/ssr/node` расширяет `@angular/ssr` специально для сред Node.js. Он предоставляет API, упрощающие реализацию SSR в Node.js-приложении. Полный список функций и примеры использования: [API-справочник `@angular/ssr/node`](api/ssr/node/AngularNodeAppEngine).

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
        next(); // Передать управление следующему middleware
      }
    })
    .catch(next);
});

/**
 * Обработчик запросов, используемый Angular CLI (dev-server и при сборке).
 */
export const reqHandler = createNodeRequestHandler(app);
```

### Не-Node.js окружения {#non-nodejs}

`@angular/ssr` предоставляет основные API для SSR Angular-приложения на платформах, отличных от Node.js. Он использует стандартные объекты [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) и [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) из Web API, позволяя интегрировать Angular SSR в различные серверные среды. Подробная информация и примеры: [API-справочник `@angular/ssr`](api/ssr/AngularAppEngine).

```ts
// server.ts
import {AngularAppEngine, createRequestHandler} from '@angular/ssr';

const angularApp = new AngularAppEngine();

/**
 * Обработчик запросов, используемый Angular CLI (dev-server и при сборке).
 */
export const reqHandler = createRequestHandler(async (req: Request) => {
  const res: Response | null = await angularApp.render(req);

  // ...
});
```

## Безопасность {#security}

Подробная информация о предотвращении Server-Side Request Forgery (SSRF) и настройке разрешённых хостов: [руководство по серверной безопасности](best-practices/security#preventing-server-side-request-forgery-ssrf).
