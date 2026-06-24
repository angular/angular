# Тестирование запросов

Как и в случае с любой внешней зависимостью, необходимо имитировать (mock) HTTP-бэкенд, чтобы тесты могли симулировать
взаимодействие с удаленным сервером. Библиотека `@angular/common/http/testing` предоставляет инструменты для перехвата
запросов приложения, проверки утверждений относительно них и имитации ответов для эмуляции поведения бэкенда.

Библиотека тестирования разработана для паттерна, при котором приложение сначала выполняет код и делает запросы. Затем
тест ожидает, что определенные запросы были (или не были) сделаны, выполняет проверки этих запросов и, наконец,
предоставляет ответы, "сбрасывая" (flushing) каждый ожидаемый запрос.

В конце тесты могут проверить, что приложение не сделало никаких неожиданных запросов.

## Настройка для тестирования

Чтобы начать тестирование использования `HttpClient`, настройте `TestBed` и включите `provideHttpClient()` и
`provideHttpClientTesting()` в конфигурацию теста. Это настраивает `HttpClient` на использование тестового бэкенда
вместо реальной сети. Также предоставляется `HttpTestingController`, который используется для взаимодействия с тестовым
бэкендом, установки ожиданий относительно выполненных запросов и отправки ответов на эти запросы. После настройки
`HttpTestingController` можно получить через `TestBed`.

ВАЖНО: Не забудьте указать `provideHttpClient()` **перед** `provideHttpClientTesting()`, так как
`provideHttpClientTesting()` перезаписывает части `provideHttpClient()`. Обратный порядок может привести к поломке
тестов.

```ts
TestBed.configureTestingModule({
  providers: [
    // ... другие провайдеры для тестов
    provideHttpClient(),
    provideHttpClientTesting(),
  ],
});

const httpTesting = TestBed.inject(HttpTestingController);
```

Теперь, когда ваши тесты выполняют запросы, они будут попадать на тестовый бэкенд вместо обычного. Вы можете
использовать `httpTesting` для проверки утверждений об этих запросах.

## Ожидание запросов и ответы на них

Например, можно написать тест, который ожидает выполнения GET-запроса и предоставляет имитированный ответ:

```ts
TestBed.configureTestingModule({
  providers: [
    ConfigService,
    provideHttpClient(),
    provideHttpClientTesting(),
  ],
});

const httpTesting = TestBed.inject(HttpTestingController);

// Загружаем `ConfigService` и запрашиваем текущую конфигурацию.
const service = TestBed.inject(ConfigService);
const config$ = service.getConfig<Config>();

// `firstValueFrom` подписывается на `Observable`, который выполняет HTTP-запрос,
// и создает `Promise` с ответом.
const configPromise = firstValueFrom(config$);

// В этот момент запрос находится в ожидании, и мы можем проверить, что он был сделан,
// через `HttpTestingController`:
const req = httpTesting.expectOne('/api/config', 'Request to load the configuration');

// При желании можно проверить различные свойства запроса.
expect(req.request.method).toBe('GET');

// Сброс (flushing) запроса завершает его, доставляя результат.
req.flush(DEFAULT_CONFIG);

// Затем мы можем проверить, что ответ был успешно доставлен сервисом `ConfigService`:
expect(await configPromise).toEqual(DEFAULT_CONFIG);

// Наконец, мы можем проверить, что больше никаких запросов не было сделано.
httpTesting.verify();
```

ПРИМЕЧАНИЕ: `expectOne` завершится ошибкой, если тест сделал более одного запроса, соответствующего заданным критериям.

В качестве альтернативы проверке `req.method`, можно использовать расширенную форму `expectOne`, чтобы также проверить
метод запроса:

```ts
const req = httpTesting.expectOne({
  method: 'GET',
  url: '/api/config',
}, 'Request to load the configuration');
```

ПОЛЕЗНО: API ожиданий проверяют полный URL запросов, включая любые параметры запроса (query parameters).

