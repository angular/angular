# Angular Dependency Injection Patterns

## Table of Contents
- [Injector Hierarchy & Internals](#injector-hierarchy--internals)
- [Service Patterns](#service-patterns)
- [Abstract Classes as Tokens](#abstract-classes-as-tokens)
- [Hierarchical Injection](#hierarchical-injection)
- [Dynamic Providers](#dynamic-providers)
- [Testing with DI](#testing-with-di)
- [DestroyRef and Cleanup](#destroyref-and-cleanup)

## Injector Hierarchy & Internals

### Class Hierarchy

Angular has two parallel injector trees with distinct class implementations:

```
Injector                         (abstract base class — @angular/core)
├── EnvironmentInjector          (abstract, extends Injector)
│   └── R3Injector               (concrete internal impl, extends EnvironmentInjector)
│
└── NodeInjector                 ![img.png](img.png)    (implements Injector — the "ElementInjector")
```

- **`Injector`** — abstract base class. Defines `get<T>(token)`. All injectors inherit or implement it.
- **`EnvironmentInjector`** — abstract class extending `Injector`. Represents module/environment-level injectors (root, platform, lazy-loaded routes). Adds `runInContext()` (deprecated), `destroy()`, and `onDestroy()`.
- **`R3Injector`** — the concrete class behind every `EnvironmentInjector`. The "R3" prefix means Render3 (Ivy). Created by `bootstrapApplication`, lazy routes, and `createEnvironmentInjector`. Stores providers in a `Map<ProviderToken, Record>` and tracks `ngOnDestroy` hooks.
- **`NodeInjector`** — the element-level injector tied to the DOM/component tree. Created implicitly for each component/directive element. Uses bloom filters for fast token lookups and walks `TNode`/`LView` arrays. Does **not** extend `EnvironmentInjector`.

### EnvironmentInjector vs Injector

What you get when injecting these tokens depends on **where** you inject:

| Context | `inject(EnvironmentInjector)` | `inject(Injector)` |
|---|---|---|
| `providedIn: 'root'` **service** | Root `R3Injector` | Same root `R3Injector` (identical) |
| **Component** class | Nearest `R3Injector` (root or lazy route) | The component's `NodeInjector` |

```typescript
// In a SERVICE — both resolve to the same R3Injector instance
@Injectable({ providedIn: 'root' })
export class MyService {
  #envInjector = inject(EnvironmentInjector); // root R3Injector
  #injector = inject(Injector);               // same root R3Injector
}

// In a COMPONENT — they differ
@Component({
  providers: [SomeLocalService], // only visible to NodeInjector
})
export class MyComponent {
  #envInjector = inject(EnvironmentInjector); // R3Injector — NO access to SomeLocalService
  #injector = inject(Injector);               // NodeInjector — HAS access to SomeLocalService
}
```

### Resolution Order

When a component requests a dependency, Angular resolves in two phases:

1. Walk **up** the `NodeInjector` (ElementInjector) hierarchy through parent components
2. If not found, fall back to the `R3Injector` (EnvironmentInjector) hierarchy
3. If still not found → `NullInjector` → throws error (unless `{ optional: true }`)

### R3Injector Internals

`R3Injector` is never instantiated directly — Angular creates it behind the scenes:

```typescript
// Angular source (packages/core/src/di/r3_injector.ts)
export class R3Injector extends EnvironmentInjector implements PrimitivesInjector {
  constructor(
    providers: Array<Provider | EnvironmentProviders>,
    readonly parent: Injector,
    readonly source: string | null,
    readonly scopes: Set<InjectorScope>,
  ) { ... }
}
```

Key internals:
- **Provider storage**: `Map<ProviderToken, Record>` — a `null` record means "stop searching" (tree-shakable injectors)
- **Destroy tracking**: maintains sets for `ngOnDestroy` hooks and cleanup callbacks
- **`runInContext(fn)`**: deprecated in favor of standalone `runInInjectionContext(injector, fn)`
- **Scopes**: tracks whether this is `root`, `platform`, or a child environment injector

### NodeInjector Internals

`NodeInjector` is the element-level injector tied to the Ivy rendering engine:

```typescript
// Angular source (packages/core/src/render3/di.ts)
export class NodeInjector implements Injector {
  constructor(
    private _tNode: TElementNode | TContainerNode | TElementContainerNode | null,
    private _lView: LView,
  ) {}

  get(token: any, notFoundValue?: any, flags?: InjectOptions): any {
    return getOrCreateInjectable(this._tNode, this._lView, token, ...);
  }
}
```

Key differences from `R3Injector`:
- **No `destroy()` or `runInContext()`** — only implements the base `Injector` interface
- **Bloom filters** for fast token presence checks instead of a `Map`
- **Walks `TNode`/`LView` arrays** up the component tree, not a parent injector chain
- **View provider visibility** — respects `providers` vs `viewProviders` boundaries (`<#VIEW>` logical tree)

### runInInjectionContext Scope

The injector type passed to `runInInjectionContext` determines what the closure can resolve:

```typescript
// EnvironmentInjector — only environment-scoped providers
@Injectable({ providedIn: 'root' })
export class Utility {
  #injector = inject(EnvironmentInjector);

  executeWithDI<T>(fn: () => T): T {
    return runInInjectionContext(this.#injector, fn);
    // fn() can resolve root/environment providers only
  }
}

// NodeInjector from a component — both element-level AND environment-level providers
@Component({
  providers: [EditorState],
})
export class Editor {
  #injector = inject(Injector); // NodeInjector

  runWithComponentScope<T>(fn: () => T): T {
    return runInInjectionContext(this.#injector, fn);
    // fn() can inject(EditorState) — visible via NodeInjector
  }
}
```

**Note**: `inject()` inside `runInInjectionContext` is only usable **synchronously** — not in async callbacks or after `await`.

### When to Use Which

| Scenario | Inject | Why |
|---|---|---|
| Service creating dynamic components | `EnvironmentInjector` | `createComponent()` requires it |
| Service using `runInInjectionContext` | `EnvironmentInjector` | Explicit intent, correct type |
| Component needs to pass its own scope | `Injector` | Gets `NodeInjector` with component providers |
| Component needs `createComponent` | `EnvironmentInjector` | API requires `EnvironmentInjector` type |
| Either works (root service) | `EnvironmentInjector` | More explicit, better communicates intent |

## Service Patterns

### Facade Service

Combine multiple services into a single API:

```typescript
@Injectable({ providedIn: 'root' })
export class ShopFacade {
  #productService = inject(Product);
  #cartService = inject(Cart);
  #orderService = inject(Order);

  // Expose combined state
  readonly products = this.#productService.products;
  readonly cart = this.#cartService.items;
  readonly cartTotal = this.#cartService.total;

  // Unified actions
  addToCart(productId: string, quantity: number) {
    const product = this.#productService.getById(productId);
    if (product) {
      this.#cartService.add(product, quantity);
    }
  }

  async checkout() {
    const items = this.#cartService.items();
    const order = await this.#orderService.create(items);
    this.#cartService.clear();
    return order;
  }
}
```

### State Service Pattern

```typescript
interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserState {
  #state = signal<UserState>({
    user: null,
    loading: false,
    error: null,
  });

  // Selectors
  readonly user = computed(() => this.#state().user);
  readonly loading = computed(() => this.#state().loading);
  readonly error = computed(() => this.#state().error);
  readonly isAuthenticated = computed(() => this.#state().user !== null);
  
  // Actions
  setUser(user: User) {
    this.#state.update(s => ({ ...s, user, loading: false, error: null }));
  }

  setLoading() {
    this.#state.update(s => ({ ...s, loading: true, error: null }));
  }

  setError(error: string) {
    this.#state.update(s => ({ ...s, loading: false, error }));
  }

  clear() {
    this.#state.set({ user: null, loading: false, error: null });
  }
}
```

### Repository Pattern

```typescript
// Generic repository interface
export abstract class Repository<T extends { id: string }> {
  abstract getAll(): Promise<T[]>;
  abstract getById(id: string): Promise<T | null>;
  abstract create(item: Omit<T, 'id'>): Promise<T>;
  abstract update(id: string, item: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<void>;
}

// HTTP implementation
@Injectable()
export class HttpUserRepo extends Repository<User> {
  #http = inject(HttpClient);
  #apiUrl = inject(API_URL);
 // Using promises way of doing things
  async getAll(): Promise<User[]> {
    return firstValueFrom(this.#http.get<User[]>(`${this.#apiUrl}/users`));
  }

  async getById(id: string): Promise<User | null> {
    return firstValueFrom(
      this.#http.get<User>(`${this.#apiUrl}/users/${id}`).pipe(
        catchError(() => of(null))
      )
    );
  }

  async create(user: Omit<User, 'id'>): Promise<User> {
    return firstValueFrom(this.#http.post<User>(`${this.#apiUrl}/users`, user));
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    return firstValueFrom(this.#http.patch<User>(`${this.#apiUrl}/users/${id}`, user));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.#http.delete(`${this.#apiUrl}/users/${id}`));
  }
}

// Provide implementation
{ provide: Repository, useClass: HttpUserRepo }
```

## Abstract Classes as Tokens

Use abstract classes for better type safety:

```typescript
// Abstract service definition
export abstract class Logger {
  abstract log(message: string): void;
  abstract error(message: string, error?: Error): void;
  abstract warn(message: string): void;
}

// Console implementation
@Injectable()
export class ConsoleLog extends Logger {
  log(message: string) {
    console.log(`[LOG] ${message}`);
  }
  
  error(message: string, error?: Error) {
    console.error(`[ERROR] ${message}`, error);
  }
  
  warn(message: string) {
    console.warn(`[WARN] ${message}`);
  }
}

// Remote implementation
@Injectable()
export class RemoteLog extends Logger {
  #http = inject(HttpClient);

  log(message: string) {
    this.#send('log', message);
  }

  error(message: string, error?: Error) {
    this.#send('error', message, error);
  }

  warn(message: string) {
    this.#send('warn', message);
  }

  #send(level: string, message: string, error?: Error) {
    this.#http.post('/api/logs', { level, message, error: error?.message }).subscribe();
  }
}

// Provide based on environment
{
  provide: Logger,
  useClass: environment.production ? RemoteLog : ConsoleLog,
}

// Inject using abstract class
@Injectable({ providedIn: 'root' })
export class User {
  #logger = inject(Logger);

  createUser(user: UserData) {
    this.#logger.log(`Creating user: ${user.email}`);
    // ...
  }
}
```

## Hierarchical Injection

### Component Tree Injection

```typescript
// Parent provides service
@Component({
  selector: 'app-form-container',
  providers: [FormState],
  template: `
    <app-form-header />
    <app-form-body />
    <app-form-footer />
  `,
})
export class FormContainer {
  #formState = inject(FormState);
}

// Children share same instance
@Component({
  selector: 'app-form-body',
  template: `...`,
})
export class FormBody {
  // Gets same instance as parent
  #formState = inject(FormState);
}

// Grandchildren also share
@Component({
  selector: 'app-form-field',
  template: `...`,
})
export class FormField {
  // Gets same instance from ancestor
  #formState = inject(FormState);
}
```

### viewProviders vs providers

```typescript
@Component({
  selector: 'app-tabs',
  // providers: Available to component AND content children
  providers: [TabsSvc],

  // viewProviders: Available to component AND view children only
  // NOT available to content children (<ng-content>)
  viewProviders: [InternalTabs],
  
  template: `
    <div class="tabs">
      <ng-content /> <!-- Content children can't access viewProviders -->
    </div>
  `,
})
export class Tabs {}
```

## Dynamic Providers

### Feature Flags

```typescript
export const FEATURE_FLAGS = new InjectionToken<FeatureFlags>('FeatureFlags');

interface FeatureFlags {
  newDashboard: boolean;
  betaFeatures: boolean;
  experimentalApi: boolean;
}

// Load from API
{
  provide: FEATURE_FLAGS,
  useFactory: async () => {
    const response = await fetch('/api/features');
    return response.json();
  },
}

// Use in components
@Component({...})
export class Dashboard {
  #features = inject(FEATURE_FLAGS);

  showNewDashboard = this.#features.newDashboard;
}
```

### Platform-Specific Services

```typescript
export abstract class Storage {
  abstract get(key: string): string | null;
  abstract set(key: string, value: string): void;
  abstract remove(key: string): void;
}

@Injectable()
export class BrowserStorage extends Storage {
  get(key: string) { return localStorage.getItem(key); }
  set(key: string, value: string) { localStorage.setItem(key, value); }
  remove(key: string) { localStorage.removeItem(key); }
}

@Injectable()
export class ServerStorage extends Storage {
  #store = new Map<string, string>();

  get(key: string) { return this.#store.get(key) ?? null; }
  set(key: string, value: string) { this.#store.set(key, value); }
  remove(key: string) { this.#store.delete(key); }
}

// Provide based on platform
import { PLATFORM_ID, isPlatformBrowser } from '@angular/common';

{
  provide: Storage,
  useFactory: (platformId: object) => {
    return isPlatformBrowser(platformId)
      ? new BrowserStorage()
      : new ServerStorage();
  },
  deps: [PLATFORM_ID],
}
```

## Testing with DI

### Mocking Services

```typescript
describe('UserCmpt', () => {
  let userServiceSpy: jasmine.SpyObj<User>;
  
  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('User', ['getUser', 'updateUser']);
    userServiceSpy.getUser.and.returnValue(of({ id: '1', name: 'Test' }));
    
    await TestBed.configureTestingModule({
      imports: [UserCmpt],
      providers: [
        { provide: User, useValue: userServiceSpy },
      ],
    }).compileComponents();
  });
  
  it('should load user', () => {
    const fixture = TestBed.createComponent(UserCmpt);
    fixture.detectChanges();
    
    expect(userServiceSpy.getUser).toHaveBeenCalled();
  });
});
```

### Overriding Providers

```typescript
describe('with different config', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
    .overrideProvider(APP_CONFIG, {
      useValue: { apiUrl: 'http://test-api.com' },
    })
    .compileComponents();
  });
});
```

### Testing Injection Tokens

```typescript
describe('API_URL token', () => {
  it('should provide correct URL', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: API_URL, useValue: 'https://api.test.com' },
      ],
    });
    
    const apiUrl = TestBed.inject(API_URL);
    expect(apiUrl).toBe('https://api.test.com');
  });
});
```

## DestroyRef and Cleanup

### Automatic Cleanup

```typescript
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({...})
export class Data {
  #destroyRef = inject(DestroyRef);
  #dataService = inject(DataSvc);

