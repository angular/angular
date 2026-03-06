# Подготовка компонента к переводу {#prepare-component-for-translation}

Чтобы подготовить проект к переводу, выполните следующие действия.

- Используйте атрибут `i18n` для разметки текста в шаблонах компонентов
- Используйте атрибут `i18n-` для разметки строк атрибутов в шаблонах компонентов
- Используйте теговую строку сообщения `$localize` для разметки текстовых строк в коде компонента

## Разметка текста в шаблоне компонента {#mark-text-in-component-template}

В шаблоне компонента метаданные i18n являются значением атрибута `i18n`.

```html
<element i18n="{i18n_metadata}">{string_to_translate}</element>
```

Используйте атрибут `i18n` для разметки статических текстовых сообщений в шаблонах компонентов для перевода.
Размещайте его на каждом теге элемента, содержащем фиксированный текст, который требуется перевести.

HELPFUL: Атрибут `i18n` — это пользовательский атрибут, который распознают инструменты и компиляторы Angular.

### Пример `i18n` {#i18n-example}

Следующий тег `<h1>` отображает простое приветствие на английском языке: "Hello i18n!".

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="greeting"/>

Чтобы пометить приветствие для перевода, добавьте атрибут `i18n` к тегу `<h1>`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-attribute"/>

### Использование условного оператора с `i18n` {#using-conditional-statement-with-i18n}

Следующий тег `<div>` будет отображать переведённый текст в составе `div` и `aria-label` в зависимости от состояния переключателя.

<docs-code-multifile>
    <docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html"  region="i18n-conditional"/>
    <docs-code header="app.component.ts" path="adev/src/content/examples/i18n/src/app/app.component.ts" visibleLines="[[14,21],[33,37]]"/>
</docs-code-multifile>

### Перевод встроенного текста без HTML-элемента {#translate-inline-text-without-html-element}

Используйте элемент `<ng-container>` для применения поведения перевода к конкретному тексту без изменения его отображения.

HELPFUL: Каждый HTML-элемент создаёт новый элемент DOM.
Чтобы не создавать новый элемент DOM, оберните текст в элемент `<ng-container>`.
В следующем примере показано, как элемент `<ng-container>` преобразуется в невидимый HTML-комментарий.

<docs-code path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-ng-container"/>

## Разметка атрибутов элементов для перевода {#mark-element-attributes-for-translations}

В шаблоне компонента метаданные i18n являются значением атрибута `i18n-{attribute_name}`.

```html
<element i18n-{attribute_name}="{i18n_metadata}" {attribute_name}="{attribute_value}" />
```

Атрибуты HTML-элементов содержат текст, который должен переводиться вместе с остальным отображаемым текстом в шаблоне компонента.

Используйте `i18n-{attribute_name}` с любым атрибутом любого элемента, заменив `{attribute_name}` на имя атрибута.
Используйте следующий синтаксис для указания значения, описания и пользовательского идентификатора.

```html
i18n-{attribute_name}="{meaning}|{description}@@{id}"
```

### Пример `i18n-title` {#i18n-title-example}

Чтобы перевести заголовок изображения, рассмотрим следующий пример.
В нём отображается изображение с атрибутом `title`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-title"/>

Чтобы пометить атрибут title для перевода, выполните следующее действие.

Добавьте атрибут `i18n-title`.

В следующем примере показано, как пометить атрибут `title` тега `img`, добавив `i18n-title`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-title-translate"/>

## Разметка текста в коде компонента {#mark-text-in-component-code}