Последний шаг, проверка отсутствия незавершенных запросов, достаточно распространен, поэтому его можно вынести в шаг
`afterEach()`:

```ts
afterEach(() => {
  // Проверяем, что ни один из тестов не делает лишних HTTP-запросов.
  TestBed.inject(HttpTestingController).verify();
});
```

## Обработка нескольких запросов одновременно

Если в тесте необходимо ответить на дублирующиеся запросы, используйте API `match()` вместо `expectOne()`. Он принимает
те же аргументы, но возвращает массив совпадающих запросов. После возврата эти запросы удаляются из будущих проверок, и
вы несете ответственность за их завершение (flushing) и верификацию.

```ts
const allGetRequests = httpTesting.match({method: 'GET'});
for (const req of allGetRequests) {
  // Обработка ответа на каждый запрос.
}
```

## Продвинутое сопоставление

Все функции сопоставления принимают функцию-предикат для пользовательской логики проверки:

```ts
// Ищем один запрос, у которого есть тело.
const requestsWithBody = httpTesting.expectOne(req => req.body !== null);
```

Функция `expectNone` утверждает, что ни один запрос не соответствует заданным критериям.

```ts
// Проверяем, что не было отправлено запросов на изменение данных.
httpTesting.expectNone(req => req.method !== 'GET');
```

## Тестирование обработки ошибок

Следует тестировать реакцию приложения на сбои HTTP-запросов.

### Ошибки бэкенда

Чтобы протестировать обработку ошибок бэкенда (когда сервер возвращает неуспешный код статуса), завершите запросы
ответом с ошибкой, который имитирует то, что вернул бы бэкенд при сбое запроса.

```ts
const req = httpTesting.expectOne('/api/config');
req.flush('Failed!', {status: 500, statusText: 'Internal Server Error'});

// Проверяем, что приложение успешно обработало ошибку бэкенда.
```

### Сетевые ошибки

Запросы также могут завершаться неудачей из-за сетевых ошибок, которые проявляются как ошибки `ProgressEvent`. Их можно
передать с помощью метода `error()`:

```ts
const req = httpTesting.expectOne('/api/config');
req.error(new ProgressEvent('network error!'));

// Проверяем, что приложение успешно обработало сетевую ошибку.
```

## Тестирование Interceptor-а

Следует проверять, что ваши Interceptor-ы (перехватчики) работают в нужных условиях.

Например, приложению может потребоваться добавлять токен аутентификации, сгенерированный сервисом, к каждому исходящему
запросу.
Это поведение можно обеспечить с помощью Interceptor-а:

```ts
export function authInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);

  const clonedRequest = request.clone({
    headers: request.headers.append('X-Authentication-Token', authService.getAuthToken()),
  });
  return next(clonedRequest);
}
```

Конфигурация `TestBed` для этого Interceptor-а должна опираться на функцию `withInterceptors`.

```ts
TestBed.configureTestingModule({
  providers: [
    AuthService,
    // Рекомендуется тестировать по одному Interceptor-у за раз.
    provideHttpClient(withInterceptors([authInterceptor])),
    provideHttpClientTesting(),
  ],
});
```

`HttpTestingController` может получить экземпляр запроса, который затем можно проверить, чтобы убедиться, что запрос был
изменен.

```ts
const service = TestBed.inject(AuthService);
const req = httpTesting.expectOne('/api/config');

expect(req.request.headers.get('X-Authentication-Token')).toEqual(service.getAuthToken());
```

Похожий Interceptor можно реализовать с помощью Interceptor-ов на основе классов:

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

Чтобы протестировать его, конфигурация `TestBed` должна быть следующей:

```ts
TestBed.configureTestingModule({
  providers: [
    AuthService,
    provideHttpClient(withInterceptorsFromDi()),
    provideHttpClientTesting(),
    // Мы полагаемся на токен HTTP_INTERCEPTORS для регистрации AuthInterceptor в качестве HttpInterceptor
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
});
```
