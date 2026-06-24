# Настройка модели формы

Каждая форма на сигналах (Signal Form) начинается с модели данных формы — сигнала, который определяет структуру ваших
данных и хранит данные формы.

В этом уроке вы узнаете, как:

- Определить интерфейс TypeScript для данных формы
- Создать сигнал для хранения значений формы
- Использовать функцию `form()` для создания формы на сигналах

Давайте заложим основу для нашей формы входа!

<hr />

<docs-workflow>

<docs-step title="Определение интерфейса LoginData">
Создайте интерфейс TypeScript, определяющий структуру данных вашей формы входа. Форма будет содержать:

- Поле `email` (строка)
- Поле `password` (строка)
- Поле `rememberMe` (логическое значение)

```ts
interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}
```

Добавьте этот интерфейс над декоратором `@Component`.
</docs-step>

<docs-step title="Импорт signal и form">
Импортируйте функцию `signal` из `@angular/core` и функцию `form` из `@angular/forms/signals`:

```ts
import { Component, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
```

</docs-step>

<docs-step title="Создание сигнала модели формы">
В классе компонента создайте сигнал `loginModel` с начальными значениями. Используйте интерфейс `LoginData` в качестве параметра типа:

```ts
loginModel = signal<LoginData>({
  email: '',
  password: '',
  rememberMe: false,
});
```

Начальные значения задаются как пустые строки для текстовых полей и `false` для чекбокса.
</docs-step>

<docs-step title="Создание формы">
Теперь создайте форму, передав сигнал модели в функцию `form()`:

```ts
loginForm = form(this.loginModel);
```

Функция `form()` создает форму на основе вашей модели, предоставляя доступ к состоянию полей и валидации.
</docs-step>

</docs-workflow>

Отлично! Вы настроили модель формы. Сигнал `loginModel` хранит данные формы, а `loginForm` предоставляет доступ к
каждому полю с соблюдением строгой типизации.

Далее вы узнаете, [как подключить форму к шаблону](/tutorials/signal-forms/2-connect-form-template)!
