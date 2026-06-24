# Отображение ошибок валидации

Теперь, когда вы умеете валидировать форму, важно отображать ошибки валидации пользователям.

В этом уроке вы узнаете, как:

- Получать доступ к состоянию поля с помощью сигналов валидации
- Использовать `@if` для условного отображения ошибок
- Перебирать ошибки с помощью `@for`
- Показывать ошибки только после взаимодействия с пользователем

Давайте отобразим результаты валидации!

<hr />

<docs-workflow>

<docs-step title="Добавление отображения ошибок для поля email">
Под полем ввода email добавьте условное отображение ошибок. Ошибки будут показываться только в том случае, если поле невалидно и было затронуто (touched):

```html
<label>
  Email
  <input type="email" [field]="loginForm.email" />
</label>
@if (loginForm.email().invalid() && loginForm.email().touched()) {
  <div class="error">
    @for (error of loginForm.email().errors(); track error.kind) {
      <span>{{ error.message }}</span>
    }
  </div>
}
```

Вызов `loginForm.email()` обращается к сигналу состояния поля. Метод `invalid()` возвращает `true`, если валидация не
прошла, `touched()` возвращает `true` после взаимодействия пользователя с полем, а `errors()` предоставляет массив
ошибок валидации с соответствующими сообщениями.
</docs-step>

<docs-step title="Добавление отображения ошибок для поля пароля">
Под полем ввода пароля добавьте аналогичный код для отображения ошибок пароля:

```html
<label>
  Password
  <input type="password" [field]="loginForm.password" />
</label>
@if (loginForm.password().invalid() && loginForm.password().touched()) {
  <div class="error">
    @for (error of loginForm.password().errors(); track error.kind) {
      <span>{{ error.message }}</span>
    }
  </div>
}
```

</docs-step>

</docs-workflow>

Отлично! Вы добавили отображение ошибок в форму. Ошибки появляются только после взаимодействия пользователя с полем,
обеспечивая полезную обратную связь и не отвлекая внимание раньше времени.

Далее вы узнаете, [как обрабатывать отправку формы](/tutorials/signal-forms/5-add-submission)!
