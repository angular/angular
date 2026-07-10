# Тестирование запросов

Как и для любой внешней зависимости, нужно мокировать HTTP-backend, чтобы тесты могли симулировать взаимодействие с удалённым сервером. Библиотека `@angular/common/http/testing` предоставляет инструменты для захвата запросов, сделанных приложением, утверждений о них и мокирования ответов для эмуляции поведения вашего backend.

Библиотека тестирования рассчитана на паттерн, где приложение сначала выполняет код и делает запросы. Затем тест ожидает, что определённые запросы были или не были сделаны, выполняет утверждения против этих запросов и наконец предоставляет ответы, «сбрасывая» (flushing) каждый ожидаемый запрос.

Наконец, тесты могут проверить, что приложение не сделало неожиданных запросов.

## Настройка для тестирования {#setup-for-testing}

Чтобы начать тестировать использование `HttpClient`, настройте `TestBed` и включите `provideHttpClientTesting()` в настройку теста. `HttpClient` предоставляется тестовым окружением Angular, а `provideHttpClientTesting()` настраивает его на использование тестового backend вместо реальной сети. Он также предоставляет `HttpTestingController`, который вы будете использовать для взаимодействия с тестовым backend, установки ожиданий о том, какие запросы были сделаны, и сброса ответов на эти запросы. `HttpTestingController` можно внедрить из `TestBed` после настройки.

```ts
TestBed.configureTestingModule({
  providers: [
    // ... other test providers
    provideHttpClientTesting(),
  ],
});

const httpTesting = TestBed.inject(HttpTestingController);
```

Теперь когда ваши тесты делают запросы, они попадут в тестовый backend вместо обычного. Можно использовать `httpTesting` для утверждений об этих запросах.

### Настройка `HttpClient` в тестах {#configuring-httpclient-in-tests}

Если тесту нужно настроить возможности `HttpClient`, например interceptor'ы, включите `provideHttpClient(...)` перед `provideHttpClientTesting()`.
IMPORTANT: Помните, что нужно предоставлять `provideHttpClient()` **перед** `provideHttpClientTesting()`, потому что `provideHttpClientTesting()` перезапишет части `provideHttpClient()`. Обратный порядок может потенциально сломать тесты.

```ts
TestBed.configureTestingModule({
  providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
});
```

## Ожидание и ответы на запросы {#expecting-and-answering-requests}

Например, можно написать тест, который ожидает GET-запрос и предоставляет mock-ответ:

```ts
TestBed.configureTestingModule({
  providers: [ConfigService, provideHttpClientTesting()],
});

const httpTesting = TestBed.inject(HttpTestingController);

// Load `ConfigService` and request the current configuration.
const service = TestBed.inject(ConfigService);
const config$ = service.getConfig<Config>();

// `firstValueFrom` subscribes to the `Observable`, which makes the HTTP request,
// and creates a `Promise` of the response.
const configPromise = firstValueFrom(config$);

// At this point, the request is pending, and we can assert it was made
// via the `HttpTestingController`:
const req = httpTesting.expectOne('/api/config', 'Request to load the configuration');

// We can assert various properties of the request if desired.
expect(req.request.method).toBe('GET');

// Flushing the request causes it to complete, delivering the result.
req.flush(DEFAULT_CONFIG);

// We can then assert that the response was successfully delivered by the `ConfigService`:
expect(await configPromise).toEqual(DEFAULT_CONFIG);

// Finally, we can assert that no other requests were made.
httpTesting.verify();
```

NOTE: `expectOne` завершится неудачей, если тест сделал более одного запроса, соответствующего заданным критериям.

Как альтернативу утверждению на `req.method` можно использовать расширенную форму `expectOne`, чтобы также сопоставить метод запроса:

```ts
const req = httpTesting.expectOne(
  {
    method: 'GET',
    url: '/api/config',
  },
  'Request to load the configuration',
);
```

HELPFUL: API ожиданий сопоставляются с полным URL запросов, включая любые query-параметры.

