# Content projection с ng-content

TIP: Это руководство предполагает, что вы уже прочитали [Essentials Guide](essentials). Прочитайте его сначала, если вы новичок в Angular.

Часто нужно создавать компоненты, которые выступают контейнерами для разного типа контента. Например, вы можете захотеть создать пользовательский card-компонент:

```angular-ts
@Component({
  selector: 'custom-card',
  template: '<div class="card-shadow"> <!-- card content goes here --> </div>',
})
export class CustomCard {
  /* ... */
}
```

**Можно использовать элемент `<ng-content>` как placeholder, чтобы отметить, куда должен попасть контент**:

```angular-ts
@Component({
  selector: 'custom-card',
  template: '<div class="card-shadow"> <ng-content/> </div>',
})
export class CustomCard {
  /* ... */
}
```

TIP: `<ng-content>` работает похоже
на [нативный элемент `<slot>`](https://developer.mozilla.org/docs/Web/HTML/Element/slot),
но с некоторой Angular-специфичной функциональностью.

Когда вы используете компонент с `<ng-content>`, любые дочерние элементы host-элемента компонента
отрисовываются, или **проецируются**, в месте этого `<ng-content>`:

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
export class CustomCard {
  /* ... */
}
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

Angular называет любых дочерних элементов компонента, переданных таким образом, **content** этого компонента. Это
отличается от **view** компонента, который относится к элементам, определённым в шаблоне
компонента.

**Элемент `<ng-content>` — ни компонент, ни DOM-элемент**. Вместо этого это специальный
placeholder, который сообщает Angular, где отрисовывать контент. Компилятор Angular обрабатывает
все элементы `<ng-content>` на этапе сборки. Нельзя вставлять, удалять или изменять `<ng-content>` во
время выполнения. Нельзя добавлять директивы, стили или произвольные атрибуты к `<ng-content>`.

IMPORTANT: Не следует условно включать `<ng-content>` с `@if`, `@for` или `@switch`. Angular всегда
создаёт экземпляры и DOM-узлы для контента, отрисованного в placeholder `<ng-content>`, даже если
этот placeholder `<ng-content>` скрыт. Для условной отрисовки контента компонента
см. [Template fragments](api/core/ng-template).

## Несколько placeholder контента {#multiple-content-placeholders}

Angular поддерживает проецирование нескольких разных элементов в разные placeholder `<ng-content>`
на основе CSS-селектора. Расширяя пример card выше, можно создать два placeholder для
заголовка card и тела card, используя атрибут `select`:

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
    <ng-content select="card-title" />
    <div class="card-divider"></div>
    <ng-content select="card-body" />
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

Placeholder `<ng-content>` поддерживает те же CSS-селекторы,
что и [селекторы компонентов](guide/components/selectors).

Если включить один или несколько placeholder `<ng-content>` с атрибутом `select` и
один placeholder `<ng-content>` без атрибута `select`, последний захватывает все элементы, которые
не совпали с атрибутом `select`:

```angular-html
<!-- Component template -->
<div class="card-shadow">
  <ng-content select="card-title" />
  <div class="card-divider"></div>
  <!-- capture anything except "card-title" -->
  <ng-content />
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

Если компонент не включает placeholder `<ng-content>` без атрибута `select`, любые
элементы, которые не совпадают ни с одним из placeholder компонента, не отрисовываются в DOM.

## Fallback-контент {#fallback-content}

Angular может показывать _fallback-контент_ для placeholder `<ng-content>` компонента, если у этого компонента нет подходящего дочернего контента. Fallback-контент можно указать, добавив дочерний контент в сам элемент `<ng-content>`.

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

## Алиасинг контента для проекции {#aliasing-content-for-projection}

Angular поддерживает специальный атрибут `ngProjectAs`, который позволяет указать CSS-селектор на
любом элементе. Когда элемент с `ngProjectAs` проверяется против placeholder `<ng-content>`,
Angular сравнивает со значением `ngProjectAs` вместо идентичности элемента:

```angular-html
<!-- Component template -->
<div class="card-shadow">
  <ng-content select="card-title" />
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

## Ограничения {#caveats}

### Проецируемый контент живёт во view родителя {#projected-content-lives-in-the-parents-view}

Хотя проецируемый контент _отрисовывается_ внутри принимающего компонента, он по-прежнему принадлежит компоненту, который его объявил. Angular отслеживает его как часть view родителя, что имеет несколько побочных эффектов, о которых стоит знать.

**Change detection:** Проецируемый контент проверяется, когда _родитель_ запускает change detection. Если принимающий компонент использует `OnPush`, Angular может пропустить проверку собственного шаблона этого компонента — но не пропустит проецируемый контент, потому что он принадлежит родителю.

```angular-html
<!-- Parent template (default change detection) -->
<onpush-wrapper>
  <!-- Still checked on every parent cycle, OnPush doesn't help here -->
  <expensive-component />
</onpush-wrapper>
```

**Dependency injection:** Проецируемый контент получает зависимости из injector родителя, а не из `viewProviders` принимающего компонента. См. [Providers and viewProviders](guide/di/hierarchical-dependency-injection) для деталей.

### Некоторые библиотечные компоненты не поддерживают проецируемых детей {#some-library-components-dont-support-projected-children}

Определённые компоненты — menus, tabs, lists — используют `ContentChildren`, чтобы находить своих детей и настраивать поведение вроде клавиатурной навигации, управления фокусом или ARIA-атрибутов. Они написаны в предположении, что владеют детьми напрямую, поэтому проецирование внешнего контента в них обычно ломает вещи неочевидным образом.

Например, обёртка элементов `<mat-menu-item>` в дополнительный слой и проецирование их в `<mat-menu>` может незаметно сломать клавиатурную навигацию и поддержку screen reader. Query всё ещё находит элементы, но внутренняя настройка, делающая их интерактивными, может работать некорректно, когда элементы приходят из другого view-контекста.

Если библиотечный компонент управляет поведением своих детей, проверьте его документацию, прежде чем использовать content projection — это может быть не поддерживается.
