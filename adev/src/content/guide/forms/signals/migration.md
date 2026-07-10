# Миграция существующих форм на Signal Forms

Это руководство описывает стратегии миграции существующих кодовых баз на Signal Forms с упором на совместимость с
существующими Reactive Forms.

## Миграция сверху вниз через `compatForm` {#top-down-migration-using-compatform}

Иногда нужно использовать существующие экземпляры reactive `FormControl` внутри Signal Form. Это полезно для
контролов, которые включают:

- Сложную асинхронную логику.
- Замысловатые операторы RxJS, которые ещё не портированы.
- Интеграцию с существующими сторонними библиотеками.

### Интеграция `FormControl` в signal form {#integrating-a-formcontrol-into-a-signal-form}

Рассмотрим существующий `passwordControl` со специализированным `enterprisePasswordValidator`. Вместо переписывания
валидатора можно встроить контрол в signal-состояние.

Это делается через `compatForm`:

```typescript
import {signal} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {compatForm} from '@angular/forms/signals/compat';

// 1. Existing control with a specialized validator
const passwordControl = new FormControl('', {
  validators: [Validators.required, enterprisePasswordValidator()],
  nonNullable: true,
});

// 2. Wrap it inside your form state signal
const user = signal({
  email: '',
  password: passwordControl, // Nest the existing control directly
});

// 3. Create the form
const f = compatForm(user);

// Access values via the signal tree
console.log(f.email().value()); // Current email value
console.log(f.password().value()); // Current value of passwordControl

// Reactive state is proxied automatically
const isPasswordValid = f.password().valid();
const passwordErrors = f.password().errors(); // Returns CompatValidationError if the existing validator fails
```

В шаблоне используйте стандартный reactive-синтаксис, привязывая лежащий в основе контрол:

```angular-html
<form novalidate>
  <div>
    <label>
      Email:
      <input [formField]="f.email" />
    </label>
  </div>

  <div>
    <label>
      Password:
      <input [formField]="f.password" type="password" />
    </label>

    @if (f.password().touched() && f.password().invalid()) {
      <div class="error-list">
        @for (error of f.password().errors(); track error) {
          <p>{{ error.message || error.kind }}</p>
        }
      </div>
    }
  </div>
</form>
```

<docs-code-multifile preview path="adev/src/content/examples/signal-forms/src/compat-form-control-integration/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signal-forms/src/compat-form-control-integration/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signal-forms/src/compat-form-control-integration/app/app.html"/>
</docs-code-multifile>

### Интеграция `FormGroup` в signal form {#integrating-a-formgroup-into-a-signal-form}

Можно также обернуть целую `FormGroup`. Это часто нужно, когда переиспользуемая подсекция формы — например,
**Address Block** — всё ещё управляется существующими Reactive Forms.

```typescript
import {signal} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {compatForm} from '@angular/forms/signals/compat';

// 1. An existing address group with its own validation logic
const addressGroup = new FormGroup({
  street: new FormControl('123 Angular Way', Validators.required),
  city: new FormControl('Mountain View', Validators.required),
  zip: new FormControl('94043', Validators.required),
});

// 2. Include it in the state like it's a value
const checkoutModel = signal({
  customerName: 'Pirojok the Cat',
  shippingAddress: addressGroup,
});

const f = compatForm(checkoutModel, (p) => {
  required(p.customerName);
});
```

Поле `shippingAddress` действует как ветвь в дереве Signal Form. Эти вложенные контролы можно привязать в
шаблоне, обращаясь к лежащим в основе существующим контролам через `.control()`:

```angular-html
<form novalidate>
  <h3>Shipping Details</h3>

  <div>
    <label>
      Customer Name:
      <input [formField]="f.customerName" />
    </label>

    @if (f.customerName().touched() && f.customerName().invalid()) {
      <div class="error-list">
        <p>Customer name is required.</p>
      </div>
    }
  </div>

  <fieldset>
    <legend>Address</legend>

    @let street = f.shippingAddress().control().controls.street;
    <div>
      <label>
        Street:
        <input [formControl]="street" />
      </label>
      @if (street.touched && street.invalid) {
        <div class="error-list">
          <p>Street is required</p>
        </div>
      }
    </div>

    @let city = f.shippingAddress().control().controls.city;
    <div>
      <label>
        City:
        <input [formControl]="city" />
      </label>
      @if (city.touched && city.invalid) {
        <div class="error-list">
          <p>City is required</p>
        </div>
      }
    </div>

    @let zip = f.shippingAddress().control().controls.zip;
    <div>
      <label>
        Zip Code:
        <input [formControl]="zip" />
      </label>
      @if (zip.touched && zip.invalid) {
        <div class="error-list">
          <p>Zip Code is required</p>
        </div>
      }
    </div>
  </fieldset>
</form>
```

