<docs-decorative-header title="Сигналы" imgSrc="adev/src/assets/images/signals.svg"> <!-- markdownlint-disable-line -->
Создавайте и управляйте динамическими данными.
</docs-decorative-header>

В Angular вы используете _сигналы (signals)_ для создания и управления состоянием. Сигнал — это легковесная обертка
вокруг значения.

Используйте функцию `signal` для создания сигнала для хранения локального состояния:

```typescript
import {signal} from '@angular/core';

// Create a signal with the `signal` function.
const firstName = signal('Morgan');

// Read a signal value by calling it— signals are functions.
console.log(firstName());

// Change the value of this signal by calling its `set` method with a new value.
firstName.set('Jaime');

// You can also use the `update` method to change the value
// based on the previous value.
firstName.update(name => name.toUpperCase());
```

Angular отслеживает, где читаются сигналы и когда они обновляются. Фреймворк использует эту информацию для выполнения
дополнительной работы, такой как обновление DOM новым состоянием. Эта способность реагировать на изменение значений
сигналов с течением времени известна как _реактивность_.

## Вычисляемые выражения (Computed expressions)

`computed` — это сигнал, который производит свое значение на основе других сигналов.

```typescript
import {signal, computed} from '@angular/core';

const firstName = signal('Morgan');
const firstNameCapitalized = computed(() => firstName().toUpperCase());

console.log(firstNameCapitalized()); // MORGAN
```

Сигнал `computed` доступен только для чтения; у него нет методов `set` или `update`. Вместо этого значение сигнала
`computed` автоматически изменяется, когда изменяется любой из сигналов, которые он читает:

```typescript
import {signal, computed} from '@angular/core';

const firstName = signal('Morgan');
const firstNameCapitalized = computed(() => firstName().toUpperCase());
console.log(firstNameCapitalized()); // MORGAN

firstName.set('Jaime');
console.log(firstNameCapitalized()); // JAIME
```

## Использование сигналов в компонентах

Используйте `signal` и `computed` внутри ваших компонентов для создания и управления состоянием:

```typescript
@Component({/* ... */})
export class UserProfile {
  isTrial = signal(false);
  isTrialExpired = signal(false);
  showTrialDuration = computed(() => this.isTrial() && !this.isTrialExpired());

  activateTrial() {
    this.isTrial.set(true);
  }
}
```

TIP: Хотите узнать больше о сигналах Angular? Смотрите [Углубленное руководство по сигналам](guide/signals) для
получения полной информации.

## Следующий шаг

Теперь, когда вы узнали, как объявлять и управлять динамическими данными, пришло время узнать, как использовать эти
данные внутри шаблонов.

<docs-pill-row>
  <docs-pill title="Динамические интерфейсы с шаблонами" href="essentials/templates" />
  <docs-pill title="Углубленное руководство по сигналам" href="guide/signals" />
</docs-pill-row>
