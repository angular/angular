# Vitest Setup and Migration Guide

## Vitest vs Jasmine Comparison

| Feature    | Vitest                  | Jasmine/Karma         |
| ---------- | ----------------------- | --------------------- |
| Speed      | Faster (native ESM)     | Slower                |
| Watch mode | Instant feedback        | Slower rebuilds       |
| Mocking    | `vi.fn()`, `vi.mock()`  | `jasmine.createSpy()` |
| Assertions | `expect()` (Chai-style) | `expect()` (Jasmine)  |
| UI         | Built-in UI mode        | Karma browser         |
| Config     | `angular.json`          | `karma.conf.js`       |

## Migration from Jasmine to Vitest

### Spy Migration

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

### SpyOn Migration

```typescript
// Jasmine
spyOn(service, 'method').and.returnValue(of(data));

// Vitest
vi.spyOn(service, 'method').mockReturnValue(of(data));
```

### createSpyObj Migration

```typescript
// Jasmine
const mockService = jasmine.createSpyObj('UserService', ['getUser', 'updateUser']);
mockService.getUser.and.returnValue(of({id: '1', name: 'Test'}));

// Vitest
const mockService = {
  getUser: vi.fn(),
  updateUser: vi.fn(),
};
mockService.getUser.mockReturnValue(of({id: '1', name: 'Test'}));
```

### Async Testing Migration

```typescript
// Jasmine - using done callback
it('should load data', (done) => {
  service.loadData().subscribe((data) => {
    expect(data).toBeDefined();
    done();
  });
});

// Vitest - using async/await
it('should load data', async () => {
  const data = await firstValueFrom(service.loadData());
  expect(data).toBeDefined();
});
```

### Clock/Timer Migration

```typescript
// Jasmine
jasmine.clock().install();
jasmine.clock().tick(1000);
jasmine.clock().uninstall();

// Vitest
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.useRealTimers();
```

## Vitest Configuration Details

### Full angular.json Configuration

```json
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

### tsconfig.spec.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["vitest/globals"]
  },
  "include": ["src/**/*.spec.ts"]
}
```

### Optional vite.config.ts

For advanced configuration, create a `vite.config.ts`:

```typescript
import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'src/test-setup.ts', '**/*.spec.ts', '**/*.d.ts'],
    },
  },
});
```

## Running Vitest

```bash
# Run tests
ng test

# Watch mode
ng test --watch

# Coverage
ng test --code-coverage

# Run specific file pattern
ng test --include='**/user*.spec.ts'

# CI mode (single run)
ng test --watch=false
```
