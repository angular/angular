# Пользовательские элементы управления

NOTE: Это руководство предполагает, что вы знакомы с [основами Signal Forms](essentials/signal-forms).

Встроенные в браузер элементы управления формой (такие как input, select, textarea) обрабатывают общие случаи, но
приложениям часто требуются специализированные поля ввода. Выбор даты с календарем, редактор форматированного текста или
выбор тегов с автодополнением требуют пользовательской реализации.

Signal Forms работает с любым компонентом, реализующим определенные интерфейсы. **Интерфейс элемента управления** (
control interface) определяет свойства и сигналы, которые позволяют вашему компоненту взаимодействовать с системой форм.
Когда ваш компонент реализует один из этих интерфейсов, директива `[field]` автоматически подключает ваш элемент
управления к состоянию формы, валидации и привязке данных.

## Создание базового пользовательского элемента управления

Начнем с минимальной реализации и будем добавлять функции по мере необходимости.

### Минимальный элемент ввода

Базовому пользовательскому полю ввода нужно только реализовать интерфейс `FormValueControl` и определить требуемый
модельный сигнал `value`.

```angular-ts
import { Component, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'app-basic-input',
  template: `
    <div class="basic-input">
      <input
        type="text"
        [value]="value()"
        (input)="value.set(($event.target as HTMLInputElement).value)"
        placeholder="Enter text..."
      />
    </div>
  `,
})
export class BasicInput implements FormValueControl<string> {
  /** The current input value */
  value = model('');
}
```

### Минимальный чекбокс

Элементу управления в стиле чекбокса нужны две вещи:

1. Реализовать интерфейс `FormCheckboxControl`, чтобы директива `Field` распознала его как элемент управления формой.
2. Предоставить модельный сигнал `checked`.

```angular-ts
import { Component, model, ChangeDetectionStrategy } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';

@Component({
  selector: 'app-basic-toggle',
  template: `
    <button
      type="button"
      [class.active]="checked()"
      (click)="toggle()"
    >
      <span class="toggle-slider"></span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicToggle implements FormCheckboxControl {
  /** Whether the toggle is checked */
  checked = model<boolean>(false);

  toggle() {
    this.checked.update(val => !val);
  }
}
```

### Использование пользовательского элемента управления

После создания элемента управления вы можете использовать его везде, где использовали бы встроенный input, добавив к
нему директиву `Field`:

```angular-ts
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, Field, required } from '@angular/forms/signals';
import { BasicInput } from './basic-input';
import { BasicToggle } from './basic-toggle';

