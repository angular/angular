# Добавление логики формы

Signal Forms позволяет добавлять логику в форму с помощью схем. Логика валидации рассматривается в [руководстве по валидации](guide/forms/signals/validation), а это руководство описывает другие правила, доступные в схемах. Вы можете условно отключать поля, скрывать их на основе других значений, делать только для чтения, применять debounce к вводу пользователя и прикреплять метаданные для пользовательских элементов управления.

В этом руководстве показано, как использовать правила `disabled()`, `hidden()`, `readonly()`, `debounce()` и `metadata()` для управления поведением полей.

## Когда добавлять логику формы {#when-to-add-form-logic}

Используйте правила, когда поведение поля зависит от значений других полей или должно обновляться реактивно. Например:

- Поле кода купона, отключённое при слишком низкой сумме заказа
- Поле адреса, скрытое если доставка не требуется
- Поле поиска с debounce для снижения количества API-вызовов

## Как работают правила {#how-rules-work}

Правила привязывают реактивную логику к конкретным полям формы. Большинство правил принимают необязательный аргумент — функцию реактивной логики. Функция реактивной логики автоматически пересчитывается при изменении ссылающихся на неё сигналов, как и `computed`.

```ts
const orderForm = form(this.orderModel, (schemaPath) => {
  disabled(schemaPath.couponCode, ({valueOf}) => valueOf(schemaPath.total) < 50);
  //~~~~~~ ~~~~~~~~~~~~~~~~~~~~~  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //rule     path                   reactive logic function
});
```

Функции реактивной логики получают объект `FieldContext`, предоставляющий доступ к значениям и состоянию полей через вспомогательные функции, такие как `valueOf()` и `stateOf()`. Обычно он деструктурируется для прямого доступа к этим вспомогательным функциям.

NOTE: Параметр обратного вызова схемы (`schemaPath` в этих примерах) — это объект `SchemaPathTree`, предоставляющий пути ко всем полям вашей формы. Вы можете называть этот параметр как угодно.

Полные сведения о свойствах и методах `FieldContext` см. в [руководстве по валидации](guide/forms/signals/validation).

## Предотвращение обновлений поля с помощью `disabled()` {#prevent-field-updates-with-disabled}

Правило `disabled()` настраивает состояние отключения поля.

Оно работает с директивой `[formField]` для автоматической привязки атрибута `disabled` на основе состояния поля, поэтому не нужно вручную добавлять `[disabled]="yourForm.fieldName().disabled()"` в шаблон.

NOTE: Отключённые поля пропускают валидацию — они не участвуют в проверках валидации формы. Значение поля сохраняется, но не валидируется. Подробнее о поведении валидации см. в [руководстве по валидации](guide/forms/signals/validation).

### Всегда отключено {#always-disabled}

Чтобы отключить поле навсегда, вызовите `disabled()` только с путём поля:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, disabled} from '@angular/forms/signals';

@Component({
  selector: 'app-settings',
  imports: [FormField],
  template: `
    <label>
      System ID (cannot be changed)
      <input [formField]="settingsForm.systemId" />
    </label>
  `,
})
export class Settings {
  settingsModel = signal({
    systemId: 'SYS-12345',
    userName: '',
  });

  settingsForm = form(this.settingsModel, (schemaPath) => {
    disabled(schemaPath.systemId);
  });
}
```

### Условное отключение {#conditional-disabling}

Чтобы отключить поле на основе условий, предоставьте функцию реактивной логики, возвращающую `true` (отключено) или `false` (включено):

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, disabled} from '@angular/forms/signals';

@Component({
  selector: 'app-order',
  imports: [FormField],
  template: `
    <label>
      Order Total
      <input type="number" [formField]="orderForm.total" />
    </label>

    <label>
      Coupon Code
      <input [formField]="orderForm.couponCode" />
    </label>
  `,
})
export class Order {
  orderModel = signal({
    total: 25,
    couponCode: '',
  });

  orderForm = form(this.orderModel, (schemaPath) => {
    disabled(schemaPath.couponCode, ({valueOf}) => valueOf(schemaPath.total) < 50);
  });
}
```

В этом примере, когда сумма заказа меньше $50, поле кода купона отключается.

### Причины отключения {#disabled-reasons}

