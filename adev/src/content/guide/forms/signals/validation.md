# Валидация

Формам нужна валидация, чтобы гарантировать, что пользователи предоставляют корректные и полные данные перед отправкой.
Без валидации вам пришлось бы обрабатывать проблемы с качеством данных на сервере, предоставлять плохой пользовательский
опыт с неясными сообщениями об ошибках и вручную проверять каждое ограничение.

Signal Forms предоставляет подход к валидации, основанный на схемах. Правила валидации привязываются к полям с помощью
функции схемы, запускаются автоматически при изменении значений и предоставляют ошибки через Сигналы состояния поля. Это
обеспечивает реактивную валидацию, которая обновляется по мере взаимодействия пользователей с формой.

<docs-code-multifile preview hideCode path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.css"/>
</docs-code-multifile>

## Основы валидации

Валидация в Signal Forms определяется через функцию схемы, передаваемую вторым аргументом в `form()`.

### Функция схемы

Функция схемы получает объект `SchemaPathTree`, который позволяет определять правила валидации:

<docs-code
  header="app.ts"
  path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.ts"
  visibleLines="[21,22,23,24,25,26,27]"
  highlight="[23,24,26]"
/>

Функция схемы запускается один раз во время инициализации формы. Правила валидации привязываются к полям с
использованием параметра пути схемы (например, `schemaPath.email`, `schemaPath.password`), и валидация запускается
автоматически при каждом изменении значений полей.

ПРИМЕЧАНИЕ: Параметр колбэка схемы (`schemaPath` в этих примерах) представляет собой объект `SchemaPathTree`, который
предоставляет пути ко всем полям вашей формы. Вы можете назвать этот параметр как угодно.

### Как работает валидация

Валидация в Signal Forms следует этому паттерну:

1. **Определение правил валидации в схеме** — Привязка правил валидации к полям в функции схемы.
2. **Автоматическое выполнение** — Правила валидации запускаются при изменении значений полей.
3. **Распространение ошибок** — Ошибки валидации становятся доступны через Сигналы состояния поля.
4. **Реактивные обновления** — UI автоматически обновляется при изменении состояния валидации.

Валидация запускается при каждом изменении значения для интерактивных полей. Скрытые и отключенные (disabled) поля не
проходят валидацию — их правила пропускаются до тех пор, пока поле снова не станет интерактивным.

### Порядок выполнения валидации

Правила валидации выполняются в следующем порядке:

1. **Синхронная валидация** — Все синхронные правила валидации запускаются при изменении значения.
2. **Асинхронная валидация** — Асинхронные правила валидации запускаются только после успешного прохождения всех
   синхронных правил.
3. **Обновление состояния поля** — Сигналы `valid()`, `invalid()`, `errors()` и `pending()` обновляются.

Синхронные правила валидации (такие как `required()`, `email()`) выполняются немедленно. Асинхронные правила (такие как
`validateHttp()`) могут занимать время и устанавливать Сигнал `pending()` в `true` во время выполнения.

Все правила валидации запускаются при каждом изменении — валидация не прерывается после первой ошибки. Если поле имеет
правила `required()` и `email()`, запускаются оба, и оба могут одновременно выдавать ошибки.

## Встроенные правила валидации

Signal Forms предоставляет правила валидации для распространенных сценариев. Все встроенные правила принимают объект
опций для настройки сообщений об ошибках и условной логики.

### required()

Правило валидации `required()` гарантирует, что поле имеет значение:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, required } from '@angular/forms/signals'