Последний шаг — проверка, что не осталось незавершённых запросов — достаточно распространён, чтобы перенести его в шаг `afterEach()`:

```ts
afterEach(() => {
  // Verify that none of the tests make any extra HTTP requests.
  TestBed.inject(HttpTestingController).verify();
});
```

## Обработка более одного запроса одновременно {#handling-more-than-one-request-at-once}

Если нужно ответить на дублирующиеся запросы в тесте, используйте API `match()` вместо `expectOne()`. Он принимает те же аргументы, но возвращает массив совпадающих запросов. После возврата эти запросы удаляются из будущего сопоставления, и вы отвечаете за их flush и проверку.

```ts
const allGetRequests = httpTesting.match({method: 'GET'});
for (const req of allGetRequests) {
  // Handle responding to each request.
}
```

## Продвинутое сопоставление {#advanced-matching}

Все функции сопоставления принимают функцию-предикат для пользовательской логики сопоставления:

```ts
// Look for one request that has a request body.
const requestsWithBody = httpTesting.expectOne((req) => req.body !== null);
```

Функция `expectNone` утверждает, что ни один запрос не соответствует заданным критериям.

```ts
// Assert that no mutation requests have been issued.
httpTesting.expectNone((req) => req.method !== 'GET');
```

## Тестирование обработки ошибок {#testing-error-handling}

Следует тестировать ответы приложения, когда HTTP-запросы завершаются неудачей.

### Ошибки backend {#backend-errors}

Чтобы тестировать обработку ошибок backend (когда сервер возвращает неуспешный код статуса), сбрасывайте запросы с ответом об ошибке, эмулирующим то, что вернул бы ваш backend при сбое запроса.

```ts
const req = httpTesting.expectOne('/api/config');
req.flush('Failed!', {status: 500, statusText: 'Internal Server Error'});

// Assert that the application successfully handled the backend error.
```

### Сетевые ошибки {#network-errors}

Запросы также могут завершаться неудачей из-за сетевых ошибок, которые проявляются как ошибки `ProgressEvent`. Их можно доставить методом `error()`:

```ts
const req = httpTesting.expectOne('/api/config');
req.error(new ProgressEvent('network error!'));

// Assert that the application successfully handled the network error.
```

## Тестирование Interceptor {#testing-an-interceptor}

Следует тестировать, что ваши interceptor'ы работают в желаемых обстоятельствах.

Например, приложению может требоваться добавлять токен аутентификации, сгенерированный сервисом, к каждому исходящему запросу.
Это поведение можно обеспечить с помощью interceptor:

```ts
export function authInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);

  const clonedRequest = request.clone({
    headers: request.headers.append('X-Authentication-Token', authService.getAuthToken()),
  });
  return next(clonedRequest);
}
```

Конфигурация `TestBed` для этого interceptor должна опираться на возможность `withInterceptors`.

```ts
TestBed.configureTestingModule({
  providers: [
    AuthService,
    // Testing one interceptor at a time is recommended.
    provideHttpClient(withInterceptors([authInterceptor])),
    provideHttpClientTesting(),
  ],
});
```

`HttpTestingController` может получить экземпляр запроса, который затем можно проверить, чтобы убедиться, что запрос был изменён.

```ts
const service = TestBed.inject(AuthService);
const req = httpTesting.expectOne('/api/config');

expect(req.request.headers.get('X-Authentication-Token')).toEqual(service.getAuthToken());
```

Похожий interceptor можно реализовать с классовыми interceptor'ами:

```ts
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const clonedRequest = request.clone({
      headers: request.headers.append('X-Authentication-Token', this.authService.getAuthToken()),
    });
    return next.handle(clonedRequest);
  }
}
```

Чтобы протестировать его, конфигурация `TestBed` вместо этого должна быть:

```ts
TestBed.configureTestingModule({
  providers: [
    AuthService,
    provideHttpClient(withInterceptorsFromDi()),
    provideHttpClientTesting(),
    // We rely on the HTTP_INTERCEPTORS token to register the AuthInterceptor as an HttpInterceptor
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
  ],
});
```
