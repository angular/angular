# Создание и обновление первого сигнала

Добро пожаловать в туториал по сигналам Angular! [Сигналы](/essentials/signals) — реактивный примитив Angular для управления состоянием и автоматического обновления UI при его изменении.

В этом задании вы научитесь:

- создавать первый сигнал функцией `signal()`;
- отображать его значение в шаблоне;
- обновлять значение сигнала методами `set()` и `update()`.

Давайте построим интерактивную систему статуса пользователя на сигналах!

<hr />

<docs-workflow>

<docs-step title="Import the signal function">
Импортируйте функцию `signal` из `@angular/core` в начале файла компонента.

```ts
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
```

</docs-step>

<docs-step title="Create a signal in your component">
Добавьте сигнал `userStatus` в класс компонента, инициализированный значением `'offline'`.

```ts
@Component({
  /* Config omitted */
})
export class App {
  userStatus = signal<'online' | 'offline'>('offline');
}
```

</docs-step>

<docs-step title="Display the signal value in the template">
Обновите индикатор статуса, чтобы показывать текущий статус пользователя:
1. Привяжите сигнал к атрибуту class через `[class]="userStatus()"`
2. Отобразите текст статуса, заменив `???` на `{{ userStatus() }}`

```angular-html
<!-- Update from: -->
<div class="status-indicator offline">
  <span class="status-dot"></span>
  Status: ???
</div>

<!-- To: -->
<div class="status-indicator" [class]="userStatus()">
  <span class="status-dot"></span>
  Status: {{ userStatus() }}
</div>
```

Обратите внимание: сигнал `userStatus()` вызывается со скобками, чтобы прочитать значение.
</docs-step>

<docs-step title="Add methods to update the signal">
Добавьте в компонент методы, меняющие статус пользователя через `set()`.

```ts
goOnline() {
  this.userStatus.set('online');
}

goOffline() {
  this.userStatus.set('offline');
}
```

Метод `set()` полностью заменяет значение сигнала новым.

</docs-step>

<docs-step title="Wire up the control buttons">
Кнопки уже есть в шаблоне. Подключите их к методам:
1. Обработчики клика через `(click)`
2. Состояния disabled через `[disabled]`, когда уже в этом статусе

```html
<!-- Add bindings to the existing buttons: -->
<button (click)="goOnline()" [disabled]="userStatus() === 'online'">Go Online</button>
<button (click)="goOffline()" [disabled]="userStatus() === 'offline'">Go Offline</button>
```

</docs-step>

<docs-step title="Add a toggle method using update()">
Добавьте метод `toggleStatus()`, переключающий online/offline через `update()`.

```ts
toggleStatus() {
  this.userStatus.update(current => current === 'online' ? 'offline' : 'online');
}
```

Метод `update()` принимает функцию, которая получает текущее значение и возвращает новое. Это удобно, когда нужно изменить существующее значение на основе текущего состояния.

</docs-step>

<docs-step title="Add the toggle button handler">
Кнопка переключения уже в шаблоне. Подключите её к методу `toggleStatus()`:

```html
<button (click)="toggleStatus()" class="toggle-btn">Toggle Status</button>
```

</docs-step>

</docs-workflow>

Поздравляем! Вы создали первый сигнал и научились обновлять его методами `set()` и `update()`. Функция `signal()` создаёт реактивное значение, которое Angular отслеживает, и при обновлении UI автоматически отражает изменения.

Далее — [как выводить состояние из сигналов с помощью computed](/tutorials/signals/2-deriving-state-with-computed-signals)!
