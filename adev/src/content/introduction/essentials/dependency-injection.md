<docs-decorative-header title="Внедрение зависимостей" imgSrc="adev/src/assets/images/dependency_injection.svg"> <!-- markdownlint-disable-line -->
Переиспользуйте код и управляйте поведением во всём приложении и в тестах.
</docs-decorative-header>

Когда нужно делиться логикой между компонентами, Angular использует паттерн проектирования [внедрения зависимостей](guide/di), который позволяет создать «сервис» для внедрения кода в компоненты при управлении им из единого источника истины.

## Что такое сервисы? {#what-are-services}

Сервисы — это переиспользуемые фрагменты кода, которые можно внедрять.

Подобно определению компонента, сервис состоит из следующего:

- **Декоратор TypeScript**, объявляющий класс сервисом Angular через `@Service` и позволяющий определить сервис, доступный в любом месте приложения.
- **Класс TypeScript**, определяющий нужный код, который будет доступен при внедрении сервиса

Вот пример сервиса `Calculator`.

```angular-ts
import {Service} from '@angular/core';

@Service()
export class Calculator {
  add(x: number, y: number) {
    return x + y;
  }
}
```

## Как использовать сервис {#how-to-use-a-service}

Чтобы использовать сервис в компоненте, нужно:

1. Импортировать сервис
2. Объявить поле класса, куда внедряется сервис. Присвоить полю результат вызова встроенной функции [`inject`](/api/core/inject), которая создаёт сервис

Вот как это может выглядеть в компоненте `Receipt`:

```angular-ts
import {Component, inject} from '@angular/core';
import {Calculator} from './calculator';

@Component({
  selector: 'app-receipt',
  template: `<h1>The total is {{ totalCost }}</h1>`,
})
export class Receipt {
  private calculator = inject(Calculator);
  totalCost = this.calculator.add(50, 25);
}
```

В этом примере `Calculator` используется путём вызова функции Angular [`inject`](/api/core/inject) с передачей в неё сервиса.

## Следующий шаг {#next-step}

<docs-pill-row>
  <docs-pill title="Следующие шаги после «Основ»" href="essentials/next-steps" />
  <docs-pill title="Подробное руководство по внедрению зависимостей" href="guide/di" />
</docs-pill-row>
