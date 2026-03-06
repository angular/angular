# Выполнение HTTP-запросов {#making-http-requests}

`HttpClient` имеет методы, соответствующие различным HTTP-глаголам, используемым для выполнения запросов — как для загрузки данных, так и для применения мутаций на сервере. Каждый метод возвращает [RxJS `Observable`](https://rxjs.dev/guide/observable), который при подписке отправляет запрос и затем генерирует результаты, когда сервер отвечает.

NOTE: `Observable`-объекты, созданные `HttpClient`, можно подписать любое количество раз — каждая подписка инициирует новый запрос к бэкенду.

Через объект параметров, передаваемый методу запроса, можно настраивать различные свойства запроса и тип возвращаемого ответа.

## Получение JSON-данных {#fetching-json-data}

Получение данных от бэкенда часто требует GET-запроса с использованием метода [`HttpClient.get()`](api/common/http/HttpClient#get). Этот метод принимает два аргумента: строку URL конечной точки для получения данных и _необязательный объект параметров_ для настройки запроса.

Например, для получения данных конфигурации из гипотетического API с помощью метода `HttpClient.get()`:

```ts
http.get<Config>('/api/config').subscribe((config) => {
  // process the configuration.
});
```

Обратите внимание на аргумент обобщённого типа, указывающий, что данные, возвращаемые сервером, будут иметь тип `Config`. Этот аргумент необязателен; если его опустить, возвращаемые данные будут иметь тип `Object`.

TIP: При работе с данными неопределённой структуры и потенциальными значениями `undefined` или `null` рассмотрите использование типа `unknown` вместо `Object` в качестве типа ответа.

CRITICAL: Обобщённый тип методов запроса является **утверждением** типа о данных, возвращаемых сервером. `HttpClient` не проверяет, что фактически возвращаемые данные соответствуют этому типу.

## Получение данных других типов {#fetching-other-types-of-data}

По умолчанию `HttpClient` предполагает, что серверы возвращают JSON-данные. При взаимодействии с не-JSON API можно указать `HttpClient`, какой тип ответа ожидать и возвращать при выполнении запроса. Это делается с помощью параметра `responseType`.

| **Значение `responseType`** | **Возвращаемый тип ответа**                                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `'json'` (по умолчанию)     | JSON-данные указанного обобщённого типа                                                                                                   |
| `'text'`                    | строковые данные                                                                                                                          |
| `'arraybuffer'`             | [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) с необработанными байтами ответа |
| `'blob'`                    | экземпляр [`Blob`](https://developer.mozilla.org/docs/Web/API/Blob)                                                                       |

Например, можно попросить `HttpClient` загрузить необработанные байты изображения `.jpeg` в `ArrayBuffer`:

```ts
http.get('/images/dog.jpg', {responseType: 'arraybuffer'}).subscribe((buffer) => {
  console.log('The image is ' + buffer.byteLength + ' bytes large');
});
```

<docs-callout important title="Literal value for `responseType`">
Because the value of `responseType` affects the type returned by `HttpClient`, it must have a literal type and not a `string` type.

This happens automatically if the options object passed to the request method is a literal object, but if you're extracting the request options out into a variable or helper method you might need to explicitly specify it as a literal, such as `responseType: 'text' as const`.
</docs-callout>

## Изменение состояния сервера {#mutating-server-state}

Серверные API, выполняющие мутации, часто требуют POST-запросов с телом запроса, указывающим новое состояние или изменение, которое нужно внести.

Метод [`HttpClient.post()`](api/common/http/HttpClient#post) работает аналогично `get()` и принимает дополнительный аргумент `body` перед параметрами:

```ts
http.post<Config>('/api/config', newConfig).subscribe((config) => {
  console.log('Updated config:', config);
});
```

В качестве `body` запроса можно предоставлять различные типы значений, и `HttpClient` сериализует их соответствующим образом:

| **Тип `body`**                                                                                                                    | **Сериализуется как**                                |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| string                                                                                                                            | Обычный текст                                        |
| number, boolean, array или простой объект                                                                                         | JSON                                                 |
| [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)                           | необработанные данные из буфера                      |
| [`Blob`](https://developer.mozilla.org/docs/Web/API/Blob)                                                                         | необработанные данные с типом содержимого `Blob`     |
| [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData)                                                                 | данные в кодировке `multipart/form-data`             |
| [`HttpParams`](api/common/http/HttpParams) или [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) | строка в формате `application/x-www-form-urlencoded` |

IMPORTANT: Не забудьте вызвать `.subscribe()` на `Observable`-объектах запросов мутации, чтобы фактически отправить запрос.

## Установка параметров URL {#setting-url-parameters}

Укажите параметры запроса, которые должны быть включены в URL запроса, с помощью параметра `params`.

Передача объектного литерала — самый простой способ настройки параметров URL:

```ts
http
  .get('/api/config', {
    params: {filter: 'all'},
  })
  .subscribe((config) => {
    // ...
  });
```

Альтернативно передайте экземпляр `HttpParams`, если нужен более точный контроль над конструированием или сериализацией параметров.

IMPORTANT: Экземпляры `HttpParams` являются _неизменяемыми_ и не могут быть изменены напрямую. Вместо этого методы мутации, такие как `append()`, возвращают новый экземпляр `HttpParams` с применённой мутацией.

```ts
const baseParams = new HttpParams().set('filter', 'all');

http
  .get('/api/config', {
    params: baseParams.set('details', 'enabled'),
  })
  .subscribe((config) => {
    // ...
  });
```

Можно создать экземпляр `HttpParams` с пользовательским `HttpParameterCodec`, определяющим, как `HttpClient` будет кодировать параметры в URL.

### Пользовательское кодирование параметров {#custom-parameter-encoding}

По умолчанию `HttpParams` использует встроенный [`HttpUrlEncodingCodec`](api/common/http/HttpUrlEncodingCodec) для кодирования и декодирования ключей и значений параметров.

Можно предоставить собственную реализацию [`HttpParameterCodec`](api/common/http/HttpParameterCodec) для настройки применяемого кодирования и декодирования.

```ts
import {HttpClient, HttpParams, HttpParameterCodec} from '@angular/common/http';
import {inject} from '@angular/core';

export class CustomHttpParamEncoder implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}

export class ApiService {
  private http = inject(HttpClient);

  search() {
    const params = new HttpParams({
      encoder: new CustomHttpParamEncoder(),
    })
      .set('email', 'dev+alerts@example.com')
      .set('q', 'a & b? c/d = e');

    return this.http.get('/api/items', {params});
  }
}
```

## Установка заголовков запроса {#setting-request-headers}

Укажите заголовки запроса, которые должны быть включены в запрос, с помощью параметра `headers`.

Передача объектного литерала — самый простой способ настройки заголовков запроса:

```ts
http
  .get('/api/config', {
    headers: {
      'X-Debug-Level': 'verbose',
    },
  })
  .subscribe((config) => {
    // ...
  });
```

Альтернативно передайте экземпляр `HttpHeaders`, если нужен более точный контроль над конструированием заголовков.

IMPORTANT: Экземпляры `HttpHeaders` являются _неизменяемыми_ и не могут быть изменены напрямую. Вместо этого методы мутации, такие как `append()`, возвращают новый экземпляр `HttpHeaders` с применённой мутацией.

```ts
const baseHeaders = new HttpHeaders().set('X-Debug-Level', 'minimal');

http
  .get<Config>('/api/config', {
    headers: baseHeaders.set('X-Debug-Level', 'verbose'),
  })
  .subscribe((config) => {
    // ...
  });
```

## Взаимодействие с событиями ответа сервера {#interacting-with-the-server-response-events}

Для удобства `HttpClient` по умолчанию возвращает `Observable` данных, возвращённых сервером (тело ответа). Иногда желательно проверить фактический ответ, например, для получения определённых заголовков ответа.

Для доступа ко всему ответу установите параметр `observe` в значение `'response'`:

```ts
http.get<Config>('/api/config', {observe: 'response'}).subscribe((res) => {
  console.log('Response status:', res.status);
  console.log('Body:', res.body);
});
```

<docs-callout important title="Literal value for `observe`">
Because the value of `observe` affects the type returned by `HttpClient`, it must have a literal type and not a `string` type.

This happens automatically if the options object passed to the request method is a literal object, but if you're extracting the request options out into a variable or helper method you might need to explicitly specify it as a literal, such as `observe: 'response' as const`.
</docs-callout>

## Получение необработанных событий прогресса {#receiving-raw-progress-events}

Помимо тела ответа или объекта ответа, `HttpClient` также может возвращать поток необработанных _событий_, соответствующих конкретным моментам жизненного цикла запроса. Эти события включают момент отправки запроса, получение заголовка ответа и завершение тела ответа. Также могут быть _события прогресса_, сообщающие о статусе загрузки и скачивания для больших тел запросов или ответов.

События прогресса отключены по умолчанию (поскольку имеют производительностные издержки), но могут быть включены с помощью параметра `reportProgress`.

NOTE: Необязательная реализация `fetch` `HttpClient` не сообщает о событиях прогресса _загрузки_.

Для наблюдения за потоком событий установите параметр `observe` в значение `'events'`:

```ts
http
  .post('/api/upload', myData, {
    reportProgress: true,
    observe: 'events',
  })
  .subscribe((event) => {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        console.log('Uploaded ' + event.loaded + ' out of ' + event.total + ' bytes');
        break;
      case HttpEventType.Response:
        console.log('Finished uploading!');
        break;
    }
  });
```

<docs-callout important title="Literal value for `observe`">
Because the value of `observe` affects the type returned by `HttpClient`, it must have a literal type and not a `string` type.

This happens automatically if the options object passed to the request method is a literal object, but if you're extracting the request options out into a variable or helper method you might need to explicitly specify it as a literal, such as `observe: 'events' as const`.
</docs-callout>

Каждое `HttpEvent`, сообщаемое в потоке событий, имеет `type`, отличающий, что представляет это событие:

| **Значение `type`**              | **Значение события**                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| `HttpEventType.Sent`             | Запрос был отправлен на сервер                                                       |
| `HttpEventType.UploadProgress`   | `HttpUploadProgressEvent`, сообщающий о прогрессе загрузки тела запроса             |
| `HttpEventType.ResponseHeader`   | Заголовок ответа получен, включая статус и заголовки                                 |
| `HttpEventType.DownloadProgress` | `HttpDownloadProgressEvent`, сообщающий о прогрессе скачивания тела ответа          |
| `HttpEventType.Response`         | Весь ответ получен, включая тело ответа                                              |
| `HttpEventType.User`             | Пользовательское событие от HTTP-Interceptor.                                        |

## Обработка ошибок запроса {#handling-request-failure}

Существует три способа, которыми HTTP-запрос может завершиться неудачей:

- Сетевая ошибка или ошибка соединения может помешать запросу достичь бэкенда.
- Запрос не ответил вовремя, когда был установлен параметр тайм-аута.
- Бэкенд может получить запрос, но не смочь его обработать и вернуть ответ с ошибкой.

`HttpClient` перехватывает все вышеперечисленные ошибки в `HttpErrorResponse`, который возвращает через канал ошибок `Observable`. Сетевые ошибки и ошибки тайм-аута имеют код `status` равный `0` и `error`, который является экземпляром [`ProgressEvent`](https://developer.mozilla.org/docs/Web/API/ProgressEvent). Ошибки бэкенда имеют ненулевой код `status`, возвращённый бэкендом, и ответ с ошибкой в качестве `error`. Проверяйте ответ для определения причины ошибки и выбора подходящего способа её обработки.

[Библиотека RxJS](https://rxjs.dev/) предлагает несколько операторов, полезных для обработки ошибок.

Можно использовать оператор `catchError` для преобразования ответа об ошибке в значение для UI. Это значение может указать UI на необходимость отображения страницы ошибки или значения, и при необходимости зафиксировать причину ошибки.

Иногда временные ошибки, такие как прерывания сети, могут привести к неожиданному сбою запроса, и простая повторная попытка позволит ему завершиться успешно. RxJS предоставляет несколько операторов _повторных попыток_, которые автоматически повторно подписываются на неудавшийся `Observable` при определённых условиях. Например, оператор `retry()` автоматически попытается повторно подписаться указанное количество раз.

### Тайм-ауты {#timeouts}

Для установки тайм-аута запроса можно задать параметр `timeout` в миллисекундах вместе с другими параметрами запроса. Если бэкенд-запрос не завершится в течение указанного времени, запрос будет прерван и будет сгенерирована ошибка.

NOTE: Тайм-аут применяется только к самому бэкенд HTTP-запросу. Это не тайм-аут для всей цепочки обработки запроса. Поэтому этот параметр не зависит от задержек, вносимых Interceptor.

```ts
http
  .get('/api/config', {
    timeout: 3000,
  })
  .subscribe({
    next: (config) => {
      console.log('Config fetched successfully:', config);
    },
    error: (err) => {
      // If the request times out, an error will have been emitted.
    },
  });
```

## Расширенные параметры fetch {#advanced-fetch-options}

При использовании провайдера `withFetch()` `HttpClient` Angular предоставляет доступ к расширенным параметрам Fetch API, которые могут улучшить производительность и пользовательский опыт. Эти параметры доступны только при использовании fetch-бэкенда.

### Параметры fetch {#fetch-options}

Следующие параметры обеспечивают детальный контроль над поведением запроса при использовании fetch-бэкенда.

#### Постоянные соединения {#keep-alive-connections}

Параметр `keepalive` позволяет запросу пережить страницу, которая его инициировала. Это особенно полезно для аналитических или логирующих запросов, которые должны завершиться, даже если пользователь покинул страницу.

```ts
http
  .post('/api/analytics', analyticsData, {
    keepalive: true,
  })
  .subscribe();
```

#### Управление HTTP-кэшированием {#http-caching-control}

Параметр `cache` управляет тем, как запрос взаимодействует с HTTP-кэшем браузера, что может значительно повысить производительность для повторяющихся запросов.

```ts
//  Use cached response regardless of freshness
http
  .get('/api/config', {
    cache: 'force-cache',
  })
  .subscribe((config) => {
    // ...
  });

// Always fetch from network, bypass cache
http
  .get('/api/live-data', {
    cache: 'no-cache',
  })
  .subscribe((data) => {
    // ...
  });

// Use cached response only, fail if not in cache
http
  .get('/api/static-data', {
    cache: 'only-if-cached',
  })
  .subscribe((data) => {
    // ...
  });
```

#### Приоритет запроса для Core Web Vitals {#request-priority-for-core-web-vitals}

Параметр `priority` позволяет указать относительную важность запроса, помогая браузерам оптимизировать загрузку ресурсов для лучших показателей Core Web Vitals.

```ts
// High priority for critical resources
http
  .get('/api/user-profile', {
    priority: 'high',
  })
  .subscribe((profile) => {
    // ...
  });

// Low priority for non-critical resources
http
  .get('/api/recommendations', {
    priority: 'low',
  })
  .subscribe((recommendations) => {
    // ...
  });

// Auto priority (default) lets the browser decide
http
  .get('/api/settings', {
    priority: 'auto',
  })
  .subscribe((settings) => {
    // ...
  });
```

Доступные значения `priority`:

- `'high'`: высокий приоритет, загружается первым (например, критические данные пользователя, контент above-the-fold)
- `'low'`: низкий приоритет, загружается при наличии ресурсов (например, аналитика, данные предзагрузки)
- `'auto'`: браузер определяет приоритет на основе контекста запроса (по умолчанию)

TIP: Используйте `priority: 'high'` для запросов, влияющих на Largest Contentful Paint (LCP), и `priority: 'low'` для запросов, не влияющих на начальный пользовательский опыт.

#### Режим запроса {#request-mode}

Параметр `mode` управляет тем, как запрос обрабатывает межсайтовые запросы и определяет тип ответа.

```ts
// Same-origin requests only
http
  .get('/api/local-data', {
    mode: 'same-origin',
  })
  .subscribe((data) => {
    // ...
  });

// CORS-enabled cross-origin requests
http
  .get('https://api.external.com/data', {
    mode: 'cors',
  })
  .subscribe((data) => {
    // ...
  });

// No-CORS mode for simple cross-origin requests
http
  .get('https://external-api.com/public-data', {
    mode: 'no-cors',
  })
  .subscribe((data) => {
    // ...
  });
```

Доступные значения `mode`:

- `'same-origin'`: разрешать только запросы с одним источником, блокировать межсайтовые
- `'cors'`: разрешать межсайтовые запросы с CORS (по умолчанию)
- `'no-cors'`: разрешать простые межсайтовые запросы без CORS, ответ непрозрачен

TIP: Используйте `mode: 'same-origin'` для чувствительных запросов, которые никогда не должны быть межсайтовыми.

#### Обработка перенаправлений {#redirect-handling}

Параметр `redirect` указывает, как обрабатывать ответы с перенаправлением от сервера.

```ts
// Follow redirects automatically (default behavior)
http
  .get('/api/resource', {
    redirect: 'follow',
  })
  .subscribe((data) => {
    // ...
  });

// Prevent automatic redirects
http
  .get('/api/resource', {
    redirect: 'manual',
  })
  .subscribe((response) => {
    // Handle redirect manually
  });

// Treat redirects as errors
http
  .get('/api/resource', {
    redirect: 'error',
  })
  .subscribe({
    next: (data) => {
      // Success response
    },
    error: (err) => {
      // Redirect responses will trigger this error handler
    },
  });
```

Доступные значения `redirect`:

- `'follow'`: автоматически следовать перенаправлениям (по умолчанию)
- `'error'`: рассматривать перенаправления как ошибки
- `'manual'`: не следовать перенаправлениям автоматически, возвращать ответ с перенаправлением

TIP: Используйте `redirect: 'manual'`, если нужно обрабатывать перенаправления с пользовательской логикой.

#### Обработка учётных данных {#credentials-handling}

Параметр `credentials` управляет тем, отправляются ли куки, заголовки авторизации и другие учётные данные с межсайтовыми запросами. Это особенно важно для сценариев аутентификации.

```ts
// Include credentials for cross-origin requests
http
  .get('https://api.example.com/protected-data', {
    credentials: 'include',
  })
  .subscribe((data) => {
    // ...
  });

// Never send credentials (default for cross-origin)
http
  .get('https://api.example.com/public-data', {
    credentials: 'omit',
  })
  .subscribe((data) => {
    // ...
  });

// Send credentials only for same-origin requests
http
  .get('/api/user-data', {
    credentials: 'same-origin',
  })
  .subscribe((data) => {
    // ...
  });

// withCredentials overrides credentials setting
http
  .get('https://api.example.com/data', {
    credentials: 'omit', // This will be ignored
    withCredentials: true, // This forces credentials: 'include'
  })
  .subscribe((data) => {
    // Request will include credentials despite credentials: 'omit'
  });

// Legacy approach (still supported)
http
  .get('https://api.example.com/data', {
    withCredentials: true,
  })
  .subscribe((data) => {
    // Equivalent to credentials: 'include'
  });
```

IMPORTANT: Параметр `withCredentials` имеет приоритет над параметром `credentials`. Если оба указаны, `withCredentials: true` всегда приведёт к `credentials: 'include'`, независимо от явного значения `credentials`.

Доступные значения `credentials`:

- `'omit'`: никогда не отправлять учётные данные
- `'same-origin'`: отправлять учётные данные только для запросов с одним источником (по умолчанию)
- `'include'`: всегда отправлять учётные данные, даже для межсайтовых запросов

TIP: Используйте `credentials: 'include'`, если нужно отправлять аутентификационные куки или заголовки на другой домен с поддержкой CORS. Избегайте смешивания параметров `credentials` и `withCredentials` во избежание путаницы.

#### Реферер {#referrer}

Параметр `referrer` позволяет управлять информацией о реферере, отправляемой с запросом. Это важно для соображений конфиденциальности и безопасности.

```ts
// Send a specific referrer URL
http
  .get('/api/data', {
    referrer: 'https://example.com/page',
  })
  .subscribe((data) => {
    // ...
  });

// Use the current page as referrer (default behavior)
http
  .get('/api/analytics', {
    referrer: 'about:client',
  })
  .subscribe((data) => {
    // ...
  });
```

Параметр `referrer` принимает:

- Действительную строку URL: устанавливает конкретный URL реферера для отправки
- Пустую строку `''`: не отправлять информацию о реферере
- `'about:client'`: использовать реферер по умолчанию (URL текущей страницы)

TIP: Используйте `referrer: ''` для чувствительных запросов, когда не хотите раскрывать URL страницы-источника.

#### Политика реферера {#referrer-policy}

Параметр `referrerPolicy` управляет объёмом информации о реферере — URL страницы, делающей запрос — отправляемой с HTTP-запросом. Этот параметр влияет как на конфиденциальность, так и на аналитику, позволяя балансировать между видимостью данных и соображениями безопасности.

```ts
// Send no referrer information regardless of the current page
http
  .get('/api/data', {
    referrerPolicy: 'no-referrer',
  })
  .subscribe();

// Send origin only (e.g. https://example.com)
http
  .get('/api/analytics', {
    referrerPolicy: 'origin',
  })
  .subscribe();
```

Параметр `referrerPolicy` принимает:

- `'no-referrer'` Никогда не отправлять заголовок `Referer`.
- `'no-referrer-when-downgrade'` Отправляет реферер для запросов с одним источником и безопасных (HTTPS→HTTPS), но опускает его при переходе с безопасного на менее безопасный источник (HTTPS→HTTP).
- `'origin'` Отправляет только источник (схему, хост, порт) реферера, опуская путь и параметры запроса.
- `'origin-when-cross-origin'` Отправляет полный URL для запросов с одним источником, но только источник для межсайтовых запросов.
- `'same-origin'` Отправляет полный URL для запросов с одним источником и не отправляет реферер для межсайтовых.
- `'strict-origin'` Отправляет только источник и только если уровень безопасности протокола не снижается (например, HTTPS→HTTPS). Опускает реферер при снижении уровня.
- `'strict-origin-when-cross-origin'` Поведение браузера по умолчанию. Отправляет полный URL для запросов с одним источником, только источник для межсайтовых при отсутствии снижения уровня, и опускает реферер при снижении.
- `'unsafe-url'` Всегда отправляет полный URL (включая путь и параметры запроса). Это может раскрыть конфиденциальные данные и должно использоваться с осторожностью.

TIP: Предпочтительнее использовать консервативные значения, такие как `'no-referrer'`, `'origin'` или `'strict-origin-when-cross-origin'` для запросов, чувствительных к конфиденциальности.

#### Целостность {#integrity}

Параметр `integrity` позволяет убедиться, что ответ не был изменён, предоставляя криптографический хэш ожидаемого содержимого. Это особенно полезно при загрузке скриптов или других ресурсов из CDN.

```ts
// Verify response integrity with SHA-256 hash
http
  .get('/api/script.js', {
    integrity: 'sha256-ABC123...',
    responseType: 'text',
  })
  .subscribe((script) => {
    // Script content is verified against the hash
  });
```

IMPORTANT: Параметр `integrity` требует точного соответствия содержимого ответа и предоставленного хэша. Если содержимое не совпадает, запрос завершится с сетевой ошибкой.

TIP: Используйте целостность подресурсов при загрузке критических ресурсов из внешних источников, чтобы убедиться, что они не были изменены. Генерируйте хэши с помощью таких инструментов, как `openssl`.

## Observable-объекты Http {#http-observables}

Каждый метод запроса в `HttpClient` конструирует и возвращает `Observable` запрашиваемого типа ответа. Важно понимать, как работают эти `Observable`-объекты при использовании `HttpClient`.

`HttpClient` создаёт так называемые «холодные» `Observable`-объекты в терминах RxJS, то есть никакой реальный запрос не происходит, пока на `Observable` не подпишутся. Только тогда запрос фактически отправляется на сервер. Подписка на один и тот же `Observable` несколько раз вызовет несколько бэкенд-запросов. Каждая подписка независима.

TIP: Можно думать об `Observable`-объектах `HttpClient` как о _чертежах_ реальных серверных запросов.

После подписки отписка прервёт выполняющийся запрос. Это очень полезно, если на `Observable` подписаться через `async`-pipe: запрос будет автоматически отменён, когда пользователь покинет текущую страницу. Кроме того, если использовать `Observable` с комбинатором RxJS, таким как `switchMap`, эта отмена очистит устаревшие запросы.

После получения ответа `Observable`-объекты из `HttpClient` обычно завершаются (хотя Interceptor могут повлиять на это).

Из-за автоматического завершения обычно нет риска утечки памяти, если подписки на `HttpClient` не очищены. Тем не менее, как и в случае с любой асинхронной операцией, настоятельно рекомендуется очищать подписки при уничтожении компонента, их использующего, поскольку обратный вызов подписки в противном случае может запуститься и столкнуться с ошибками при попытке взаимодействия с уничтоженным компонентом.

TIP: Использование `async`-pipe или операции `toSignal` для подписки на `Observable`-объекты гарантирует правильное освобождение подписок.

## Лучшие практики {#best-practices}

Хотя `HttpClient` можно внедрить и использовать непосредственно из компонентов, как правило, рекомендуется создавать переиспользуемые, внедряемые сервисы, изолирующие и инкапсулирующие логику доступа к данным. Например, этот `UserService` инкапсулирует логику запроса данных пользователя по идентификатору:

```ts
@Injectable({providedIn: 'root'})
export class UserService {
  private http = inject(HttpClient);

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/user/${id}`);
  }
}
```

Внутри компонента можно комбинировать `@if` с `async`-pipe для рендеринга UI с данными только после завершения загрузки:

```angular-ts
import {AsyncPipe} from '@angular/common';

@Component({
  imports: [AsyncPipe],
  template: `
    @if (user$ | async; as user) {
      <p>Name: {{ user.name }}</p>
      <p>Biography: {{ user.biography }}</p>
    }
  `,
})
export class UserProfile {
  userId = input.required<string>();
  user$!: Observable<User>;

  private userService = inject(UserService);

  constructor(): void {
    effect(() => {
      this.user$ = this.userService.getUser(this.userId());
    });
  }
}
```
