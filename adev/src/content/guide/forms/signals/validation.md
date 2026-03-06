# Валидация {#validation}

Формы нуждаются в валидации, чтобы пользователи предоставляли правильные и полные данные перед отправкой. Без валидации пришлось бы решать проблемы качества данных на сервере, обеспечивать плохой пользовательский опыт с непонятными сообщениями об ошибках и вручную проверять каждое ограничение.

Signal Forms предоставляет подход к валидации на основе схемы. Правила валидации привязываются к полям с помощью функции-схемы, автоматически выполняются при изменении значений и предоставляют ошибки через сигналы состояния поля. Это обеспечивает реактивную валидацию, обновляющуюся по мере взаимодействия пользователей с формой.

<docs-code-multifile preview hideCode path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.css"/>
</docs-code-multifile>

## Основы валидации {#validation-basics}

Валидация в Signal Forms определяется через функцию-схему, передаваемую как второй аргумент в `form()`.

### Функция-схема {#the-schema-function}

Функция-схема получает объект `SchemaPathTree`, позволяющий определять правила валидации:

<docs-code
  header="app.ts"
  path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.ts"
  visibleLines="[21,22,23,24,25,26,27]"
  highlight="[23,24,26]"
/>

Функция-схема выполняется один раз при инициализации формы. Правила валидации привязываются к полям с помощью параметра пути схемы (например, `schemaPath.email`, `schemaPath.password`), а валидация автоматически запускается при изменении значений полей.

NOTE: Параметр обратного вызова схемы (`schemaPath` в этих примерах) — объект `SchemaPathTree`, предоставляющий пути ко всем полям формы. Этот параметр можно называть как угодно.

### Как работает валидация {#how-validation-works}

Валидация в Signal Forms следует этому паттерну:

1. **Определение правил валидации в схеме** — Привязка правил валидации к полям в функции-схеме
2. **Автоматическое выполнение** — Правила валидации запускаются при изменении значений полей
3. **Распространение ошибок** — Ошибки валидации предоставляются через сигналы состояния поля
4. **Реактивные обновления** — UI автоматически обновляется при изменении состояния валидации

Валидация запускается при каждом изменении значения для интерактивных полей. Скрытые и отключённые поля не проходят валидацию — их правила пропускаются до тех пор, пока поле снова не станет интерактивным.

### Время выполнения валидации {#validation-timing}

Правила валидации выполняются в следующем порядке:

1. **Синхронная валидация** — Все синхронные правила запускаются при изменении значения
2. **Асинхронная валидация** — Асинхронные правила запускаются только после прохождения всех синхронных правил
3. **Обновление состояния поля** — Сигналы `valid()`, `invalid()`, `errors()` и `pending()` обновляются

Синхронные правила валидации (например, `required()`, `email()`) завершаются немедленно. Асинхронные правила (например, `validateHttp()`) могут занять время и устанавливают сигнал `pending()` в `true` во время выполнения.

Все правила валидации выполняются при каждом изменении — валидация не прерывается после первой ошибки. Если поле имеет правила `required()` и `email()`, оба выполняются, и оба могут одновременно производить ошибки.

## Встроенные правила валидации {#built-in-validation-rules}

Signal Forms предоставляет правила валидации для распространённых сценариев. Все встроенные правила принимают объект параметров для пользовательских сообщений об ошибках и условной логики.

### required() {#required}

Правило валидации `required()` обеспечивает наличие значения в поле:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, required} from '@angular/forms/signals';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        Username
        <input [formField]="registrationForm.username" />
      </label>

      <label>
        Email
        <input type="email" [formField]="registrationForm.email" />
      </label>

      <button type="submit">Register</button>
    </form>
  `,
})
export class RegistrationComponent {
  registrationModel = signal({
    username: '',
    email: '',
  });

  registrationForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.username, {message: 'Username is required'});
    required(schemaPath.email, {message: 'Email is required'});
  });
}
```

Поле считается «пустым», когда:

| Условие                    | Пример  |
| -------------------------- | ------- |
| Значение равно `null`      | `null`, |
| Значение — пустая строка   | `''`    |

Для условных требований используйте опцию `when`:

```ts
registrationForm = form(this.registrationModel, (schemaPath) => {
  required(schemaPath.promoCode, {
    message: 'Promo code is required for discounts',
    when: ({valueOf}) => valueOf(schemaPath.applyDiscount),
  });
});
```

