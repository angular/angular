# Подготовка компонента к переводу

Чтобы подготовить проект к переводу, выполните следующие действия.

- Используйте атрибут `i18n` для пометки текста в шаблонах компонентов
- Используйте атрибут `i18n-` для пометки текстовых строк атрибутов в шаблонах компонентов
- Используйте tagged message string `$localize` для пометки текстовых строк в коде компонентов

## Пометка текста в шаблоне компонента {#mark-text-in-component-template}

В шаблоне компонента метаданные i18n — это значение атрибута `i18n`.

```html
<element i18n="{i18n_metadata}">{string_to_translate}</element>
```

Используйте атрибут `i18n`, чтобы пометить статическое текстовое сообщение в шаблонах компонентов для перевода.
Размещайте его на каждом теге элемента, который содержит фиксированный текст, который вы хотите перевести.

HELPFUL: Атрибут `i18n` — это пользовательский атрибут, который распознают инструменты и компиляторы Angular.

### Пример `i18n` {#i18n-example}

Следующий тег `<h1>` отображает простое приветствие на английском языке, "Hello i18n!".

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="greeting"/>

Чтобы пометить приветствие для перевода, добавьте атрибут `i18n` к тегу `<h1>`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-attribute"/>

### использование условного оператора с `i18n` {#using-conditional-statement-with-i18n}

Следующий тег `<div>` будет отображать переведённый текст как часть `div` и `aria-label` в зависимости от статуса переключателя

<docs-code-multifile>
    <docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html"  region="i18n-conditional"/>
    <docs-code header="app.component.ts" path="adev/src/content/examples/i18n/src/app/app.component.ts" visibleLines="[[14,21],[33,37]]"/>
</docs-code-multifile>

### Перевод inline-текста без HTML-элемента {#translate-inline-text-without-html-element}

Используйте элемент `<ng-container>`, чтобы связать поведение перевода с конкретным текстом, не меняя способ отображения текста.

HELPFUL: Каждый HTML-элемент создаёт новый DOM-элемент.
Чтобы избежать создания нового DOM-элемента, оберните текст в элемент `<ng-container>`.
Следующий пример показывает элемент `<ng-container>`, преобразованный в не отображаемый HTML-комментарий.

<docs-code path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-ng-container"/>

### Именование placeholder интерполяции {#name-the-interpolation-placeholder}

По умолчанию Angular генерирует имя placeholder для каждой интерполяции в переводимом сообщении. Чтобы дать ему осмысленное имя, которое помогает переводчикам понять контекст, добавьте комментарий `//i18n(ph="name")` внутри интерполяции.

```html
<element i18n>{{ expression //i18n(ph="placeholder_name") }}</element>
```

Например:

```html
<p i18n>Hello, {{ username //i18n(ph="name") }}!</p>
```

Это эквивалент в шаблоне именования placeholder в коде компонента с [`$localize`][ApiLocalizeInitLocalize]:

```ts
$localize`Hello, ${username}:name:!`;
```

## Пометка атрибутов элементов для перевода {#mark-element-attributes-for-translations}

В шаблоне компонента метаданные i18n — это значение атрибута `i18n-{attribute_name}`.

```html
<element i18n-{attribute_name}="{i18n_metadata}" {attribute_name}="{attribute_value}" />
```

Атрибуты HTML-элементов включают текст, который следует переводить вместе с остальным отображаемым текстом в шаблоне компонента.

Используйте `i18n-{attribute_name}` с любым атрибутом любого элемента и замените `{attribute_name}` на имя атрибута.
Используйте следующий синтаксис, чтобы назначить meaning, description и пользовательский ID.

```html
i18n-{attribute_name}="{meaning}|{description}@@{id}"
```

### Пример `i18n-title` {#i18n-title-example}

Чтобы перевести title изображения, рассмотрите этот пример.
Следующий пример отображает изображение с атрибутом `title`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-title"/>

Чтобы пометить атрибут title для перевода, выполните следующее действие.

Добавьте атрибут `i18n-title`

Следующий пример показывает, как пометить атрибут `title` на теге `img`, добавив `i18n-title`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-title-translate"/>

## Пометка текста в коде компонента {#mark-text-in-component-code}

