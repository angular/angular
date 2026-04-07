---
name: angular-testing
description: Write unit and integration tests for Angular v21+ applications using Vitest or Jasmine with TestBed, component harnesses, and modern testing patterns. Use for testing components with signals, OnPush change detection, services with inject(), and HTTP interactions. Triggers on test creation, testing signal-based components, mocking dependencies, or setting up test infrastructure. Do not use for E2E testing with Playwright or Cypress; use a dedicated QA skill.
license: MIT
metadata:
  author: Copyright 2026 Google LLC
  version: '1.0'
---

# Angular Testing


Test Angular v21+ applications with Vitest (recommended) or Jasmine, focusing on signal-based components and modern patterns.

## Vitest Setup (Angular v20+)

Angular v20+ has native Vitest support via `@angular/build`. First, install `vitest jsdom`. Then configure `angular.json` with builder `@angular/build:unit-test`. Finally, add `"types": ["vitest/globals"]` to `tsconfig.spec.json`. Run tests with `ng test`.

See `references/vitest-setup.md` for full configuration, test examples, mocking with `vi.fn()`, HTTP testing, and Jasmine-to-Vitest migration guide.

---

## Basic Component Test

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Counter } from './counter.component';

describe('Counter', () => {
  let component: Counter;
  let fixture: ComponentFixture<Counter>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Counter], // Standalone component
    }).compileComponents();
    
    fixture = TestBed.createComponent(Counter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should increment count', () => {
    expect(component.count()).toBe(0);
    
    component.increment();
    
    expect(component.count()).toBe(1);
  });
  
  it('should display count in template', () => {
    component.count.set(5);
    fixture.detectChanges();
    
    const element = fixture.nativeElement.querySelector('.count');
    expect(element.textContent).toContain('5');
  });
});
```

## Testing Signals

### Direct Signal Testing

```typescript
import { signal, computed } from '@angular/core';

describe('Signal logic', () => {
  it('should update computed when signal changes', () => {
    const count = signal(0);
    const doubled = computed(() => count() * 2);
    
    expect(doubled()).toBe(0);
    
    count.set(5);
    expect(doubled()).toBe(10);
    
    count.update(c => c + 1);
    expect(doubled()).toBe(12);
  });
});
```

### Testing Component Signals

```typescript
@Component({
  selector: 'app-todo-list',
  template: `
    <ul>
      @for (todo of filteredTodos(); track todo.id) {
        <li>{{ todo.text }}</li>
      }
    </ul>
    <p>{{ remaining() }} remaining</p>
  `,
})
export class TodoList {
  todos = signal<Todo[]>([]);
  filter = signal<'all' | 'active' | 'done'>('all');
  
  filteredTodos = computed(() => {
    const todos = this.todos();
    switch (this.filter()) {
      case 'active': return todos.filter(t => !t.done);
      case 'done': return todos.filter(t => t.done);
      default: return todos;
    }
  });
  
  remaining = computed(() => this.todos().filter(t => !t.done).length);
}

describe('TodoList', () => {
  let component: TodoList;
  let fixture: ComponentFixture<TodoList>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoList],
    }).compileComponents();
    
    fixture = TestBed.createComponent(TodoList);
    component = fixture.componentInstance;
  });
  
  it('should filter active todos', () => {
    component.todos.set([
      { id: '1', text: 'Task 1', done: false },
      { id: '2', text: 'Task 2', done: true },
      { id: '3', text: 'Task 3', done: false },
    ]);
    
    component.filter.set('active');
    
    expect(component.filteredTodos().length).toBe(2);
    expect(component.remaining()).toBe(2);
  });
  
  it('should render filtered todos', () => {
    component.todos.set([
      { id: '1', text: 'Active Task', done: false },
      { id: '2', text: 'Done Task', done: true },
    ]);
    component.filter.set('active');
    fixture.detectChanges();
    
    const items = fixture.nativeElement.querySelectorAll('li');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Active Task');
  });
});
```

## Testing OnPush Components

OnPush components require explicit change detection:

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span>{{ data().name }}</span>`,
})
export class OnPush {
  data = input.required<{ name: string }>();
}

describe('OnPush', () => {
  it('should update when input signal changes', () => {
    const fixture = TestBed.createComponent(OnPush);
    
    // Set input using setInput (for signal inputs)
    fixture.componentRef.setInput('data', { name: 'Initial' });
    fixture.detectChanges();
    
    expect(fixture.nativeElement.textContent).toContain('Initial');
    
    // Update input
    fixture.componentRef.setInput('data', { name: 'Updated' });
    fixture.detectChanges();
    
    expect(fixture.nativeElement.textContent).toContain('Updated');
  });
});
```

## Testing Services

### Basic Service Test

```typescript
import { TestBed } from '@angular/core/testing';