При отключении поля предоставляйте пользователю понятные пояснения, возвращая строку вместо `true`:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, disabled} from '@angular/forms/signals';

@Component({
  selector: 'app-order',
  imports: [FormField],
  template: `
    <label>
      Order Total
      <input type="number" [formField]="orderForm.total" />
    </label>

    <label>
      Coupon Code
      <input [formField]="orderForm.couponCode" />
    </label>

    @if (orderForm.couponCode().disabled()) {
      <div class="info">
        @for (reason of orderForm.couponCode().disabledReasons(); track reason) {
          <p>{{ reason.message }}</p>
        }
      </div>
    }
  `,
})
export class Order {
  orderModel = signal({
    total: 25,
    couponCode: '',
  });

  orderForm = form(this.orderModel, (schemaPath) => {
    disabled(schemaPath.couponCode, ({valueOf}) =>
      valueOf(schemaPath.total) < 50 ? 'Order must be $50 or more to use a coupon' : false,
    );
  });
}
```

Функция реактивной логики возвращает:

- **Строку** для отключения поля с причиной
- `false` для включения поля (не просто любое ложное значение — используйте `false` явно)

Получайте доступ к причинам через сигнал `disabledReasons()` в состоянии поля. Каждая причина имеет свойство `message`, содержащее возвращённую вами строку.

#### Несколько причин отключения {#multiple-disabled-reasons}

Вы также можете вызывать `disabled()` несколько раз для одного поля, и все возвращаемые причины накапливаются:

```angular-ts
orderForm = form(this.orderModel, (schemaPath) => {
  disabled(schemaPath.promoCode, ({valueOf}) =>
    !valueOf(schemaPath.hasAccount) ? 'You must have an account to use promo codes' : false,
  );
  disabled(schemaPath.promoCode, ({valueOf}) =>
    valueOf(schemaPath.total) < 25 ? 'Order must be at least $25' : false,
  );
});
```

Если оба условия истинны, поле показывает обе причины отключения. Этот паттерн полезен для сложных правил доступности, которые нужно держать отдельно.

## Настройка состояния `hidden()` для полей {#configuring-hidden-state-on-fields}

Правило `hidden()` настраивает состояние скрытости поля. Однако это устанавливает только программное состояние. **Вы управляете тем, появляется ли поле в UI**.

IMPORTANT: В отличие от `disabled` и `readonly`, не существует нативного DOM-свойства для состояния `hidden`. Директива `[formField]` не применяет атрибут `hidden` к элементам. Для условного рендеринга полей на основе состояния `hidden()` необходимо использовать `@if` или CSS в шаблоне.

NOTE: Как и отключённые поля, скрытые поля также пропускают валидацию. Подробнее см. в [руководстве по валидации](guide/forms/signals/validation).

### Базовое скрытие поля {#basic-field-hiding}

Используйте `hidden()` с функцией реактивной логики, возвращающей `true` (скрыто) или `false` (видимо):

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, hidden} from '@angular/forms/signals';

@Component({
  selector: 'app-profile',
  imports: [FormField],
  template: `
    <label>
      <input type="checkbox" [formField]="profileForm.isPublic" />
      Make profile public
    </label>

    @if (!profileForm.publicUrl().hidden()) {
      <label>
        Public URL
        <input [formField]="profileForm.publicUrl" />
      </label>
    }
  `,
})
export class Profile {
  profileModel = signal({
    isPublic: false,
    publicUrl: '',
  });

  profileForm = form(this.profileModel, (schemaPath) => {
    hidden(schemaPath.publicUrl, ({valueOf}) => !valueOf(schemaPath.isPublic));
  });
}
```

## Отображение нередактируемых полей с помощью `readonly()` {#display-uneditable-fields-with-readonly}

Правило `readonly()` запрещает пользователям обновлять поле. Директива `[FormField]` автоматически привязывает это состояние к HTML-атрибуту `readonly`, который предотвращает редактирование, но позволяет пользователям фокусироваться на поле и выделять текст.

NOTE: Поля только для чтения пропускают [валидацию](guide/forms/signals/validation).

### Всегда только для чтения {#always-readonly}

Чтобы сделать поле постоянно только для чтения, вызовите `readonly()` только с путём поля:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, readonly} from '@angular/forms/signals';

