# Настройка `HttpClient`

Прежде чем использовать `HttpClient` в приложении, необходимо настроить его с
помощью [внедрения зависимостей (DI)](guide/di).

## Предоставление `HttpClient` через внедрение зависимостей

`HttpClient` предоставляется с помощью вспомогательной функции `provideHttpClient`, которую большинство приложений
включают в `providers` приложения в файле `app.config.ts`.

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
  ]
};
```

Если ваше приложение использует запуск (bootstrap) на основе NgModule, вы можете включить `provideHttpClient` в
провайдеры NgModule вашего приложения:

```ts
@NgModule({
  providers: [
    provideHttpClient(),
  ],
  // ... other application configuration
})
export class AppModule {}
```

Затем вы можете внедрить сервис `HttpClient` как зависимость ваших компонентов, сервисов или других классов:

```ts
@Injectable({providedIn: 'root'})
export class ConfigService {
  private http = inject(HttpClient);
  // This service can now make HTTP requests via `this.http`.
}
```

## Настройка функций `HttpClient`

`provideHttpClient` принимает список опциональных конфигураций функций для включения или настройки поведения различных
аспектов клиента. В этом разделе подробно описаны дополнительные функции и их использование.

### `withFetch`

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withFetch(),
    ),
  ]
};
```

По умолчанию `HttpClient` использует API [`XMLHttpRequest`](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest)
для выполнения запросов. Функция `withFetch` переключает клиент на использование API [
`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API).

`fetch` — это более современный API, доступный в некоторых средах, где `XMLHttpRequest` не поддерживается. У него есть
несколько ограничений, например, отсутствие событий прогресса загрузки.

### `withInterceptors(...)`

`withInterceptors` настраивает набор функций-перехватчиков (interceptors), которые будут обрабатывать запросы,
выполняемые через `HttpClient`. Дополнительную информацию см. в [руководстве по перехватчикам](guide/http/interceptors).

### `withInterceptorsFromDi()`

`withInterceptorsFromDi` включает перехватчики старого стиля (на основе классов) в конфигурацию `HttpClient`.
Дополнительную информацию см. в [руководстве по перехватчикам](guide/http/interceptors).

HELPFUL: Функциональные перехватчики (через `withInterceptors`) имеют более предсказуемый порядок выполнения, и мы
рекомендуем использовать их вместо перехватчиков на основе DI.

### `withRequestsMadeViaParent()`

По умолчанию, когда вы настраиваете `HttpClient` с помощью `provideHttpClient` внутри определенного инжектора, эта
конфигурация переопределяет любую конфигурацию для `HttpClient`, которая может присутствовать в родительском инжекторе.

При добавлении `withRequestsMadeViaParent()`, `HttpClient` настраивается на передачу запросов экземпляру `HttpClient` в
родительском инжекторе после того, как они пройдут через любые настроенные перехватчики на текущем уровне. Это полезно,
если вы хотите _добавить_ перехватчики в дочернем инжекторе, но при этом отправлять запрос и через перехватчики
родительского инжектора.

CRITICAL: Вы должны настроить экземпляр `HttpClient` выше текущего инжектора, иначе эта опция будет недействительной, и
вы получите ошибку времени выполнения при попытке её использования.

### `withJsonpSupport()`

Включение `withJsonpSupport` активирует метод `.jsonp()` в `HttpClient`, который выполняет GET-запрос
через [соглашение JSONP](https://en.wikipedia.org/wiki/JSONP) для кросс-доменной загрузки данных.

HELPFUL: По возможности предпочитайте использовать [CORS](https://developer.mozilla.org/docs/Web/HTTP/CORS) для
выполнения кросс-доменных запросов вместо JSONP.

### `withXsrfConfiguration(...)`

Включение этой опции позволяет настроить встроенную функциональность безопасности XSRF в `HttpClient`. Дополнительную
информацию см. в [руководстве по безопасности](best-practices/security).

### `withNoXsrfProtection()`

Включение этой опции отключает встроенную функциональность безопасности XSRF в `HttpClient`. Дополнительную информацию
см. в [руководстве по безопасности](best-practices/security).

## Конфигурация на основе `HttpClientModule`

Некоторые приложения могут настраивать `HttpClient`, используя старый API на основе NgModules.

В этой таблице перечислены NgModules, доступные в `@angular/common/http`, и их связь с функциями настройки провайдеров,
описанными выше.

| **NgModule**                            | Эквивалент `provideHttpClient()`              |
| --------------------------------------- | --------------------------------------------- |
| `HttpClientModule`                      | `provideHttpClient(withInterceptorsFromDi())` |
| `HttpClientJsonpModule`                 | `withJsonpSupport()`                          |
| `HttpClientXsrfModule.withOptions(...)` | `withXsrfConfiguration(...)`                  |
| `HttpClientXsrfModule.disable()`        | `withNoXsrfProtection()`                      |

<docs-callout important title="Будьте осторожны при использовании HttpClientModule в нескольких инжекторах">
Когда `HttpClientModule` присутствует в нескольких инжекторах, поведение перехватчиков определено плохо и зависит от конкретных опций и порядка провайдеров/импортов.

Предпочитайте `provideHttpClient` для конфигураций с несколькими инжекторами, так как он имеет более стабильное
поведение. См. функцию `withRequestsMadeViaParent` выше.
</docs-callout>
