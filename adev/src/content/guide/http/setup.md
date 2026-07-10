# Настройка `HttpClient`

`HttpClient` доступен для внедрения по умолчанию в Angular v21 и новее.

## Предоставление `HttpClient` через внедрение зависимостей {#providing-httpclient-through-dependency-injection}

Вспомогательную функцию `provideHttpClient` можно использовать для настройки набора HTTP-возможностей по умолчанию или добавления возможностей в `providers` приложения в `app.config.ts`.

```ts
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(/* add features here, such as withInterceptors(...) */)],
};
```

Если приложение использует bootstrap на основе NgModule, включите `provideHttpClient` в providers NgModule приложения, чтобы настроить набор HTTP-возможностей по умолчанию или добавить возможности:

```ts
@NgModule({
  providers: [provideHttpClient(/* add features here, such as withInterceptors(...) */)],
  // ... other application configuration
})
export class AppModule {}
```

Затем можно внедрить сервис `HttpClient` как зависимость компонентов, сервисов или других классов:

```ts
@Service()
export class ConfigService {
  private http = inject(HttpClient);
  // This service can now make HTTP requests via `this.http`.
}
```

## Настройка возможностей `HttpClient` {#configuring-features-of-httpclient}

`provideHttpClient` принимает список опциональных конфигураций возможностей для включения или настройки разных аспектов клиента. В этом разделе описаны опциональные возможности и их использование.

### `withXhr` {#withxhr}

```ts
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withXhr())],
};
```

По умолчанию `HttpClient` использует API [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) для запросов. Возможность `withXhr` переключает клиент на API [`XMLHttpRequest`](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest).

`fetch` — более современный API и доступен в некоторых окружениях, где `XMLHttpRequest` не поддерживается. У него есть ограничения, например отсутствие событий прогресса загрузки (upload).

<docs-callout critical title="Do not use `withXhr` in server-side rendering (SSR) environments">

Поддержка XHR на сервере **устарела** и планируется к удалению в Angular 23. Лежащая в основе библиотека `xhr2` небезопасно обрабатывает редиректы: она может пересылать заголовки `Authorization` при cross-origin редиректах и уязвима к denial-of-service (DoS) через циклы редиректов. Для SSR-приложений используйте backend `fetch` по умолчанию.

</docs-callout>

### `withInterceptors(...)` {#withinterceptors}

`withInterceptors` настраивает набор функций-interceptor'ов, которые будут обрабатывать запросы через `HttpClient`. Подробнее см. [руководство по interceptor'ам](guide/http/interceptors).

### `withInterceptorsFromDi()` {#withinterceptorsfromdi}

`withInterceptorsFromDi` включает более старый стиль классовых interceptor'ов в конфигурацию `HttpClient`. Подробнее см. [руководство по interceptor'ам](guide/http/interceptors).

HELPFUL: Функциональные interceptor'ы (через `withInterceptors`) имеют более предсказуемый порядок, и мы рекомендуем их вместо interceptor'ов на основе DI.

### `withRequestsMadeViaParent()` {#withrequestsmadeviaparent}

По умолчанию, когда вы настраиваете `HttpClient` через `provideHttpClient` в данном инжекторе, эта конфигурация переопределяет любую конфигурацию `HttpClient`, которая может быть в родительском инжекторе.

При добавлении `withRequestsMadeViaParent()` `HttpClient` настраивается так, чтобы передавать запросы вверх экземпляру `HttpClient` в родительском инжекторе после прохождения через interceptor'ы, настроенные на этом уровне. Это полезно, если нужно _добавить_ interceptor'ы в дочернем инжекторе, продолжая отправлять запрос через interceptor'ы родительского инжектора.

CRITICAL: Над текущим инжектором должен быть настроен экземпляр `HttpClient`, иначе эта опция недопустима и при попытке использования вы получите runtime-ошибку.

### `withJsonpSupport()` {#withjsonpsupport}

Включение `withJsonpSupport` включает метод `.jsonp()` у `HttpClient`, который делает GET-запрос через [соглашение JSONP](https://en.wikipedia.org/wiki/JSONP) для кросс-доменной загрузки данных.

HELPFUL: По возможности предпочитайте [CORS](https://developer.mozilla.org/docs/Web/HTTP/CORS) для кросс-доменных запросов вместо JSONP.

### `withXsrfConfiguration(...)` {#withxsrfconfiguration}

Эта опция позволяет настроить встроенную XSRF-защиту `HttpClient`. Подробнее см. [руководство по безопасности](best-practices/security).

### `withNoXsrfProtection()` {#withnoxsrfprotection}

Эта опция отключает встроенную XSRF-защиту `HttpClient`. Подробнее см. [руководство по безопасности](best-practices/security).

## Конфигурация на основе `HttpClientModule` {#httpclientmodule-based-configuration}

Некоторые приложения могут настраивать `HttpClient` через более старый API на основе NgModules.

В таблице перечислены NgModules из `@angular/common/http` и их соответствие функциям конфигурации провайдеров выше.

| **NgModule**                            | Эквивалент `provideHttpClient()`                         |
| --------------------------------------- | -------------------------------------------------------- |
| `HttpClientModule`                      | `provideHttpClient(withInterceptorsFromDi(), withXhr())` |
| `HttpClientJsonpModule`                 | `withJsonpSupport()`                                     |
| `HttpClientXsrfModule.withOptions(...)` | `withXsrfConfiguration(...)`                             |
| `HttpClientXsrfModule.disable()`        | `withNoXsrfProtection()`                                 |

<docs-callout important title="Use caution when using HttpClientModule in multiple injectors">
Когда `HttpClientModule` присутствует в нескольких инжекторах, поведение interceptor'ов плохо определено и зависит от точных опций и порядка providers/imports.

Для конфигураций с несколькими инжекторами предпочитайте `provideHttpClient` — у него более стабильное поведение. См. возможность `withRequestsMadeViaParent` выше.
</docs-callout>
