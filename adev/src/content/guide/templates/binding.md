# Привязка динамического текста, свойств и атрибутов {#binding-dynamic-text-properties-and-attributes}

В Angular **привязка** создает динамическую связь между шаблоном компонента и его данными. Эта связь обеспечивает автоматическое обновление отрендеренного шаблона при изменении данных компонента.

## Рендеринг динамического текста с помощью текстовой интерполяции {#render-dynamic-text-with-text-interpolation}

Вы можете привязывать динамический текст в шаблонах с помощью двойных фигурных скобок, которые указывают Angular, что он отвечает за выражение внутри и должен обеспечивать его корректное обновление. Это называется **текстовой интерполяцией**.

```angular-ts
@Component({
  template: `
    <p>Your color preference is {{ theme }}.</p>
  `,
  ...
})
export class App {
  theme = 'dark';
}
```

В этом примере при рендеринге фрагмента на странице Angular заменит `{{ theme }}` на `dark`.

```angular-html
<!-- Rendered Output -->
<p>Your color preference is dark.</p>
```

Привязки, значения которых меняются со временем, должны считывать значения из [сигналов](/guide/signals). Angular отслеживает сигналы, считываемые в шаблоне, и обновляет отрендеренную страницу при изменении значений этих сигналов.

```angular-ts
@Component({
  template: `
    <!-- Does not necessarily update when `welcomeMessage` changes. -->
    <p>{{ welcomeMessage }}</p>

    <p>Your color preference is {{ theme() }}.</p> <!-- Always updates when the value of the `theme` signal changes. -->
  `
  ...
})
export class App {
  welcomeMessage = "Welcome, enjoy this app that we built for you";
  theme = signal('dark');
}
```

Для получения дополнительной информации см. [руководство по сигналам](/guide/signals).

Продолжая пример с темой: если пользователь нажимает кнопку, которая обновляет сигнал `theme` на `'light'` после загрузки страницы, страница обновится соответствующим образом:

```angular-html
<!-- Rendered Output -->
<p>Your color preference is light.</p>
```

Текстовую интерполяцию можно использовать везде, где обычно размещается текст в HTML.

Все значения выражений преобразуются в строку. Объекты и массивы преобразуются с помощью метода `toString` значения.

## Привязка динамических свойств и атрибутов {#binding-dynamic-properties-and-attributes}

Angular поддерживает привязку динамических значений к свойствам объектов и HTML-атрибутам с помощью квадратных скобок.

Вы можете привязываться к свойствам DOM-экземпляра HTML-элемента, экземпляра [компонента](guide/components) или экземпляра [директивы](guide/directives).

### Свойства нативных элементов {#native-element-properties}

Каждый HTML-элемент имеет соответствующее DOM-представление. Например, каждый HTML-элемент `<button>` соответствует экземпляру `HTMLButtonElement` в DOM. В Angular привязки свойств используются для установки значений непосредственно в DOM-представление элемента.

```angular-html
<!-- Bind the `disabled` property on the button element's DOM object -->
<button [disabled]="isFormValid()">Save</button>
```

В этом примере каждый раз, когда `isFormValid` изменяется, Angular автоматически устанавливает свойство `disabled` экземпляра `HTMLButtonElement`.

### Свойства компонентов и директив {#component-and-directive-properties}

Когда элемент является компонентом Angular, привязки свойств можно использовать для установки свойств input компонента с тем же синтаксисом квадратных скобок.

```angular-html
<!-- Bind the `value` property on the `MyListbox` component instance. -->
<my-listbox [value]="mySelection()" />
```

В этом примере каждый раз, когда `mySelection` изменяется, Angular автоматически устанавливает свойство `value` экземпляра `MyListbox`.

Аналогично можно привязываться к свойствам директив.

```angular-html
<!-- Bind to the `ngSrc` property of the `NgOptimizedImage` directive  -->
<img [ngSrc]="profilePhotoUrl()" alt="The current user's profile photo" />
```

### Атрибуты {#attributes}

Когда необходимо установить HTML-атрибуты, не имеющие соответствующих DOM-свойств, например атрибуты SVG, вы можете привязывать атрибуты к элементам в шаблоне с помощью префикса `attr.`.

<!-- prettier-ignore -->
```angular-html
<!-- Bind the `role` attribute on the `<ul>` element to the component's `listRole` property. -->
<ul [attr.role]="listRole()">
```

В этом примере каждый раз, когда `listRole` изменяется, Angular автоматически устанавливает атрибут `role` элемента `<ul>`, вызывая `setAttribute`.

Если значение привязки атрибута равно `null`, Angular удаляет атрибут, вызывая `removeAttribute`.

### Текстовая интерполяция в свойствах и атрибутах {#text-interpolation-in-properties-and-attributes}

Вы также можете использовать синтаксис текстовой интерполяции в свойствах и атрибутах, используя двойные фигурные скобки вместо квадратных скобок вокруг имени свойства или атрибута. При использовании этого синтаксиса Angular рассматривает присваивание как привязку свойства.

```angular-html
<!-- Binds a value to the `alt` property of the image element's DOM object. -->
<img src="profile-photo.jpg" alt="Profile photo of {{ firstName() }}" />
```

## Привязки CSS-классов и CSS-свойств стилей {#css-class-and-style-property-bindings}

Angular поддерживает дополнительные возможности для привязки CSS-классов и CSS-свойств стилей к элементам.

### CSS-классы {#css-classes}

