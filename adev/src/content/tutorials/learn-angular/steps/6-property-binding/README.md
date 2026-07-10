# Привязка свойств в Angular

Привязка свойств (Property binding) в Angular позволяет устанавливать значения для свойств HTML-элементов, компонентов
Angular и многого другого.

Используйте привязку свойств для динамической установки значений свойств и атрибутов. Вы можете выполнять такие
действия, как переключение функций кнопок, программная установка путей к изображениям и обмен значениями между
компонентами.

Примечание: Подробнее
об [установке динамических свойств и атрибутов читайте в руководстве по основам](/essentials/templates#setting-dynamic-properties-and-attributes).

В этом упражнении вы узнаете, как использовать привязку свойств в шаблонах.

<hr />

Чтобы выполнить привязку к атрибуту элемента, заключите имя атрибута в квадратные скобки. Вот пример:

```angular-html
<img alt="photo" [src]="imageURL">
```

В этом примере значение атрибута `src` будет привязано к свойству класса `imageURL`. Какое бы значение ни имело свойство
`imageURL`, оно будет установлено в качестве атрибута `src` тега `img`.

<docs-workflow>

<docs-step title="Add a property called `isEditable`" header="app.ts" language="ts">
Обновите код в `app.ts`, добавив в класс `App` свойство `isEditable` с начальным значением `true`.

<docs-code highlight="[2]">
export class App {
  isEditable = true;
}
</docs-code>
</docs-step>

<docs-step title="Bind to `contentEditable`" header="app.ts" language="ts">
Далее привяжите атрибут `contentEditable` элемента `div` к свойству `isEditable`, используя синтаксис <code aria-label="квадратные скобки">[]</code>.

<docs-code highlight="[3]" language="angular-ts">
@Component({
  ...
  template: `<div [contentEditable]="isEditable"></div>`,
})
</docs-code>
</docs-step>

</docs-workflow>

Теперь div стал редактируемым. Отличная работа 👍

Привязка свойств — одна из многих мощных возможностей Angular. Если вы хотите узнать больше, ознакомьтесь
с [документацией Angular](guide/templates/property-binding).
