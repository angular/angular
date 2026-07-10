# Асинхронные операции

Некоторая валидация требует данных из внешних источников — backend API или сторонних сервисов. Signal Forms предоставляет две функции для асинхронной валидации: `validateHttp()` для HTTP-валидации и `validateAsync()` для пользовательской валидации на основе resource.

## Когда использовать асинхронную валидацию {#when-to-use-async-validation}

Используйте асинхронную валидацию, когда логика проверки требует внешних данных. Типичные примеры:

- **Проверка уникальности** — убедиться, что имя пользователя или email ещё не заняты
- **Запросы к базе данных** — сверять значения с данными на сервере
- **Валидация через внешние API** — проверять адреса, налоговые идентификаторы и другие данные через сторонние сервисы
- **Серверные бизнес-правила** — применять правила, которые может проверить только сервер

Не используйте асинхронную валидацию для проверок, которые можно выполнить синхронно на клиенте. Для проверки формата и статических правил применяйте синхронные правила вроде `pattern()`, `email()` или `validate()`.

## Как работает асинхронная валидация {#how-async-validation-works}

Асинхронная валидация запускается только после успешного прохождения всей синхронной валидации. Пока проверка выполняется, сигнал `pending()` поля возвращает `true`. Ошибки можно направлять на конкретные поля, а незавершённые запросы автоматически отменяются при изменении значений полей.

