# Асинхронные операции {#async-operations}

Некоторая валидация требует данных из внешних источников, таких как бэкенд API или сторонние сервисы. Signal Forms предоставляет две функции для асинхронной валидации: `validateHttp()` для валидации на основе HTTP и `validateAsync()` для пользовательской валидации на основе ресурсов.

## Когда использовать асинхронную валидацию {#when-to-use-async-validation}

Используйте асинхронную валидацию, когда логика валидации требует внешних данных. Некоторые распространённые примеры:

- **Проверка уникальности** — Проверка того, что имена пользователей или адреса электронной почты ещё не используются
- **Поиск в базе данных** — Проверка значений по серверным данным
- **Валидация через внешний API** — Валидация адресов, ИНН или других данных с помощью сторонних сервисов
- **Бизнес-правила на стороне сервера** — Применение правил валидации, которые может проверить только сервер

Не используйте асинхронную валидацию для проверок, которые можно выполнить синхронно на клиенте. Используйте синхронные правила, такие как `pattern()`, `email()` или `validate()`, для валидации формата и статических правил.

## Как работает асинхронная валидация {#how-async-validation-works}

Асинхронная валидация запускается только после прохождения всей синхронной валидации. Пока она выполняется, сигнал `pending()` поля возвращает `true`. Валидация может направлять ошибки к конкретным полям, а ожидающие запросы автоматически отменяются при изменении значений полей.

Вот пример проверки доступности имени пользователя:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, validateHttp, FormField} from '@angular/forms/signals';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `
    <form>
      <label>
        Username:
        <input [formField]="registrationForm.username" />
      </label>

      @if (registrationForm.username().pending()) {
        <span class="checking">Checking availability...</span>
      }
      @if (registrationForm.username().invalid()) {
        @for (error of registrationForm.username().errors(); track $index) {
          <span class="error">{{ error.message }}</span>
        }
      }
    </form>
  `,
})
export class Registration {
  registrationModel = signal({username: ''});

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateHttp(schemaPath.username, {
      request: ({value}) => {
        const username = value();
        return username ? `/api/users/check?username=${username}` : undefined;
      },
      onSuccess: (response) => {
        return response.available
          ? null
          : {
              kind: 'usernameTaken',
              message: 'Username is already taken',
            };
      },
      onError: (error) => {
        console.error('Validation request failed:', error);
        return {
          kind: 'serverError',
          message: 'Could not verify username availability',
        };
      },
    });
  });
}
```

Поток валидации работает следующим образом:

1. Пользователь вводит значение
2. Сначала выполняются синхронные правила валидации
3. Если синхронная валидация не проходит, асинхронная не запускается
4. Если синхронная валидация проходит, начинается асинхронная, и `pending()` становится `true`
5. Запрос завершается, `pending()` становится `false`
6. Ошибки обновляются на основе ответа

## HTTP-валидация с validateHttp() {#http-validation-with-validatehttp}

Функция `validateHttp()` обеспечивает наиболее распространённую форму асинхронной валидации. Используйте её, когда нужно выполнить валидацию через REST API или любой HTTP-эндпоинт.

### Функция запроса {#request-function}

Функция `request` возвращает либо строку URL, либо объект `HttpResourceRequest`. Верните `undefined` для пропуска валидации:

```ts
import {Component, signal} from '@angular/core';
import {form, validateHttp, FormField} from '@angular/forms/signals';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `...`,
})
export class Registration {
  registrationModel = signal({username: ''});

