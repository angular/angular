# Создание и обновление вашего первого сигнала

Добро пожаловать в туториал по Angular сигналам! [Сигналы](/essentials/signals) — это реактивный примитив Angular, который предоставляет способ управления состоянием и автоматического обновления вашего UI при изменении этого состояния.

В этом упражнении вы научитесь:

- Создавать свой первый сигнал, используя функцию `signal()`
- Отображать его значение в шаблоне
- Обновлять значение сигнала, используя методы `set()` и `update()`

Давайте создадим интерактивную систему статуса пользователя с помощью сигналов!

<hr />

<docs-workflow>

<docs-step title="Импорт функции signal">
Импортируйте функцию `signal` из `@angular/core` в верхней части файла вашего компонента.

```ts
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
```

</docs-step>

<docs-step title="Создание сигнала в вашем компоненте">
Добавьте сигнал `userStatus` в класс вашего компонента, инициализировав его значением `'offline'`.

```ts
@Component({
  /* Config omitted */
})
export class App {
  userStatus = signal<'online' | 'offline'>('offline');
}
```

</docs-step>

<docs-step title="Отображение значения сигнала в шаблоне">
Обновите индикатор статуса, чтобы отображать текущий статус пользователя:
1. Привязав сигнал к атрибуту class с помощью `[class]="userStatus()"`
2. Отобразив текст статуса, заменив `???` на `{{ userStatus() }}`

```html
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

Обратите внимание, как мы вызываем сигнал `userStatus()` с круглыми скобками, чтобы прочитать его значение.
</docs-step>

<docs-step title="Добавление методов для обновления сигнала">
Добавьте методы в ваш компонент, которые изменяют статус пользователя, используя метод `set()`.

```ts
goOnline() {
  this.userStatus.set('online');
}

goOffline() {
  this.userStatus.set('offline');
}
```

Метод `set()` полностью заменяет значение сигнала новым значением.

</docs-step>

<docs-step title="Подключение кнопок управления">
Кнопки уже есть в шаблоне. Теперь подключите их к вашим методам, добавив:
1. Обработчики клика с помощью `(click)`
2. Состояния disabled с помощью `[disabled]`, когда статус уже установлен

```html
<!-- Add bindings to the existing buttons: -->
<button (click)="goOnline()" [disabled]="userStatus() === 'online'">
  Go Online
</button>
<button (click)="goOffline()" [disabled]="userStatus() === 'offline'">
  Go Offline
</button>
```

</docs-step>

<docs-step title="Добавление метода переключения с использованием update()">
Добавьте метод `toggleStatus()`, который переключает между online и offline, используя метод `update()`.

```ts
toggleStatus() {
  this.userStatus.update(current => current === 'online' ? 'offline' : 'online');
}
```

Метод `update()` принимает функцию, которая получает текущее значение и возвращает новое значение. Это полезно, когда вам нужно изменить существующее значение на основе его текущего состояния.

</docs-step>

<docs-step title="Добавление обработчика кнопки переключения">
Кнопка переключения уже есть в шаблоне. Подключите её к вашему методу `toggleStatus()`:

```html
<button (click)="toggleStatus()" class="toggle-btn">
  Toggle Status
</button>
```

</docs-step>

</docs-workflow>

Поздравляем! Вы создали свой первый сигнал и научились обновлять его, используя методы `set()` и `update()`. Функция `signal()` создает реактивное значение, которое отслеживает Angular, и когда вы обновляете его, ваш UI автоматически отражает изменения.

Далее вы узнаете, [как выводить состояние из сигналов с помощью computed](/tutorials/signals/2-deriving-state-with-computed-signals)!

<docs-callout helpful title="О ChangeDetectionStrategy.OnPush">

Вы могли заметить `ChangeDetectionStrategy.OnPush` в декораторе компонента на протяжении этого туториала. Это оптимизация производительности для Angular компонентов, которые используют сигналы. Пока что вы можете смело игнорировать это — просто знайте, что это помогает вашему приложению работать быстрее при использовании сигналов! Вы можете узнать больше в [API документации стратегий обнаружения изменений](/api/core/ChangeDetectionStrategy).

</docs-callout>
