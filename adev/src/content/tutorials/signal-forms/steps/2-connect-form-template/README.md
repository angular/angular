# Подключите форму к шаблону

Теперь вам нужно подключить форму к шаблону, используя директиву `[field]`. Это создает двустороннюю привязку данных
между моделью формы и элементами ввода.

В этом уроке вы узнаете, как:

- Импортировать директиву `Field`
- Использовать директиву `[field]` для привязки полей формы к элементам ввода
- Подключить текстовые поля и чекбоксы к форме
- Отобразить значения полей формы в шаблоне

Давайте подключим шаблон!

<hr />

<docs-workflow>

<docs-step title="Импорт директивы Field">
Импортируйте директиву `Field` из `@angular/forms/signals` и добавьте её в массив imports вашего компонента:

```ts
import { form, Field } from '@angular/forms/signals';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Field],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

</docs-step>

<docs-step title="Привязка поля email">
В вашем шаблоне добавьте директиву `[field]` к полю ввода email:

```html
<input type="email" [field]="loginForm.email" />
```

Выражение `loginForm.email` обращается к полю email вашей формы.
</docs-step>

<docs-step title="Привязка поля пароля">
Добавьте директиву `[field]` к полю ввода пароля:

```html
<input type="password" [field]="loginForm.password" />
```

</docs-step>

<docs-step title="Привязка поля чекбокса">
Добавьте директиву `[field]` к чекбоксу:

```html
<input type="checkbox" [field]="loginForm.rememberMe" />
```

</docs-step>

<docs-step title="Отображение значений формы">
Под формой находится отладочная секция для отображения текущих значений формы. Выведите значение каждого поля, используя `.value()`:

```html
<p>Email: {{ loginForm.email().value() }}</p>
<p>Password: {{ loginForm.password().value() ? '••••••••' : '(empty)' }}</p>
<p>Remember me: {{ loginForm.rememberMe().value() ? 'Yes' : 'No' }}</p>
```

Значения полей формы — это сигналы, поэтому отображаемые данные обновляются автоматически по мере ввода.
</docs-step>

</docs-workflow>

Отличная работа! Вы подключили форму к шаблону и отобразили значения формы. Директива `[field]` автоматически
обрабатывает двустороннюю привязку данных — по мере ввода сигнал `loginModel` обновляется, и отображаемые значения
обновляются немедленно.

Далее вы узнаете, [как добавить валидацию в вашу форму](/tutorials/signal-forms/3-add-validation)!