<docs-code-multifile preview path="adev/src/content/examples/signal-forms/src/compat-form-group-integration/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signal-forms/src/compat-form-group-integration/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signal-forms/src/compat-form-group-integration/app/app.html"/>
</docs-code-multifile>

### Доступ к значениям {#accessing-values}

Хотя `compatForm` проксирует доступ к значению на уровне `FormControl`, полное значение формы сохраняет контрол:

```typescript
const passwordControl = new FormControl('password' /** ... */);

const user = signal({
  email: '',
  password: passwordControl, // Nest the existing control directly
});

const form = compatForm(user);
form.password().value(); // 'password'
form().value(); // { email: '', password: FormControl}
```

Если нужно значение всей формы, его придётся собрать вручную:

```typescript
const formValue = computed(() => ({
  email: form.email().value(),
  password: form.password().value(),
})); // {email: '', password: ''}
```

## Миграция снизу вверх {#bottom-up-migration}

### Интеграция Signal Form в `FormGroup` {#integrating-a-signal-form-into-a-formgroup}

Можно использовать `SignalFormControl`, чтобы представить signal-based форму как стандартный `FormControl`. Это полезно, когда нужно
мигрировать листовые узлы формы на Signals, сохраняя родительскую структуру `FormGroup`.

```typescript
import {Component, signal} from '@angular/core';
import {ReactiveFormsModule, FormGroup} from '@angular/forms';
import {SignalFormControl} from '@angular/forms/signals/compat';
import {required} from '@angular/forms/signals';

@Component({
  // ...
  imports: [ReactiveFormsModule],
})
export class UserProfile {
  // 1. Create a SignalFormControl, use signal form rules.
  emailControl = new SignalFormControl('', (p) => {
    required(p, {message: 'Email is required'});
  });

  // 2. Use it in an existing FormGroup
  form = new FormGroup({
    email: this.emailControl,
  });
}
```

`SignalFormControl` синхронизирует значения двунаправленно между системами **Signal Forms** и **Reactive Forms**:

- **Signal -> Reactive**: обновление значения через Signal Forms сразу обновляет контрол Reactive Form.

```typescript
// Signal Forms update
this.emailControl.fieldTree().value.set('new@example.com');

// Reactive Forms reflects the change
console.log(this.form.value); // {email: 'new@example.com'}
```

- **Reactive -> Signal**: обновление значения через родительский `FormGroup` обновляет состояние Signal Forms.

```typescript
// Reactive Forms update
this.form.patchValue({email: 'other@example.com'});

// Signal Forms reflects the change
console.log(this.emailControl.fieldTree().value()); // 'other@example.com'
```

### Привязка `SignalFormControl` {#binding-signalformcontrol}

Чтобы использовать `SignalFormControl` в `FormGroup`, передайте его как контрол и привяжите в шаблоне через `.fieldTree`:

```typescript
readonly emailControl = new SignalFormControl('', (p) => { required(p); });

readonly form = new FormGroup({
  name: new FormControl('Alice'),
  email: this.emailControl,
});
```

```angular-html {prefer}
<form [formGroup]="form">
  <!-- Standard control -->
  <input formControlName="name" />

  <!-- Signal control -->
  <input [formField]="emailControl.fieldTree" />
</form>
```

```angular-html {avoid}
<!-- Avoid: Using formControlName or [formControl] for SignalFormControl -->
<input formControlName="email" />
<input [formControl]="emailControl" />
```

### Почему `SignalFormControl` принимает значение, а не сигнал {#why-signalformcontrol-takes-a-value-instead-of-a-signal}

В стандартных Signal Forms форму создают, передавая сигнал: `form(mySignal)`.

Однако `SignalFormControl` принимает **сырое значение** (строку или объект) как первый аргумент:

```typescript
// Takes a raw value, not a signal
const userControl = new SignalFormControl({
  email: 'pirojok@example.com',
});
```

`SignalFormControl` создаёт сигнал внутри, чтобы перехватывать записи и запускать **синхронные обновления**, ожидаемые Reactive Forms.

К внутреннему сигналу по-прежнему можно обратиться через `.sourceValue`:

```typescript
const value = userControl.sourceValue();
```

### Отключение/включение контрола {#disablingenabling-control}

Императивные API для изменения состояния enabled/disabled (вроде `enable()`, `disable()`) намеренно не поддерживаются
в `SignalFormControl`. Состояние контрола должно выводиться из signal-состояния и правил.

Попытка вызвать disable/enable выбросит ошибку.

```typescript {avoid}
import {signal, effect} from '@angular/core';

export class UserProfile {
  readonly emailControl = new SignalFormControl('');

  readonly isLoading = signal(false);

  constructor() {
    // This will throw an error
    effect(() => {
      if (this.isLoading()) {
        this.emailControl.disable();
      } else {
        this.emailControl.enable();
      }
    });
  }
}
```