@Component({
  imports: [Field, BasicInput, BasicToggle],
  template: `
    <form>
      <label>
        Email
        <app-basic-input [field]="registrationForm.email" />
      </label>

      <label>
        Accept terms
        <app-basic-toggle [field]="registrationForm.acceptTerms" />
      </label>

      <button
        type="submit"
        [disabled]="registrationForm().invalid()"
      >
        Register
      </button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Registration {
  registrationModel = signal({
    email: '',
    acceptTerms: false
  });

  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' });
    required(schemaPath.acceptTerms, { message: 'You must accept the terms' });
  });
}
```

NOTE: Параметр колбэка схемы (`schemaPath` в этих примерах) — это объект `SchemaPathTree`, который предоставляет пути ко
всем полям в вашей форме. Вы можете назвать этот параметр как угодно.

Директива `[field]` работает одинаково для пользовательских элементов управления и встроенных полей ввода. Signal Forms
обрабатывает их одинаково — валидация запускается, состояние обновляется, и привязка данных работает автоматически.

## Понимание интерфейсов элементов управления

Теперь, когда вы увидели пользовательские элементы управления в действии, давайте изучим, как они интегрируются с Signal
Forms.

### Интерфейсы элементов управления

Компоненты `BasicInput` и `BasicToggle`, которые вы создали, реализуют специфические интерфейсы управления, сообщающие
Signal Forms, как с ними взаимодействовать.

#### FormValueControl

`FormValueControl` — это интерфейс для большинства типов ввода: текстовых полей, числовых полей, выбора даты, выпадающих
списков и любых элементов управления, редактирующих одно значение. Когда ваш компонент реализует этот интерфейс:

- **Обязательное свойство**: Ваш компонент должен предоставить модельный сигнал `value`.
- **Что делает директива Field**: Привязывает значение поля формы к сигналу `value` вашего элемента управления.

IMPORTANT: Элементы управления, реализующие `FormValueControl`, НЕ должны иметь свойства `checked`.

#### FormCheckboxControl

`FormCheckboxControl` — это интерфейс для элементов управления типа чекбокс: переключателей (toggles), свитчей и любых
элементов, представляющих булево состояние вкл/выкл. Когда ваш компонент реализует этот интерфейс:

- **Обязательное свойство**: Ваш компонент должен предоставить модельный сигнал `checked`.
- **Что делает директива Field**: Привязывает значение поля формы к сигналу `checked` вашего элемента управления.

IMPORTANT: Элементы управления, реализующие `FormCheckboxControl`, НЕ должны иметь свойства `value`.

### Необязательные свойства состояния

И `FormValueControl`, и `FormCheckboxControl` расширяют `FormUiControl` — базовый интерфейс, предоставляющий
необязательные свойства для интеграции с состоянием формы.

Все свойства являются необязательными. Реализуйте только то, что нужно вашему элементу управления.

#### Состояние взаимодействия

Отслеживайте, когда пользователи взаимодействуют с вашим элементом управления:

| Свойство  | Назначение                                     |
| --------- | ---------------------------------------------- |
| `touched` | Взаимодействовал ли пользователь с полем       |
| `dirty`   | Отличается ли значение от начального состояния |

#### Состояние валидации

Отображение обратной связи по валидации пользователям:

| Свойство  | Назначение                           |
| --------- | ------------------------------------ |
| `errors`  | Массив текущих ошибок валидации      |
| `valid`   | Является ли поле валидным            |
| `invalid` | Имеет ли поле ошибки валидации       |
| `pending` | Выполняется ли асинхронная валидация |

#### Состояние доступности

Управление тем, могут ли пользователи взаимодействовать с вашим полем:

| Свойство          | Назначение                                                                  |
| ----------------- | --------------------------------------------------------------------------- |
| `disabled`        | Отключено ли поле                                                           |
| `disabledReasons` | Причины, по которым поле отключено                                          |
| `readonly`        | Является ли поле доступным только для чтения (видимым, но не редактируемым) |
| `hidden`          | Скрыто ли поле из вида                                                      |

NOTE: `disabledReasons` — это массив объектов `DisabledReason`. Каждый объект имеет свойство `field` (ссылка на дерево
полей) и необязательное свойство `message`. Доступ к сообщению осуществляется через `reason.message`.

#### Ограничения валидации

Получение значений ограничений валидации из формы:

| Свойство    | Назначение                                                         |
| ----------- | ------------------------------------------------------------------ |
| `required`  | Является ли поле обязательным                                      |
| `min`       | Минимальное числовое значение (`undefined`, если ограничения нет)  |
| `max`       | Максимальное числовое значение (`undefined`, если ограничения нет) |
| `minLength` | Минимальная длина строки (`undefined`, если ограничения нет)       |
| `maxLength` | Максимальная длина строки (`undefined`, если ограничения нет)      |
| `pattern`   | Массив шаблонов регулярных выражений для сопоставления             |

#### Метаданные поля

| Свойство | Назначение                                                        |
| -------- | ----------------------------------------------------------------- |
| `name`   | Атрибут name поля (который уникален в пределах форм и приложений) |

Раздел "[Добавление сигналов состояния](#adding-state-signals)" ниже показывает, как реализовать эти свойства в ваших
элементах управления.

### Как работает директива Field

Директива `[field]` определяет, какой интерфейс реализует ваш элемент управления, и автоматически привязывает
соответствующие сигналы:

```angular-ts
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, Field, required } from '@angular/forms/signals';
import { CustomInput } from './custom-input';
import { CustomToggle } from './custom-toggle';

@Component({
  selector: 'app-my-form',
  imports: [Field, CustomInput, CustomToggle],
  template: `
    <form>
      <app-custom-input [field]="userForm.username" />
      <app-custom-toggle [field]="userForm.subscribe" />
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyForm {
  formModel = signal({
    username: '',
    subscribe: false
  });

  userForm = form(this.formModel, (schemaPath) => {
    required(schemaPath.username, { message: 'Username is required' });
  });
}
```

TIP: Для полного ознакомления с созданием и управлением моделями форм
см. [руководство по моделям форм](guide/forms/signals/models).

Когда вы привязываете `[field]="userForm.username"`, директива Field:

1. Определяет, что ваш элемент управления реализует `FormValueControl`.
2. Внутренне обращается к `userForm.username().value()` и привязывает его к модельному сигналу `value` вашего элемента
   управления.
3. Привязывает сигналы состояния формы (`disabled()`, `errors()` и т. д.) к необязательным входным сигналам (input
   signals) вашего элемента управления.
4. Обновления происходят автоматически благодаря реактивности сигналов.

## Добавление сигналов состояния {#adding-state-signals}

Минимальные элементы управления, показанные выше, работают, но не реагируют на состояние формы. Вы можете добавить
необязательные входные сигналы, чтобы ваши элементы управления реагировали на отключенное состояние, отображали ошибки
валидации и отслеживали взаимодействие с пользователем.

Вот исчерпывающий пример, реализующий общие свойства состояния:

```angular-ts
import { Component, model, input, ChangeDetectionStrategy } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import type { ValidationError, DisabledReason } from '@angular/forms/signals';

@Component({
  selector: 'app-stateful-input',
  template: `
    @if (!hidden()) {
      <div class="input-container">
        <input
          type="text"
          [value]="value()"
          (input)="value.set(($event.target as HTMLInputElement).value)"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [class.invalid]="invalid()"
          [attr.aria-invalid]="invalid()"
          (blur)="touched.set(true)"
        />

        @if (invalid()) {
          <div class="error-messages" role="alert">
            @for (error of errors(); track error) {
              <span class="error">{{ error.message }}</span>
            }
          </div>
        }

        @if (disabled() && disabledReasons().length > 0) {
          <div class="disabled-reasons">
            @for (reason of disabledReasons(); track reason) {
              <span>{{ reason.message }}</span>
            }
          </div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatefulInput implements FormValueControl<string> {
  // Required
  value = model<string>('');

  // Writable interaction state - control updates these
  touched = model<boolean>(false);

  // Read-only state - form system manages these
  disabled = input<boolean>(false);
  disabledReasons = input<readonly DisabledReason[]>([]);
  readonly = input<boolean>(false);
  hidden = input<boolean>(false);
  invalid = input<boolean>(false);
  errors = input<readonly ValidationError.WithField[]>([]);
}
```

В результате вы можете использовать элемент управления с валидацией и управлением состоянием:

```angular-ts
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, Field, required, email } from '@angular/forms/signals';
import { StatefulInput } from './stateful-input';

@Component({
  imports: [Field, StatefulInput],
  template: `
    <form>
      <label>
        Email
        <app-stateful-input [field]="loginForm.email" />
      </label>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  loginModel = signal({ email: '' });

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
  });
}
```

Когда пользователь вводит невалидный email, директива Field автоматически обновляет `invalid()` и `errors()`. Ваш
элемент управления может отображать обратную связь по валидации.

### Типы сигналов для свойств состояния

Большинство свойств состояния используют `input()` (только для чтения из формы). Используйте `model()` для `touched`,
когда ваш элемент управления обновляет его при взаимодействии с пользователем. Свойство `touched` уникально поддерживает
`model()`, `input()` или `OutputRef` в зависимости от ваших потребностей.

## Преобразование значений

Элементы управления иногда отображают значения иначе, чем их хранит модель формы — выбор даты может отображать "15
января 2024", сохраняя при этом "2024-01-15", или ввод валюты может показывать "$1,234.56", сохраняя 1234.56.

Используйте сигналы `computed()` (из `@angular/core`) для преобразования значения модели для отображения и обрабатывайте
события ввода для парсинга пользовательского ввода обратно в формат хранения:

```angular-ts
import { Component, model, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'app-currency-input',
  template: `
    <input
      type="text"
      [value]="displayValue()"
      (input)="handleInput(($event.target as HTMLInputElement).value)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyInput implements FormValueControl<number> {
  value = model<number>(0);  // Stores numeric value (1234.56)

  displayValue = computed(() => {
    return this.value().toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Shows "1,234.56"
  });

  handleInput(input: string) {
    const num = parseFloat(input.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) this.value.set(num);
  }
}
```

## Интеграция валидации

Элементы управления отображают состояние валидации, но не выполняют саму валидацию. Валидация происходит в схеме формы —
ваш элемент управления получает сигналы `invalid()` и `errors()` от директивы Field и отображает их (как показано в
примере StatefulInput выше).

Директива Field также передает значения ограничений валидации, такие как `required`, `min`, `max`, `minLength`,
`maxLength` и `pattern`. Ваш элемент управления может использовать их для улучшения UI:

```ts
export class NumberInput implements FormValueControl<number> {
  value = model<number>(0);

  // Constraint values from schema validation rules
  required = input<boolean>(false);
  min = input<number | undefined>(undefined);
  max = input<number | undefined>(undefined);
}
```

Когда вы добавляете правила валидации `min()` и `max()` в схему, директива Field передает эти значения вашему элементу
управления. Используйте их для применения атрибутов HTML5 или отображения подсказок об ограничениях в вашем шаблоне.

IMPORTANT: Не реализуйте логику валидации в вашем элементе управления. Определяйте правила валидации в схеме формы и
позволяйте вашему элементу управления отображать результаты:

```typescript
// Avoid: Validation in control
export class BadControl implements FormValueControl<string> {
  value = model<string>('')
  isValid() { return this.value().length >= 8 } // Don't do this!
}

// Good: Validation in schema, control displays results
accountForm = form(this.accountModel, schemaPath => {
  minLength(schemaPath.password, 8, { message: 'Password must be at least 8 characters' })
})
```

## Следующие шаги

В этом руководстве рассматривалось создание пользовательских элементов управления, интегрируемых с Signal Forms.
Связанные руководства рассматривают другие аспекты Signal Forms:

- [Руководство по моделям форм](guide/forms/signals/models) — Создание и обновление моделей форм
  <!-- TODO: Uncomment when guides are available -->
  <!-- - [Field State Management guide](guide/forms/signals/field-state-management) - Using form state signals -->
  <!-- - [Validation guide](guide/forms/signals/validation) - Adding validation to your forms -->
