# Двусторонняя привязка {#two-way-binding}

**Двусторонняя привязка** — это сокращённая запись для одновременной привязки значения к элементу с предоставлением этому элементу возможности распространять изменения обратно через эту привязку.

## Синтаксис {#syntax}

Синтаксис двусторонней привязки представляет собой комбинацию квадратных и круглых скобок: `[()]`. Он объединяет синтаксис привязки свойства `[]` и синтаксис привязки событий `()`. Сообщество Angular неформально называет этот синтаксис «banana-in-a-box» (банан в коробке).

## Двусторонняя привязка с элементами формы {#two-way-binding-with-form-controls}

Разработчики часто используют двустороннюю привязку для синхронизации данных компонента с элементом формы при взаимодействии пользователя с этим элементом. Например, при заполнении текстового поля состояние компонента должно обновляться.

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

Для использования двусторонней привязки с нативными элементами формы необходимо:

1. Импортировать `FormsModule` из `@angular/forms`
1. Использовать директиву `ngModel` с синтаксисом двусторонней привязки (например, `[(ngModel)]`)
1. Присвоить ей состояние, которое нужно обновлять (например, `firstName`)

После настройки Angular гарантирует, что любые обновления в текстовом поле корректно отразятся в состоянии компонента!

Подробнее о [`NgModel`](api/forms/NgModel) см. в официальной документации.

## Двусторонняя привязка между компонентами {#two-way-binding-between-components}

Двусторонняя привязка между родительским и дочерним компонентами требует большей настройки по сравнению с элементами формы.

Пример, где `App` отвечает за установку начального состояния счётчика, но логика обновления и рендеринга UI для счётчика преимущественно находится в дочернем компоненте `Counter`.

```angular-ts
// ./app.ts
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

```angular-ts
// './counter.ts';
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

Если разобрать пример выше до основы, каждая двусторонняя привязка для компонентов требует следующего:

Дочерний компонент должен содержать свойство `model`.

Упрощённый пример:

```angular-ts
// './counter.ts';
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
1. Присвоить свойство или сигнал свойству `model`.

Упрощённый пример:

```angular-ts
// ./app.ts
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
