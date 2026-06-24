# Interceptors

`HttpClient` поддерживает вид промежуточного ПО, известный как _interceptors_ (перехватчики).

Вкратце: Interceptors — это промежуточное ПО, позволяющее абстрагировать общие шаблоны, такие как повторные попытки,
кэширование, логирование и аутентификация, от отдельных запросов.

`HttpClient` поддерживает два типа interceptors: функциональные и основанные на DI. Мы рекомендуем использовать
функциональные interceptors, так как они имеют более предсказуемое поведение, особенно в сложных конфигурациях. Примеры
в этом руководстве используют функциональные interceptors, а [interceptors на основе DI](#di-based-interceptors)
рассматриваются в отдельном разделе в конце.

## Interceptors

Interceptors — это, как правило, функции, которые можно запускать для каждого запроса. Они обладают широкими
возможностями для влияния на содержимое и общий поток запросов и ответов. Вы можете установить несколько interceptors,
которые образуют цепочку, где каждый interceptor обрабатывает запрос или ответ перед передачей его следующему
interceptor в цепочке.

Вы можете использовать interceptors для реализации множества общих шаблонов, таких как:

- Добавление заголовков аутентификации к исходящим запросам к определенному API.
- Повторная отправка неудачных запросов с экспоненциальной задержкой.
- Кэширование ответов на определенный период времени или до их инвалидации изменениями.
- Настройка парсинга ответов.
- Измерение времени отклика сервера и его логирование.
- Управление элементами UI, такими как индикатор загрузки, во время выполнения сетевых операций.
- Сбор и пакетирование запросов, сделанных в определенный промежуток времени.
- Автоматическое отклонение запросов по истечении настраиваемого срока или таймаута.
- Регулярный опрос сервера и обновление результатов.

## Определение interceptor

Базовая форма interceptor — это функция, которая получает исходящий `HttpRequest` и функцию `next`, представляющую
следующий шаг обработки в цепочке interceptors.

Например, этот `loggingInterceptor` будет выводить URL исходящего запроса в `console.log` перед передачей запроса
дальше:

```ts
export function loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  console.log(req.url);
  return next(req);
}
```

Чтобы этот interceptor действительно перехватывал запросы, необходимо настроить `HttpClient` на его использование.

## Настройка interceptors

Вы объявляете набор interceptors для использования при настройке `HttpClient` через внедрение зависимостей, используя
функцию `withInterceptors`:

```ts
bootstrapApplication(AppComponent, {providers: [
  provideHttpClient(
    withInterceptors([loggingInterceptor, cachingInterceptor]),
  )
]});
```

Настроенные interceptors связываются в цепочку в том порядке, в котором вы перечислили их в провайдерах. В приведенном
выше примере `loggingInterceptor` обработает запрос, а затем передаст его в `cachingInterceptor`.

### Перехват событий ответа

Interceptor может преобразовывать поток `Observable` событий `HttpEvent`, возвращаемый функцией `next`, для доступа к
ответу или манипулирования им. Поскольку этот поток включает все события ответа, проверка `.type` каждого события может
быть необходима для идентификации финального объекта ответа.

```ts
export function loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  return next(req).pipe(tap(event => {
    if (event.type === HttpEventType.Response) {
      console.log(req.url, 'returned a response with status', event.status);
    }
  }));
}
```

СОВЕТ: Interceptors естественным образом связывают ответы с их исходящими запросами, так как они преобразуют поток
ответов в замыкании, захватывающем объект запроса.

## Изменение запросов

Большинство аспектов экземпляров `HttpRequest` и `HttpResponse` являются _неизменяемыми_ (immutable), и interceptors не
могут напрямую изменять их. Вместо этого interceptors применяют изменения путем клонирования этих объектов с помощью
операции `.clone()` и указания свойств, которые должны быть изменены в новом экземпляре. Это может включать выполнение
неизменяемых обновлений самого значения (например, `HttpHeaders` или `HttpParams`).

Например, чтобы добавить заголовок к запросу:

```ts
const reqWithHeader = req.clone({
  headers: req.headers.set('X-New-Header', 'new header value'),
});
```

Эта неизменяемость позволяет большинству interceptors быть идемпотентными, если один и тот же `HttpRequest` передается в
цепочку interceptors несколько раз. Это может произойти по нескольким причинам, включая повторную попытку запроса после
сбоя.

ВАЖНО: Тело запроса или ответа **не** защищено от глубоких изменений (deep mutations). Если interceptor должен изменить
тело, позаботьтесь о корректной обработке многократного запуска для одного и того же запроса.

## Внедрение зависимостей в interceptors

Interceptors запускаются в _контексте внедрения_ (injection context) инжектора, который их зарегистрировал, и могут
использовать API `inject` из Angular для получения зависимостей.

Например, предположим, что в приложении есть сервис `AuthService`, который создает токены аутентификации для исходящих
запросов. Interceptor может внедрить и использовать этот сервис:

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

## Метаданные запроса и ответа

Часто бывает полезно включить в запрос информацию, которая не отправляется на бэкенд, а предназначена специально для
interceptors. У `HttpRequest` есть объект `.context`, который хранит такого рода метаданные как экземпляр `HttpContext`.
Этот объект работает как типизированная карта (map) с ключами типа `HttpContextToken`.

Чтобы проиллюстрировать, как работает эта система, давайте используем метаданные для управления тем, включен ли
кэширующий interceptor для данного запроса.

### Определение токенов контекста

Чтобы сохранить информацию о том, должен ли кэширующий interceptor кэшировать конкретный запрос, в карте `.context`
этого запроса, определите новый `HttpContextToken` в качестве ключа:

```ts
export const CACHING_ENABLED = new HttpContextToken<boolean>(() => true);
```

Предоставленная функция создает значение по умолчанию для токена для запросов, которые явно не установили для него
значение. Использование функции гарантирует, что если значение токена является объектом или массивом, каждый запрос
получит свой собственный экземпляр.

### Чтение токена в interceptor

Interceptor может затем прочитать токен и решить, применять логику кэширования или нет, основываясь на его значении:

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

### Установка токенов контекста при выполнении запроса

При выполнении запроса через API `HttpClient` вы можете предоставить значения для `HttpContextToken`:

```ts
const data$ = http.get('/sensitive/data', {
  context: new HttpContext().set(CACHING_ENABLED, false),
});
```

Interceptors могут читать эти значения из `HttpContext` запроса.

### Контекст запроса является изменяемым

В отличие от других свойств `HttpRequest`, связанный с ним `HttpContext` является _изменяемым_ (mutable). Если
interceptor изменяет контекст запроса, который позже повторяется, тот же interceptor увидит изменение контекста при
повторном запуске. Это полезно для передачи состояния между несколькими попытками, если это необходимо.

## Синтетические ответы

Большинство interceptors просто вызывают обработчик `next`, преобразовывая либо запрос, либо ответ, но это не является
строгим требованием. В этом разделе рассматриваются несколько способов, с помощью которых interceptor может реализовать
более сложное поведение.

Interceptors не обязаны вызывать `next`. Вместо этого они могут решить создать ответ с помощью другого механизма,
например, из кэша или отправив запрос через альтернативный механизм.

Создание ответа возможно с помощью конструктора `HttpResponse`:

```ts
const resp = new HttpResponse({
  body: 'response body',
});
```

## Работа с информацией о перенаправлении

При использовании `HttpClient` с провайдером `withFetch`, ответы включают свойство `redirected`, которое указывает, был
ли ответ результатом перенаправления. Это свойство соответствует спецификации нативного Fetch API и может быть полезно в
interceptors для обработки сценариев перенаправления.

Interceptor может получить доступ к информации о перенаправлении и действовать на её основе:

```ts
export function redirectTrackingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  return next(req).pipe(tap(event => {
    if (event.type === HttpEventType.Response && event.redirected) {
      console.log('Request to', req.url, 'was redirected to', event.url);
      // Handle redirect logic - maybe update analytics, security checks, etc.
    }
  }));
}
```

Вы также можете использовать информацию о перенаправлении для реализации условной логики в ваших interceptors:

```ts
export function authRedirectInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  return next(req).pipe(tap(event => {
    if (event.type === HttpEventType.Response && event.redirected) {
      // Check if we were redirected to a login page
      if (event.url?.includes('/login')) {
        // Handle authentication redirect
        handleAuthRedirect();
      }
    }
  }));
}
```

## Работа с типами ответов

При использовании `HttpClient` с провайдером `withFetch`, ответы включают свойство `type`, которое указывает, как
браузер обработал ответ на основе политик CORS и режима запроса. Это свойство соответствует спецификации нативного Fetch
API и предоставляет ценную информацию для отладки проблем CORS и понимания доступности ответа.

Свойство `type` ответа может иметь следующие значения:

- `'basic'` — Ответ с того же источника (same-origin) со всеми доступными заголовками.
- `'cors'` — Ответ с другого источника (cross-origin) с правильно настроенными заголовками CORS.
- `'opaque'` — Ответ с другого источника без CORS, заголовки и тело могут быть ограничены.
- `'opaqueredirect'` — Ответ от перенаправленного запроса в режиме no-cors.
- `'error'` — Произошла сетевая ошибка.

Interceptor может использовать информацию о типе ответа для отладки CORS и обработки ошибок:

```ts
export function responseTypeInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  return next(req).pipe(map(event => {
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
  }));
}
```

## Interceptors на основе DI {#di-based-interceptors}

`HttpClient` также поддерживает interceptors, определенные как инъектируемые классы и настроенные через систему DI.
Возможности interceptors на основе DI идентичны возможностям функциональных interceptors, но механизм настройки
отличается.

Interceptor на основе DI — это инъектируемый класс, реализующий интерфейс `HttpInterceptor`:

```ts
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Request URL: ' + req.url);
    return handler.handle(req);
  }
}
```

Interceptors на основе DI настраиваются через мульти-провайдер внедрения зависимостей:

```ts
bootstrapApplication(AppComponent, {providers: [
  provideHttpClient(
    // DI-based interceptors must be explicitly enabled.
    withInterceptorsFromDi(),
  ),

  {provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true},
]});
```

Interceptors на основе DI запускаются в том порядке, в котором зарегистрированы их провайдеры. В приложении с обширной и
иерархической конфигурацией DI этот порядок может быть очень трудно предсказать.
