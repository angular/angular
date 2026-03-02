---
name: angular-http
description: Implement HTTP data fetching in Angular v20+ using resource(), httpResource(), and HttpClient. Use for API calls, data loading with signals, request/response handling, and interceptors. Triggers on data fetching, API integration, loading states, error handling, or converting Observable-based HTTP to signal-based patterns.
license: MIT
compatibility: Requires node, npm, and access to the internet
metadata:
  author: Brandon Roberts
  version: '1.0'
---

# Angular HTTP & Data Fetching

Fetch data in Angular using signal-based `resource()`, `httpResource()`, and the traditional `HttpClient`.

## httpResource() - Signal-Based HTTP

`httpResource()` wraps HttpClient with signal-based state management:

```typescript
import {Component, signal} from '@angular/core';
import {httpResource} from '@angular/common/http';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-user-profile',
  template: `
    @if (userResource.isLoading()) {
      <p>Loading...</p>
    } @else if (userResource.error()) {
      <p>Error: {{ userResource.error()?.message }}</p>
      <button (click)="userResource.reload()">Retry</button>
    } @else if (userResource.hasValue()) {
      <h1>{{ userResource.value().name }}</h1>
      <p>{{ userResource.value().email }}</p>
    }
  `,
})
export class UserProfile {
  userId = signal('123');

  // Reactive HTTP resource - refetches when userId changes
  userResource = httpResource<User>(() => `/api/users/${this.userId()}`);
}
```

### httpResource Options

```typescript
// Simple GET request
userResource = httpResource<User>(() => `/api/users/${this.userId()}`);

// With full request options
userResource = httpResource<User>(() => ({
  url: `/api/users/${this.userId()}`,
  method: 'GET',
  headers: {'Authorization': `Bearer ${this.token()}`},
  params: {include: 'profile'},
}));

// With default value
usersResource = httpResource<User[]>(() => '/api/users', {
  defaultValue: [],
});

// Skip request when params undefined
userResource = httpResource<User>(() => {
  const id = this.userId();
  return id ? `/api/users/${id}` : undefined;
});
```

### Resource State

```typescript
// Status signals
userResource.value(); // Current value or undefined
userResource.hasValue(); // Boolean - has resolved value
userResource.error(); // Error or undefined
userResource.isLoading(); // Boolean - currently loading
userResource.status(); // 'idle' | 'loading' | 'reloading' | 'resolved' | 'error' | 'local'

// Actions
userResource.reload(); // Manually trigger reload
userResource.set(value); // Set local value
userResource.update(fn); // Update local value
```

## resource() - Generic Async Data

For non-HTTP async operations or custom fetch logic:

```typescript
import { resource, signal } from '@angular/core';

@Component({...})
export class Search {
  query = signal('');

  searchResource = resource({
    // Reactive params - triggers reload when changed
    params: () => ({ q: this.query() }),

    // Async loader function
    loader: async ({ params, abortSignal }) => {
      if (!params.q) return [];

      const response = await fetch(`/api/search?q=${params.q}`, {
        signal: abortSignal,
      });
      return response.json() as Promise<SearchResult[]>;
    },
  });
}
```

### Resource with Default Value

```typescript
todosResource = resource({
  defaultValue: [] as Todo[],
  params: () => ({filter: this.filter()}),
  loader: async ({params}) => {
    const res = await fetch(`/api/todos?filter=${params.filter}`);
    return res.json();
  },
});

// value() returns Todo[] (never undefined)
```

### Conditional Loading

```typescript
const userId = signal<string | null>(null);

userResource = resource({
  params: () => {
    const id = userId();
    // Return undefined to skip loading
    return id ? {id} : undefined;
  },
  loader: async ({params}) => {
    return fetch(`/api/users/${params.id}`).then((r) => r.json());
  },
});
// Status is 'idle' when params returns undefined
```

## HttpClient - Traditional Approach

For complex scenarios or when you need Observable operators:

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({...})
export class Users {
  private http = inject(HttpClient);

  // Convert Observable to Signal
  users = toSignal(
    this.http.get<User[]>('/api/users'),
    { initialValue: [] }
  );

  // Or use Observable directly
  users$ = this.http.get<User[]>('/api/users');
}
```

### HTTP Methods

```typescript
private http = inject(HttpClient);

// GET
getUser(id: string) {
  return this.http.get<User>(`/api/users/${id}`);
}

// POST
createUser(user: CreateUserDto) {
  return this.http.post<User>('/api/users', user);
}

// PUT
updateUser(id: string, user: UpdateUserDto) {
  return this.http.put<User>(`/api/users/${id}`, user);
}

// PATCH
patchUser(id: string, changes: Partial<User>) {
  return this.http.patch<User>(`/api/users/${id}`, changes);
}

// DELETE
deleteUser(id: string) {
  return this.http.delete<void>(`/api/users/${id}`);
}
```

### Request Options

```typescript
this.http.get<User[]>('/api/users', {
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json',
  },
  params: {
    page: '1',
    limit: '10',
    sort: 'name',
  },
  observe: 'response', // Get full HttpResponse
  responseType: 'json',
});
```

## Interceptors

### Functional Interceptor (Recommended)

```typescript
// auth.interceptor.ts
import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const token = authService.token();

  if (token) {
    req = req.clone({
      setHeaders: {Authorization: `Bearer ${token}`},
    });
  }

  return next(req);
};

// error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        inject(Router).navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};

// logging.interceptor.ts
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const started = Date.now();
  return next(req).pipe(
    tap({
      next: () => console.log(`${req.method} ${req.url} - ${Date.now() - started}ms`),
      error: (err) => console.error(`${req.method} ${req.url} failed`, err),
    }),
  );
};
```

### Register Interceptors

```typescript
// app.config.ts
import {provideHttpClient, withInterceptors} from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, loggingInterceptor])),
  ],
};
```

## Error Handling

### With httpResource

```typescript
@Component({
  template: `
    @if (userResource.error(); as error) {
      <div class="error">
        <p>{{ getErrorMessage(error) }}</p>
        <button (click)="userResource.reload()">Retry</button>
      </div>
    }
  `,
})
export class UserCmpt {
  userResource = httpResource<User>(() => `/api/users/${this.userId()}`);

  getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }
    return 'An unexpected error occurred';
  }
}
```

### With HttpClient

```typescript
import { catchError, retry } from 'rxjs';

getUser(id: string) {
  return this.http.get<User>(`/api/users/${id}`).pipe(
    retry(2), // Retry up to 2 times
    catchError((error: HttpErrorResponse) => {
      console.error('Error fetching user:', error);
      return throwError(() => new Error('Failed to load user'));
    })
  );
}
```

## Loading States Pattern

```typescript
@Component({
  template: `
    @switch (dataResource.status()) {
      @case ('idle') {
        <p>Enter a search term</p>
      }
      @case ('loading') {
        <app-spinner />
      }
      @case ('reloading') {
        <app-data [data]="dataResource.value()" />
        <app-spinner size="small" />
      }
      @case ('resolved') {
        <app-data [data]="dataResource.value()" />
      }
      @case ('error') {
        <app-error [error]="dataResource.error()" (retry)="dataResource.reload()" />
      }
    }
  `,
})
export class Data {
  query = signal('');
  dataResource = httpResource<Data[]>(() =>
    this.query() ? `/api/search?q=${this.query()}` : undefined,
  );
}
```

For advanced patterns, see [references/http-patterns.md](references/http-patterns.md).
