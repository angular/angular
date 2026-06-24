# Реактивное получение данных с помощью `httpResource`

ВАЖНО: `httpResource` является [экспериментальным](reference/releases#experimental). Он готов к использованию, но может
измениться до того, как станет стабильным.

`httpResource` — это реактивная обертка вокруг `HttpClient`, которая предоставляет статус запроса и ответ в виде
сигналов. Таким образом, вы можете использовать эти сигналы с `computed`, `effect`, `linkedSignal` или любым другим
реактивным API. Поскольку он построен поверх `HttpClient`, `httpResource` поддерживает все те же функции, например,
interceptors (перехватчики).

Подробнее о паттерне `resource` в Angular см. в разделе [Асинхронная реактивность с
`resource`](/guide/signals/resource).

## Использование `httpResource`

СОВЕТ: Убедитесь, что вы включили `provideHttpClient` в провайдеры вашего приложения. Подробнее см. в
разделе [Настройка HttpClient](/guide/http/setup).

Вы можете определить HTTP-ресурс, вернув URL:

```ts
userId = input.required<string>();

user = httpResource(() => `/api/user/${userId()}`); // Реактивная функция в качестве аргумента
```

`httpResource` реактивен. Это означает, что всякий раз, когда изменяется один из сигналов, от которых он зависит (
например, `userId`), ресурс отправляет новый HTTP-запрос.
Если запрос уже выполняется, ресурс отменяет текущий запрос перед отправкой нового.

ПОЛЕЗНО: `httpResource` отличается от `HttpClient` тем, что инициирует запрос _активно_ (eagerly). В отличие от него,
`HttpClient` инициирует запросы только при подписке на возвращаемый `Observable`.

Для более сложных запросов можно определить объект запроса, аналогичный тому, который принимает `HttpClient`.
Каждое свойство объекта запроса, которое должно быть реактивным, должно состоять из сигнала.

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
  cache : 'force-cache',
  credentials: 'include',
  referrer: 'no-referrer',
  integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GhEXAMPLEKEY=',
  referrerPolicy: 'no-referrer'
}));
```

СОВЕТ: Избегайте использования `httpResource` для _мутаций_, таких как `POST` или `PUT`. Вместо этого отдавайте
предпочтение прямому использованию API `HttpClient`.

Сигналы `httpResource` можно использовать в шаблоне для управления тем, какие элементы должны отображаться.

```angular-html
@if(user.hasValue()) {
  <user-details [user]="user.value()">
} @else if (user.error()) {
  <div>Could not load user information</div>
} @else if (user.isLoading()) {
  <div>Loading user info...</div>
}
```

ПОЛЕЗНО: Чтение сигнала `value` у `resource`, находящегося в состоянии ошибки, вызывает исключение во время выполнения.
Рекомендуется защищать чтение `value` с помощью проверки `hasValue()`.

### Типы ответов

По умолчанию `httpResource` возвращает и парсит ответ как JSON. Однако вы можете указать альтернативный вариант возврата
с помощью дополнительных функций в `httpResource`:

```ts
httpResource.text(() => ({ … })); // возвращает строку в value()

httpResource.blob(() => ({ … })); // возвращает объект Blob в value()

httpResource.arrayBuffer(() => ({ … })); // возвращает ArrayBuffer в value()
```

## Парсинг и валидация ответов

При получении данных может потребоваться валидация ответов по заранее определенной схеме, часто с использованием
популярных open-source библиотек, таких как [Zod](https://zod.dev) или [Valibot](https://valibot.dev). Вы можете
интегрировать подобные библиотеки валидации с `httpResource`, указав опцию `parse`. Тип возвращаемого значения функции
`parse` определяет тип `value` ресурса.

В следующем примере используется Zod для парсинга и валидации ответа от [StarWars API](https://swapi.info/). Тип ресурса
соответствует выходному типу парсинга Zod.

```ts
const starWarsPersonSchema = z.object({
  name: z.string(),
  height: z.number({ coerce: true }),
  edited: z.string().datetime(),
  films: z.array(z.string()),
});

export class CharacterViewer {
  id = signal(1);

  swPersonResource = httpResource(
    () => `https://swapi.info/api/people/${this.id()}`,
    { parse: starWarsPersonSchema.parse }
  );
}
```

## Тестирование httpResource

Поскольку `httpResource` является оберткой вокруг `HttpClient`, вы можете тестировать `httpResource` с помощью тех же
API, что и `HttpClient`. Подробнее см. в разделе [Тестирование HttpClient](/guide/http/testing).

Следующий пример показывает модульный тест для кода, использующего `httpResource`.

```ts
TestBed.configureTestingModule({
  providers: [
    provideHttpClient(),
    provideHttpClientTesting(),
  ],
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
