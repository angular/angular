# Vitest Setup for Angular

Angular v20+ has native Vitest support through the `@angular/build` package.

## Installation

```bash
npm install -D vitest jsdom
```

## Configuration

```json
// angular.json - update test architect
{
  "projects": {
    "your-app": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "tsConfig": "tsconfig.spec.json",
            "buildTarget": "your-app:build"
          }
        }
      }
    }
  }
}
```

```json
// tsconfig.spec.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["vitest/globals"]
  },
  "include": ["src/**/*.spec.ts"]
}
```

## Running Tests

```bash
# Run tests
ng test

# Watch mode
ng test --watch

# Coverage
ng test --code-coverage
```

## Vitest Test Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Counter } from './counter.component';

describe('Counter', () => {
  let component: Counter;
  let fixture: ComponentFixture<Counter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Counter],
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
});
```

## Vitest Mocking

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('UserCmpt', () => {
  const mockUserService = {
    getUser: vi.fn(),
    updateUser: vi.fn(),
    user: signal<User | null>(null),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockUserService.getUser.mockReturnValue(of({ id: '1', name: 'Test' }));

    await TestBed.configureTestingModule({
      imports: [UserCmpt],
      providers: [
        { provide: User, useValue: mockUserService },
      ],
    }).compileComponents();
  });

  it('should call getUser on init', () => {
    const fixture = TestBed.createComponent(UserCmpt);
    fixture.detectChanges();
    expect(mockUserService.getUser).toHaveBeenCalledWith('1');
  });
});
```

## Vitest with HTTP Testing

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

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
    httpMock.verify();
  });

  it('should fetch user', () => {
    const mockUser = { id: '1', name: 'Test User' };

    service.getUser('1').subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });
});
```

## Vitest vs Jasmine Comparison

| Feature | Vitest | Jasmine/Karma |
|---------|--------|---------------|
| Speed | Faster (native ESM) | Slower |
| Watch mode | Instant feedback | Slower rebuilds |
| Mocking | `vi.fn()`, `vi.mock()` | `jasmine.createSpy()` |
| Assertions | `expect()` (Chai-style) | `expect()` (Jasmine) |
| UI | Built-in UI mode | Karma browser |
| Config | `angular.json` | `karma.conf.js` |

## Migration from Jasmine to Vitest

```typescript
// Jasmine
const spy = jasmine.createSpy('callback');
spy.and.returnValue('value');
expect(spy).toHaveBeenCalledWith('arg');

// Vitest
const spy = vi.fn();
spy.mockReturnValue('value');
expect(spy).toHaveBeenCalledWith('arg');
```

```typescript
// Jasmine
spyOn(service, 'method').and.returnValue(of(data));

// Vitest
vi.spyOn(service, 'method').mockReturnValue(of(data));
```
