# Двусторонняя привязка

**Двусторонняя привязка** (Two-way binding) — это сокращенная запись для одновременной привязки значения к элементу и
предоставления этому элементу возможности передавать изменения обратно через эту привязку.

## Синтаксис

Синтаксис двусторонней привязки представляет собой комбинацию квадратных и круглых скобок: `[()]`. Он объединяет
синтаксис привязки свойств `[]` и синтаксис привязки событий `()`. В сообществе Angular этот синтаксис неформально
называют "банан в коробке" (banana-in-a-box).

## Двусторонняя привязка с элементами управления формы

Разработчики часто используют двустороннюю привязку для синхронизации данных компонента с элементом управления формы по
мере взаимодействия пользователя с ним. Например, когда пользователь заполняет текстовое поле ввода, состояние в
компоненте должно обновляться.

Следующий пример динамически обновляет атрибут `firstName` на странице:

```angular-ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  template: `
    <main>
      <h2>Hello {{ firstName }}!</h2>
      <input type="text" [(ngModel)]="firstName" />
    </main>
  `
})
export class AppComponent {
  firstName = 'Ada';
}
```

Чтобы использовать двустороннюю привязку с нативными элементами управления формы, необходимо:

1. Импортировать `FormsModule` из `@angular/forms`
1. Использовать директиву `ngModel` с синтаксисом двусторонней привязки (например, `[(ngModel)]`)
1. Присвоить ей состояние, которое вы хотите обновлять (например, `firstName`)

Как только это будет настроено, Angular гарантирует, что любые обновления в текстовом поле ввода будут корректно
отражены в состоянии компонента!

Узнайте больше об [`NgModel`](guide/directives#displaying-and-updating-properties-with-ngmodel) в официальной
документации.

## Двусторонняя привязка между компонентами

Использование двусторонней привязки между родительским и дочерним компонентами требует большей настройки по сравнению с
элементами формы.

Вот пример, где `AppComponent` отвечает за установку начального состояния счетчика, но логика обновления и рендеринга
пользовательского интерфейса для счетчика в основном находится внутри его дочернего компонента `CounterComponent`.

```angular-ts
// ./app.component.ts
import { Component } from '@angular/core';
import { CounterComponent } from './counter/counter.component';

@Component({
  selector: 'app-root',
  imports: [CounterComponent],
  template: `
    <main>
      <h1>Counter: {{ initialCount }}</h1>
      <app-counter [(count)]="initialCount"></app-counter>
    </main>
  `,
})
export class AppComponent {
  initialCount = 18;
}
```

```angular-ts
// './counter/counter.component.ts';
import { Component, model } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <button (click)="updateCount(-1)">-</button>
    <span>{{ count() }}</span>
    <button (click)="updateCount(+1)">+</button>
  `,
})
export class CounterComponent {
  count = model<number>(0);

  updateCount(amount: number): void {
    this.count.update(currentCount => currentCount + amount);
  }
}
```

### Включение двусторонней привязки между компонентами

Если разобрать приведенный выше пример до сути, каждая двусторонняя привязка для компонентов требует следующего:

Дочерний компонент должен содержать свойство `model`.

Вот упрощенный пример:

```angular-ts
// './counter/counter.component.ts';
import { Component, model } from '@angular/core';

@Component({ /* Omitted for brevity */ })
export class CounterComponent {
  count = model<number>(0);

  updateCount(amount: number): void {
    this.count.update(currentCount => currentCount + amount);
  }
}
```

Родительский компонент должен:

1. Обернуть имя свойства `model` в синтаксис двусторонней привязки.
1. Присвоить свойство или сигнал свойству `model`.

Вот упрощенный пример:

```angular-ts
// ./app.component.ts
import { Component } from '@angular/core';
import { CounterComponent } from './counter/counter.component';

@Component({
  selector: 'app-root',
  imports: [CounterComponent],
  template: `
    <main>
      <app-counter [(count)]="initialCount"></app-counter>
    </main>
  `,
})
export class AppComponent {
  initialCount = 18;
}
```
