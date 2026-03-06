# Миграция существующих форм на Signal Forms {#migrating-existing-forms-to-signal-forms}

В этом руководстве описаны стратегии миграции существующих кодовых баз на Signal Forms с акцентом на совместимость с существующими реактивными формами.

## Миграция сверху вниз с помощью `compatForm` {#top-down-migration-using-compatform}

Иногда может понадобиться использовать существующие экземпляры реактивного `FormControl` в рамках Signal Form. Это полезно для элементов управления, включающих:

- сложную асинхронную логику;
- сложные RxJS-операторы, которые ещё не перенесены;
- интеграцию с существующими сторонними библиотеками.

### Интеграция `FormControl` в Signal Form {#integrating-a-formcontrol-into-a-signal-form}

Рассмотрим существующий `passwordControl`, использующий специализированный `enterprisePasswordValidator`. Вместо переписывания валидатора можно связать элемент управления с состоянием сигнала.

Это делается с помощью `compatForm`:

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

В шаблоне используйте стандартный реактивный синтаксис, привязываясь к базовому элементу управления:

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

### Интеграция `FormGroup` в Signal Form {#integrating-a-formgroup-into-a-signal-form}

Можно также обернуть целый `FormGroup`. Это распространено, когда повторно используемая подсекция формы — например, **блок адреса** — по-прежнему управляется существующими реактивными формами.

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

Поле `shippingAddress` выступает ветвью в дереве Signal Form. Эти вложенные элементы управления можно привязать в шаблоне, обращаясь к базовым существующим элементам через `.control()`:

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

Хотя `compatForm` проксирует доступ к значениям на уровне `FormControl`, значение всей формы сохраняет элемент управления:

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

Если нужно полное значение формы, его придётся собирать вручную:

```typescript
const formValue = computed(() => ({
  email: form.email().value(),
  password: form.password().value(),
})); // {email: '', password: ''}
```

## Миграция снизу вверх {#bottom-up-migration}

### Интеграция Signal Form в `FormGroup` {#integrating-a-signal-form-into-a-formgroup}

Можно использовать `SignalFormControl` для представления формы на основе сигналов в виде стандартного `FormControl`. Это полезно при миграции листовых узлов формы на сигналы с сохранением родительской структуры `FormGroup`.

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

`SignalFormControl` синхронизирует значения и статус валидации в обоих направлениях:

- **Сигнал → Элемент управления:** изменение `email.set(...)` обновляет `emailControl.value` и значение родительского `form`.
- **Элемент управления → Сигнал:** ввод текста (обновление `emailControl`) обновляет сигнал `email`.
- **Валидация:** валидаторы схемы (например, `required`) передают ошибки в `emailControl.errors`.

### Включение/отключение элемента управления {#disabling-enabling-control}

Императивные API для изменения состояния включённости/отключённости (например, `enable()`, `disable()`) намеренно не поддерживаются в `SignalFormControl`. Это связано с тем, что состояние элемента управления должно выводиться из состояния сигнала и правил.

Попытка вызова disable/enable приведёт к ошибке.

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

Вместо этого используйте правило `disabled`:

```typescript {prefer}
import {signal} from '@angular/core';
import {SignalFormControl} from '@angular/forms/signals/compat';
import {disabled} from '@angular/forms/signals';

export class UserProfile {
  readonly isLoading = signal(false);

  readonly emailControl = new SignalFormControl('', (p) => {
    // The control becomes disabled whenever isLoading is true
    disabled(p, () => this.isLoading());
  });

  async saveData() {
    this.isLoading.set(true);
    // ... perform save ...
    this.isLoading.set(false);
  }
}
```

### Динамическое управление {#dynamic-manipulation}

Императивные API для добавления или удаления валидаторов (например, `addValidators()`, `removeValidators()`, `setValidators()`) намеренно не поддерживаются в `SignalFormControl`.

Попытка вызова этих методов приведёт к ошибке.

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

Вместо этого используйте правило `applyWhen` для условного применения валидаторов:

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

Методы `setErrors()` и `markAsPending()` не поддерживаются. В Signal Forms ошибки выводятся из правил валидации и статуса асинхронной валидации. Если необходимо сообщить об ошибке, это должно делаться декларативно через правило валидации в схеме.

## Автоматические классы состояния {#automatic-status-classes}

Реактивные/шаблонные формы автоматически добавляют [атрибуты класса](/guide/forms/template-driven-forms#track-control-states) (например, `.ng-valid` или `.ng-dirty`) для упрощения стилизации состояний элементов управления. Signal Forms этого не делает.

Если требуется сохранить такое поведение, можно использовать пресет `NG_STATUS_CLASSES`:

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

Также можно предоставить собственную конфигурацию для применения любых классов на основе пользовательской логики:

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

<!-- TODO: include some high level usage comment about how people should mostly interact with this via the signal forms API exposed on .fieldTree, not via the reactive forms methods. -->
<!-- TODO: Elaborate on why the value taken is not a signal. -->
