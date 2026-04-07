---
name: angular-di
description: Implement dependency injection in Angular using inject(), injection tokens, and provider configuration. Use for service architecture, providing dependencies at different levels, creating injectable tokens, and managing singleton vs scoped services. Triggers on service creation, configuring providers, using injection tokens, or understanding DI hierarchy. Do not use for component templates, routing, or form handling.
license: MIT
metadata:
  author: Copyright 2026 Google LLC
  version: '1.0'
---

# Angular Dependency Injection

Configure and use dependency injection in Angular v20+ with `inject()` and providers.

## Key Principles

- **CRITICAL**: Use `inject()` function instead of constructor injection
- Design services around a single responsibility
- Use `providedIn: 'root'` for singleton services

## Basic Injection

### Using inject()

**CRITICAL**: Use `inject()` instead of constructor injection:

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';

@Component({
  selector: 'app-user-list',
  template: `...`,
})
export class UserList {
  // CORRECT - use inject()
  #http = inject(HttpClient);
  #userService = inject(UserService);

  // Can use immediately
  users = this.#userService.getUsers();
}

// WRONG - constructor injection is discouraged
// export class UserList {
//   constructor(
//     #http: HttpClient,
//     #userService: UserService
//   ) {}
// }
```

### Injectable Services

```typescript
import {Injectable, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root', // Singleton at root level
})
export class User {
    #http = inject(HttpClient);

    #users = signal<User[]>([]);
    readonly _users = this.#users.asReadonly();

    // Working with Observables
    loadUsers() {
        return this.http.get<User[]>('/api/users')
    }

    // Working with Async Streams
    async loadUsers() {
        const users = await firstValueFrom(
            this.#http.get<User[]>('/api/users')
        );
        this.#users.set(users);
    }
}
```

## Provider Scopes

### Root Level (Singleton)

```typescript
// Recommended: providedIn
@Injectable({
  providedIn: 'root',
})
export class Auth {}

// Alternative: in app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    Auth,
  ],
};
```

### Component Level (Instance per Component)

```typescript
@Component({
  selector: 'app-editor',
  providers: [EditorState], // New instance for each component
  template: `...`,
})
export class Editor {
  #editorState = inject(EditorState);
}
```

### Route Level

```typescript
export const routes: Routes = [
  {
    path: 'admin',
    providers: [Admin], // Shared within this route tree
    children: [
      { path: '', component: AdminDashboard },
      { path: 'users', component: AdminUsers },
    ],
  },
];
```

## Injection Tokens

### Creating Tokens

```typescript
import { InjectionToken } from '@angular/core';

// Simple value token
export const API_URL = new InjectionToken<string>('API_URL');

// Object token
export interface AppConfig {
  apiUrl: string;
  features: {
    darkMode: boolean;
    analytics: boolean;
  };
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

// Token with factory (self-providing)
export const WINDOW = new InjectionToken<Window>('Window', {
  providedIn: 'root',
  factory: () => window,
});

export const LOCAL_STORAGE = new InjectionToken<Storage>('LocalStorage', {
  providedIn: 'root',
  factory: () => localStorage,
});
```

### Providing Token Values

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_URL, useValue: 'https://api.example.com' },
    {
      provide: APP_CONFIG,
      useValue: {
        apiUrl: 'https://api.example.com',
        features: { darkMode: true, analytics: true },
      },
    },
  ],
};
```

### Injecting Tokens

```typescript

@Injectable({providedIn: 'root'})
export class Api {
    #apiUrl = inject(API_URL);
    #config = inject(APP_CONFIG);
    #window = inject(WINDOW);
    #httpClient = inject(HttpClient)

    postData(): string {
        return this.#httpClient.post<IUserData>(`${this.#apiUrl}`);
    }
}
```

## Provider Types

### useClass

```typescript
// Provide implementation
{ provide: Logger, useClass: ConsoleLogger }

