# Валидация

Формам нужна валидация, чтобы пользователи предоставляли корректные и полные данные перед отправкой. Без валидации пришлось бы обрабатывать проблемы качества данных на сервере, давать плохой UX с неясными сообщениями об ошибках и вручную проверять каждое ограничение.

Signal Forms предлагает подход к валидации на основе схем. Правила валидации привязываются к полям через функцию схемы, выполняются автоматически при изменении значений и открывают ошибки через сигналы состояния полей. Это обеспечивает реактивную валидацию, которая обновляется по мере взаимодействия пользователя с формой.

<docs-code-multifile preview hideCode path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.css"/>
</docs-code-multifile>

## Основы валидации {#validation-basics}

Валидация в Signal Forms определяется через функцию схемы, передаваемую вторым аргументом в `form()`.

### Функция схемы {#the-schema-function}

Функция схемы получает объект `SchemaPathTree`, который позволяет определить правила валидации:

<docs-code
  header="app.ts"
  path="adev/src/content/examples/signal-forms/src/login-validation-complete/app/app.ts"
  visibleLines="[29,30,31,32,33,34]"
  highlight="[30,31,33]"
/>

Функция схемы выполняется один раз при инициализации формы. Правила валидации привязываются к полям через параметр пути схемы (например, `schemaPath.email`, `schemaPath.password`), и валидация запускается автоматически при каждом изменении значений полей.

NOTE: Параметр колбэка схемы (`schemaPath` в этих примерах) — это объект `SchemaPathTree`, который предоставляет пути ко всем полям формы. Вы можете назвать этот параметр как угодно.

### Как работает валидация {#how-validation-works}

Валидация в Signal Forms следует такому паттерну:

1. **Определение правил валидации в схеме** — привязка правил к полям в функции схемы
2. **Автоматическое выполнение** — правила валидации запускаются при изменении значений полей
3. **Распространение ошибок** — ошибки валидации открываются через сигналы состояния полей
4. **Реактивные обновления** — UI автоматически обновляется при изменении состояния валидации

Валидация выполняется при каждом изменении значения для интерактивных полей. Скрытые и отключённые поля не проходят валидацию — их правила пропускаются, пока поле снова не станет интерактивным.

### Тайминг валидации {#validation-timing}

Правила валидации выполняются в таком порядке:

1. **Синхронная валидация** — все синхронные правила запускаются при изменении значения
2. **Асинхронная валидация** — асинхронные правила запускаются только после прохождения всех синхронных
3. **Обновление состояния поля** — обновляются сигналы `valid()`, `invalid()`, `errors()` и `pending()`

Синхронные правила (например, `required()`, `email()`) завершаются сразу. Асинхронные правила (например, `validateHttp()`) могут занимать время и устанавливают сигнал `pending()` в `true` на время выполнения.

Все правила валидации выполняются при каждом изменении — валидация не прерывается после первой ошибки. Если у поля есть и `required()`, и `email()`, оба правила выполняются и оба могут одновременно породить ошибки.

## Встроенные правила валидации {#built-in-validation-rules}

Signal Forms предоставляет правила для типичных сценариев валидации. Все встроенные правила принимают объект options для пользовательских сообщений об ошибках и условной логики.

### required() {#required}

Правило `required()` гарантирует, что у поля есть значение:

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

| Условие                      | Пример  |
| ---------------------------- | ------- |
| Значение равно `null`        | `null`, |
| Значение — пустая строка     | `''`    |

Для условной обязательности используйте параметр `when`:

```ts
registrationForm = form(this.registrationModel, (schemaPath) => {
  required(schemaPath.promoCode, {
    message: 'Promo code is required for discounts',
    when: ({valueOf}) => valueOf(schemaPath.applyDiscount),
  });
});
```

Правило валидации выполняется только когда функция `when` возвращает `true`.

