# Выполнение HTTP-запросов

`HttpClient` имеет методы, соответствующие различным HTTP-глаголам для выполнения запросов — как для загрузки данных, так и для применения мутаций на сервере. Каждый метод возвращает [RxJS `Observable`](https://rxjs.dev/guide/observable), который при подписке отправляет запрос и затем эмитирует результаты, когда сервер отвечает.

NOTE: `Observable`s, созданные `HttpClient`, можно подписать любое количество раз, и каждая подписка инициирует новый запрос к бэкенду.

Через объект options, передаваемый методу запроса, можно настроить различные свойства запроса и тип возвращаемого ответа.

## Получение JSON-данных {#fetching-json-data}

Получение данных от бэкенда часто требует GET-запроса с использованием метода [`HttpClient.get()`](api/common/http/HttpClient#get). Этот метод принимает два аргумента: строковый URL эндпоинта и _необязательный объект options_ для настройки запроса.

Например, для получения конфигурационных данных из гипотетического API с помощью метода `HttpClient.get()`:

```ts
http.get<Config>('/api/config').subscribe((config) => {
  // process the configuration.
});
```

Обратите внимание на аргумент обобщённого типа, указывающий, что данные, возвращаемые сервером, будут иметь тип `Config`. Этот аргумент необязателен; если его опустить, возвращаемые данные будут иметь тип `Object`.

TIP: При работе с данными неопределённой структуры и возможными значениями `undefined` или `null` рассмотрите использование типа `unknown` вместо `Object` в качестве типа ответа.

CRITICAL: Обобщённый тип методов запроса является **утверждением** о данных, возвращаемых сервером. `HttpClient` не проверяет, соответствуют ли фактически возвращаемые данные этому типу.

## Получение данных других типов {#fetching-other-types-of-data}

По умолчанию `HttpClient` предполагает, что серверы возвращают JSON-данные. При взаимодействии с не-JSON API можно указать `HttpClient`, какой тип ответа ожидать и возвращать при выполнении запроса. Это делается с помощью параметра `responseType`.

| **Значение `responseType`** | **Тип возвращаемого ответа**                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `'json'` (по умолчанию)     | JSON-данные заданного обобщённого типа                                                                                                      |
| `'text'`                    | строковые данные                                                                                                                            |
| `'arraybuffer'`             | [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), содержащий необработанные байты ответа |
| `'blob'`                    | экземпляр [`Blob`](https://developer.mozilla.org/docs/Web/API/Blob)                                                                         |

Например, можно попросить `HttpClient` скачать необработанные байты изображения `.jpeg` в `ArrayBuffer`:

```ts
http.get('/images/dog.jpg', {responseType: 'arraybuffer'}).subscribe((buffer) => {
  console.log('The image is ' + buffer.byteLength + ' bytes large');
});
```

<docs-callout important title="Литеральное значение для `responseType`">
Поскольку значение `responseType` влияет на тип, возвращаемый `HttpClient`, оно должно иметь литеральный тип, а не тип `string`.

Это происходит автоматически, если объект options, передаваемый методу запроса, является литеральным объектом. Однако если вы выносите параметры запроса в переменную или вспомогательный метод, может потребоваться явно указать литерал, например `responseType: 'text' as const`.
</docs-callout>

## Изменение состояния сервера {#mutating-server-state}

Серверные API, выполняющие мутации, часто требуют POST-запросов с телом запроса, указывающим новое состояние или изменение.

Метод [`HttpClient.post()`](api/common/http/HttpClient#post) ведёт себя аналогично `get()` и принимает дополнительный аргумент `body` перед параметрами:

```ts
http.post<Config>('/api/config', newConfig).subscribe((config) => {
  console.log('Updated config:', config);
});
```

В качестве тела запроса `body` можно передавать различные типы значений; `HttpClient` сериализует их соответствующим образом:

| **Тип `body`**                                                                                                                | **Сериализуется как**                                |
| ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| string                                                                                                                        | Обычный текст                                        |
| number, boolean, array или обычный объект                                                                                     | JSON                                                 |
| [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)                       | необработанные данные из буфера                      |
| [`Blob`](https://developer.mozilla.org/docs/Web/API/Blob)                                                                     | необработанные данные с типом содержимого `Blob`     |
| [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData)                                                             | данные в кодировке `multipart/form-data`             |
| [`HttpParams`](api/common/http/HttpParams) или [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) | строка в формате `application/x-www-form-urlencoded` |

IMPORTANT: Не забудьте вызвать `.subscribe()` для `Observable`s запросов мутации, чтобы запрос действительно был отправлен.

## Задание параметров URL {#setting-url-parameters}

Параметры запроса, которые должны быть включены в URL запроса, задаются с помощью параметра `params`.

Передача литерального объекта — самый простой способ настройки URL-параметров:

```ts
http
  .get('/api/config', {
    params: {filter: 'all'},
  })
  .subscribe((config) => {
    // ...
  });
```

Также можно передать экземпляр `HttpParams`, если требуется больший контроль над построением или сериализацией параметров.

IMPORTANT: Экземпляры `HttpParams` _неизменяемы_ и не могут быть изменены напрямую. Вместо этого методы мутации, такие как `append()`, возвращают новый экземпляр `HttpParams` с применённым изменением.

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

Можно инстанцировать `HttpParams` с пользовательским `HttpParameterCodec`, определяющим, как `HttpClient` будет кодировать параметры в URL.

### Пользовательское кодирование параметров {#custom-parameter-encoding}

По умолчанию `HttpParams` использует встроенный [`HttpUrlEncodingCodec`](api/common/http/HttpUrlEncodingCodec) для кодирования и декодирования ключей и значений параметров.

Можно предоставить собственную реализацию [`HttpParameterCodec`](api/common/http/HttpParameterCodec) для настройки кодирования и декодирования.

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

Заголовки запроса, которые должны быть включены в запрос, задаются с помощью параметра `headers`.

Передача литерального объекта — самый простой способ настройки заголовков запроса:

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

Также можно передать экземпляр `HttpHeaders`, если требуется больший контроль над построением заголовков.

IMPORTANT: Экземпляры `HttpHeaders` _неизменяемы_ и не могут быть изменены напрямую. Вместо этого методы мутации, такие как `append()`, возвращают новый экземпляр `HttpHeaders` с применённым изменением.

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

Для удобства `HttpClient` по умолчанию возвращает `Observable` данных, возвращаемых сервером (тело ответа). Иногда желательно исследовать сам ответ, например для получения конкретных заголовков ответа.

Для доступа к полному ответу установите параметр `observe` в значение `'response'`:

```ts
http.get<Config>('/api/config', {observe: 'response'}).subscribe((res) => {
  console.log('Response status:', res.status);
  console.log('Body:', res.body);
});
```

<docs-callout important title="Литеральное значение для `observe`">
Поскольку значение `observe` влияет на тип, возвращаемый `HttpClient`, оно должно иметь литеральный тип, а не тип `string`.

Это происходит автоматически, если объект options, передаваемый методу запроса, является литеральным объектом. Однако если вы выносите параметры запроса в переменную или вспомогательный метод, может потребоваться явно указать литерал, например `observe: 'response' as const`.
</docs-callout>

## Получение необработанных событий прогресса {#receiving-raw-progress-events}

Помимо тела ответа или объекта ответа, `HttpClient` также может возвращать поток необработанных _событий_, соответствующих конкретным моментам жизненного цикла запроса. Эти события включают момент отправки запроса, получения заголовка ответа и завершения тела. Они также могут включать _события прогресса_, сообщающие о статусе загрузки и скачивания для больших тел запроса или ответа.

События прогресса отключены по умолчанию (так как имеют накладные расходы на производительность), но могут быть включены с помощью параметра `reportProgress`.

NOTE: Бэкенд fetch по умолчанию в `HttpClient` не сообщает о событиях прогресса _загрузки_. Если приложению нужны события прогресса загрузки, настройте `HttpClient` с `withXhr()` в `provideHttpClient(...)`.

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

<docs-callout important title="Литеральное значение для `observe`">
Поскольку значение `observe` влияет на тип, возвращаемый `HttpClient`, оно должно иметь литеральный тип, а не тип `string`.

Это происходит автоматически, если объект options, передаваемый методу запроса, является литеральным объектом. Однако если вы выносите параметры запроса в переменную или вспомогательный метод, может потребоваться явно указать литерал, например `observe: 'events' as const`.
</docs-callout>

Каждое `HttpEvent`, сообщаемое в потоке событий, имеет свойство `type`, определяющее, что это событие представляет:

| **Значение `type`**              | **Значение события**                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| `HttpEventType.Sent`             | Запрос отправлен на сервер                                                                 |
| `HttpEventType.UploadProgress`   | `HttpUploadProgressEvent`, сообщающий о прогрессе загрузки тела запроса                   |
| `HttpEventType.ResponseHeader`   | Получена головная часть ответа, включая статус и заголовки                                 |
| `HttpEventType.DownloadProgress` | `HttpDownloadProgressEvent`, сообщающий о прогрессе скачивания тела ответа                |
| `HttpEventType.Response`         | Получен полный ответ, включая тело ответа                                                  |
| `HttpEventType.User`             | Пользовательское событие от HTTP interceptor                                               |

## Обработка ошибок запроса {#handling-request-failure}

Существуют три способа, которыми HTTP-запрос может завершиться неудачей:

- Сетевая ошибка или ошибка соединения может помешать запросу достичь бэкенд-сервера.
- Запрос не ответил вовремя при установленном параметре timeout.
- Бэкенд может получить запрос, но не обработать его, и вернуть ответ с ошибкой.

`HttpClient` захватывает все перечисленные виды ошибок в `HttpErrorResponse`, который возвращается через канал ошибок `Observable`. Сетевые ошибки и ошибки тайм-аута имеют код `status` равный `0`, а `error` является экземпляром [`ProgressEvent`](https://developer.mozilla.org/docs/Web/API/ProgressEvent). Ошибки бэкенда содержат код `status` ошибки, возвращённый бэкендом, и ответ с ошибкой в виде `error`. Исследуйте ответ для определения причины ошибки и выбора подходящего действия.

[Библиотека RxJS](https://rxjs.dev/) предлагает несколько операторов, полезных для обработки ошибок.

Оператор `catchError` можно использовать для преобразования ответа с ошибкой в значение для UI. Это значение может указать UI отобразить страницу или сообщение об ошибке и при необходимости зафиксировать причину ошибки.

Иногда временные ошибки, такие как прерывания сети, могут неожиданно вызывать сбой запроса, и простое повторение запроса позволит ему завершиться успешно. RxJS предоставляет несколько операторов _повтора_, которые автоматически повторно подписываются на неудачный `Observable` при определённых условиях. Например, оператор `retry()` автоматически пытается повторно подписаться заданное количество раз.

### Тайм-ауты {#timeouts}

Для установки тайм-аута запроса можно задать параметр `timeout` в миллисекундах вместе с другими параметрами запроса. Если бэкенд-запрос не завершится в течение указанного времени, запрос будет прерван и будет эмитирована ошибка.

NOTE: Тайм-аут применяется только к самому бэкенд HTTP-запросу, а не ко всей цепочке обработки запроса. Поэтому этот параметр не зависит от задержек, вносимых interceptors.

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

`HttpClient` Angular поддерживает расширенные параметры API fetch, которые могут улучшить производительность и пользовательский опыт. Эти параметры доступны при использовании бэкенда fetch, который применяется по умолчанию.

### Параметры fetch {#fetch-options}

Следующие параметры обеспечивают детальный контроль над поведением запроса при использовании бэкенда fetch.

#### Keep-alive соединения {#keep-alive-connections}

Параметр `keepalive` позволяет запросу пережить страницу, которая его инициировала. Это особенно полезно для аналитических запросов или запросов логирования, которые должны завершиться, даже если пользователь перешёл с этой страницы.

```ts
http
  .post('/api/analytics', analyticsData, {
    keepalive: true,
  })
  .subscribe();
```

#### Управление HTTP-кешированием {#http-caching-control}

Параметр `cache` управляет взаимодействием запроса с HTTP-кешем браузера, что может значительно улучшить производительность для повторяющихся запросов.

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

Параметр `priority` позволяет указать относительную важность запроса, помогая браузерам оптимизировать загрузку ресурсов для улучшения показателей Core Web Vitals.

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

- `'high'`: высокий приоритет, загружается рано (например, критические пользовательские данные, контент выше сгиба)
- `'low'`: низкий приоритет, загружается при наличии ресурсов (например, аналитика, предзагруженные данные)
- `'auto'`: браузер определяет приоритет на основе контекста запроса (по умолчанию)

TIP: Используйте `priority: 'high'` для запросов, влияющих на Largest Contentful Paint (LCP), и `priority: 'low'` для запросов, не влияющих на начальный пользовательский опыт.

#### Режим запроса {#request-mode}

Параметр `mode` управляет обработкой кросс-доменных запросов и определяет тип ответа.

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

- `'same-origin'`: разрешать только запросы с того же источника, завершать неудачей кросс-доменные запросы
- `'cors'`: разрешать кросс-доменные запросы с CORS (по умолчанию)
- `'no-cors'`: разрешать простые кросс-доменные запросы без CORS, ответ непрозрачный

TIP: Используйте `mode: 'same-origin'` для чувствительных запросов, которые не должны выходить за пределы одного источника.

#### Обработка перенаправлений {#redirect-handling}

Параметр `redirect` определяет, как обрабатывать ответы-перенаправления от сервера.

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
- `'error'`: обрабатывать перенаправления как ошибки
- `'manual'`: не следовать перенаправлениям автоматически, вернуть ответ перенаправления

TIP: Используйте `redirect: 'manual'`, когда нужно обрабатывать перенаправления с пользовательской логикой.

#### Обработка учётных данных {#credentials-handling}

Параметр `credentials` управляет тем, отправляются ли куки, заголовки авторизации и другие учётные данные с кросс-доменными запросами. Это особенно важно для сценариев аутентификации.

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

IMPORTANT: Параметр `withCredentials` имеет приоритет над параметром `credentials`. Если оба указаны, `withCredentials: true` всегда будет результировать в `credentials: 'include'`, независимо от явного значения `credentials`.

Доступные значения `credentials`:

- `'omit'`: никогда не отправлять учётные данные
- `'same-origin'`: отправлять учётные данные только для запросов с того же источника (по умолчанию)
- `'include'`: всегда отправлять учётные данные, даже для кросс-доменных запросов

TIP: Используйте `credentials: 'include'`, когда нужно отправлять аутентификационные куки или заголовки на другой домен с поддержкой CORS. Избегайте одновременного использования параметров `credentials` и `withCredentials` во избежание путаницы.

#### Referrer {#referrer}

Параметр `referrer` позволяет управлять тем, какая информация referrer отправляется с запросом. Это важно для обеспечения конфиденциальности и безопасности.

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

- Строку с допустимым URL: задаёт конкретный URL referrer для отправки
- Пустую строку `''`: не отправляет информацию referrer
- `'about:client'`: использует referrer по умолчанию (URL текущей страницы)

TIP: Используйте `referrer: ''` для чувствительных запросов, при которых не нужно раскрывать URL ссылающейся страницы.

#### Политика referrer {#referrer-policy}

Параметр `referrerPolicy` управляет тем, сколько информации referrer (URL страницы, выполняющей запрос) отправляется вместе с HTTP-запросом. Этот параметр влияет как на конфиденциальность, так и на аналитику, позволяя балансировать между видимостью данных и соображениями безопасности.

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

Параметр `referrerPolicy` принимает следующие значения:

- `'no-referrer'` — никогда не отправлять заголовок `Referer`.
- `'no-referrer-when-downgrade'` — отправлять referrer для запросов с того же источника и защищённых (HTTPS→HTTPS), но опускать при переходе с защищённого к менее защищённому источнику (HTTPS→HTTP).
- `'origin'` — отправлять только источник (схему, хост, порт) referrer, без пути и параметров запроса.
- `'origin-when-cross-origin'` — отправлять полный URL для запросов с того же источника, но только источник для кросс-доменных запросов.
- `'same-origin'` — отправлять полный URL для запросов с того же источника и не отправлять referrer для кросс-доменных запросов.
- `'strict-origin'` — отправлять только источник, и только если уровень безопасности протокола не понижается (например, HTTPS→HTTPS). Опускать referrer при понижении.
- `'strict-origin-when-cross-origin'` — поведение браузера по умолчанию. Отправлять полный URL для запросов с того же источника, источник для кросс-доменных запросов без понижения, и опускать referrer при понижении.
- `'unsafe-url'` — всегда отправлять полный URL (включая путь и параметры запроса). Это может раскрыть чувствительные данные и должно применяться с осторожностью.

TIP: Предпочитайте консервативные значения, такие как `'no-referrer'`, `'origin'` или `'strict-origin-when-cross-origin'` для запросов, чувствительных к конфиденциальности.

#### Целостность {#integrity}

Параметр `integrity` позволяет убедиться, что ответ не был подменён, предоставив криптографический хеш ожидаемого содержимого. Это особенно полезно при загрузке скриптов или других ресурсов с CDN.

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

IMPORTANT: Параметр `integrity` требует точного совпадения содержимого ответа с предоставленным хешем. Если содержимое не совпадает, запрос завершится сетевой ошибкой.

TIP: Используйте целостность подресурсов при загрузке критических ресурсов из внешних источников для проверки их неизменности. Генерируйте хеши с помощью инструментов, таких как `openssl`.

## Http `Observable`s {#http-observables}

Каждый метод запроса `HttpClient` создаёт и возвращает `Observable` запрошенного типа ответа. Понимание работы этих `Observable`s важно при использовании `HttpClient`.

`HttpClient` создаёт так называемые "холодные" `Observable`s в терминах RxJS, то есть реальный запрос не выполняется до тех пор, пока на `Observable` не будет подписки. Только тогда запрос действительно отправляется на сервер. Подписка на один и тот же `Observable` несколько раз будет инициировать несколько запросов к бэкенду. Каждая подписка независима.

TIP: `Observable`s `HttpClient` можно рассматривать как _шаблоны_ для реальных запросов к серверу.

После подписки отмена подписки прервёт выполняемый запрос. Это очень удобно, если `Observable` подписан через `async` pipe, так как это автоматически отменит запрос при переходе пользователя с текущей страницы. Кроме того, если использовать `Observable` с комбинатором RxJS, таким как `switchMap`, эта отмена очистит все устаревшие запросы.

После возврата ответа `Observable`s от `HttpClient` обычно завершаются (хотя interceptors могут влиять на это).

Благодаря автоматическому завершению обычно нет риска утечек памяти, если подписки `HttpClient` не очищены. Тем не менее, как и при любой асинхронной операции, настоятельно рекомендуется очищать подписки при уничтожении компонента, их использующего, поскольку иначе колбэк подписки может выполниться и столкнуться с ошибками при попытке взаимодействия с уничтоженным компонентом.

TIP: Использование `async` pipe или операции `toSignal` для подписки на `Observable`s гарантирует правильное освобождение подписок.

## Лучшие практики {#best-practices}

Хотя `HttpClient` можно внедрять и использовать непосредственно из компонентов, в целом рекомендуется создавать переиспользуемые внедряемые сервисы, которые изолируют и инкапсулируют логику доступа к данным. Например, данный `UserService` инкапсулирует логику запроса данных пользователя по его id:

```ts
@Injectable({providedIn: 'root'})
export class UserService {
  private http = inject(HttpClient);

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/user/${id}`);
  }
}
```

В компоненте можно комбинировать `@if` с `async` pipe для отображения UI с данными только после их загрузки:

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