  constructor() {
    // Auto-unsubscribe when component destroys
    this.#dataService.data$
      .pipe(takeUntilDestroyed())
      .subscribe(data => {
        console.log(data);
      });
  }

  // Or use DestroyRef directly
  ngOnInit() {
    const subscription = this.#dataService.updates$.subscribe();

    this.#destroyRef.onDestroy(() => {
      subscription.unsubscribe();
      console.log('Cleaned up!');
    });
  }
}
```

### In Services

```typescript
@Injectable()
export class WebSocket {
  #destroyRef = inject(DestroyRef);
  #socket: WebSocket | null = null;

  constructor() {
    this.#destroyRef.onDestroy(() => {
      this.#socket?.close();
    });
  }

  connect(url: string) {
    this.#socket = new WebSocket(url);
  }
}
```

### takeUntilDestroyed Outside Constructor

```typescript
@Component({...})
export class My {
  #destroyRef = inject(DestroyRef);
  #http = inject(HttpClient);

  loadData() {
    // Pass destroyRef when using outside constructor
    this.#http.get('/api/data')
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe();
  }
}
```

## Injection Context Utilities

### assertInInjectionContext

```typescript
import { assertInInjectionContext, inject } from '@angular/core';

export function injectLogger(): Logger {
  assertInInjectionContext(injectLogger);
  return inject(Logger);
}

// Usage - must be called in injection context
@Component({...})
export class My2 {
  #logger = injectLogger(); // OK

  someMethod() {
    // injectLogger(); // ERROR - not in injection context
  }
}
```

### Custom inject Functions

```typescript
// Create reusable injection utilities
export function injectRouteParam(param: string): Signal<string | null> {
  assertInInjectionContext(injectRouteParam);
  
  const route = inject(ActivatedRoute);
  return toSignal(
    route.paramMap.pipe(map(params => params.get(param))),
    { initialValue: null }
  );
}

export function injectQueryParam(param: string): Signal<string | null> {
  assertInInjectionContext(injectQueryParam);
  
  const route = inject(ActivatedRoute);
  return toSignal(
    route.queryParamMap.pipe(map(params => params.get(param))),
    { initialValue: null }
  );
}

// Usage
@Component({...})
export class UserCmpt {
  userId = injectRouteParam('id');
  tab = injectQueryParam('tab');
}
```
