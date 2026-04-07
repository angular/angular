# Angular Signal Patterns

## Table of Contents

- [Resource API](#resource-api)
- [rxResource API](#rxresource-api)
- [Signal Store Pattern](#signal-store-pattern)
- [Form State with Signals](#form-state-with-signals)
- [Async Operations](#async-operations)
- [Testing Signals](#testing-signals)

## Resource API

The `resource()` API handles async data fetching with signals:

```typescript
import {resource, signal, computed} from '@angular/core';

@Component({...})
export class UserProfile {
    userId = signal<string>('');

    // Resource fetches data when params change
    userResource = resource({
        params: () => ({id: this.userId()}),
        loader: async ({params, abortSignal}) => {
            const response = await fetch(`/api/users/${params.id}`, {
                signal: abortSignal,
            });
            return response.json() as Promise<User>;
        },
    });

    // Access resource state
    readonly user = computed(() => this.userResource.value());
    readonly isLoading = computed(() => this.userResource.isLoading());
    readonly error = computed(() => this.userResource.error());
}
```

### Resource Status

```typescript
const userResource = resource({...});

// Status signals
userResource.value();      // Current value or undefined
userResource.hasValue();   // Boolean - has resolved value
userResource.error();      // Error or undefined
userResource.isLoading();  // Boolean - currently loading
userResource.status();     // 'idle' | 'loading' | 'reloading' | 'resolved' | 'error' | 'local'

// Manual reload
userResource.reload();

// Local updates
userResource.set(newValue);
userResource.update(current => ({...current, name: 'Updated'}));
```

### Resource with Default Value

```typescript
const todosResource = resource({
    defaultValue: [] as Todo[],
    params: () => ({filter: this.filter()}),
    loader: async ({params}) => {
        const response = await fetch(`/api/todos?filter=${params.filter}`);
        return response.json();
    },
});

// value() returns Todo[] (never undefined due to defaultValue)
```

### Conditional Loading

```typescript
const userId = signal<string | null>(null);

const userResource = resource({
    params: () => {
        const id = userId();
        // Return undefined to skip loading
        return id ? {id} : undefined;
    },
    loader: async ({params}) => {
        return fetch(`/api/users/${params.id}`).then(r => r.json());
    },
});
// Status is 'idle' when params returns undefined
```

## rxResource API

```ts
  userRxResource = rxResource({
    // Reactive params — reruns stream when these change
    params: () => ({id: this.userId()}),

    // Returns an Observable (not a Promise)
    stream: ({params, abortSignal}) =>
        this.http.get<User>(`/api/users/${params.id}`),

    // Fallback value while loading (makes value() never undefined)
    defaultValue: {id: 0, name: ''} as User,

    // Custom equality to avoid unnecessary re-renders
    equal: (a, b) => a.id === b.id,
});

```

### RXResource Status

```typescript
  userRxResource.value()      // T | undefined (or T if defaultValue set)
  userRxResource.hasValue()   // boolean
  userRxResource.isLoading()  // boolean
  userRxResource.error()      // unknown | undefined
  userRxResource.status()     // 'idle' | 'loading' | 'reloading' | 'resolved' | 'error' | 'local'
  userRxResource.reload()     // manually retrigger
  userRxResource.set(value)   // set local value

```

### Streaming Use Case

```typescript
  //Streaming Use Case (SSE/WebSocket)

//Since stream returns an Observable, it can emit multiple values — making it useful for Server-Sent Events:

sseResource = rxResource({
    stream: () => this.eventSource.getStream(), // Observable that emits repeatedly
});
```
### Key Differences Between rxResource and resource
```markdown

┌─────────────────────────────┬────────────────────────────────┐
│         resource()          │          rxResource()          │
├─────────────────────────────┼────────────────────────────────┤
│ loader — returns Promise<T> │ stream — returns Observable<T> │
├─────────────────────────────┼────────────────────────────────┤
│ @angular/core               │ @angular/core/rxjs-interop     │
└─────────────────────────────┴────────────────────────────────┘

```
## Signal Store Pattern

For a complex state, create a dedicated store (State Machine):

```typescript
interface ProductState {
    products: Product[];
    selectedId: string | null;
    filter: string;
    loading: boolean;
    error: string | null;
}

@Injectable({providedIn: 'root'})
export class ProductSt {
    // Private state
     #state = signal<ProductState>({
        products: [],
        selectedId: null,
        filter: '',
        loading: false,
        error: null,
    });

    // Selectors (computed signals)
    readonly products = computed(() => this.#state().products);
    readonly selectedId = computed(() => this.#state().selectedId);
    readonly filter = computed(() => this.#state().filter);
    readonly loading = computed(() => this.#state().loading);
    readonly error = computed(() => this.#state().error);

    readonly filteredProducts = computed(() => {
        const {products, filter} = this.#state();
        if (!filter) return products;
        return products.filter(p =>
            p.name.toLowerCase().includes(filter.toLowerCase())
        );
    });

    readonly selectedProduct = computed(() => {
        const {products, selectedId} = this.#state();
        return products.find(p => p.id === selectedId) ?? null;
    });

     #http = inject(HttpClient);

    // Actions
    setFilter(filter: string): void {
        this.#state.update(s => ({...s, filter}));
    }

    selectProduct(id: string | null): void {
        this.#state.update(s => ({...s, selectedId: id}));
    }

    async loadProducts(): Promise<void> {
        this.#state.update(s => ({...s, loading: true, error: null}));

        try {
            const products = await firstValueFrom(
                this.#http.get<Product[]>('/api/products')
            );
            this.#state.update(s => ({...s, products, loading: false}));
        } catch (err) {
            this.#state.update(s => ({
                ...s,
                loading: false,
                error: 'Failed to load products'
            }));
        }
    }

    async addProduct(product: Omit<Product, 'id'>): Promise<void> {
        const newProduct = await firstValueFrom(
            this.#http.post<Product>('/api/products', product)
        );
        this.#state.update(s => ({
            ...s,
            products: [...s.products, newProduct],
        }));
    }
}
```

## Async Operations

### Debounced Search

```typescript

@Component({...})
export class Search {
    query = signal('');

     #http = inject(HttpClient);

    // Debounced search using toObservable
    results = toSignal(
        toObservable(this.query).pipe(
            debounceTime(300),
            distinctUntilChanged(),
            filter(q => q.length >= 2),
            switchMap(q => this.#http.get<Result[]>(`/api/search?q=${q}`)),
            catchError(() => of([]))
        ),
        {initialValue: []}
    );

    // Loading state
     #searching = signal<boolean>(false);
    readonly isSearching = this.#searching.asReadonly();

    constructor() {
        // Track loading state
        effect(() => {
            const query = this.query();
            if (qusery.length >= 2) {
                this.#searching.set(true);
            }
        });

        effect(() => {
            this.results(); // Subscribe to results
            this.#searching.set(false);
        });
    }
}
```

### Optimistic Updates

```typescript

@Injectable({providedIn: 'root'})
export class Todo {
    private todos = signal<Todo[]>([]);
    readonly items = this.todos.asReadonly();

    private http = inject(HttpClient);

    async toggleTodo(id: string): Promise<void> {
        // Optimistic update
        const previousTodos = this.todos();
        this.todos.update(todos =>
            todos.map(t => t.id === id ? {...t, done: !t.done} : t)
        );

        try {
            await firstValueFrom(
                this.http.patch(`/api/todos/${id}/toggle`, {})
            );
        } catch {
            // Rollback on error
            this.todos.set(previousTodos);
        }
    }
}
```

## Testing Signals

```typescript
describe('Counter', () => {
    it('should increment count', () => {
        const component = new Counter();

        expect(component.count()).toBe(0);

        component.increment();
        expect(component.count()).toBe(1);

        component.increment();
        expect(component.count()).toBe(2);
    });

    it('should compute doubled value', () => {
        const component = new Counter();

        expect(component.doubled()).toBe(0);

        component.count.set(5);
        expect(component.doubled()).toBe(10);
    });
});

describe('ProductSt', () => {
    let store: ProductSt;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ProductSt,
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });

        store = TestBed.inject(ProductSt);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should filter products', () => {
        // Set initial state
        store['state'].set({
            products: [
                {id: '1', name: 'Apple'},
                {id: '2', name: 'Banana'},
            ],
            selectedId: null,
            filter: '',
            loading: false,
            error: null,
        });

        expect(store.filteredProducts().length).toBe(2);

        store.setFilter('app');
        expect(store.filteredProducts().length).toBe(1);
        expect(store.filteredProducts()[0].name).toBe('Apple');
    });
});
```

## Signal Debugging

```typescript
// Debug effect to log signal changes
effect(() => {
    console.log('State changed:', {
        count: this.count(),
        items: this.items(),
        filter: this.filter(),
    });
});

// Conditional debugging
const DEBUG = signal(false);

effect(() => {
    if (untracked(() => DEBUG())) {
        console.log('Debug:', this.state());
    }
});
```