Вместо этого используйте правило disabled:

```typescript {prefer}
import {signal} from '@angular/core';
import {SignalFormControl} from '@angular/forms/signals/compat';
import {disabled} from '@angular/forms/signals';

export class UserProfile {
  readonly isLoading = signal(false);

  readonly emailControl = new SignalFormControl('', (p) => {
    // The control becomes disabled whenever isLoading is true
    disabled(p, {when: () => this.isLoading()});
  });

  async saveData() {
    this.isLoading.set(true);
    // ... perform save ...
    this.isLoading.set(false);
  }
}
```

### Динамическое управление {#dynamic-manipulation}

Императивные API для добавления или удаления валидаторов (вроде `addValidators()`, `removeValidators()`, `setValidators()`)
намеренно не поддерживаются в `SignalFormControl`.

Попытка вызвать эти методы выбросит ошибку.

```typescript {avoid}
export class UserProfile {
  readonly emailControl = new SignalFormControl('');
  readonly isRequired = signal(false);

  toggleRequired() {
    this.isRequired.update((v) => !v);
    // This will throw an error
    if (this.isRequired()) {
      this.emailControl.addValidators(Validators.required);
    } else {
      this.emailControl.removeValidators(Validators.required);
    }
  }
}
```

Вместо этого используйте правило `applyWhen`, чтобы условно применять валидаторы:

```typescript {prefer}
import {signal} from '@angular/core';
import {SignalFormControl} from '@angular/forms/signals/compat';
import {applyWhen, required} from '@angular/forms/signals';

export class UserProfile {
  readonly isRequired = signal(false);

  readonly emailControl = new SignalFormControl('', (p) => {
    // The control becomes required whenever isRequired is true
    applyWhen(
      p,
      () => this.isRequired(),
      (p) => {
        required(p);
      },
    );
  });
}
```

### Ручной выбор ошибок {#manual-error-selection}

Методы `setErrors()` и `markAsPending()` не поддерживаются. В Signal Forms ошибки выводятся из правил валидации
и статуса async-валидации. Если нужно сообщить об ошибке, это следует делать декларативно через правило валидации
в схеме.

## Автоматические классы статуса {#automatic-status-classes}

Reactive/Template Forms автоматически добавляют [атрибуты class](/guide/forms/template-driven-forms#track-control-states) (
такие как `.ng-valid` или `.ng-dirty`) для стилизации состояний контрола. Signal Forms этого не делают.

Чтобы сохранить это поведение, можно предоставить пресет `NG_STATUS_CLASSES`:

```typescript
import {provideSignalFormsConfig} from '@angular/forms/signals';
import {NG_STATUS_CLASSES} from '@angular/forms/signals/compat';

bootstrapApplication(App, {
  providers: [
    provideSignalFormsConfig({
      classes: NG_STATUS_CLASSES,
    }),
  ],
});
```

Можно также предоставить собственную конфигурацию, чтобы применять любые классы на основе своей логики:

```typescript
import {provideSignalFormsConfig} from '@angular/forms/signals';

bootstrapApplication(App, {
  providers: [
    provideSignalFormsConfig({
      classes: {
        'ng-valid': ({state}) => state().valid(),
        'ng-invalid': ({state}) => state().invalid(),
        'ng-touched': ({state}) => state().touched(),
        'ng-dirty': ({state}) => state().dirty(),
      },
    }),
  ],
});
```

## Пользовательские контролы {#custom-controls}

Любой [пользовательский контрол Signal Form](guide/forms/signals/custom-controls) можно
использовать с Reactive (и Template-Driven) Forms как есть. Это позволяет
мигрировать существующие реализации `ControlValueAccessor` на
`FormValueControl`/`FormCheckboxControl` без поломки существующих использований.

IMPORTANT: **Не** реализуйте одновременно `ControlValueAccessor` и
`FormValueControl`/`FormCheckboxControl` на одном компоненте. Реализуйте одно или
другое.

Дан следующий пользовательский контрол:

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

Этот пользовательский контрол можно использовать с reactive forms так же, как нативный input
или пользовательский контрол на основе `ControlValueAccessor`. Например, рассмотрим этот
простой компонент с Reactive Form.

```angular-ts
import {Component} from '@angular/core';
import {FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';
import {BasicInput} from './basic-input';

@Component({
  selector: 'app-example',
  template: `
    <form [formGroup]="reactiveFormGroup">
      <app-basic-input formControlName="reactiveControlName" />
    </form>
    <p>Text: {{ reactiveFormGroup.value.reactiveControlName }}</p>
  `,
  imports: [ReactiveFormsModule],
})
export class ExampleComponent {
  readonly reactiveFormGroup = new FormGroup({
    reactiveControlName: new FormControl(''),
  });
}
```

Любое изменение пользовательского контрола `app-basic-input` отразится в
reactive `FormControl`.