@Injectable({ providedIn: 'root' })
export class CounterSvc {
  #count = signal(0);
  readonly count = this.#count.asReadonly();

  increment() {
    this.#count.update(c => c + 1);
  }

  reset() {
    this.#count.set(0);
  }
}

describe('CounterSvc', () => {
  let service: CounterSvc;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CounterSvc);
  });
  
  it('should increment count', () => {
    expect(service.count()).toBe(0);
    
    service.increment();
    expect(service.count()).toBe(1);
    
    service.increment();
    expect(service.count()).toBe(2);
  });
  
  it('should reset count', () => {
    service.increment();
    service.increment();
    
    service.reset();
    
    expect(service.count()).toBe(0);
  });
});
```

### Service with Dependencies

```typescript
@Injectable({ providedIn: 'root' })
export class User {
  #http = inject(HttpClient);

  getUser(id: string) {
    return this.#http.get<User>(`/api/users/${id}`);
  }
}

describe('User', () => {
  let service: User;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    
    service = TestBed.inject(User);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify(); // Verify no outstanding requests
  });
  
  it('should fetch user by id', () => {
    const mockUser: User = { id: '1', name: 'Test User' };
    
    service.getUser('1').subscribe(user => {
      expect(user).toEqual(mockUser);
    });
    
    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });
});
```

## Mocking Dependencies

### Using Jasmine Spies

```typescript
describe('ComponentWithDependency', () => {
  let userServiceSpy: jasmine.SpyObj<User>;
  
  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('User', ['getUser', 'updateUser']);
    userServiceSpy.getUser.and.returnValue(of({ id: '1', name: 'Test' }));
    
    await TestBed.configureTestingModule({
      imports: [UserProfile],
      providers: [
        { provide: User, useValue: userServiceSpy },
      ],
    }).compileComponents();
  });
  
  it('should call getUser on init', () => {
    const fixture = TestBed.createComponent(UserProfile);
    fixture.detectChanges();
    
    expect(userServiceSpy.getUser).toHaveBeenCalledWith('1');
  });
});
```

### Mock Signal-Based Service

```typescript
// Create mock with signal
const mockAuth = {
  user: signal<User | null>(null),
  isAuthenticated: computed(() => mockAuth.user() !== null),
  login: jasmine.createSpy('login'),
  logout: jasmine.createSpy('logout'),
};

beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [Protected],
    providers: [
      { provide: Auth, useValue: mockAuth },
    ],
  }).compileComponents();
});

it('should show content when authenticated', () => {
  mockAuth.user.set({ id: '1', name: 'Test User' });
  
  const fixture = TestBed.createComponent(Protected);
  fixture.detectChanges();
  
  expect(fixture.nativeElement.querySelector('.protected-content')).toBeTruthy();
});
```

## Testing Inputs and Outputs

```typescript
@Component({
  selector: 'app-item',
  template: `
    <div (click)="select()">{{ item().name }}</div>
  `,
})
export class Item {
  item = input.required<Item>();
  selected = output<Item>();
  
  select() {
    this.selected.emit(this.item());
  }
}

describe('Item', () => {
  it('should emit selected event on click', () => {
    const fixture = TestBed.createComponent(Item);
    const item: Item = { id: '1', name: 'Test Item' };
    
    fixture.componentRef.setInput('item', item);
    fixture.detectChanges();
    
    // Subscribe to output
    let emittedItem: Item | undefined;
    fixture.componentInstance.selected.subscribe(i => emittedItem = i);
    
    // Trigger click
    fixture.nativeElement.querySelector('div').click();
    
    expect(emittedItem).toEqual(item);
  });
});
```

## Testing Async Operations

Use `fakeAsync`/`tick(ms)`/`flush()` for timer-based async. Use `waitForAsync`/`fixture.whenStable()` for promise-based async. For `httpResource`, use `provideHttpClientTesting()` and `HttpTestingController` to flush responses.

See `references/async-testing.md` for fakeAsync, waitForAsync, and httpResource testing examples.

## Accessibility Testing

Install `axe-core` and call `axe.run(fixture.nativeElement)`. All components MUST pass AXE checks and meet WCAG AA standards.

See `references/a11y-testing.md` for Vitest and Jasmine accessibility testing examples.

See `references/testing-patterns.md` for advanced testing patterns, harnesses, and component interaction tests.