В коде компонента исходный текст перевода и метаданные окружены символами обратного апострофа \(<code>&#96;</code>\).

Используйте теговую строку сообщения [`$localize`][ApiLocalizeInitLocalize] для разметки строки в коде для перевода.

```ts
$localize`string_to_translate`;
```

Метаданные i18n окружены символами двоеточия \(`:`\) и предшествуют исходному тексту перевода.

```ts
$localize`:{i18n_metadata}:string_to_translate`;
```

### Включение интерполированного текста {#include-interpolated-text}

Включите [интерполяции](guide/templates/binding#render-dynamic-text-with-text-interpolation) в теговую строку сообщения [`$localize`][ApiLocalizeInitLocalize].

```ts
$localize`string_to_translate ${variable_name}`;
```

### Именование заполнителя интерполяции {#name-the-interpolation-placeholder}

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

Следующие параметры предоставляют контекст и дополнительную информацию для снижения неоднозначности при переводе.

| Параметр метаданных | Описание                                                                  |
| :------------------ | :------------------------------------------------------------------------ |
| Custom ID           | Пользовательский идентификатор                                            |
| Description         | Дополнительная информация или контекст                                    |
| Meaning             | Значение или назначение текста в конкретном контексте                     |

Подробнее о пользовательских идентификаторах см. в разделе [Управление размеченным текстом с пользовательскими идентификаторами][GuideI18nOptionalManageMarkedText].

### Добавление полезных описаний и значений {#add-helpful-descriptions-and-meanings}

Для точного перевода текстового сообщения предоставьте переводчику дополнительную информацию или контекст.

Добавьте _описание_ текстового сообщения в качестве значения атрибута `i18n` или теговой строки [`$localize`][ApiLocalizeInitLocalize].

Следующий пример показывает значение атрибута `i18n`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-attribute-desc"/>

Следующий пример показывает значение теговой строки [`$localize`][ApiLocalizeInitLocalize] с описанием.

```ts
$localize`:An introduction header for this sample:Hello i18n!`;
```

Переводчику также может потребоваться знать значение или назначение текстового сообщения в данном контексте приложения, чтобы переводить его одинаково с другими текстами с тем же значением.
Начните значение атрибута `i18n` со _значения_ и отделите его от _описания_ символом `|`: `{meaning}|{description}`.

#### Пример `h1` {#h1-example}

Например, можно указать, что тег `<h1>` является заголовком сайта и должен переводиться одинаково независимо от того, используется ли он как заголовок или упоминается в другом разделе текста.

Следующий пример показывает, как указать, что тег `<h1>` должен переводиться как заголовок или на него ссылаются в другом месте.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-attribute-meaning"/>

В результате любой текст, помеченный значением `site header`, переводится одинаково.

Следующий пример кода показывает значение теговой строки [`$localize`][ApiLocalizeInitLocalize] со значением и описанием.

```ts
$localize`:site header|An introduction header for this sample:Hello i18n!`;
```

<docs-callout title="Как значения управляют извлечением текста и слиянием">

Инструмент извлечения Angular создаёт запись единицы перевода для каждого атрибута `i18n` в шаблоне.
Инструмент извлечения Angular присваивает каждой единице перевода уникальный идентификатор на основе _значения_ и _описания_.

HELPFUL: Подробнее об инструменте извлечения Angular см. в разделе [Работа с файлами перевода](guide/i18n/translation-files).

Одни и те же текстовые элементы с разными _значениями_ извлекаются с разными идентификаторами.
Например, если слово "right" используется в двух разных контекстах, оно переводится по-разному и возвращается в приложение как разные записи перевода.

- `correct` — как в "you are right"
- `direction` — как в "turn right"

Если одни и те же текстовые элементы удовлетворяют следующим условиям, они извлекаются только один раз и используют один идентификатор.

- Одинаковое значение или определение
- Разные описания

Эта единственная запись перевода объединяется обратно в приложение везде, где встречаются те же текстовые элементы.

</docs-callout>

## ICU-выражения {#icu-expressions}

ICU-выражения помогают разметить альтернативный текст в шаблонах компонентов в зависимости от условий.
ICU-выражение включает свойство компонента, предложение ICU и операторы условий, окружённые символами открывающей \(`{`\) и закрывающей \(`}`\) фигурной скобки.

```html
{ component_property, icu_clause, case_statements }
```

Свойство компонента определяет переменную.
Предложение ICU определяет тип условного текста.

| Предложение ICU                                                           | Описание                                                                    |
| :------------------------------------------------------------------------ | :-------------------------------------------------------------------------- |
| [`plural`][GuideI18nCommonPrepareMarkPlurals]                             | Разметка употребления числительных                                          |
| [`select`][GuideI18nCommonPrepareMarkAlternatesAndNestedExpressions]      | Разметка вариантов альтернативного текста на основе определённых строковых значений |

Чтобы упростить перевод, используйте предложения Международных компонентов для Unicode (ICU) с регулярными выражениями.

HELPFUL: Предложения ICU соответствуют [формату сообщений ICU][GithubUnicodeOrgIcuUserguideFormatParseMessages], указанному в [правилах склонения CLDR][UnicodeCldrIndexCldrSpecPluralRules].

### Разметка множественного числа {#mark-plurals}

В разных языках действуют разные правила образования множественного числа, что усложняет перевод.
Поскольку другие локали выражают количественное значение иначе, может потребоваться задать категории множественного числа, не совпадающие с английскими.
Используйте предложение `plural` для разметки выражений, которые не имеют смысла при дословном переводе.

```html
{ component_property, plural, pluralization_categories }
```

После категории множественного числа введите текст по умолчанию \(на английском\), окружённый символами открывающей \(`{`\) и закрывающей \(`}`\) фигурной скобки.

```html
pluralization_category { }
```

Следующие категории множественного числа доступны для английского языка и могут изменяться в зависимости от локали.

| Категория множественного числа | Описание                     | Пример                      |
| :----------------------------- | :--------------------------- | :--------------------------- |
| `zero`                         | Количество равно нулю        | `=0 { }` <br /> `zero { }`  |
| `one`                          | Количество равно 1           | `=1 { }` <br /> `one { }`   |
| `two`                          | Количество равно 2           | `=2 { }` <br /> `two { }`   |
| `few`                          | Количество 2 или более       | `few { }`                    |
| `many`                         | Большое количество           | `many { }`                   |
| `other`                        | Количество по умолчанию      | `other { }`                  |

Если ни одна из категорий множественного числа не совпадает, Angular использует `other` как стандартный резервный вариант для отсутствующей категории.

```html
other { default_quantity }
```

HELPFUL: Подробнее о категориях множественного числа см. в разделе [Выбор имён категорий множественного числа][UnicodeCldrIndexCldrSpecPluralRulesTocChoosingPluralCategoryNames] в [CLDR - Unicode Common Locale Data Repository][UnicodeCldrMain].

<docs-callout header='Справка: Локали могут не поддерживать некоторые категории множественного числа'>

Многие локали не поддерживают некоторые категории множественного числа.
Локаль по умолчанию \(`en-US`\) использует очень простую функцию `plural()`, которая не поддерживает категорию `few`.
Другой локалью с простой функцией `plural()` является `es`.
Следующий пример кода показывает функцию [en-US `plural()`][GithubAngularAngularBlobEcffc3557fe1bff9718c01277498e877ca44588dPackagesCoreSrcI18nLocaleEnTsL14L18].

<docs-code path="adev/src/content/examples/i18n/doc-files/locale_plural_function.ts" class="no-box" hideCopy/>

Функция `plural()` возвращает только 1 \(`one`\) или 5 \(`other`\).
Категория `few` никогда не совпадает.

</docs-callout>

#### Пример `minutes` {#minutes-example}

Если нужно отобразить следующую фразу на английском, где `x` — число:

```html
updated x minutes ago
```

А также следующие фразы в зависимости от количественного значения `x`:

```html
updated just now
```

```html
updated one minute ago
```

Используйте HTML-разметку и [интерполяции](guide/templates/binding#render-dynamic-text-with-text-interpolation).
Следующий пример показывает, как использовать предложение `plural` для выражения трёх описанных ситуаций в элементе `<span>`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-plural"/>

Рассмотрим следующие детали из предыдущего примера.

| Параметры                         | Описание                                                                                                                 |
| :-------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| `minutes`                         | Первый параметр задаёт свойство компонента `minutes` и определяет количество минут.                                      |
| `plural`                          | Второй параметр задаёт предложение ICU `plural`.                                                                         |
| `=0 {just now}`                   | При нулевом количестве минут категория множественного числа — `=0`. Значение — `just now`.                               |
| `=1 {one minute}`                 | При одной минуте категория множественного числа — `=1`. Значение — `one minute`.                                         |
| `other {{{minutes}} minutes ago}` | При любом несовпадающем количестве категория по умолчанию — `other`. Значение — `{{minutes}} minutes ago`.               |

`{{minutes}}` — это [интерполяция](guide/templates/binding#render-dynamic-text-with-text-interpolation).

### Разметка альтернатив и вложенных выражений {#mark-alternates-and-nested-expressions}

Предложение `select` размечает варианты альтернативного текста на основе определённых строковых значений.

```html
{ component_property, select, selection_categories }
```

Переводите все альтернативы для отображения альтернативного текста в зависимости от значения переменной.

После категории выбора введите текст \(на английском\), окружённый символами открывающей \(`{`\) и закрывающей \(`}`\) фигурной скобки.

```html
selection_category { text }
```

В разных локалях разные грамматические конструкции усложняют перевод.
Используйте HTML-разметку.
Если ни одна из категорий выбора не совпадает, Angular использует `other` как стандартный резервный вариант для отсутствующей категории.

```html
other { default_value }
```

#### Пример `gender` {#gender-example}

Если нужно отобразить следующую фразу на английском:

```html
The author is other
```

А также следующие фразы в зависимости от свойства `gender` компонента:

```html
The author is female
```

```html
The author is male
```

Следующий пример показывает, как привязать свойство `gender` компонента и использовать предложение `select` для выражения трёх описанных ситуаций в элементе `<span>`.

Свойство `gender` привязывает выходные данные к каждому из следующих строковых значений.

| Значение | Английское значение |
| :------- | :------------------ |
| female   | `female`            |
| male     | `male`              |
| other    | `other`             |

Предложение `select` сопоставляет значения с соответствующими переводами.
Следующий пример показывает свойство `gender`, используемое с предложением select.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-select"/>

#### Пример `gender` и `minutes` {#gender-and-minutes-example}

Объединяйте разные предложения, например `plural` и `select`.
Следующий пример показывает вложенные предложения на основе примеров `gender` и `minutes`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-nested"/>

## Что дальше {#whats-next}

<docs-pill-row>
  <docs-pill href="guide/i18n/translation-files" title="Работа с файлами перевода"/>
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
