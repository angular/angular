# Выполнение HTTP-запросов

У `HttpClient` есть методы, соответствующие разным HTTP-глаголам, используемым для запросов — как для загрузки данных, так и для мутаций на сервере. Каждый метод возвращает [RxJS `Observable`](https://rxjs.dev/guide/observable), который при подписке отправляет запрос, а затем испускает результаты, когда сервер отвечает.

NOTE: На `Observable`, созданные `HttpClient`, можно подписаться любое число раз, и для каждой подписки будет выполнен новый backend-запрос.

Через объект options, передаваемый методу запроса, можно настроить различные свойства запроса и тип возвращаемого ответа.

## Получение JSON-данных {#fetching-json-data}

Получение данных с backend часто требует GET-запроса методом [`HttpClient.get()`](api/common/http/HttpClient#get). Этот метод принимает два аргумента: строковый URL endpoint, с которого нужно получить данные, и _необязательный объект options_ для настройки запроса.

Например, чтобы получить конфигурационные данные из гипотетического API методом `HttpClient.get()`:

```ts
http.get<Config>('/api/config').subscribe((config) => {
  // process the configuration.
});
```

Обратите внимание на generic type argument, который указывает, что данные, возвращаемые сервером, будут типа `Config`. Этот аргумент необязателен: если его опустить, возвращаемые данные будут иметь тип `Object`.

TIP: При работе с данными неопределённой структуры и возможными значениями `undefined` или `null` рассмотрите использование типа `unknown` вместо `Object` в качестве типа ответа.

CRITICAL: Generic type методов запроса — это **утверждение** о данных, возвращаемых сервером. `HttpClient` не проверяет, что фактические возвращаемые данные соответствуют этому типу.

## Получение других типов данных {#fetching-other-types-of-data}

По умолчанию `HttpClient` предполагает, что серверы возвращают JSON-данные. При взаимодействии с не-JSON API можно указать `HttpClient`, какой тип ответа ожидать при запросе. Это делается опцией `responseType`.

| **Значение `responseType`** | **Тип возвращаемого ответа**                                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `'json'` (по умолчанию)       | JSON-данные заданного generic type                                                                                                       |
| `'text'`                 | строковые данные                                                                                                                               |
| `'arraybuffer'`          | [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) с сырыми байтами ответа |
| `'blob'`                 | экземпляр [`Blob`](https://developer.mozilla.org/docs/Web/API/Blob)                                                                        |

Например, можно попросить `HttpClient` загрузить сырые байты изображения `.jpeg` в `ArrayBuffer`:

```ts
http.get('/images/dog.jpg', {responseType: 'arraybuffer'}).subscribe((buffer) => {
  console.log('The image is ' + buffer.byteLength + ' bytes large');
});
```

<docs-callout important title="Literal value for `responseType`">
Поскольку значение `responseType` влияет на тип, возвращаемый `HttpClient`, оно должно иметь literal type, а не тип `string`.

Это происходит автоматически, если объект options, переданный методу запроса, — литеральный объект, но если вы выносите options запроса в переменную или helper-метод, может потребоваться явно указать его как литерал, например `responseType: 'text' as const`.
</docs-callout>

## Изменение состояния сервера {#mutating-server-state}

Server API, выполняющие мутации, часто требуют POST-запросов с телом запроса, указывающим новое состояние или изменение.

Метод [`HttpClient.post()`](api/common/http/HttpClient#post) ведёт себя аналогично `get()` и принимает дополнительный аргумент `body` перед options:

```ts
http.post<Config>('/api/config', newConfig).subscribe((config) => {
  console.log('Updated config:', config);
});
```

В качестве `body` запроса можно передать много разных типов значений, и `HttpClient` сериализует их соответствующим образом:

| **Тип `body`**                                                                                                               | **Сериализуется как**                                    |
| ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| string                                                                                                                        | Plain text                                           |
| number, boolean, array или plain object                                                                                       | JSON                                                 |
| [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)                       | сырые данные из буфера                             |
| [`Blob`](https://developer.mozilla.org/docs/Web/API/Blob)                                                                     | сырые данные с content type `Blob`              |
| [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData)                                                             | данные в кодировке `multipart/form-data`                   |
| [`HttpParams`](api/common/http/HttpParams) или [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) | строка в формате `application/x-www-form-urlencoded` |

IMPORTANT: Не забывайте вызывать `.subscribe()` на `Observable` мутирующих запросов, чтобы запрос действительно выполнился.

## Задание URL-параметров {#setting-url-parameters}

Укажите параметры запроса, которые должны быть включены в URL запроса, с помощью опции `params`.

Передача object literal — самый простой способ настроить URL-параметры:

```ts
http
  .get('/api/config', {
    params: {filter: 'all'},
  })
  .subscribe((config) => {
    // ...
  });
```

Либо передайте экземпляр `HttpParams`, если нужен больший контроль над построением или сериализацией параметров.

IMPORTANT: Экземпляры `HttpParams` _неизменяемы_ и не могут быть изменены напрямую. Вместо этого методы мутации, такие как `append()`, возвращают новый экземпляр `HttpParams` с применённой мутацией.

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

Можно создать `HttpParams` с пользовательским `HttpParameterCodec`, который определяет, как `HttpClient` будет кодировать параметры в URL.

### Пользовательское кодирование параметров {#custom-parameter-encoding}

По умолчанию `HttpParams` использует встроенный [`HttpUrlEncodingCodec`](api/common/http/HttpUrlEncodingCodec) для кодирования и декодирования ключей и значений параметров.

Можно предоставить собственную реализацию [`HttpParameterCodec`](api/common/http/HttpParameterCodec), чтобы настроить, как применяются кодирование и декодирование.

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

## Задание заголовков запроса {#setting-request-headers}

Укажите заголовки запроса, которые должны быть включены в запрос, с помощью опции `headers`.

Передача object literal — самый простой способ настроить заголовки запроса:

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

Либо передайте экземпляр `HttpHeaders`, если нужен больший контроль над построением заголовков.

IMPORTANT: Экземпляры `HttpHeaders` _неизменяемы_ и не могут быть изменены напрямую. Вместо этого методы мутации, такие как `append()`, возвращают новый экземпляр `HttpHeaders` с применённой мутацией.

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

Для удобства `HttpClient` по умолчанию возвращает `Observable` данных, возвращённых сервером (тело ответа). Иногда желательно изучить сам ответ, например чтобы получить конкретные заголовки ответа.

Чтобы получить доступ ко всему ответу, установите опцию `observe` в `'response'`:

```ts
http.get<Config>('/api/config', {observe: 'response'}).subscribe((res) => {
  console.log('Response status:', res.status);
  console.log('Body:', res.body);
});
```

<docs-callout important title="Literal value for `observe`">
Поскольку значение `observe` влияет на тип, возвращаемый `HttpClient`, оно должно иметь literal type, а не тип `string`.

Это происходит автоматически, если объект options, переданный методу запроса, — литеральный объект, но если вы выносите options запроса в переменную или helper-метод, может потребоваться явно указать его как литерал, например `observe: 'response' as const`.
</docs-callout>

## Получение сырых событий прогресса {#receiving-raw-progress-events}

Помимо тела ответа или объекта ответа, `HttpClient` также может возвращать поток сырых _событий_, соответствующих конкретным моментам жизненного цикла запроса. Эти события включают момент отправки запроса, возврата заголовка ответа и завершения тела. Эти события также могут включать _события прогресса_, сообщающие о статусе загрузки и скачивания для больших тел запроса или ответа.

События прогресса по умолчанию отключены (так как имеют стоимость производительности), но их можно включить опцией `reportProgress`.

NOTE: Backend fetch по умолчанию у `HttpClient` не сообщает о событиях прогресса _загрузки_ (upload). Если приложению нужны события прогресса загрузки, настройте `HttpClient` с `withXhr()` в `provideHttpClient(...)`.

Чтобы наблюдать поток событий, установите опцию `observe` в `'events'`:

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
Поскольку значение `observe` влияет на тип, возвращаемый `HttpClient`, оно должно иметь literal type, а не тип `string`.

Это происходит автоматически, если объект options, переданный методу запроса, — литеральный объект, но если вы выносите options запроса в переменную или helper-метод, может потребоваться явно указать его как литерал, например `observe: 'events' as const`.
</docs-callout>

Каждое `HttpEvent` в потоке событий имеет `type`, который различает, что представляет событие:

| **Значение `type`**                 | **Значение события**                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `HttpEventType.Sent`             | Запрос отправлен на сервер                                      |
| `HttpEventType.UploadProgress`   | `HttpUploadProgressEvent`, сообщающий о прогрессе загрузки тела запроса      |
| `HttpEventType.ResponseHeader`   | Получена голова ответа, включая статус и заголовки           |
| `HttpEventType.DownloadProgress` | `HttpDownloadProgressEvent`, сообщающий о прогрессе скачивания тела ответа |
| `HttpEventType.Response`         | Получен весь ответ, включая тело ответа                 |
| `HttpEventType.User`             | Пользовательское событие от HTTP interceptor.                                           |

## Обработка сбоев запроса {#handling-request-failure}

Есть три способа, которыми HTTP-запрос может завершиться неудачей:

- Сетевая ошибка или ошибка соединения может помешать запросу достичь backend-сервера.
- Запрос не ответил вовремя, когда была задана опция timeout.
- Backend может получить запрос, но не обработать его и вернуть ответ с ошибкой.

`HttpClient` захватывает все перечисленные виды ошибок в `HttpErrorResponse`, который возвращает через канал ошибок `Observable`. Сетевые ошибки и ошибки timeout имеют код `status` `0` и `error`, который является экземпляром [`ProgressEvent`](https://developer.mozilla.org/docs/Web/API/ProgressEvent). Ошибки backend имеют код `status` сбоя, возвращённый backend, и ответ с ошибкой в качестве `error`. Изучите ответ, чтобы определить причину ошибки и подходящее действие для её обработки.

[Библиотека RxJS](https://rxjs.dev/) предлагает несколько операторов, полезных для обработки ошибок.

Можно использовать оператор `catchError`, чтобы преобразовать ответ с ошибкой в значение для UI. Это значение может указать UI отобразить страницу или значение ошибки и при необходимости зафиксировать причину ошибки.

Иногда временные ошибки, такие как сетевые прерывания, могут неожиданно привести к сбою запроса, и простой повтор запроса позволит ему успешно выполниться. RxJS предоставляет несколько операторов _retry_, которые автоматически повторно подписываются на неудачный `Observable` при определённых условиях. Например, оператор `retry()` автоматически попытается повторно подписаться указанное число раз.

### Timeouts {#timeouts}

Чтобы задать timeout для запроса, можно установить опцию `timeout` в число миллисекунд вместе с другими options запроса. Если backend-запрос не завершится за указанное время, запрос будет прерван и будет испущена ошибка.

NOTE: Timeout применяется только к самому backend HTTP-запросу. Это не timeout для всей цепочки обработки запроса. Поэтому на эту опцию не влияют задержки, вносимые interceptors.

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

## Расширенные опции fetch {#advanced-fetch-options}

`HttpClient` Angular поддерживает расширенные опции Fetch API, которые могут улучшить производительность и пользовательский опыт. Эти опции доступны при использовании fetch backend, который используется по умолчанию.

### Опции fetch {#fetch-options}

Следующие опции дают тонкий контроль над поведением запроса при использовании fetch backend.

#### Keep-alive соединения {#keep-alive-connections}

Опция `keepalive` позволяет запросу пережить страницу, которая его инициировала. Это особенно полезно для запросов аналитики или логирования, которые должны завершиться, даже если пользователь уходит со страницы.

```ts
http
  .post('/api/analytics', analyticsData, {
    keepalive: true,
  })
  .subscribe();
```

#### Управление HTTP-кэшированием {#http-caching-control}

Опция `cache` управляет тем, как запрос взаимодействует с HTTP-кэшем браузера, что может значительно улучшить производительность повторных запросов.

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

Опция `priority` позволяет указать относительную важность запроса, помогая браузерам оптимизировать загрузку ресурсов для лучших показателей Core Web Vitals.

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

- `'high'`: Высокий приоритет, загружается рано (например, критичные данные пользователя, контент above-the-fold)
- `'low'`: Низкий приоритет, загружается, когда ресурсы доступны (например, аналитика, prefetch-данные)
- `'auto'`: Браузер определяет приоритет на основе контекста запроса (по умолчанию)

TIP: Используйте `priority: 'high'` для запросов, влияющих на Largest Contentful Paint (LCP), и `priority: 'low'` для запросов, не влияющих на начальный пользовательский опыт.

#### Режим запроса {#request-mode}

Опция `mode` управляет тем, как запрос обрабатывает cross-origin запросы, и определяет тип ответа.

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

- `'same-origin'`: Разрешать только same-origin запросы, завершать неудачей cross-origin запросы
- `'cors'`: Разрешать cross-origin запросы с CORS (по умолчанию)
- `'no-cors'`: Разрешать простые cross-origin запросы без CORS, ответ opaque

TIP: Используйте `mode: 'same-origin'` для чувствительных запросов, которые никогда не должны уходить cross-origin.

#### Обработка редиректов {#redirect-handling}

Опция `redirect` указывает, как обрабатывать ответы с редиректом от сервера.

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

- `'follow'`: Автоматически следовать редиректам (по умолчанию)
- `'error'`: Считать редиректы ошибками
- `'manual'`: Не следовать редиректам автоматически, вернуть ответ редиректа

TIP: Используйте `redirect: 'manual'`, когда нужно обрабатывать редиректы с пользовательской логикой.

#### Обработка credentials {#credentials-handling}

Опция `credentials` управляет тем, отправляются ли cookies, authorization headers и другие credentials с cross-origin запросами. Это особенно важно для сценариев аутентификации.

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

IMPORTANT: Опция `withCredentials` имеет приоритет над опцией `credentials`. Если указаны обе, `withCredentials: true` всегда приведёт к `credentials: 'include'`, независимо от явного значения `credentials`.

Доступные значения `credentials`:

- `'omit'`: Никогда не отправлять credentials
- `'same-origin'`: Отправлять credentials только для same-origin запросов (по умолчанию)
- `'include'`: Всегда отправлять credentials, даже для cross-origin запросов

TIP: Используйте `credentials: 'include'`, когда нужно отправить authentication cookies или headers на другой домен, поддерживающий CORS. Избегайте смешивания опций `credentials` и `withCredentials`, чтобы не путаться.

#### Referrer {#referrer}

Опция `referrer` позволяет управлять тем, какая информация о referrer отправляется с запросом. Это важно для соображений приватности и безопасности.

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

Опция `referrer` принимает:

- Валидную строку URL: задаёт конкретный URL referrer для отправки
- Пустую строку `''`: не отправляет информацию о referrer
- `'about:client'`: использует referrer по умолчанию (URL текущей страницы)

TIP: Используйте `referrer: ''` для чувствительных запросов, где не хотите раскрывать URL страницы-источника.

#### Политика referrer {#referrer-policy}

Опция `referrerPolicy` управляет тем, сколько информации о referrer — URL страницы, выполняющей запрос — отправляется вместе с HTTP-запросом. Этот параметр влияет и на приватность, и на аналитику, позволяя балансировать видимость данных с соображениями безопасности.

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

Опция `referrerPolicy` принимает:

- `'no-referrer'` Никогда не отправлять заголовок `Referer`.
- `'no-referrer-when-downgrade'` Отправляет referrer для same-origin и безопасных (HTTPS→HTTPS) запросов, но опускает его при переходе с безопасного на менее безопасный origin (HTTPS→HTTP).
- `'origin'` Отправляет только origin (scheme, host, port) referrer, опуская path и query.
- `'origin-when-cross-origin'` Отправляет полный URL для same-origin запросов, но только origin для cross-origin запросов.
- `'same-origin'` Отправляет полный URL для same-origin запросов и не отправляет referrer для cross-origin запросов.
- `'strict-origin'` Отправляет только origin, и только если уровень безопасности протокола не понижен (например, HTTPS→HTTPS). Опускает referrer при понижении.
- `'strict-origin-when-cross-origin'` Поведение браузера по умолчанию. Отправляет полный URL для same-origin запросов, origin для cross-origin запросов без понижения, и опускает referrer при понижении.
- `'unsafe-url'` Всегда отправляет полный URL (включая path и query). Это может раскрыть чувствительные данные и должно использоваться с осторожностью.

TIP: Для запросов, чувствительных к приватности, предпочитайте консервативные значения, такие как `'no-referrer'`, `'origin'` или `'strict-origin-when-cross-origin'`.

#### Integrity {#integrity}

Опция `integrity` позволяет проверить, что ответ не был изменён, предоставив криптографический хеш ожидаемого содержимого. Это особенно полезно при загрузке скриптов или других ресурсов с CDN.

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

IMPORTANT: Опция `integrity` требует точного совпадения между содержимым ответа и предоставленным хешем. Если содержимое не совпадает, запрос завершится сетевой ошибкой.

TIP: Используйте subresource integrity при загрузке критичных ресурсов из внешних источников, чтобы убедиться, что они не были изменены. Генерируйте хеши с помощью инструментов вроде `openssl`.

## HTTP `Observable` {#http-observables}

Каждый метод запроса на `HttpClient` создаёт и возвращает `Observable` запрошенного типа ответа. Понимание того, как работают эти `Observable`, важно при использовании `HttpClient`.

`HttpClient` создаёт то, что RxJS называет «холодными» `Observable`: фактический запрос не происходит, пока на `Observable` не подписались. Только тогда запрос действительно отправляется на сервер. Подписка на один и тот же `Observable` несколько раз вызовет несколько backend-запросов. Каждая подписка независима.

TIP: Можно думать об `Observable` `HttpClient` как о _чертежах_ фактических серверных запросов.

После подписки отписка прервёт выполняющийся запрос. Это очень полезно, если на `Observable` подписались через pipe `async`, так как запрос автоматически отменится, если пользователь уйдёт с текущей страницы. Кроме того, если использовать `Observable` с RxJS-комбинатором вроде `switchMap`, эта отмена очистит устаревшие запросы.

После возврата ответа `Observable` от `HttpClient` обычно завершаются (хотя interceptors могут на это влиять).

Из-за автоматического завершения обычно нет риска утечек памяти, если подписки `HttpClient` не очищены. Однако, как и с любой асинхронной операцией, настоятельно рекомендуется очищать подписки при уничтожении использующего их компонента, иначе callback подписки может выполниться и столкнуться с ошибками при попытке взаимодействовать с уничтоженным компонентом.

TIP: Использование pipe `async` или операции `toSignal` для подписки на `Observable` гарантирует корректную утилизацию подписок.

## Лучшие практики {#best-practices}

Хотя `HttpClient` можно внедрять и использовать напрямую из компонентов, в целом рекомендуется создавать переиспользуемые внедряемые сервисы, которые изолируют и инкапсулируют логику доступа к данным. Например, этот `UserService` инкапсулирует логику запроса данных пользователя по его id:

```ts
@Service()
export class UserService {
  private http = inject(HttpClient);

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/user/${id}`);
  }
}
```

В компоненте можно объединить `@if` с pipe `async`, чтобы отрисовать UI для данных только после завершения загрузки:

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
