# Проекция контента с помощью ng-content

TIP: В этом руководстве предполагается, что вы уже ознакомились с [Руководством по основам](essentials). Прочитайте его
в первую очередь, если вы новичок в Angular.

Часто возникает необходимость создавать компоненты, которые действуют как контейнеры для различных типов контента.
Например, вы можете захотеть создать пользовательский компонент карточки:

```angular-ts
@Component({
  selector: 'custom-card',
  template: '<div class="card-shadow"> <!-- card content goes here --> </div>',
})
export class CustomCard {/* ... */}
```

**Вы можете использовать элемент `<ng-content>` в качестве заполнителя, чтобы отметить место, где должен располагаться
контент**:

```angular-ts
@Component({
  selector: 'custom-card',
  template: '<div class="card-shadow"> <ng-content/> </div>',
})
export class CustomCard {/* ... */}
```

TIP: `<ng-content>` работает аналогично [нативному элементу
`<slot>`](https://developer.mozilla.org/docs/Web/HTML/Element/slot), но с некоторой специфичной для Angular
функциональностью.

Когда вы используете компонент с `<ng-content>`, любые дочерние элементы хост-элемента компонента рендерятся (или \*
\*проецируются\*\*) в месте расположения этого `<ng-content>`:

```angular-ts
// Component source
@Component({
  selector: 'custom-card',
  template: `
    <div class="card-shadow">
      <ng-content />
    </div>
  `,
})
export class CustomCard {/* ... */}
```

```angular-html
<!-- Using the component -->
<custom-card>
  <p>This is the projected content</p>
</custom-card>
```

```angular-html
<!-- The rendered DOM -->
<custom-card>
  <div class="card-shadow">
    <p>This is the projected content</p>
  </div>
</custom-card>
```

Angular называет любые дочерние элементы компонента, переданные таким образом, **контентом** этого компонента. Это
отличается от **представления (view)** компонента, которое относится к элементам, определенным в шаблоне компонента.

**Элемент `<ng-content>` не является ни компонентом, ни DOM-элементом**. Вместо этого, это специальный заполнитель,
который сообщает Angular, где нужно отрисовать контент. Компилятор Angular обрабатывает все элементы `<ng-content>` во
время сборки. Вы не можете вставлять, удалять или изменять `<ng-content>` во время выполнения. Вы не можете добавлять
директивы, стили или произвольные атрибуты к `<ng-content>`.

IMPORTANT: Не следует условно включать `<ng-content>` с помощью `@if`, `@for` или `@switch`. Angular всегда создает
экземпляры и DOM-узлы для контента, отрисованного в заполнителе `<ng-content>`, даже если этот заполнитель
`<ng-content>` скрыт. Для условного рендеринга контента компонента см. [Фрагменты шаблона](api/core/ng-template).

## Множественные заполнители контента

Angular поддерживает проекцию нескольких различных элементов в разные заполнители `<ng-content>` на основе
CSS-селектора. Расширяя пример с карточкой выше, вы можете создать два заполнителя: для заголовка карточки и для тела
карточки, используя атрибут `select`:

```angular-ts
@Component({
  selector: 'card-title',
  template: `<ng-content>card-title</ng-content>`,
})
export class CardTitle {}

@Component({
  selector: 'card-body',
  template: `<ng-content>card-body</ng-content>`,
})
export class CardBody {}
```

```angular-ts
<!-- Component template -->
@Component({
  selector: 'custom-card',
  template: `
  <div class="card-shadow">
    <ng-content select="card-title"></ng-content>
    <div class="card-divider"></div>
    <ng-content select="card-body"></ng-content>
  </div>
  `,
})
export class CustomCard {}
```

```angular-ts
<!-- Using the component -->
@Component({
  selector: 'app-root',
  imports: [CustomCard, CardTitle, CardBody],
  template: `
    <custom-card>
      <card-title>Hello</card-title>
      <card-body>Welcome to the example</card-body>
    </custom-card>
`,
})
export class App {}
```

```angular-html
<!-- Rendered DOM -->
<custom-card>
  <div class="card-shadow">
    <card-title>Hello</card-title>
    <div class="card-divider"></div>
    <card-body>Welcome to the example</card-body>
  </div>
</custom-card>
```

Заполнитель `<ng-content>` поддерживает те же CSS-селекторы, что и [селекторы компонентов](guide/components/selectors).

Если вы включите один или несколько заполнителей `<ng-content>` с атрибутом `select` и один заполнитель `<ng-content>`
без атрибута `select`, последний захватит все элементы, которые не соответствовали ни одному атрибуту `select`:

```angular-html
<!-- Component template -->
<div class="card-shadow">
  <ng-content select="card-title"></ng-content>
  <div class="card-divider"></div>
  <!-- capture anything except "card-title" -->
  <ng-content></ng-content>
</div>
```

```angular-html
<!-- Using the component -->
<custom-card>
  <card-title>Hello</card-title>
  <img src="..." />
  <p>Welcome to the example</p>
</custom-card>
```

```angular-html
<!-- Rendered DOM -->
<custom-card>
  <div class="card-shadow">
    <card-title>Hello</card-title>
    <div class="card-divider"></div>
    <img src="..." />
    <p>Welcome to the example</p>
  </div>
</custom-card>
```

Если компонент не содержит заполнитель `<ng-content>` без атрибута `select`, любые элементы, которые не соответствуют ни
одному из заполнителей компонента, не будут отрисованы в DOM.

## Резервный контент

Angular может показывать _резервный контент_ для заполнителя `<ng-content>` компонента, если у этого компонента нет
соответствующего дочернего контента. Вы можете указать резервный контент, добавив дочерний контент непосредственно
внутрь элемента `<ng-content>`.

```angular-html
<!-- Component template -->
<div class="card-shadow">
  <ng-content select="card-title">Default Title</ng-content>
  <div class="card-divider"></div>
  <ng-content select="card-body">Default Body</ng-content>
</div>
```

```angular-html
<!-- Using the component -->
<custom-card>
  <card-title>Hello</card-title>
  <!-- No card-body provided -->
</custom-card>
```

```angular-html
<!-- Rendered DOM -->
<custom-card>
  <div class="card-shadow">
    <card-title>Hello</card-title>
    <div class="card-divider"></div>
    Default Body
  </div>
</custom-card>
```

## Псевдонимы контента для проекции

Angular поддерживает специальный атрибут `ngProjectAs`, который позволяет указать CSS-селектор для любого элемента.
Когда элемент с `ngProjectAs` проверяется на соответствие заполнителю `<ng-content>`, Angular сравнивает значение
`ngProjectAs` вместо идентификатора самого элемента:

```angular-html
<!-- Component template -->
<div class="card-shadow">
  <ng-content select="card-title"></ng-content>
  <div class="card-divider"></div>
  <ng-content />
</div>
```

```angular-html
<!-- Using the component -->
<custom-card>
  <h3 ngProjectAs="card-title">Hello</h3>

  <p>Welcome to the example</p>
</custom-card>
```

```angular-html
<!-- Rendered DOM -->
<custom-card>
  <div class="card-shadow">
    <h3>Hello</h3>
    <div class="card-divider"></div>
    <p>Welcome to the example</p>
  </div>
</custom-card>
```

`ngProjectAs` поддерживает только статические значения и не может быть привязан к динамическим выражениям.
