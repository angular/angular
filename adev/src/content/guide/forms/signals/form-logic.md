# Добавление логики формы {#adding-form-logic}

Signal Forms позволяет добавлять логику в форму с помощью схем. Логика валидации рассматривается в [руководстве по валидации](guide/forms/signals/validation), а это руководство описывает другие правила, доступные в схемах. Вы можете условно отключать поля, скрывать их на основе других значений, делать доступными только для чтения, применять дебаунс к пользовательскому вводу и прикреплять метаданные для пользовательских элементов управления.

В этом руководстве показано, как использовать правила `disabled()`, `hidden()`, `readonly()`, `debounce()` и `metadata()` для управления поведением полей.

## Когда добавлять логику формы {#when-to-add-form-logic}

Используйте правила, когда поведение поля зависит от значений других полей или должно обновляться реактивно. Например:

- поле кода купона, отключённое при слишком низкой сумме заказа;
- поле адреса, скрытое до тех пор, пока не требуется доставка;
- поле поиска с дебаунсом для сокращения обращений к API.

## Как работают правила {#how-rules-work}

Правила привязывают реактивную логику к конкретным полям формы. Большинство правил принимают функцию реактивной логики в качестве необязательного аргумента. Функция реактивной логики автоматически пересчитывается при изменении используемых ею сигналов, как `computed`.

```ts
const orderForm = form(this.orderModel, (schemaPath) => {
  disabled(schemaPath.couponCode, ({valueOf}) => valueOf(schemaPath.total) < 50);
  //~~~~~~ ~~~~~~~~~~~~~~~~~~~~~  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //rule     path                   reactive logic function
});
```

Функции реактивной логики получают объект `FieldContext`, предоставляющий доступ к значениям и состоянию полей через вспомогательные функции `valueOf()` и `stateOf()`. Зачастую он деструктурируется для прямого доступа к этим помощникам.

NOTE: Параметр обратного вызова схемы (`schemaPath` в этих примерах) — это объект `SchemaPathTree`, предоставляющий пути ко всем полям формы. Этому параметру можно дать любое имя.

Полную документацию по свойствам и методам `FieldContext` см. в [руководстве по валидации](guide/forms/signals/validation).

## Предотвращение обновлений поля с помощью `disabled()` {#prevent-field-updates-with-disabled}

Правило `disabled()` настраивает состояние отключённости поля.

Оно работает совместно с директивой `[formField]`, автоматически привязывая атрибут `disabled` на основе состояния поля, поэтому не нужно вручную добавлять `[disabled]="yourForm.fieldName().disabled()"` в шаблон.

NOTE: Отключённые поля пропускают валидацию — они не участвуют в проверках валидации формы. Значение поля сохраняется, но не проверяется. Подробности о поведении валидации см. в [руководстве по валидации](guide/forms/signals/validation).

### Всегда отключено {#always-disabled}

Чтобы постоянно отключить поле, вызовите `disabled()` только с путём к полю:

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

Чтобы отключить поле при определённых условиях, предоставьте функцию реактивной логики, возвращающую `true` (отключено) или `false` (включено):

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

В этом примере при сумме заказа менее $50 поле кода купона отключается.

### Причины отключения {#disabled-reasons}

При отключении поля предоставляйте пользователю объяснения, возвращая строку вместо `true`:

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

- **строку** для отключения поля с указанием причины;
- `false` для включения поля (не просто любое ложное значение — используйте именно `false`).

Доступ к причинам осуществляется через сигнал `disabledReasons()` в состоянии поля. Каждая причина имеет свойство `message`, содержащее возвращённую строку.

#### Несколько причин отключения {#multiple-disabled-reasons}

Можно также вызвать `disabled()` несколько раз для одного поля, и все возвращённые причины накапливаются:

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

Если оба условия выполняются, поле отображает обе причины отключения. Этот паттерн удобен для сложных правил доступности, которые хочется хранить раздельно.