@Component({
  selector: 'app-account',
  imports: [FormField],
  template: `
    <label>
      Username (cannot be changed)
      <input [formField]="accountForm.username" />
    </label>

    <label>
      Email
      <input [formField]="accountForm.email" />
    </label>
  `,
})
export class Account {
  accountModel = signal({
    username: 'johndoe',
    email: 'john@example.com',
  });

  accountForm = form(this.accountModel, (schemaPath) => {
    readonly(schemaPath.username);
  });
}
```

Директива `[FormField]` автоматически привязывает атрибут `readonly` на основе состояния поля.

### Условное только для чтения {#conditional-readonly}

Чтобы сделать поле только для чтения на основе условий, предоставьте функцию реактивной логики:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, readonly} from '@angular/forms/signals';

@Component({
  selector: 'app-document',
  imports: [FormField],
  template: `
    <label>
      <input type="checkbox" [formField]="documentForm.isLocked" />
      Lock document
    </label>

    <label>
      Document Title
      <input [formField]="documentForm.title" />
    </label>
  `,
})
export class Document {
  documentModel = signal({
    isLocked: false,
    title: 'Untitled',
  });

  documentForm = form(this.documentModel, (schemaPath) => {
    readonly(schemaPath.title, ({valueOf}) => valueOf(schemaPath.isLocked));
  });
}
```

Когда `isLocked` равно true, поле заголовка становится только для чтения.

## Выбор между hidden, disabled и readonly {#choose-between-hidden-disabled-and-readonly}

Эти три функции конфигурации управляют доступностью поля по-разному:

Выбирайте `hidden()` когда поле:

- Не должно вообще появляться в UI
- Не актуально для текущего состояния формы
- Пример: поля адреса доставки, когда установлен флажок «Совпадает с адресом выставления счёта»

Выбирайте `disabled()` когда поле:

- Должно быть видимым, но не редактируемым
- Должно показывать, почему оно недоступно (с помощью причин отключения)
- Должно быть исключено из отправки HTML-формы
- Пример: кнопка отправки, отключённая до тех пор, пока форма не будет действительной; поля утверждения, отключённые для пользователей без прав администратора

Выбирайте `readonly()` когда поле:

- Должно быть видимым, но не редактируемым
- Содержит данные, которые пользователи должны видеть, выбирать или копировать
- Должно быть включено в отправку HTML-формы
- Пример: номер подтверждения заказа, коды-ссылки, сгенерированные системой

Все три пропускают валидацию и предотвращают редактирование пользователем при активном состоянии. Ключевые различия:

| Характеристика                           | `hidden()` | `disabled()` | `readonly()` |
| ---------------------------------------- | ---------- | ------------ | ------------ |
| Видимо в UI                              | Нет        | Да           | Да           |
| Пользователи могут фокусироваться/выбирать | Нет      | Нет          | Да           |
| Включено в отправку HTML-формы           | Нет        | Нет          | Да           |

## Задержка операций ввода с помощью `debounce()` {#delay-input-operations-with-debounce}

Правило `debounce()` откладывает обновление модели формы. Это полезно для оптимизации производительности и снижения числа ненужных операций при быстром вводе.

### Что делает debounce {#what-debouncing-does}

Без debounce каждое нажатие клавиши немедленно обновляет модель формы. Это может вызывать:

- Дорогостоящие вычисляемые сигналы, пересчитывающиеся при каждом изменении
- Проверки валидации после каждого символа
- API-вызовы или другие побочные эффекты, привязанные к значению модели

Debounce откладывает эти обновления и снижает ненужную нагрузку.

### Базовый debounce {#basic-debouncing}

Вы можете применить debounce к полю, указав задержку в миллисекундах:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, debounce} from '@angular/forms/signals';

@Component({
  selector: 'app-search',
  imports: [FormField],
  template: `
    <label>
      Search
      <input [formField]="searchForm.query" />
    </label>

    <p>Searching for: {{ searchForm.query().value() }}</p>
  `,
})
export class Search {
  searchModel = signal({
    query: '',
  });