@Component({
  selector: 'app-registration',
  imports: [Field],
  template: `
    <form>
      <label>
        Username
        <input [field]="registrationForm.username" />
      </label>

      <label>
        Email
        <input type="email" [field]="registrationForm.email" />
      </label>

      <button type="submit">Register</button>
    </form>
  `
})
export class RegistrationComponent {
  registrationModel = signal({
    username: '',
    email: ''
  })

  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.username, { message: 'Username is required' })
    required(schemaPath.email, { message: 'Email is required' })
  })
}
```

Поле считается "пустым", когда:

| Условие                  | Пример  |
| ------------------------ | ------- |
| Значение равно `null`    | `null`, |
| Значение — пустая строка | `''`    |
| Значение — пустой массив | `[]`    |

Для условных требований используйте опцию `when`:

```ts
registrationForm = form(this.registrationModel, (schemaPath) => {
  required(schemaPath.promoCode, {
    message: 'Promo code is required for discounts',
    when: ({valueOf}) => valueOf(schemaPath.applyDiscount)
  })
})
```

Правило валидации запускается только тогда, когда функция `when` возвращает `true`.

### email()

Правило валидации `email()` проверяет корректность формата электронной почты:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, email } from '@angular/forms/signals'

@Component({
  selector: 'app-contact',
  imports: [Field],
  template: `
    <form>
      <label>
        Your Email
        <input type="email" [field]="contactForm.email" />
      </label>
    </form>
  `
})
export class ContactComponent {
  contactModel = signal({ email: '' })

  contactForm = form(this.contactModel, (schemaPath) => {
    email(schemaPath.email, { message: 'Please enter a valid email address' })
  })
}
```

Правило `email()` использует стандартное регулярное выражение для формата email. Оно принимает адреса вида
`user@example.com`, но отклоняет некорректные адреса, такие как `user@` или `@example.com`.

### min() и max()

Правила валидации `min()` и `max()` работают с числовыми значениями:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, min, max } from '@angular/forms/signals'

@Component({
  selector: 'app-age-form',
  imports: [Field],
  template: `
    <form>
      <label>
        Age
        <input type="number" [field]="ageForm.age" />
      </label>

      <label>
        Rating (1-5)
        <input type="number" [field]="ageForm.rating" />
      </label>
    </form>
  `
})
export class AgeFormComponent {
  ageModel = signal({
    age: 0,
    rating: 0
  })

  ageForm = form(this.ageModel, (schemaPath) => {
    min(schemaPath.age, 18, { message: 'You must be at least 18 years old' })
    max(schemaPath.age, 120, { message: 'Please enter a valid age' })

    min(schemaPath.rating, 1, { message: 'Rating must be at least 1' })
    max(schemaPath.rating, 5, { message: 'Rating cannot exceed 5' })
  })
}
```

Вы можете использовать вычисляемые значения для динамических ограничений:

```ts
ageForm = form(this.ageModel, (schemaPath) => {
  min(schemaPath.participants, () => this.minimumRequired(), {
    message: 'Not enough participants'
  })
})
```

### minLength() и maxLength()

Правила валидации `minLength()` и `maxLength()` работают со строками и массивами:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, minLength, maxLength } from '@angular/forms/signals'

@Component({
  selector: 'app-password-form',
  imports: [Field],
  template: `
    <form>
      <label>
        Password
        <input type="password" [field]="passwordForm.password" />
      </label>

      <label>
        Bio
        <textarea [field]="passwordForm.bio"></textarea>
      </label>
    </form>
  `
})
export class PasswordFormComponent {
  passwordModel = signal({
    password: '',
    bio: ''
  })

  passwordForm = form(this.passwordModel, (schemaPath) => {
    minLength(schemaPath.password, 8, { message: 'Password must be at least 8 characters' })
    maxLength(schemaPath.password, 100, { message: 'Password is too long' })

    maxLength(schemaPath.bio, 500, { message: 'Bio cannot exceed 500 characters' })
  })
}
```

Для строк "length" означает количество символов. Для массивов "length" означает количество элементов.

### pattern()

Правило валидации `pattern()` выполняет проверку по регулярному выражению:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, pattern } from '@angular/forms/signals'

