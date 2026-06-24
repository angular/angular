# Получение значения элемента управления формы

Теперь, когда ваши формы настроены в Angular, следующий шаг — получить доступ к значениям из элементов управления формы.

Примечание: Узнайте больше
о [добавлении базового элемента управления формы в подробном руководстве](/guide/forms/reactive-forms#adding-a-basic-form-control).

В этом задании вы узнаете, как получить значение из поля ввода вашей формы.

<hr>

<docs-workflow>

<docs-step title="Отображение значения поля ввода в шаблоне">

Чтобы отобразить значение поля ввода в шаблоне, вы можете использовать синтаксис интерполяции `{{}}`, как и для любого
другого свойства класса компонента:

<docs-code language="angular-ts" highlight="[5]">
@Component({
  selector: 'app-user',
  template: `
    ...
    <p>Framework: {{ favoriteFramework }}</p>
    <label for="framework">
      Favorite Framework:
      <input id="framework" type="text" [(ngModel)]="favoriteFramework" />
    </label>
  `,
})
export class User {
  favoriteFramework = '';
}
</docs-code>

</docs-step>

<docs-step title="Получение значения поля ввода">

Когда вам нужно обратиться к значению поля ввода в классе компонента, вы можете сделать это, обратившись к свойству
класса с помощью синтаксиса `this`.

<docs-code language="angular-ts" highlight="[15]">
...
@Component({
  selector: 'app-user',
  template: `
    ...
    <button (click)="showFramework()">Show Framework</button>
  `,
  ...
})
export class User {
  favoriteFramework = '';
  ...

showFramework() {
alert(this.favoriteFramework);
}
}
</docs-code>

</docs-step>

</docs-workflow>

Отличная работа! Вы научились отображать значения полей ввода в шаблоне и получать к ним программный доступ.

Пришло время перейти к следующему способу управления формами в Angular: реактивным формам (reactive forms). Если вы
хотите узнать больше о формах на основе шаблонов (template-driven forms), пожалуйста, обратитесь
к [документации по формам Angular](guide/forms/template-driven-forms).
