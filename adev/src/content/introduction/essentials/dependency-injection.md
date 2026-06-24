<docs-decorative-header title="Внедрение зависимостей (Dependency Injection)" imgSrc="adev/src/assets/images/dependency_injection.svg"> <!-- markdownlint-disable-line -->
Повторно используйте код и управляйте поведением во всем приложении и тестах.
</docs-decorative-header>

Когда вам нужно разделить логику между компонентами, Angular использует шаблон
проектирования [внедрение зависимостей](guide/di), который позволяет вам создать "сервис". Сервис позволяет вам внедрять
код в компоненты, управляя им из единого источника истины.

## Что такое сервисы?

Сервисы — это повторно используемые части кода, которые могут быть внедрены.

Подобно определению компонента, сервисы состоят из следующего:

- **Декоратор TypeScript**, который объявляет класс как сервис Angular через `@Injectable` и позволяет вам определить,
  какая часть приложения может получить доступ к сервису через свойство `providedIn` (обычно это `'root'`), чтобы
  разрешить доступ к сервису в любом месте приложения.
- **Класс TypeScript**, который определяет желаемый код, который будет доступен при внедрении сервиса.

Вот пример сервиса `Calculator`.

```angular-ts
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class Calculator {
  add(x: number, y: number) {
    return x + y;
  }
}
```

## Как использовать сервис

Когда вы хотите использовать сервис в компоненте, вам нужно:

1. Импортировать сервис.
2. Объявить поле класса, куда внедряется сервис. Присвоить полю класса результат вызова встроенной функции [`inject`](/api/core/inject), которая создает сервис.

Вот как это может выглядеть в компоненте `Receipt`:

```angular-ts
import { Component, inject } from '@angular/core';
import { Calculator } from './calculator';

@Component({
  selector: 'app-receipt',
  template: `<h1>The total is {{ totalCost }}</h1>`,
})

export class Receipt {
  private calculator = inject(Calculator);
  totalCost = this.calculator.add(50, 25);
}
```

В этом примере `Calculator` используется путем вызова функции Angular `inject` и передачи ей сервиса.

## Следующий шаг

<docs-pill-row>
  <docs-pill title="Следующие шаги после Основ" href="essentials/next-steps" />
  <docs-pill title="Углубленное руководство по внедрению зависимостей" href="guide/di" />
</docs-pill-row>