@Component({
  selector: 'app-phone-form',
  imports: [Field],
  template: `
    <form>
      <label>
        Phone Number
        <input [field]="phoneForm.phone" placeholder="555-123-4567" />
      </label>

      <label>
        Postal Code
        <input [field]="phoneForm.postalCode" placeholder="12345" />
      </label>
    </form>
  `
})
export class PhoneFormComponent {
  phoneModel = signal({
    phone: '',
    postalCode: ''
  })

  phoneForm = form(this.phoneModel, (schemaPath) => {
    pattern(schemaPath.phone, /^\d{3}-\d{3}-\d{4}$/, {
      message: 'Phone must be in format: 555-123-4567'
    })

    pattern(schemaPath.postalCode, /^\d{5}$/, {
      message: 'Postal code must be 5 digits'
    })
  })
}
```

Распространенные шаблоны:

| Тип шаблона           | Регулярное выражение    | Пример       |
| --------------------- | ----------------------- | ------------ |
| Телефон               | `/^\d{3}-\d{3}-\d{4}$/` | 555-123-4567 |
| Почтовый индекс (США) | `/^\d{5}$/`             | 12345        |
| Буквенно-цифровой     | `/^[a-zA-Z0-9]+$/`      | abc123       |
| Безопасный для URL    | `/^[a-zA-Z0-9_-]+$/`    | my-url_123   |

## Ошибки валидации

Когда правила валидации не выполняются, они создают объекты ошибок, описывающие проблему. Понимание структуры ошибок
помогает предоставлять пользователям понятную обратную связь.

<!-- TODO: Uncomment when field state management guide is published

NOTE: This section covers the errors that validation rules produce. For displaying and using validation errors in your UI, see the [Field State Management guide](guide/forms/signals/field-state-management). -->

### Структура ошибки

Каждый объект ошибки валидации содержит следующие свойства:

| Свойство  | Описание                                                                             |
| --------- | ------------------------------------------------------------------------------------ |
| `kind`    | Правило валидации, которое не сработало (например, "required", "email", "minLength") |
| `message` | Опциональное понятное человеку сообщение об ошибке                                   |

Встроенные правила валидации автоматически устанавливают свойство `kind`. Свойство `message` является необязательным —
вы можете предоставлять пользовательские сообщения через опции правил валидации.

### Пользовательские сообщения об ошибках

Все встроенные правила валидации принимают опцию `message` для пользовательского текста ошибки:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, required, minLength } from '@angular/forms/signals'

@Component({
  selector: 'app-signup',
  imports: [Field],
  template: `
    <form>
      <label>
        Username
        <input [field]="signupForm.username" />
      </label>

      <label>
        Password
        <input type="password" [field]="signupForm.password" />
      </label>
    </form>
  `
})
export class SignupComponent {
  signupModel = signal({
    username: '',
    password: ''
  })

  signupForm = form(this.signupModel, (schemaPath) => {
    required(schemaPath.username, {
      message: 'Please choose a username'
    })

    required(schemaPath.password, {
      message: 'Password cannot be empty'
    })
    minLength(schemaPath.password, 12, {
      message: 'Password must be at least 12 characters for security'
    })
  })
}
```

Пользовательские сообщения должны быть четкими, конкретными и подсказывать пользователям, как исправить проблему.
Вместо "Неверный ввод" используйте "Пароль должен содержать не менее 12 символов для безопасности".

### Несколько ошибок на одно поле

Когда поле имеет несколько правил валидации, каждое правило выполняется независимо и может создать ошибку:

```ts
signupForm = form(this.signupModel, (schemaPath) => {
  required(schemaPath.email, { message: 'Email is required' })
  email(schemaPath.email, { message: 'Enter a valid email address' })
  minLength(schemaPath.email, 5, { message: 'Email is too short' })
})
```

Если поле email пустое, появляется только ошибка `required()`. Если пользователь вводит "a@b", появляются ошибки как от
`email()`, так и от `minLength()`. Все правила валидации выполняются — валидация не останавливается после первой
неудачи.