NOTE: `required` считает пустой массив присутствующим (валидным), поэтому для минимального числа элементов массива используйте [`minLength()`](#minlength-and-maxlength); значение `false` считается отсутствующим (невалидным), как у `<input type="checkbox" required>`.

### email() {#email}

Правило `email()` проверяет корректный формат email:

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

Правило `email()` использует стандартное регулярное выражение формата email. Оно принимает адреса вроде `user@example.com`, но отклоняет некорректные вроде `user@` или `@example.com`.

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

Можно использовать computed-значения для динамических ограничений:

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

Для строк «длина» означает число символов. Для массивов — число элементов.

### pattern() {#pattern}

Правило `pattern()` проверяет значение по регулярному выражению:

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

Частые паттерны:

| Тип паттерна     | Регулярное выражение    | Пример       |
| ---------------- | ----------------------- | ------------ |
| Телефон          | `/^\d{3}-\d{3}-\d{4}$/` | 555-123-4567 |
| Почтовый индекс (США) | `/^\d{5}$/`        | 12345        |
| Буквенно-цифровой | `/^[a-zA-Z0-9]+$/`     | abc123       |
| URL-safe         | `/^[a-zA-Z0-9_-]+$/`    | my-url_123   |

## Валидация элементов массива {#validation-of-array-items}

Формы могут включать массивы вложенных объектов (например, список позиций заказа). Чтобы применить правила валидации к каждому элементу массива, используйте `applyEach()` внутри функции схемы. `applyEach()` обходит путь массива и предоставляет путь для каждого элемента, где можно применять валидаторы так же, как для полей верхнего уровня.

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

Когда правила валидации не проходят, они порождают объекты ошибок, описывающие, что пошло не так. Понимание структуры ошибок помогает давать пользователям понятную обратную связь.

<!-- TODO: Uncomment when field state management guide is published

NOTE: This section covers the errors that validation rules produce. For displaying and using validation errors in your UI, see the [Field State Management guide](guide/forms/signals/field-state-management). -->

### Структура ошибки {#error-structure}

Каждый объект ошибки валидации содержит следующие свойства:

| Свойство  | Описание                                                                     |
| --------- | ---------------------------------------------------------------------------- |
| `kind`    | Правило валидации, которое не прошло (например, "required", "email", "minLength") |
| `message` | Необязательное человекочитаемое сообщение об ошибке                          |

Встроенные правила автоматически устанавливают свойство `kind`. Свойство `message` необязательно — пользовательские сообщения можно задать через options правила валидации.

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

Пользовательские сообщения должны быть понятными, конкретными и подсказывать, как исправить проблему. Вместо «Invalid input» используйте «Password must be at least 12 characters for security».

### Несколько ошибок на поле {#multiple-errors-per-field}

Когда у поля несколько правил валидации, каждое выполняется независимо и может породить ошибку:

```ts
signupForm = form(this.signupModel, (schemaPath) => {
  required(schemaPath.email, {message: 'Email is required'});
  email(schemaPath.email, {message: 'Enter a valid email address'});
  minLength(schemaPath.email, 5, {message: 'Email is too short'});
});
```

Если поле email пустое, появляется только ошибка `required()`. Если пользователь вводит «a@b», появляются ошибки и `email()`, и `minLength()`. Все правила выполняются — валидация не останавливается после первого сбоя.

TIP: Используйте паттерн `touched() && invalid()` в шаблонах, чтобы ошибки не появлялись до взаимодействия пользователя с полем. Подробнее о отображении ошибок валидации см. в [руководстве по управлению состоянием полей](guide/forms/signals/field-state-management#conditional-error-display).

## Пользовательские правила валидации {#custom-validation-rules}

Встроенные правила покрывают типичные случаи, но часто нужна пользовательская логика для бизнес-правил, сложных форматов или доменных ограничений.

### Использование validate() {#using-validate}

Функция `validate()` создаёт пользовательские правила валидации. Она получает функцию-валидатор, которая обращается к контексту поля и возвращает:

| Возвращаемое значение | Значение         |
| --------------------- | ---------------- |
| Объект ошибки         | Значение невалидно |
| `null` или `undefined` | Значение валидно |

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

Функция-валидатор получает объект `FieldContext` со свойствами:

| Свойство        | Тип        | Описание                                          |
| --------------- | ---------- | ------------------------------------------------- |
| `value`         | Signal     | Сигнал с текущим значением поля                   |
| `state`         | FieldState | Ссылка на состояние поля                          |
| `field`         | FieldTree  | Ссылка на дерево поля                             |
| `valueOf()`     | Method     | Получить значение другого поля по пути            |
| `stateOf()`     | Method     | Получить состояние другого поля по пути           |
| `fieldTreeOf()` | Method     | Получить дерево поля другого поля по пути         |
| `pathKeys`      | Signal     | Ключи пути от корня до текущего поля              |

NOTE: У дочерних полей также есть сигнал `key`, а у элементов массива — сигналы `key` и `index`.

При неуспешной валидации верните объект ошибки с `kind` и `message`. При успешной — верните `null` или `undefined`.

### Использование validateTree() {#using-validatetree}

Функция `validateTree()` создаёт пользовательские правила, которые могут нацеливаться на несколько полей или обеспечивать сложную валидацию для целого поддерева.

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
  readonly userModel = model<User>({
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

Создавайте переиспользуемые функции правил валидации, оборачивая `validate()`:

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

## Межполевая валидация {#cross-field-validation}

Межполевая валидация сравнивает или связывает значения нескольких полей.

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

Правило подтверждения получает значение поля password через `valueOf(schemaPath.password)` и сравнивает его с значением подтверждения. Правило выполняется реактивно — если меняется любой из паролей, валидация перезапускается автоматически.

## Условная валидация {#conditional-validation}

Иногда правило валидации должно применяться только при определённых условиях — например, проверять адрес доставки только при международной отправке заказа или применять разный набор правил к каждому варианту поля с union-типом.

Поскольку правила валидации живут в функции схемы, применяйте их условно теми же структурными функциями, что и при композиции схем:

- Используйте [`applyWhen()`](guide/forms/signals/form-logic#conditional-logic-with-applywhen), чтобы активировать группу правил на основе реактивного состояния формы, включая значения других полей.
- Используйте [`applyWhenValue()`](guide/forms/signals/schemas#type-narrowing-with-applywhenvalue), чтобы применять правила на основе собственного значения поля. Когда предикат — type guard, правила типизируются суженным значением, что делает этот способ рекомендуемым для валидации дискриминированных union и других вариантных типов.

Полные примеры, включая переиспользуемые схемы и дискриминированные union, см. в [руководстве по схемам и композиции схем](guide/forms/signals/schemas).

## Асинхронная валидация {#async-validation}

Асинхронная валидация обрабатывает проверки, требующие внешних источников данных — например, проверку доступности имени пользователя на сервере или валидацию через API.

### Использование validateHttp() {#using-validatehttp}

Функция `validateHttp()` выполняет HTTP-валидацию:

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

Правило валидации `validateHttp()`:

1. Вызывает URL или запрос, возвращённый функцией `request`
2. Преобразует успешный ответ в ошибку валидации или `null` через `onSuccess`
3. Обрабатывает сбои запроса (сетевые ошибки, HTTP-ошибки) через `onError`
4. Устанавливает `pending()` в `true`, пока запрос выполняется
5. Запускается только после прохождения всех синхронных правил валидации

### Состояние pending {#pending-state}

Пока выполняется асинхронная валидация, сигнал `pending()` поля возвращает `true`. Используйте это для индикаторов загрузки:

```angular-html
@if (form.username().pending()) {
  <span class="spinner">Checking...</span>
}
```

Сигнал `valid()` возвращает `false`, пока валидация в состоянии pending, даже если ошибок ещё нет. Сигнал `invalid()` возвращает `true` только при наличии ошибок.

## Интеграция с библиотеками схем валидации {#integration-with-schema-validation-libraries}

Signal Forms имеют встроенную поддержку библиотек, соответствующих [Standard Schema](https://standardschema.dev/), например [Zod](https://zod.dev/) или [Valibot](https://valibot.dev/). Интеграция предоставляется через функцию `validateStandardSchema`. Это позволяет использовать существующие схемы, сохраняя преимущества реактивной валидации Signal Forms.

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

### Динамические схемы {#dynamic-schemas}

Можно передать сигнал вместо статической схемы, чтобы схема валидации автоматически обновлялась при изменении зависимостей.

```angular-ts
import {Component, computed, signal} from '@angular/core';
import {form, FormField, validateStandardSchema} from '@angular/forms/signals';
import z from 'zod';

@Component({
  /* ... */
})
export class DynamicSchema {
  model = signal({document: '', type: 'dni'});

  // Schema reacts automatically to type changes
  schema = computed(() =>
    z.object({
      document:
        this.model().type === 'dni'
          ? z.string().length(8, 'DNI must be 8 digits')
          : z.string().min(12, 'Passport must be at least 12 characters'),
    }),
  );

  f = form(this.model, (p) => validateStandardSchema(p, () => this.schema()));
}
```

## Следующие шаги {#next-steps}

В этом руководстве рассмотрено создание и применение правил валидации. Связанные руководства раскрывают другие аспекты Signal Forms:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/models" title="Form models" />
  <docs-pill href="guide/forms/signals/form-logic" title="Adding form logic" />
  <docs-pill href="guide/forms/signals/schemas" title="Schemas and schema composability" />
</docs-pill-row>
