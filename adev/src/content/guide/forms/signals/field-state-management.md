# Управление состоянием полей

Состояние полей в Signal Forms позволяет реагировать на действия пользователя, предоставляя реактивные сигналы для
статуса валидации (например, `valid`, `invalid`, `errors`), отслеживания взаимодействия (например, `touched`, `dirty`) и
доступности (например, `disabled`, `hidden`).

## Понимание состояния поля

При создании формы с помощью функции `form()` возвращается **дерево полей** (field tree) — структура объектов,
отражающая модель вашей формы. Доступ к каждому полю в дереве осуществляется через точечную нотацию (например,
`form.email`).

### Доступ к состоянию поля

При вызове любого поля в дереве полей как функции (например, `form.email()`) возвращается объект `FieldState`,
содержащий реактивные сигналы, которые отслеживают состояние валидации, взаимодействия и доступности поля. Например,
сигнал `invalid()` сообщает, есть ли у поля ошибки валидации:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, required, email } from '@angular/forms/signals'

@Component({
  selector: 'app-registration',
  imports: [Field],
  template: `
    <input type="email" [field]="registrationForm.email" />

    @if (registrationForm.email().invalid()) {
      <p class="error">Email has validation errors:</p>
      <ul>
        @for (error of registrationForm.email().errors(); track error) {
          <li>{{ error.message }}</li>
        }
      </ul>
    }
  `
})
export class Registration {
  registrationModel = signal({
    email: '',
    password: ''
  })

  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' })
    email(schemaPath.email, { message: 'Enter a valid email address' })
  })
}
```

В этом примере шаблон проверяет `registrationForm.email().invalid()`, чтобы определить, нужно ли отображать сообщение об
ошибке.

### Сигналы состояния поля

Наиболее часто используемый сигнал — это
`value()`, [доступный для записи сигнал](guide/forms/signals/models#updating-models), предоставляющий доступ к текущему
значению поля:

```ts
const emailValue = registrationForm.email().value()
console.log(emailValue) // Current email string
```

Помимо `value()`, состояние поля включает сигналы для валидации, отслеживания взаимодействия и контроля доступности:

| Категория                                | Сигнал       | Описание                                                                                               |
| ---------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| **[Валидация](#validation-state)**       | `valid()`    | Поле проходит все правила валидации и не имеет ожидающих (pending) валидаторов                         |
|                                          | `invalid()`  | Поле имеет ошибки валидации                                                                            |
|                                          | `errors()`   | Массив объектов ошибок валидации                                                                       |
|                                          | `pending()`  | Выполняется асинхронная валидация                                                                      |
| **[Взаимодействие](#interaction-state)** | `touched()`  | Пользователь сфокусировался и убрал фокус с поля (если оно интерактивно)                               |
|                                          | `dirty()`    | Пользователь изменил поле (если оно интерактивно), даже если значение совпадает с начальным состоянием |
| **[Доступность](#availability-state)**   | `disabled()` | Поле отключено и не влияет на состояние родительской формы                                             |
|                                          | `hidden()`   | Указывает, что поле должно быть скрыто; видимость в шаблоне контролируется с помощью `@if`             |
|                                          | `readonly()` | Поле доступно только для чтения и не влияет на состояние родительской формы                            |

Эти сигналы позволяют создавать отзывчивые пользовательские интерфейсы форм, реагирующие на поведение пользователя. В
разделах ниже каждая категория рассматривается подробно.

## Состояние валидации {#validation-state}

Сигналы состояния валидации сообщают, является ли поле валидным и какие ошибки оно содержит.

ПРИМЕЧАНИЕ: Это руководство посвящено **использованию** состояния валидации в шаблонах и логике (например, чтение
`valid()`, `invalid()`, `errors()` для отображения обратной связи). Информацию об **определении** правил валидации и
создании пользовательских валидаторов см. в руководстве по Валидации (скоро появится).

### Проверка валидности

Используйте `valid()` и `invalid()` для проверки статуса валидации:

```angular-ts
@Component({
  template: `
    <input type="email" [field]="loginForm.email" />

    @if (loginForm.email().invalid()) {
      <p class="error">Email is invalid</p>
    } @if (loginForm.email().valid()) {
      <p class="success">Email looks good</p>
    }
  `
})
export class Login {
  loginModel = signal({ email: '', password: '' })
  loginForm = form(this.loginModel)
}
```

| Сигнал      | Возвращает `true`, когда                                                       |
| ----------- | ------------------------------------------------------------------------------ |
| `valid()`   | Поле проходит все правила валидации и не имеет ожидающих (pending) валидаторов |
| `invalid()` | Поле имеет ошибки валидации                                                    |

При проверке валидности в коде используйте `invalid()` вместо `!valid()`, если хотите различать состояния «есть ошибки»
и «валидация выполняется» (pending). Причина в том, что и `valid()`, и `invalid()` могут быть одновременно `false`,
когда выполняется асинхронная валидация, так как поле еще не является валидным (валидация не завершена), но и не
является невалидным (ошибки еще не найдены).

### Чтение ошибок валидации

Получите доступ к массиву ошибок валидации с помощью `errors()`. Каждый объект ошибки содержит:

| Свойство  | Описание                                                                   |
| --------- | -------------------------------------------------------------------------- |
| `kind`    | Правило валидации, которое не сработало (например, "required" или "email") |
| `message` | Необязательное понятное человеку сообщение об ошибке                       |
| `field`   | Ссылка на `FieldTree`, где произошла ошибка                                |

ПРИМЕЧАНИЕ: Свойство `message` является необязательным. Валидаторы могут предоставлять пользовательские сообщения об
ошибках, но если они не указаны, вам может потребоваться сопоставить значения `kind` ошибок с вашими собственными
сообщениями.

Вот пример того, как отобразить ошибки в шаблоне:

```angular-ts
@Component({
  template: `
    <input type="email" [field]="loginForm.email" />

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

Этот подход перебирает все ошибки поля, отображая каждое сообщение пользователю.

### Ожидание валидации (Pending)

Сигнал `pending()` указывает, что выполняется асинхронная валидация:

```angular-ts
@Component({
  template: `
    <input type="email" [field]="signupForm.email" />

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

Состояние взаимодействия отслеживает, взаимодействовали ли пользователи с полями, позволяя реализовать паттерны вроде
«показывать ошибки только после того, как пользователь затронул поле».

### Состояние Touched (Затронуто)

Сигнал `touched()` отслеживает, сфокусировался ли пользователь на поле, а затем убрал фокус. Он становится `true`, когда
пользователь фокусируется и затем убирает фокус с поля посредством взаимодействия (не программно). Скрытые, отключенные
и доступные только для чтения поля не являются интерактивными и не становятся `touched` в результате действий
пользователя.

### Состояние Dirty (Изменено)

Формам часто нужно определять, изменились ли данные на самом деле — например, чтобы предупредить пользователей о
несохраненных изменениях или активировать кнопку сохранения только при необходимости. Сигнал `dirty()` отслеживает,
изменил ли пользователь поле.

Сигнал `dirty()` становится `true`, когда пользователь изменяет значение интерактивного поля, и остается `true`, даже
если значение изменено обратно на исходное:

```angular-ts
@Component({
  template: `
    <form>
      <input [field]="profileForm.name" />
      <input [field]="profileForm.bio" />

      @if (profileForm().dirty()) {
        <p class="warning">You have unsaved changes</p>
      }
    </form>
  `
})
export class Profile {
  profileModel = signal({ name: 'Alice', bio: 'Developer' })
  profileForm = form(this.profileModel)
}
```

Используйте `dirty()` для предупреждений о «несохраненных изменениях» или для активации кнопок сохранения только при
изменении данных.

### Touched vs Dirty

Эти сигналы отслеживают разные взаимодействия пользователя:

| Сигнал      | Когда становится true                                                                                                             |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `touched()` | Пользователь сфокусировался и убрал фокус с интерактивного поля (даже если ничего не изменил)                                     |
| `dirty()`   | Пользователь изменил интерактивное поле (даже если он никогда не убирал фокус, и даже если текущее значение совпадает с исходным) |

Поле может находиться в различных комбинациях состояний:

| Состояние                    | Сценарий                                                               |
| ---------------------------- | ---------------------------------------------------------------------- |
| Touched, но не dirty         | Пользователь сфокусировался и убрал фокус с поля, но не внес изменений |
| Одновременно touched и dirty | Пользователь сфокусировался на поле, изменил значение и убрал фокус    |

ПРИМЕЧАНИЕ: Скрытые, отключенные и доступные только для чтения поля не являются интерактивными — они не становятся
`touched` или `dirty` в результате действий пользователя.

## Состояние доступности {#availability-state}

Сигналы состояния доступности управляют тем, являются ли поля интерактивными, редактируемыми или видимыми. Отключенные,
скрытые и доступные только для чтения поля не являются интерактивными. Они не влияют на то, является ли их родительская
форма валидной, `touched` или `dirty`.

### Отключенные поля (Disabled)

Сигнал `disabled()` указывает, принимает ли поле пользовательский ввод. Отключенные поля отображаются в UI, но
пользователи не могут с ними взаимодействовать.

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, disabled } from '@angular/forms/signals'

@Component({
  selector: 'app-order',
  imports: [Field],
  template: `
    <!-- TIP: The `[field]` directive automatically binds the `disabled` attribute based on the field's `disabled()` state, so you don't need to manually add `[disabled]="field().disabled()"` -->
    <input [field]="orderForm.couponCode" />

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

В этом примере мы используем `valueOf(schemaPath.total)` для проверки значения поля `total`, чтобы определить, должен ли
быть отключен `couponCode`.

ПРИМЕЧАНИЕ: Параметр колбэка схемы (`schemaPath` в этих примерах) — это объект `SchemaPathTree`, который предоставляет
пути ко всем полям вашей формы. Вы можете назвать этот параметр как угодно.

При определении правил, таких как `disabled()`, `hidden()` или `readonly()`, колбэк логики получает объект
`FieldContext`, который обычно деструктурируется (например, `({valueOf})`). Два метода, часто используемых в правилах
валидации:

- `valueOf(schemaPath.otherField)` — Чтение значения другого поля в форме
- `value()` — Сигнал, содержащий значение поля, к которому применяется правило

Отключенные поля не влияют на состояние валидации родительской формы. Даже если отключенное поле было бы невалидным,
родительская форма все равно может быть валидной. Состояние `disabled()` влияет на интерактивность и валидацию, но не
изменяет значение поля.

### Скрытые поля (Hidden)

Сигнал `hidden()` указывает, скрыто ли поле условно. Используйте `hidden()` вместе с `@if` для отображения или скрытия
полей на основе условий:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, hidden } from '@angular/forms/signals'

@Component({
  selector: 'app-profile',
  imports: [Field],
  template: `
    <label>
      <input type="checkbox" [field]="profileForm.isPublic" />
      Make profile public
    </label>

    @if (!profileForm.publicUrl().hidden()) {
      <label>
        Public URL
        <input [field]="profileForm.publicUrl" />
      </label>
    }
  `
})
export class Profile {
  profileModel = signal({
    isPublic: false,
    publicUrl: ''
  })

  profileForm = form(this.profileModel, schemaPath => {
    hidden(schemaPath.publicUrl, ({valueOf}) => !valueOf(schemaPath.isPublic))
  })
}
```

Скрытые поля не участвуют в валидации. Если обязательное поле скрыто, это не помешает отправке формы. Состояние
`hidden()` влияет на доступность и валидацию, но не изменяет значение поля.

### Поля только для чтения (Readonly)

Сигнал `readonly()` указывает, доступно ли поле только для чтения. Поля `readonly` отображают свое значение, но
пользователи не могут их редактировать:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, readonly } from '@angular/forms/signals'

@Component({
  selector: 'app-account',
  imports: [Field],
  template: `
    <label>
      Username (cannot be changed)
      <input [field]="accountForm.username" />
    </label>

    <label>
      Email
      <input [field]="accountForm.email" />
    </label>
  `
})
export class Account {
  accountModel = signal({
    username: 'johndoe',
    email: 'john@example.com'
  })

  accountForm = form(this.accountModel, schemaPath => {
    readonly(schemaPath.username)
  })
}
```

ПРИМЕЧАНИЕ: Директива `[field]` автоматически привязывает атрибут `readonly` на основе состояния `readonly()` поля,
поэтому вам не нужно вручную добавлять `[readonly]="field().readonly()"`.

Как и отключенные или скрытые поля, поля только для чтения не являются интерактивными и не влияют на состояние
родительской формы. Состояние `readonly()` влияет на возможность редактирования и валидацию, но не изменяет значение
поля.

### Когда использовать каждое состояние

| Состояние    | Использовать, когда                                                  | Видит ли пользователь | Может ли взаимодействовать | Участвует в валидации |
| ------------ | -------------------------------------------------------------------- | --------------------- | -------------------------- | --------------------- |
| `disabled()` | Поле временно недоступно (например, на основе значений других полей) | Да                    | Нет                        | Нет                   |
| `hidden()`   | Поле не актуально в текущем контексте                                | Нет (с @if)           | Нет                        | Нет                   |
| `readonly()` | Значение должно быть видно, но не редактируемо                       | Да                    | Нет                        | Нет                   |

## Состояние уровня формы

Корневая форма также является полем в дереве полей. При вызове её как функции она также возвращает объект `FieldState`,
агрегирующий состояние всех дочерних полей.

### Доступ к состоянию формы

```angular-ts
@Component({
  template: `
    <form>
      <input [field]="loginForm.email" />
      <input [field]="loginForm.password" />

      <button [disabled]="!loginForm().valid()">Sign In</button>
    </form>
  `
})
export class Login {
  loginModel = signal({ email: '', password: '' })
  loginForm = form(this.loginModel)
}
```

В этом примере форма валидна только тогда, когда валидны все дочерние поля. Это позволяет включать/отключать кнопки
отправки на основе общей валидности формы.

### Сигналы уровня формы

Поскольку корневая форма является полем, она имеет те же сигналы (такие как `valid()`, `invalid()`, `touched()`,
`dirty()` и т.д.).

| Сигнал      | Поведение на уровне формы                                                     |
| ----------- | ----------------------------------------------------------------------------- |
| `valid()`   | Все интерактивные поля валидны и нет ожидающих (pending) валидаторов          |
| `invalid()` | По крайней мере одно интерактивное поле имеет ошибки валидации                |
| `pending()` | По крайней мере одно интерактивное поле имеет ожидающую асинхронную валидацию |
| `touched()` | Пользователь затронул (touched) по крайней мере одно интерактивное поле       |
| `dirty()`   | Пользователь изменил (dirty) по крайней мере одно интерактивное поле          |

### Когда использовать уровень формы против уровня поля

**Используйте состояние уровня формы для:**

- Состояния включения/отключения кнопки отправки
- Состояния кнопки "Сохранить"
- Проверки общей валидности формы
- Предупреждений о несохраненных изменениях

**Используйте состояние уровня поля для:**

- Сообщений об ошибках отдельных полей
- Стилизации конкретных полей
- Обратной связи валидации для каждого поля
- Условной доступности полей

## Распространение состояния

Состояние поля распространяется от дочерних полей вверх через группы родительских полей к корневой форме.

### Как состояние потомков влияет на родительские формы

Когда дочернее поле становится невалидным, его родительская группа полей становится невалидной, как и корневая форма.
Когда потомок становится `touched` или `dirty`, родительская группа полей и корневая форма отражают это изменение. Эта
агрегация позволяет проверять валидность на любом уровне — поля или всей формы.

```ts
const userModel = signal({
  profile: {
    firstName: '',
    lastName: ''
  },
  address: {
    street: '',
    city: ''
  }
})

const userForm = form(userModel)

// If firstName is invalid, profile is invalid
userForm.profile.firstName().invalid() === true
// → userForm.profile().invalid() === true
// → userForm().invalid() === true
```

### Скрытые, отключенные и доступные только для чтения поля

Скрытые, отключенные и доступные только для чтения поля не являются интерактивными и не влияют на состояние родительской
формы:

```ts
const orderModel = signal({
  customerName: '',
  requiresShipping: false,
  shippingAddress: ''
})

const orderForm = form(orderModel, schemaPath => {
  hidden(schemaPath.shippingAddress, ({valueOf}) => !valueOf(schemaPath.requiresShipping))
})
```

В этом примере, когда `shippingAddress` скрыт, он не влияет на валидность формы. В результате, даже если
`shippingAddress` пуст и обязателен, форма может быть валидной.

Такое поведение предотвращает блокировку отправки формы или влияние на состояние валидации, `touched` и `dirty` со
стороны скрытых, отключенных или доступных только для чтения полей.

## Использование состояния в шаблонах

Сигналы состояния полей бесшовно интегрируются с шаблонами Angular, обеспечивая реактивный пользовательский опыт форм
без ручной обработки событий.

### Условное отображение ошибок

Показывайте ошибки только после того, как пользователь провзаимодействовал с полем:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, email } from '@angular/forms/signals'

@Component({
  selector: 'app-signup',
  imports: [Field],
  template: `
    <label>
      Email
      <input type="email" [field]="signupForm.email" />
    </label>

    @if (signupForm.email().touched() && signupForm.email().invalid()) {
      <p class="error">{{ signupForm.email().errors()[0].message }}</p>
    }
  `
})
export class Signup {
  signupModel = signal({ email: '', password: '' })

  signupForm = form(this.signupModel, schemaPath => {
    email(schemaPath.email)
  })
}
```

Этот паттерн предотвращает отображение ошибок до того, как у пользователей появится возможность взаимодействовать с
полем. Ошибки появляются только после того, как пользователь сфокусировался и затем покинул поле.

### Условная доступность полей

Используйте сигнал `hidden()` с `@if` для условного отображения или скрытия полей:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, hidden } from '@angular/forms/signals'

@Component({
  selector: 'app-order',
  imports: [Field],
  template: `
    <label>
      <input type="checkbox" [field]="orderForm.requiresShipping" />
      Requires shipping
    </label>

    @if (!orderForm.shippingAddress().hidden()) {
      <label>
        Shipping Address
        <input [field]="orderForm.shippingAddress" />
      </label>
    }
  `
})
export class Order {
  orderModel = signal({
    requiresShipping: false,
    shippingAddress: ''
  })

  orderForm = form(this.orderModel, schemaPath => {
    hidden(schemaPath.shippingAddress, ({valueOf}) => !valueOf(schemaPath.requiresShipping))
  })
}
```

Скрытые поля не участвуют в валидации, позволяя отправить форму, даже если скрытое поле иначе было бы невалидным.

## Использование состояния поля в логике компонента

Сигналы состояния полей работают с реактивными примитивами Angular, такими как `computed()` и `effect()`, для реализации
сложной логики форм.

### Проверка валидации перед отправкой

Проверяйте валидность формы в методах компонента:

```ts
export class Registration {
  registrationModel = signal({
    username: '',
    email: '',
    password: ''
  })

  registrationForm = form(this.registrationModel)

  async onSubmit() {
    // Wait for any pending async validation
    if (this.registrationForm().pending()) {
      console.log('Waiting for validation...')
      return
    }

    // Guard against invalid submissions
    if (this.registrationForm().invalid()) {
      console.error('Form is invalid')
      return
    }

    const data = this.registrationModel()
    await this.api.register(data)
  }
}
```

Это гарантирует, что в ваш API попадут только валидные, полностью проверенные данные.

### Производное состояние с computed

Создавайте вычисляемые сигналы (computed signals) на основе состояния полей, чтобы они автоматически обновлялись при
изменении базового состояния поля:

```ts
export class Password {
  passwordModel = signal({ password: '', confirmPassword: '' })
  passwordForm = form(this.passwordModel)

  // Compute password strength indicator
  passwordStrength = computed(() => {
    const password = this.passwordForm.password().value()
    if (password.length < 8) return 'weak'
    if (password.length < 12) return 'medium'
    return 'strong'
  })

  // Check if all required fields are filled
  allFieldsFilled = computed(() => {
    return (
      this.passwordForm.password().value().length > 0 &&
      this.passwordForm.confirmPassword().value().length > 0
    )
  })
}
```

### Программное изменение состояния

Хотя состояние полей обычно обновляется через взаимодействие с пользователем (ввод текста, фокус, потеря фокуса), иногда
требуется управлять им программно. Распространенные сценарии включают отправку формы и сброс форм.

#### Отправка формы

Когда пользователь отправляет форму, используйте функцию `submit()` для обработки валидации и отображения ошибок:

```ts
import { Component, signal } from '@angular/core'
import { form, submit, required, email } from '@angular/forms/signals'

export class Registration {
  registrationModel = signal({ username: '', email: '', password: '' })

  registrationForm = form(this.registrationModel, schemaPath => {
    required(schemaPath.username)
    email(schemaPath.email)
    required(schemaPath.password)
  })

  onSubmit() {
    submit(this.registrationForm, () => {
      this.submitToServer()
    })
  }

  submitToServer() {
    // Send data to server
  }
}
```

Функция `submit()` автоматически помечает все поля как `touched` (раскрывая ошибки валидации) и выполняет ваш колбэк
только в том случае, если форма валидна.

#### Сброс форм после отправки

После успешной отправки формы вы можете захотеть вернуть её в исходное состояние — очистить историю взаимодействия
пользователя и значения полей. Метод `reset()` очищает флаги `touched` и `dirty`, но не изменяет значения полей, поэтому
вам нужно обновить модель отдельно:

```ts
export class Contact {
  contactModel = signal({ name: '', email: '', message: '' })
  contactForm = form(this.contactModel)

  async onSubmit() {
    if (!this.contactForm().valid()) return

    await this.api.sendMessage(this.contactModel())

    // Clear interaction state (touched, dirty)
    this.contactForm().reset()

    // Clear values
    this.contactModel.set({ name: '', email: '', message: '' })
  }
}
```

Этот двухэтапный сброс гарантирует, что форма готова к новому вводу без отображения устаревших сообщений об ошибках или
индикаторов измененного состояния.

## Стилизация на основе состояния валидации

Вы можете применять пользовательские стили к форме, привязывая CSS-классы на основе состояния валидации:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, email } from '@angular/forms/signals'

@Component({
  template: `
    <input
      type="email"
      [field]="form.email"
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
  `
})
export class StyleExample {
  model = signal({ email: '' })

  form = form(this.model, schemaPath => {
    email(schemaPath.email)
  })
}
```

Проверка как `touched()`, так и состояния валидации гарантирует, что стили появятся только после того, как пользователь
провзаимодействовал с полем.

## Следующие шаги

Вот другие связанные руководства по Signal Forms:

- [Руководство по моделям форм](guide/forms/signals/models) — Создание моделей и обновление значений
- Руководство по валидации — Определение правил валидации и пользовательских валидаторов (скоро появится)