СОВЕТ: Используйте паттерн `touched() && invalid()` в шаблонах, чтобы предотвратить появление ошибок до того, как
пользователи начнут взаимодействовать с полем. Подробное руководство по отображению ошибок валидации см. в
руководстве [Управление состоянием поля](guide/forms/signals/field-state-management#conditional-error-display).

## Пользовательские правила валидации

Хотя встроенные правила валидации обрабатывают распространенные случаи, вам часто может потребоваться пользовательская
логика валидации для бизнес-правил, сложных форматов или ограничений, специфичных для предметной области.

### Использование validate()

Функция `validate()` создает пользовательские правила валидации. Она принимает функцию-валидатор, которая получает
доступ к контексту поля и возвращает:

| Возвращаемое значение  | Значение           |
| ---------------------- | ------------------ |
| Объект ошибки          | Значение невалидно |
| `null` или `undefined` | Значение валидно   |

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, validate } from '@angular/forms/signals'

@Component({
  selector: 'app-url-form',
  imports: [Field],
  template: `
    <form>
      <label>
        Website URL
        <input [field]="urlForm.website" />
      </label>
    </form>
  `
})
export class UrlFormComponent {
  urlModel = signal({ website: '' })

  urlForm = form(this.urlModel, (schemaPath) => {
    validate(schemaPath.website, ({value}) => {
      if (!value().startsWith('https://')) {
        return {
          kind: 'https',
          message: 'URL must start with https://'
        }
      }

      return null
    })
  })
}
```

Функция-валидатор получает объект `FieldContext`, содержащий:

| Свойство        | Тип        | Описание                                   |
| --------------- | ---------- | ------------------------------------------ |
| `value`         | Signal     | Сигнал, содержащий текущее значение поля   |
| `state`         | FieldState | Ссылка на состояние поля                   |
| `field`         | FieldTree  | Ссылка на дерево полей                     |
| `valueOf()`     | Method     | Получить значение другого поля по пути     |
| `stateOf()`     | Method     | Получить состояние другого поля по пути    |
| `fieldTreeOf()` | Method     | Получить дерево полей другого поля по пути |
| `pathKeys`      | Signal     | Ключи пути от корня до текущего поля       |

ПРИМЕЧАНИЕ: Дочерние поля также имеют Сигнал `key`, а поля элементов массива имеют Сигналы `key` и `index`.

Возвращайте объект ошибки со свойствами `kind` и `message`, когда валидация не проходит. Возвращайте `null` или
`undefined`, когда валидация проходит успешно.

### Переиспользуемые правила валидации

Создавайте переиспользуемые функции правил валидации, оборачивая `validate()`:

```ts
function url(field: any, options?: { message?: string }) {
  validate(field, ({value}) => {
    try {
      new URL(value())
      return null
    } catch {
      return {
        kind: 'url',
        message: options?.message || 'Enter a valid URL'
      }
    }
  })
}

function phoneNumber(field: any, options?: { message?: string }) {
  validate(field, ({value}) => {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/

    if (!phoneRegex.test(value())) {
      return {
        kind: 'phoneNumber',
        message: options?.message || 'Phone must be in format: 555-123-4567'
      }
    }

    return null
  })
}
```

Вы можете использовать пользовательские правила валидации так же, как и встроенные:

```ts
urlForm = form(this.urlModel, (schemaPath) => {
  url(schemaPath.website, { message: 'Please enter a valid website URL' })
  phoneNumber(schemaPath.phone)
})
```

## Валидация между полями

Валидация между полями сравнивает или связывает значения нескольких полей.

Распространенный сценарий для такой валидации — подтверждение пароля:

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field, required, minLength, validate } from '@angular/forms/signals'

@Component({
  selector: 'app-password-change',
  imports: [Field],
  template: `
    <form>
      <label>
        New Password
        <input type="password" [field]="passwordForm.password" />
      </label>

      <label>
        Confirm Password
        <input type="password" [field]="passwordForm.confirmPassword" />
      </label>

      <button type="submit">Change Password</button>
    </form>
  `
})
export class PasswordChangeComponent {
  passwordModel = signal({
    password: '',
    confirmPassword: ''
  })

  passwordForm = form(this.passwordModel, (schemaPath) => {
    required(schemaPath.password, { message: 'Password is required' })
    minLength(schemaPath.password, 8, { message: 'Password must be at least 8 characters' })

    required(schemaPath.confirmPassword, { message: 'Please confirm your password' })

    validate(schemaPath.confirmPassword, ({value, valueOf}) => {
      const confirmPassword = value()
      const password = valueOf(schemaPath.password)

      if (confirmPassword !== password) {
        return {
          kind: 'passwordMismatch',
          message: 'Passwords do not match'
        }
      }

      return null
    })
  })
}
```

