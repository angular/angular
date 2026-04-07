# Angular HTTP Patterns

## Table of Contents
- [Service Layer Pattern](#service-layer-pattern)
- [Caching Strategies](#caching-strategies)
- [Pagination](#pagination)
- [File Upload](#file-upload)
- [Request Cancellation](#request-cancellation)
- [Testing HTTP](#testing-http)

## Service Layer Pattern

Encapsulate HTTP logic in services:

```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http';

export interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class User {
  #http = inject(HttpClient);
  #baseUrl = '/api/users';

  // Current user ID for reactive fetching
  #currentUserId = signal<string | null>(null);

  // Reactive resource that updates when currentUserId changes
  currentUser = httpResource<User>(() => {
    const id = this.#currentUserId();
    return id ? `${this.#baseUrl}/${id}` : undefined;
  });

  // Set current user to fetch
  selectUser(id: string) {
    this.#currentUserId.set(id);
  }

  // CRUD operations
  getAll() {
    return this.#http.get<User[]>(this.#baseUrl);
  }

  getById(id: string) {
    return this.#http.get<User>(`${this.#baseUrl}/${id}`);
  }

  create(user: Omit<User, 'id'>) {
    return this.#http.post<User>(this.#baseUrl, user);
  }

  update(id: string, user: Partial<User>) {
    return this.#http.patch<User>(`${this.#baseUrl}/${id}`, user);
  }

  delete(id: string) {
    return this.#http.delete<void>(`${this.#baseUrl}/${id}`);
  }
}
```

## Caching Strategies

### Simple In-Memory Cache

```typescript
@Injectable({ providedIn: 'root' })
export class CachedUser {
  #http = inject(HttpClient);
  #cache = new Map<string, { data: User; timestamp: number }>();
  #cacheDuration = 5 * 60 * 1000; // 5 minutes

  getUser(id: string): Observable<User> {
    const cached = this.#cache.get(id);

    if (cached && Date.now() - cached.timestamp < this.#cacheDuration) {
      return of(cached.data);
    }

    return this.#http.get<User>(`/api/users/${id}`).pipe(
      tap(user => {
        this.#cache.set(id, { data: user, timestamp: Date.now() });
      })
    );
  }

  invalidateCache(id?: string) {
    if (id) {
      this.#cache.delete(id);
    } else {
      this.#cache.clear();
    }
  }
}
```

### Signal-Based Cache

```typescript
@Injectable({ providedIn: 'root' })
export class UserCache {
  #http = inject(HttpClient);

  // Cache as signal
  #usersCache = signal<Map<string, User>>(new Map());

  // Computed for easy access
  users = computed(() => Array.from(this.#usersCache().values()));

  getUser(id: string): User | undefined {
    return this.#usersCache().get(id);
  }

  async fetchUser(id: string): Promise<User> {
    const cached = this.getUser(id);
    if (cached) return cached;

    const user = await firstValueFrom(
      this.#http.get<User>(`/api/users/${id}`)
    );

    this.#usersCache.update(cache => {
      const newCache = new Map(cache);
      newCache.set(id, user);
      return newCache;
    });

    return user;
  }
}
```

## Pagination

### Paginated Resource

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Component({
  template: `
    @if (usersResource.isLoading()) {
      <app-spinner />
    } @else if (usersResource.hasValue()) {
      <ul>
        @for (user of usersResource.value().data; track user.id) {
          <li>{{ user.name }}</li>
        }
      </ul>
      
      <div class="pagination">
        <button 
          (click)="prevPage()" 
          [disabled]="page() === 1"
        >Previous</button>
        
        <span>Page {{ page() }} of {{ usersResource.value().totalPages }}</span>
        
        <button 
          (click)="nextPage()" 
          [disabled]="page() >= usersResource.value().totalPages"
        >Next</button>
      </div>
    }
  `,
})
export class UsersList {
  page = signal(1);
  pageSize = signal(10);
  
  usersResource = httpResource<PaginatedResponse<User>>(() => ({
    url: '/api/users',
    params: {
      page: this.page().toString(),
      pageSize: this.pageSize().toString(),
    },
  }));
  
  nextPage() {
    this.page.update(p => p + 1);
  }
  
  prevPage() {
    this.page.update(p => Math.max(1, p - 1));
  }
}
```

## File Upload

### Single File Upload

```typescript
@Component({
  template: `
    <input type="file" (change)="onFileSelected($event)" />
    
    @if (uploadProgress() !== null) {
      <progress [value]="uploadProgress()" max="100"></progress>
    }
  `,
})
export class FileUpload {
  #http = inject(HttpClient);

  uploadProgress = signal<number | null>(null);

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    this.#http.post('/api/upload', formData, {
      reportProgress: true, // Enables progress events
      observe: 'events', // Returns progress events instead of response
    }).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress.set(Math.round(100 * event.loaded / event.total));
      } else if (event.type === HttpEventType.Response) {
        this.uploadProgress.set(null);
        console.log('Upload complete:', event.body);
      }
    });
  }
}
```

### Multiple Files

```typescript
uploadFiles(files: FileList) {
  const formData = new FormData();
  
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  
  return this.http.post<{ urls: string[] }>('/api/upload-multiple', formData);
}
```

## Request Cancellation

### With resource()

```typescript
// resource() automatically handles cancellation via abortSignal
searchResource = resource({
  params: () => ({ q: this.query() }),
  loader: async ({ params, abortSignal }) => {
    const response = await fetch(`/api/search?q=${params.q}`, {
      signal: abortSignal, // Cancels if params change
    });
    return response.json();
  },
});
```

### With HttpClient

```typescript
@Component({...})
export class Search implements OnDestroy {
  #http = inject(HttpClient);
  #destroyRef = inject(DestroyRef);

  query = signal('');
  results = signal<Result[]>([]);

  #searchSubscription?: Subscription;

  search() {
    // Cancel previous request
    this.#searchSubscription?.unsubscribe();

    this.#searchSubscription = this.#http
      .get<Result[]>(`/api/search?q=${this.query()}`)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(results => this.results.set(results));
  }
}
```

### Debounced Search

```typescript
@Component({...})
export class SearchDebounced {
  query = signal('');

  #http = inject(HttpClient);

  results = toSignal(
    toObservable(this.query).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(q => q.length >= 2),
      switchMap(q => this.#http.get<Result[]>(`/api/search?q=${q}`)),
      catchError(() => of([]))
    ),
    { initialValue: [] }
  );
}
```

## Testing HTTP

### Testing httpResource

```typescript
describe('UserCmpt', () => {
  let component: UserCmpt;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UserCmpt],
      providers: [provideHttpClientTesting()],
    });
    
    component = TestBed.createComponent(UserCmpt).componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should load user', () => {
    component.userId.set('123');
    
    const req = httpMock.expectOne('/api/users/123');
    req.flush({ id: '123', name: 'Test User' });
    
    expect(component.userResource.value()?.name).toBe('Test User');
  });
  
  afterEach(() => {
    httpMock.verify();
  });
});
```

### Testing Services

```typescript
describe('User', () => {
  let service: User;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        User,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    
    service = TestBed.inject(User);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should create user', () => {
    const newUser = { name: 'Test', email: 'test@example.com' };
    
    service.create(newUser).subscribe(user => {
      expect(user.id).toBeDefined();
      expect(user.name).toBe('Test');
    });
    
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newUser);
    
    req.flush({ id: '1', ...newUser });
  });
});
```