В коде компонента исходный текст перевода и метаданные окружены символами backtick \(<code>&#96;</code>\).

Используйте tagged message string [`$localize`][ApiLocalizeInitLocalize], чтобы пометить строку в коде для перевода.

```ts
$localize`string_to_translate`;
```

Метаданные i18n окружены символами двоеточия \(`:`\) и предшествуют исходному тексту перевода.

```ts
$localize`:{i18n_metadata}:string_to_translate`;
```

### Включение интерполированного текста {#include-interpolated-text}

Включайте [интерполяции](guide/templates/binding#render-dynamic-text-with-text-interpolation) в tagged message string [`$localize`][ApiLocalizeInitLocalize].

```ts
$localize`string_to_translate ${variable_name}`;
```

### Именование placeholder интерполяции {#name-the-interpolation-placeholder-1}

```ts
$localize`string_to_translate ${variable_name}:placeholder_name:`;
```

### Условный синтаксис для переводов {#conditional-syntax-for-translations}

```ts
return this.show ? $localize`Show Tabs` : $localize`Hide tabs`;
```

## Метаданные i18n для перевода {#i18n-metadata-for-translation}

```html
{meaning}|{description}@@{custom_id}
```

Следующие параметры предоставляют контекст и дополнительную информацию, чтобы уменьшить путаницу для переводчика.

| Параметр метаданных | Подробности                                                           |
| :------------------ | :-------------------------------------------------------------------- |
| Custom ID           | Предоставить пользовательский идентификатор                           |
| Description         | Предоставить дополнительную информацию или контекст                   |
| Meaning             | Предоставить смысл или намерение текста в конкретном контексте        |

Для дополнительной информации о пользовательских ID см. [Управление помеченным текстом с пользовательскими ID][GuideI18nOptionalManageMarkedText].

### Добавление полезных описаний и смыслов {#add-helpful-descriptions-and-meanings}

Чтобы точно перевести текстовое сообщение, предоставьте дополнительную информацию или контекст для переводчика.

Добавьте _description_ текстового сообщения как значение атрибута `i18n` или tagged message string [`$localize`][ApiLocalizeInitLocalize].

Следующий пример показывает значение атрибута `i18n`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-attribute-desc"/>

Следующий пример показывает значение tagged message string [`$localize`][ApiLocalizeInitLocalize] с описанием.

```ts
$localize`:An introduction header for this sample:Hello i18n!`;
```

Переводчику также может понадобиться знать смысл или намерение текстового сообщения в этом конкретном контексте приложения, чтобы перевести его так же, как другой текст с тем же смыслом.
Начните значение атрибута `i18n` с _meaning_ и отделите его от _description_ символом `|`: `{meaning}|{description}`.

#### Пример `h1` {#h1-example}

Например, может понадобиться указать, что тег `<h1>` — это заголовок сайта, который нужно переводить одинаково, используется ли он как заголовок или на него ссылаются в другом разделе текста.

Следующий пример показывает, как указать, что тег `<h1>` должен переводиться как заголовок или на него ссылаются в другом месте.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-attribute-meaning"/>

В результате любой текст, помеченный как `site header`, как _meaning_ переводится точно так же.

Следующий пример кода показывает значение tagged message string [`$localize`][ApiLocalizeInitLocalize] с meaning и description.

```ts
$localize`:site header|An introduction header for this sample:Hello i18n!`;
```

<docs-callout title="How meanings control text extraction and merges">

Инструмент извлечения Angular генерирует запись translation unit для каждого атрибута `i18n` в шаблоне.
Инструмент извлечения Angular назначает каждой translation unit уникальный ID на основе _meaning_ и _description_.

HELPFUL: Для дополнительной информации об инструменте извлечения Angular см. [Работа с файлами перевода](guide/i18n/translation-files).

Одинаковые текстовые элементы с разными _meanings_ извлекаются с разными ID.
Например, если слово "right" использует следующие два определения в двух разных местах, слово переводится по-разному и объединяется обратно в приложение как разные записи перевода.

- `correct` как в "you are right"
- `direction` как в "turn right"

Если одинаковые текстовые элементы соответствуют следующим условиям, текстовые элементы извлекаются только один раз и используют один и тот же ID.

- Тот же смысл или определение
- Разные описания

Эта одна запись перевода объединяется обратно в приложение везде, где появляются одинаковые текстовые элементы.

</docs-callout>

## Выражения ICU {#icu-expressions}

Выражения ICU помогают помечать альтернативный текст в шаблонах компонентов для соответствия условиям.
Выражение ICU включает свойство компонента, ICU clause и case statements, окружённые символами открывающей фигурной скобки \(`{`\) и закрывающей фигурной скобки \(`}`\).

```html
{ component_property, icu_clause, case_statements }
```

Свойство компонента определяет переменную.
ICU clause определяет тип условного текста.

| ICU clause                                                           | Подробности                                                         |
| :------------------------------------------------------------------- | :------------------------------------------------------------------ |
| [`plural`][GuideI18nCommonPrepareMarkPlurals]                        | Пометить использование множественных чисел                          |
| [`select`][GuideI18nCommonPrepareMarkAlternatesAndNestedExpressions] | Пометить выборы альтернативного текста на основе определённых строковых значений |

Чтобы упростить перевод, используйте International Components for Unicode clauses \(ICU clauses\) с регулярными выражениями.

HELPFUL: ICU clauses соответствуют [ICU Message Format][GithubUnicodeOrgIcuUserguideFormatParseMessages], указанному в [правилах плюрализации CLDR][UnicodeCldrIndexCldrSpecPluralRules].

### Пометка множественных чисел {#mark-plurals}

В разных языках разные правила плюрализации, что увеличивает сложность перевода.
Поскольку другие локали выражают кардинальность по-разному, может понадобиться задать категории плюрализации, которые не совпадают с английским.
Используйте clause `plural`, чтобы пометить выражения, которые могут быть бессмысленными при дословном переводе.

```html
{ component_property, plural, pluralization_categories }
```

После категории плюрализации введите текст по умолчанию \(английский\), окружённый символами открывающей фигурной скобки \(`{`\) и закрывающей фигурной скобки \(`}`\).

```html
pluralization_category { }
```

Следующие категории плюрализации доступны для английского и могут меняться в зависимости от локали.

| Категория плюрализации | Подробности                | Пример                     |
| :--------------------- | :------------------------- | :------------------------- |
| `zero`                 | Количество равно нулю      | `=0 { }` <br /> `zero { }` |
| `one`                  | Количество равно 1         | `=1 { }` <br /> `one { }`  |
| `two`                  | Количество равно 2         | `=2 { }` <br /> `two { }`  |
| `few`                  | Количество 2 или больше    | `few { }`                  |
| `many`                 | Количество — большое число | `many { }`                 |
| `other`                | Количество по умолчанию    | `other { }`                |

Если ни одна из категорий плюрализации не совпадает, Angular использует `other` для соответствия стандартному fallback для отсутствующей категории.

```html
other { default_quantity }
```

HELPFUL: Для дополнительной информации о категориях плюрализации см. [Choosing plural category names][UnicodeCldrIndexCldrSpecPluralRulesTocChoosingPluralCategoryNames] в [CLDR - Unicode Common Locale Data Repository][UnicodeCldrMain].

<docs-callout header='Background: Locales may not support some pluralization categories'>

Многие локали не поддерживают некоторые категории плюрализации.
Локаль по умолчанию \(`en-US`\) использует очень простую функцию `plural()`, которая не поддерживает категорию плюрализации `few`.
Другая локаль с простой функцией `plural()` — `es`.
Следующий пример кода показывает функцию [en-US `plural()`][GithubAngularAngularBlobEcffc3557fe1bff9718c01277498e877ca44588dPackagesCoreSrcI18nLocaleEnTsL14L18].

<docs-code path="adev/src/content/examples/i18n/doc-files/locale_plural_function.ts" class="no-box" hideCopy/>

Функция `plural()` возвращает только 1 \(`one`\) или 5 \(`other`\).
Категория `few` никогда не совпадает.

</docs-callout>

#### Пример `minutes` {#minutes-example}

Если нужно отобразить следующую фразу на английском, где `x` — число.

<!--todo: replace output docs-code with screen capture image --->

```html
updated x minutes ago
```

И также нужно отобразить следующие фразы на основе кардинальности `x`.

<!--todo: replace output docs-code with screen capture image --->

```html
updated just now
```

<!--todo: replace output docs-code with screen capture image --->

```html
updated one minute ago
```

Используйте HTML-разметку и [интерполяции](guide/templates/binding#render-dynamic-text-with-text-interpolation).
Следующий пример кода показывает, как использовать clause `plural` для выражения предыдущих трёх ситуаций в элементе `<span>`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-plural"/>

Рассмотрите следующие детали в предыдущем примере кода.

| Параметры                         | Подробности                                                                                                           |
| :-------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| `minutes`                         | Первый параметр указывает, что свойство компонента — `minutes`, и определяет количество минут.                        |
| `plural`                          | Второй параметр указывает, что ICU clause — `plural`.                                                                 |
| `=0 {just now}`                   | Для нуля минут категория плюрализации — `=0`. Значение — `just now`.                                                  |
| `=1 {one minute}`                 | Для одной минуты категория плюрализации — `=1`. Значение — `one minute`.                                              |
| `other {{{minutes}} minutes ago}` | Для любой несовпавшей кардинальности категория плюрализации по умолчанию — `other`. Значение — `{{minutes}} minutes ago`. |

`{{minutes}}` — это [интерполяция](guide/templates/binding#render-dynamic-text-with-text-interpolation).

### Пометка альтернатив и вложенных выражений {#mark-alternates-and-nested-expressions}

Clause `select` помечает выборы альтернативного текста на основе определённых вами строковых значений.

```html
{ component_property, select, selection_categories }
```

Переведите все альтернативы, чтобы отображать альтернативный текст на основе значения переменной.

После категории выбора введите текст \(английский\), окружённый символами открывающей фигурной скобки \(`{`\) и закрывающей фигурной скобки \(`}`\).

```html
selection_category { text }
```

В разных локалях разные грамматические конструкции, что увеличивает сложность перевода.
Используйте HTML-разметку.
Если ни одна из категорий выбора не совпадает, Angular использует `other` для соответствия стандартному fallback для отсутствующей категории.

```html
other { default_value }
```

#### Пример `gender` {#gender-example}

Если нужно отобразить следующую фразу на английском.

<!--todo: replace output docs-code with screen capture image --->

```html
The author is other
```

И также нужно отобразить следующие фразы на основе свойства `gender` компонента.

<!--todo: replace output docs-code with screen capture image --->

```html
The author is female
```

<!--todo: replace output docs-code with screen capture image --->

```html
The author is male
```

Следующий пример кода показывает, как привязать свойство `gender` компонента и использовать clause `select` для выражения предыдущих трёх ситуаций в элементе `<span>`.

Свойство `gender` привязывает выводы к каждому из следующих строковых значений.

| Значение | Английское значение |
| :------- | :------------------ |
| female   | `female`            |
| male     | `male`              |
| other    | `other`             |

Clause `select` сопоставляет значения с соответствующими переводами.
Следующий пример кода показывает свойство `gender`, использованное с clause select.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-select"/>

#### Пример `gender` и `minutes` {#gender-and-minutes-example}

Объединяйте разные clauses вместе, например clauses `plural` и `select`.
Следующий пример кода показывает вложенные clauses на основе примеров `gender` и `minutes`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-nested"/>

## Что дальше {#whats-next}

<docs-pill-row>
  <docs-pill href="guide/i18n/translation-files" title="Work with translation files"/>
</docs-pill-row>

[ApiLocalizeInitLocalize]: api/localize/init/$localize '$localize | init - localize - API  | Angular'
[GuideI18nCommonPrepareMarkAlternatesAndNestedExpressions]: guide/i18n/prepare#mark-alternates-and-nested-expressions 'Mark alternates and nested expressions - Prepare templates for translation | Angular'
[GuideI18nCommonPrepareMarkPlurals]: guide/i18n/prepare#mark-plurals 'Mark plurals - Prepare component for translation | Angular'
[GuideI18nOptionalManageMarkedText]: guide/i18n/manage-marked-text 'Manage marked text with custom IDs | Angular'
[GithubAngularAngularBlobEcffc3557fe1bff9718c01277498e877ca44588dPackagesCoreSrcI18nLocaleEnTsL14L18]: https://github.com/angular/angular/blob/ecffc3557fe1bff9718c01277498e877ca44588d/packages/core/src/i18n/locale_en.ts#L14-L18 'Line 14 to 18 - angular/packages/core/src/i18n/locale_en.ts | angular/angular | GitHub'
[GithubUnicodeOrgIcuUserguideFormatParseMessages]: https://unicode-org.github.io/icu/userguide/format_parse/messages 'ICU Message Format - ICU Documentation | Unicode | GitHub'
[UnicodeCldrMain]: https://cldr.unicode.org 'Unicode CLDR Project'
[UnicodeCldrIndexCldrSpecPluralRules]: http://cldr.unicode.org/index/cldr-spec/plural-rules 'Plural Rules | CLDR - Unicode Common Locale Data Repository | Unicode'
[UnicodeCldrIndexCldrSpecPluralRulesTocChoosingPluralCategoryNames]: http://cldr.unicode.org/index/cldr-spec/plural-rules#TOC-Choosing-Plural-Category-Names 'Choosing Plural Category Names - Plural Rules | CLDR - Unicode Common Locale Data Repository | Unicode'
