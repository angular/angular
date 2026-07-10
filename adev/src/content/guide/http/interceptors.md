# Interceptor'ы

`HttpClient` поддерживает форму middleware, известную как _interceptor'ы_.

TLDR: Interceptor'ы — это middleware, позволяющее абстрагировать общие паттерны вокруг повторных попыток, кэширования, логирования и аутентификации от отдельных запросов.

`HttpClient` поддерживает два вида interceptor'ов: функциональные и на основе DI. Рекомендация — использовать функциональные interceptor'ы, потому что у них более предсказуемое поведение, особенно в сложных настройках. Примеры в этом руководстве используют функциональные interceptor'ы, а [interceptor'ы на основе DI](#di-based-interceptors) рассматриваются в отдельном разделе в конце.

## Interceptor'ы {#interceptors}

Interceptor'ы — обычно функции, которые можно запускать для каждого запроса и которые имеют широкие возможности влиять на содержимое и общий поток запросов и ответов. Можно установить несколько interceptor'ов, которые образуют цепочку, где каждый обрабатывает запрос или ответ перед передачей следующему interceptor'у в цепочке.

Interceptor'ы можно использовать для реализации различных распространённых паттернов, например:

- Добавление заголовков аутентификации к исходящим запросам к конкретному API.
- Повтор неудачных запросов с экспоненциальной задержкой.
- Кэширование ответов на период времени или до инвалидации мутациями.
- Настройка разбора ответов.
- Измерение времени ответа сервера и логирование.
- Управление UI-элементами вроде спиннера загрузки, пока сетевые операции выполняются.
- Сбор и пакетная обработка запросов, сделанных в определённом временном окне.
- Автоматический сбой запросов после настраиваемого дедлайна или таймаута.
- Регулярный опрос сервера и обновление результатов.

## Определение interceptor {#defining-an-interceptor}

Базовая форма interceptor — функция, которая получает исходящий `HttpRequest` и функцию `next`, представляющую следующий шаг обработки в цепочке interceptor'ов.

Например, этот `loggingInterceptor` залогирует URL исходящего запроса в `console.log` перед передачей запроса дальше:

```ts
export function loggingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  console.log(req.url);
  return next(req);
}
```

Чтобы этот interceptor действительно перехватывал запросы, нужно настроить `HttpClient` на его использование.

## Настройка interceptor'ов {#configuring-interceptors}

Набор interceptor'ов для использования объявляется при настройке `HttpClient` через внедрение зависимостей с помощью возможности `withInterceptors`:

```ts
bootstrapApplication(App, {
  providers: [provideHttpClient(withInterceptors([loggingInterceptor, cachingInterceptor]))],
});
```

Настроенные interceptor'ы связываются в цепочку в порядке, в котором вы перечислили их в providers. В примере выше `loggingInterceptor` обработал бы запрос и затем передал бы его `cachingInterceptor`.

### Перехват событий ответа {#intercepting-response-events}

Interceptor может преобразовывать поток `Observable` событий `HttpEvent`, возвращаемый `next`, чтобы получить доступ к ответу или манипулировать им. Поскольку этот поток включает все события ответа, может понадобиться проверять `.type` каждого события, чтобы идентифицировать финальный объект ответа.

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

TIP: Interceptor'ы естественно ассоциируют ответы с исходящими запросами, потому что преобразуют поток ответа в замыкании, захватывающем объект запроса.

## Изменение запросов {#modifying-requests}

Большинство аспектов экземпляров `HttpRequest` и `HttpResponse` _неизменяемы_, и interceptor'ы не могут изменять их напрямую. Вместо этого interceptor'ы применяют мутации, клонируя эти объекты операцией `.clone()` и указывая, какие свойства должны быть изменены в новом экземпляре. Это может включать выполнение неизменяемых обновлений самого значения (вроде `HttpHeaders` или `HttpParams`).

Например, чтобы добавить заголовок к запросу:

```ts
const reqWithHeader = req.clone({
  headers: req.headers.set('X-New-Header', 'new header value'),
});
```

Эта неизменяемость позволяет большинству interceptor'ов быть идемпотентными, если один и тот же `HttpRequest` отправляется в цепочку interceptor'ов несколько раз. Это может произойти по нескольким причинам, включая повтор запроса после сбоя.

CRITICAL: Тело запроса или ответа **не** защищено от глубоких мутаций. Если interceptor должен мутировать тело, будьте осторожны при обработке многократного запуска на одном запросе.

## Внедрение зависимостей в interceptor'ах {#dependency-injection-in-interceptors}

Interceptor'ы выполняются в _контексте внедрения_ инжектора, который их зарегистрировал, и могут использовать API Angular [`inject`](/api/core/inject) для получения зависимостей.

Например, предположим, у приложения есть сервис `AuthService`, который создаёт токены аутентификации для исходящих запросов. Interceptor может внедрить и использовать этот сервис:

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

Часто полезно включать в запрос информацию, которая не отправляется на backend, а специально предназначена для interceptor'ов. У `HttpRequest` есть объект `.context`, который хранит такие метаданные как экземпляр `HttpContext`. Этот объект функционирует как типизированная карта с ключами типа `HttpContextToken`.

Чтобы проиллюстрировать, как работает эта система, используем метаданные для управления тем, включён ли кэширующий interceptor для данного запроса.

### Определение токенов контекста {#defining-context-tokens}

Чтобы хранить, должен ли кэширующий interceptor кэшировать конкретный запрос в карте `.context` этого запроса, определите новый `HttpContextToken` как ключ:

```ts
export const CACHING_ENABLED = new HttpContextToken<boolean>(() => true);
```

Предоставленная функция создаёт значение по умолчанию для токена для запросов, которые явно не задали для него значение. Использование функции гарантирует, что если значение токена — объект или массив, каждый запрос получает свой экземпляр.

### Чтение токена в interceptor {#reading-the-token-in-an-interceptor}

Затем interceptor может прочитать токен и выбрать, применять ли логику кэширования, на основе его значения:

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

### Установка токенов контекста при выполнении запроса {#setting-context-tokens-when-making-a-request}

При выполнении запроса через API `HttpClient` можно предоставить значения для `HttpContextToken`:

```ts
const data$ = http.get('/sensitive/data', {
  context: new HttpContext().set(CACHING_ENABLED, false),
});
```

Interceptor'ы могут читать эти значения из `HttpContext` запроса.

### Контекст запроса изменяем {#the-request-context-is-mutable}

В отличие от других свойств `HttpRequest`, связанный `HttpContext` _изменяем_. Если interceptor меняет контекст запроса, который позже повторяется, тот же interceptor увидит мутацию контекста при повторном запуске. Это полезно для передачи состояния через несколько повторных попыток при необходимости.

## Синтетические ответы {#synthetic-responses}

Большинство interceptor'ов просто вызывают обработчик `next`, преобразуя либо запрос, либо ответ, но это не строгое требование. В этом разделе обсуждаются несколько способов, которыми interceptor может включать более продвинутое поведение.

Interceptor'ы не обязаны вызывать `next`. Вместо этого они могут выбрать построение ответов через другой механизм, например из кэша или отправкой запроса через альтернативный механизм.

Построить ответ можно с помощью конструктора `HttpResponse`:

```ts
const resp = new HttpResponse({
  body: 'response body',
});
```

## Работа с информацией о редиректе {#working-with-redirect-information}

Когда `HttpClient` использует fetch backend, ответы включают свойство `redirected`, указывающее, был ли ответ результатом редиректа. Это свойство соответствует спецификации нативного Fetch API и может быть полезно в interceptor'ах для обработки сценариев редиректа.

Interceptor может получить доступ к информации о редиректе и действовать на её основе:

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

Также можно использовать информацию о редиректе для реализации условной логики в interceptor'ах:

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

## Работа с типами ответа {#working-with-response-types}

Когда `HttpClient` использует fetch backend, ответы включают свойство `type`, указывающее, как браузер обработал ответ на основе политик CORS и режима запроса. Это свойство соответствует спецификации нативного Fetch API и даёт ценные insights для отладки проблем CORS и понимания доступности ответа.

Свойство `type` ответа может иметь следующие значения:

- `'basic'` — ответ same-origin со всеми доступными заголовками
- `'cors'` — кросс-origin ответ с корректно настроенными CORS-заголовками
- `'opaque'` — кросс-origin ответ без CORS; заголовки и тело могут быть ограничены
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

## Interceptor'ы на основе DI {#di-based-interceptors}

`HttpClient` также поддерживает interceptor'ы, определённые как injectable-классы и настроенные через систему DI. Возможности interceptor'ов на основе DI идентичны функциональным, но механизм конфигурации другой.

Interceptor на основе DI — injectable-класс, реализующий интерфейс `HttpInterceptor`:

```ts
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Request URL: ' + req.url);
    return handler.handle(req);
  }
}
```

Interceptor'ы на основе DI настраиваются через multi-provider внедрения зависимостей:

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

Interceptor'ы на основе DI выполняются в порядке регистрации их providers. В приложении с обширной и иерархической конфигурацией DI этот порядок может быть очень сложно предсказать.
