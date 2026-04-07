# Angular Testing Patterns

## Table of Contents
- [Vitest Advanced Patterns](#vitest-advanced-patterns)
- [Component Harnesses](#component-harnesses)
- [Testing Router](#testing-router)
- [Testing Forms](#testing-forms)
- [Testing Directives](#testing-directives)
- [Testing Pipes](#testing-pipes)
- [E2E Testing Setup](#e2e-testing-setup)

## Vitest Advanced Patterns

### Snapshot Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('UserCard', () => {
  it('should match snapshot', () => {
    const fixture = TestBed.createComponent(UserCard);
    fixture.componentRef.setInput('user', { id: '1', name: 'John', email: 'john@example.com' });
    fixture.detectChanges();
    
    expect(fixture.nativeElement.innerHTML).toMatchSnapshot();
  });
});
```

### Parameterized Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('Validator', () => {
  it.each([
    { input: '', expected: false },
    { input: 'test', expected: false },
    { input: 'test@example.com', expected: true },
    { input: 'invalid@', expected: false },
  ])('should validate email "$input" as $expected', ({ input, expected }) => {
    expect(isValidEmail(input)).toBe(expected);
  });
});
```

### Testing with Fake Timers

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Debounced Search', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('should debounce search input', async () => {
    const fixture = TestBed.createComponent(Search);
    fixture.detectChanges();
    
    fixture.componentInstance.query.set('test');
    
    // Search not called yet
    expect(fixture.componentInstance.results()).toEqual([]);
    
    // Advance timers
    vi.advanceTimersByTime(300);
    await fixture.whenStable();
    fixture.detectChanges();
    
    expect(fixture.componentInstance.results().length).toBeGreaterThan(0);
  });
});
```

### Module Mocking

```typescript
import { describe, it, expect, vi } from 'vitest';

// Mock entire module
vi.mock('./analytics.service', () => ({
  Analytics: class {
    track = vi.fn();
    identify = vi.fn();
  },
}));

describe('with mocked analytics', () => {
  it('should track events', () => {
    const fixture = TestBed.createComponent(Dashboard);
    const analytics = TestBed.inject(Analytics);
    
    fixture.detectChanges();
    
    expect(analytics.track).toHaveBeenCalledWith('dashboard_viewed');
  });
});
```

### Testing Async/Await

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('User', () => {
  it('should load user data', async () => {
    const mockUser = { id: '1', name: 'Test' };
    const httpMock = TestBed.inject(HttpTestingController);
    const service = TestBed.inject(User);
    
    const userPromise = service.loadUser('1');
    
    httpMock.expectOne('/api/users/1').flush(mockUser);
    
    const user = await userPromise;
    expect(user).toEqual(mockUser);
  });
});
```

### Coverage Configuration

```typescript
// vite.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.spec.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

### Vitest UI Mode

```bash
# Run with UI
npx vitest --ui

# Open UI at specific port
npx vitest --ui --port 51204
```

### Concurrent Tests

```typescript
import { describe, it, expect } from 'vitest';

// Run tests in this describe block concurrently
describe.concurrent('API calls', () => {
  it('should fetch users', async () => {
    // ...
  });
  
  it('should fetch products', async () => {
    // ...
  });
  
  it('should fetch orders', async () => {
    // ...
  });
});
```

### Test Fixtures

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

// Shared test fixtures
const createTestUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  ...overrides,
});

const createTestProduct = (overrides = {}) => ({
  id: '1',
  name: 'Test Product',
  price: 99.99,
  ...overrides,
});

describe('Order', () => {
  it('should calculate total', () => {
    const fixture = TestBed.createComponent(Order);
    fixture.componentRef.setInput('user', createTestUser());
    fixture.componentRef.setInput('products', [
      createTestProduct({ price: 10 }),
      createTestProduct({ id: '2', price: 20 }),
    ]);
    fixture.detectChanges();
    
    expect(fixture.componentInstance.total()).toBe(30);
  });
});
```

## Component Harnesses

Use Angular CDK component harnesses for more maintainable tests:

### Creating a Harness

```typescript
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export class CounterHarn extends ComponentHarness {
  static hostSelector = 'app-counter';
  
  // Locators
  private getIncrementButton = this.locatorFor('button.increment');
  private getDecrementButton = this.locatorFor('button.decrement');
  private getCountDisplay = this.locatorFor('.count');
  
  // Actions
  async increment(): Promise<void> {
    const button = await this.getIncrementButton();
    await button.click();
  }
  
  async decrement(): Promise<void> {
    const button = await this.getDecrementButton();
    await button.click();
  }
  
  // Queries
  async getCount(): Promise<number> {
    const display = await this.getCountDisplay();
    const text = await display.text();
    return parseInt(text, 10);
  }
  
  // Filter factory
  static with(options: { count?: number } = {}): HarnessPredicate<CounterHarn> {
    return new HarnessPredicate(CounterHarn, options)
      .addOption('count', options.count, async (harness, count) => {
        return (await harness.getCount()) === count;
      });
  }
}
```

### Using Harnesses in Tests

```typescript
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

describe('Counter with Harness', () => {
  let loader: HarnessLoader;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Counter],
    }).compileComponents();
    
    const fixture = TestBed.createComponent(Counter);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });
  
  it('should increment count', async () => {
    const counter = await loader.getHarness(CounterHarn);
    
    expect(await counter.getCount()).toBe(0);
    
    await counter.increment();
    expect(await counter.getCount()).toBe(1);
    
    await counter.increment();
    expect(await counter.getCount()).toBe(2);
  });
  
  it('should find counter with specific count', async () => {
    const counter = await loader.getHarness(CounterHarn);
    await counter.increment();
    await counter.increment();
    
    // Find counter with count of 2
    const counterWith2 = await loader.getHarness(CounterHarn.with({ count: 2 }));
    expect(counterWith2).toBeTruthy();
  });
});
```

## Testing Router

### RouterTestingHarness

```typescript
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';

describe('Router Navigation', () => {
  let harness: RouterTestingHarness;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: Home },
          { path: 'users/:id', component: UserCmpt },
        ]),
      ],
    }).compileComponents();
    
    harness = await RouterTestingHarness.create();
  });
  
  it('should navigate to user page', async () => {
    const component = await harness.navigateByUrl('/users/123', UserCmpt);
    
    expect(component.id()).toBe('123');
  });
  
  it('should display user name', async () => {
    await harness.navigateByUrl('/users/123');
    
    expect(harness.routeNativeElement?.textContent).toContain('User 123');
  });
});
```

### Testing Guards

```typescript
describe('AuthGuard', () => {
  let authService: jasmine.SpyObj<Auth>;
  
  beforeEach(() => {
    authService = jasmine.createSpyObj('Auth', ['isAuthenticated']);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: authService },
        provideRouter([
          { path: 'login', component: Login },
          { 
            path: 'dashboard', 
            component: Dashboard,
            canActivate: [authGuard],
          },
        ]),
      ],
    });
  });
  
  it('should allow access when authenticated', async () => {
    authService.isAuthenticated.and.returnValue(true);
    
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard');
    
    expect(harness.routeNativeElement?.textContent).toContain('Dashboard');
  });
  
  it('should redirect to login when not authenticated', async () => {
    authService.isAuthenticated.and.returnValue(false);
    
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard');
    
    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
```

## Testing Forms

### Testing Signal Forms

```typescript
import { form, FormField, required, email } from '@angular/forms/signals';

@Component({
  imports: [FormField],
  template: `
    <form (submit)="onSubmit($event)">
      <input [formField]="loginForm.email" />
      <input [formField]="loginForm.password" type="password" />
      <button type="submit" [disabled]="loginForm().invalid()">Submit</button>
    </form>
  `,
})
export class Login {
  model = signal({ email: '', password: '' });
  loginForm = form(this.model, (schemaPath) => {
    required(schemaPath.email);
    email(schemaPath.email);
    required(schemaPath.password);
  });
  
  submitted = signal(false);
  
  onSubmit(event: Event) {
    event.preventDefault();
    if (this.loginForm().valid()) {
      this.submitted.set(true);
    }
  }
}

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
    }).compileComponents();
    
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should be invalid when empty', () => {
    expect(component.loginForm().invalid()).toBeTrue();
  });
  
  it('should be valid with correct data', () => {
    component.model.set({
      email: 'test@example.com',
      password: 'password123',
    });
    
    expect(component.loginForm().valid()).toBeTrue();
  });
  
  it('should show email error for invalid email', () => {
    component.loginForm.email().value.set('invalid');
    fixture.detectChanges();
    
    expect(component.loginForm.email().invalid()).toBeTrue();
    expect(component.loginForm.email().errors().some(e => e.kind === 'email')).toBeTrue();
  });
  
  it('should disable submit button when invalid', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTrue();
  });
});
```

### Testing Reactive Forms

```typescript
describe('ReactiveForm', () => {
  it('should validate form', () => {
    const fixture = TestBed.createComponent(ProfileForm);
    const component = fixture.componentInstance;
    
    expect(component.form.valid).toBeFalse();
    
    component.form.patchValue({
      name: 'John',
      email: 'john@example.com',
    });
    
    expect(component.form.valid).toBeTrue();
  });
  
  it('should show validation errors', () => {
    const fixture = TestBed.createComponent(ProfileForm);
    fixture.detectChanges();
    
    const emailControl = fixture.componentInstance.form.controls.email;
    emailControl.setValue('invalid');
    emailControl.markAsTouched();
    fixture.detectChanges();
    
    const errorElement = fixture.nativeElement.querySelector('.error');
    expect(errorElement.textContent).toContain('Invalid email');
  });
});
```

## Testing Directives

### Attribute Directive

```typescript
@Directive({
  selector: '[appHighlight]',
  host: {
    '[style.backgroundColor]': 'color()',
  },
})
export class Highlight {
  color = input('yellow', { alias: 'appHighlight' });
}

describe('Highlight', () => {
  @Component({
    imports: [Highlight],
    template: `<p appHighlight="lightblue">Test</p>`,
  })
  class Test {}
  
  it('should apply background color', () => {
    const fixture = TestBed.createComponent(Test);
    fixture.detectChanges();
    
    const p = fixture.nativeElement.querySelector('p');
    expect(p.style.backgroundColor).toBe('lightblue');
  });
});
```

### Structural Directive

```typescript
@Directive({
  selector: '[appIf]',
})
export class If {
  #templateRef = inject(TemplateRef);
  #viewContainer = inject(ViewContainerRef);

  condition = input.required<boolean>({ alias: 'appIf' });

  constructor() {
    effect(() => {
      if (this.condition()) {
        this.#viewContainer.createEmbeddedView(this.#templateRef);
      } else {
        this.#viewContainer.clear();
      }
    });
  }
}

describe('If', () => {
  @Component({
    imports: [If],
    template: `<p *appIf="show()">Visible</p>`,
  })
  class TestCmpt {
    show = signal(false);
  }
  
  it('should show content when condition is true', () => {
    const fixture = TestBed.createComponent(Test);
    fixture.detectChanges();
    
    expect(fixture.nativeElement.querySelector('p')).toBeNull();
    
    fixture.componentInstance.show.set(true);
    fixture.detectChanges();
    
    expect(fixture.nativeElement.querySelector('p')).toBeTruthy();
  });
});
```

## Testing Pipes

```typescript
@Pipe({ name: 'truncate' })
export class Truncate implements PipeTransform {
  transform(value: string, length: number = 50): string {
    if (value.length <= length) return value;
    return value.substring(0, length) + '...';
  }
}

describe('Truncate', () => {
  let pipe: Truncate;
  
  beforeEach(() => {
    pipe = new Truncate();
  });
  
  it('should not truncate short strings', () => {
    expect(pipe.transform('Hello', 10)).toBe('Hello');
  });
  
  it('should truncate long strings', () => {
    expect(pipe.transform('Hello World', 5)).toBe('Hello...');
  });
  
  it('should use default length', () => {
    const longString = 'a'.repeat(60);
    const result = pipe.transform(longString);
    expect(result.length).toBe(53); // 50 + '...'
  });
});
```

## E2E Testing Setup

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Example

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });
  
  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error')).toBeVisible();
    await expect(page.locator('.error')).toContainText('Invalid credentials');
  });
});
```

## Test Utilities

### Custom Test Helpers

```typescript
// test-utils.ts
export function setSignalInput<T>(
  fixture: ComponentFixture<any>,
  inputName: string,
  value: T
): void {
  fixture.componentRef.setInput(inputName, value);
  fixture.detectChanges();
}

export async function waitForSignal<T>(
  signal: () => T,
  predicate: (value: T) => boolean,
  timeout = 5000
): Promise<T> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const value = signal();
    if (predicate(value)) return value;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw new Error('Timeout waiting for signal');
}

// Usage
it('should load data', async () => {
  const fixture = TestBed.createComponent(Data);
  fixture.detectChanges();
  
  await waitForSignal(
    () => fixture.componentInstance.data(),
    data => data !== undefined
  );
  
  expect(fixture.componentInstance.data()).toBeDefined();
});
```