## Настройка состояния `hidden()` для полей {#configuring-hidden-state-on-fields}

Правило `hidden()` настраивает состояние скрытости поля. Однако оно лишь устанавливает программное состояние. **Вы управляете тем, отображается ли поле в UI**.

IMPORTANT: В отличие от `disabled` и `readonly`, для состояния `hidden` нет нативного DOM-свойства. Директива `[formField]` не добавляет атрибут `hidden` к элементам. Необходимо использовать `@if` или CSS в шаблоне для условного рендеринга полей на основе состояния `hidden()`.

NOTE: Как и отключённые поля, скрытые поля также пропускают валидацию. Подробности см. в [руководстве по валидации](guide/forms/signals/validation).

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

Правило `readonly()` предотвращает обновление поля пользователем. Директива `[FormField]` автоматически привязывает это состояние к HTML-атрибуту `readonly`, который предотвращает редактирование, при этом позволяя фокусироваться на поле и выделять текст.

NOTE: Поля только для чтения пропускают [валидацию](guide/forms/signals/validation).

### Всегда только для чтения {#always-readonly}

Чтобы постоянно сделать поле доступным только для чтения, вызовите `readonly()` только с путём к полю:

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

### Условный режим только для чтения {#conditional-readonly}

Чтобы сделать поле доступным только для чтения при определённых условиях, предоставьте функцию реактивной логики:

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

Когда `isLocked` равно `true`, поле заголовка становится доступным только для чтения.

## Выбор между hidden, disabled и readonly {#choose-between-hidden-disabled-and-readonly}

Эти три функции настройки управляют доступностью поля по-разному:

Используйте `hidden()`, когда поле:

- вообще не должно отображаться в UI;
- не имеет отношения к текущему состоянию формы;
- например: поля адреса доставки, когда установлен флажок «совпадает с адресом выставления счёта».

Используйте `disabled()`, когда поле:

- должно быть видимым, но недоступным для редактирования;
- должно объяснять, почему оно недоступно (с помощью причин отключения);
- должно быть исключено из отправки HTML-формы;
- например: кнопка «Отправить», отключённая до тех пор, пока форма не валидна; поля подтверждения, отключённые для пользователей без прав администратора.

Используйте `readonly()`, когда поле:

- должно быть видимым, но недоступным для редактирования;
- содержит данные, которые пользователи должны видеть, выделять или копировать;
- должно быть включено в отправку HTML-формы;
- например: номер подтверждения заказа, системные справочные коды.

Все три пропускают валидацию и предотвращают редактирование пользователем в активном состоянии. Ключевые различия:

| Возможность                         | `hidden()` | `disabled()` | `readonly()` |
| ----------------------------------- | ---------- | ------------ | ------------ |
| Видимость в UI                      | Нет        | Да           | Да           |
| Пользователь может фокусироваться   | Нет        | Нет          | Да           |
| Включается в отправку HTML-формы    | Нет        | Нет          | Да           |

## Задержка операций ввода с помощью `debounce()` {#delay-input-operations-with-debounce}

Правило `debounce()` откладывает обновление модели формы. Это полезно для оптимизации производительности и сокращения ненужных операций при быстром вводе.

### Что делает дебаунс {#what-debouncing-does}

Без дебаунса каждое нажатие клавиши немедленно обновляет модель формы. Это может вызывать:

- пересчёт дорогостоящих вычисляемых сигналов при каждом изменении;
- проверки валидации после каждого символа;
- вызовы API или другие побочные эффекты, связанные со значением модели.

Дебаунс откладывает эти обновления и сокращает ненужную работу.

### Базовый дебаунс {#basic-debouncing}

Поле можно дебаунсировать, указав задержку в миллисекундах:

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

При дебаунсе 300 мс:

