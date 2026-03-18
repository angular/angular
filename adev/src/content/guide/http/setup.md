# Настройка `HttpClient` {#setting-up-httpclient}

Перед использованием `HttpClient` в приложении необходимо настроить его с помощью [внедрения зависимостей](guide/di).

## Предоставление `HttpClient` через внедрение зависимостей {#providing-httpclient-through-dependency-injection}

`HttpClient` предоставляется с помощью вспомогательной функции `provideHttpClient`, которую большинство приложений включает в `providers` приложения в файле `app.config.ts`.

```ts
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient()],
};
```

Если приложение использует NgModule-based загрузку, можно включить `provideHttpClient` в providers NgModule приложения:

```ts
@NgModule({
  providers: [provideHttpClient()],
  // ... other application configuration
})
export class AppModule {}
```

После этого сервис `HttpClient` можно внедрить как зависимость в компоненты, сервисы или другие классы:

```ts
@Injectable({providedIn: 'root'})
export class ConfigService {
  private http = inject(HttpClient);
  // This service can now make HTTP requests via `this.http`.
}
```

## Настройка функций `HttpClient` {#configuring-features-of-httpclient}

`provideHttpClient` принимает список необязательных конфигураций функций для включения или настройки различных аспектов поведения клиента. В этом разделе описаны доступные функции и их применение.

### `withXhr` {#withxhr}

```ts
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withXhr())],
};
```

По умолчанию `HttpClient` использует API [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) для выполнения запросов. Функция `withXhr` переключает клиент на использование API [`XMLHttpRequest`](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest).

`fetch` — более современный API, доступный в ряде сред, где `XMLHttpRequest` не поддерживается. Однако у него есть ограничения, например отсутствие событий прогресса загрузки.

### `withInterceptors(...)` {#withinterceptors}

`withInterceptors` настраивает набор функций-interceptors, которые будут обрабатывать запросы, выполненные через `HttpClient`. Подробнее см. в [руководстве по interceptors](guide/http/interceptors).

### `withInterceptorsFromDi()` {#withinterceptorsfromdi}

`withInterceptorsFromDi` включает interceptors старого стиля, основанные на классах, в конфигурацию `HttpClient`. Подробнее см. в [руководстве по interceptors](guide/http/interceptors).

HELPFUL: Функциональные interceptors (через `withInterceptors`) имеют более предсказуемый порядок применения, и мы рекомендуем их вместо DI-based interceptors.

### `withRequestsMadeViaParent()` {#withrequestsmadeViaparent}

По умолчанию при настройке `HttpClient` с помощью `provideHttpClient` в определённом инжекторе эта конфигурация переопределяет любую конфигурацию `HttpClient`, которая может присутствовать в родительском инжекторе.

При добавлении `withRequestsMadeViaParent()` `HttpClient` настраивается таким образом, чтобы передавать запросы экземпляру `HttpClient` в родительском инжекторе после того, как они пройдут через настроенные interceptors текущего уровня. Это полезно, если нужно _добавить_ interceptors в дочерний инжектор, при этом запросы также проходят через interceptors родительского инжектора.

CRITICAL: Выше текущего инжектора должен быть настроен экземпляр `HttpClient`, иначе данный параметр недействителен и при попытке его использовать возникнет ошибка во время выполнения.

### `withJsonpSupport()` {#withjsonpsupport}

Включение `withJsonpSupport` активирует метод `.jsonp()` на `HttpClient`, который выполняет GET-запрос по [соглашению JSONP](https://en.wikipedia.org/wiki/JSONP) для загрузки данных с других доменов.

HELPFUL: По возможности предпочитайте [CORS](https://developer.mozilla.org/docs/Web/HTTP/CORS) для межсайтовых запросов вместо JSONP.

### `withXsrfConfiguration(...)` {#withxsrfconfiguration}

Включение этой функции позволяет настроить встроенную защиту `HttpClient` от XSRF. Подробнее см. в [руководстве по безопасности](best-practices/security).

### `withNoXsrfProtection()` {#withnoxsrfprotection}

Включение этой функции отключает встроенную защиту `HttpClient` от XSRF. Подробнее см. в [руководстве по безопасности](best-practices/security).

## Конфигурация на основе `HttpClientModule` {#httpclientmodule-based-configuration}

Некоторые приложения могут настраивать `HttpClient` с помощью устаревшего API на основе NgModules.

В таблице ниже перечислены NgModules из `@angular/common/http` и их соответствие функциям конфигурации провайдеров.

| **NgModule**                            | Эквивалент `provideHttpClient()`                         |
| --------------------------------------- | -------------------------------------------------------- |
| `HttpClientModule`                      | `provideHttpClient(withInterceptorsFromDi(), withXhr())` |
| `HttpClientJsonpModule`                 | `withJsonpSupport()`                                     |
| `HttpClientXsrfModule.withOptions(...)` | `withXsrfConfiguration(...)`                             |
| `HttpClientXsrfModule.disable()`        | `withNoXsrfProtection()`                                 |

<docs-callout important title="Используйте HttpClientModule в нескольких инжекторах с осторожностью">
При наличии `HttpClientModule` в нескольких инжекторах поведение interceptors плохо определено и зависит от точных параметров и порядка провайдеров/импортов.

Предпочитайте `provideHttpClient` для конфигураций с несколькими инжекторами, так как он имеет более стабильное поведение. См. функцию `withRequestsMadeViaParent` выше.
</docs-callout>
