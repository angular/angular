# Тестирование запросов {#test-requests}

Как и для любой внешней зависимости, необходимо мокировать HTTP-бэкенд, чтобы тесты могли имитировать взаимодействие с удалённым сервером. Библиотека `@angular/common/http/testing` предоставляет инструменты для перехвата запросов, выполняемых приложением, проверки утверждений о них и мокирования ответов для эмуляции поведения бэкенда.

Библиотека тестирования разработана для паттерна, при котором приложение сначала выполняет код и делает запросы. Затем тест проверяет, были ли сделаны определённые запросы, формулирует утверждения о них, и наконец предоставляет ответы путём «сброса» (flushing) каждого ожидаемого запроса.

В конце тесты могут проверить, что приложение не сделало никаких непредвиденных запросов.

## Настройка для тестирования {#setup-for-testing}

Для начала тестирования использования `HttpClient` настройте `TestBed` и включите `provideHttpClient()` и `provideHttpClientTesting()` в настройку теста. Это настраивает `HttpClient` для использования тестового бэкенда вместо реальной сети. Также предоставляется `HttpTestingController`, который используется для взаимодействия с тестовым бэкендом, формулирования ожиданий о сделанных запросах и сброса ответов на эти запросы. `HttpTestingController` можно внедрить из `TestBed` после настройки.

IMPORTANT: Не забудьте предоставить `provideHttpClient()` **перед** `provideHttpClientTesting()`, поскольку `provideHttpClientTesting()` перезапишет части `provideHttpClient()`. Обратный порядок может нарушить работу тестов.

```ts
TestBed.configureTestingModule({
  providers: [
    // ... other test providers
    provideHttpClient(),
    provideHttpClientTesting(),
  ],
});

const httpTesting = TestBed.inject(HttpTestingController);
```

Теперь, когда тесты делают запросы, они будут попадать в тестовый бэкенд, а не в реальный. Можно использовать `httpTesting` для формулирования утверждений об этих запросах.

## Ожидание запросов и ответы на них {#expecting-and-answering-requests}

Например, можно написать тест, ожидающий GET-запроса и предоставляющий моки-ответ:

```ts
TestBed.configureTestingModule({
  providers: [ConfigService, provideHttpClient(), provideHttpClientTesting()],
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

В качестве альтернативы утверждению о `req.method` можно использовать расширенную форму `expectOne`, также проверяющую метод запроса:

```ts
const req = httpTesting.expectOne(
  {
    method: 'GET',
    url: '/api/config',
  },
  'Request to load the configuration',
);
```

HELPFUL: API ожиданий сопоставляются с полным URL запросов, включая любые параметры запроса.

Последний шаг — проверка отсутствия незавершённых запросов — достаточно распространён, чтобы перенести его в шаг `afterEach()`:

```ts
afterEach(() => {
  // Verify that none of the tests make any extra HTTP requests.
  TestBed.inject(HttpTestingController).verify();
});
```

## Обработка нескольких одновременных запросов {#handling-more-than-one-request-at-once}

Если нужно ответить на дублирующиеся запросы в тесте, используйте API `match()` вместо `expectOne()`. Он принимает те же аргументы, но возвращает массив соответствующих запросов. После возврата эти запросы удаляются из дальнейшего сопоставления, и вы несёте ответственность за их сброс и проверку.

```ts
const allGetRequests = httpTesting.match({method: 'GET'});
for (const req of allGetRequests) {
  // Handle responding to each request.
}
```

## Расширенное сопоставление {#advanced-matching}

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

Следует тестировать реакцию приложения на сбои HTTP-запросов.

### Ошибки бэкенда {#backend-errors}

Для тестирования обработки ошибок бэкенда (когда сервер возвращает неуспешный код состояния) сбрасывайте запросы с ответом об ошибке, имитирующим то, что вернул бы бэкенд при сбое запроса.

```ts
const req = httpTesting.expectOne('/api/config');
req.flush('Failed!', {status: 500, statusText: 'Internal Server Error'});

// Assert that the application successfully handled the backend error.
```

### Сетевые ошибки {#network-errors}

Запросы также могут завершаться неудачей из-за сетевых ошибок, которые проявляются как ошибки `ProgressEvent`. Их можно передать с помощью метода `error()`:

```ts
const req = httpTesting.expectOne('/api/config');
req.error(new ProgressEvent('network error!'));

// Assert that the application successfully handled the network error.
```

## Тестирование Interceptor {#testing-an-interceptor}

Следует тестировать работу Interceptor в желаемых условиях.

Например, приложению может потребоваться добавлять токен аутентификации, генерируемый сервисом, к каждому исходящему запросу.
Это поведение можно обеспечить с помощью Interceptor:

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

Конфигурация `TestBed` для этого Interceptor должна использовать функцию `withInterceptors`.

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

Аналогичный Interceptor можно реализовать с помощью Interceptor на основе класса:

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

Для его тестирования конфигурация `TestBed` должна быть следующей:

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
