# Привязка динамического текста, свойств и атрибутов

В Angular **binding** создаёт динамическую связь между шаблоном компонента и его данными. Эта связь гарантирует, что изменения данных компонента автоматически обновляют отрисованный шаблон.

## Отрисовка динамического текста через text interpolation {#render-dynamic-text-with-text-interpolation}

Динамический текст в шаблонах можно привязывать двойными фигурными скобками — это сообщает Angular, что он отвечает за выражение внутри и обеспечивает его корректное обновление. Это называется **text interpolation**.

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

В этом примере при отрисовке фрагмента на странице Angular заменит `{{ theme }}` на `dark`.

```angular-html
<!-- Rendered Output -->
<p>Your color preference is dark.</p>
```

Bindings, которые меняются со временем, должны читать значения из [сигналов](/guide/signals). Angular отслеживает сигналы, прочитанные в шаблоне, и обновляет отрисованную страницу при изменении этих значений.

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

Подробнее см. [руководство по Signals](/guide/signals).

Продолжая пример с темой: если пользователь нажмёт кнопку, обновляющую сигнал `theme` на `'light'` после загрузки страницы, страница обновится соответственно:

```angular-html
<!-- Rendered Output -->
<p>Your color preference is light.</p>
```

Text interpolation можно использовать везде, где обычно пишут текст в HTML.

Все значения выражений преобразуются в строку. Объекты и массивы преобразуются методом `toString` значения.

## Привязка динамических свойств и атрибутов {#binding-dynamic-properties-and-attributes}

Angular поддерживает привязку динамических значений к свойствам объектов и HTML-атрибутам через квадратные скобки.

Можно привязываться к свойствам DOM-экземпляра HTML-элемента, экземпляра [компонента](/guide/components) или экземпляра [директивы](/guide/directives).

### Свойства нативных элементов {#native-element-properties}

У каждого HTML-элемента есть соответствующее DOM-представление. Например, каждый HTML-элемент `<button>` соответствует экземпляру `HTMLButtonElement` в DOM. В Angular property bindings используются для прямой установки значений в DOM-представление элемента.

```angular-html
<!-- Bind the `disabled` property on the button element's DOM object -->
<button [disabled]="isFormValid()">Save</button>
```

В этом примере при каждом изменении `isFormValid` Angular автоматически устанавливает свойство `disabled` экземпляра `HTMLButtonElement`.

### Свойства компонентов и директив {#component-and-directive-properties}

Когда элемент — компонент Angular, property bindings можно использовать для установки input-свойств компонента тем же синтаксисом квадратных скобок.

```angular-html
<!-- Bind the `value` property on the `MyListbox` component instance. -->
<my-listbox [value]="mySelection()" />
```

В этом примере при каждом изменении `mySelection` Angular автоматически устанавливает свойство `value` экземпляра `MyListbox`.

Можно привязываться и к свойствам директив.

```angular-html
<!-- Bind to the `ngSrc` property of the `NgOptimizedImage` directive  -->
<img [ngSrc]="profilePhotoUrl()" alt="The current user's profile photo" />
```

### Атрибуты {#attributes}

Когда нужно задать HTML-атрибуты без соответствующих DOM-свойств — например, SVG-атрибуты — можно привязывать атрибуты к элементам в шаблоне с префиксом `attr.`.

<!-- prettier-ignore -->
```angular-html
<!-- Bind the `role` attribute on the `<ul>` element to the component's `listRole` property. -->
<ul [attr.role]="listRole()">
```

В этом примере при каждом изменении `listRole` Angular автоматически устанавливает атрибут `role` элемента `<ul>`, вызывая `setAttribute`.

Если значение attribute binding равно `null`, Angular удаляет атрибут вызовом `removeAttribute`.

### Text interpolation в свойствах и атрибутах {#text-interpolation-in-properties-and-attributes}

Синтаксис text interpolation также можно использовать в свойствах и атрибутах — двойные фигурные скобки вместо квадратных вокруг имени свойства или атрибута. При таком синтаксисе Angular трактует присваивание как property binding.

```angular-html
<!-- Binds a value to the `alt` property of the image element's DOM object. -->
<img src="profile-photo.jpg" alt="Profile photo of {{ firstName() }}" />
```

## Привязки CSS class и style {#css-class-and-style-property-bindings}

Angular поддерживает дополнительные возможности для привязки CSS-классов и CSS style properties к элементам.

### CSS-классы {#css-classes}

