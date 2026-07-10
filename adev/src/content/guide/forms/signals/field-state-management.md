# Управление состоянием полей

Состояние полей Signal Forms позволяет реагировать на взаимодействия пользователя через реактивные сигналы статуса валидации (например, `valid`, `invalid`, `errors`), отслеживания взаимодействия (например, `touched`, `dirty`) и доступности (например, `disabled`, `hidden`).

## Понимание состояния поля {#understanding-field-state}

Когда вы создаёте форму функцией [`form()`](api/forms/signals/form), она возвращает **дерево полей** — объектную структуру, зеркалирующую модель формы. К каждому полю в дереве можно обратиться через точечную нотацию (например, [`form.email`](api/forms/signals/form#email)).

### Доступ к состоянию поля {#accessing-field-state}

Когда вы вызываете любое поле в дереве как функцию (например, [`form.email()`](api/forms/signals/form#email)), оно возвращает объект `FieldState` с реактивными сигналами, отслеживающими валидацию, взаимодействие и доступность поля. Например, сигнал `invalid()` показывает, есть ли у поля ошибки валидации:

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

В этом примере шаблон проверяет `registrationForm.email().invalid()`, чтобы решить, показывать ли сообщение об ошибке.

### Сигналы состояния поля {#field-state-signals}

Самый часто используемый сигнал — `value()`, `WritableSignal`, дающий доступ к текущему значению поля:

```ts
const emailValue = registrationForm.email().value();
console.log(emailValue); // Current email string
```

Помимо `value()`, состояние поля включает сигналы валидации, отслеживания взаимодействия и управления доступностью:

| Категория                               | Сигнал       | Описание                                                                          |
| --------------------------------------- | ------------ | --------------------------------------------------------------------------------- |
| **[Валидация](#validation-state)**      | `valid()`    | Поле проходит все правила валидации и не имеет ожидающих валидаторов              |
|                                         | `invalid()`  | У поля есть ошибки валидации                                                      |
|                                         | `errors()`   | Массив объектов ошибок валидации                                                  |
|                                         | `pending()`  | Выполняется асинхронная валидация                                                 |
| **[Взаимодействие](#interaction-state)** | `touched()` | Пользователь сфокусировал и снял фокус с поля (если оно интерактивно)             |
|                                         | `dirty()`    | Пользователь изменил поле (если оно интерактивно), даже если значение совпадает с начальным |
| **[Доступность](#availability-state)**  | `disabled()` | Поле отключено и не влияет на состояние родительской формы                        |
|                                         | `hidden()`   | Указывает, что поле должно быть скрыто; видимость в шаблоне контролируется через `@if` |
|                                         | `readonly()` | Поле только для чтения и не влияет на состояние родительской формы                |

Эти сигналы позволяют строить отзывчивый UX форм, реагирующий на поведение пользователя. Ниже каждая категория разобрана подробнее.

## Состояние валидации {#validation-state}

Сигналы состояния валидации показывают, валидно ли поле и какие ошибки оно содержит.

NOTE: Это руководство сосредоточено на **использовании** состояния валидации в шаблонах и логике (чтение `valid()`, `invalid()`, `errors()` для обратной связи). О **определении** правил валидации и создании пользовательских валидаторов см. [руководство по валидации](guide/forms/signals/validation).

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

| Сигнал      | Возвращает `true`, когда                                          |
| ----------- | ----------------------------------------------------------------- |
| `valid()`   | Поле проходит все правила валидации и не имеет ожидающих валидаторов |
| `invalid()` | У поля есть ошибки валидации                                      |

При проверке валидности в коде используйте `invalid()` вместо `!valid()`, если нужно различать «есть ошибки» и «валидация в ожидании». Причина в том, что и `valid()`, и `invalid()` могут одновременно быть `false`, пока выполняется асинхронная валидация: поле ещё не валидно, потому что проверка не завершена, и ещё не невалидно, потому что ошибок пока нет.

### Чтение ошибок валидации {#reading-validation-errors}

Доступ к массиву ошибок валидации — через `errors()`. Каждый объект ошибки содержит:

| Свойство    | Описание                                                        |
| ----------- | --------------------------------------------------------------- |
| `kind`      | Правило валидации, которое не прошло (например, "required" или "email") |
| `message`   | Необязательное человекочитаемое сообщение об ошибке             |
| `fieldTree` | Ссылка на `FieldTree`, где произошла ошибка                     |

NOTE: Свойство `message` необязательно. Валидаторы могут предоставлять пользовательские сообщения, но если они не заданы, может понадобиться сопоставить значения `kind` с собственными сообщениями.

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

Этот подход перебирает все ошибки поля и показывает каждое сообщение пользователю.

### Ожидающая валидация {#pending-validation}

Сигнал `pending()` указывает, что выполняется асинхронная валидация:

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

Этот сигнал позволяет показывать состояния загрузки, пока выполняется асинхронная валидация.

## Состояние взаимодействия {#interaction-state}

Состояние взаимодействия отслеживает, взаимодействовал ли пользователь с полями, и позволяет реализовать паттерны вроде «показывать ошибки только после того, как пользователь коснулся поля».

### Состояние touched {#touched-state}

Сигнал `touched()` отслеживает, сфокусировал ли пользователь поле и затем снял фокус, либо поле было помечено как touched программно. Только интерактивные поля могут стать touched; скрытые, отключённые и readonly-поля не становятся touched от взаимодействий пользователя или `markAsTouched()`.

Когда нужно действие на уровне секции, чтобы показать ошибки валидации внутри неё, вызовите `markAsTouched()` на поле секции. Значение `skipDescendants` по умолчанию — `false`, поэтому вызов помечает поле секции и каждое дочернее поле как touched.

Например, в checkout-потоке можно провалидировать секцию доставки перед переходом к следующему шагу:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, required} from '@angular/forms/signals';

@Component({
  selector: 'app-checkout-shipping',
  imports: [FormField],
  template: `
    <label>
      Name
      <input [formField]="checkoutForm.shipping.name" />
    </label>
    @if (checkoutForm.shipping.name().touched() && checkoutForm.shipping.name().invalid()) {
      <p>{{ checkoutForm.shipping.name().errors()[0].message }}</p>
    }

    <label>
      Address
      <input [formField]="checkoutForm.shipping.address" />
    </label>
    @if (checkoutForm.shipping.address().touched() && checkoutForm.shipping.address().invalid()) {
      <p>{{ checkoutForm.shipping.address().errors()[0].message }}</p>
    }

    <button type="button" (click)="continueToPayment()">Continue</button>

    @if (showPayment() && checkoutForm.shipping().valid()) {
      <p>Ready for payment.</p>
    }
  `,
})
export class CheckoutShipping {
  checkoutModel = signal({
    shipping: {
      name: '',
      address: '',
    },
  });

  showPayment = signal(false);

  checkoutForm = form(this.checkoutModel, (schemaPath) => {
    required(schemaPath.shipping.name, {message: 'Enter a name'});
    required(schemaPath.shipping.address, {message: 'Enter an address'});
  });

  continueToPayment() {
    this.checkoutForm.shipping().markAsTouched();

    if (this.checkoutForm.shipping().invalid()) {
      return;
    }

    this.showPayment.set(true);
  }
}
```

Когда `continueToPayment()` вызывает `markAsTouched()` на `checkoutForm.shipping()`, используется поведение по умолчанию `skipDescendants: false`. Angular помечает `shipping`, `shipping.name` и `shipping.address` как touched, поэтому сообщения об ошибках дочерних полей с `touched() && invalid()` становятся видимыми до отправки всей формы.

NOTE: Передавайте `{skipDescendants: true}` только когда поле, на котором вызывается метод, должно стать touched без изменения состояния touched у потомков.

### Состояние dirty {#dirty-state}

Формам часто нужно определять, действительно ли данные изменились — например, чтобы предупредить о несохранённых изменениях или включить кнопку сохранения только при необходимости. Сигнал `dirty()` отслеживает, изменял ли пользователь поле.

Сигнал `dirty()` становится `true`, когда пользователь изменяет значение интерактивного поля, и остаётся `true`, даже если значение вернули к начальному:

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

Используйте `dirty()` для предупреждений о несохранённых изменениях или чтобы включать кнопки сохранения только при изменении данных.

### Touched и dirty {#touched-vs-dirty}

Эти сигналы отслеживают разные виды состояния взаимодействия:

| Сигнал      | Когда становится true                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `touched()` | Пользователь сфокусировал и снял фокус с интерактивного поля, либо поле помечено как touched программно                         |
| `dirty()`   | Пользователь изменил интерактивное поле (даже если не снимал фокус, и даже если текущее значение совпадает с начальным)         |

Поле может находиться в разных комбинациях:

| Состояние                  | Сценарий                                                   |
| -------------------------- | ---------------------------------------------------------- |
| Touched, но не dirty       | Пользователь сфокусировал и снял фокус, но ничего не менял |
| И touched, и dirty         | Пользователь сфокусировал поле, изменил значение и снял фокус |

NOTE: Скрытые, отключённые и readonly-поля неинтерактивны — они не становятся touched или dirty от взаимодействий пользователя.

## Состояние доступности {#availability-state}

Сигналы состояния доступности управляют тем, интерактивно ли поле, редактируемо ли оно и видимо ли. Отключённые, скрытые и readonly-поля неинтерактивны. Они не влияют на то, валидна ли, touched или dirty родительская форма.

### Отключённые поля {#disabled-fields}

Сигнал `disabled()` указывает, принимает ли поле ввод пользователя. Отключённые поля видны в UI, но пользователи не могут с ними взаимодействовать.

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, disabled} from '@angular/forms/signals';

@Component({
  selector: 'app-order',
  imports: [FormField],
  // TIP: The `[formField]` directive automatically binds the `disabled` attribute based
  // on the field's `disabled()` state, so you don't need to manually add `[disabled]="field().disabled()"`
  template: `
    <input [formField]="orderForm.couponCode" />

    @if (orderForm.couponCode().disabled()) {
      <p class="info">Coupon code is only available for orders over $50</p>
    }
  `,
})
export class Order {
  orderModel = signal({
    total: 25,
    couponCode: '',
  });

  orderForm = form(this.orderModel, (schemaPath) => {
    disabled(schemaPath.couponCode, {when: ({valueOf}) => valueOf(schemaPath.total) < 50});
  });
}
```

В этом примере `valueOf(schemaPath.total)` проверяет значение поля `total`, чтобы определить, должно ли `couponCode` быть отключено.

NOTE: Параметр колбэка схемы (`schemaPath` в этих примерах) — объект `SchemaPathTree`, предоставляющий пути ко всем полям формы. Вы можете назвать этот параметр как угодно.

При определении правил вроде `disabled()`, `hidden()` или `readonly()` функция `when` получает объект `FieldContext`, который обычно деструктурируют (например, `({valueOf})`). Два метода, часто используемые в правилах валидации:

- `valueOf(schemaPath.otherField)` — прочитать значение другого поля формы
- `value()` — сигнал со значением поля, к которому применено правило

Отключённые поля не влияют на состояние валидации родительской формы. Даже если отключённое поле было бы невалидным, родительская форма всё равно может быть валидной. Состояние `disabled()` влияет на интерактивность и валидацию, но не меняет значение поля.

### Скрытые поля {#hidden-fields}

Сигнал `hidden()` указывает, скрыто ли поле условно. Используйте `hidden()` с `@if`, чтобы показывать или скрывать поля по условиям:

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
    hidden(schemaPath.publicUrl, {when: ({valueOf}) => !valueOf(schemaPath.isPublic)});
  });
}
```

Скрытые поля не участвуют в валидации. Если обязательное поле скрыто, оно не блокирует отправку формы. Состояние `hidden()` влияет на доступность и валидацию, но не меняет значение поля.

### Поля только для чтения {#readonly-fields}

Сигнал `readonly()` указывает, является ли поле только для чтения. Readonly-поля отображают значение, но пользователи не могут его редактировать:

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

NOTE: Директива `[formField]` автоматически привязывает атрибут `readonly` на основе состояния `readonly()` поля, поэтому вручную добавлять `[readonly]="field().readonly()"` не нужно.

Как и отключённые и скрытые поля, readonly-поля неинтерактивны и не влияют на состояние родительской формы. Состояние `readonly()` влияет на редактируемость и валидацию, но не меняет значение поля.

### Когда что использовать {#when-to-use-each}

| Состояние    | Когда использовать                                                      | Пользователь видит | Пользователь взаимодействует | Участвует в валидации |
| ------------ | ----------------------------------------------------------------------- | ------------------ | ---------------------------- | --------------------- |
| `disabled()` | Поле временно недоступно (например, на основе значений других полей)    | Да                 | Нет                          | Нет                   |
| `hidden()`   | Поле неактуально в текущем контексте                                    | Нет (с @if)        | Нет                          | Нет                   |
| `readonly()` | Значение должно быть видно, но не редактируемо                          | Да                 | Нет                          | Нет                   |

## Состояние на уровне формы {#form-level-state}

Корневая форма тоже является полем в дереве полей. Когда вы вызываете её как функцию, она также возвращает объект `FieldState`, агрегирующий состояние всех дочерних полей.

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

В этом примере форма валидна только когда валидны все дочерние поля. Это позволяет включать/отключать кнопки отправки на основе общей валидности формы.

### Сигналы на уровне формы {#form-level-signals}

Поскольку корневая форма — это поле, у неё те же сигналы (например, `valid()`, `invalid()`, `touched()`, `dirty()` и т.д.).

| Сигнал      | Поведение на уровне формы                                          |
| ----------- | ------------------------------------------------------------------ |
| `valid()`   | Все интерактивные поля валидны и нет ожидающих валидаторов         |
| `invalid()` | Хотя бы у одного интерактивного поля есть ошибки валидации         |
| `pending()` | Хотя бы у одного интерактивного поля есть ожидающая асинхронная валидация |
| `touched()` | Форма или хотя бы один интерактивный потомок — touched             |
| `dirty()`   | Пользователь изменил хотя бы одно интерактивное поле               |

### Когда использовать уровень формы и уровень поля {#when-to-use-form-level-vs-field-level}

**Используйте состояние на уровне формы для:**

- Включения/отключения кнопки отправки
- Состояния кнопки «Сохранить»
- Общих проверок валидности формы
- Предупреждений о несохранённых изменениях

**Используйте состояние на уровне поля для:**

- Сообщений об ошибках отдельных полей
- Стилизации конкретных полей
- Обратной связи по валидации для каждого поля
- Условной доступности полей

## Распространение состояния {#state-propagation}

Состояние поля распространяется от дочерних полей вверх через родительские группы полей к корневой форме.

### Как состояние дочерних полей влияет на родительские формы {#how-child-state-affects-parent-forms}

Когда дочернее поле становится невалидным, его родительская группа полей становится невалидной, и то же происходит с корневой формой. Когда дочернее поле становится touched или dirty, родительская группа и корневая форма отражают это изменение. Такая агрегация позволяет проверять валидность на любом уровне — поля или всей формы.

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

### Скрытые, отключённые и readonly-поля {#hidden-disabled-and-readonly-fields}

Скрытые, отключённые и readonly-поля неинтерактивны и не влияют на состояние родительской формы:

```ts
const orderModel = signal({
  customerName: '',
  requiresShipping: false,
  shippingAddress: '',
});

const orderForm = form(orderModel, (schemaPath) => {
  hidden(schemaPath.shippingAddress, {when: ({valueOf}) => !valueOf(schemaPath.requiresShipping)});
});
```

В этом примере, когда `shippingAddress` скрыто, оно не влияет на валидность формы. Поэтому даже если `shippingAddress` пустое и обязательное, форма может быть валидной.

Такое поведение не даёт скрытым, отключённым или readonly-полям блокировать отправку формы или влиять на состояние валидации, touched и dirty.

## Использование состояния в шаблонах {#using-state-in-templates}

Сигналы состояния полей органично интегрируются с шаблонами Angular, обеспечивая реактивный UX форм без ручной обработки событий.

### Условное отображение ошибок {#conditional-error-display}

Показывайте ошибки только после того, как пользователь взаимодействовал с полем:

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

Этот паттерн не даёт показывать ошибки до того, как пользователь успел взаимодействовать с полем. Ошибки появляются только после того, как пользователь сфокусировал поле и затем ушёл с него.

### Условная доступность полей {#conditional-field-availability}

Используйте сигнал `hidden()` с `@if`, чтобы условно показывать или скрывать поля:

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
    hidden(schemaPath.shippingAddress, {
      when: ({valueOf}) => !valueOf(schemaPath.requiresShipping),
    });
  });
}
```

Скрытые поля не участвуют в валидации, поэтому форму можно отправить, даже если скрытое поле иначе было бы невалидным.

### Отслеживание значений для полей-массивов {#tracking-values-for-array-fields}

В signal forms блок `@for` по набору полей следует отслеживать по идентичности поля.

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

Система форм уже отслеживает значения модели внутри массива и поддерживает стабильную идентичность автоматически создаваемых полей.

Когда элемент меняется, он может представлять новую логическую сущность, даже если часть свойств выглядит одинаково. Отслеживание по идентичности гарантирует, что фреймворк обрабатывает его как отдельный элемент, а не переиспользует существующие UI-элементы. Это предотвращает некорректное совместное использование stateful-элементов вроде form inputs и сохраняет привязки согласованными с нужной частью модели.

## Использование состояния поля в логике компонента {#using-field-state-in-component-logic}

Сигналы состояния полей работают с реактивными примитивами Angular вроде `computed()` и `effect()` для продвинутой логики форм.

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

Это гарантирует, что до API доходят только валидные, полностью проверенные данные.

### Производное состояние с computed {#derived-state-with-computed}

Создавайте computed-сигналы на основе состояния полей, чтобы они автоматически обновлялись при изменении базового состояния:

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

Хотя состояние поля обычно обновляется через взаимодействия пользователя (набор, фокус, blur), иногда нужно управлять им программно. Типичные сценарии — отправка формы и сброс форм.

#### Отправка формы {#form-submission}

Signal Forms предоставляет директиву `FormRoot`, упрощающую отправку формы. Она автоматически предотвращает поведение отправки браузера по умолчанию и устанавливает атрибут `novalidate` на элемент `<form>`.

```angular-ts
import {FormField, FormRoot} from '@angular/forms/signals';

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

При использовании `FormRoot` отправка формы автоматически вызывает функцию `submit()`, которая помечает все поля как touched (показывая ошибки валидации) и выполняет колбэк `action`, если форма валидна.

Форму можно отправить и вручную, без директивы, вызвав `submit(this.registrationForm)`. При явном вызове `submit` можно передать `FormSubmitOptions`, чтобы переопределить логику `submission` по умолчанию: `submit(this.registrationForm, {action: () => /* ... */ })`.

#### Сброс форм после отправки {#resetting-forms-after-submission}

После успешной отправки формы может понадобиться вернуть её в начальное состояние — очистив и историю взаимодействий пользователя, и значения полей. Метод `reset()` очищает флаги touched и dirty. Также можно передать в `reset()` необязательное значение, чтобы обновить данные модели:

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

Это гарантирует, что форма готова к новому вводу без устаревших сообщений об ошибках или индикаторов dirty-состояния.

## Стилизация на основе состояния валидации {#styling-based-on-validation-state}

Можно применять пользовательские стили к форме, привязывая CSS-классы на основе состояния валидации:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, email} from '@angular/forms/signals';

@Component({
  imports: [FormField],
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

Проверка и `touched()`, и состояния валидации гарантирует, что стили появляются только после взаимодействия пользователя с полем.

## Фокус на form control, привязанном к полю формы {#focus-a-form-control-bound-to-a-form-field}

Angular Signal Forms предоставляют метод `focusBoundControl()` на состоянии поля, который позволяет программно переместить [фокус](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus) на form control, связанный с данным полем формы.

Типичный сценарий — улучшение доступности при отправке формы: когда форма невалидна, показать сообщения об ошибках и автоматически переместить фокус на первое невалидное поле, направляя пользователя к исправлению.

### Базовое использование {#basic-usage}

Для формы регистрации:

```ts
@Component({
  /* ... */
})
export class Registration {
  registrationModel = signal({username: '', email: '', password: ''});
  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.username);
    email(schemaPath.email);
    required(schemaPath.password);
  });
}
```

Чтобы переместить фокус на контрол, привязанный к полю `email`:

```ts
registrationForm.email().focusBoundControl();
```

### Предотвращение прокрутки {#preventing-scroll}

Если целевой контрол вне области просмотра и нужно сфокусировать его без прокрутки, установите параметр [preventScroll](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#preventscroll) в `true` при вызове `focusBoundControl()`.

```ts
registrationForm.email().focusBoundControl({preventScroll: true});
```

### Фокус на первом невалидном поле при отправке {#focusing-the-first-invalid-field-on-submission}

Используйте `errorSummary()`, чтобы найти первое невалидное поле и сфокусировать его, когда пользователь отправляет форму с ошибками:

```ts
onSubmit() {
  const firstError = this.registrationForm().errorSummary()[0];
  if (firstError?.fieldTree) {
    firstError.fieldTree().focusBoundControl();
  } else {
    // proceed with submission
  }
}
```

### Пользовательские контролы {#custom-controls}

По умолчанию вызов `focusBoundControl()` на пользовательском контроле не имеет эффекта, потому что пользовательский контрол может содержать несколько нативных inputs. Например, date picker может содержать отдельные поля дня, месяца и года. Поэтому Angular не может определить, какой элемент должен получить фокус и какое действие выполнить.

Чтобы поддержать программный фокус в пользовательском контроле, реализуйте метод `focus()`. Когда `focusBoundControl()` вызывается на состоянии поля, связанном с пользовательским контролем, Angular вызывает метод `focus()` контрола, если он есть.

Рассмотрим пользовательский password input:

```html
<div class="password-block">
  <input type="password" #passwordCtrl [value]="value()" (input)="value.set($event.target.value)" />
</div>
```

```ts
@Component({
  /* ... */
})
export class PasswordInput implements FormValueControl<string> {
  readonly value = model<string>('');
  readonly passwordCtrl = viewChild.required<ElementRef<HTMLInputElement>>('passwordCtrl');

  // Called automatically when focusBoundControl() is invoked
  // on the field state associated with this custom control
  focus(): void {
    this.passwordCtrl().nativeElement.focus();
  }
}
```

## Следующие шаги {#next-steps}

В этом руководстве рассмотрены обработка статуса валидации и доступности, отслеживание взаимодействия и распространение состояния полей. Связанные руководства раскрывают другие аспекты Signal Forms:

<!-- TODO: UNCOMMENT WHEN THE GUIDES ARE AVAILABLE -->
<docs-pill-row>
  <docs-pill href="guide/forms/signals/models" title="Form models" />
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/custom-controls" title="Custom controls" />
  <!-- <docs-pill href="guide/forms/signals/arrays" title="Working with Arrays" /> -->
</docs-pill-row>
