# Library Testing

## Overview

Testing an Angular library involves two levels:

1. **Unit tests** — testing the library's components, services, and utilities in isolation.
2. **Integration tests** — verifying that the compiled library works correctly when consumed by a real Angular application.

---

## Unit Testing

Library unit tests work the same as application tests. They live alongside the source files:

```
projects/my-lib/src/lib/
├── my-lib.component.ts
├── my-lib.component.spec.ts   ← unit test
├── my-lib.service.ts
└── my-lib.service.spec.ts     ← unit test
```

Run library tests with:

```bash
ng test my-lib
```

---

## Writing Unit Tests

Use `TestBed` to configure a minimal testing module for the library:

```ts
import {TestBed} from '@angular/core/testing';
import {MyLibComponent} from './my-lib.component';

describe('MyLibComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyLibComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MyLibComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

---

## Async-First Pattern

Follow the zoneless async-first pattern for all library tests:

```ts
it('should update when input changes', async () => {
  const fixture = TestBed.createComponent(MyLibComponent);
  const component = fixture.componentInstance;

  // Act
  component.label.set('New Label');

  // Wait
  await fixture.whenStable();

  // Assert
  const el = fixture.nativeElement.querySelector('.label');
  expect(el.textContent).toBe('New Label');
});
```

- Do **not** call `fixture.detectChanges()` manually.
- Always use `await fixture.whenStable()` after state changes.

---

## Testing Services with `inject()`

For services that use `inject()` instead of constructor injection:

```ts
import {TestBed} from '@angular/core/testing';
import {MyLibService} from './my-lib.service';

describe('MyLibService', () => {
  let service: MyLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

---

## Integration Testing with a Consumer App

To verify the compiled library works end-to-end:

1. **Build the library** in watch mode:

```bash
ng build my-lib --watch
```

2. **Import from the library name** in the consuming app (the path mapping in `tsconfig.json` handles resolution):

```ts
import {MyLibComponent} from 'my-lib';
```

3. **Run the consuming app's tests** to catch integration issues:

```bash
ng test my-app
```

---

## Providing a `testing` Entry Point

For complex libraries, expose test utilities via a dedicated secondary entry point:

```ts
// my-lib/testing/src/public-api.ts
export * from './my-lib-harness';
```

```ts
// In consumer test files
import {MyLibHarness} from 'my-lib/testing';
```

See [secondary-entrypoints.md](secondary-entrypoints.md) for setup details.

---

## Component Harnesses

For UI component libraries, provide a **Component Harness** so consumers can interact with your components in tests without coupling to the DOM structure:

```ts
import {ComponentHarness} from '@angular/cdk/testing';

export class MyButtonHarness extends ComponentHarness {
  static hostSelector = 'my-button';

  async click(): Promise<void> {
    const host = await this.host();
    await host.click();
  }

  async getText(): Promise<string> {
    const host = await this.host();
    return host.text();
  }
}
```

Export the harness from the `testing` secondary entry point.

---

> Do not test the contents of the `dist/` folder directly. Test the source. The build pipeline is validated separately by `ng build`.
