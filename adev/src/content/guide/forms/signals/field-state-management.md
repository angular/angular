# Управление состоянием полей {#field-state-management}

Состояние полей Signal Forms позволяет реагировать на действия пользователей, предоставляя реактивные сигналы для статуса валидации (такие как `valid`, `invalid`, `errors`), отслеживания взаимодействия (такие как `touched`, `dirty`) и доступности (такие как `disabled`, `hidden`).

## Понимание состояния поля {#understanding-field-state}

Когда вы создаёте форму с помощью функции [`form()`](api/forms/signals/form), она возвращает **дерево полей** — объектную структуру, отражающую модель формы. Каждое поле в дереве доступно через точечную нотацию (например, [`form.email`](api/forms/signals/form#email)).

### Доступ к состоянию поля {#accessing-field-state}

Когда вы вызываете любое поле в дереве полей как функцию (например, [`form.email()`](api/forms/signals/form#email)), оно возвращает объект `FieldState`, содержащий реактивные сигналы, отслеживающие статус валидации, взаимодействия и доступности поля. Например, сигнал `invalid()` сообщает, есть ли у поля ошибки валидации:

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

Наиболее часто используемый сигнал — `value()`, `WritableSignal`, обеспечивающий доступ к текущему значению поля:

```ts
const emailValue = registrationForm.email().value();
console.log(emailValue); // Current email string
```

Помимо `value()`, состояние поля включает сигналы для валидации, отслеживания взаимодействия и управления доступностью:

| Категория                                        | Сигнал       | Описание                                                                          |
| ------------------------------------------------ | ------------ | --------------------------------------------------------------------------------- |
| **[Валидация](#validation-state)**               | `valid()`    | Поле проходит все правила валидации и не имеет ожидающих валидаторов              |
|                                                  | `invalid()`  | Поле имеет ошибки валидации                                                       |
|                                                  | `errors()`   | Массив объектов ошибок валидации                                                  |
|                                                  | `pending()`  | Выполняется асинхронная валидация                                                 |
| **[Взаимодействие](#interaction-state)**         | `touched()`  | Пользователь сфокусировался и снял фокус с поля (если интерактивное)              |
|                                                  | `dirty()`    | Пользователь изменил поле (если интерактивное), даже если значение совпадает с начальным |
| **[Доступность](#availability-state)**           | `disabled()` | Поле отключено и не влияет на состояние родительской формы                        |
|                                                  | `hidden()`   | Указывает, что поле должно быть скрыто; видимость в шаблоне управляется с помощью `@if` |
|                                                  | `readonly()` | Поле только для чтения и не влияет на состояние родительской формы                |

Эти сигналы позволяют создавать отзывчивые формы, реагирующие на поведение пользователя. В следующих разделах подробно рассматривается каждая категория.

## Состояние валидации {#validation-state}

Сигналы состояния валидации сообщают, действительно ли поле и какие ошибки оно содержит.

NOTE: Это руководство посвящено **использованию** состояния валидации в шаблонах и логике (например, чтение `valid()`, `invalid()`, `errors()` для отображения обратной связи). Сведения об **определении** правил валидации и создании пользовательских валидаторов см. в [руководстве по валидации](guide/forms/signals/validation).

### Проверка действительности {#checking-validity}

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

| Сигнал      | Возвращает `true`, когда                                               |
| ----------- | ---------------------------------------------------------------------- |
| `valid()`   | Поле проходит все правила валидации и не имеет ожидающих валидаторов   |
| `invalid()` | Поле имеет ошибки валидации                                            |

При проверке действительности в коде используйте `invalid()` вместо `!valid()`, если хотите различить «есть ошибки» и «валидация ожидается». Это связано с тем, что `valid()` и `invalid()` могут одновременно быть `false`, когда асинхронная валидация ожидается — поле ещё не действительно, так как валидация не завершена, и одновременно не недействительно, так как ошибки ещё не найдены.

### Чтение ошибок валидации {#reading-validation-errors}

Получайте доступ к массиву ошибок валидации с помощью `errors()`. Каждый объект ошибки содержит:

| Свойство    | Описание                                                           |
| ----------- | ------------------------------------------------------------------ |
| `kind`      | Правило валидации, которое не прошло (например, "required" или "email") |
| `message`   | Необязательное человекочитаемое сообщение об ошибке               |
| `fieldTree` | Ссылка на `FieldTree`, где произошла ошибка                        |

NOTE: Свойство `message` необязательно. Валидаторы могут предоставлять пользовательские сообщения об ошибках, но если они не указаны, вам может потребоваться сопоставить значения `kind` ошибок с собственными сообщениями.

Вот пример отображения ошибок в шаблоне:

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

Этот подход перебирает все ошибки для поля, отображая каждое сообщение об ошибке пользователю.

### Ожидание валидации {#pending-validation}

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

Этот сигнал позволяет показывать состояния загрузки во время выполнения асинхронной валидации.

## Состояние взаимодействия {#interaction-state}

Состояние взаимодействия отслеживает, взаимодействовали ли пользователи с полями, обеспечивая паттерны вроде «показывать ошибки только после того, как пользователь коснулся поля».

### Состояние touched {#touched-state}

Сигнал `touched()` отслеживает, сфокусировался ли пользователь и снял ли фокус с поля. Он становится `true`, когда пользователь фокусируется и затем снимает фокус с поля через взаимодействие с UI (не программно). Скрытые, отключённые и поля только для чтения не являются интерактивными и не становятся touched от взаимодействий пользователя.

### Состояние dirty {#dirty-state}

Формам часто нужно обнаружить, действительно ли изменились данные — например, чтобы предупредить пользователей о несохранённых изменениях или включить кнопку сохранения только при необходимости. Сигнал `dirty()` отслеживает, изменил ли пользователь поле.

Сигнал `dirty()` становится `true`, когда пользователь изменяет значение интерактивного поля, и остаётся `true`, даже если значение было изменено обратно на начальное:

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

Используйте `dirty()` для предупреждений о «несохранённых изменениях» или для включения кнопок сохранения только при изменении данных.

### Touched vs dirty {#touched-vs-dirty}

Эти сигналы отслеживают разные взаимодействия пользователя:

| Сигнал      | Когда становится true                                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `touched()` | Пользователь сфокусировался и снял фокус с интерактивного поля (даже если ничего не изменил)                                       |
| `dirty()`   | Пользователь изменил интерактивное поле (даже если никогда не снимал фокус, и даже если текущее значение совпадает с начальным)   |

Поле может находиться в разных комбинациях состояний:

| Состояние                    | Сценарий                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------- |
| Touched, но не dirty         | Пользователь сфокусировался и снял фокус с поля, но не внёс изменений           |
| Одновременно touched и dirty | Пользователь сфокусировался на поле, изменил значение и снял фокус               |

NOTE: Скрытые, отключённые и поля только для чтения не являются интерактивными — они не становятся touched или dirty от взаимодействий пользователя.

## Состояние доступности {#availability-state}

Сигналы состояния доступности управляют тем, являются ли поля интерактивными, редактируемыми или видимыми. Отключённые, скрытые и поля только для чтения не являются интерактивными. Они не влияют на то, является ли родительская форма действительной, touched или dirty.

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

В этом примере мы используем `valueOf(schemaPath.total)` для проверки значения поля `total`, чтобы определить, должен ли `couponCode` быть отключён.

NOTE: Параметр обратного вызова схемы (`schemaPath` в этих примерах) — это объект `SchemaPathTree`, предоставляющий пути ко всем полям вашей формы. Вы можете называть этот параметр как угодно.

При определении правил вроде `disabled()`, `hidden()` или `readonly()` обратный вызов логики получает объект `FieldContext`, который обычно деструктурируется (например, `({valueOf})`). Два метода, часто используемые в правилах валидации:

- `valueOf(schemaPath.otherField)` — прочитать значение другого поля в форме
- `value()` — сигнал, содержащий значение поля, к которому применяется правило

Отключённые поля не участвуют в состоянии валидации родительской формы. Даже если отключённое поле было бы недействительным, родительская форма всё равно может быть действительной. Состояние `disabled()` влияет на интерактивность и валидацию, но не изменяет значение поля.

### Скрытые поля {#hidden-fields}

Сигнал `hidden()` указывает, является ли поле условно скрытым. Используйте `hidden()` с `@if` для показа или скрытия полей в зависимости от условий:

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

Скрытые поля не участвуют в валидации. Если обязательное поле скрыто, оно не помешает отправке формы. Состояние `hidden()` влияет на доступность и валидацию, но не изменяет значение поля.

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

### Когда использовать каждое из них {#when-to-use-each}

| Состояние    | Используйте когда                                                           | Пользователь видит | Пользователь может взаимодействовать | Участвует в валидации |
| ------------ | --------------------------------------------------------------------------- | ------------------ | ------------------------------------- | --------------------- |
| `disabled()` | Поле временно недоступно (например, на основе значений других полей)        | Да                 | Нет                                   | Нет                   |
| `hidden()`   | Поле не актуально в текущем контексте                                       | Нет (с @if)        | Нет                                   | Нет                   |
| `readonly()` | Значение должно быть видимым, но не редактируемым                           | Да                 | Нет                                   | Нет                   |

## Состояние на уровне формы {#form-level-state}

Корневая форма также является полем в дереве полей. При вызове её как функции она также возвращает объект `FieldState`, агрегирующий состояние всех дочерних полей.

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

В этом примере форма действительна только когда все дочерние поля действительны. Это позволяет включать/отключать кнопки отправки на основе общей действительности формы.

### Сигналы на уровне формы {#form-level-signals}

Поскольку корневая форма является полем, она имеет те же сигналы (такие как `valid()`, `invalid()`, `touched()`, `dirty()` и др.).

| Сигнал      | Поведение на уровне формы                                               |
| ----------- | ----------------------------------------------------------------------- |
| `valid()`   | Все интерактивные поля действительны и нет ожидающих валидаторов        |
| `invalid()` | По крайней мере одно интерактивное поле имеет ошибки валидации          |
| `pending()` | По крайней мере одно интерактивное поле имеет ожидающую асинхронную валидацию |
| `touched()` | Пользователь коснулся хотя бы одного интерактивного поля                |
| `dirty()`   | Пользователь изменил хотя бы одно интерактивное поле                    |

### Когда использовать состояние на уровне формы и на уровне поля {#when-to-use-form-level-vs-field-level}

**Используйте состояние на уровне формы для:**

- Состояния включения/отключения кнопки отправки
- Состояния кнопки «Сохранить»
- Общих проверок действительности формы
- Предупреждений о несохранённых изменениях

**Используйте состояние на уровне поля для:**

- Сообщений об ошибках отдельных полей
- Стилизации, специфичной для поля
- Обратной связи по валидации для каждого поля
- Условной доступности полей

## Распространение состояния {#state-propagation}

Состояние поля распространяется от дочерних полей вверх через родительские группы полей до корневой формы.

### Как состояние дочернего поля влияет на родительские формы {#how-child-state-affects-parent-forms}

Когда дочернее поле становится недействительным, его родительская группа полей также становится недействительной, как и корневая форма. Когда дочернее поле становится touched или dirty, родительская группа полей и корневая форма отражают это изменение. Такая агрегация позволяет проверять действительность на любом уровне — поля или всей формы.

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

В этом примере, когда `shippingAddress` скрыт, он не влияет на действительность формы. В результате, даже если `shippingAddress` пуст и обязателен, форма может быть действительной.

Такое поведение предотвращает блокировку отправки формы скрытыми, отключёнными или полями только для чтения или влияние на состояния валидации, touched и dirty.

## Использование состояния в шаблонах {#using-state-in-templates}

Сигналы состояния полей легко интегрируются с шаблонами Angular, обеспечивая реактивные формы без ручной обработки событий.

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

Этот паттерн предотвращает показ ошибок до того, как пользователь имел возможность взаимодействовать с полем. Ошибки появляются только после того, как пользователь сфокусировался и затем покинул поле.

### Условная доступность поля {#conditional-field-availability}

Используйте сигнал `hidden()` с `@if` для условного показа или скрытия полей:

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

Скрытые поля не участвуют в валидации, позволяя отправлять форму даже если скрытое поле было бы иначе недействительным.

### Отслеживание значений для полей массива {#tracking-values-for-array-fields}

В signal forms блок `@for` по набору полей должен отслеживаться по идентичности поля.

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

Система форм уже отслеживает значения модели внутри массива и автоматически поддерживает стабильную идентичность создаваемых полей.

Когда элемент изменяется, он может представлять новую логическую сущность, даже если некоторые его свойства выглядят одинаково. Отслеживание по идентичности гарантирует, что фреймворк обрабатывает его как отдельный элемент, а не переиспользует существующие элементы UI. Это предотвращает неправильное совместное использование состоятельных элементов, таких как поля ввода, и сохраняет правильную привязку к соответствующей части модели.

## Использование состояния поля в логике компонента {#using-field-state-in-component-logic}

Сигналы состояния полей работают с реактивными примитивами Angular, такими как `computed()` и `effect()`, для продвинутой логики форм.

### Проверки валидации перед отправкой {#validation-checks-before-submission}

Проверяйте действительность формы в методах компонента:

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

Это гарантирует, что в ваш API попадают только действительные, полностью проверенные данные.

### Производное состояние с computed {#derived-state-with-computed}

Создавайте вычисляемые сигналы на основе состояния поля для автоматического обновления при изменении базового состояния поля:

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

Хотя состояние поля обычно обновляется через взаимодействия пользователя (ввод, фокусировка, снятие фокуса), иногда нужно управлять им программно. Типичные сценарии включают отправку формы и её сброс.

#### Отправка формы {#form-submission}

Signal Forms предоставляет директиву `FormRoot`, которая упрощает отправку формы. Она автоматически предотвращает стандартное поведение браузера при отправке формы и устанавливает атрибут `novalidate` на элемент `<form>`.

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

Вы также можете отправить форму вручную без использования директивы, вызвав `submit(this.registrationForm)`. При явном вызове функции `submit` таким образом можно передать `FormSubmitOptions` для переопределения логики `submission` по умолчанию: `submit(this.registrationForm, {action: () => /* ... */ })`.

#### Сброс форм после отправки {#resetting-forms-after-submission}

После успешной отправки формы может потребоваться вернуть её в начальное состояние — очистив как историю взаимодействий пользователя, так и значения полей. Метод `reset()` очищает флаги touched и dirty. Вы также можете передать необязательное значение в `reset()` для обновления данных модели:

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

Это гарантирует, что форма готова к новому вводу без отображения устаревших сообщений об ошибках или индикаторов состояния dirty.

## Стилизация на основе состояния валидации {#styling-based-on-validation-state}

Вы можете применять пользовательские стили к форме, привязывая CSS-классы на основе состояния валидации:

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

## Дальнейшие шаги {#next-steps}

В этом руководстве рассмотрено управление статусом валидации и доступности, отслеживание взаимодействия и распространение состояния полей. Связанные руководства охватывают другие аспекты Signal Forms:

<!-- TODO: UNCOMMENT WHEN THE GUIDES ARE AVAILABLE -->
<docs-pill-row>
  <docs-pill href="guide/forms/signals/models" title="Модели форм" />
  <docs-pill href="guide/forms/signals/validation" title="Валидация" />
  <docs-pill href="guide/forms/signals/custom-controls" title="Пользовательские элементы управления" />
  <!-- <docs-pill href="guide/forms/signals/arrays" title="Working with Arrays" /> -->
</docs-pill-row>
