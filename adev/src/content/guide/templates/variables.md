# Переменные в шаблонах {#variables-in-templates}

Angular имеет два типа объявлений переменных в шаблонах: локальные переменные шаблона и ссылочные переменные шаблона.

## Локальные переменные шаблона с `@let` {#local-template-variables-with-let}

Синтаксис `@let` в Angular позволяет определить локальную переменную и повторно использовать ее в шаблоне, аналогично [синтаксису `let` в JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let).

### Использование `@let` {#using-let}

Используйте `@let` для объявления переменной, значение которой основано на результате выражения шаблона. Angular автоматически поддерживает значение переменной в актуальном состоянии в соответствии с заданным выражением, аналогично [привязкам](/guide/templates/binding).

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

### Использование значения `@let` {#referencing-the-value-of-let}

После объявления переменной с помощью `@let` ее можно повторно использовать в том же шаблоне:

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

### Присваиваемость {#assignability}

Ключевое отличие `@let` от `let` в JavaScript заключается в том, что `@let` не может быть переприсвоен после объявления. Однако Angular автоматически поддерживает значение переменной в актуальном состоянии в соответствии с заданным выражением.

```angular-html
@let value = 1;

<!-- Invalid - This does not work! -->
<button (click)="value = value + 1">Increment the value</button>
```

### Область видимости переменных {#variable-scope}

Объявления `@let` имеют область видимости текущего представления и его потомков. Angular создает новое представление на границах компонентов и везде, где шаблон может содержать динамический контент, например в блоках потока управления, блоках `@defer` или структурных директивах.

Поскольку объявления `@let` не поднимаются (not hoisted), они **не доступны** из родительских представлений или соседних элементов:

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

Синтаксис `@let` формально определяется как:

- Ключевое слово `@let`.
- Затем один или более пробельных символов, не включая переводы строк.
- Затем допустимое имя JavaScript и ноль или более пробельных символов.
- Затем символ `=` и ноль или более пробельных символов.
- Затем выражение Angular, которое может быть многострочным.
- Завершается символом `;`.

## Ссылочные переменные шаблона {#template-reference-variables}

Ссылочные переменные шаблона позволяют объявить переменную, которая ссылается на значение элемента в шаблоне.

Ссылочная переменная шаблона может ссылаться на:

- DOM-элемент в шаблоне (включая [пользовательские элементы](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements))
- Компонент или директиву Angular
- [TemplateRef](/api/core/TemplateRef) из [ng-template](/api/core/ng-template)

Ссылочные переменные шаблона можно использовать для чтения информации из одной части шаблона в другой части того же шаблона.

### Объявление ссылочной переменной шаблона {#declaring-a-template-reference-variable}

Переменная объявляется на элементе в шаблоне путем добавления атрибута, начинающегося с символа решетки (`#`), за которым следует имя переменной.

```angular-html
<!-- Create a template reference variable named "taskInput", referring to the HTMLInputElement. -->
<input #taskInput placeholder="Enter task name" />
```

### Присваивание значений ссылочным переменным шаблона {#assigning-values-to-template-reference-variables}

Angular присваивает значение переменным шаблона в зависимости от элемента, на котором объявлена переменная.

Если переменная объявлена на компоненте Angular, переменная ссылается на экземпляр компонента.

```angular-html
<!-- The `startDate` variable is assigned the instance of `MyDatepicker`. -->
<my-datepicker #startDate />
```

Если переменная объявлена на элементе `<ng-template>`, переменная ссылается на экземпляр TemplateRef, представляющий шаблон. Для получения дополнительной информации см. [Как Angular использует синтаксис звездочки \*](/guide/directives/structural-directives#structural-directive-shorthand) в [Структурных директивах](/guide/directives/structural-directives).

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

#### Присваивание ссылки на директиву Angular {#assigning-a-reference-to-an-angular-directive}

Директивы Angular могут иметь свойство `exportAs`, определяющее имя, по которому на директиву можно сослаться в шаблоне:

```angular-ts
@Directive({
  selector: '[dropZone]',
  exportAs: 'dropZone',
})
export class DropZone {
  /* ... */
}
```

При объявлении переменной шаблона на элементе можно присвоить этой переменной экземпляр директивы, указав имя `exportAs`:

```angular-html
<!-- The `firstZone` variable refers to the `DropZone` directive instance. -->
<section dropZone #firstZone="dropZone">...</section>
```

Нельзя сослаться на директиву, у которой не указано имя `exportAs`.

### Использование ссылочных переменных шаблона с запросами {#using-template-reference-variables-with-queries}

Помимо использования переменных шаблона для чтения значений из другой части того же шаблона, этот стиль объявления переменных также можно использовать для «пометки» элемента для [запросов компонентов и директив](/guide/components/queries).

Когда необходимо запросить конкретный элемент в шаблоне, можно объявить переменную шаблона на этом элементе и затем запросить элемент по имени переменной.

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

Подробнее см. [Обращение к дочерним элементам с помощью запросов](/guide/components/queries).
