# Переменные в шаблонах

В Angular существует два типа объявления переменных в шаблонах: локальные переменные шаблона и переменные ссылки на шаблон.

## Локальные переменные шаблона с `@let` {#local-template-variables-with-let}

Синтаксис `@let` в Angular позволяет определить локальную переменную и повторно использовать её в шаблоне, аналогично [синтаксису JavaScript `let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let).

### Использование `@let` {#using-let}

Используйте `@let` для объявления переменной, значение которой основано на результате выражения шаблона. Angular автоматически поддерживает значение переменной в актуальном состоянии относительно данного выражения, аналогично [привязкам](guide/templates/binding).

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

Каждый блок `@let` может объявлять ровно одну переменную. Нельзя объявлять несколько переменных в одном блоке через запятую.

### Ссылка на значение `@let` {#referencing-the-value-of-let}

После объявления переменной с помощью `@let` её можно повторно использовать в том же шаблоне:

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

### Возможность присваивания {#assignability}

Ключевое отличие `@let` от JavaScript `let` состоит в том, что `@let` нельзя переприсваивать после объявления. Однако Angular автоматически поддерживает значение переменной в актуальном состоянии относительно данного выражения.

```angular-html
@let value = 1;

<!-- Invalid - This does not work! -->
<button (click)="value = value + 1">Increment the value</button>
```

### Область видимости переменной {#variable-scope}

Объявления `@let` ограничены текущим представлением и его потомками. Angular создаёт новое представление на границах компонентов и там, где шаблон может содержать динамический контент — в блоках управления потоком, блоках `@defer` или структурных директивах.

Поскольку объявления `@let` не поднимаются (не hoisted), они **не могут** быть доступны из родительских представлений или соседних элементов:

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
- За которым следуют один или несколько пробелов, исключая переводы строк.
- За которыми следуют допустимое JavaScript-имя и ноль или более пробелов.
- За которыми следуют символ `=` и ноль или более пробелов.
- За которыми следует выражение Angular, которое может быть многострочным.
- Заканчивается символом `;`.

## Переменные ссылки на шаблон {#template-reference-variables}

Переменные ссылки на шаблон предоставляют способ объявить переменную, ссылающуюся на значение из элемента шаблона.

Переменная ссылки на шаблон может ссылаться на:

- DOM-элемент в шаблоне (включая [пользовательские элементы](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements))
- Angular-компонент или директиву
- [TemplateRef](api/core/TemplateRef) из [ng-template](api/core/ng-template)

Переменные ссылки на шаблон можно использовать для чтения информации из одной части шаблона в другой части того же шаблона.

### Объявление переменной ссылки на шаблон {#declaring-a-template-reference-variable}

Переменную на элементе шаблона можно объявить, добавив атрибут, начинающийся с символа решётки (`#`), за которым следует имя переменной.

```angular-html
<!-- Create a template reference variable named "taskInput", referring to the HTMLInputElement. -->
<input #taskInput placeholder="Enter task name" />
```

### Присваивание значений переменным ссылки на шаблон {#assigning-values-to-template-reference-variables}

Angular присваивает значение переменным шаблона на основе элемента, на котором объявлена переменная.

Если переменная объявлена на Angular-компоненте, она ссылается на экземпляр компонента.

```angular-html
<!-- The `startDate` variable is assigned the instance of `MyDatepicker`. -->
<my-datepicker #startDate />
```

Если переменная объявлена на элементе `<ng-template>`, она ссылается на экземпляр TemplateRef, представляющий шаблон. Подробнее см. в разделе [Как Angular использует синтаксис звёздочки `*`](guide/directives/structural-directives#structural-directive-shorthand) в [Структурных директивах](guide/directives/structural-directives).

```angular-html
<!-- The `myFragment` variable is assigned the `TemplateRef` instance corresponding to this template fragment. -->
<ng-template #myFragment>
  <p>This is a template fragment</p>
</ng-template>
```

Если переменная объявлена на любом другом отображаемом элементе, она ссылается на экземпляр `HTMLElement`.

```angular-html
<!-- The "taskInput" variable refers to the HTMLInputElement instance. -->
<input #taskInput placeholder="Enter task name" />
```

#### Присваивание ссылки на Angular-директиву {#assigning-a-reference-to-an-angular-directive}

Angular-директивы могут иметь свойство `exportAs`, определяющее имя, по которому директива может быть указана в шаблоне:

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

Нельзя ссылаться на директиву, не указавшую имя `exportAs`.

### Использование переменных ссылки на шаблон с запросами {#using-template-reference-variables-with-queries}

Помимо использования переменных шаблона для чтения значений из другой части того же шаблона, этот стиль объявления переменных также можно использовать для «пометки» элемента для [запросов компонентов и директив](guide/components/queries).

Если нужно запросить конкретный элемент в шаблоне, можно объявить переменную шаблона на этом элементе, а затем запросить элемент по имени переменной.

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

Подробнее о запросах см. в разделе [Ссылки на дочерние элементы с помощью запросов](guide/components/queries).
