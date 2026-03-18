# Привязка свойств в Angular

Привязка свойств в Angular позволяет задавать значения для свойств HTML-элементов, компонентов Angular и не только.

Используйте привязку свойств для динамического задания значений свойств и атрибутов. С её помощью можно переключать состояние кнопок, программно задавать пути к изображениям, передавать значения между компонентами и многое другое.

Примечание: Подробнее
об [установке динамических свойств и атрибутов читайте в руководстве по основам](/essentials/templates#setting-dynamic-properties-and-attributes).

В этом упражнении вы узнаете, как использовать привязку свойств в шаблонах.

<hr />

Чтобы выполнить привязку к атрибуту элемента, заключите имя атрибута в квадратные скобки. Вот пример:

```angular-html
<img alt="photo" [src]="imageURL" />
```

В этом примере значение атрибута `src` будет привязано к свойству класса `imageURL`. Какое бы значение ни имело `imageURL`, оно будет установлено как атрибут `src` тега `img`.

<docs-workflow>

<docs-step title="Add a property called `isEditable`" header="app.ts" language="ts">
Обновите код в `app.ts`, добавив в класс `App` свойство `isEditable` с начальным значением `true`.

```ts {highlight:[2]}
export class App {
  isEditable = true;
}
```

</docs-step>

<docs-step title="Bind to `contentEditable`" header="app.ts" language="ts">
Далее привяжите атрибут `contentEditable` элемента `div` к свойству `isEditable`, используя синтаксис <code aria-label="square brackets">[]</code>.

```angular-ts {highlight:[3]}
@Component({
  ...
  template: `<div [contentEditable]="isEditable"></div>`,
})
```

</docs-step>

</docs-workflow>

Теперь `div` доступен для редактирования. Отличная работа 👍

Привязка свойств — одна из многих мощных возможностей Angular. Если вы хотите узнать больше, ознакомьтесь с [документацией Angular](guide/templates/binding#css-class-and-style-property-bindings).
