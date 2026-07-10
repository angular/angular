# Переменные в шаблонах

В шаблонах Angular есть два типа объявлений переменных: локальные переменные шаблона и template reference variables.

HELPFUL: В этом руководстве «шаблон» не означает весь HTML-файл шаблона. Имеется в виду только конкретная конструкция шаблона или выражение внутри файла.

## Локальные переменные шаблона с `@let` {#local-template-variables-with-let}

Синтаксис `@let` Angular позволяет определить локальную переменную и переиспользовать её в шаблоне — подобно [синтаксису JavaScript `let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let).

### Использование `@let` {#using-let}

Используйте `@let`, чтобы объявить переменную, значение которой основано на результате выражения шаблона. Angular автоматически поддерживает значение переменной в актуальном состоянии с заданным выражением — подобно [привязкам](/guide/templates/binding).

```angular-html
@let name = user.name;
@let greeting = 'Hello, ' + name;
@let data = data$ | async;
@let pi = 3.14159;
@let coordinates = {x: 50, y: 100};
@let longExpression =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit ' +
  'sed do eiusmod tempor incididunt ut labore et dolore magna ' +
  'Ut enim ad minim veniam...';
```

Каждый блок `@let` может объявить ровно одну переменную. Нельзя объявить несколько переменных в одном блоке через запятую.

### Ссылка на значение `@let` {#referencing-the-value-of-let}

После объявления переменной через `@let` её можно переиспользовать в том же шаблоне:

```angular-html
@let user = user$ | async;

@if (user) {
  <h1>Hello, {{ user.name }}</h1>
  <user-avatar [photo]="user.photo" />

  <ul>
    @for (snack of user.favoriteSnacks; track snack.id) {
      <li>{{ snack.name }}</li>
    }
  </ul>

  <button (click)="update(user)">Update profile</button>
}
```

### Assignability {#assignability}

Ключевое отличие `@let` от JavaScript `let` — `@let` нельзя переназначить после объявления. Однако Angular автоматически поддерживает значение переменной в актуальном состоянии с заданным выражением.

```angular-html
@let value = 1;

<!-- Invalid - This does not work! -->
<button (click)="value = value + 1">Increment the value</button>
```

### Область видимости переменной {#variable-scope}

Объявления `@let` ограничены текущим view и его потомками. Angular создаёт новый view на границах компонентов и везде, где шаблон может содержать динамический контент — блоки control flow, блоки `@defer` или structural directives.

Поскольку объявления `@let` не поднимаются (не hoisted), к ним **нельзя** обратиться из родительских views или siblings:

```angular-html
@let topLevel = value;

<div>
  @let insideDiv = value;
</div>

<!-- Valid -->
{{ topLevel }}
<!-- Valid -->
{{ insideDiv }}

@if (condition) {
  <!-- Valid -->
  {{ topLevel + insideDiv }}

  @let nested = value;

  @if (condition) {
    <!-- Valid -->
    {{ topLevel + insideDiv + nested }}
  }
}

<!-- Error, not hoisted from @if -->
{{ nested }}
```

### Полный синтаксис {#full-syntax}

Синтаксис `@let` формально определён так:

- Ключевое слово `@let`.
- За ним один или более пробельных символов, не включая новые строки.
- За ним валидное JavaScript-имя и ноль или более пробельных символов.
- За ним символ = и ноль или более пробельных символов.
- За ним выражение Angular, которое может быть многострочным.
- Завершается символом `;`.

## Template reference variables {#template-reference-variables}

Template reference variables дают способ объявить переменную, ссылающуюся на значение из элемента в шаблоне.

Template reference variable может ссылаться на:

- DOM-элемент внутри шаблона (включая [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements))
- Angular-компонент или директиву
- [TemplateRef](/api/core/TemplateRef) из [ng-template](/api/core/ng-template)

Template reference variables можно использовать, чтобы читать информацию из одной части шаблона в другой части того же шаблона.

### Объявление template reference variable {#declaring-a-template-reference-variable}

Переменную на элементе в шаблоне можно объявить, добавив атрибут, начинающийся с символа решётки (`#`), за которым следует имя переменной.

```angular-html
<!-- Create a template reference variable named "taskInput", referring to the HTMLInputElement. -->
<input #taskInput placeholder="Enter task name" />
```

### Назначение значений template reference variables {#assigning-values-to-template-reference-variables}

Angular назначает значение переменным шаблона на основе элемента, на котором переменная объявлена.

Если переменная объявлена на Angular-компоненте, переменная ссылается на экземпляр компонента.

```angular-html
<!-- The `startDate` variable is assigned the instance of `MyDatepicker`. -->
<my-datepicker #startDate />
```

Если переменная объявлена на элементе `<ng-template>`, переменная ссылается на экземпляр TemplateRef, представляющий шаблон. Подробнее — в [How Angular uses the asterisk, \*, syntax](/guide/directives/structural-directives#structural-directive-shorthand) в [Structural directives](/guide/directives/structural-directives).

```angular-html
<!-- The `myFragment` variable is assigned the `TemplateRef` instance corresponding to this template fragment. -->
<ng-template #myFragment>
  <p>This is a template fragment</p>
</ng-template>
```

Если переменная объявлена на любом другом отображаемом элементе, переменная ссылается на экземпляр `HTMLElement`.

```angular-html
<!-- The "taskInput" variable refers to the HTMLInputElement instance. -->
<input #taskInput placeholder="Enter task name" />
```

#### Назначение ссылки на Angular-директиву {#assigning-a-reference-to-an-angular-directive}

У директив Angular может быть свойство `exportAs`, определяющее имя, по которому на директиву можно ссылаться в шаблоне:

```angular-ts
@Directive({
  selector: '[dropZone]',
  exportAs: 'dropZone',
})
export class DropZone {
  /* ... */
}
```

Когда вы объявляете переменную шаблона на элементе, можно назначить этой переменной экземпляр директивы, указав это имя `exportAs`:

```angular-html
<!-- The `firstZone` variable refers to the `DropZone` directive instance. -->
<section dropZone #firstZone="dropZone">...</section>
```

Нельзя ссылаться на директиву, которая не указывает имя `exportAs`.

### Использование template reference variables с queries {#using-template-reference-variables-with-queries}

Помимо использования переменных шаблона для чтения значений из другой части того же шаблона, этот стиль объявления переменных можно использовать, чтобы «пометить» элемент для [queries компонентов и директив](/guide/components/queries).

Когда нужно сделать query конкретного элемента в шаблоне, можно объявить переменную шаблона на этом элементе, а затем запросить элемент по имени переменной.

```angular-html
<input #description value="Original description" />
```

```angular-ts
@Component({
  /* ... */,
  template: `<input #description value="Original description">`,
})
export class AppComponent {
  // Query for the input element based on the template variable name.
  @ViewChild('description') input: ElementRef | undefined;
}
```

Подробнее о queries — в [Referencing children with queries](/guide/components/queries).

### Область видимости переменных шаблона {#template-variable-scope}

Как и переменные в коде JavaScript или TypeScript, переменные шаблона ограничены шаблоном, который их объявляет.

Аналогично, [Structural directives](guide/directives/structural-directives) или объявления `<ng-template>` создают новую вложенную область шаблона — подобно тому, как statements control flow JavaScript вроде `if` и `for` создают новые лексические области. К переменным шаблона внутри одной из этих structural directives нельзя обратиться извне её границ.

HELPFUL: Определяйте переменную только один раз в шаблоне, чтобы runtime-значение оставалось предсказуемым.

#### Доступ во вложенном шаблоне {#accessing-in-a-nested-template}

Внутренний шаблон может обращаться к переменным шаблона, которые определяет внешний шаблон.

В следующем примере изменение текста в `<input>` меняет значение в `<span>`, потому что Angular сразу обновляет изменения через переменную шаблона `ref1`.

```html
<input #ref1 type="text" [(ngModel)]="firstExample" />

<span *ngIf="true">Value: {{ ref1.value }}</span>
```

В этом случае `*ngIf` на `<span>` создаёт новую область шаблона, которая включает переменную `ref1` из родительской области.

Однако доступ к переменной шаблона из дочерней области в родительском шаблоне не работает:

```html {avoid}
<input *ngIf="true" #ref2 type="text" [(ngModel)]="secondExample" />

<span>Value: {{ ref2?.value }}</span>
```

Здесь `ref2` объявлена в дочерней области, созданной `*ngIf`, и недоступна из родительского шаблона.