Правило валидации подтверждения получает доступ к значению поля пароля с помощью `valueOf(schemaPath.password)` и
сравнивает его со значением подтверждения. Это правило валидации выполняется реактивно — если изменяется любой из
паролей, валидация перезапускается автоматически.

## Асинхронная валидация

Асинхронная валидация обрабатывает проверки, требующие внешних источников данных, например, проверку доступности имени
пользователя на сервере или валидацию через API.

### Использование validateHttp()

Функция `validateHttp()` выполняет валидацию на основе HTTP:

```angular-ts
import { Component, signal, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { form, Field, required, validateHttp } from '@angular/forms/signals'

@Component({
  selector: 'app-username-form',
  imports: [Field],
  template: `
    <form>
      <label>
        Username
        <input [field]="usernameForm.username" />

        @if (usernameForm.username().pending()) {
          <span class="checking">Checking availability...</span>
        }
      </label>
    </form>
  `
})
export class UsernameFormComponent {
  http = inject(HttpClient)

  usernameModel = signal({ username: '' })

  usernameForm = form(this.usernameModel, (schemaPath) => {
    required(schemaPath.username, { message: 'Username is required' })

    validateHttp(schemaPath.username, {
      request: ({value}) => `/api/check-username?username=${value()}`,
      onSuccess: (response: any) => {
        if (response.taken) {
          return {
            kind: 'usernameTaken',
            message: 'Username is already taken'
          }
        }
        return null
      },
      onError: (error) => ({
        kind: 'networkError',
        message: 'Could not verify username availability'
      })
    })
  })
}
```

Правило валидации `validateHttp()`:

1. Вызывает URL или запрос, возвращаемый функцией `request`.
2. Преобразует успешный ответ в ошибку валидации или `null` с помощью `onSuccess`.
3. Обрабатывает сбои запроса (сетевые ошибки, ошибки HTTP) с помощью `onError`.
4. Устанавливает `pending()` в `true`, пока запрос выполняется.
5. Запускается только после успешного прохождения всех синхронных правил валидации.

### Состояние ожидания (Pending)

Пока выполняется асинхронная валидация, Сигнал поля `pending()` возвращает `true`. Используйте это для отображения
индикаторов загрузки:

```ts
@if (form.username().pending()) {
  <span class="spinner">Checking...</span>
}
```

Сигнал `valid()` возвращает `false`, пока валидация находится в ожидании, даже если ошибок еще нет. Сигнал `invalid()`
возвращает `true` только при наличии ошибок.

## Следующие шаги

В этом руководстве рассматривалось создание и применение правил валидации. Связанные руководства раскрывают другие
аспекты Signal Forms:

- [Руководство по моделям форм](guide/forms/signals/models) — Создание и обновление моделей форм.
  <!-- TODO: Uncomment when Field State Management guide is published -->
  <!-- - [Руководство по управлению состоянием поля](guide/forms/signals/field-state-management) — Использование состояния валидации в шаблонах и отображение ошибок -->