  // Cache usernames that passed validation
  private validatedUsernames = new Set<string>();

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateHttp(schemaPath.username, {
      request: ({value}) => {
        const username = value();
        // Skip HTTP request if already validated
        if (this.validatedUsernames.has(username)) return undefined;

        return `/api/users/check?username=${username}`;
      },
      onSuccess: (response, {value}) => {
        if (response.available) {
          // Cache successful validations
          this.validatedUsernames.add(value());
          return null;
        }
        return {
          kind: 'usernameTaken',
          message: 'Username is already taken',
        };
      },
      onError: () => ({
        kind: 'serverError',
        message: 'Could not verify username',
      }),
    });
  });
}
```

Для POST-запросов или пользовательских заголовков верните объект `HttpResourceRequest`:

```ts
request: ({value}) => ({
  url: '/api/validate',
  method: 'POST',
  body: {username: value()},
}) // prettier-ignore
```

### Обработчики успеха и ошибок {#success-and-error-handlers}

Функция `onSuccess` получает HTTP-ответ и возвращает ошибки валидации или `undefined` для действительных значений:

```ts
onSuccess: (response) => {
  if (response.valid) return undefined;

  return {
    kind: 'invalid',
    message: response.message || 'Validation failed',
  };
} // prettier-ignore
```

При необходимости верните несколько ошибок:

```ts
onSuccess: (response) => {
  const errors = [];
  if (response.usernameTaken) {
    errors.push({
      kind: 'usernameTaken',
      message: 'Username taken',
    });
  }
  if (response.profanity) {
    errors.push({
      kind: 'profanity',
      message: 'Username contains inappropriate content',
    });
  }
  return errors.length > 0 ? errors : undefined;
} // prettier-ignore
```

Функция `onError` обрабатывает сбои запросов, такие как сетевые ошибки или HTTP-ошибки:

```ts
onError: (error) => {
  console.error('Validation request failed:', error);
  return {
    kind: 'serverError',
    message: 'Could not verify. Please try again later.',
  };
} // prettier-ignore
```

### Опции HTTP {#http-options}

Настройте HTTP-запрос с помощью параметра `options`:

```ts
import {HttpHeaders} from '@angular/common/http';

validateHttp(schemaPath.field, {
  request: ({value}) => `/api/validate?value=${value()}`,
  options: {
    headers: new HttpHeaders({
      Authorization: 'Bearer token',
    }),
    timeout: 5000,
  },
  onSuccess: (response) =>
    response.valid
      ? null
      : {
          kind: 'invalid',
          message: 'Invalid value',
        },
  onError: () => ({
    kind: 'requestFailed',
    message: 'Unable to reach server to validate.',
  }),
});
```

TIP: Все доступные опции см. в [документации API httpResource](api/common/http/httpResource).

## Пользовательская асинхронная валидация с validateAsync() {#custom-async-validation-with-validateasync}

Большинству приложений следует использовать `validateHttp()` для асинхронной валидации. Он обрабатывает HTTP-запросы с минимальной конфигурацией и покрывает большинство случаев.

`validateAsync()` — это низкоуровневый API, напрямую открывающий примитив ресурса Angular. Он предлагает полный контроль, но требует больше кода и знания API ресурсов Angular.

Рассмотрите `validateAsync()` только тогда, когда `validateHttp()` не может удовлетворить ваши потребности. Некоторые примеры:

- **Валидация не через HTTP** — WebSocket-соединения, поиск в IndexedDB или вычисления в Web Worker
- **Пользовательские стратегии кэширования** — Специфичное для приложения кэширование, выходящее за рамки простой мемоизации
- **Сложная логика повтора** — Пользовательские стратегии отступа или условные повторы
- **Прямой доступ к ресурсу** — Когда нужен полный жизненный цикл ресурса

### Создание пользовательского правила валидации {#creating-a-custom-validation-rule}

Функция `validateAsync()` требует четыре свойства: `params`, `factory`, `onSuccess` и `onError`. Функция `params` возвращает параметры для вашего ресурса, а `factory` создаёт ресурс:

```ts
import {Component, inject, signal, resource, Signal} from '@angular/core';
import {form, validateAsync, FormField} from '@angular/forms/signals';
import {UsernameValidator} from './username-validator';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `...`,
})
export class Registration {
  registrationModel = signal({username: ''});

  private usernameValidator = inject(UsernameValidator);
  private cache = new Map<string, {available: boolean}>();