- пользователь вводит текст в поле ввода;
- модель формы обновляется только через 300 мс после прекращения ввода;
- если пользователь продолжает вводить, таймер сбрасывается при каждом нажатии клавиши;
- как только пользователь делает паузу на 300 мс, модель обновляется финальным значением.

### Гарантии синхронизации {#timing-guarantees}

Функция `debounce()` обеспечивает защиту от потери данных пользователем посредством следующих механизмов:

- **При отметке как touched:** значение синхронизируется немедленно, прерывая любую ожидающую задержку дебаунса. Это происходит при потере фокуса полем (blur) или при явной отметке как touched.
- **При отправке формы:** все поля отмечаются как touched перед валидацией, что обеспечивает немедленную синхронизацию всех дебаунсированных значений.

Это означает, что пользователи могут быстро набирать текст, нажимать Tab или отправлять форму, не дожидаясь истечения задержек дебаунса.

### Пользовательская логика дебаунса {#custom-debounce-logic}

Для расширенного управления предоставьте функцию-дебаунсер, контролирующую момент синхронизации значения. Эта функция вызывается при каждом обновлении значения элемента управления и может возвращать либо `undefined` для немедленной синхронизации, либо Promise, предотвращающий синхронизацию до его разрешения:

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

- `undefined` для немедленной синхронизации значения;
- `Promise<void>`, предотвращающий синхронизацию до его разрешения.

Сценарии использования пользовательской логики дебаунса:

- реализация пользовательской логики тайминга, выходящей за рамки простых задержек;
- координация синхронизации с внешними событиями;
- условный дебаунс в зависимости от состояния приложения.

### Когда использовать дебаунс {#when-to-use-debouncing}

Дебаунс наиболее полезен когда:

- есть дорогостоящие вычисляемые сигналы, зависящие от значения поля;
- поле вызывает обращения к API или другие побочные эффекты;
- нужно снизить нагрузку от валидации при быстром вводе;
- профилирование производительности показывает, что обновления модели вызывают замедление.

Не используйте дебаунс, если:

- поле требует немедленных обновлений для хорошего UX (например, поля калькулятора);
- выигрыш в производительности незначителен;
- пользователи ожидают обратной связи в реальном времени.

## Связывание данных с полем с помощью `metadata()` {#associate-data-with-a-field-using-metadata}

Метаданные позволяют прикреплять вычисляемую информацию к полям, которую могут считывать [пользовательские элементы управления](guide/forms/signals/custom-controls) или логика формы. Распространённые сценарии использования: HTML-атрибуты ввода (min, max, maxlength, pattern), подсказки пользовательского UI (текст placeholder, вспомогательный текст) и информация для доступности.

### Предопределённые ключи метаданных {#pre-defined-metadata-keys}

Signal Forms предоставляет шесть предопределённых ключей метаданных, которые правила валидации заполняют автоматически:

- `REQUIRED` — является ли поле обязательным (`boolean`);
- `MIN` — минимальное числовое значение (`number | undefined`);
- `MAX` — максимальное числовое значение (`number | undefined`);
- `MIN_LENGTH` — минимальная длина строки/массива (`number | undefined`);
- `MAX_LENGTH` — максимальная длина строки/массива (`number | undefined`);
- `PATTERN` — шаблон регулярного выражения (`RegExp[]` — массив для поддержки нескольких шаблонов).

При использовании правил валидации, таких как `required()` или `min()`, они автоматически устанавливают соответствующие метаданные. Функция `metadata()` позволяет публиковать дополнительные данные, связанные с полем.

### Чтение предопределённых метаданных {#reading-pre-defined-metadata}

Директива `[FormField]` автоматически привязывает встроенные метаданные к HTML-атрибутам. Метаданные также можно читать напрямую, используя встроенные методы доступа к состоянию поля:

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

Директива `[formField]` автоматически привязывает атрибуты `required`, `min` и `max` к полю ввода. Эти значения можно читать с помощью `field().required()`, `field().min()` и `field().max()` для отображения или логических целей.

