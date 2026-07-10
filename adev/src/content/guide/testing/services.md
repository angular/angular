# Тестирование сервисов

Сервисы обычно содержат бизнес-логику приложения, на которую опираются компоненты. Тестирование сервисов проверяет, что логика работает корректно изолированно, независимо от любого компонента или шаблона.

Это руководство использует [Vitest](https://vitest.dev/), который проекты Angular CLI включают по умолчанию. Подробнее о настройке тестирования см. в [обзорном руководстве по тестированию](guide/testing#set-up-for-testing).

## Тестирование сервиса {#testing-a-service}

Рассмотрим сервис `Calculator`, выполняющий базовую арифметику:

```ts { header: 'calculator.ts' }
import {Service} from '@angular/core';

@Service()
export class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }

  subtract(a: number, b: number): number {
    return a - b;
  }
}
```

Чтобы протестировать этот сервис, настройте `TestBed` — утилиту тестирования Angular для создания изолированного окружения тестирования для каждого теста. Она настраивает внедрение зависимостей и позволяет получать экземпляры сервисов — имитируя, как Angular связывает вещи в реальном приложении.

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

В примере выше блок `beforeEach` внедряет свежий экземпляр сервиса перед каждым тестом. Это гарантирует, что каждый тест выполняется изолированно без утечки состояния из предыдущих тестов.

## Тестирование сервисов с зависимостями {#testing-services-with-dependencies}

Большинство сервисов зависят от других сервисов для корректной работы. По умолчанию `TestBed` предоставляет реальные реализации этих зависимостей, то есть тесты упражняют фактические пути кода, которые использует приложение. Иногда, однако, зависимость может быть сложной, медленной или непредсказуемой. В таких случаях её можно заменить контролируемой подменой.

Рассмотрим сервис `OrderTotal`, который опирается на `TaxCalculator` для вычисления итоговой цены заказа:

```ts { header: 'tax-calculator.ts' }
import {Service} from '@angular/core';

@Service()
export class TaxCalculator {
  calculate(subtotal: number): number {
    return subtotal * 0.05;
  }
}
```

```ts { header: 'order-total.ts' }
import {inject, Service} from '@angular/core';
import {TaxCalculator} from './tax-calculator';

@Service()
export class OrderTotal {
  private taxCalculator = inject(TaxCalculator);

  total(subtotal: number): number {
    return subtotal + this.taxCalculator.calculate(subtotal);
  }
}
```

В этом примере `OrderTotal` использует `inject()`, чтобы запросить `TaxCalculator` у системы внедрения зависимостей Angular. По умолчанию `TestBed` предоставляет реальный `TaxCalculator` — это идеально для простых вычислений вроде этого. Однако если `TaxCalculator` включал бы сложную логику, сетевые запросы или непредсказуемые результаты, его можно было бы заменить контролируемой подменой.

### Замена зависимости stub'ом {#replacing-a-dependency-with-a-stub}

Stub — способ заменить зависимость или метод таким, который возвращает предсказуемые значения, что упрощает проверку результатов теста.

Чтобы протестировать `OrderTotal` без опоры на реальный `TaxCalculator`, можно предоставить stub в конфигурации `TestBed`.

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

С этим stub, когда `OrderTotal` запрашивает `TaxCalculator`, `TestBed` знает, что нужно использовать `taxCalculatorStub`. Поскольку stub всегда возвращает 5, тест проверяет, что `OrderTotal` корректно добавляет значение налога к подытогу независимо от того, меняется ли налоговая ставка в `TaxCalculator`.

### Проверка взаимодействий со spies {#verifying-interactions-with-spies}

Stub контролирует, что возвращает зависимость, но иногда также нужно проверить, что сервис вызвал свою зависимость с корректными аргументами. Это можно сделать со spies, которые отслеживают, как вызывается функция. В Vitest эта функциональность встроена в `vi.fn()` и позволяет утверждать взаимодействия между сервисами.

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

  afterEach(() => {
    taxCalculatorStub.calculate.mockClear();
  });

  it('adds tax to the subtotal', () => {
    expect(service.total(100)).toBe(105);
  });

  // Verify the interaction with a spy
  it('calls the tax calculator', () => {
    service.total(100);
    expect(taxCalculatorStub.calculate).toHaveBeenCalledExactlyOnceWith(100);
  });
});
```

Новый тест проверяет, что `OrderTotal` вызвал `TaxCalculator.calculate` при вычислении итога. Это полезно при проверке корректности взаимодействия между сервисами.

## Тестирование HTTP-сервисов {#testing-http-services}

Многие сервисы используют `HttpClient` Angular для загрузки данных с сервера. Angular предоставляет специальные утилиты тестирования для `HttpClient`, позволяющие контролировать HTTP-ответы без реальных сетевых запросов.

Подробнее о тестировании сервисов, использующих `HttpClient`, см. в [руководстве по HTTP-тестированию](guide/http/testing).
