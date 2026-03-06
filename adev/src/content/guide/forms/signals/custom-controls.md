# Пользовательские элементы управления {#custom-controls}

NOTE: В этом руководстве предполагается знакомство с [основами Signal Forms](essentials/signal-forms).

Встроенные в браузер элементы управления формы (такие как input, select, textarea) покрывают распространённые случаи, но приложениям часто требуются специализированные компоненты ввода. Выбор даты с UI-календарём, редактор с форматированием текста или выбор тегов с автодополнением — всё это требует пользовательских реализаций.

Signal Forms работает с любым компонентом, реализующим конкретные интерфейсы. **Интерфейс элемента управления** определяет свойства и сигналы, позволяющие вашему компоненту взаимодействовать с системой форм. Когда компонент реализует один из этих интерфейсов, директива `[formField]` автоматически подключает элемент управления к состоянию формы, валидации и привязке данных.

## Создание базового пользовательского элемента управления {#creating-a-basic-custom-control}

Начнём с минимальной реализации и будем добавлять функции по мере необходимости.

### Минимальный элемент управления вводом {#minimal-input-control}

Базовый пользовательский ввод требует только реализации интерфейса `FormValueControl` и определения обязательного сигнала модели `value`.

```angular-ts
import {Component, model} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';

@Component({
  selector: 'app-basic-input',
  template: `
    <div class="basic-input">
      <input
        type="text"
        [value]="value()"
        (input)="value.set($event.target.value)"
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

### Минимальный элемент управления чекбоксом {#minimal-checkbox-control}

Элемент управления типа чекбокс требует двух вещей:

1. Реализации интерфейса `FormCheckboxControl`, чтобы директива `FormField` распознала его как элемент управления формы
2. Предоставления сигнала модели `checked`

```angular-ts
import {Component, model, ChangeDetectionStrategy} from '@angular/core';
import {FormCheckboxControl} from '@angular/forms/signals';

@Component({
  selector: 'app-basic-toggle',
  template: `
    <button type="button" [class.active]="checked()" (click)="toggle()">
      <span class="toggle-slider"></span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicToggle implements FormCheckboxControl {
  /** Whether the toggle is checked */
  checked = model<boolean>(false);

  toggle() {
    this.checked.update((val) => !val);
  }
}
```

### Использование пользовательского элемента управления {#using-your-custom-control}

После создания элемент управления можно использовать везде, где используется встроенный ввод, добавив к нему директиву `FormField`:

```angular-ts
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
import {form, FormField, required} from '@angular/forms/signals';
import {BasicInput} from './basic-input';
import {BasicToggle} from './basic-toggle';

