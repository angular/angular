# Реактивная загрузка данных с `httpResource`

`httpResource` — реактивная обёртка вокруг `HttpClient`, которая даёт статус запроса и ответ как сигналы. Эти сигналы можно использовать с `computed`, `effect`, `linkedSignal` или любым другим реактивным API. Поскольку `httpResource` построен поверх `HttpClient`, он поддерживает те же возможности, например interceptor'ы.

Подробнее о паттерне `resource` в Angular см. [Асинхронная реактивность с `resource`](/guide/signals/resource).

## Использование `httpResource` {#using-httpresource}

TIP: `httpResource` использует глобально доступный `HttpClient`. Используйте `provideHttpClient(...)` только когда нужно настроить HTTP-возможности, например interceptor'ы или опции XSRF. Подробнее см. [Настройка HttpClient](/guide/http/setup).

HTTP-ресурс можно определить, вернув URL:

```ts
userId = input.required<string>();

user = httpResource(() => `/api/user/${userId()}`); // A reactive function as argument
```

`httpResource` реактивен: всякий раз, когда меняется один из сигналов, от которых он зависит (например, `userId`), ресурс испускает новый HTTP-запрос.
Если запрос уже выполняется, ресурс отменяет незавершённый запрос перед выдачей нового.

HELPFUL: `httpResource` отличается от `HttpClient` тем, что инициирует запрос _eagerly_. Напротив, `HttpClient` инициирует запросы только при подписке на возвращаемый `Observable`.

Для более сложных запросов можно определить объект запроса, похожий на запрос, принимаемый `HttpClient`.
Каждое свойство объекта запроса, которое должно быть реактивным, следует составлять из сигнала.

```ts
user = httpResource(() => ({
  url: `/api/user/${userId()}`,
  method: 'GET',
  headers: {
    'X-Special': 'true',
  },
  params: {
    'fast': 'yes',
  },
  reportProgress: true,
  transferCache: true,
  keepalive: true,
  mode: 'cors',
  redirect: 'error',
  priority: 'high',
  cache: 'force-cache',
  credentials: 'include',
  referrer: 'no-referrer',
  integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GhEXAMPLEKEY=',
  referrerPolicy: 'no-referrer',
}));
```

TIP: Избегайте использования `httpResource` для _мутаций_ вроде `POST` или `PUT`. Вместо этого предпочитайте напрямую использовать underlying API `HttpClient`.

Сигналы `httpResource` можно использовать в шаблоне для управления тем, какие элементы отображать.

```angular-html
@if (user.hasValue()) {
  <user-details [user]="user.value()" />
} @else if (user.error()) {
  <div>Could not load user information</div>
} @else if (user.isLoading()) {
  <div>Loading user info...</div>
}
```

HELPFUL: Чтение сигнала `value` у `resource` в состоянии ошибки выбрасывает исключение в runtime. Рекомендуется защищать чтение `value` с помощью `hasValue()`.

### Типы ответа {#response-types}

По умолчанию `httpResource` возвращает и разбирает ответ как JSON. Однако можно указать альтернативный тип возврата дополнительными функциями на `httpResource`:

```ts
httpResource.text(() => ({ … })); // returns a string in value()

httpResource.blob(() => ({ … })); // returns a Blob object in value()

httpResource.arrayBuffer(() => ({ … })); // returns an ArrayBuffer in value()
```

## Разбор и валидация ответа {#response-parsing-and-validation}

При загрузке данных может понадобиться валидировать ответы по заранее определённой схеме, часто с помощью популярных open-source библиотек вроде [Zod](https://zod.dev) или [Valibot](https://valibot.dev). Такие библиотеки валидации можно интегрировать с `httpResource`, указав опцию `parse`. Тип возврата функции `parse` определяет тип `value` ресурса.

Следующий пример использует Zod для разбора и валидации ответа [StarWars API](https://swapi.info/). Ресурс затем типизируется так же, как выходной тип разбора Zod.

```ts
const starWarsPersonSchema = z.object({
  name: z.string(),
  height: z.number({coerce: true}),
  edited: z.string().datetime(),
  films: z.array(z.string()),
});

export class CharacterViewer {
  id = signal(1);

  swPersonResource = httpResource(() => `https://swapi.info/api/people/${this.id()}`, {
    parse: starWarsPersonSchema.parse,
  });
}
```

## Тестирование httpResource {#testing-an-httpresource}

Поскольку `httpResource` — обёртка вокруг `HttpClient`, тестировать `httpResource` можно теми же API, что и `HttpClient`. Подробнее см. [Тестирование HttpClient](/guide/http/testing).

Следующий пример показывает unit-тест для кода, использующего `httpResource`.

```ts
TestBed.configureTestingModule({
  providers: [provideHttpClientTesting()],
});

const id = signal(0);
const mockBackend = TestBed.inject(HttpTestingController);
const response = httpResource(() => `/data/${id()}`, {injector: TestBed.inject(Injector)});
TestBed.tick(); // Triggers the effect
const firstRequest = mockBackend.expectOne('/data/0');
firstRequest.flush(0);

// Ensures the values are propagated to the httpResource
await TestBed.inject(ApplicationRef).whenStable();

expect(response.value()).toEqual(0);
```
