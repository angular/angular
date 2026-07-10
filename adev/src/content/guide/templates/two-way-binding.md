# Двусторонняя привязка

**Двусторонняя привязка** — сокращение для одновременной привязки значения к элементу и предоставления этому элементу возможности распространять изменения обратно через эту привязку.

## Синтаксис {#syntax}

Синтаксис двусторонней привязки — комбинация квадратных скобок и круглых скобок, `[()]`. Он сочетает синтаксис property binding, `[]`, и синтаксис event binding, `()`. Сообщество Angular неформально называет этот синтаксис «banana-in-a-box».

## Двусторонняя привязка с form controls {#two-way-binding-with-form-controls}

Разработчики часто используют двустороннюю привязку, чтобы синхронизировать данные компонента с form control, пока пользователь взаимодействует с контролом. Например, когда пользователь заполняет текстовый input, это должно обновлять состояние в компоненте.

Следующий пример динамически обновляет атрибут `firstName` на странице:

```angular-ts
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  imports: [FormsModule],
  template: `
    <main>
      <h2>Hello {{ firstName }}!</h2>
      <input type="text" [(ngModel)]="firstName" />
    </main>
  `,
})
export class App {
  firstName = 'Ada';
}
```

Чтобы использовать двустороннюю привязку с нативными form controls, нужно:

1. Импортировать `FormsModule` из `@angular/forms`
1. Использовать директиву `ngModel` с синтаксисом двусторонней привязки (например, `[(ngModel)]`)
1. Назначить ей состояние, которое нужно обновлять (например, `firstName`)

После настройки Angular гарантирует, что любые обновления в текстовом input корректно отразятся в состоянии компонента!

Подробнее о [`NgModel`](/api/forms/NgModel) — в официальной документации.

## Двусторонняя привязка между компонентами {#two-way-binding-between-components}

Использование двусторонней привязки между родительским и дочерним компонентом требует больше конфигурации по сравнению с элементами формы.

Ниже пример, где `App` отвечает за установку начального состояния count, а логика обновления и рендера UI счётчика в основном находится в дочернем `Counter`.

```angular-ts {header: 'app.ts'}
import {Component} from '@angular/core';
import {Counter} from './counter';

@Component({
  selector: 'app-root',
  imports: [Counter],
  template: `
    <main>
      <h1>Counter: {{ initialCount }}</h1>
      <app-counter [(count)]="initialCount"></app-counter>
    </main>
  `,
})
export class App {
  initialCount = 18;
}
```

```angular-ts {header: 'counter.ts'}
import {Component, model} from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <button (click)="updateCount(-1)">-</button>
    <span>{{ count() }}</span>
    <button (click)="updateCount(+1)">+</button>
  `,
})
export class Counter {
  count = model<number>(0);

  updateCount(amount: number): void {
    this.count.update((currentCount) => currentCount + amount);
  }
}
```

### Включение двусторонней привязки между компонентами {#enabling-two-way-binding-between-components}

Если разобрать пример выше до сути, каждая двусторонняя привязка для компонентов требует следующего:

Дочерний компонент должен содержать свойство `model`.

Упрощённый пример:

```angular-ts {header: 'counter.ts'}
import {Component, model} from '@angular/core';

@Component({
  /* Omitted for brevity */
})
export class Counter {
  count = model<number>(0);

  updateCount(amount: number): void {
    this.count.update((currentCount) => currentCount + amount);
  }
}
```

Родительский компонент должен:

1. Обернуть имя свойства `model` в синтаксис двусторонней привязки.
1. Назначить свойство или сигнал свойству `model`.

Упрощённый пример:

```angular-ts {header: 'app.ts'}
import {Component} from '@angular/core';
import {Counter} from './counter';

@Component({
  selector: 'app-root',
  imports: [Counter],
  template: `
    <main>
      <app-counter [(count)]="initialCount"></app-counter>
    </main>
  `,
})
export class App {
  initialCount = 18;
}
```
