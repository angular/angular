# Пользовательские контролы

NOTE: Это руководство предполагает знакомство с [основами Signal Forms](essentials/signal-forms).

Встроенные контролы форм браузера (вроде input, select, textarea) покрывают распространённые случаи, но приложениям часто нужны специализированные inputs. Date picker с календарным UI, rich text editor с панелью форматирования или селектор тегов с автодополнением требуют пользовательских реализаций.

Signal Forms работают с любым компонентом, реализующим определённые интерфейсы. **Интерфейс контрола** определяет свойства и сигналы, позволяющие компоненту общаться с системой форм. Когда компонент реализует один из этих интерфейсов, директива `[formField]` автоматически подключает контрол к состоянию формы, валидации и привязке данных.

HELPFUL: Пользовательские контролы Signal Form [можно использовать](guide/forms/signals/migration#custom-controls) с Signal, Reactive и Template-Driven Forms без дополнительного кода совместимости.

## Создание базового пользовательского контрола {#creating-a-basic-custom-control}

Начнём с минимальной реализации и будем добавлять возможности по мере необходимости.

### Минимальный input-контрол {#minimal-input-control}

Базовому пользовательскому input достаточно реализовать интерфейс `FormValueControl` и определить обязательный model-сигнал `value`.

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

### Минимальный checkbox-контрол {#minimal-checkbox-control}

Контролу в стиле checkbox нужно два условия:

1. Реализовать интерфейс `FormCheckboxControl`, чтобы директива `FormField` распознала его как контрол формы
2. Предоставить model-сигнал `checked`

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
})
export class BasicToggle implements FormCheckboxControl {
  /** Whether the toggle is checked */
  checked = model<boolean>(false);

  toggle() {
    this.checked.update((val) => !val);
  }
}
```

### Использование пользовательского контрола {#using-your-custom-control}

Создав контрол, его можно использовать везде, где использовали бы встроенный input, добавив директиву `FormField`:

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

NOTE: Параметр callback схемы (`schemaPath` в этих примерах) — объект `SchemaPathTree`, предоставляющий пути ко всем полям формы. Этот параметр можно назвать как угодно.

Директива `[formField]` работает одинаково для пользовательских контролов и встроенных inputs. Signal Forms относятся к ним одинаково — валидация запускается, состояние обновляется, привязка данных работает автоматически.

## Понимание интерфейсов контролов {#understanding-control-interfaces}

Теперь, когда пользовательские контролы показаны в действии, разберём, как они интегрируются с Signal Forms.

### Интерфейсы контролов {#control-interfaces}

Компоненты `BasicInput` и `BasicToggle`, которые вы создали, реализуют конкретные интерфейсы контролов, сообщающие Signal Forms, как с ними взаимодействовать.

#### FormValueControl {#formvaluecontrol}

`FormValueControl` — интерфейс для большинства типов input: текстовых, числовых, date picker, select и любого контрола, редактирующего одно значение. Когда компонент реализует этот интерфейс:

- **Обязательное свойство**: компонент должен предоставить model-сигнал `value`
- **Что делает директива FormField**: привязывает значение поля формы к сигналу `value` контрола

IMPORTANT: Контролы, реализующие `FormValueControl`, НЕ должны иметь свойство `checked`

#### FormCheckboxControl {#formcheckboxcontrol}

`FormCheckboxControl` — интерфейс для checkbox-подобных контролов: toggles, switches и любого контрола, представляющего булево состояние вкл/выкл. Когда компонент реализует этот интерфейс:

- **Обязательное свойство**: компонент должен предоставить model-сигнал `checked`
- **Что делает директива FormField**: привязывает значение поля формы к сигналу `checked` контрола

IMPORTANT: Контролы, реализующие `FormCheckboxControl`, НЕ должны иметь свойство `value`

### Опциональные свойства состояния {#optional-state-properties}

И `FormValueControl`, и `FormCheckboxControl` расширяют `FormUiControl` — базовый интерфейс, предоставляющий опциональные свойства для интеграции с состоянием формы.

Все свойства опциональны. Реализуйте только то, что нужно контролу.

#### Состояние взаимодействия {#interaction-state}

Отслеживайте, когда пользователи взаимодействуют с контролом:

| Свойство  | Назначение                                          |
| --------- | ------------------------------------------------ |
| `touched` | Взаимодействовал ли пользователь с полем   |
| `dirty`   | Отличается ли значение от начального состояния |

#### Состояние валидации {#validation-state}

Показывайте пользователям обратную связь по валидации:

| Свойство  | Назначение                                 |
| --------- | --------------------------------------- |
| `errors`  | Массив текущих ошибок валидации      |
| `valid`   | Валидно ли поле              |
| `invalid` | Есть ли у поля ошибки валидации |
| `pending` | Выполняется ли async-валидация |

#### Состояние доступности {#availability-state}

Управляйте тем, могут ли пользователи взаимодействовать с полем:

| Свойство          | Назначение                                                  |
| ----------------- | -------------------------------------------------------- |
| `disabled`        | Отключено ли поле                            |
| `disabledReasons` | Причины, почему поле отключено                        |
| `readonly`        | Только для чтения ли поле (видимо, но не редактируемо) |
| `hidden`          | Скрыто ли поле от просмотра                    |

NOTE: `disabledReasons` — массив объектов `DisabledReason`. У каждого объекта есть свойство `field` (ссылка на дерево полей) и опциональное свойство `message`. К сообщению обращайтесь через `reason.message`.

#### Ограничения валидации {#validation-constraints}

Получайте значения ограничений валидации из формы:

| Свойство    | Назначение                                              |
| ----------- | ---------------------------------------------------- |
| `required`  | Обязательно ли поле                        |
| `min`       | Минимальное числовое значение (`undefined`, если нет ограничения) |
| `max`       | Максимальное числовое значение (`undefined`, если нет ограничения) |
| `minLength` | Минимальная длина строки (undefined, если нет ограничения)   |
| `maxLength` | Максимальная длина строки (undefined, если нет ограничения)   |
| `pattern`   | Массив регулярных выражений для совпадения        |

#### Метаданные поля {#field-metadata}

| Свойство | Назначение                                                            |
| -------- | ------------------------------------------------------------------ |
| `name`   | Атрибут name поля (уникальный среди форм и приложений) |

Раздел «[Добавление сигналов состояния](#adding-state-signals)» ниже показывает, как реализовать эти свойства в контролах.

### Как работает директива FormField {#how-the-formfield-directive-works}

Директива `[formField]` определяет, какой интерфейс реализует контрол, и автоматически привязывает соответствующие сигналы:

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

TIP: Полное покрытие создания и управления моделями форм см. в [руководстве по моделям форм](guide/forms/signals/models).

Когда вы привязываете `[formField]="userForm.username"`, директива FormField:

1. Определяет, что контрол реализует `FormValueControl`
2. Внутри обращается к `userForm.username().value()` и привязывает его к model-сигналу `value` контрола
3. Привязывает сигналы состояния формы (`disabled()`, `errors()` и т.д.) к опциональным input-сигналам контрола
4. Обновления происходят автоматически через реактивность сигналов

## Добавление сигналов состояния {#adding-state-signals}

Минимальные контролы выше работают, но не реагируют на состояние формы. Можно добавить опциональные input-сигналы, чтобы контролы реагировали на disabled-состояние, показывали ошибки валидации и отслеживали взаимодействие пользователя.

Вот полный пример, реализующий распространённые свойства состояния:

```angular-ts
import {Component, model, input, output, ChangeDetectionStrategy} from '@angular/core';
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
          (blur)="touch.emit()"
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
})
export class StatefulInput implements FormValueControl<string> {
  // Required
  value = model<string>('');