### Установка метаданных вручную {#setting-metadata-manually}

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

Создавайте собственные ключи метаданных для информации, специфичной для приложения:

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

По умолчанию пользовательские ключи метаданных используют стратегию «побеждает последняя запись» — при нескольких вызовах `metadata()` с одним и тем же ключом сохраняется только последнее значение.

**Важно:** всегда определяйте ключи метаданных на уровне модуля, а не внутри компонентов. Ключи метаданных опираются на идентичность объектов, и их воссоздание приводит к потере этой идентичности.

### Накопление метаданных с помощью редьюсеров {#accumulating-metadata-with-reducers}

По умолчанию несколько вызовов `metadata()` с одним и тем же ключом используют принцип «побеждает последняя запись» — сохраняется только финальное значение. Чтобы вместо этого накапливать значения, передайте редьюсер в `createMetadataKey()`:

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

- `MetadataReducer.list()` — накапливает значения в массив;
- `MetadataReducer.min()` — сохраняет минимальное значение;
- `MetadataReducer.max()` — сохраняет максимальное значение;
- `MetadataReducer.or()` — логическое ИЛИ булевых значений;
- `MetadataReducer.and()` — логическое И булевых значений.

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

1. **Функция преобразования** — вычисляет новое значение из накопленного результата (получает сигнал накопленного значения).
2. **Редьюсер** — определяет способ накопления значений (необязателен — по умолчанию «побеждает последняя запись»).

### Реактивные метаданные {#reactive-metadata}

Сделайте метаданные реактивными по отношению к другим значениям полей:

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

Правило валидации `max()` реактивно устанавливает метаданные `MAX` на основе выбранного товара. Это демонстрирует, как правила валидации могут иметь условные значения, изменяющиеся при обновлении других полей.

### Использование метаданных в пользовательских элементах управления {#using-metadata-in-custom-controls}

Пользовательские элементы управления могут читать метаданные для настройки своих HTML-атрибутов и поведения:

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

Этот паттерн позволяет пользовательским элементам управления автоматически настраивать себя на основе правил валидации и метаданных, определённых в схеме.

TIP: Подробнее о создании пользовательских элементов управления см. в [руководстве по пользовательским элементам управления](guide/forms/signals/custom-controls).

## Комбинирование правил {#combining-rules}

Можно применять несколько правил к одному полю и использовать условную логику для применения целых групп правил в зависимости от состояния формы.

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

Эти правила работают совместно:

- скрытость имеет приоритет — если поле скрыто, состояние отключённости не важно;
- отключённость предотвращает редактирование независимо от состояния только для чтения;
- дебаунс влияет на обновления модели независимо от других состояний;
- метаданные независимы и всегда доступны.

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

Функция `applyWhen()` принимает:

1. путь для применения логики (часто корневой путь формы);
2. функцию реактивной логики, возвращающую `true` (применить) или `false` (не применять);
3. функцию схемы, определяющую условные правила.

Условные правила выполняются только при выполнении условия. Это полезно для сложных форм, где правила валидации или поведение меняются в зависимости от выбора пользователя.

### Переиспользуемые функции схемы {#reusable-schema-functions}

Выносите общие конфигурации правил в переиспользуемые функции:

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

Этот паттерн удобен, когда в нескольких формах приложения используются стандартные конфигурации полей.

## Следующие шаги {#next-steps}

Для получения дополнительных сведений о Signal Forms ознакомьтесь со связанными руководствами:

- [Управление состоянием поля](guide/forms/signals/field-state-management) — узнайте, как использовать сигналы состояния, созданные этими функциями, в шаблонах и логике компонентов
- [Валидация](guide/forms/signals/validation) — узнайте о правилах валидации и обработке ошибок
- [Пользовательские элементы управления](guide/forms/signals/custom-controls) — узнайте, как пользовательские элементы управления могут читать метаданные и состояние для автоматической настройки