  searchForm = form(this.searchModel, (schemaPath) => {
    debounce(schemaPath.query, 300);
  });
}
```

С задержкой debounce 300мс:

- Пользователь вводит данные в поле ввода
- Модель формы обновляется только после 300мс бездействия ввода
- Если пользователь продолжает вводить, таймер сбрасывается при каждом нажатии клавиши
- Как только пользователь делает паузу на 300мс, модель обновляется финальным значением

### Гарантии синхронизации {#timing-guarantees}

Функция `debounce()` гарантирует, что пользователи не потеряют данные через следующие механизмы:

- **При пометке как touched:** Значение синхронизируется немедленно, прерывая ожидаемую задержку debounce. Это происходит, когда поле теряет фокус (blur) или явно помечается как touched.
- **При отправке формы:** Все поля помечаются как touched перед валидацией, что гарантирует немедленную синхронизацию всех значений с debounce.

Это означает, что пользователи могут быстро вводить, переходить на другое поле или отправлять форму без ожидания истечения задержек debounce.

### Пользовательская логика debounce {#custom-debounce-logic}

Для продвинутого управления предоставьте функцию-дебаунсер, управляющую синхронизацией значения. Эта функция вызывается каждый раз, когда обновляется значение элемента управления, и может возвращать `undefined` для немедленной синхронизации или Promise, предотвращающий синхронизацию до его разрешения:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, debounce} from '@angular/forms/signals';

@Component({
  selector: 'app-search',
  imports: [FormField],
  template: `
    <label>
      Search
      <input [formField]="searchForm.query" />
    </label>
  `,
})
export class Search {
  searchModel = signal({
    query: '',
  });

  searchForm = form(this.searchModel, (schemaPath) => {
    debounce(schemaPath.query, () => {
      // Return a promise that resolves after 500ms
      return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 500);
      });
    });
  });
}
```

Функция-дебаунсер может возвращать:

- `undefined` для немедленной синхронизации значения
- `Promise<void>`, предотвращающий синхронизацию до его разрешения

Случаи использования пользовательской логики debounce:

- Реализация пользовательской логики тайминга помимо простых задержек
- Координация синхронизации с внешними событиями
- Условный debounce на основе состояния приложения

### Когда использовать debounce {#when-to-use-debouncing}

Debounce наиболее полезен когда:

- У вас есть дорогостоящие вычисляемые сигналы, зависящие от значения поля
- Поле запускает API-вызовы или другие побочные эффекты
- Вы хотите снизить накладные расходы на валидацию при быстром вводе
- Профилирование производительности показывает, что обновления модели вызывают замедления

Не используйте debounce если:

- Поле требует немедленных обновлений для хорошего UX (например, поля калькулятора)
- Выигрыш в производительности незначителен
- Пользователи ожидают обратной связи в реальном времени

## Привязка данных к полю с помощью `metadata()` {#associate-data-with-a-field-using-metadata}

Метаданные позволяют прикреплять вычисляемую информацию к полям, которую могут считывать [пользовательские элементы управления](guide/forms/signals/custom-controls) или логика формы. Типичные случаи использования включают атрибуты HTML-ввода (min, max, maxlength, pattern), пользовательские подсказки UI (текст-заполнитель, текст справки) и информацию о доступности.

### Предопределённые ключи метаданных {#pre-defined-metadata-keys}

Signal Forms предоставляет шесть предопределённых ключей метаданных, которые правила валидации заполняют автоматически:

- `REQUIRED` — является ли поле обязательным (`boolean`)
- `MIN` — минимальное числовое значение (`number | undefined`)
- `MAX` — максимальное числовое значение (`number | undefined`)
- `MIN_LENGTH` — минимальная длина строки/массива (`number | undefined`)
- `MAX_LENGTH` — максимальная длина строки/массива (`number | undefined`)
- `PATTERN` — шаблон регулярного выражения (`RegExp[]` — массив для поддержки нескольких шаблонов)

При использовании правил валидации, таких как `required()` или `min()`, они автоматически устанавливают соответствующие метаданные. Функция `metadata()` предоставляет способ публикации дополнительных данных, связанных с полем.

### Чтение предопределённых метаданных {#reading-pre-defined-metadata}

Директива `[FormField]` автоматически привязывает встроенные метаданные к HTML-атрибутам. Вы также можете читать метаданные напрямую, используя встроенные аксессоры в состоянии поля:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, required, min, max} from '@angular/forms/signals';

