# Подключение формы к шаблону {#connect-your-form-to-the-template}

Теперь нужно подключить форму к шаблону с помощью директивы `[formField]`. Это создаёт двустороннюю привязку данных между моделью формы и элементами ввода.

В этом уроке вы узнаете, как:

- Импортировать директиву `FormField`
- Использовать директиву `[formField]` для привязки полей формы к элементам ввода
- Подключить текстовые поля и чекбоксы к вашей форме
- Отображать значения полей формы в шаблоне

Давайте свяжем шаблон!

<hr />

<docs-workflow>

<docs-step title="Import the FormField directive">
Импортируйте директиву `FormField` из `@angular/forms/signals` и добавьте её в массив imports вашего компонента:

```ts
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

</docs-step>

<docs-step title="Bind the email field">
В вашем шаблоне добавьте директиву `[formField]` к полю ввода email:

```html
<input type="email" [formField]="loginForm.email" />
```

Выражение `loginForm.email` обращается к полю email вашей формы.
</docs-step>

<docs-step title="Bind the password field">
Добавьте директиву `[formField]` к полю ввода пароля:

```html
<input type="password" [formField]="loginForm.password" />
```

</docs-step>

<docs-step title="Bind the checkbox field">
Добавьте директиву `[formField]` к полю чекбокса:

```html
<input type="checkbox" [formField]="loginForm.rememberMe" />
```

</docs-step>

<docs-step title="Display the form values">
Ниже формы есть раздел отладки для отображения текущих значений формы. Отобразите значение каждого поля с помощью `.value()`:

```angular-html
<p>Email: {{ loginForm.email().value() }}</p>
<p>Password: {{ loginForm.password().value() ? '••••••••' : '(empty)' }}</p>
<p>Remember me: {{ loginForm.rememberMe().value() ? 'Yes' : 'No' }}</p>
```

Значения полей формы являются сигналами, поэтому отображаемые значения обновляются автоматически по мере ввода.
</docs-step>

</docs-workflow>

Отличная работа! Вы подключили форму к шаблону и отобразили значения формы. Директива `[formField]` автоматически обрабатывает двустороннюю привязку данных — по мере ввода сигнал `loginModel` обновляется, и отображаемые значения обновляются немедленно.

Далее вы узнаете, [как добавить валидацию в форму](/tutorials/signal-forms/3-add-validation)!
