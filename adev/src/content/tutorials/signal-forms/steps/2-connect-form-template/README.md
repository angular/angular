# Подключите форму к шаблону

Теперь нужно связать форму с шаблоном через директиву `[formField]`. Она создаёт двустороннюю привязку данных между моделью формы и элементами ввода.

В этом уроке вы научитесь:

- импортировать директиву `FormField`;
- использовать `[formField]` для привязки полей формы к input;
- подключать текстовые поля и чекбоксы к форме;
- отображать значения полей формы в шаблоне.

Давайте подключим шаблон!

<hr />

<docs-workflow>

<docs-step title="Import the FormField directive">
Импортируйте директиву `FormField` из `@angular/forms/signals` и добавьте её в массив imports компонента:

```ts
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [FormField],
})
```

</docs-step>

<docs-step title="Bind the email field">
В шаблоне добавьте директиву `[formField]` к полю email:

```html
<input type="email" [formField]="loginForm.email" />
```

Выражение `loginForm.email` обращается к полю email вашей формы.
</docs-step>

<docs-step title="Bind the password field">
Добавьте директиву `[formField]` к полю password:

```html
<input type="password" [formField]="loginForm.password" />
```

</docs-step>

<docs-step title="Bind the checkbox field">
Добавьте директиву `[formField]` к чекбоксу:

```html
<input type="checkbox" [formField]="loginForm.rememberMe" />
```

</docs-step>

<docs-step title="Display the form values">
Под формой есть отладочная секция для текущих значений. Отобразите значение каждого поля через `.value()`:

```angular-html
<p>Email: {{ loginForm.email().value() }}</p>
<p>Password: {{ loginForm.password().value() ? '••••••••' : '(empty)' }}</p>
<p>Remember me: {{ loginForm.rememberMe().value() ? 'Yes' : 'No' }}</p>
```

Значения полей формы — это сигналы, поэтому отображаемые значения обновляются автоматически при вводе.
</docs-step>

</docs-workflow>

Отличная работа! Вы подключили форму к шаблону и отобразили значения. Директива `[formField]` автоматически обеспечивает двустороннюю привязку: при вводе обновляется сигнал `loginModel`, и отображаемые значения меняются сразу.

Далее — [как добавить валидацию в форму](/tutorials/signal-forms/3-add-validation)!
