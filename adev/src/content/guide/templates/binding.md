# Привязка динамического текста, свойств и атрибутов {#binding-dynamic-text-properties-and-attributes}

В Angular **привязка** создаёт динамическую связь между шаблоном компонента и его данными. Эта связь гарантирует, что изменения данных компонента автоматически обновляют отображаемый шаблон.

## Отображение динамического текста с интерполяцией {#render-dynamic-text-with-text-interpolation}

Динамический текст в шаблонах можно привязать с помощью двойных фигурных скобок, которые сообщают Angular, что он отвечает за выражение внутри и должен следить за его корректным обновлением. Это называется **интерполяцией текста**.

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

В этом примере при рендеринге фрагмента на страницу Angular заменит `{{ theme }}` на `dark`.

```angular-html
<!-- Rendered Output -->
<p>Your color preference is dark.</p>
```

Привязки, изменяющиеся со временем, должны читать значения из [сигналов](guide/signals). Angular отслеживает сигналы, читаемые в шаблоне, и обновляет отображаемую страницу при изменении значений этих сигналов.

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

Подробнее см. в [руководстве по сигналам](guide/signals).

Продолжая пример с темой: если пользователь нажмёт кнопку, обновляющую сигнал `theme` до `'light'` после загрузки страницы, страница обновится соответственно:

```angular-html
<!-- Rendered Output -->
<p>Your color preference is light.</p>
```

Интерполяцию текста можно использовать везде, где обычно пишется текст в HTML.

Все значения выражений преобразуются в строку. Объекты и массивы преобразуются с помощью метода `toString` значения.

## Привязка динамических свойств и атрибутов {#binding-dynamic-properties-and-attributes}

Angular поддерживает привязку динамических значений к свойствам объектов и HTML-атрибутам с помощью квадратных скобок.

Можно привязываться к свойствам DOM-экземпляра HTML-элемента, экземпляра [компонента](guide/components) или экземпляра [директивы](guide/directives).

### Нативные свойства элементов {#native-element-properties}

Каждый HTML-элемент имеет соответствующее DOM-представление. Например, каждому HTML-элементу `<button>` соответствует экземпляр `HTMLButtonElement` в DOM. В Angular привязки свойств используются для установки значений непосредственно в DOM-представлении элемента.

```angular-html
<!-- Bind the `disabled` property on the button element's DOM object -->
<button [disabled]="isFormValid()">Save</button>
```

В этом примере каждый раз при изменении `isFormValid` Angular автоматически устанавливает свойство `disabled` экземпляра `HTMLButtonElement`.

### Свойства компонентов и директив {#component-and-directive-properties}

Если элемент является Angular-компонентом, можно использовать привязки свойств для установки входных свойств компонента с тем же синтаксисом квадратных скобок.

```angular-html
<!-- Bind the `value` property on the `MyListbox` component instance. -->
<my-listbox [value]="mySelection()" />
```

В этом примере каждый раз при изменении `mySelection` Angular автоматически устанавливает свойство `value` экземпляра `MyListbox`.

Можно также привязываться к свойствам директив.

```angular-html
<!-- Bind to the `ngSrc` property of the `NgOptimizedImage` directive  -->
<img [ngSrc]="profilePhotoUrl()" alt="The current user's profile photo" />
```

### Атрибуты {#attributes}

Когда нужно установить HTML-атрибуты, не имеющие соответствующих DOM-свойств, например SVG-атрибуты, можно привязывать атрибуты к элементам шаблона с помощью префикса `attr.`.

<!-- prettier-ignore -->
```angular-html
<!-- Bind the `role` attribute on the `<ul>` element to the component's `listRole` property. -->
<ul [attr.role]="listRole()">
```

В этом примере каждый раз при изменении `listRole` Angular автоматически устанавливает атрибут `role` элемента `<ul>`, вызывая `setAttribute`.

Если значение привязки атрибута равно `null`, Angular удаляет атрибут, вызывая `removeAttribute`.

### Интерполяция текста в свойствах и атрибутах {#text-interpolation-in-properties-and-attributes}

Можно также использовать синтаксис интерполяции текста в свойствах и атрибутах, применяя двойные фигурные скобки вместо квадратных скобок вокруг имени свойства или атрибута. При использовании этого синтаксиса Angular обрабатывает присваивание как привязку свойства.

```angular-html
<!-- Binds a value to the `alt` property of the image element's DOM object. -->
<img src="profile-photo.jpg" alt="Profile photo of {{ firstName() }}" />
```

## Привязки CSS-классов и свойств стилей {#css-class-and-style-property-bindings}

Angular поддерживает дополнительные возможности для привязки CSS-классов и CSS-свойств стилей к элементам.