@Component({
  imports: [FormField, BasicInput, BasicToggle],
  template: `
    <form novalidate>
      <label>
        Email
        <app-basic-input [formField]="registrationForm.email" />
      </label>

      <label>
        Accept terms
        <app-basic-toggle [formField]="registrationForm.acceptTerms" />
      </label>

      <button type="submit" [disabled]="registrationForm().invalid()">Register</button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Registration {
  registrationModel = signal({
    email: '',
    acceptTerms: false,
  });

  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.email, {message: 'Email is required'});
    required(schemaPath.acceptTerms, {message: 'You must accept the terms'});
  });
}
```

NOTE: Параметр обратного вызова схемы (`schemaPath` в этих примерах) — объект `SchemaPathTree`, предоставляющий пути ко всем полям формы. Его можно называть как угодно.

Директива `[formField]` работает одинаково для пользовательских элементов управления и встроенных вводов. Signal Forms обрабатывает их одинаково — валидация запускается, состояние обновляется, привязка данных работает автоматически.

## Понимание интерфейсов элементов управления {#understanding-control-interfaces}

Теперь, когда вы увидели пользовательские элементы управления в действии, рассмотрим, как они интегрируются с Signal Forms.

### Интерфейсы элементов управления {#control-interfaces}

Созданные компоненты `BasicInput` и `BasicToggle` реализуют конкретные интерфейсы элементов управления, которые сообщают Signal Forms о том, как взаимодействовать с ними.

#### FormValueControl {#formvaluecontrol}

`FormValueControl` — интерфейс для большинства типов ввода: текстовые поля, числовые вводы, выбор даты, выпадающие списки и любые элементы управления, редактирующие одно значение. Когда компонент реализует этот интерфейс:

- **Обязательное свойство**: компонент должен предоставлять сигнал модели `value`
- **Что делает директива FormField**: привязывает значение поля формы к сигналу `value` вашего элемента управления

IMPORTANT: Элементы управления, реализующие `FormValueControl`, НЕ должны иметь свойство `checked`

#### FormCheckboxControl {#formcheckboxcontrol}

`FormCheckboxControl` — интерфейс для элементов управления типа чекбокс: переключатели, тумблеры и любые элементы, представляющие булевое состояние включено/выключено. Когда компонент реализует этот интерфейс:

- **Обязательное свойство**: компонент должен предоставлять сигнал модели `checked`
- **Что делает директива FormField**: привязывает значение поля формы к сигналу `checked` вашего элемента управления

IMPORTANT: Элементы управления, реализующие `FormCheckboxControl`, НЕ должны иметь свойство `value`

### Необязательные свойства состояния {#optional-state-properties}

Оба интерфейса `FormValueControl` и `FormCheckboxControl` расширяют `FormUiControl` — базовый интерфейс, предоставляющий необязательные свойства для интеграции с состоянием формы.

Все свойства необязательны. Реализуйте только то, что нужно вашему элементу управления.

#### Состояние взаимодействия {#interaction-state}

Отслеживайте взаимодействия пользователя с элементом управления:

| Свойство  | Назначение                                                  |
| --------- | ----------------------------------------------------------- |
| `touched` | Взаимодействовал ли пользователь с полем                   |
| `dirty`   | Отличается ли значение от начального состояния             |

#### Состояние валидации {#validation-state}

Отображайте обратную связь по валидации пользователям:

| Свойство  | Назначение                                   |
| --------- | -------------------------------------------- |
| `errors`  | Массив текущих ошибок валидации             |
| `valid`   | Является ли поле действительным             |
| `invalid` | Содержит ли поле ошибки валидации           |
| `pending` | Выполняется ли асинхронная валидация        |

#### Состояние доступности {#availability-state}

Управляйте возможностью взаимодействия пользователя с полем:

| Свойство          | Назначение                                               |
| ----------------- | -------------------------------------------------------- |
| `disabled`        | Отключено ли поле                                        |
| `disabledReasons` | Причины отключения поля                                  |
| `readonly`        | Только ли для чтения поле (видимое, но не редактируемое) |
| `hidden`          | Скрыто ли поле                                           |

NOTE: `disabledReasons` — массив объектов `DisabledReason`. Каждый объект имеет свойство `field` (ссылка на дерево полей) и необязательное свойство `message`. Доступ к сообщению: `reason.message`.

#### Ограничения валидации {#validation-constraints}

Получайте значения ограничений валидации из формы:

| Свойство    | Назначение                                                        |
| ----------- | ----------------------------------------------------------------- |
| `required`  | Является ли поле обязательным                                     |
| `min`       | Минимальное числовое значение (`undefined`, если нет ограничения) |
| `max`       | Максимальное числовое значение (`undefined`, если нет ограничения) |
| `minLength` | Минимальная длина строки (undefined, если нет ограничения)        |
| `maxLength` | Максимальная длина строки (undefined, если нет ограничения)       |
| `pattern`   | Массив регулярных выражений для сопоставления                     |

#### Метаданные поля {#field-metadata}

| Свойство | Назначение                                                              |
| -------- | ----------------------------------------------------------------------- |
| `name`   | Атрибут name поля (уникальный для форм и приложений)                   |

Раздел «[Добавление сигналов состояния](#adding-state-signals)» ниже показывает, как реализовать эти свойства в элементах управления.

### Как работает директива FormField {#how-the-formfield-directive-works}

Директива `[formField]` определяет, какой интерфейс реализует ваш элемент управления, и автоматически привязывает соответствующие сигналы:

```angular-ts
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
import {form, FormField, required} from '@angular/forms/signals';
import {CustomInput} from './custom-input';
import {CustomToggle} from './custom-toggle';

@Component({
  selector: 'app-my-form',
  imports: [FormField, CustomInput, CustomToggle],
  template: `
    <form novalidate>
      <app-custom-input [formField]="userForm.username" />
      <app-custom-toggle [formField]="userForm.subscribe" />
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyForm {
  formModel = signal({
    username: '',
    subscribe: false,
  });

  userForm = form(this.formModel, (schemaPath) => {
    required(schemaPath.username, {message: 'Username is required'});
  });
}
```

TIP: Подробное руководство по созданию и управлению моделями форм см. в [руководстве по моделям форм](guide/forms/signals/models).

При привязке `[formField]="userForm.username"` директива FormField:

1. Определяет, что ваш элемент управления реализует `FormValueControl`
2. Внутренне обращается к `userForm.username().value()` и привязывает его к сигналу модели `value` вашего элемента управления
3. Привязывает сигналы состояния формы (`disabled()`, `errors()` и т.д.) к необязательным входным сигналам вашего элемента
4. Обновления происходят автоматически через реактивность сигналов

## Добавление сигналов состояния {#adding-state-signals}

Минимальные элементы управления, показанные выше, работают, но не реагируют на состояние формы. Можно добавить необязательные входные сигналы, чтобы элементы управления реагировали на отключённое состояние, отображали ошибки валидации и отслеживали взаимодействия пользователя.

Вот комплексный пример с реализацией распространённых свойств состояния:

```angular-ts
import {Component, model, input, ChangeDetectionStrategy} from '@angular/core';
import {FormValueControl, WithOptionalFieldTree, ValidationError, DisabledReason} from '@angular/forms/signals';

@Component({
  selector: 'app-stateful-input',
  template: `
    @if (!hidden()) {
      <div class="input-container">
        <input
          type="text"
          [value]="value()"
          (input)="value.set($event.target.value)"
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
  errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
}
```

В результате можно использовать элемент управления с валидацией и управлением состоянием:

```angular-ts
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
import {form, FormField, required, email} from '@angular/forms/signals';
import {StatefulInput} from './stateful-input';

@Component({
  imports: [FormField, StatefulInput],
  template: `
    <form novalidate>
      <label>
        Email
        <app-stateful-input [formField]="loginForm.email" />
      </label>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  loginModel = signal({email: ''});

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, {message: 'Email is required'});
    email(schemaPath.email, {message: 'Enter a valid email address'});
  });
}
```

Когда пользователь вводит некорректный email, директива FormField автоматически обновляет `invalid()` и `errors()`. Ваш элемент управления может отображать обратную связь по валидации.

### Типы сигналов для свойств состояния {#signal-types-for-state-properties}

Большинство свойств состояния используют `input()` (только для чтения от формы). Используйте `model()` для `touched`, когда ваш элемент управления обновляет его при взаимодействии пользователя. Свойство `touched` уникально тем, что поддерживает `model()`, `input()` или `OutputRef` в зависимости от ваших потребностей.

## Преобразование значений {#value-transformation}

Элементы управления иногда отображают значения иначе, чем они хранятся в модели формы — выбор даты может отображать «15 января 2024», хранятся «2024-01-15», или поле валюты отображает «$1 234,56», хранится 1234.56.

Используйте `linkedSignal()` (из `@angular/core`) для преобразования значения модели для отображения и обрабатывайте события ввода для разбора пользовательского ввода обратно в формат хранения:

```angular-ts
import {formatCurrency} from '@angular/common';
import {ChangeDetectionStrategy, Component, linkedSignal, model} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';

@Component({
  selector: 'app-currency-input',
  template: `
    <input
      type="text"
      [value]="displayValue()"
      (input)="displayValue.set($event.target.value)"
      (blur)="updateModel()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyInput implements FormValueControl<number> {
  // Stores numeric value (1234.56)
  readonly value = model.required<number>();

  // Stores display value ("1,234.56")
  readonly displayValue = linkedSignal(() => formatCurrency(this.value(), 'en', 'USD'));

  // Update the model from the display value.
  updateModel() {
    this.value.set(parseCurrency(this.displayValue()));
  }
}

// Converts a currency string to a number (e.g. "USD1,234.56" -> 1234.56).
function parseCurrency(value: string): number {
  return parseFloat(value.replace(/^[^\d-]+/, '').replace(/,/g, ''));
}
```

## Интеграция с валидацией {#validation-integration}

Элементы управления отображают состояние валидации, но не выполняют валидацию. Валидация происходит в схеме формы — ваш элемент получает сигналы `invalid()` и `errors()` от директивы FormField и отображает их (как показано в примере StatefulInput выше).

Директива FormField также передаёт значения ограничений валидации, такие как `required`, `min`, `max`, `minLength`, `maxLength` и `pattern`. Ваш элемент управления может использовать их для улучшения UI:

```ts
export class NumberInput implements FormValueControl<number> {
  value = model<number>(0);

  // Constraint values from schema validation rules
  required = input<boolean>(false);
  min = input<number | undefined>(undefined);
  max = input<number | undefined>(undefined);
}
```

При добавлении правил валидации `min()` и `max()` в схему директива FormField передаёт эти значения вашему элементу управления. Используйте их для применения HTML5-атрибутов или отображения подсказок об ограничениях в шаблоне.

IMPORTANT: Не реализуйте логику валидации в элементе управления. Определяйте правила валидации в схеме формы и позвольте элементу управления отображать результаты:

```ts {avoid}
// Avoid: Validation in control
export class BadControl implements FormValueControl<string> {
  value = model<string>('');
  isValid() {
    return this.value().length >= 8;
  } // Don't do this!
}
```

```ts {prefer}
// Good: Validation in schema, control displays results
accountForm = form(this.accountModel, (schemaPath) => {
  minLength(schemaPath.password, 8, {message: 'Password must be at least 8 characters'});
});
```

## Следующие шаги {#next-steps}

В этом руководстве рассмотрено создание пользовательских элементов управления, интегрируемых с Signal Forms. Связанные руководства охватывают другие аспекты Signal Forms:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/models" title="Модели форм" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Управление состоянием поля" />
  <docs-pill href="guide/forms/signals/validation" title="Валидация" />
  <!-- <docs-pill href="guide/forms/signals/arrays" title="Working with Arrays" /> -->
</docs-pill-row>
