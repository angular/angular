# Пользовательские элементы управления {#custom-controls}

NOTE: Это руководство предполагает знакомство с [основами Signal Forms](essentials/signal-forms).

Встроенные элементы управления браузера (такие как input, select, textarea) охватывают распространённые случаи, но приложениям часто нужны специализированные поля ввода. Выбор даты с интерфейсом календаря, редактор форматированного текста с панелью инструментов или выбор тегов с автодополнением — всё это требует пользовательских реализаций.

Signal Forms работает с любым компонентом, реализующим определённые интерфейсы. **Интерфейс управления** определяет свойства и сигналы, позволяющие вашему компоненту взаимодействовать с системой форм. Когда ваш компонент реализует один из этих интерфейсов, директива `[formField]` автоматически подключает ваш элемент управления к состоянию формы, валидации и привязке данных.

## Создание базового пользовательского элемента управления {#creating-a-basic-custom-control}

Начнём с минимальной реализации и по мере необходимости будем добавлять функции.

### Минимальный элемент управления вводом {#minimal-input-control}

Базовый пользовательский ввод должен только реализовывать интерфейс `FormValueControl` и определять обязательный сигнал модели `value`.

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

Элемент управления в стиле чекбокса требует двух вещей:

1. Реализовать интерфейс `FormCheckboxControl`, чтобы директива `FormField` распознала его как элемент управления формой
2. Предоставить сигнал модели `checked`

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

После создания элемента управления вы можете использовать его везде, где использовали бы встроенный элемент ввода, добавив к нему директиву `FormField`:

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

NOTE: Параметр обратного вызова схемы (`schemaPath` в этих примерах) — это объект `SchemaPathTree`, предоставляющий пути ко всем полям вашей формы. Вы можете называть этот параметр как угодно.

Директива `[formField]` одинаково работает для пользовательских элементов управления и встроенных полей ввода. Signal Forms обращается с ними одинаково — валидация выполняется, состояние обновляется, привязка данных работает автоматически.

## Понимание интерфейсов управления {#understanding-control-interfaces}

Теперь, когда вы увидели пользовательские элементы управления в действии, давайте рассмотрим, как они интегрируются с Signal Forms.

### Интерфейсы управления {#control-interfaces}

Компоненты `BasicInput` и `BasicToggle`, которые вы создали, реализуют специфические интерфейсы управления, которые сообщают Signal Forms, как взаимодействовать с ними.

#### FormValueControl {#formvaluecontrol}

`FormValueControl` — интерфейс для большинства типов полей ввода: текстовых, числовых, выборщиков дат, выпадающих списков и любых элементов управления, редактирующих одно значение. Когда ваш компонент реализует этот интерфейс:

- **Обязательное свойство**: ваш компонент должен предоставлять сигнал модели `value`
- **Что делает директива FormField**: привязывает значение поля формы к сигналу модели `value` вашего элемента управления

IMPORTANT: Элементы управления, реализующие `FormValueControl`, НЕ должны иметь свойство `checked`

#### FormCheckboxControl {#formcheckboxcontrol}

`FormCheckboxControl` — интерфейс для элементов управления в стиле чекбокса: переключателей, тумблеров и любых элементов, представляющих булево состояние вкл/выкл. Когда ваш компонент реализует этот интерфейс:

- **Обязательное свойство**: ваш компонент должен предоставлять сигнал модели `checked`
- **Что делает директива FormField**: привязывает значение поля формы к сигналу модели `checked` вашего элемента управления

IMPORTANT: Элементы управления, реализующие `FormCheckboxControl`, НЕ должны иметь свойство `value`

### Необязательные свойства состояния {#optional-state-properties}

Оба интерфейса `FormValueControl` и `FormCheckboxControl` расширяют `FormUiControl` — базовый интерфейс, предоставляющий необязательные свойства для интеграции с состоянием формы.

Все свойства необязательны. Реализуйте только то, что нужно вашему элементу управления.

#### Состояние взаимодействия {#interaction-state}

Отслеживайте взаимодействие пользователей с элементом управления:

| Свойство  | Назначение                                                    |
| --------- | ------------------------------------------------------------- |
| `touched` | Взаимодействовал ли пользователь с полем                      |
| `dirty`   | Отличается ли значение от начального состояния                |

#### Состояние валидации {#validation-state}

Отображайте обратную связь по валидации пользователям:

| Свойство  | Назначение                                          |
| --------- | --------------------------------------------------- |
| `errors`  | Массив текущих ошибок валидации                     |
| `valid`   | Действительно ли поле                               |
| `invalid` | Имеет ли поле ошибки валидации                      |
| `pending` | Выполняется ли асинхронная валидация                |

#### Состояние доступности {#availability-state}

