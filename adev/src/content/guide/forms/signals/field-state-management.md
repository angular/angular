# Управление состоянием поля {#field-state-management}

Состояние поля в Signal Forms позволяет реагировать на взаимодействия пользователя, предоставляя реактивные сигналы для статуса валидации (такие как `valid`, `invalid`, `errors`), отслеживания взаимодействия (такие как `touched`, `dirty`) и доступности (такие как `disabled`, `hidden`).

## Понимание состояния поля {#understanding-field-state}

При создании формы с помощью функции [`form()`](api/forms/signals/form) она возвращает **дерево полей** — объектную структуру, отражающую модель формы. Каждое поле дерева доступно через точечную нотацию (например, [`form.email`](api/forms/signals/form#email)).

### Доступ к состоянию поля {#accessing-field-state}

При вызове любого поля дерева как функции (например, [`form.email()`](api/forms/signals/form#email)) возвращается объект `FieldState`, содержащий реактивные сигналы для отслеживания состояния валидации, взаимодействия и доступности поля. Например, сигнал `invalid()` сообщает, есть ли в поле ошибки валидации:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, required, email} from '@angular/forms/signals';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `
    <input type="email" [formField]="registrationForm.email" />

    @if (registrationForm.email().invalid()) {
      <p class="error">Email has validation errors:</p>
      <ul>
        @for (error of registrationForm.email().errors(); track error) {
          <li>{{ error.message }}</li>
        }
      </ul>
    }
  `,
})
export class Registration {
  registrationModel = signal({
    email: '',
    password: '',
  });

  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.email, {message: 'Email is required'});
    email(schemaPath.email, {message: 'Enter a valid email address'});
  });
}
```

В этом примере шаблон проверяет `registrationForm.email().invalid()`, чтобы определить, нужно ли отображать сообщение об ошибке.

### Сигналы состояния поля {#field-state-signals}

Наиболее часто используемый сигнал — `value()`, `WritableSignal`, предоставляющий доступ к текущему значению поля:

```ts
const emailValue = registrationForm.email().value();
console.log(emailValue); // Current email string
```

Помимо `value()`, состояние поля включает сигналы для валидации, отслеживания взаимодействия и управления доступностью:

| Категория                                     | Сигнал       | Описание                                                                                               |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| **[Валидация](#validation-state)**            | `valid()`    | Поле прошло все правила валидации и не имеет ожидающих валидаторов                                    |
|                                               | `invalid()`  | Поле содержит ошибки валидации                                                                         |
|                                               | `errors()`   | Массив объектов ошибок валидации                                                                       |
|                                               | `pending()`  | Выполняется асинхронная валидация                                                                      |
| **[Взаимодействие](#interaction-state)**      | `touched()`  | Пользователь сфокусировался на поле и потерял фокус (если поле интерактивно)                          |
|                                               | `dirty()`    | Пользователь изменил поле (если интерактивно), даже если значение совпадает с начальным               |
| **[Доступность](#availability-state)**        | `disabled()` | Поле отключено и не влияет на состояние родительской формы                                             |
|                                               | `hidden()`   | Указывает, что поле должно быть скрыто; видимость в шаблоне управляется через `@if`                   |
|                                               | `readonly()` | Поле только для чтения и не влияет на состояние родительской формы                                    |

Эти сигналы позволяют создавать отзывчивые пользовательские интерфейсы форм, реагирующие на действия пользователя. Разделы ниже подробно рассматривают каждую категорию.

## Состояние валидации {#validation-state}

Сигналы состояния валидации сообщают, является ли поле действительным и какие ошибки оно содержит.

NOTE: Это руководство посвящено **использованию** состояния валидации в шаблонах и логике (чтению `valid()`, `invalid()`, `errors()` для отображения обратной связи). Информацию об **определении** правил валидации и создании пользовательских валидаторов см. в [руководстве по валидации](guide/forms/signals/validation).

### Проверка валидности {#checking-validity}

Используйте `valid()` и `invalid()` для проверки статуса валидации:

```angular-ts
@Component({
  template: `
    <input type="email" [formField]="loginForm.email" />

    @if (loginForm.email().invalid()) {
      <p class="error">Email is invalid</p>
    }
    @if (loginForm.email().valid()) {
      <p class="success">Email looks good</p>
    }
  `,
})
export class Login {
  loginModel = signal({email: '', password: ''});
  loginForm = form(this.loginModel);
}
```

| Сигнал      | Возвращает `true`, когда                                              |
| ----------- | --------------------------------------------------------------------- |
| `valid()`   | Поле прошло все правила и не имеет ожидающих валидаторов             |
| `invalid()` | Поле содержит ошибки валидации                                        |

При проверке валидности в коде используйте `invalid()` вместо `!valid()`, если нужно различать «есть ошибки» и «валидация ожидается». Причина в том, что `valid()` и `invalid()` могут одновременно возвращать `false` при ожидании асинхронной валидации: поле ещё не действительно (валидация не завершена) и также не является недействительным (ошибок ещё не найдено).

### Чтение ошибок валидации {#reading-validation-errors}

Получите доступ к массиву ошибок валидации с помощью `errors()`. Каждый объект ошибки содержит:

| Свойство    | Описание                                                               |
| ----------- | ---------------------------------------------------------------------- |
| `kind`      | Правило, которое не прошло (например, "required" или "email")         |
| `message`   | Необязательное читаемое сообщение об ошибке                            |
| `fieldTree` | Ссылка на `FieldTree`, где произошла ошибка                            |

NOTE: Свойство `message` необязательно. Валидаторы могут предоставлять пользовательские сообщения, но если они не указаны, может потребоваться сопоставление значений `kind` с собственными сообщениями.

Пример отображения ошибок в шаблоне:

```angular-ts
@Component({
  template: `
    <input type="email" [formField]="loginForm.email" />

    @if (loginForm.email().errors().length > 0) {
      <div class="errors">
        @for (error of loginForm.email().errors(); track error) {
          <p>{{ error.message }}</p>
        }
      </div>
    }
  `
})
```

Этот подход перебирает все ошибки поля, отображая каждое сообщение об ошибке пользователю.

### Ожидающая валидация {#pending-validation}

Сигнал `pending()` указывает на выполнение асинхронной валидации:

```angular-ts
@Component({
  template: `
    <input type="email" [formField]="signupForm.email" />

    @if (signupForm.email().pending()) {
      <p>Checking if email is available...</p>
    }

    @if (signupForm.email().invalid() && !signupForm.email().pending()) {
      <p>Email is already taken</p>
    }
  `
})
```

Этот сигнал позволяет отображать состояния загрузки во время выполнения асинхронной валидации.

## Состояние взаимодействия {#interaction-state}

Состояние взаимодействия отслеживает, взаимодействовали ли пользователи с полями, реализуя паттерны типа «показывать ошибки только после того, как пользователь коснулся поля».

### Состояние touched {#touched-state}

Сигнал `touched()` отслеживает, сфокусировался ли пользователь на поле и потерял ли фокус. Он становится `true`, когда пользователь фокусируется на поле и затем теряет фокус через взаимодействие с пользователем (не программно). Скрытые, отключённые и поля только для чтения не являются интерактивными и не становятся touched через взаимодействие пользователя.

### Состояние dirty {#dirty-state}

Формам часто нужно определять, действительно ли данные изменились — например, чтобы предупреждать пользователей о несохранённых изменениях или активировать кнопку сохранения только при необходимости. Сигнал `dirty()` отслеживает, изменял ли пользователь поле.

Сигнал `dirty()` становится `true`, когда пользователь изменяет значение интерактивного поля, и остаётся `true`, даже если значение возвращается к начальному:

```angular-ts
@Component({
  template: `
    <form novalidate>
      <input [formField]="profileForm.name" />
      <input [formField]="profileForm.bio" />

      @if (profileForm().dirty()) {
        <p class="warning">You have unsaved changes</p>
      }
    </form>
  `,
})
export class Profile {
  profileModel = signal({name: 'Alice', bio: 'Developer'});
  profileForm = form(this.profileModel);
}
```

Используйте `dirty()` для предупреждений о «несохранённых изменениях» или для активации кнопок сохранения только при изменении данных.

### Touched vs dirty {#touched-vs-dirty}

Эти сигналы отслеживают разные взаимодействия пользователя:

| Сигнал      | Когда становится true                                                                                                             |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `touched()` | Пользователь сфокусировался и потерял фокус на интерактивном поле (даже если ничего не изменил)                                  |
| `dirty()`   | Пользователь изменил интерактивное поле (даже если никогда не терял фокус и даже если текущее значение совпадает с начальным)    |

Поле может находиться в разных комбинациях:

| Состояние              | Сценарий                                                              |
| ---------------------- | --------------------------------------------------------------------- |
| Touched, но не dirty   | Пользователь сфокусировался и потерял фокус, не внося изменений       |
| Оба: touched и dirty   | Пользователь сфокусировался, изменил значение и потерял фокус         |

NOTE: Скрытые, отключённые и поля только для чтения не являются интерактивными — они не становятся touched или dirty через взаимодействие пользователя.

## Состояние доступности {#availability-state}

Сигналы состояния доступности управляют тем, являются ли поля интерактивными, редактируемыми или видимыми. Отключённые, скрытые поля и поля только для чтения не являются интерактивными. Они не влияют на то, является ли их родительская форма действительной, touched или dirty.

### Отключённые поля {#disabled-fields}

Сигнал `disabled()` указывает, принимает ли поле пользовательский ввод. Отключённые поля отображаются в UI, но пользователи не могут с ними взаимодействовать.

```angular-ts
import { Component, signal } from '@angular/core'
import { form, FormField, disabled } from '@angular/forms/signals'

@Component({
  selector: 'app-order',
  imports: [FormField],
  template: `
    <!-- TIP: The `[formField]` directive automatically binds the `disabled` attribute based on the field's `disabled()` state, so you don't need to manually add `[disabled]="field().disabled()"` -->
    <input [formField]="orderForm.couponCode" />

    @if (orderForm.couponCode().disabled()) {
      <p class="info">Coupon code is only available for orders over $50</p>
    }
  `
})
export class Order {
  orderModel = signal({
    total: 25,
    couponCode: ''
  })

  orderForm = form(this.orderModel, schemaPath => {
    disabled(schemaPath.couponCode, ({valueOf}) => valueOf(schemaPath.total) < 50)
  })
}
```

В этом примере используется `valueOf(schemaPath.total)` для проверки значения поля `total` и определения, должен ли `couponCode` быть отключён.

NOTE: Параметр обратного вызова схемы (`schemaPath` в этих примерах) — объект `SchemaPathTree`, предоставляющий пути ко всем полям формы. Его можно называть как угодно.

При определении правил вроде `disabled()`, `hidden()` или `readonly()` обратный вызов логики получает объект `FieldContext`, который обычно деструктурируется (например, `({valueOf})`). Два метода, часто используемые в правилах:

- `valueOf(schemaPath.otherField)` — Читать значение другого поля формы
- `value()` — Сигнал, содержащий значение поля, к которому применяется правило

Отключённые поля не влияют на состояние валидации родительской формы. Даже если отключённое поле было бы недействительным, родительская форма может быть действительной. Состояние `disabled()` влияет на интерактивность и валидацию, но не изменяет значение поля.

### Скрытые поля {#hidden-fields}

Сигнал `hidden()` указывает, скрыто ли поле условно. Используйте `hidden()` с `@if` для отображения или скрытия полей на основе условий:

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

Скрытые поля не участвуют в валидации. Если обязательное поле скрыто, оно не будет препятствовать отправке формы. Состояние `hidden()` влияет на доступность и валидацию, но не изменяет значение поля.

### Поля только для чтения {#readonly-fields}

Сигнал `readonly()` указывает, является ли поле только для чтения. Поля только для чтения отображают своё значение, но пользователи не могут их редактировать:

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

NOTE: Директива `[formField]` автоматически привязывает атрибут `readonly` на основе состояния `readonly()` поля, поэтому не нужно вручную добавлять `[readonly]="field().readonly()"`.

Как и отключённые и скрытые поля, поля только для чтения не являются интерактивными и не влияют на состояние родительской формы. Состояние `readonly()` влияет на редактируемость и валидацию, но не изменяет значение поля.

### Когда использовать каждое {#when-to-use-each}

| Состояние    | Используйте, когда                                                                 | Пользователь видит | Может взаимодействовать | Влияет на валидацию |
| ------------ | ----------------------------------------------------------------------------------- | ------------------ | ----------------------- | ------------------- |
| `disabled()` | Поле временно недоступно (например, на основе значений других полей)               | Да                 | Нет                     | Нет                 |
| `hidden()`   | Поле не актуально в текущем контексте                                               | Нет (с @if)        | Нет                     | Нет                 |
| `readonly()` | Значение должно быть видимым, но не редактируемым                                   | Да                 | Нет                     | Нет                 |

## Состояние на уровне формы {#form-level-state}

Корневая форма также является полем в дереве полей. При вызове как функции она возвращает объект `FieldState`, агрегирующий состояние всех дочерних полей.

### Доступ к состоянию формы {#accessing-form-state}

```angular-ts
@Component({
  template: `
    <form novalidate>
      <input [formField]="loginForm.email" />
      <input [formField]="loginForm.password" />

      <button [disabled]="!loginForm().valid()">Sign In</button>
    </form>
  `,
})
export class Login {
  loginModel = signal({email: '', password: ''});
  loginForm = form(this.loginModel);
}
```

В этом примере форма действительна только при действительности всех дочерних полей. Это позволяет включать/отключать кнопки отправки на основе общей валидности формы.

### Сигналы на уровне формы {#form-level-signals}

Поскольку корневая форма является полем, она имеет те же сигналы (такие как `valid()`, `invalid()`, `touched()`, `dirty()` и т.д.).

| Сигнал      | Поведение на уровне формы                                                        |
| ----------- | -------------------------------------------------------------------------------- |
| `valid()`   | Все интерактивные поля действительны, ни один валидатор не ожидает              |
| `invalid()` | По крайней мере одно интерактивное поле содержит ошибки валидации               |
| `pending()` | По крайней мере одно интерактивное поле имеет ожидающую асинхронную валидацию   |
| `touched()` | Пользователь затронул хотя бы одно интерактивное поле                           |
| `dirty()`   | Пользователь изменил хотя бы одно интерактивное поле                            |

### Когда использовать состояние формы vs поля {#when-to-use-form-level-vs-field-level}

**Используйте состояние на уровне формы для:**

- Состояние включения/отключения кнопки отправки
- Состояние кнопки «Сохранить»
- Проверки общей валидности формы
- Предупреждения о несохранённых изменениях

**Используйте состояние на уровне поля для:**

- Сообщения об ошибках отдельного поля
- Стилизация конкретного поля
- Обратная связь по валидации для каждого поля
- Условная доступность поля

## Распространение состояния {#state-propagation}

Состояние поля распространяется от дочерних полей вверх через родительские группы полей до корневой формы.

### Как состояние дочерних полей влияет на родительские формы {#how-child-state-affects-parent-forms}

Когда дочернее поле становится недействительным, его родительская группа полей становится недействительной, и корневая форма тоже. Когда дочерний элемент становится touched или dirty, родительская группа и корневая форма отражают это изменение. Такая агрегация позволяет проверять валидность на любом уровне — поля или всей формы.

```ts
const userModel = signal({
  profile: {
    firstName: '',
    lastName: '',
  },
  address: {
    street: '',
    city: '',
  },
});

const userForm = form(userModel);

// If firstName is invalid, profile is invalid
userForm.profile.firstName().invalid() === true;
// → userForm.profile().invalid() === true
// → userForm().invalid() === true
```

### Скрытые, отключённые и поля только для чтения {#hidden-disabled-and-readonly-fields}

Скрытые, отключённые и поля только для чтения не являются интерактивными и не влияют на состояние родительской формы:

```ts
const orderModel = signal({
  customerName: '',
  requiresShipping: false,
  shippingAddress: '',
});

const orderForm = form(orderModel, (schemaPath) => {
  hidden(schemaPath.shippingAddress, ({valueOf}) => !valueOf(schemaPath.requiresShipping));
});
```

В этом примере когда `shippingAddress` скрыт, он не влияет на валидность формы. В результате, даже если `shippingAddress` пуст и обязателен, форма может быть действительной.

Это поведение предотвращает блокировку отправки формы или влияние на состояния валидации, touched и dirty скрытыми, отключёнными или полями только для чтения.

## Использование состояния в шаблонах {#using-state-in-templates}

Сигналы состояния поля легко интегрируются с шаблонами Angular, обеспечивая реактивный пользовательский опыт без ручной обработки событий.

### Условное отображение ошибок {#conditional-error-display}

Показывайте ошибки только после взаимодействия пользователя с полем:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, email} from '@angular/forms/signals';

@Component({
  selector: 'app-signup',
  imports: [FormField],
  template: `
    <label>
      Email
      <input type="email" [formField]="signupForm.email" />
    </label>

    @if (signupForm.email().touched() && signupForm.email().invalid()) {
      <p class="error">{{ signupForm.email().errors()[0].message }}</p>
    }
  `,
})
export class Signup {
  signupModel = signal({email: '', password: ''});

  signupForm = form(this.signupModel, (schemaPath) => {
    email(schemaPath.email);
  });
}
```

Этот паттерн предотвращает отображение ошибок до того, как пользователь успел взаимодействовать с полем. Ошибки появляются только после того, как пользователь сфокусировался на поле и потерял фокус.

### Условная доступность поля {#conditional-field-availability}

Используйте сигнал `hidden()` с `@if` для условного отображения или скрытия полей:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, hidden} from '@angular/forms/signals';

@Component({
  selector: 'app-order',
  imports: [FormField],
  template: `
    <label>
      <input type="checkbox" [formField]="orderForm.requiresShipping" />
      Requires shipping
    </label>

    @if (!orderForm.shippingAddress().hidden()) {
      <label>
        Shipping Address
        <input [formField]="orderForm.shippingAddress" />
      </label>
    }
  `,
})
export class Order {
  orderModel = signal({
    requiresShipping: false,
    shippingAddress: '',
  });

  orderForm = form(this.orderModel, (schemaPath) => {
    hidden(schemaPath.shippingAddress, ({valueOf}) => !valueOf(schemaPath.requiresShipping));
  });
}
```

Скрытые поля не участвуют в валидации, позволяя отправлять форму, даже если скрытое поле в противном случае было бы недействительным.

### Отслеживание значений для полей-массивов {#tracking-values-for-array-fields}

В сигнальных формах блок `@for` по набору полей должен отслеживаться по идентификатору поля.

```angular-ts
@Component({
  imports: [FormField],
  template: `
    @for (field of form.emails; track field) {
      <input [formField]="field" />
    }
  `,
})
export class App {
  formModel = signal({emails: ['john.doe@mail.com', 'max.musterman@mail.com']});
  form = form(this.formModel);
}
```

Система форм уже отслеживает значения модели в массиве и автоматически поддерживает стабильный идентификатор создаваемых полей.

При изменении элемента он может представлять новую логическую сущность, даже если некоторые его свойства выглядят одинаково. Отслеживание по идентификатору гарантирует, что фреймворк обрабатывает его как отдельный элемент, а не повторно использует существующие элементы UI. Это предотвращает некорректное совместное использование состоятельных элементов, таких как поля ввода, и обеспечивает соответствие привязок правильной части модели.

## Использование состояния поля в логике компонента {#using-field-state-in-component-logic}

Сигналы состояния поля работают с реактивными примитивами Angular, такими как `computed()` и `effect()`, для реализации продвинутой логики форм.

### Проверки валидации перед отправкой {#validation-checks-before-submission}

Проверяйте валидность формы в методах компонента:

```ts
export class Registration {
  registrationModel = signal({
    username: '',
    email: '',
    password: '',
  });

  registrationForm = form(this.registrationModel);

  async onSubmit() {
    // Wait for any pending async validation
    if (this.registrationForm().pending()) {
      console.log('Waiting for validation...');
      return;
    }

    // Guard against invalid submissions
    if (this.registrationForm().invalid()) {
      console.error('Form is invalid');
      return;
    }

    const data = this.registrationModel();
    await this.api.register(data);
  }
}
```

Это гарантирует, что только действительные, полностью проверенные данные достигают вашего API.

### Производное состояние с computed {#derived-state-with-computed}

Создавайте вычисляемые сигналы на основе состояния поля, автоматически обновляющиеся при изменении базового состояния:

```ts
export class Password {
  passwordModel = signal({password: '', confirmPassword: ''});
  passwordForm = form(this.passwordModel);

  // Compute password strength indicator
  passwordStrength = computed(() => {
    const password = this.passwordForm.password().value();
    if (password.length < 8) return 'weak';
    if (password.length < 12) return 'medium';
    return 'strong';
  });

  // Check if all required fields are filled
  allFieldsFilled = computed(() => {
    return (
      this.passwordForm.password().value().length > 0 &&
      this.passwordForm.confirmPassword().value().length > 0
    );
  });
}
```

### Программные изменения состояния {#programmatic-state-changes}

Хотя состояние поля обычно обновляется через взаимодействия пользователя (ввод, фокус, потеря фокуса), иногда нужно управлять им программно. Распространённые сценарии — отправка формы и её сброс.

#### Отправка формы {#form-submission}

Signal Forms предоставляет директиву `FormRoot`, упрощающую отправку формы. Она автоматически предотвращает стандартное поведение браузера при отправке и устанавливает атрибут `novalidate` на элемент `<form>`.

```angular-ts
@Component({
  imports: [FormRoot, FormField],
  template: `
    <form [formRoot]="registrationForm">
      <input [formField]="registrationForm.username" />
      <input type="email" [formField]="registrationForm.email" />
      <input type="password" [formField]="registrationForm.password" />

      <button type="submit">Register</button>
    </form>
  `,
})
export class Registration {
  registrationModel = signal({username: '', email: '', password: ''});

  registrationForm = form(
    this.registrationModel,
    (schemaPath) => {
      required(schemaPath.username);
      email(schemaPath.email);
      required(schemaPath.password);
    },
    {
      submission: {
        action: async () => this.submitToServer(),
      },
    },
  );

  private submitToServer() {
    // Send data to server
  }
}
```

При использовании `FormRoot` отправка формы автоматически вызывает функцию `submit()`, которая помечает все поля как touched (раскрывая ошибки валидации) и выполняет обратный вызов `action`, если форма действительна.

Также можно отправить форму вручную, без директивы, вызвав `submit(this.registrationForm)`. При явном вызове функции `submit` можно передать `FormSubmitOptions` для переопределения логики `submission` формы по умолчанию: `submit(this.registrationForm, {action: () => /* ... */ })`.

#### Сброс форм после отправки {#resetting-forms-after-submission}

После успешной отправки формы может потребоваться вернуть её в начальное состояние — очистив как историю взаимодействий пользователя, так и значения полей. Метод `reset()` сбрасывает флаги touched и dirty. Также можно передать необязательное значение в `reset()` для обновления данных модели:

```ts
export class Contact {
  private readonly INITIAL_MODEL = {name: '', email: '', message: ''};
  contactModel = signal({...this.INITIAL_MODEL});
  contactForm = form(this.contactModel, {
    submission: {
      action: async (f) => {
        await this.api.sendMessage(this.contactModel());
        // Clear interaction state (touched, dirty) and reset to initial values
        f().reset({...this.INITIAL_MODEL});
      },
    },
  });
}
```

Это гарантирует готовность формы к новому вводу без отображения устаревших сообщений об ошибках или индикаторов dirty-состояния.

## Стилизация на основе состояния валидации {#styling-based-on-validation-state}

Можно применять пользовательские стили к форме, привязывая CSS-классы на основе состояния валидации:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, email} from '@angular/forms/signals';

@Component({
  template: `
    <input
      type="email"
      [formField]="form.email"
      [class.is-invalid]="form.email().touched() && form.email().invalid()"
      [class.is-valid]="form.email().touched() && form.email().valid()"
    />
  `,
  styles: `
    input.is-invalid {
      border: 2px solid red;
      background-color: white;
    }

    input.is-valid {
      border: 2px solid green;
    }
  `,
})
export class StyleExample {
  model = signal({email: ''});

  form = form(this.model, (schemaPath) => {
    email(schemaPath.email);
  });
}
```

Проверка как `touched()`, так и состояния валидации гарантирует, что стили появляются только после взаимодействия пользователя с полем.

## Следующие шаги {#next-steps}

В этом руководстве рассмотрены обработка статусов валидации и доступности, отслеживание взаимодействий и распространение состояния поля. Связанные руководства охватывают другие аспекты Signal Forms:

<!-- TODO: UNCOMMENT WHEN THE GUIDES ARE AVAILABLE -->
<docs-pill-row>
  <docs-pill href="guide/forms/signals/models" title="Модели форм" />
  <docs-pill href="guide/forms/signals/validation" title="Валидация" />
  <docs-pill href="guide/forms/signals/custom-controls" title="Пользовательские элементы управления" />
  <!-- <docs-pill href="guide/forms/signals/arrays" title="Working with Arrays" /> -->
</docs-pill-row>
