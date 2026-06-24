# Формирование состояния с помощью linked signals

Теперь, когда вы
узнали, [как формировать состояние с помощью вычисляемых сигналов (computed)](/tutorials/signals/2-deriving-state-with-computed-signals),
вы создали вычисляемый сигнал для `notificationsEnabled`, который автоматически отслеживал статус пользователя. Но что,
если пользователи захотят вручную отключить уведомления, даже когда они онлайн? Здесь на помощь приходят linked
signals (связанные сигналы).

Linked signals — это записываемые сигналы, которые поддерживают реактивную связь со своими исходными сигналами. Они
идеально подходят для создания состояния, которое обычно следует за вычислением, но при необходимости может быть
переопределено.

В этом упражнении вы узнаете, чем `linkedSignal()` отличается от `computed()`, преобразовав вычисляемый сигнал
`notificationsEnabled` из предыдущей системы статусов пользователей в записываемый linked-сигнал.

<hr />

<docs-workflow>

<docs-step title="Импорт функции linkedSignal">
Добавьте `linkedSignal` в существующие импорты.

```ts
// Add linkedSignal to existing imports
import {Component, signal, computed, linkedSignal, ChangeDetectionStrategy} from '@angular/core';
```

</docs-step>

<docs-step title="Преобразование computed в linkedSignal с тем же выражением">
Замените computed-сигнал `notificationsEnabled` на linkedSignal, используя то же самое выражение:

```ts
// Previously (from lesson 2):
// notificationsEnabled = computed(() => this.userStatus() === 'online');

// Now with linkedSignal - same expression, but writable:
notificationsEnabled = linkedSignal(() => this.userStatus() === 'online');
```

Выражение идентично, но linkedSignal создает записываемый сигнал. Он по-прежнему будет автоматически обновляться при
изменении `userStatus`, но вы также можете установить его значение вручную.
</docs-step>

<docs-step title="Добавление метода для ручного переключения уведомлений">
Добавьте метод, чтобы продемонстрировать, что в linked signals можно записывать данные напрямую:

```ts
toggleNotifications() {
  // This works with linkedSignal but would error with computed!
  this.notificationsEnabled.set(!this.notificationsEnabled());
}
```

В этом заключается ключевое различие: computed-сигналы доступны только для чтения, а linked signals можно обновлять
вручную, сохраняя при этом их реактивную связь.
</docs-step>

<docs-step title="Обновление шаблона для добавления ручного управления уведомлениями">
Обновите шаблон, добавив кнопку переключения уведомлений:

```angular-html
<div class="status-info">
  <div class="notifications">
    <strong>Notifications:</strong>
    @if (notificationsEnabled()) {
      Enabled
    } @else {
      Disabled
    }
    <button (click)="toggleNotifications()" class="override-btn">
      @if (notificationsEnabled()) {
        Disable
      } @else {
        Enable
      }
    </button>
  </div>
  <!-- existing message and working-hours divs remain -->
</div>
```

</docs-step>

<docs-step title="Наблюдение за реактивным поведением">
Теперь проверьте поведение:

1. Измените статус пользователя — обратите внимание, как `notificationsEnabled` обновляется автоматически.
2. Вручную переключите уведомления — это переопределит вычисленное значение.
3. Снова измените статус — linked-сигнал повторно синхронизируется со своим вычислением.

Это демонстрирует, что linked signals сохраняют свою реактивную связь даже после ручной установки значения!
</docs-step>

</docs-workflow>

Отлично! Вы узнали ключевые различия между computed и linked signals:

- **Computed-сигналы**: Только для чтения, всегда производятся из других сигналов.
- **Linked signals**: Записываемые, могут быть как производными, ТАК И обновляемыми вручную.
- **Используйте computed, когда**: Значение всегда должно вычисляться.
- **Используйте linkedSignal, когда**: Вам нужно вычисление по умолчанию, которое можно переопределить.

В следующем уроке вы
узнаете, [как управлять асинхронными данными с помощью сигналов](/tutorials/signals/4-managing-async-data-with-signals)!