@Component({
  selector: 'app-age',
  imports: [FormField],
  template: `
    <label>
      Age (between {{ ageForm.age().min() }} and {{ ageForm.age().max() }})
      <input type="number" [formField]="ageForm.age" />
    </label>

    @if (ageForm.age().required()) {
      <span class="required-indicator">*</span>
    }
  `,
})
export class Age {
  ageModel = signal({
    age: 0,
  });

  ageForm = form(this.ageModel, (schemaPath) => {
    required(schemaPath.age);
    min(schemaPath.age, 18);
    max(schemaPath.age, 120);
  });
}
```

Директива `[formField]` автоматически привязывает атрибуты `required`, `min` и `max` к полю ввода. Вы можете читать эти значения с помощью `field().required()`, `field().min()` и `field().max()` для отображения или логических целей.

### Ручная установка метаданных {#setting-metadata-manually}

Используйте функцию `metadata()` для установки значений метаданных, когда правила валидации не устанавливают их автоматически. Для встроенных метаданных, таких как `MIN` и `MAX`, предпочтительнее использовать правила валидации:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, min, max, validate} from '@angular/forms/signals';

@Component({
  selector: 'app-custom',
  imports: [formField],
  template: ` <input [formField]="customForm.score" /> `,
})
export class Custom {
  customModel = signal({score: 0});

  customForm = form(this.customModel, (schemaPath) => {
    // Use built-in validation rules - they automatically set metadata
    min(schemaPath.score, 0);
    max(schemaPath.score, 100);

    // Add custom validation logic if needed
    validate(schemaPath.score, ({value}) => {
      const score = value();
      // Custom validation beyond min/max (e.g., must be multiple of 5)
      if (score % 5 !== 0) {
        return {kind: 'increment', message: 'Score must be a multiple of 5'};
      }
      return null;
    });
  });
}
```

### Создание пользовательских ключей метаданных {#creating-custom-metadata-keys}

Создавайте собственные ключи метаданных для специфичной для приложения информации:

```angular-ts
import {createMetadataKey, metadata} from '@angular/forms/signals';

// Define at module level (not inside components)
export const PLACEHOLDER = createMetadataKey<string>();
export const HELP_TEXT = createMetadataKey<string>();

// Use in schema
form(model, (schemaPath) => {
  metadata(schemaPath.email, PLACEHOLDER, () => 'user@example.com');
  metadata(schemaPath.email, HELP_TEXT, () => 'We will never share your email');
});

// Read in component
const placeholderText = myForm.email().metadata(PLACEHOLDER);
const helpText = myForm.email().metadata(HELP_TEXT);
```

По умолчанию пользовательские ключи метаданных используют стратегию «побеждает последняя запись» — если вызвать `metadata()` несколько раз с одним ключом, сохраняется только последнее значение.

**Важно:** Всегда определяйте ключи метаданных на уровне модуля, никогда внутри компонентов. Ключи метаданных полагаются на идентичность объектов, и их пересоздание лишает этой идентичности.

### Накопление метаданных с редьюсерами {#accumulating-metadata-with-reducers}

По умолчанию многократный вызов `metadata()` с одним ключом использует «побеждает последняя запись» — сохраняется только финальное значение. Чтобы вместо этого накапливать значения, передайте редьюсер в `createMetadataKey()`:

```angular-ts
import {createMetadataKey, metadata, MetadataReducer} from '@angular/forms/signals';

// Create a key that accumulates values into an array
export const HINTS = createMetadataKey<string, string[]>(MetadataReducer.list());

// Multiple calls accumulate values
form(model, (schemaPath) => {
  metadata(schemaPath.password, HINTS, () => 'At least 8 characters');
  metadata(schemaPath.password, HINTS, () => 'Include a number');
  metadata(schemaPath.password, HINTS, () => 'Include a special character');
});

// Result: Signal containing the accumulated array
const passwordHints = passwordForm.password().metadata(HINTS)();
// ['At least 8 characters', 'Include a number', 'Include a special character']
```

Angular предоставляет встроенные редьюсеры через `MetadataReducer`:

- `MetadataReducer.list()` — накапливает значения в массив
- `MetadataReducer.min()` — сохраняет минимальное значение
- `MetadataReducer.max()` — сохраняет максимальное значение
- `MetadataReducer.or()` — логическое ИЛИ булевых значений
- `MetadataReducer.and()` — логическое И булевых значений