Правило валидации выполняется только тогда, когда функция `when` возвращает `true`.

NOTE: `required` вернёт `true` для пустого массива. Используйте [`minLength()`](#minlength-and-maxlength) для валидации массивов.

### email() {#email}

Правило валидации `email()` проверяет корректность формата адреса электронной почты:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, email} from '@angular/forms/signals';

@Component({
  selector: 'app-contact',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        Your Email
        <input type="email" [formField]="contactForm.email" />
      </label>
    </form>
  `,
})
export class ContactComponent {
  contactModel = signal({email: ''});

  contactForm = form(this.contactModel, (schemaPath) => {
    email(schemaPath.email, {message: 'Please enter a valid email address'});
  });
}
```

Правило `email()` использует стандартное регулярное выражение формата email. Оно принимает адреса вида `user@example.com`, но отклоняет некорректные адреса вроде `user@` или `@example.com`.

### min() и max() {#min-and-max}

Правила `min()` и `max()` работают с числовыми значениями:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, min, max} from '@angular/forms/signals';

@Component({
  selector: 'app-age-form',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        Age
        <input type="number" [formField]="ageForm.age" />
      </label>

      <label>
        Rating (1-5)
        <input type="number" [formField]="ageForm.rating" />
      </label>
    </form>
  `,
})
export class AgeFormComponent {
  ageModel = signal({
    age: 0,
    rating: 0,
  });

  ageForm = form(this.ageModel, (schemaPath) => {
    min(schemaPath.age, 18, {message: 'You must be at least 18 years old'});
    max(schemaPath.age, 120, {message: 'Please enter a valid age'});

    min(schemaPath.rating, 1, {message: 'Rating must be at least 1'});
    max(schemaPath.rating, 5, {message: 'Rating cannot exceed 5'});
  });
}
```

Для динамических ограничений можно использовать вычисляемые значения:

```ts
ageForm = form(this.ageModel, (schemaPath) => {
  min(schemaPath.participants, () => this.minimumRequired(), {
    message: 'Not enough participants',
  });
});
```

### minLength() и maxLength() {#minlength-and-maxlength}

Правила `minLength()` и `maxLength()` работают со строками и массивами:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, minLength, maxLength} from '@angular/forms/signals';

@Component({
  selector: 'app-password-form',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        Password
        <input type="password" [formField]="passwordForm.password" />
      </label>

      <label>
        Bio
        <textarea [formField]="passwordForm.bio"></textarea>
      </label>
    </form>
  `,
})
export class PasswordFormComponent {
  passwordModel = signal({
    password: '',
    bio: '',
  });

  passwordForm = form(this.passwordModel, (schemaPath) => {
    minLength(schemaPath.password, 8, {message: 'Password must be at least 8 characters'});
    maxLength(schemaPath.password, 100, {message: 'Password is too long'});

    maxLength(schemaPath.bio, 500, {message: 'Bio cannot exceed 500 characters'});
  });
}
```

Для строк «длина» означает количество символов. Для массивов — количество элементов.

### pattern() {#pattern}

Правило `pattern()` выполняет валидацию по регулярному выражению:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, pattern} from '@angular/forms/signals';

@Component({
  selector: 'app-phone-form',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        Phone Number
        <input [formField]="phoneForm.phone" placeholder="555-123-4567" />
      </label>

      <label>
        Postal Code
        <input [formField]="phoneForm.postalCode" placeholder="12345" />
      </label>
    </form>
  `,
})
export class PhoneFormComponent {
  phoneModel = signal({
    phone: '',
    postalCode: '',
  });

  phoneForm = form(this.phoneModel, (schemaPath) => {
    pattern(schemaPath.phone, /^\d{3}-\d{3}-\d{4}$/, {
      message: 'Phone must be in format: 555-123-4567',
    });

    pattern(schemaPath.postalCode, /^\d{5}$/, {
      message: 'Postal code must be 5 digits',
    });
  });
}
```

Распространённые паттерны:

| Тип паттерна        | Регулярное выражение    | Пример       |
| ------------------- | ----------------------- | ------------ |
| Телефон             | `/^\d{3}-\d{3}-\d{4}$/` | 555-123-4567 |
| Почтовый код (US)   | `/^\d{5}$/`             | 12345        |
| Буквенно-цифровой   | `/^[a-zA-Z0-9]+$/`      | abc123       |
| URL-безопасный      | `/^[a-zA-Z0-9_-]+$/`    | my-url_123   |

## Валидация элементов массива {#validation-of-array-items}

Формы могут включать массивы вложенных объектов (например, список позиций заказа). Для применения правил валидации к каждому элементу массива используйте `applyEach()` внутри функции-схемы. `applyEach()` перебирает путь массива и предоставляет путь к каждому элементу, где можно применять валидаторы так же, как к полям верхнего уровня.

```ts
import {Component, signal} from '@angular/core';
import {applyEach, FormField, form, min, required, SchemaPathTree} from '@angular/forms/signals';

type Item = {name: string; quantity: number};

interface Order {
  title: string;
  description: string;
  items: Item[];
}

function ItemSchema(item: SchemaPathTree<Item>) {
  required(item.name, {message: 'Item name is required'});
  min(item.quantity, 1, {message: 'Quantity must be at least 1'});
}

@Component(/* ... */)
export class OrderComponent {
  orderModel = signal<Order>({
    title: '',
    description: '',
    items: [{name: '', quantity: 0}],
  });

  orderForm = form(this.orderModel, (schemaPath) => {
    required(schemaPath.title);
    required(schemaPath.description);

    applyEach(schemaPath.items, ItemSchema);
  });
}
```

## Ошибки валидации {#validation-errors}

Когда правила валидации не выполняются, они создают объекты ошибок, описывающие, что пошло не так. Понимание структуры ошибок помогает обеспечивать пользователям чёткую обратную связь.

<!-- TODO: Uncomment when field state management guide is published

NOTE: This section covers the errors that validation rules produce. For displaying and using validation errors in your UI, see the [Field State Management guide](guide/forms/signals/field-state-management). -->

### Структура ошибки {#error-structure}

Каждый объект ошибки валидации содержит следующие свойства:

| Свойство  | Описание                                                                              |
| --------- | ------------------------------------------------------------------------------------- |
| `kind`    | Правило валидации, которое не прошло (например, "required", "email", "minLength")    |
| `message` | Необязательное читаемое сообщение об ошибке                                           |

Встроенные правила валидации автоматически задают свойство `kind`. Свойство `message` необязательно — пользовательские сообщения можно задавать через параметры правила валидации.

### Пользовательские сообщения об ошибках {#custom-error-messages}

Все встроенные правила принимают параметр `message` для пользовательского текста ошибки:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, required, minLength} from '@angular/forms/signals';

@Component({
  selector: 'app-signup',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        Username
        <input [formField]="signupForm.username" />
      </label>

      <label>
        Password
        <input type="password" [formField]="signupForm.password" />
      </label>
    </form>
  `,
})
export class SignupComponent {
  signupModel = signal({
    username: '',
    password: '',
  });

  signupForm = form(this.signupModel, (schemaPath) => {
    required(schemaPath.username, {
      message: 'Please choose a username',
    });

    required(schemaPath.password, {
      message: 'Password cannot be empty',
    });
    minLength(schemaPath.password, 12, {
      message: 'Password must be at least 12 characters for security',
    });
  });
}
```

Пользовательские сообщения должны быть чёткими, конкретными и объяснять пользователю, как исправить проблему. Вместо «Invalid input» используйте «Password must be at least 12 characters for security».

### Несколько ошибок для одного поля {#multiple-errors-per-field}

Если поле имеет несколько правил валидации, каждое выполняется независимо и может производить ошибку:

```ts
signupForm = form(this.signupModel, (schemaPath) => {
  required(schemaPath.email, {message: 'Email is required'});
  email(schemaPath.email, {message: 'Enter a valid email address'});
  minLength(schemaPath.email, 5, {message: 'Email is too short'});
});
```

Если поле email пустое, появляется только ошибка `required()`. Если пользователь вводит "a@b", появляются обе ошибки `email()` и `minLength()`. Все правила выполняются — валидация не останавливается после первого сбоя.

TIP: Используйте паттерн `touched() && invalid()` в шаблонах, чтобы ошибки не появлялись до того, как пользователь взаимодействует с полем. Подробное руководство по отображению ошибок валидации см. в [руководстве по управлению состоянием поля](guide/forms/signals/field-state-management#conditional-error-display).

## Пользовательские правила валидации {#custom-validation-rules}

Встроенные правила валидации охватывают распространённые случаи, но часто требуется пользовательская логика для бизнес-правил, сложных форматов или специфических ограничений предметной области.

### Использование validate() {#using-validate}

Функция `validate()` создаёт пользовательские правила валидации. Она принимает функцию-валидатор, получающую контекст поля и возвращающую:

| Возвращаемое значение  | Смысл              |
| ---------------------- | ------------------ |
| Объект ошибки          | Значение недействительно |
| `null` или `undefined` | Значение действительно   |

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, validate} from '@angular/forms/signals';

@Component({
  selector: 'app-url-form',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        Website URL
        <input [formField]="urlForm.website" />
      </label>
    </form>
  `,
})
export class UrlFormComponent {
  urlModel = signal({website: ''});

  urlForm = form(this.urlModel, (schemaPath) => {
    validate(schemaPath.website, ({value}) => {
      if (!value().startsWith('https://')) {
        return {
          kind: 'https',
          message: 'URL must start with https://',
        };
      }

      return null;
    });
  });
}
```

Функция-валидатор получает объект `FieldContext` со следующими свойствами:

| Свойство        | Тип        | Описание                                                      |
| --------------- | ---------- | ------------------------------------------------------------- |
| `value`         | Signal     | Сигнал, содержащий текущее значение поля                     |
| `state`         | FieldState | Ссылка на состояние поля                                     |
| `field`         | FieldTree  | Ссылка на дерево полей                                       |
| `valueOf()`     | Method     | Получить значение другого поля по пути                       |
| `stateOf()`     | Method     | Получить состояние другого поля по пути                      |
| `fieldTreeOf()` | Method     | Получить дерево полей другого поля по пути                   |
| `pathKeys`      | Signal     | Ключи пути от корня до текущего поля                         |

NOTE: Дочерние поля также имеют сигнал `key`, а поля элементов массива имеют сигналы `key` и `index`.

Возвращайте объект ошибки с `kind` и `message` при неудачной валидации. Возвращайте `null` или `undefined` при успешной.

### Использование validateTree() {#using-validatetree}

Функция `validateTree()` создаёт пользовательские правила валидации, которые могут нацеливаться на несколько полей или предоставлять сложную логику для всего поддерева.

```angular-ts
import {Component, model} from '@angular/core';
import {form, FormField, validateTree} from '@angular/forms/signals';

interface User {
  firstName: string;
  lastName: string;
}

@Component({
  /* ... */
})
export class UserFormComponent {
  readonly userModel = model<DTO>({
    firstName: '',
    lastName: '',
  });

  userForm = form(this.userModel, (path) => {
    validateTree(path, (ctx) => {
      if (ctx.valueOf(path.firstName).length < 5) {
        return {
          kind: 'minLength5',
          message: 'First name must be at least 5 characters',
          fieldTree: ctx.fieldTree.lastName,
        };
      }

      return null;
    });
  });
}
```

Функция-валидатор `validateTree()` получает тот же объект `FieldContext`, что и `validate()`.

### Переиспользуемые правила валидации {#reusable-validation-rules}

Создавайте переиспользуемые функции правил, оборачивая `validate()`:

```ts
function url(path: SchemaPath<string>, options?: {message?: string}) {
  validate(path, ({value}) => {
    try {
      new URL(value());
      return null;
    } catch {
      return {
        kind: 'url',
        message: options?.message || 'Enter a valid URL',
      };
    }
  });
}

function phoneNumber(path: SchemaPath<string>, options?: {message?: string}) {
  validate(path, ({value}) => {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

    if (!phoneRegex.test(value())) {
      return {
        kind: 'phoneNumber',
        message: options?.message || 'Phone must be in format: 555-123-4567',
      };
    }

    return null;
  });
}
```

Пользовательские правила можно использовать так же, как встроенные:

```ts
urlForm = form(this.urlModel, (schemaPath) => {
  url(schemaPath.website, {message: 'Please enter a valid website URL'});
  phoneNumber(schemaPath.phone);
});
```

## Перекрёстная валидация {#cross-field-validation}

Перекрёстная валидация сравнивает или связывает значения нескольких полей.

Типичный сценарий — подтверждение пароля:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, required, minLength, validate} from '@angular/forms/signals';

@Component({
  selector: 'app-password-change',
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        New Password
        <input type="password" [formField]="passwordForm.password" />
      </label>

      <label>
        Confirm Password
        <input type="password" [formField]="passwordForm.confirmPassword" />
      </label>

      <button type="submit">Change Password</button>
    </form>
  `,
})
export class PasswordChangeComponent {
  passwordModel = signal({
    password: '',
    confirmPassword: '',
  });

  passwordForm = form(this.passwordModel, (schemaPath) => {
    required(schemaPath.password, {message: 'Password is required'});
    minLength(schemaPath.password, 8, {message: 'Password must be at least 8 characters'});

    required(schemaPath.confirmPassword, {message: 'Please confirm your password'});

    validate(schemaPath.confirmPassword, ({value, valueOf}) => {
      const confirmPassword = value();
      const password = valueOf(schemaPath.password);

      if (confirmPassword !== password) {
        return {
          kind: 'passwordMismatch',
          message: 'Passwords do not match',
        };
      }

      return null;
    });
  });
}
```

Правило валидации подтверждения обращается к значению поля пароля с помощью `valueOf(schemaPath.password)` и сравнивает его со значением подтверждения. Это правило выполняется реактивно — при изменении любого пароля валидация запускается автоматически.

## Асинхронная валидация {#async-validation}

Асинхронная валидация обрабатывает случаи, требующие внешних источников данных, например проверку доступности имени пользователя на сервере или валидацию через API.

### Использование validateHttp() {#using-validatehttp}

Функция `validateHttp()` выполняет валидацию на основе HTTP:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, required, validateHttp} from '@angular/forms/signals';

@Component({
  selector: 'app-username-form',|
  imports: [FormField],
  template: `
    <form novalidate>
      <label>
        Username
        <input [formField]="usernameForm.username" />

        @if (usernameForm.username().pending()) {
          <span class="checking">Checking availability...</span>
        }
      </label>
    </form>
  `,
})
export class UsernameFormComponent {
  usernameModel = signal({username: ''});

  usernameForm = form(this.usernameModel, (schemaPath) => {
    required(schemaPath.username, {message: 'Username is required'});

    validateHttp(schemaPath.username, {
      request: ({value}) => `/api/check-username?username=${value()}`,
      onSuccess: (response: any) => {
        if (response.taken) {
          return {
            kind: 'usernameTaken',
            message: 'Username is already taken',
          };
        }
        return null;
      },
      onError: (error) => ({
        kind: 'networkError',
        message: 'Could not verify username availability',
      }),
    });
  });
}
```

Правило `validateHttp()`:

1. Вызывает URL или запрос, возвращённый функцией `request`
2. Сопоставляет успешный ответ с ошибкой валидации или `null` с помощью `onSuccess`
3. Обрабатывает сбои запроса (сетевые ошибки, HTTP-ошибки) с помощью `onError`
4. Устанавливает `pending()` в `true` во время выполнения запроса
5. Запускается только после прохождения всех синхронных правил

### Состояние ожидания {#pending-state}

Во время выполнения асинхронной валидации сигнал `pending()` поля возвращает `true`. Используйте это для отображения индикаторов загрузки:

```angular-html
@if (form.username().pending()) {
  <span class="spinner">Checking...</span>
}
```

Сигнал `valid()` возвращает `false` во время ожидания, даже если ошибок ещё нет. Сигнал `invalid()` возвращает `true` только при наличии ошибок.

## Интеграция с библиотеками схемной валидации {#integration-with-schema-validation-libraries}

Signal Forms имеет встроенную поддержку библиотек, соответствующих [Standard Schema](https://standardschema.dev/), таких как [Zod](https://zod.dev/) или [Valibot](https://valibot.dev/). Интеграция предоставляется через функцию `validateStandardSchema`. Это позволяет использовать существующие схемы, сохраняя преимущества реактивной валидации Signal Forms.

```ts
import {form, validateStandardSchema} from '@angular/forms/signals';
import * as z from 'zod';

// Define your schema
const userSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

// Use with Signal Forms
const userForm = form(signal({email: '', password: ''}), (schemaPath) => {
  validateStandardSchema(schemaPath, userSchema);
});
```

## Следующие шаги {#next-steps}

В этом руководстве рассмотрено создание и применение правил валидации. Связанные руководства охватывают другие аспекты Signal Forms:

<!-- TODO: UNCOMMENT WHEN THE GUIDES ARE AVAILABLE -->
<docs-pill-row>
  <docs-pill href="guide/forms/signals/field-state-management" title="Управление состоянием поля" />
  <docs-pill href="guide/forms/signals/models" title="Модели форм" />
  <docs-pill href="guide/forms/signals/custom-controls" title="Пользовательские элементы управления" />
  <!-- <docs-pill href="guide/forms/signals/arrays" title="Working with Arrays" /> -->
</docs-pill-row>
