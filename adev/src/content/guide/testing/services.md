# Тестирование сервисов

Сервисы обычно содержат бизнес-логику вашего приложения, на которую опираются компоненты. Тестирование сервисов проверяет корректность этой логики в изоляции, независимо от каких-либо компонентов или шаблонов.

В этом руководстве используется [Vitest](https://vitest.dev/), который проекты Angular CLI включают по умолчанию. Подробнее о настройке тестирования см. [обзорное руководство по тестированию](guide/testing#set-up-for-testing).

## Тестирование сервиса {#testing-a-service}

Рассмотрим сервис `Calculator`, выполняющий базовые арифметические операции:

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

Для тестирования этого сервиса настройте `TestBed` — утилиту Angular для создания изолированной тестовой среды для каждого теста. Она настраивает внедрение зависимостей и позволяет получать экземпляры сервисов — имитируя то, как Angular связывает всё вместе в реальном приложении.

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

В приведённом примере блок `beforeEach` внедряет свежий экземпляр сервиса перед каждым тестом. Это гарантирует, что каждый тест выполняется в изоляции без утечки состояния из предыдущих тестов.

## Тестирование сервисов с зависимостями {#testing-services-with-dependencies}

Большинство сервисов зависят от других сервисов. По умолчанию `TestBed` предоставляет реальные реализации этих зависимостей, что означает, что тесты проверяют реальные пути кода, используемые приложением. Однако иногда зависимость может быть сложной, медленной или непредсказуемой. В таких случаях её можно заменить управляемой заглушкой.

Рассмотрим сервис `OrderTotal`, который полагается на `TaxCalculator` для вычисления итоговой цены заказа:

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

В этом примере `OrderTotal` использует `inject()` для запроса `TaxCalculator` из системы внедрения зависимостей Angular. По умолчанию `TestBed` предоставляет реальный `TaxCalculator`, что отлично подходит для простых вычислений. Однако если бы `TaxCalculator` содержал сложную логику, сетевые запросы или возвращал непредсказуемые результаты, его можно было бы заменить управляемой заглушкой.

### Замена зависимости заглушкой {#replacing-a-dependency-with-a-stub}

Заглушка (stub) — это способ заменить зависимость или метод таким, который возвращает предсказуемые значения, что упрощает проверку результатов тестов.

Для тестирования `OrderTotal` без зависимости от реального `TaxCalculator` можно предоставить заглушку в конфигурации `TestBed`.

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

С этой заглушкой всякий раз, когда `OrderTotal` запрашивает `TaxCalculator`, `TestBed` использует `taxCalculatorStub` вместо реального сервиса. Поскольку заглушка всегда возвращает 5, тест проверяет, что `OrderTotal` корректно прибавляет значение налога к подытогу независимо от изменения налоговой ставки в `TaxCalculator`.

### Проверка взаимодействий с помощью шпионов {#verifying-interactions-with-spies}

Заглушка контролирует, что возвращает зависимость, но иногда также нужно убедиться, что сервис вызвал зависимость с правильными аргументами. Это можно сделать с помощью шпионов (spies), которые отслеживают вызовы функций. В Vitest эта функциональность встроена в `vi.fn()` и позволяет проверять взаимодействия между сервисами.

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

Новый тест проверяет, что `OrderTotal` вызвал `TaxCalculator.calculate` при вычислении итоговой суммы. Это полезно при проверке корректности взаимодействия между сервисами.

## Тестирование HTTP-сервисов {#testing-http-services}

Многие сервисы используют `HttpClient` Angular для загрузки данных с сервера. Angular предоставляет специальные утилиты тестирования для `HttpClient`, позволяющие управлять HTTP-ответами без выполнения реальных сетевых запросов.

Подробнее о тестировании сервисов, использующих `HttpClient`, см. в [руководстве по тестированию HTTP](guide/http/testing).