### Управляемые ключи метаданных {#managed-metadata-keys}

Используйте `createManagedMetadataKey()`, когда нужно вычислить новое значение из накопленного результата. Функция преобразования получает сигнал накопленного значения и возвращает вычисленный результат:

```angular-ts
import {createManagedMetadataKey, metadata, MetadataReducer} from '@angular/forms/signals';

// Accumulate hints and compute additional data from the result
export const HINTS = createManagedMetadataKey(
  (signal) =>
    computed(() => {
      const hints = signal();
      return {
        messages: hints,
        count: hints?.length ?? 0,
      };
    }),
  MetadataReducer.list(),
);

// Multiple calls accumulate values
form(model, (schemaPath) => {
  metadata(schemaPath.password, HINTS, () => 'At least 8 characters');
  metadata(schemaPath.password, HINTS, () => 'Include a number');
  metadata(schemaPath.password, HINTS, () => 'Include a special character');
});

// Result: Signal with transformed value
const passwordHints = passwordForm.password().metadata(HINTS)();
// { messages: ['At least 8 characters', 'Include a number', 'Include a special character'], count: 3 }
```

Управляемый ключ метаданных принимает два аргумента:

1. **Функция преобразования** — вычисляет новое значение из накопленного результата (получает сигнал накопленного значения)
2. **Редьюсер** — определяет способ накопления значений (необязательно — по умолчанию «побеждает последняя запись»)

### Реактивные метаданные {#reactive-metadata}

Делайте метаданные реактивными к значениям других полей:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, max} from '@angular/forms/signals';

@Component({
  selector: 'app-inventory',
  imports: [formField],
  template: `
    <label>
      Item
      <select [formField]="inventoryForm.item">
        <option value="widget">Widget</option>
        <option value="gadget">Gadget</option>
      </select>
    </label>

    <label>
      Quantity (max: {{ inventoryForm.quantity().max() }})
      <input
        type="number"
        [formField]="inventoryForm.quantity"
        [max]="inventoryForm.quantity().max()"
      />
    </label>
  `,
})
export class Inventory {
  inventoryModel = signal({
    item: 'widget',
    quantity: 0,
  });

  inventoryForm = form(this.inventoryModel, (schemaPath) => {
    max(schemaPath.quantity, ({valueOf}) => {
      const item = valueOf(schemaPath.item);
      return item === 'widget' ? 100 : 50;
    });
  });
}
```

Правило валидации `max()` реактивно устанавливает метаданные `MAX` на основе выбранного элемента. Это демонстрирует, как правила валидации могут иметь условные значения, изменяющиеся при обновлении других полей.

### Использование метаданных в пользовательских элементах управления {#using-metadata-in-custom-controls}

Пользовательские элементы управления могут считывать метаданные для настройки HTML-атрибутов и поведения:

```angular-ts
import {Component, input, computed, model} from '@angular/core';
import {FormValueControl, Field, PLACEHOLDER} from '@angular/forms/signals';

@Component({
  selector: 'custom-input',
  template: `
    <input
      type="number"
      [value]="state().value()"
      (input)="state().value.set(($event.target as HTMLInputElement).valueAsNumber)"
      [min]="state().min()"
      [max]="state().max()"
      [required]="state().required()"
      [placeholder]="placeholderText()"
    />
  `,
})
export class CustomInput implements FormValueControl<number> {
  // Bind to the form field.
  formField = input.required<Field<number>>();

  // Compute the current field state.
  state = computed(() => this.formField()());

  // Required property of the FormValueControl interface.
  value = model(0);

  placeholderText = computed(() => this.state().metadata(PLACEHOLDER)() ?? '');
}
```

Этот паттерн позволяет пользовательским элементам управления автоматически настраиваться на основе правил валидации и метаданных, определённых в схеме.

TIP: Подробнее о создании пользовательских элементов управления см. в [руководстве по пользовательским элементам управления](guide/forms/signals/custom-controls).

## Комбинирование правил {#combining-rules}

Вы можете применять несколько правил к одному полю и использовать условную логику для применения целых групп правил на основе состояния формы.

### Несколько правил для одного поля {#multiple-rules-on-one-field}

Применяйте несколько правил для настройки всех аспектов поведения поля:

```angular-ts
import {Component, signal} from '@angular/core';
import {
  form,
  FormField,
  disabled,
  hidden,
  debounce,
  metadata,
  PLACEHOLDER,
} from '@angular/forms/signals';

