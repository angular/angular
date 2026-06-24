# Реактивные формы

Если вы хотите управлять формами программно, а не полагаться исключительно на шаблон, ответом станут реактивные формы.

Примечание: Подробнее о [реактивных формах читайте в подробном руководстве](/guide/forms/reactive-forms).

В этом упражнении вы узнаете, как настраивать реактивные формы.

<hr>

<docs-workflow>

<docs-step title="Импорт модуля `ReactiveForms`">

В `app.ts` импортируйте `ReactiveFormsModule` из `@angular/forms` и добавьте его в массив `imports` компонента.

```angular-ts
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  template: `
    <form>
      <label>Name
        <input type="text" />
      </label>
      <label>Email
        <input type="email" />
      </label>
      <button type="submit">Submit</button>
    </form>
  `,
  imports: [ReactiveFormsModule],
})
```

</docs-step>

<docs-step title="Создание объекта `FormGroup` с FormControls">

Реактивные формы используют класс `FormControl` для представления элементов управления формы (например, полей ввода).
Angular предоставляет класс `FormGroup`, который объединяет элементы управления формы в удобный объект, упрощая работу с
большими формами для разработчиков.

Добавьте `FormControl` и `FormGroup` в импорт из `@angular/forms`, чтобы создать FormGroup для каждой формы со
свойствами `name` и `email` в качестве FormControls.

```ts
import {ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
...
export class App {
  profileForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
  });
}
```

</docs-step>

<docs-step title="Связывание FormGroup и FormControls с формой">

Каждый `FormGroup` должен быть прикреплен к форме с помощью директивы `[formGroup]`.

Кроме того, каждый `FormControl` можно прикрепить с помощью директивы `formControlName` и назначить соответствующему
свойству. Обновите шаблон, добавив следующий код формы:

```angular-html
<form [formGroup]="profileForm">
  <label>
    Name
    <input type="text" formControlName="name" />
  </label>
  <label>
    Email
    <input type="email" formControlName="email" />
  </label>
  <button type="submit">Submit</button>
</form>
```

</docs-step>

<docs-step title="Обработка обновлений формы">

Когда вам нужно получить данные из `FormGroup`, это можно сделать, обратившись к значению (value) `FormGroup`. Обновите
`template`, чтобы отобразить значения формы:

```angular-html
...
<h2>Profile Form</h2>
<p>Name: {{ profileForm.value.name }}</p>
<p>Email: {{ profileForm.value.email }}</p>
```

</docs-step>

<docs-step title="Доступ к значениям FormGroup">
Добавьте в класс компонента новый метод `handleSubmit`, который вы позже будете использовать для обработки отправки формы.
Этот метод будет отображать значения из формы; вы можете получить доступ к значениям через FormGroup.

В классе компонента добавьте метод `handleSubmit()` для обработки отправки формы.

<docs-code language="ts">
handleSubmit() {
  alert(
    this.profileForm.value.name + ' | ' + this.profileForm.value.email
  );
}
</docs-code>
</docs-step>

<docs-step title="Добавление `ngSubmit` к форме">
У вас есть доступ к значениям формы, теперь пришло время обработать событие отправки и использовать метод `handleSubmit`.
В Angular для этой цели есть специальный обработчик событий под названием `ngSubmit`. Обновите элемент формы, чтобы вызывать метод `handleSubmit` при отправке формы.

<docs-code language="angular-html" highlight="[3]">
<form
  [formGroup]="profileForm"
  (ngSubmit)="handleSubmit()">
</docs-code>

</docs-step>

</docs-workflow>

Вот так просто вы научились работать с реактивными формами в Angular.

Отличная работа с этим упражнением. Продолжайте обучение, чтобы узнать о валидации форм.