Можно создать CSS class binding, чтобы условно добавлять или удалять CSS-класс на элементе в зависимости от того, является ли привязанное значение [truthy или falsy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy).

<!-- prettier-ignore -->
```angular-html
<!-- When `isExpanded` is truthy, add the `expanded` CSS class. -->
<ul [class.expanded]="isExpanded()">
```

Также можно привязываться напрямую к свойству `class`. Angular принимает три типа значений:

| Описание значения `class`                                                                                                                                         | Тип TypeScript        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Строка с одним или несколькими CSS-классами через пробел                                                                                                          | `string`              |
| Массив строк CSS-классов                                                                                                                                          | `string[]`            |
| Объект, где каждое имя свойства — имя CSS-класса, а соответствующее значение определяет, применяется ли класс к элементу, на основе truthiness.                   | `Record<string, any>` |

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

Пример выше отрисовывает следующий DOM:

<!-- prettier-ignore -->
```angular-html
<ul class="full-width outlined"> ... </ul>
<section class="expandable elevated"> ... </section>
<button class="highlighted"> ... </button>
```

Angular игнорирует любые строковые значения, которые не являются валидными именами CSS-классов.

При использовании статических CSS-классов, прямой привязки `class` и привязки конкретных классов Angular интеллектуально объединяет все классы в результате отрисовки.

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

В примере выше Angular отрисовывает элемент `ul` со всеми тремя CSS-классами.

<!-- prettier-ignore -->
```angular-html
<ul class="list box expanded">
```

Angular не гарантирует какой-либо конкретный порядок CSS-классов на отрисованных элементах.

При привязке `class` к массиву или объекту Angular сравнивает предыдущее значение с текущим оператором строгого равенства (`===`). Нужно создавать новый экземпляр объекта или массива при изменении этих значений, чтобы Angular применил обновления.

Если у элемента несколько bindings для одного и того же CSS-класса, Angular разрешает коллизии по порядку приоритета стилей.

NOTE: Class bindings не поддерживают имена классов через пробел в одном ключе. Также не поддерживаются мутации объектов, поскольку ссылка binding остаётся той же. Если нужно одно или другое, используйте директиву [ngClass](/api/common/NgClass).

### CSS style properties {#css-style-properties}

Также можно привязываться к CSS style properties напрямую на элементе.

<!-- prettier-ignore -->
```angular-html
<!-- Set the CSS `display` property based on the `isExpanded` property. -->
<section [style.display]="isExpanded() ? 'block' : 'none'">
```

Можно дополнительно указать единицы для CSS-свойств, которые принимают единицы.

<!-- prettier-ignore -->
```angular-html
<!-- Set the CSS `height` property to a pixel value based on the `sectionHeightInPixels` property. -->
<section [style.height.px]="sectionHeightInPixels()">
```

Также можно задать несколько значений стиля в одном binding. Angular принимает следующие типы значений:

| Описание значения `style`                                                                                                 | Тип TypeScript        |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Строка с нулём или более CSS-объявлений, например `"display: flex; margin: 8px"`.                                         | `string`              |
| Объект, где каждое имя свойства — имя CSS-свойства, а соответствующее значение — значение этого CSS-свойства.             | `Record<string, any>` |

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

Пример выше отрисовывает следующий DOM.

<!-- prettier-ignore -->
```angular-html
<ul style="display: flex; padding: 8px"> ... </ul>
<section style="border: 1px solid black; font-weight: bold"> ... </section>
```

При привязке `style` к объекту Angular сравнивает предыдущее значение с текущим оператором строгого равенства (`===`). Нужно создавать новый экземпляр объекта при изменении этих значений, чтобы Angular применил обновления.

Если у элемента несколько bindings для одного и того же style property, Angular разрешает коллизии по порядку приоритета стилей.

## ARIA-атрибуты {#aria-attributes}

Angular поддерживает привязку строковых значений к ARIA-атрибутам.

```angular-html
<button type="button" [aria-label]="actionLabel()">
  {{ actionLabel() }}
</button>
```

Angular записывает строковое значение в атрибут `aria-label` элемента и удаляет его, когда привязанное значение равно `null`.

Некоторые возможности ARIA предоставляют DOM-свойства или input директив, принимающие структурированные значения (например, ссылки на элементы). Для таких случаев используйте стандартные property bindings. См. [руководство по accessibility](/best-practices/a11y#aria-attributes-and-properties) для примеров и дополнительных указаний.
