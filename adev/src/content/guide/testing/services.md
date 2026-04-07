# Testing services

Services typically contain your application's business logic that components rely on. Testing services verifies that the logic works correctly in isolation, independent of any component or template.

This guide uses [Vitest](https://vitest.dev/), which Angular CLI projects include by default. For more on testing setup, see the [testing overview guide](guide/testing#set-up-for-testing).

## Testing a service

Consider a `Calculator` service that performs basic arithmetic:

```ts { header: 'calculator.ts' }
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }

  subtract(a: number, b: number): number {
    return a - b;
  }
}
```

To test this service, configure a `TestBed`, which is Angular's testing utility for creating an isolated testing environment for each test. It sets up dependency injection and lets you retrieve service instances — simulating how Angular wires things together in a real application.

```ts { header: 'calculator.spec.ts' }
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from 'vitest';
import {Calculator} from './calculator';

describe('Calculator', () => {
  let service: Calculator;

  beforeEach(() => {
    // Injects the Calculator service which is available to Angular
    // because the service uses `providedIn: 'root'`
    service = TestBed.inject(Calculator);
  });

  it('adds two numbers', () => {
    expect(service.add(1, 2)).toBe(3);
  });

  it('subtracts two numbers', () => {
    expect(service.subtract(5, 3)).toBe(2);
  });
});
```

In the example above, the `beforeEach` block injects a fresh instance of the service before every test. This ensures each test runs in isolation with no leaked state from previous tests.

## Testing services with dependencies

Most services depend on other services to run properly. By default, `TestBed` provides the real implementations of these dependencies, which means your tests exercise the actual code paths your application uses. Sometimes, however, a dependency may be complex, slow, or unpredictable. In those cases, you can substitute it with a controlled replacement.

Consider an `OrderTotal` service that relies on a `TaxCalculator` to compute the final price of an order:

```ts { header: 'tax-calculator.ts' }
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class TaxCalculator {
  calculate(subtotal: number): number {
    return subtotal * 0.05;
  }
}
```

```ts { header: 'order-total.ts' }
import {inject, Injectable} from '@angular/core';
import {TaxCalculator} from './tax-calculator';

@Injectable({providedIn: 'root'})
export class OrderTotal {
  private taxCalculator = inject(TaxCalculator);

  total(subtotal: number): number {
    return subtotal + this.taxCalculator.calculate(subtotal);
  }
}
```

In this example, `OrderTotal` uses `inject()` to request `TaxCalculator` from Angular's dependency injection system. By default, `TestBed` provides the real `TaxCalculator` which is perfect for simple calculations like this. However, if `TaxCalculator` involved complex logic, network requests, or unpredictable results, you might want to substitute it with a controlled replacement.

### Replacing a dependency with a stub

A stub is a way to replace a dependency or method with one that returns predictable values, which can make test results easier to verify.

To test `OrderTotal` without relying on the real `TaxCalculator`, you can provide a stub in the `TestBed` configuration.

```ts { header: 'order-total.spec.ts' }
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, vi, type Mocked} from 'vitest';
import {OrderTotal} from './order-total';
import {TaxCalculator} from './tax-calculator';

// Vitest's `Mocked` utility type ensures the stub is type-safe,
// while `vi.fn()` creates a mock function for each method
const taxCalculatorStub: Mocked<TaxCalculator> = {
  calculate: vi.fn(),
};

describe('OrderTotal', () => {
  let service: OrderTotal;

  beforeEach(() => {
    // `mockReturnValue` sets a controlled return value for the stub
    taxCalculatorStub.calculate.mockReturnValue(5);

    TestBed.configureTestingModule({
      // The `providers` array accepts a provider object where `provide`
      // specifies the dependency to replace and `useValue` defines the stub
      providers: [{provide: TaxCalculator, useValue: taxCalculatorStub}],
    });
    service = TestBed.inject(OrderTotal);
  });

  it('adds tax to the subtotal', () => {
    expect(service.total(100)).toBe(105);
  });
});
```

With this stub, whenever `OrderTotal` requests `TaxCalculator`, the `TestBed` knows to use the `taxCalculatorStub` instead. Because the stub always returns 5, the test verifies that `OrderTotal` correctly adds the tax value to the subtotal regardless of whether the tax rate changes in `TaxCalculator`.

### Verifying interactions with spies

A stub controls what a dependency returns, but sometimes you also need to verify that a service called its dependency with the correct arguments. This can be accomplished with spies, which track how a function is called. With Vitest, this functionality is built into `vi.fn()` and lets you assert on interactions between services.

```ts { header: 'order-total.spec.ts' }
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, vi, type Mocked} from 'vitest';
import {OrderTotal} from './order-total';
import {TaxCalculator} from './tax-calculator';

const taxCalculatorStub: Mocked<TaxCalculator> = {
  calculate: vi.fn(),
};

describe('OrderTotal', () => {
  let service: OrderTotal;

  beforeEach(() => {
    taxCalculatorStub.calculate.mockReturnValue(5);

    TestBed.configureTestingModule({
      providers: [{provide: TaxCalculator, useValue: taxCalculatorStub}],
    });
    service = TestBed.inject(OrderTotal);
  });

  it('adds tax to the subtotal', () => {
    expect(service.total(100)).toBe(105);
  });

  // Verify the interaction with a spy
  it('calls the tax calculator', () => {
    service.total(100);
    expect(taxCalculatorStub.calculate).toHaveBeenCalledExactlyOnce();
  });
});
```

The new test verifies that `OrderTotal` called `TaxCalculator.calculate` when computing the total. This is useful when verifying that the interaction between services happened correctly.

## Testing HTTP services

Many services use Angular's `HttpClient` to fetch data from a server. Angular provides dedicated testing utilities for `HttpClient` that let you control HTTP responses without making real network requests.

For details on testing services that use `HttpClient`, see the [HTTP testing guide](guide/http/testing).
