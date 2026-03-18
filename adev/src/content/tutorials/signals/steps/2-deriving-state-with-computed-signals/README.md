# Формирование состояния с помощью вычисляемых сигналов

Теперь, когда вы узнали, [как создавать и обновлять сигналы](/tutorials/signals/1-creating-your-first-signal), давайте изучим вычисляемые сигналы. Вычисляемые сигналы — это производные значения, которые автоматически обновляются при изменении их зависимостей. Они идеально подходят для создания реактивных вычислений на основе других сигналов.

В этом упражнении вы научитесь использовать функцию `computed()` для создания производного состояния, которое обновляется автоматически при изменении базовых сигналов.

Давайте улучшим нашу систему статусов пользователей, добавив вычисляемые значения, производные от сигнала статуса пользователя. Стартовый код теперь включает три варианта статуса: `'online'`, `'away'` и `'offline'`.

<hr />

<docs-workflow>

<docs-step title="Import computed function">
Добавьте `computed` к существующим импортам.

```ts
// Add computed to existing imports
import {Component, signal, computed, ChangeDetectionStrategy} from '@angular/core';
```

</docs-step>

<docs-step title="Create a computed signal for notifications">
Добавьте вычисляемый сигнал, который определяет, должны ли быть включены уведомления на основе статуса пользователя.

```ts
notificationsEnabled = computed(() => this.userStatus() === 'online');
```

Этот вычисляемый сигнал будет автоматически пересчитываться при изменении сигнала `userStatus`. Обратите внимание, как мы вызываем `this.userStatus()` внутри функции вычисления для чтения значения сигнала.
</docs-step>

<docs-step title="Create a computed signal for a descriptive message">
Добавьте вычисляемый сигнал, который создаёт описательное сообщение на основе статуса пользователя.

```ts
statusMessage = computed(() => {
  const status = this.userStatus();
  switch (status) {
    case 'online':
      return 'Available for meetings and messages';
    case 'away':
      return 'Temporarily away, will respond soon';
    case 'offline':
      return 'Not available, check back later';
    default:
      return 'Status unknown';
  }
});
```

Это показывает, как вычисляемые сигналы могут обрабатывать более сложную логику с операторами switch и преобразованиями строк.
</docs-step>

<docs-step title="Create a computed signal that calculates working hours availability">
Добавьте вычисляемый сигнал, который вычисляет, находится ли пользователь в рабочее время.

```ts
isWithinWorkingHours = computed(() => {
  const now = new Date();
  const hour = now.getHours();
  const isWeekday = now.getDay() > 0 && now.getDay() < 6;
  return isWeekday && hour >= 9 && hour < 17 && this.userStatus() !== 'offline';
});
```

Это демонстрирует, как вычисляемые сигналы могут выполнять вычисления и объединять несколько источников данных. Значение обновляется автоматически при изменении `userStatus`.
</docs-step>

<docs-step title="Display the computed values in the template">
В шаблоне уже есть заполнители с надписью «Loading...». Замените их вашими вычисляемыми сигналами:

1. Для уведомлений замените `Loading...` блоком `@if`:

   ```angular-html
   @if (notificationsEnabled()) {
     Enabled
   } @else {
     Disabled
   }
   ```

1. Для сообщения замените `Loading...` на:

   ```angular-html
   {{ statusMessage() }}
   ```

1. Для рабочих часов замените `Loading...` блоком `@if`:

   ```angular-html
   @if (isWithinWorkingHours()) {
     Yes
   } @else {
     No
   }
   ```

Обратите внимание, что вычисляемые сигналы вызываются так же, как обычные сигналы — со скобками!
</docs-step>

</docs-workflow>

Отлично! Теперь вы научились создавать вычисляемые сигналы.

Вот несколько ключевых моментов, которые нужно запомнить:

- **Вычисляемые сигналы реактивны**: они автоматически обновляются при изменении их зависимостей
- **Они доступны только для чтения**: вы не можете напрямую устанавливать вычисляемые значения — они производятся из других сигналов
- **Они могут содержать сложную логику**: используйте их для вычислений, преобразований и производного состояния
- **Они обеспечивают производительные вычисления на основе динамического состояния**: Angular пересчитывает их только при фактическом изменении их зависимостей

В следующем уроке вы узнаете о [другом способе формирования состояния с помощью linkedSignal](/tutorials/signals/3-deriving-state-with-linked-signals)!
