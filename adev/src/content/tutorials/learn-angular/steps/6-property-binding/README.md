# Привязка свойства в Angular {#property-binding-in-angular}

Привязка свойства в Angular позволяет устанавливать значения для свойств HTML-элементов, Angular-Компонентов и многого другого.

Используйте Привязку свойства для динамического задания значений свойств и атрибутов. Вы можете переключать функции кнопки, программно задавать пути к изображениям и обмениваться значениями между Компонентами.

NOTE: Подробнее об [установке динамических свойств и атрибутов в основном руководстве](/essentials/templates#setting-dynamic-properties-and-attributes).

В этом упражнении вы научитесь использовать Привязку свойства в Шаблонах.

<hr />

Чтобы привязаться к атрибуту элемента, заключите имя атрибута в квадратные скобки. Пример:

```angular-html
<img alt="photo" [src]="imageURL" />
```

В этом примере значение атрибута `src` будет привязано к свойству класса `imageURL`. Какое бы значение ни имел `imageURL`, оно будет установлено как атрибут `src` тега `img`.

<docs-workflow>

<docs-step title="Добавьте свойство `isEditable`" header="app.ts" language="ts">
Обновите код в `app.ts`, добавив свойство `isEditable` в класс `App` с начальным значением `true`.

```ts {highlight:[2]}
export class App {
  isEditable = true;
}
```

</docs-step>

<docs-step title="Привяжите `contentEditable`" header="app.ts" language="ts">
Затем привяжите атрибут `contentEditable` элемента `div` к свойству `isEditable`, используя синтаксис <code aria-label="square brackets">[]</code>.

```angular-ts {highlight:[3]}
@Component({
  ...
  template: `<div [contentEditable]="isEditable"></div>`,
})
```

</docs-step>

</docs-workflow>

Теперь div доступен для редактирования. Отличная работа!

Привязка свойства — одна из многих мощных возможностей Angular. Для получения дополнительной информации изучите [документацию Angular](guide/templates/binding#css-class-and-style-property-bindings).
