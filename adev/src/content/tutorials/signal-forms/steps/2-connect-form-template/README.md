# Подключение формы к Шаблону {#connect-your-form-to-the-template}

Теперь необходимо подключить форму к Шаблону с помощью директивы `[formField]`. Это создаёт двустороннюю Привязку данных между моделью формы и элементами ввода.

В этом уроке вы узнаете, как:

- Импортировать директиву `FormField`
- Использовать директиву `[formField]` для привязки полей формы к элементам ввода
- Подключить текстовые поля и флажки к форме
- Отображать значения полей формы в Шаблоне

Давайте подключим Шаблон!

<hr />

<docs-workflow>

<docs-step title="Импортируйте директиву FormField">
Импортируйте директиву `FormField` из `@angular/forms/signals` и добавьте её в массив `imports` Компонента:

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

<docs-step title="Привяжите поле email">
В Шаблоне добавьте директиву `[formField]` к полю ввода email:

```html
<input type="email" [formField]="loginForm.email" />
```

Выражение `loginForm.email` обращается к полю email вашей формы.
</docs-step>

<docs-step title="Привяжите поле password">
Добавьте директиву `[formField]` к полю ввода пароля:

```html
<input type="password" [formField]="loginForm.password" />
```

</docs-step>

<docs-step title="Привяжите поле checkbox">
Добавьте директиву `[formField]` к полю ввода checkbox:

```html
<input type="checkbox" [formField]="loginForm.rememberMe" />
```

</docs-step>

<docs-step title="Отобразите значения формы">
Ниже формы есть раздел отладки для отображения текущих значений формы. Отобразите значение каждого поля с помощью `.value()`:

```angular-html
<p>Email: {{ loginForm.email().value() }}</p>
<p>Password: {{ loginForm.password().value() ? '••••••••' : '(empty)' }}</p>
<p>Remember me: {{ loginForm.rememberMe().value() ? 'Yes' : 'No' }}</p>
```

Значения полей формы являются Сигналами, поэтому отображаемые значения обновляются автоматически по мере ввода.
</docs-step>

</docs-workflow>

Отличная работа! Вы подключили форму к Шаблону и отобразили значения формы. Директива `[formField]` автоматически обрабатывает двустороннюю Привязку данных — при вводе Сигнал `loginModel` обновляется, а отображаемые значения немедленно обновляются.

Далее вы узнаете, [как добавить валидацию в форму](/tutorials/signal-forms/3-add-validation)!
