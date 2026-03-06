# Двусторонняя привязка {#two-way-binding}

**Двусторонняя привязка** — это сокращенный способ одновременно привязать значение к элементу и предоставить этому элементу возможность распространять изменения обратно через эту привязку.

## Синтаксис {#syntax}

Синтаксис двусторонней привязки представляет собой комбинацию квадратных и круглых скобок — `[()]`. Он объединяет синтаксис привязки свойств `[]` и синтаксис привязки событий `()`. Сообщество Angular неформально называет этот синтаксис «банан в коробке» (banana-in-a-box).

## Двусторонняя привязка с элементами форм {#two-way-binding-with-form-controls}

Разработчики часто используют двустороннюю привязку для синхронизации данных компонента с элементом формы при взаимодействии пользователя с ним. Например, когда пользователь заполняет текстовое поле ввода, это должно обновлять состояние в компоненте.

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

Для использования двусторонней привязки с нативными элементами форм необходимо:

1. Импортировать `FormsModule` из `@angular/forms`
1. Использовать директиву `ngModel` с синтаксисом двусторонней привязки (например, `[(ngModel)]`)
1. Присвоить ей состояние, которое необходимо обновлять (например, `firstName`)

После настройки Angular обеспечит корректное отражение любых обновлений в текстовом поле ввода в состоянии компонента.

Узнайте больше о [`NgModel`](/api/forms/NgModel) в официальной документации.

## Двусторонняя привязка между компонентами {#two-way-binding-between-components}

Использование двусторонней привязки между родительским и дочерним компонентами требует дополнительной настройки по сравнению с элементами форм.

Вот пример, где `App` отвечает за установку начального состояния счетчика, но логика обновления и рендеринга UI счетчика в основном находится внутри дочернего компонента `Counter`.

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

### Настройка двусторонней привязки между компонентами {#enabling-two-way-binding-between-components}

Если разобрать приведенный выше пример до его сути, каждая двусторонняя привязка для компонентов требует следующего:

Дочерний компонент должен содержать свойство `model`.

Вот упрощенный пример:

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

Вот упрощенный пример:

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