  // Writable interaction state - control updates these
  touched = input<boolean>(false);
  touch = output<void>();

  // Read-only state - form system manages these
  disabled = input<boolean>(false);
  disabledReasons = input<readonly DisabledReason[]>([]);
  readonly = input<boolean>(false);
  hidden = input<boolean>(false);
  invalid = input<boolean>(false);
  errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
}
```

В результате контрол можно использовать с валидацией и управлением состоянием:

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
})
export class Login {
  loginModel = signal({email: ''});

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, {message: 'Email is required'});
    email(schemaPath.email, {message: 'Enter a valid email address'});
  });
}
```

Когда пользователь вводит невалидный email, директива FormField автоматически обновляет `invalid()` и `errors()`. Контрол может показать обратную связь по валидации.

### Типы сигналов для свойств состояния {#signal-types-for-state-properties}

Большинство свойств состояния используют `input()` (только чтение из формы). Используйте `model()` для `touched`, когда контрол обновляет его при взаимодействии пользователя. Свойство `touched` уникально поддерживает `model()`, `input()` или `OutputRef` в зависимости от потребностей.

### Работа с `debounce('blur')` {#working-with-debounceblur}

Правило [`debounce('blur')`](api/forms/signals/debounce) откладывает обновления из UI в модель формы до потери фокуса полем, вместо применения при каждом нажатии клавиши. Встроенные контролы сообщают форме о blur автоматически. Пользовательский контрол участвует только если эмитит свой output `touch` в ответ на нативное [событие `blur`](https://developer.mozilla.org/en-US/docs/Web/API/Element/blur_event):

```angular-ts
import {Component, model, output} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';

@Component({
  selector: 'app-custom-input',
  template: `
    <input
      type="text"
      [value]="value()"
      (input)="value.set($event.target.value)"
      (blur)="touch.emit()"
    />
  `,
})
export class CustomInput implements FormValueControl<string> {
  value = model('');
  touch = output<void>();
}
```

С output `touch` на месте `debounce('blur')` ведёт себя для контрола так же, как для встроенных inputs:

```angular-ts
import {Component, signal} from '@angular/core';
import {debounce, form, FormField} from '@angular/forms/signals';
import {CustomInput} from './custom-input';

@Component({
  selector: 'app-root',
  imports: [CustomInput, FormField],
  template: `<app-custom-input [formField]="userForm.name" />`,
})
export class App {
  userModel = signal({name: ''});

  userForm = form(this.userModel, (schemaPath) => {
    debounce(schemaPath.name, 'blur');
  });
}
```

IMPORTANT: Эмитьте `touch` на `blur` (когда фокус покидает контрол), а не на `focus`. Без output `touch` поле никогда не регистрируется как blurred, поэтому `debounce('blur')` не влияет на контрол.

## Преобразование значений {#value-transformation}

Контролы иногда отображают значения иначе, чем модель формы их хранит — date picker может показывать "January 15, 2024", храня "2024-01-15", а currency input — "$1,234.56", храня 1234.56.

Используйте `linkedSignal()` (из `@angular/core`), чтобы преобразовать значение модели для отображения, и обрабатывайте события input, чтобы разобрать ввод пользователя обратно в формат хранения:

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

## Интеграция валидации {#validation-integration}

Контролы отображают состояние валидации, но не выполняют валидацию. Валидация происходит в схеме формы — контрол получает сигналы `invalid()` и `errors()` от директивы FormField и отображает их (как показано в примере StatefulInput выше).

Директива FormField также передаёт значения ограничений валидации вроде `required`, `min`, `max`, `minLength`, `maxLength` и `pattern`. Контрол может использовать их для улучшения UI:

```ts
export class NumberInput implements FormValueControl<number> {
  value = model<number>(0);

  // Constraint values from schema validation rules
  required = input<boolean>(false);
  min = input<number | undefined>(undefined);
  max = input<number | undefined>(undefined);
}
```

Когда в схему добавляются правила валидации `min()` и `max()`, директива FormField передаёт эти значения контролу. Используйте их для применения HTML5-атрибутов или показа подсказок об ограничениях в шаблоне.

IMPORTANT: Не реализуйте логику валидации в контроле. Определяйте правила валидации в схеме формы и пусть контрол отображает результаты:

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

## Создание переиспользуемых контролов {#making-controls-reusable}

У пользовательского контрола часто есть неявные ожидания по валидации. Email-input нуждается в правилах `required` и `email` в каждой форме, где используется. Вместо того чтобы полагаться на то, что каждый потребитель заново объявит эти правила, упакуйте сопутствующую схему рядом с контролом и экспортируйте оба из одного модуля:

```ts {header: 'email-input.ts'}
import {schema, required, email} from '@angular/forms/signals';

export const emailFieldSchema = schema<string>((path) => {
  required(path, {message: 'Email is required'});
  email(path, {message: 'Enter a valid email address'});
});
```

Потребитель импортирует сопутствующую схему и включает её в форму через `apply()`:

```ts {header: 'registration.ts'}
import {form, apply} from '@angular/forms/signals';
import {emailFieldSchema} from './email-input';

registrationForm = form(this.registrationModel, (path) => {
  apply(path.email, emailFieldSchema);
});
```

`apply()` объединяет правила сопутствующей схемы в родительскую форму по указанному пути. Потребитель всё ещё может добавить больше правил к тому же полю, потому что `apply()` компонуется с другими правилами, а не заменяет их. Полное покрытие `schema()`, `apply()` и условной композиции с `applyWhen()` см. в [руководстве по схемам](guide/forms/signals/schemas).

### Соображения проектирования {#design-considerations}

Модель потребителя должна инициализировать каждое поле определённым значением. В Signal Forms `undefined` означает отсутствие поля, а не пустое значение. Для переиспользуемого email-контрола это значит, что потребитель должен использовать `''` как начальное значение, а не оставлять свойство undefined. Подробнее о выборе начальных значений см. в [руководстве по моделям форм](guide/forms/signals/models).

Кроме того, контролы не должны регистрировать собственные effects для управления состоянием. Система форм управляет состоянием полей через внутренние effects. Это значит, что контрол получает обновления состояния через input-сигналы. Если контролу нужно преобразовывать значения, используйте `linkedSignal()`, как показано в разделе «[Преобразование значений](#value-transformation)», а не `effect()`.

## Следующие шаги {#next-steps}

В этом руководстве рассмотрено создание пользовательских контролов, интегрирующихся с Signal Forms. Связанные руководства исследуют другие аспекты Signal Forms:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/models" title="Form models" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <!-- <docs-pill href="guide/forms/signals/arrays" title="Working with Arrays" /> -->
</docs-pill-row>