Вы можете создать привязку CSS-класса для условного добавления или удаления CSS-класса у элемента в зависимости от того, является ли привязанное значение [истинным или ложным](https://developer.mozilla.org/en-US/docs/Glossary/Truthy).

<!-- prettier-ignore -->
```angular-html
<!-- When `isExpanded` is truthy, add the `expanded` CSS class. -->
<ul [class.expanded]="isExpanded()">
```

Вы также можете привязываться непосредственно к свойству `class`. Angular принимает три типа значений:

| Описание значения `class`                                                                                                                                                   | Тип TypeScript        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Строка, содержащая один или несколько CSS-классов, разделенных пробелами                                                                                                     | `string`              |
| Массив строк CSS-классов                                                                                                                                                    | `string[]`            |
| Объект, где каждое имя свойства является именем CSS-класса, а соответствующее значение определяет, применяется ли этот класс к элементу, на основе истинности значения        | `Record<string, any>` |

```angular-ts
@Component({
  template: `
    <ul [class]="listClasses"> ... </ul>
    <section [class]="sectionClasses()"> ... </section>
    <button [class]="buttonClasses()"> ... </button>
  `,
  ...
})
export class UserProfile {
  listClasses = 'full-width outlined';
  sectionClasses = signal(['expandable', 'elevated']);
  buttonClasses = signal({
    highlighted: true,
    embiggened: false,
  });
}
```

Приведенный выше пример рендерит следующий DOM:

<!-- prettier-ignore -->
```angular-html
<ul class="full-width outlined"> ... </ul>
<section class="expandable elevated"> ... </section>
<button class="highlighted"> ... </button>
```

Angular игнорирует любые строковые значения, которые не являются допустимыми именами CSS-классов.

При использовании статических CSS-классов, прямой привязки `class` и привязки конкретных классов Angular объединяет все классы в отрендеренном результате.

```angular-ts
@Component({
  template: `<ul class="list" [class]="listType()" [class.expanded]="isExpanded()"> ...`,
  ...
})
export class Listbox {
  listType = signal('box');
  isExpanded = signal(true);
}
```

В приведенном выше примере Angular рендерит элемент `ul` со всеми тремя CSS-классами.

<!-- prettier-ignore -->
```angular-html
<ul class="list box expanded">
```

Angular не гарантирует определенный порядок CSS-классов в отрендеренных элементах.

При привязке `class` к массиву или объекту Angular сравнивает предыдущее значение с текущим с помощью оператора строгого равенства (`===`). Необходимо создавать новый экземпляр объекта или массива при изменении этих значений, чтобы Angular применил обновления.

Если у элемента есть несколько привязок для одного и того же CSS-класса, Angular разрешает коллизии в соответствии с порядком приоритета стилей.

NOTE: Привязки классов не поддерживают имена классов, разделенные пробелами, в одном ключе. Они также не поддерживают мутации объектов, так как ссылка привязки остается неизменной. Если вам нужна одна из этих возможностей, используйте директиву [ngClass](/api/common/NgClass).

### CSS-свойства стилей {#css-style-properties}

Вы также можете привязываться к CSS-свойствам стилей непосредственно на элементе.

<!-- prettier-ignore -->
```angular-html
<!-- Set the CSS `display` property based on the `isExpanded` property. -->
<section [style.display]="isExpanded() ? 'block' : 'none'">
```

Вы можете дополнительно указать единицы измерения для CSS-свойств, которые их принимают.

<!-- prettier-ignore -->
```angular-html
<!-- Set the CSS `height` property to a pixel value based on the `sectionHeightInPixels` property. -->
<section [style.height.px]="sectionHeightInPixels()">
```

Вы также можете установить несколько значений стилей в одной привязке. Angular принимает следующие типы значений:

| Описание значения `style`                                                                                                      | Тип TypeScript        |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| Строка, содержащая ноль или более CSS-объявлений, например `"display: flex; margin: 8px"`.                                      | `string`              |
| Объект, где каждое имя свойства является именем CSS-свойства, а соответствующее значение является значением этого CSS-свойства.  | `Record<string, any>` |

```angular-ts
@Component({
  template: `
    <ul [style]="listStyles()"> ... </ul>
    <section [style]="sectionStyles()"> ... </section>
  `,
  ...
})
export class UserProfile {
  listStyles = signal('display: flex; padding: 8px');
  sectionStyles = signal({
    border: '1px solid black',
    'font-weight': 'bold',
  });
}
```

Приведенный выше пример рендерит следующий DOM.

<!-- prettier-ignore -->
```angular-html
<ul style="display: flex; padding: 8px"> ... </ul>
<section style="border: 1px solid black; font-weight: bold"> ... </section>
```

При привязке `style` к объекту Angular сравнивает предыдущее значение с текущим с помощью оператора строгого равенства (`===`). Необходимо создавать новый экземпляр объекта при изменении этих значений, чтобы Angular применил обновления.

Если у элемента есть несколько привязок для одного и того же свойства стиля, Angular разрешает коллизии в соответствии с порядком приоритета стилей.

## ARIA-атрибуты {#aria-attributes}

Angular поддерживает привязку строковых значений к ARIA-атрибутам.

```angular-html
<button type="button" [aria-label]="actionLabel()">
  {{ actionLabel() }}
</button>
```

Angular записывает строковое значение в атрибут `aria-label` элемента и удаляет его, когда привязанное значение равно `null`.

Некоторые возможности ARIA предоставляют DOM-свойства или input директив, которые принимают структурированные значения (например, ссылки на элементы). В таких случаях используйте стандартные привязки свойств. См. [руководство по доступности](best-practices/a11y#aria-attributes-and-properties) для примеров и дополнительных рекомендаций.
