# Отправка формы

Когда пользователь отправляет форму, приложению обычно нужно обработать сразу несколько задач: показать ошибки валидации, предотвратить повторную отправку, отправить данные на сервер и многое другое. Обрабатывать каждую вручную утомительно и чревато ошибками.

Signal Forms предоставляют функцию `submit()`, которая помогает управлять жизненным циклом отправки формы. Это руководство показывает, как её использовать.

## Что делает `submit()`? {#what-does-submit-do}

Функция `submit()` проходит определённую последовательность:

1. **Пометить интерактивные поля как touched** — поля, которые показывают ошибки только после touched, теперь покажут ошибки валидации. Скрытые, отключённые и readonly поля пропускаются.
1. **Проверить валидацию** — если какие-либо правила валидации не прошли, отправка останавливается и функция `action` не выполняется.
1. **Выполнить action** — функция `action` выполняется с текущим значением формы. Пока она выполняется, `submitting()` возвращает `true`.
1. **Обработать результат** — если action возвращает ошибки, они направляются к целевым полям. Если ничего не возвращает, отправка считается успешной.

Функция `submit()` возвращает `Promise<boolean>`, который разрешается в `true`, когда action завершается без ошибок, и в `false`, когда валидация не проходит или action возвращает ошибки.

## Настройка отправки формы с `FormRoot` {#setting-up-form-submission-with-formroot}

Самый распространённый способ использовать функцию `submit()` — через директиву `FormRoot`.

Директива `FormRoot` автоматически обрабатывает три вещи при привязке к элементу `<form>`:

1. **Устанавливает [`novalidate`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form#novalidate)** — отключает встроенную валидацию браузера, чтобы Signal Forms управляли валидацией
1. **Предотвращает default** — останавливает навигацию браузера при отправке формы
1. **Вызывает `submit()`** — запускает поток отправки, когда пользователь отправляет форму

NOTE: Директива `FormRoot` автоматически устанавливает атрибут `novalidate` на элементе `form`. Не нужно добавлять его вручную при использовании `FormRoot`.

`FormRoot` обрабатывает событие отправки, но всё равно нужно сказать ему, _что делать_ с данными формы. Для этого нужны три вещи:

1. Привязать форму к директиве `FormRoot`
1. Передать опцию `submission` в функцию `form()`
1. Определить функцию `action` внутри опции `submission`, которая управляет отправленными данными

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, FormRoot, required} from '@angular/forms/signals';