// Conditional implementation
{
  provide: Logger,
  useClass: environment.production
    ? ProductionLogger
    : ConsoleLogger,
}
```

### useValue

```typescript
// Static values
{ provide: API_URL, useValue: 'https://api.example.com' }

// Configuration objects
{ provide: APP_CONFIG, useValue: { theme: 'dark', language: 'en' } }
```

### useFactory

```typescript
// Factory with dependencies
{
  provide: User,
  useFactory : (http: HttpClient, config: AppConfig) => {
    return new User(http, config.apiUrl);
  },
  deps: [HttpClient, APP_CONFIG],
}

// Async factory (not recommended - use provideAppInitializer)
{
  provide: CONFIG,
  useFactory: () => fetch('/config.json').then(r => r.json()),
}
```

### useExisting

```typescript
// Alias to existing provider
{ provide: AbstractLogger, useExisting: ConsoleLogger }

// Multiple tokens pointing to same instance
providers: [
  ConsoleLogger,
  { provide: Logger, useExisting: ConsoleLogger },
  { provide: ErrorLogger, useExisting: ConsoleLogger },
]
```

## Injection Options

### Optional Injection

```typescript
@Component({...})
export class My {
  // Returns null if not provided
  #analytics = inject(Analytics, { optional: true });
  
  trackEvent(name: string) {
    this.#analytics?.track(name);
  }
}
```

### Self, SkipSelf, Host

```typescript
@Component({
  providers: [Local],
})
export class Parent {
  // Only look in this component's injector
  #local = inject(Local, { self: true });
}

@Component({...})
export class Child {
  // Skip this component, look in parent
  #parentService = inject(ParentSvc, { skipSelf: true });

  // Only look up to host component
  #hostService = inject(Host, { host: true });
}
```

## Multi Providers

Collect multiple values for same token:

```typescript
// Token for multiple validators
export const VALIDATORS = new InjectionToken<Validator[]>('Validators');

// Provide multiple values
providers: [
  { provide: VALIDATORS, useClass: RequiredValidator, multi: true },
  { provide: VALIDATORS, useClass: EmailValidator, multi: true },
  { provide: VALIDATORS, useClass: MinLengthValidator, multi: true },
]

// Inject as array
@Injectable()
export class Validation {
  #validators = inject(VALIDATORS); // Validator[]
  
  validate(value: string): ValidationError[] {
    return this.#validators
      .map(v => v.validate(value))
      .filter(Boolean);
  }
}
```

### HTTP Interceptors (Multi Provider)

```typescript
// Interceptors use multi providers internally
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        loggingInterceptor,
        errorInterceptor,
      ])
    ),
  ],
};
```

## App Initializers

Run async code before app starts using `provideAppInitializer`:

```typescript
import { provideAppInitializer, inject } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    Config,
    provideAppInitializer(() => {
      const configService = inject(Config);
      return configService.loadConfig();
    }),
  ],
};
```

### Multiple Initializers

```typescript
providers: [
  provideAppInitializer(() => {
    const config = inject(Config);
    return config.load();
  }),
  provideAppInitializer(() => {
    const auth = inject(Auth);
    return auth.checkSession();
  }),
]
```

## Environment Injector

Create injectors programmatically:

```typescript
import { createEnvironmentInjector, EnvironmentInjector, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Plugin {
  #parentInjector = inject(EnvironmentInjector);
  
  loadPlugin(providers: Provider[]): EnvironmentInjector {
    return createEnvironmentInjector(providers, this.#parentInjector);
  }
}
```

## runInInjectionContext

Run code with injection context:

```typescript
import { runInInjectionContext, EnvironmentInjector, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Utility {
  #injector = inject(EnvironmentInjector);
  
  executeWithDI<T>(fn: () => T): T {
    return runInInjectionContext(this.#injector, fn);
  }
}

// Usage
utilityService.executeWithDI(() => {
  const http = inject(HttpClient);
  // Use http...
});
```

See `references/di-patterns.md` for advanced DI patterns and environment injector usage.