  // Custom resource factory with caching
  createUsernameResource = (usernameSignal: Signal<string | undefined>) => {
    return resource({
      params: () => usernameSignal(),
      loader: async ({params: username}) => {
        if (!username) return undefined;

        // Check cache first
        const cached = this.cache.get(username);
        if (cached !== undefined) return cached;

        // Use injected service for validation
        const result = await this.usernameValidator.checkAvailability(username);

        // Cache result
        this.cache.set(username, result);
        return result;
      },
    });
  };

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateAsync(schemaPath.username, {
      params: ({value}) => {
        const username = value();
        return username.length >= 3 ? username : undefined;
      },
      factory: this.createUsernameResource,
      onSuccess: (result) => {
        return result?.available
          ? null
          : {
              kind: 'usernameTaken',
              message: 'Username taken',
            };
      },
      onError: (error) => {
        console.error('Validation failed:', error);
        return {
          kind: 'serverError',
          message: 'Could not verify username',
        };
      },
    });
  });
}
```

Функция `params` выполняется при каждом изменении значения. Верните `undefined` для пропуска валидации. Функция `factory` выполняется один раз при настройке и получает params как сигнал. Ресурс обновляется автоматически при изменении params.

### Использование сервисов на основе Observable {#using-observable-based-services}

Если в вашем приложении есть существующие сервисы, возвращающие Observable, используйте `rxResource` из `@angular/core/rxjs-interop`:

```ts
import {Component, inject, signal, Signal} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';
import {form, validateAsync, FormField} from '@angular/forms/signals';
import {UsernameService} from './username-service';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `...`,
})
export class Registration {
  registrationModel = signal({username: ''});

  private usernameService = inject(UsernameService);

  private createUsernameResource = (usernameSignal: Signal<string | undefined>) => {
    return rxResource({
      request: () => usernameSignal(),
      stream: ({request: username}) => this.usernameService.checkUsername(username),
    });
  };

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateAsync(schemaPath.username, {
      params: ({value}) => value() || undefined,
      factory: this.createUsernameResource,
      onSuccess: (result) =>
        result?.available ? null : {kind: 'usernameTaken', message: 'Username taken'},
      onError: () => ({
        kind: 'serverError',
        message: 'Could not verify username',
      }),
    });
  });
}
```

Функция `rxResource` напрямую работает с Observable и автоматически обрабатывает отписку при изменении значения поля.

## Понимание состояния ожидания {#understanding-pending-state}

Когда выполняется асинхронная валидация, сигнал `pending()` поля возвращает `true`. В это время:

- `valid()` возвращает `false`
- `invalid()` возвращает `false`
- `errors()` возвращает пустой массив
- `submit()` ожидает завершения валидации

Отображайте состояние ожидания в шаблоне для предоставления обратной связи:

```angular-html
<input [formField]="loginForm.username" />

@if (loginForm.username().pending()) {
  <span class="loading">Checking availability...</span>
}

@if (loginForm.username().touched() && loginForm.username().invalid()) {
  @for (error of loginForm.username().errors(); track $index) {
    <span class="error">{{ error.message }}</span>
  }
}
```

Отключайте отправку формы во время ожидания валидации:

```angular-html
<button type="submit" [disabled]="loginForm().pending()">
  @if (loginForm().pending()) {
    Validating...
  } @else {
    Submit
  }
</button>
```

TIP: Больше паттернов использования `pending()`, `valid()` и `invalid()` см. в [руководстве по управлению состоянием поля](guide/forms/signals/field-state-management).

### Порядок выполнения валидации {#validation-execution-order}

Асинхронная валидация запускается только после прохождения синхронной. Это предотвращает ненужные серверные запросы для недействительного ввода:

```ts
import {form, required, minLength, validateHttp} from '@angular/forms/signals';

