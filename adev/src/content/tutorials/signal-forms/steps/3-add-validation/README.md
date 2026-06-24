# Добавление валидации в форму

Добавление валидации в форму критически важно для того, чтобы пользователи вводили корректные данные. Signal Forms
использует валидаторы внутри функции схемы, которую вы передаете в функцию `form()`.

В этом уроке вы узнаете, как:

- Импортировать встроенные валидаторы
- Определить функцию схемы для вашей формы
- Применить валидаторы к конкретным полям с пользовательскими сообщениями об ошибках

Давайте добавим валидацию!

<hr />

<docs-workflow>

<docs-step title="Импорт валидаторов">
Импортируйте валидаторы `required` и `email` из `@angular/forms/signals`:

```ts
import { form, Field, required, email } from '@angular/forms/signals';
```

</docs-step>

<docs-step title="Добавление функции схемы в форму">
Обновите вызов `form()`, добавив функцию схемы в качестве второго параметра. Функция схемы принимает параметр `fieldPath`, который позволяет получить доступ к каждому полю:

```ts
loginForm = form(this.loginModel, (fieldPath) => {
  // Validators will go here
});
```

</docs-step>

<docs-step title="Добавление валидации для поля email">
Внутри функции схемы добавьте валидацию для поля email. Используйте валидаторы `required()` и `email()`:

```ts
loginForm = form(this.loginModel, (fieldPath) => {
  required(fieldPath.email, { message: 'Email is required' });
  email(fieldPath.email, { message: 'Enter a valid email address' });
});
```

Опция `message` предоставляет пользовательские сообщения об ошибках.
</docs-step>

<docs-step title="Добавление валидации для поля пароля">
Добавьте валидацию для поля пароля, используя валидатор `required()`:

```ts
loginForm = form(this.loginModel, (fieldPath) => {
  required(fieldPath.email, { message: 'Email is required' });
  email(fieldPath.email, { message: 'Enter a valid email address' });
  required(fieldPath.password, { message: 'Password is required' });
});
```

</docs-step>

</docs-workflow>

Отлично! Вы добавили валидацию в свою форму. Валидаторы запускаются автоматически, когда пользователи взаимодействуют с
формой. Если валидация не проходит, состояние поля будет отражать ошибки.

Далее вы узнаете, [как отображать ошибки валидации в шаблоне](/tutorials/signal-forms/4-display-errors)!