Управляйте возможностью взаимодействия пользователей с полем:

| Свойство          | Назначение                                                  |
| ----------------- | ----------------------------------------------------------- |
| `disabled`        | Отключено ли поле                                           |
| `disabledReasons` | Причины отключения поля                                     |
| `readonly`        | Только ли для чтения поле (видимое, но не редактируемое)    |
| `hidden`          | Скрыто ли поле                                              |

NOTE: `disabledReasons` — массив объектов `DisabledReason`. Каждый объект имеет свойство `field` (ссылка на дерево полей) и необязательное свойство `message`. Доступ к сообщению — через `reason.message`.

#### Ограничения валидации {#validation-constraints}

Получайте значения ограничений валидации из формы:

| Свойство    | Назначение                                              |
| ----------- | ------------------------------------------------------- |
| `required`  | Обязательно ли поле                                     |
| `min`       | Минимальное числовое значение (`undefined`, если нет ограничения) |
| `max`       | Максимальное числовое значение (`undefined`, если нет ограничения) |
| `minLength` | Минимальная длина строки (undefined, если нет ограничения) |
| `maxLength` | Максимальная длина строки (undefined, если нет ограничения) |
| `pattern`   | Массив шаблонов регулярных выражений для сопоставления  |

#### Метаданные поля {#field-metadata}

| Свойство | Назначение                                                                |
| -------- | ------------------------------------------------------------------------- |
| `name`   | Атрибут name поля (уникальный во всех формах и приложениях)               |

Раздел ["Добавление сигналов состояния"](#adding-state-signals) ниже показывает, как реализовать эти свойства в ваших элементах управления.

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

TIP: Полное руководство по созданию и управлению моделями форм см. в [руководстве по моделям форм](guide/forms/signals/models).

При привязке `[formField]="userForm.username"` директива FormField:

1. Определяет, что ваш элемент управления реализует `FormValueControl`
2. Внутренне обращается к `userForm.username().value()` и привязывает его к сигналу модели `value` вашего элемента управления
3. Привязывает сигналы состояния формы (`disabled()`, `errors()` и др.) к необязательным входным сигналам вашего элемента управления
4. Обновления происходят автоматически через реактивность сигналов

## Добавление сигналов состояния {#adding-state-signals}

Показанные выше минимальные элементы управления работают, но не реагируют на состояние формы. Вы можете добавить необязательные входные сигналы, чтобы ваши элементы управления реагировали на состояние отключения, отображали ошибки валидации и отслеживали взаимодействие пользователя.

Вот исчерпывающий пример, реализующий распространённые свойства состояния:

```angular-ts
import {Component, model, input, ChangeDetectionStrategy} from '@angular/core';
import {
  FormValueControl,
  WithOptionalFieldTree,
  ValidationError,
  DisabledReason,
} from '@angular/forms/signals';

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

В результате элемент управления можно использовать с валидацией и управлением состоянием:

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

Большинство свойств состояния используют `input()` (только для чтения из формы). Используйте `model()` для `touched`, когда ваш элемент управления обновляет его при взаимодействии пользователя. Свойство `touched` уникально поддерживает `model()`, `input()` или `OutputRef` в зависимости от ваших потребностей.

## Преобразование значений {#value-transformation}

Элементы управления иногда отображают значения иначе, чем они хранятся в модели формы — выбор даты может отображать «15 января 2024» при хранении «2024-01-15», или поле ввода валюты может показывать «$1 234,56» при хранении 1234.56.

Используйте `linkedSignal()` (из `@angular/core`) для преобразования значения модели для отображения, и обрабатывайте события ввода для обратного разбора ввода пользователя в формат хранения:

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

Элементы управления отображают состояние валидации, но не выполняют её. Валидация происходит в схеме формы — ваш элемент управления получает сигналы `invalid()` и `errors()` от директивы FormField и отображает их (как показано в примере StatefulInput выше).

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

Когда вы добавляете правила валидации `min()` и `max()` в схему, директива FormField передаёт эти значения вашему элементу управления. Используйте их для применения атрибутов HTML5 или отображения подсказок об ограничениях в шаблоне.

IMPORTANT: Не реализуйте логику валидации в своём элементе управления. Определяйте правила валидации в схеме формы и позвольте элементу управления отображать результаты:

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

## Дальнейшие шаги {#next-steps}

В этом руководстве рассмотрено создание пользовательских элементов управления, интегрирующихся с Signal Forms. Связанные руководства охватывают другие аспекты Signal Forms:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/models" title="Модели форм" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Управление состоянием полей" />
  <docs-pill href="guide/forms/signals/validation" title="Валидация" />
  <!-- <docs-pill href="guide/forms/signals/arrays" title="Working with Arrays" /> -->
</docs-pill-row>