Пример проверки доступности имени пользователя:

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
      onSuccess: (response: {available: boolean}) => {
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

Поток валидации выглядит так:

1. Пользователь вводит значение
2. Сначала выполняются синхронные правила валидации
3. Если синхронная валидация не прошла, асинхронная не запускается
4. Если синхронная валидация прошла, запускается асинхронная, и `pending()` становится `true`
5. Запрос завершается, и `pending()` становится `false`
6. Ошибки обновляются на основе ответа

## HTTP-валидация с validateHttp() {#http-validation-with-validatehttp}

Функция `validateHttp()` — самый распространённый способ асинхронной валидации. Используйте её, когда нужно проверить значение через REST API или любой HTTP-эндпоинт.

### Функция request {#request-function}

Функция `request` возвращает либо строку URL, либо объект `HttpResourceRequest`. Верните `undefined`, чтобы пропустить валидацию:

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
      onSuccess: (response: {available: boolean}, {value}) => {
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

### Обработчики успеха и ошибки {#success-and-error-handlers}

Функция `onSuccess` получает HTTP-ответ и возвращает ошибки валидации или `undefined` для корректных значений:

```ts
onSuccess: (response: { valid: boolean; message?: string }) => {
  if (response.valid) return undefined;

  return {
    kind: 'invalid',
    message: response.message || 'Validation failed',
  };
} // prettier-ignore
```

При необходимости верните несколько ошибок:

```ts
onSuccess: (response: { usernameTaken: boolean; profanity: boolean }) => {
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

Тип для `onSuccess` можно указать либо прямо в параметре, либо через свойство `parse` в `options` у `validateHttp`:

```ts
onSuccess: (response: { usernameTaken: boolean; profanity: boolean }) => {
  // ...
} // prettier-ignore

// or

options: {
  parse: (response) => response as {usernameTaken: boolean; profanity: boolean};
}
onSuccess: (response) => {
  // ...
} // prettier-ignore
```

Функция `onError` обрабатывает сбои запроса — сетевые ошибки или HTTP-ошибки:

```ts
onError: (error) => {
  console.error('Validation request failed:', error);
  return {
    kind: 'serverError',
    message: 'Could not verify. Please try again later.',
  };
} // prettier-ignore
```

### Параметры HTTP {#http-options}

Настройте HTTP-запрос через параметр `options`:

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
  onSuccess: (response: {valid: boolean}) =>
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

TIP: Полный список доступных параметров см. в [документации API httpResource](api/common/http/httpResource).

## Пользовательская асинхронная валидация с validateAsync() {#custom-async-validation-with-validateasync}

В большинстве приложений для асинхронной валидации следует использовать `validateHttp()`. Она обрабатывает HTTP-запросы с минимальной конфигурацией и покрывает большинство сценариев.

`validateAsync()` — API более низкого уровня, которое напрямую открывает примитив resource Angular. Оно даёт полный контроль, но требует больше кода и знакомства с API resource.

Рассматривайте `validateAsync()` только когда `validateHttp()` не подходит. Примеры:

- **Не-HTTP валидация** — WebSocket, поиск в IndexedDB или вычисления в Web Worker
- **Пользовательские стратегии кэширования** — кэширование, специфичное для приложения, помимо простой мемоизации
- **Сложная логика повторов** — собственные стратегии backoff или условные повторы
- **Прямой доступ к resource** — когда нужен полный жизненный цикл resource

### Создание пользовательского правила валидации {#creating-a-custom-validation-rule}

Функция `validateAsync()` требует четыре свойства: `params`, `factory`, `onSuccess` и `onError`. Функция `params` возвращает параметры для resource, а `factory` создаёт resource:

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
        return username.length >= 3 ? username : undefined!;
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

Функция `params` выполняется при каждом изменении значения. Верните `undefined`, чтобы пропустить валидацию. Функция `factory` выполняется один раз при настройке и получает params как сигнал. Resource обновляется автоматически при изменении params.

### Использование сервисов на основе Observable {#using-observable-based-services}

Если в приложении уже есть сервисы, возвращающие Observable, используйте `rxResource` из `@angular/core/rxjs-interop`:

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
      params: () => usernameSignal(),
      stream: ({params: username}) => this.usernameService.checkUsername(username),
    });
  };

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateAsync(schemaPath.username, {
      params: ({value}) => value(),
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

Функция `rxResource` работает напрямую с Observable и автоматически очищает подписки при изменении значения поля.

## Debounce {#debouncing}

Правило `debounce` откладывает момент, когда ввод пользователя записывается в модель формы. Можно представить его как правило, которое удерживает значения, пока пользователь не сделает паузу в наборе. Это полезно, когда последующее поведение не должно реагировать на каждое нажатие клавиши — например, дорогие производные вычисления, валидация, которая мигает ошибками посреди слова, или поисковые фильтры, которые переприменяются на каждый символ.

Добавьте правило `debounce` в схему, чтобы отложить попадание изменений UI поля в модель формы. В простейшем виде `debounce(path, ms)` удерживает каждое изменение UI заданное число миллисекунд перед записью в модель. Новое изменение в этом окне сбрасывает таймер.

Следующий пример применяет `debounce` и `validateHttp` к полю username, чтобы отложить проверку доступности имени в форме регистрации до паузы в наборе:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, debounce, validateHttp, FormField} from '@angular/forms/signals';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `
    <label>
      Username:
      <input [formField]="registrationForm.username" />
    </label>

    @if (registrationForm.username().pending()) {
      <span class="checking">Checking availability...</span>
    }
  `,
})
export class Registration {
  registrationModel = signal({username: ''});

  registrationForm = form(this.registrationModel, (schemaPath) => {
    // Hold UI updates for 300 ms before writing to the model
    debounce(schemaPath.username, 300);

    // Runs against the debounced model value, not every keystroke
    validateHttp(schemaPath.username, {
      request: ({value}) => {
        const username = value();
        // Skip the request for blank values
        return username ? `/api/users/check?username=${username}` : undefined;
      },
      onSuccess: (response: {available: boolean}) =>
        response.available ? null : {kind: 'usernameTaken', message: 'Username is already taken'},
      onError: () => ({
        kind: 'serverError',
        message: 'Could not verify username availability',
      }),
    });
  });
}
```

С debounce в 300 мс модель обновляется и валидируется только после того, как пользователь сделал паузу дольше заданной длительности. Например, быстрый набор «signal forms» вызывает один запрос валидации вместо двенадцати.

### Touch сбрасывает модель {#touch-flushes-the-model}

Независимо от длительности debounce, фреймворк сразу записывает `controlValue()` поля в модель, когда поле становится touched. Нативные inputs становятся touched при blur, поэтому пользователю, который закончил набор и ушёл с поля по Tab, не нужно ждать истечения таймера debounce. Пользовательские контролы могут помечать поле как touched в ответ на любое выбранное ими событие.

Обычно это важно при отправке формы. Когда пользователь нажимает кнопку submit, сфокусированный input теряет фокус (blur), поле становится touched, и ожидающий debounce сбрасывается до запуска обработчика отправки.

### Запись только при blur {#commit-only-on-blur}

Некоторые поля не должны обновляться во время набора вообще — только после того, как пользователь закончил ввод. Например, если поисковый фильтр переприменяется при каждом изменении или форма запускает дорогие производные состояния, часто лучше, чтобы модель ждала завершения набора.

В таких сценариях передайте `'blur'` вместо длительности, чтобы отложить все обновления до момента, когда поле станет touched:

```ts
form(this.registrationModel, (schemaPath) => {
  debounce(schemaPath.username, 'blur');
});
```

С `'blur'` модель сохраняет предыдущее значение, пока пользователь печатает. Синхронная и асинхронная валидация, производные сигналы и любые реактивные правила, читающие поле, видят предыдущее значение, пока поле не станет touched. Обычно это происходит при blur нативного input или когда пользовательский контрол сам сигнализирует о touch.

### Пользовательская логика тайминга {#custom-timing-logic}

Для логики тайминга, которую нельзя выразить длительностью или `'blur'`, передайте функцию `Debouncer`. Функция получает контекст поля и [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) и возвращает `Promise<void>`, который разрешается, когда модель должна обновиться:

```ts
import {debounce, type Debouncer} from '@angular/forms/signals';

const shorterWhenLonger: Debouncer<string> = ({value}, abortSignal) => {
  // Shorter queries get a longer delay since the user is likely still typing.
  const ms = value().length < 3 ? 500 : 200;
  return new Promise((resolve) => {
    const timeoutId = setTimeout(resolve, ms);
    // Abort fires when this field is touched or its value changes, so the pending timer is cleared
    abortSignal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeoutId);
        resolve();
      },
      {once: true},
    );
  });
};

const registrationForm = form(registrationModel, (schemaPath) => {
  debounce(schemaPath.username, shorterWhenLonger);
});
```

`abortSignal` срабатывает, когда поле становится touched или когда его значение меняется до разрешения debounce. Разрешите promise при abort, чтобы debouncer освободил ожидающие таймеры. Фреймворк записывает ожидающее значение в модель при touch и отбрасывает его, когда приходит более новое значение. Полную сигнатуру `Debouncer` см. в [справочнике API `debounce`](api/forms/signals/debounce).

### Debounce одного асинхронного валидатора {#debouncing-a-single-async-validator}

Правило `debounce` удерживает все реакции на поле — от синхронной валидации до производных сигналов и асинхронной валидации. Однако иногда нужно обратное: дешёвые синхронные валидаторы вроде `required` или `email` должны срабатывать сразу для мгновенной обратной связи, а дорогой асинхронный вызов — ждать, пока пользователь «успокоится». И `validateHttp()`, и `validateAsync()` принимают собственный [параметр `debounce`](api/forms/signals/validateAsync), который ограничивает только этот валидатор:

```ts
form(this.registrationModel, (schemaPath) => {
  validateHttp(schemaPath.username, {
    // Throttles only this HTTP call
    debounce: 300,
    request: ({value}) => {
      const username = value();
      // Skip the request for blank values
      return username ? `/api/users/check?username=${username}` : undefined;
    },
    onSuccess: (response: {available: boolean}) =>
      response.available ? null : {kind: 'usernameTaken', message: 'Username is already taken'},
    onError: () => ({
      kind: 'serverError',
      message: 'Could not verify username availability',
    }),
  });
});
```

Модель по-прежнему обновляется на каждое нажатие клавиши, и любые другие правила, привязанные к полю, реагируют сразу. Debounce применяется только к HTTP-запросу: каждое изменение ждёт 300 мс тишины перед отправкой, поэтому запрос уходит только после паузы в наборе.

Выбирайте между двумя уровнями в зависимости от области действия:

| Вариант                                                       | Когда использовать                                                                                                                                  |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Правило `debounce()`                                          | Синхронная валидация, производное состояние и отправка должны ждать, пока поле зафиксирует значение. Всё поле не должно реагировать во время набора. |
| `validateHttp({ debounce })` или `validateAsync({ debounce })` | Дешёвые синхронные валидаторы дают мгновенную обратную связь, а дорогие асинхронные вызовы ждут паузы пользователя.                                  |

Оба варианта принимают длительность в миллисекундах. Их колбэки пользовательского тайминга различаются: правило на уровне формы принимает `Debouncer`, а параметр на уровне валидатора — `DebounceTimer` из `@angular/core`. Эти две сигнатуры не взаимозаменяемы.

## Композиция resource в асинхронной валидации через factory {#composing-resources-in-async-validation-with-a-factory}

Встроенный [параметр `debounce`](api/forms/signals/validateAsync) покрывает throttling, но `validateAsync()` открывает более глубокую точку композиции: функцию `factory`. Factory получает params как сигнал и возвращает resource. Между этими двумя точками вы свободны компоновать всё, что нужно.

В простейшем виде factory оборачивает один resource. Проверку доступности имени пользователя можно оформить как метод класса компонента, а затем подключить в `validateAsync` по ссылке:

```ts
export class Registration {
  registrationModel = signal({username: ''});
  private usernameValidator = inject(UsernameValidator);

  // Factory function
  checkUsernameAvailable = (username: Signal<string | undefined>) =>
    resource({
      params: () => username(),
      loader: async ({params: name}) => this.usernameValidator.checkAvailability(name),
    });

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateAsync(schemaPath.username, {
      params: ({value}) => {
        const username = value();
        // Skip validation for short usernames
        return username.length >= 3 ? username : undefined!;
      },
      debounce: 300,
      // Reference to the factory defined above
      factory: this.checkUsernameAvailable,
      onSuccess: (result) =>
        result?.available ? null : {kind: 'usernameTaken', message: 'Username taken'},
      onError: () => ({kind: 'serverError', message: 'Could not verify'}),
    });
  });
}
```

Колбэк `params` возвращает `undefined` для коротких имён, сигнализируя, что валидацию нужно пропустить. С `debounce: 300` resource ждёт, пока пользователь сделает паузу в 300 мс, прежде чем обработать каждое изменение. Затем он запускает loader для корректных имён и простаивает, когда debounced-значение стабилизируется в `undefined`.

### Сочетание debounce с дополнительной логикой {#combining-debounce-with-additional-logic}

Когда нужна логика сверх обычного debounce по длительности, используйте пользовательский factory, чтобы объединить debounce с этой логикой. Частый случай — кэширование проверенных ответов. Например, после того как сервер подтвердил имя пользователя, не нужно спрашивать снова при последующих нажатиях, которые возвращаются к тому же значению.

```ts
export class Registration {
  registrationModel = signal({username: ''});
  private usernameValidator = inject(UsernameValidator);

  registrationForm = form(this.registrationModel, (schemaPath) => {
    validateAsync(schemaPath.username, {
      params: ({value}) => {
        const username = value();
        return username.length >= 3 ? username : undefined;
      },
      factory: (username) => {
        // Core primitive: settles 300 ms after the source stops changing
        const debouncedUsername = debounced(username, 300);
        // Cache lives in the factory's closure and persists for the field's lifetime
        const cache = new Map<string, {available: boolean}>();
        return resource({
          // Read from the debounced signal, not the raw one
          params: () => debouncedUsername.value(),
          loader: async ({params: name}) => {
            const cached = cache.get(name);
            if (cached) return cached;

            const result = await this.usernameValidator.checkAvailability(name);
            cache.set(name, result);
            return result;
          },
        });
      },
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

`cache` живёт в замыкании factory, поэтому сохраняется на время жизни поля. Когда пользователь вводит имя, которое сервер уже проверял, loader читает из кэша вместо нового сетевого запроса.

## Понимание состояния pending {#understanding-pending-state}

Когда выполняется асинхронная валидация, сигнал `pending()` поля возвращает `true`. В это время:

- `valid()` возвращает `false`
- `invalid()` возвращает `false`
- `errors()` возвращает пустой массив
- `submit()` ждёт завершения валидации

Показывайте состояние pending в шаблоне, чтобы дать обратную связь:

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

Отключайте отправку формы, пока валидация в состоянии pending:

```angular-html
<button type="submit" [disabled]="loginForm().pending()">
  @if (loginForm().pending()) {
    Validating...
  } @else {
    Submit
  }
</button>
```

TIP: Дополнительные паттерны с сигналами `pending()`, `valid()` и `invalid()` см. в [руководстве по управлению состоянием полей](guide/forms/signals/field-state-management).

### Порядок выполнения валидации {#validation-execution-order}

Асинхронная валидация запускается только после прохождения синхронной. Это предотвращает лишние серверные запросы для некорректного ввода:

```ts
import {form, required, minLength, validateHttp} from '@angular/forms/signals';

form(model, (schemaPath) => {
  // 1. These synchronous validation rules run first
  required(schemaPath.username);
  minLength(schemaPath.username, 3);

  // 2. This async validation rule only runs if synchronous validation passes
  validateHttp(schemaPath.username, {
    request: ({value}) => `/api/check?username=${value()}`,
    onSuccess: (result: {valid: boolean}) =>
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

Такой порядок выполнения повышает производительность: снижает нагрузку на сервер и мгновенно ловит ошибки формата.

### Отмена запросов {#request-cancellation}

Когда значение поля меняется, Signal Forms автоматически отменяют любой незавершённый асинхронный запрос валидации для этого поля. Это предотвращает гонки и гарантирует, что валидация всегда отражает текущее значение. Реализовывать логику отмены самостоятельно не нужно.

## Рекомендации {#best-practices}

### Сочетайте с синхронной валидацией {#combine-with-synchronous-validation}

Всегда проверяйте формат перед асинхронными запросами. Это мгновенно ловит ошибки и предотвращает лишние серверные запросы:

```ts
import {form, required, email, validateHttp} from '@angular/forms/signals';

form(model, (schemaPath) => {
  // Validate format first
  required(schemaPath.email);
  email(schemaPath.email);

  // Then check availability
  validateHttp(schemaPath.email, {
    request: ({value}) => `/api/emails/check?email=${value()}`,
    onSuccess: (result: {available: boolean}) =>
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

### Пропускайте валидацию, когда это уместно {#skip-validation-when-appropriate}

Верните `undefined` из функции `request`, чтобы пропустить валидацию. Используйте это, чтобы не проверять пустые поля или значения, не удовлетворяющие минимальным требованиям:

```ts
import {validateHttp} from '@angular/forms/signals';

validateHttp(schemaPath.username, {
  request: ({value}) => {
    const username = value();
    // Skip validation for empty or short usernames
    if (!username || username.length < 3) return undefined;

    return `/api/users/check?username=${username}`;
  },
  onSuccess: (result: {valid: boolean}) =>
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

### Обрабатывайте ошибки аккуратно {#handle-errors-gracefully}

Давайте понятные, дружелюбные сообщения об ошибках. Технические детали логируйте для отладки, а пользователям показывайте простые сообщения:

```ts
import {validateHttp} from '@angular/forms/signals';

validateHttp(schemaPath.field, {
  request: ({value}) => `/api/validate?field=${value()}`,
  onSuccess: (result: {valid: boolean; message?: string}) => {
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

### Показывайте понятную обратную связь {#show-clear-feedback}

Используйте сигнал `pending()`, чтобы показать, что валидация выполняется. Это помогает пользователям понять задержки и улучшает воспринимаемую производительность:

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

В этом руководстве рассмотрена асинхронная валидация с `validateHttp()` и `validateAsync()`. Связанные руководства раскрывают другие аспекты Signal Forms:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/validation" title="Validation"/>
  <docs-pill href="guide/forms/signals/field-state-management" title="Field State Management"/>
</docs-pill-row>

Подробную документацию API см. здесь:

- [`validateHttp()`](api/forms/signals/validateHttp) — асинхронная HTTP-валидация
- [`validateAsync()`](api/forms/signals/validateAsync) — пользовательская асинхронная валидация на основе resource
- [`httpResource()`](api/common/http/httpResource) — HTTP resource API Angular
- [`resource()`](api/core/resource) — примитив resource Angular