### CSS-классы {#css-classes}

Можно создать привязку CSS-класса для условного добавления или удаления CSS-класса элемента в зависимости от того, является ли привязанное значение [истинным или ложным](https://developer.mozilla.org/en-US/docs/Glossary/Truthy).

<!-- prettier-ignore -->
```angular-html
<!-- When `isExpanded` is truthy, add the `expanded` CSS class. -->
<ul [class.expanded]="isExpanded()">
```

Можно также привязываться непосредственно к свойству `class`. Angular принимает три типа значений:

| Описание значения `class`                                                                                                                                                                             | TypeScript-тип        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Строка, содержащая один или несколько CSS-классов, разделённых пробелами                                                                                                                              | `string`              |
| Массив строк CSS-классов                                                                                                                                                                              | `string[]`            |
| Объект, где каждое имя свойства является именем CSS-класса, а соответствующее значение определяет, применяется ли этот класс к элементу, на основе истинности.                                        | `Record<string, any>` |

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

Приведённый выше пример отображает следующий DOM:

<!-- prettier-ignore -->
```angular-html
<ul class="full-width outlined"> ... </ul>
<section class="expandable elevated"> ... </section>
<button class="highlighted"> ... </button>
```

Angular игнорирует строковые значения, не являющиеся допустимыми именами CSS-классов.

При одновременном использовании статических CSS-классов, прямой привязки `class` и привязки конкретных классов Angular интеллектуально объединяет все классы в отображаемом результате.

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

В примере выше Angular отображает элемент `ul` со всеми тремя CSS-классами.

<!-- prettier-ignore -->
```angular-html
<ul class="list box expanded">
```

Angular не гарантирует какой-либо конкретный порядок CSS-классов в отображаемых элементах.

При привязке `class` к массиву или объекту Angular сравнивает предыдущее и текущее значения с помощью оператора тройного равенства (`===`). Необходимо создавать новый объект или экземпляр массива при изменении этих значений, чтобы Angular применил обновления.

Если у элемента есть несколько привязок к одному CSS-классу, Angular разрешает коллизии, следуя порядку приоритета стилей.

> **Примечание:** Привязки классов не поддерживают имена классов, разделённые пробелами, в одном ключе. Они также не поддерживают мутации объектов, если ссылка на привязку остаётся неизменной. Если нужно одно из двух, используйте директиву [ngClass](api/common/NgClass).

### CSS-свойства стилей {#css-style-properties}

Можно также привязываться к CSS-свойствам стилей непосредственно на элементе.

<!-- prettier-ignore -->
```angular-html
<!-- Set the CSS `display` property based on the `isExpanded` property. -->
<section [style.display]="isExpanded() ? 'block' : 'none'">
```

Можно дополнительно указывать единицы измерения для CSS-свойств, принимающих единицы.

<!-- prettier-ignore -->
```angular-html
<!-- Set the CSS `height` property to a pixel value based on the `sectionHeightInPixels` property. -->
<section [style.height.px]="sectionHeightInPixels()">
```

Можно также задавать несколько значений стилей в одной привязке. Angular принимает следующие типы значений:

| Описание значения `style`                                                                                                            | TypeScript-тип        |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| Строка, содержащая ноль или более CSS-объявлений, например `"display: flex; margin: 8px"`.                                           | `string`              |
| Объект, где каждое имя свойства является именем CSS-свойства, а соответствующее значение — значением этого CSS-свойства.             | `Record<string, any>` |

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

Приведённый выше пример отображает следующий DOM.

<!-- prettier-ignore -->
```angular-html
<ul style="display: flex; padding: 8px"> ... </ul>
<section style="border: 1px solid black; font-weight: bold"> ... </section>
```

При привязке `style` к объекту Angular сравнивает предыдущее и текущее значения с помощью оператора тройного равенства (`===`). Необходимо создавать новый экземпляр объекта при изменении этих значений, чтобы Angular применил обновления.

Если у элемента есть несколько привязок к одному свойству стиля, Angular разрешает коллизии, следуя порядку приоритета стилей.

## ARIA-атрибуты {#aria-attributes}

Angular поддерживает привязку строковых значений к ARIA-атрибутам.

```angular-html
<button type="button" [aria-label]="actionLabel()">
  {{ actionLabel() }}
</button>
```

Angular записывает строковое значение в атрибут `aria-label` элемента и удаляет его, когда привязанное значение равно `null`.

Некоторые функции ARIA предоставляют DOM-свойства или входные параметры директив, принимающие структурированные значения (например, ссылки на элементы). Для таких случаев используйте стандартные привязки свойств. Примеры и дополнительные рекомендации см. в [руководстве по доступности](best-practices/a11y#aria-attributes-and-properties).