@Component({
  selector: 'app-promo',
  imports: [formField],
  template: `
    @if (!promoForm.promoCode().hidden()) {
      <label>
        Promo Code
        <input [formField]="promoForm.promoCode" />
      </label>
    }
  `,
})
export class Promo {
  promoModel = signal({
    hasAccount: false,
    subscriptionType: 'free' as 'free' | 'premium',
    promoCode: '',
  });

  promoForm = form(this.promoModel, (schemaPath) => {
    disabled(schemaPath.promoCode, ({valueOf}) =>
      !valueOf(schemaPath.hasAccount) ? 'You must have an account' : false,
    );
    hidden(schemaPath.promoCode, ({valueOf}) => valueOf(schemaPath.subscriptionType) === 'free');
    debounce(schemaPath.promoCode, 300);
    metadata(schemaPath.promoCode, PLACEHOLDER, () => 'Enter promo code');
  });
}
```

Эти правила работают вместе:

- Hidden имеет приоритет — если поле скрыто, состояние disabled не имеет значения
- Disabled предотвращает редактирование независимо от состояния readonly
- Debounce влияет на обновления модели независимо от другого состояния
- Метаданные независимы и всегда доступны

### Условная логика с applyWhen {#conditional-logic-with-applywhen}

Используйте `applyWhen()` для условного применения целых групп правил:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, applyWhen, required, pattern} from '@angular/forms/signals';

@Component({
  selector: 'app-address',
  imports: [formField],
  template: `
    <label>
      Country
      <select [formField]="addressForm.country">
        <option value="US">United States</option>
        <option value="CA">Canada</option>
      </select>
    </label>

    <label>
      Zip/Postal Code
      <input [formField]="addressForm.zipCode" />
    </label>
  `,
})
export class Address {
  addressModel = signal({
    country: 'US',
    zipCode: '',
  });

  addressForm = form(this.addressModel, (schemaPath) => {
    applyWhen(
      schemaPath,
      ({valueOf}) => valueOf(schemaPath.country) === 'US',
      (schemaPath) => {
        // Only applied when country is US
        required(schemaPath.zipCode);
        pattern(schemaPath.zipCode, /^\d{5}(-\d{4})?$/);
      },
    );
  });
}
```

Функция `applyWhen()` получает:

1. Путь для применения логики (часто корневой путь формы)
2. Функцию реактивной логики, возвращающую `true` (применить) или `false` (не применять)
3. Функцию схемы, определяющую условные правила

Условные правила выполняются только когда условие истинно. Это полезно для сложных форм, где правила валидации или поведение меняются в зависимости от выборов пользователя.

### Переиспользуемые функции схемы {#reusable-schema-functions}

Извлекайте общие конфигурации правил в переиспользуемые функции:

```angular-ts
import {SchemaPath, debounce, metadata, maxLength, PLACEHOLDER} from '@angular/forms/signals';

function emailFieldConfig(path: SchemaPath<string>) {
  debounce(path, 300);
  metadata(path, PLACEHOLDER, () => 'user@example.com');
  maxLength(path, 255);
}

// Use in multiple forms
const contactForm = form(contactModel, (schemaPath) => {
  emailFieldConfig(schemaPath.email);
  emailFieldConfig(schemaPath.alternateEmail);
});

const registrationForm = form(registrationModel, (schemaPath) => {
  emailFieldConfig(schemaPath.email);
});
```

Этот паттерн полезен, когда у вас есть стандартные конфигурации полей, используемые в нескольких формах приложения.

## Дальнейшие шаги {#next-steps}

Чтобы узнать больше о Signal Forms, ознакомьтесь со связанными руководствами:

- [Управление состоянием полей](guide/forms/signals/field-state-management) — узнайте, как использовать сигналы состояния, создаваемые этими функциями, в шаблонах и логике компонентов
- [Валидация](guide/forms/signals/validation) — узнайте о правилах валидации и обработке ошибок
- [Пользовательские элементы управления](guide/forms/signals/custom-controls) — узнайте, как пользовательские элементы управления могут считывать метаданные и состояние для автоматической настройки
