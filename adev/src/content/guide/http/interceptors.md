# Interceptors

`HttpClient` поддерживает форму middleware, известную как _interceptors_.

TLDR: Interceptors — это middleware, позволяющий абстрагировать общие паттерны повтора запросов, кеширования, логирования и аутентификации от отдельных запросов.

`HttpClient` поддерживает два вида interceptors: функциональные и на основе DI. Мы рекомендуем использовать функциональные interceptors, поскольку они имеют более предсказуемое поведение, особенно в сложных конфигурациях. Примеры в этом руководстве используют функциональные interceptors; [DI-based interceptors](#di-based-interceptors) рассматриваются в отдельном разделе в конце.

## Interceptors {#interceptors-overview}

Interceptors — это в целом функции, которые можно выполнять для каждого запроса; они обладают широкими возможностями влиять на содержимое и общий ход запросов и ответов. Можно установить несколько interceptors, образующих цепочку, где каждый interceptor обрабатывает запрос или ответ перед передачей его следующему interceptor в цепочке.

Interceptors можно использовать для реализации различных распространённых паттернов, таких как:

- Добавление заголовков аутентификации к исходящим запросам к определённому API.
- Повтор неудачных запросов с экспоненциальной задержкой.
- Кеширование ответов на определённый период или до инвалидации мутациями.
- Настройка разбора ответов.
- Измерение времени ответа сервера и его логирование.
- Управление элементами UI, такими как индикатор загрузки, во время сетевых операций.
- Сбор и пакетная обработка запросов, сделанных в определённый промежуток времени.
- Автоматическое завершение запросов с ошибкой после настраиваемого дедлайна или тайм-аута.
- Регулярный опрос сервера и обновление результатов.

## Определение interceptor {#defining-an-interceptor}

Базовая форма interceptor — это функция, которая получает исходящий `HttpRequest` и функцию `next`, представляющую следующий шаг обработки в цепочке interceptors.

Например, данный `loggingInterceptor` будет логировать URL исходящего запроса в `console.log` перед его перенаправлением:

```ts
export function loggingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  console.log(req.url);
  return next(req);
}
```

Чтобы этот interceptor действительно перехватывал запросы, необходимо настроить `HttpClient` для его использования.

## Настройка interceptors {#configuring-interceptors}

Набор используемых interceptors объявляется при настройке `HttpClient` через внедрение зависимостей с помощью функции `withInterceptors`:

```ts
bootstrapApplication(App, {
  providers: [provideHttpClient(withInterceptors([loggingInterceptor, cachingInterceptor]))],
});
```

Настроенные interceptors объединяются в цепочку в том порядке, в котором они перечислены в providers. В приведённом примере `loggingInterceptor` обработает запрос и затем передаст его `cachingInterceptor`.

### Перехват событий ответа {#intercepting-response-events}

Interceptor может преобразовывать поток `Observable` из `HttpEvent`s, возвращаемых `next`, для доступа к ответу или его изменения. Поскольку этот поток включает все события ответа, может потребоваться проверка `.type` каждого события для идентификации конечного объекта ответа.

```ts
export function loggingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    tap((event) => {
      if (event.type === HttpEventType.Response) {
        console.log(req.url, 'returned a response with status', event.status);
      }
    }),
  );
}
```

TIP: Interceptors естественным образом связывают ответы с исходящими запросами, поскольку преобразуют поток ответов в замыкании, захватывающем объект запроса.

## Изменение запросов {#modifying-requests}

Большинство аспектов экземпляров `HttpRequest` и `HttpResponse` _неизменяемы_, и interceptors не могут изменять их напрямую. Вместо этого interceptors применяют мутации путём клонирования этих объектов с помощью операции `.clone()` и указания свойств, которые должны быть изменены в новом экземпляре. Это может включать выполнение неизменяемых обновлений самого значения (например, `HttpHeaders` или `HttpParams`).

Например, для добавления заголовка к запросу:

```ts
const reqWithHeader = req.clone({
  headers: req.headers.set('X-New-Header', 'new header value'),
});
```

Эта неизменяемость позволяет большинству interceptors быть идемпотентными, если один и тот же `HttpRequest` передаётся в цепочку interceptors несколько раз. Это может происходить по ряду причин, включая повтор запроса после неудачи.

CRITICAL: Тело запроса или ответа **не** защищено от глубоких мутаций. Если interceptor должен изменить тело, нужно предусмотреть обработку многократного выполнения на одном и том же запросе.

## Внедрение зависимостей в interceptors {#dependency-injection-in-interceptors}

Interceptors выполняются в _контексте внедрения_ инжектора, который их зарегистрировал, и могут использовать API Angular [`inject`](/api/core/inject) для получения зависимостей.

Например, предположим, что в приложении есть сервис `AuthService`, создающий токены аутентификации для исходящих запросов. Interceptor может внедрить и использовать этот сервис:

```ts
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  // Inject the current `AuthService` and use it to get an authentication token:
  const authToken = inject(AuthService).getAuthToken();

  // Clone the request to add the authentication header.
  const newReq = req.clone({
    headers: req.headers.append('X-Authentication-Token', authToken),
  });
  return next(newReq);
}
```

## Метаданные запроса и ответа {#request-and-response-metadata}

Часто бывает полезно включить в запрос информацию, которая не отправляется на бэкенд, а предназначена специально для interceptors. Объекты `HttpRequest` имеют объект `.context`, хранящий такие метаданные в виде экземпляра `HttpContext`. Этот объект функционирует как типизированная карта с ключами типа `HttpContextToken`.

Чтобы показать, как работает эта система, воспользуемся метаданными для управления тем, включён ли кеширующий interceptor для данного запроса.

### Определение контекстных токенов {#defining-context-tokens}

Для хранения того, должен ли кеширующий interceptor кешировать определённый запрос в карте `.context` этого запроса, определите новый `HttpContextToken` в качестве ключа:

```ts
export const CACHING_ENABLED = new HttpContextToken<boolean>(() => true);
```

Предоставленная функция создаёт значение по умолчанию для токена для запросов, для которых значение не было явно установлено. Использование функции гарантирует, что если значение токена является объектом или массивом, каждый запрос получит свой собственный экземпляр.

### Чтение токена в interceptor {#reading-the-token-in-an-interceptor}

Interceptor может затем прочитать токен и на основе его значения решить, применять ли логику кеширования:

```ts
export function cachingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (req.context.get(CACHING_ENABLED)) {
    // apply caching logic
    return ...;
  } else {
    // caching has been disabled for this request
    return next(req);
  }
}
```

### Установка контекстных токенов при выполнении запроса {#setting-context-tokens-when-making-a-request}

При выполнении запроса через API `HttpClient` можно указать значения для `HttpContextToken`s:

```ts
const data$ = http.get('/sensitive/data', {
  context: new HttpContext().set(CACHING_ENABLED, false),
});
```

Interceptors могут считывать эти значения из `HttpContext` запроса.

### Контекст запроса изменяем {#the-request-context-is-mutable}

В отличие от других свойств `HttpRequest`, связанный `HttpContext` _изменяем_. Если interceptor изменяет контекст запроса, который впоследствии повторяется, тот же interceptor увидит мутацию контекста при повторном выполнении. Это полезно для передачи состояния между несколькими повторными попытками при необходимости.

## Синтетические ответы {#synthetic-responses}

Большинство interceptors просто вызывают обработчик `next`, преобразуя запрос или ответ, но это не является строгим требованием. В этом разделе рассматриваются несколько способов, которыми interceptor может реализовывать более сложное поведение.

Interceptors не обязаны вызывать `next`. Вместо этого они могут создавать ответы с помощью другого механизма, например из кеша или путём отправки запроса через альтернативный механизм.

Создание ответа возможно с помощью конструктора `HttpResponse`:

```ts
const resp = new HttpResponse({
  body: 'response body',
});
```

## Работа с информацией о перенаправлениях {#working-with-redirect-information}

Когда `HttpClient` использует бэкенд fetch, ответы включают свойство `redirected`, указывающее, является ли ответ результатом перенаправления. Это свойство соответствует спецификации нативного Fetch API и может быть полезно в interceptors для обработки сценариев перенаправления.

Interceptor может получить доступ к информации о перенаправлении и действовать на её основе:

```ts
export function redirectTrackingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    tap((event) => {
      if (event.type === HttpEventType.Response && event.redirected) {
        console.log('Request to', req.url, 'was redirected to', event.url);
        // Handle redirect logic - maybe update analytics, security checks, etc.
      }
    }),
  );
}
```

Также можно использовать информацию о перенаправлении для реализации условной логики в interceptors:

```ts
export function authRedirectInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    tap((event) => {
      if (event.type === HttpEventType.Response && event.redirected) {
        // Check if we were redirected to a login page
        if (event.url?.includes('/login')) {
          // Handle authentication redirect
          handleAuthRedirect();
        }
      }
    }),
  );
}
```

## Работа с типами ответов {#working-with-response-types}

Когда `HttpClient` использует бэкенд fetch, ответы включают свойство `type`, указывающее, как браузер обработал ответ в соответствии с политиками CORS и режимом запроса. Это свойство соответствует спецификации нативного Fetch API и предоставляет ценную информацию для отладки проблем CORS и понимания доступности ответа.

Свойство `type` ответа может принимать следующие значения:

- `'basic'` — ответ с того же источника с доступом ко всем заголовкам
- `'cors'` — кросс-доменный ответ с правильно настроенными заголовками CORS
- `'opaque'` — кросс-доменный ответ без CORS, заголовки и тело могут быть ограничены
- `'opaqueredirect'` — ответ от перенаправленного запроса в режиме no-cors
- `'error'` — произошла сетевая ошибка

Interceptor может использовать информацию о типе ответа для отладки CORS и обработки ошибок:

```ts
export function responseTypeInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    map((event) => {
      if (event.type === HttpEventType.Response) {
        // Handle different response types appropriately
        switch (event.responseType) {
          case 'opaque':
            // Limited access to response data
            console.warn('Limited response data due to CORS policy');
            break;
          case 'cors':
          case 'basic':
            // Full access to response data
            break;
          case 'error':
            // Handle network errors
            console.error('Network error in response');
            break;
        }
      }
    }),
  );
}
```

## DI-based interceptors {#di-based-interceptors}

`HttpClient` также поддерживает interceptors, определённые как внедряемые классы и настроенные через систему DI. Возможности DI-based interceptors идентичны возможностям функциональных interceptors, но механизм конфигурации отличается.

DI-based interceptor — это внедряемый класс, реализующий интерфейс `HttpInterceptor`:

```ts
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Request URL: ' + req.url);
    return handler.handle(req);
  }
}
```

DI-based interceptors настраиваются через мульти-провайдер внедрения зависимостей:

```ts
bootstrapApplication(App, {
  providers: [
    provideHttpClient(
      // DI-based interceptors must be explicitly enabled.
      withInterceptorsFromDi(),
    ),

    {provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true},
  ],
});
```

DI-based interceptors выполняются в порядке регистрации их провайдеров. В приложении с обширной и иерархической конфигурацией DI этот порядок может быть очень сложно предсказать.
