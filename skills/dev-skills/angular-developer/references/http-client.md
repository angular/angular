# HTTP communication with `HttpClient` and `httpResource`

Use Angular's HTTP APIs for backend communication so requests participate in dependency injection, interceptors, transfer cache, and security features.

## Setup

In Angular v21 and later, `HttpClient` is available for injection by default. Add `provideHttpClient(...)` only when an app needs to configure HTTP features for a specific injector:

```ts
import {provideHttpClient, withInterceptors} from '@angular/common/http';

export const appConfig = {
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
};
```

- `HttpClient` uses the fetch backend by default.
- Use `withXhr()` only when upload progress events are required. Do not use `withXhr()` for server-side rendering.
- Use `provideHttpClient(...)` for feature configuration such as interceptors, XSRF options, XHR, or parent-request delegation.
- Calling `provideHttpClient()` with no features is not required for basic HTTP requests, but it configures the default HTTP feature set for that injector, including Angular's XSRF interceptor.
- Prefer `provideHttpClient(...)` over `HttpClientModule` for feature configuration, especially with multiple injectors.
- Use `withRequestsMadeViaParent()` when a child injector should add interceptors while still delegating to the parent HTTP chain.

## `HttpClient`

Encapsulate backend calls in injectable services, not components:

```ts
import {HttpClient} from '@angular/common/http';
import {Service, inject} from '@angular/core';

@Service()
export class UserService {
  private readonly http = inject(HttpClient);

  getUser(id: string) {
    return this.http.get<User>(`/api/users/${id}`);
  }
}
```

Important rules:

- `HttpClient` requests are cold `Observable`s. No request is sent until the `Observable` is subscribed to. Multiple subscriptions send multiple backend requests.
- Subscribe to mutation requests (`post`, `put`, `patch`, `delete`) so they execute.
- The generic type parameter is a type assertion only. Validate unknown backend data at runtime when the shape is not trusted.
- Use literal values for `responseType` and `observe`; if options are extracted, write values like `responseType: 'text' as const`.
- `HttpHeaders` and `HttpParams` are immutable; use the returned instance from `.set()` or `.append()`.
- Fetch options such as `timeout`, `cache`, `priority`, `mode`, `redirect`, `credentials`, `keepalive`, `referrer`, `referrerPolicy`, and `integrity` are supported where the backend supports them. `withCredentials: true` overrides `credentials`.
- Handle failures through `HttpErrorResponse`. Network and timeout failures use status `0`; backend failures use the server status code.
- Prefer the `async` pipe or `toSignal` for component reads so subscriptions are cleaned up.

## Interceptors

Prefer functional interceptors configured with `withInterceptors`.

```ts
import {
  HttpHandlerFn,
  HttpRequest,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  return next(req.clone({setHeaders: {Authorization: 'Bearer token'}}));
}

export const appConfig = {
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
};
```

- Interceptors run in the order listed.
- Request and response objects are mostly immutable; clone before changing them.
- Request and response bodies are not deeply immutable. Avoid in-place body mutation because retries can run the same interceptor again.
- Use `inject()` inside functional interceptors for services.
- Use `HttpContextToken` for per-request metadata that interceptors need but the backend should not receive.
- Use DI-based interceptors only for existing code, and enable them with `withInterceptorsFromDi()`.

## Security

- `HttpClient` strips the XSSI prefix from JSON responses when present.
- `provideHttpClient()` configures XSRF protection by default for mutating relative and same-origin requests. It reads the `XSRF-TOKEN` cookie and sends the `X-XSRF-TOKEN` header.
- The backend must set the XSRF cookie and verify the header. Customize names with `withXsrfConfiguration(...)`; disable only deliberately with `withNoXsrfProtection()`.

## `httpResource`

Use `httpResource` to create an asynchronous derivation that fetches data over HTTP and exposes the result as reactive signals.

```ts
import {httpResource} from '@angular/common/http';
import {input} from '@angular/core';

export class UserProfile {
  readonly userId = input.required<string>();
  readonly user = httpResource(() => `/api/users/${this.userId()}`);
}
```

- `httpResource` is eager. It sends a request when its reactive request computation runs, not when an `Observable` is subscribed.
- When a dependency changes, it cancels the pending request and sends the next one.
- Return `undefined` from the request function to skip a backend request.
- Prefer `httpResource` for reads. Use `HttpClient` directly for mutations such as `POST`, `PUT`, `PATCH`, and `DELETE`.
- Guard `value()` reads with `hasValue()`; reading `value()` while the resource is in an error state throws.
- Use `httpResource.text`, `httpResource.blob`, or `httpResource.arrayBuffer` for non-JSON responses.
- Use the `parse` option to validate or transform responses with a runtime schema.
- Read `headers()`, `statusCode()`, and `progress()` when response metadata or download progress is needed. Set `reportProgress: true` for progress events.