@Component({
  selector: 'app-contact',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="contactForm">
      <label>
        Name
        <input [formField]="contactForm.name" />
      </label>

      <label>
        Email
        <input type="email" [formField]="contactForm.email" />
      </label>

      <button type="submit">Send</button>
    </form>
  `,
})
export class Contact {
  contactModel = signal({
    name: '',
    email: '',
  });

  contactForm = form(
    this.contactModel,
    (schemaPath) => {
      required(schemaPath.name);
      required(schemaPath.email);
    },
    {
      submission: {
        action: async (field) => {
          const result = await saveContact(field().value());
          if (result.ok) return;

          return {kind: 'serverError', message: 'Failed to submit form'};
        },
      },
    },
  );
}
```

Функция `action` выполняется только когда ни одно правило валидации не провалилось. По умолчанию ожидающие async-валидаторы не блокируют отправку (см. [Управление gating валидации](#controlling-validation-gating-with-ignorevalidators)). Action получает дерево полей и объект `detail` с деревьями полей `root` и `submitted`, что полезно при отправке подформы.

После прохождения валидации сам action всё ещё может завершиться неудачей из-за сценариев вроде сетевой ошибки или дублирующей записи. В этих случаях можно показать сбой, вернув ошибку(и). С другой стороны, чтобы указать успех, достаточно вернуть `null` или `undefined`, или вызвать пустой `return`.

## Показ состояния отправки с `submitting()` {#showing-submission-state-with-submitting}

Когда нужно отслеживать, находится ли форма в процессе отправки, Signal Forms предоставляют сигнал `submitting()`, который возвращает `true`, пока выполняется функция `action`. Используйте его для показа индикаторов загрузки или отключения кнопки submit, чтобы предотвратить повторные отправки.

```angular-html
<button type="submit" [disabled]="contactForm().submitting()">
  @if (contactForm().submitting()) {
    Sending...
  } @else {
    Send
  }
</button>
```

Как только функция `action` успешно завершается или возвращает ошибку, сигнал `submitting()` автоматически сбрасывается обратно в `false`.

## Управление ошибками отправки {#managing-submission-errors}

### Ошибки сервера {#server-errors}

Когда функция `action` общается с сервером, сервер может вернуть ошибки, которые нужно показать на конкретных полях. Верните эти ошибки из `action`, чтобы направить их к целевым полям.

#### Ошибки на отправленном поле {#errors-on-the-submitted-field}

По умолчанию ошибки, возвращённые из `action`, назначаются отправленному полю (дереву полей, которое вы передали в `submit()`):

```ts
action: async (field) => {
  const result = await saveContact(field().value());
  if (result.ok) return;

  return {kind: 'serverError', message: 'Failed to submit form'};
};
```

#### Ошибки на конкретных полях {#errors-on-specific-fields}

Когда нужно направить ошибку к конкретному полю, включите свойство `fieldTree`, указывающее на это поле:

```ts
action: async (field) => {
  const result = await saveContact(field().value());
  if (result.ok) return;

  return {kind: 'taken', message: result.message, fieldTree: field.email};
};
```

#### Несколько ошибок {#multiple-errors}

Когда нужно сообщить об ошибках на нескольких полях, верните массив:

```ts
action: async (field) => {
  const result = await registerUser(field().value());
  if (result.ok) return;

  return result.errors.map((err: {field: string; message: string}) => ({
    kind: 'serverError',
    message: err.message,
    fieldTree: field[err.field as keyof typeof field],
  }));
};
```

### Автоочистка ошибок отправки {#auto-clearing-submission-errors}

Ошибки отправки очищаются автоматически, когда пользователь редактирует поле. Если `action` возвращает ошибку на поле email, эта ошибка исчезает, как только пользователь меняет значение email.

Это отличается от ошибок валидации, которые пересчитываются реактивно. Правила валидации запускаются снова при каждом изменении и могут произвести ту же ошибку. Ошибки отправки — одноразовые результаты с сервера: после очистки они не появляются снова, пока форма не будет отправлена снова.

TIP: Ошибки отправки появляются рядом с ошибками валидации в сигнале `errors()` поля. Указания по отображению ошибок в шаблоне см. в [руководстве по управлению состоянием полей](guide/forms/signals/field-state-management).

## Обработка невалидных отправок с `onInvalid` {#handling-invalid-submissions-with-oninvalid}

Когда валидация не проходит, функция `action` не выполняется. Если нужно отреагировать на неудачную попытку отправки — например, прокрутить к первой ошибке, показать toast или сфокусировать невалидное поле — используйте колбэк `onInvalid`.

```ts
contactForm = form(
  this.contactModel,
  (schemaPath) => {
    required(schemaPath.name);
    required(schemaPath.email);
  },
  {
    submission: {
      action: async (field) => {
        await saveContact(field().value());
      },
      onInvalid: (field) => {
        const firstError = field().errorSummary()[0];
        firstError?.fieldTree().focusBoundControl();
      },
    },
  },
);
```

Колбэк `onInvalid` получает те же параметры `(field, detail)`, что и `action`. Он выполняется после того, как все интерактивные поля помечены как touched, поэтому ошибки валидации уже видны в UI, когда он выполняется.

## Управление gating валидации с `ignoreValidators` {#controlling-validation-gating-with-ignorevalidators}

По умолчанию `submit()` игнорирует ожидающие валидаторы. Если ни один валидатор не провалился, action выполняется, даже если некоторые async-валидаторы ещё выполняются. Опция `ignoreValidators` даёт контроль над этим поведением.

| Значение    | Поведение                                                                            |
| ----------- | ------------------------------------------------------------------------------------ |
| `'pending'` | Отправлять, если ни один валидатор не провалился, даже если некоторые ожидают (по умолчанию) |
| `'none'`    | Отправлять только если все валидаторы проходят — ожидающие валидаторы блокируют отправку |
| `'all'`     | Всегда отправлять независимо от состояния валидации                                  |

```ts
contactForm = form(
  this.contactModel,
  (schemaPath) => {
    required(schemaPath.name);
    required(schemaPath.email);
  },
  {
    submission: {
      action: async (field) => {
        await saveContact(field().value());
      },
      ignoreValidators: 'none',
    },
  },
);
```

Используйте `'none'`, когда у формы есть async-валидаторы (например, проверка доступности имени пользователя) и нужно, чтобы вся валидация завершилась перед отправкой. Используйте `'all'` для сценариев сохранения черновика, где нужно сохранять данные независимо от состояния валидации.

## Ручная отправка с `submit()` {#manual-submission-with-submit}

Директива `FormRoot` — самый распространённый способ запустить отправку, но можно также вызвать `submit()` напрямую. Это полезно для многошаговых мастеров, автосохранения или запуска отправки извне элемента формы.

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, required, submit} from '@angular/forms/signals';

@Component({
  selector: 'app-contact',
  imports: [FormField],
  template: `
    <label>
      Name
      <input [formField]="contactForm.name" />
    </label>

    <label>
      Email
      <input type="email" [formField]="contactForm.email" />
    </label>

    <button (click)="onSave()">Save</button>
  `,
})
export class Contact {
  contactModel = signal({
    name: '',
    email: '',
  });

  contactForm = form(this.contactModel, (schemaPath) => {
    required(schemaPath.name);
    required(schemaPath.email);
  });

  async onSave() {
    // When calling `submit()` directly, you pass the action as the second argument
    // instead of configuring it in `FormOptions`.
    const success = await submit(this.contactForm, async (field) => {
      const result = await saveContact(field().value());
      if (result.ok) return;

      return {kind: 'serverError', message: 'Failed to save'};
    });

    if (success) {
      // Handle success — navigate, show confirmation, etc.
    }
  }
}
```

## Обработка побочных эффектов {#handling-side-effects}

Функция `submit()` возвращает `Promise<boolean>` — `true`, когда action завершается без ошибок, `false`, когда валидация не проходит или action возвращает ошибки. Используйте это для запуска побочных эффектов вроде навигации или уведомлений.

```ts
async onSave() {
  const success = await submit(this.contactForm, async (field) => {
    await saveContact(field().value());
  });

  if (success) {
    await this.router.navigate(['/confirmation']);
  }
}
```

Когда action производит данные, нужные побочному эффекту, например ID, сгенерированный сервером, обрабатывайте побочный эффект внутри action:

```ts
async onSave() {
  await submit(this.contactForm, async (field) => {
    const contact = await createContact(field().value());
    await this.router.navigate(['/confirmation', contact.id]);
  });
}
```

При использовании `FormRoot` побочные эффекты также идут внутри `action`, поскольку `FormRoot` вызывает `submit()` внутренне:

```ts
submission: {
  action: async (field) => {
    const result = await saveContact(field().value());
    if (result.ok) {
      await this.router.navigate(['/confirmation']);
      return;
    }

    return {kind: 'serverError', message: 'Failed to submit form'};
  },
}
```

## Параллельные отправки {#concurrent-submissions}

Когда отправка выполняется, последующие вызовы `submit()` для той же формы или любого из её родителей сразу возвращают `false` без выполнения action. Это предотвращает повторные отправки и побочные эффекты, если пользователь быстро запускает действие submit несколько раз.

## Следующие шаги {#next-steps}

Это руководство охватило отправку форм и обработку ошибок отправки. Связанные руководства исследуют другие аспекты Signal Forms:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/form-logic" title="Adding form logic" />
</docs-pill-row>
