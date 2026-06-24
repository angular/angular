# Валидация форм

Еще один распространенный сценарий при работе с формами — необходимость валидации (проверки) введенных данных, чтобы
гарантировать отправку корректной информации.

Примечание: Узнайте больше
о [валидации ввода формы в подробном руководстве](/guide/forms/reactive-forms#validating-form-input).

В этом упражнении вы узнаете, как валидировать формы с помощью реактивных форм.

<hr>

<docs-workflow>

<docs-step title="Импорт валидаторов">

Angular предоставляет набор инструментов для валидации. Чтобы воспользоваться ими, сначала обновите компонент,
импортировав `Validators` из `@angular/forms`.

<docs-code language="ts" highlight="[1]">
import {ReactiveFormsModule, Validators} from '@angular/forms';

@Component({...})
export class App {}
</docs-code>

</docs-step>

<docs-step title="Добавление валидации в форму">

В каждый `FormControl` можно передать `Validators`, которые вы хотите использовать для проверки значений этого контрола.
Например, если вы хотите сделать поле `name` в `profileForm` обязательным, используйте `Validators.required`.
Для поля `email` в нашей форме мы хотим убедиться, что оно не пустое и соответствует формату адреса электронной почты.
Этого можно достичь, объединив валидаторы `Validators.required` и `Validators.email` в массив.
Обновите `FormControl` для `name` и `email`:

```ts
profileForm = new FormGroup({
  name: new FormControl('', Validators.required),
  email: new FormControl('', [Validators.required, Validators.email]),
});
```

</docs-step>

<docs-step title="Проверка валидации формы в шаблоне">

Чтобы определить, валидна ли форма, класс `FormGroup` предоставляет свойство `valid`.
Вы можете использовать это свойство для динамической привязки атрибутов. Обновите кнопку отправки (`button`), чтобы она
была активна только при валидной форме.

```angular-html
<button type="submit" [disabled]="!profileForm.valid">Submit</button>
```

</docs-step>

</docs-workflow>

Теперь вы знаете основы того, как работает валидация с реактивными формами.

Отличная работа по изучению этих ключевых концепций работы с формами в Angular. Если вы хотите узнать больше,
обязательно обратитесь к [документации по формам Angular](guide/forms/form-validation).