form(model, (schemaPath) => {
  // 1. These synchronous validation rules run first
  required(schemaPath.username);
  minLength(schemaPath.username, 3);

  // 2. This async validation rule only runs if synchronous validation passes
  validateHttp(schemaPath.username, {
    request: ({value}) => `/api/check?username=${value()}`,
    onSuccess: (result) =>
      result.valid
        ? null
        : {
            kind: 'usernameTaken',
            message: 'Username taken',
          },
    onError: () => ({
      kind: 'serverError',
      message: 'Validation failed',
    }),
  });
});
```

Этот порядок выполнения улучшает производительность, снижая нагрузку на сервер и мгновенно обнаруживая ошибки формата.

### Отмена запросов {#request-cancellation}

При изменении значения поля Signal Forms автоматически отменяет любой ожидающий асинхронный запрос валидации для этого поля. Это предотвращает гонки состояний и гарантирует, что валидация всегда отражает текущее значение. Реализовывать логику отмены самостоятельно не нужно.

## Лучшие практики {#best-practices}

### Сочетание с синхронной валидацией {#combine-with-synchronous-validation}

Всегда проверяйте формат перед выполнением асинхронных запросов. Это мгновенно обнаруживает ошибки и предотвращает ненужные серверные запросы:

```ts
import {form, required, email, validateHttp} from '@angular/forms/signals';

form(model, (schemaPath) => {
  // Validate format first
  required(schemaPath.email);
  email(schemaPath.email);

  // Then check availability
  validateHttp(schemaPath.email, {
    request: ({value}) => `/api/emails/check?email=${value()}`,
    onSuccess: (result) =>
      result.available
        ? null
        : {
            kind: 'emailInUse',
            message: 'Email already in use',
          },
    onError: () => ({
      kind: 'serverError',
      message: 'Could not verify email',
    }),
  });
});
```

### Пропуск валидации при необходимости {#skip-validation-when-appropriate}

Верните `undefined` из функции `request` для пропуска валидации. Используйте это для избежания валидации пустых полей или значений, не соответствующих минимальным требованиям:

```ts
import {validateHttp} from '@angular/forms/signals';

validateHttp(schemaPath.username, {
  request: ({value}) => {
    const username = value();
    // Skip validation for empty or short usernames
    if (!username || username.length < 3) return undefined;

    return `/api/users/check?username=${username}`;
  },
  onSuccess: (result) =>
    result.valid
      ? null
      : {
          kind: 'usernameTaken',
          message: 'Username taken',
        },
  onError: () => ({
    kind: 'serverError',
    message: 'Validation failed',
  }),
});
```

### Корректная обработка ошибок {#handle-errors-gracefully}

Предоставляйте чёткие, понятные пользователю сообщения об ошибках. Регистрируйте технические детали для отладки, но показывайте пользователям простые сообщения:

```ts
import {validateHttp} from '@angular/forms/signals';

validateHttp(schemaPath.field, {
  request: ({value}) => `/api/validate?field=${value()}`,
  onSuccess: (result) => {
    if (result.valid) return null;
    // Use server message when available
    return {
      kind: 'serverError',
      message: result.message || 'Validation failed',
    };
  },
  onError: (error) => {
    // Log for debugging
    console.error('Validation request failed:', error);

    // Show user-friendly message
    return {
      kind: 'serverError',
      message: 'Unable to validate. Please try again later.',
    };
  },
});
```

### Показывайте чёткую обратную связь {#show-clear-feedback}

Используйте сигнал `pending()` для отображения выполняемой валидации. Это помогает пользователям понять задержки и обеспечивает лучшее воспринимаемое быстродействие:

```angular-html
@if (field().pending()) {
  <span class="checking">
    <span class="spinner"></span>
    Checking...
  </span>
}
@if (field().valid() && !field().pending()) {
  <span class="success">Available</span>
}
@if (field().invalid()) {
  <span class="error">{{ field().errors()[0]?.message }}</span>
}
```

## Следующие шаги {#next-steps}

В этом руководстве рассмотрена асинхронная валидация с `validateHttp()` и `validateAsync()`. Связанные руководства охватывают другие аспекты Signal Forms:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/validation" title="Валидация"/>
  <docs-pill href="guide/forms/signals/field-state-management" title="Управление состоянием поля"/>
</docs-pill-row>

Подробную документацию API см. в:

- [`validateHttp()`](api/forms/signals/validateHttp) — Асинхронная валидация на основе HTTP
- [`validateAsync()`](api/forms/signals/validateAsync) — Пользовательская асинхронная валидация на основе ресурсов
- [`httpResource()`](api/common/http/httpResource) — API HTTP-ресурса Angular
- [`resource()`](api/core/resource) — Примитив ресурса Angular
