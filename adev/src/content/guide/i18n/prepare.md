# Подготовка компонента к переводу

Чтобы подготовить ваш проект к переводу, выполните следующие действия.

- Используйте атрибут `i18n` для разметки текста в шаблонах компонентов.
- Используйте атрибут `i18n-` для разметки текстовых строк атрибутов в шаблонах компонентов.
- Используйте тегированную строку сообщения `$localize` для разметки текстовых строк в коде компонента.

## Разметка текста в шаблоне компонента

В шаблоне компонента метаданными i18n является значение атрибута `i18n`.

```html
<element i18n="{i18n_metadata}">{string_to_translate}</element>
```

Используйте атрибут `i18n`, чтобы пометить статическое текстовое сообщение в шаблонах компонентов для перевода.
Размещайте его на каждом теге элемента, содержащем фиксированный текст, который вы хотите перевести.

ПОЛЕЗНО: Атрибут `i18n` — это пользовательский атрибут, который распознается инструментами и компиляторами Angular.

### Пример `i18n`

Следующий тег `<h1>` отображает простое приветствие на английском языке: "Hello i18n!".

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="greeting"/>

Чтобы пометить приветствие для перевода, добавьте атрибут `i18n` к тегу `<h1>`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-attribute"/>

### Использование условных операторов с `i18n`

Следующий тег `<div>` будет отображать переведенный текст как часть `div` и `aria-label` в зависимости от статуса
переключателя.

<docs-code-multifile>
    <docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html"  region="i18n-conditional"/>
    <docs-code header="app.component.ts" path="adev/src/content/examples/i18n/src/app/app.component.ts" visibleLines="[[14,21],[33,37]]"/>
</docs-code-multifile>

### Перевод встроенного текста без HTML-элемента

Используйте элемент `<ng-container>`, чтобы связать поведение перевода с конкретным текстом, не изменяя способ его
отображения.

ПОЛЕЗНО: Каждый HTML-элемент создает новый DOM-элемент.
Чтобы избежать создания нового DOM-элемента, оберните текст в элемент `<ng-container>`.
В следующем примере показано, как элемент `<ng-container>` преобразуется в неотображаемый HTML-комментарий.

<docs-code path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-ng-container"/>

## Разметка атрибутов элементов для перевода

В шаблоне компонента метаданными i18n является значение атрибута `i18n-{attribute_name}`.

```html
<element i18n-{attribute_name}="{i18n_metadata}" {attribute_name}="{attribute_value}" />
```

Атрибуты HTML-элементов содержат текст, который должен быть переведен вместе с остальным отображаемым текстом в шаблоне
компонента.

Используйте `i18n-{attribute_name}` с любым атрибутом любого элемента, заменив `{attribute_name}` на имя атрибута.
Используйте следующий синтаксис для назначения значения (meaning), описания (description) и пользовательского ID.

<!--todo: replace with docs-code -->

```html
i18n-{attribute_name}="{meaning}|{description}@@{id}"
```

### Пример `i18n-title`

Чтобы перевести заголовок изображения, рассмотрите этот пример.
Следующий пример отображает изображение с атрибутом `title`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-title"/>

Чтобы пометить атрибут title для перевода, выполните следующее действие.

1. Добавьте атрибут `i18n-title`

   В следующем примере показано, как пометить атрибут `title` тега `img`, добавив `i18n-title`.

   <docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-title-translate"/>

## Разметка текста в коде компонента

В коде компонента исходный текст перевода и метаданные заключены в обратные кавычки (`).

Используйте тегированную строку сообщения [`$localize`][ApiLocalizeInitLocalize], чтобы пометить строку в коде для
перевода.

<!--todo: replace with docs-code -->

<docs-code language="typescript">
$localize`string_to_translate`;
</docs-code>

Метаданные i18n заключены в двоеточия (`:`) и предшествуют исходному тексту перевода.

<!--todo: replace with docs-code -->

<docs-code language="typescript">
$localize`:{i18n_metadata}:string_to_translate`
</docs-code>

### Включение интерполированного текста

Включайте [интерполяции](guide/templates/binding#render-dynamic-text-with-text-interpolation) в тегированную строку
сообщения [`$localize`][ApiLocalizeInitLocalize].

<!--todo: replace with docs-code -->

<docs-code language="typescript">
$localize`string_to_translate ${variable_name}`;
</docs-code>

### Именование заполнителя интерполяции

<docs-code language="typescript">
$localize`string_to_translate ${variable_name}:placeholder_name:`;
</docs-code>

### Условный синтаксис для переводов

<docs-code language="typescript">
return this.show ? $localize`Show Tabs` : $localize`Hide tabs`;
</docs-code>

## Метаданные i18n для перевода

<!--todo: replace with docs-code -->

```html
{meaning}|{description}@@{custom_id}
```

Следующие параметры предоставляют контекст и дополнительную информацию, чтобы уменьшить путаницу для переводчика.

| Параметр метаданных | Детали                                                            |
| :------------------ | :---------------------------------------------------------------- |
| Custom ID           | Предоставьте пользовательский идентификатор                       |
| Description         | Предоставьте дополнительную информацию или контекст               |
| Meaning             | Предоставьте значение или намерение текста в конкретном контексте |

Для получения дополнительной информации о пользовательских ID
см. [Управление помеченным текстом с помощью пользовательских ID][GuideI18nOptionalManageMarkedText].

### Добавление полезных описаний и значений

Чтобы точно перевести текстовое сообщение, предоставьте переводчику дополнительную информацию или контекст.

Добавьте _описание_ текстового сообщения в качестве значения атрибута `i18n` или тегированной строки сообщения [
`$localize`][ApiLocalizeInitLocalize].

В следующем примере показано значение атрибута `i18n`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-attribute-desc"/>

В следующем примере показано значение тегированной строки сообщения [`$localize`][ApiLocalizeInitLocalize] с описанием.

<!--todo: replace with docs-code -->

<docs-code language="typescript">

$localize`:An introduction header for this sample:Hello i18n!`;

</docs-code>

Переводчику также может потребоваться знать значение или намерение текстового сообщения в данном конкретном контексте
приложения, чтобы перевести его так же, как и другой текст с тем же значением.
Начните значение атрибута `i18n` со _значения_ (meaning) и отделите его от _описания_ символом `|`:
`{meaning}|{description}`.

#### Пример `h1`

Например, вы можете захотеть указать, что тег `<h1>` является заголовком сайта, который нужно переводить одинаково,
независимо от того, используется ли он как заголовок или упоминается в другом разделе текста.

В следующем примере показано, как указать, что тег `<h1>` должен переводиться как заголовок или упоминаться в другом
месте.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-attribute-meaning"/>

В результате любой текст, помеченный как `site header` (заголовок сайта), поскольку _значение_ переводится абсолютно
одинаково.

В следующем примере кода показано значение тегированной строки сообщения [`$localize`][ApiLocalizeInitLocalize] со
значением и описанием.

<!--todo: replace with docs-code -->

<docs-code language="typescript">

$localize`:site header|An introduction header for this sample:Hello i18n!`;

</docs-code>

<docs-callout title="Как значения управляют извлечением и слиянием текста">

Инструмент извлечения Angular генерирует запись модуля перевода для каждого атрибута `i18n` в шаблоне.
Инструмент извлечения Angular присваивает каждому модулю перевода уникальный ID на основе _значения_ и _описания_.

ПОЛЕЗНО: Для получения дополнительной информации об инструменте извлечения Angular
см. [Работа с файлами перевода](guide/i18n/translation-files).

Одинаковые текстовые элементы с разными _значениями_ извлекаются с разными ID.
Например, если слово "right" использует следующие два определения в двух разных местах, слово переводится по-разному и
объединяется обратно в приложение как разные записи перевода.

- `correct` (правильно), как в "you are right" (вы правы)
- `direction` (направление), как в "turn right" (поверните направо)

Если одни и те же текстовые элементы соответствуют следующим условиям, они извлекаются только один раз и используют один
и тот же ID.

- Одинаковое значение или определение
- Разные описания

Эта единственная запись перевода объединяется обратно в приложение везде, где появляются эти текстовые элементы.

</docs-callout>

## ICU-выражения

ICU-выражения помогают помечать альтернативный текст в шаблонах компонентов для соответствия условиям.
ICU-выражение включает свойство компонента, ICU-предложение (clause) и операторы выбора (case statements), заключенные в
открывающую (`{`) и закрывающую (`}`) фигурные скобки.

<!--todo: replace with docs-code -->

```html

{ component_property, icu_clause, case_statements }
```

Свойство компонента определяет переменную.
ICU-предложение определяет тип условного текста.

| ICU-предложение                                                      | Детали                                                                                  |
| :------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| [`plural`][GuideI18nCommonPrepareMarkPlurals]                        | Отметить использование множественного числа                                             |
| [`select`][GuideI18nCommonPrepareMarkAlternatesAndNestedExpressions] | Отметить варианты альтернативного текста на основе определенных вами строковых значений |

Чтобы упростить перевод, используйте предложения International Components for Unicode (ICU-предложения) с регулярными
выражениями.

ПОЛЕЗНО: ICU-предложения соответствуют [формату сообщений ICU][GithubUnicodeOrgIcuUserguideFormatParseMessages],
указанному в [правилах плюрализации CLDR][UnicodeCldrIndexCldrSpecPluralRules].

### Разметка множественного числа

В разных языках существуют разные правила плюрализации, что усложняет перевод.
Поскольку другие локали выражают количественность по-разному, вам может потребоваться установить категории плюрализации,
которые не совпадают с английским языком.
Используйте предложение `plural`, чтобы пометить выражения, которые могут потерять смысл при дословном переводе.

<!--todo: replace with docs-code -->

```html

{ component_property, plural, pluralization_categories }
```

После категории плюрализации введите текст по умолчанию (английский), заключенный в открывающую (`{`) и закрывающую (
`}`) фигурные скобки.

<!--todo: replace with docs-code -->

```html

pluralization_category { }
```

Следующие категории плюрализации доступны для английского языка и могут меняться в зависимости от локали.

| Категория плюрализации | Детали                     | Пример                     |
| :--------------------- | :------------------------- | :------------------------- |
| `zero`                 | Количество равно нулю      | `=0 { }` <br /> `zero { }` |
| `one`                  | Количество равно 1         | `=1 { }` <br /> `one { }`  |
| `two`                  | Количество равно 2         | `=2 { }` <br /> `two { }`  |
| `few`                  | Количество 2 или более     | `few { }`                  |
| `many`                 | Количество — большое число | `many { }`                 |
| `other`                | Количество по умолчанию    | `other { }`                |

Если ни одна из категорий плюрализации не совпадает, Angular использует `other` для соответствия стандартному варианту (
fallback) при отсутствии категории.

<!--todo: replace with docs-code -->

```html

other { default_quantity }
```

ПОЛЕЗНО: Для получения дополнительной информации о категориях плюрализации
см. [Выбор имен категорий множественного числа][UnicodeCldrIndexCldrSpecPluralRulesTocChoosingPluralCategoryNames]
в [CLDR - Общем репозитории данных локали Unicode][UnicodeCldrMain].

<docs-callout header='Справка: Локали могут не поддерживать некоторые категории плюрализации'>

Многие локали не поддерживают некоторые категории плюрализации.
Локаль по умолчанию (`en-US`) использует очень простую функцию `plural()`, которая не поддерживает категорию
плюрализации `few`.
Другая локаль с простой функцией `plural()` — это `es`.
В следующем примере кода показана функция [
`plural()` для en-US][GithubAngularAngularBlobEcffc3557fe1bff9718c01277498e877ca44588dPackagesCoreSrcI18nLocaleEnTsL14L18].

<docs-code path="adev/src/content/examples/i18n/doc-files/locale_plural_function.ts" class="no-box" hideCopy/>

Функция `plural()` возвращает только 1 (`one`) или 5 (`other`).
Категория `few` никогда не совпадает.

</docs-callout>

#### Пример `minutes`

Если вы хотите отобразить следующую фразу на английском языке, где `x` — это число.

<!--todo: replace output docs-code with screen capture image --->

```html

updated x minutes ago
```

И вы также хотите отображать следующие фразы в зависимости от количественного значения `x`.

<!--todo: replace output docs-code with screen capture image --->

```html

updated just now
```

<!--todo: replace output docs-code with screen capture image --->

```html

updated one minute ago
```

Используйте HTML-разметку и [интерполяции](guide/templates/binding#render-dynamic-text-with-text-interpolation).
В следующем примере кода показано, как использовать предложение `plural` для выражения трех предыдущих ситуаций в
элементе `<span>`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-plural"/>

Рассмотрите следующие детали в предыдущем примере кода.

| Параметры                         | Детали                                                                                                                        |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `minutes`                         | Первый параметр указывает, что свойство компонента — `minutes`, и определяет количество минут.                                |
| `plural`                          | Второй параметр указывает, что ICU-предложение — `plural`.                                                                    |
| `=0 {just now}`                   | Для нуля минут категория плюрализации — `=0`. Значение — `just now`.                                                          |
| `=1 {one minute}`                 | Для одной минуты категория плюрализации — `=1`. Значение — `one minute`.                                                      |
| `other {{{minutes}} minutes ago}` | Для любой несовпадающей количественности категория плюрализации по умолчанию — `other`. Значение — `{{minutes}} minutes ago`. |

`{{minutes}}` — это [интерполяция](guide/templates/binding#render-dynamic-text-with-text-interpolation).

### Разметка альтернатив и вложенных выражений

Предложение `select` отмечает варианты альтернативного текста на основе определенных вами строковых значений.

<!--todo: replace with docs-code -->

```html

{ component_property, select, selection_categories }
```

Переведите все альтернативы, чтобы отображать альтернативный текст в зависимости от значения переменной.

После категории выбора введите текст (английский), заключенный в открывающую (`{`) и закрывающую (`}`) фигурные скобки.

<!--todo: replace with docs-code -->

```html

selection_category { text }
```

В разных локалях существуют разные грамматические конструкции, что усложняет перевод.
Используйте HTML-разметку.
Если ни одна из категорий выбора не совпадает, Angular использует `other` для соответствия стандартному варианту при
отсутствии категории.

<!--todo: replace with docs-code -->

```html

other { default_value }
```

#### Пример `gender`

Если вы хотите отобразить следующую фразу на английском языке.

<!--todo: replace output docs-code with screen capture image --->

```html

The author is other
```

И вы также хотите отображать следующие фразы на основе свойства `gender` компонента.

<!--todo: replace output docs-code with screen capture image --->

```html

The author is female
```

<!--todo: replace output docs-code with screen capture image --->

```html

The author is male
```

В следующем примере кода показано, как привязать свойство `gender` компонента и использовать предложение `select` для
выражения трех предыдущих ситуаций в элементе `<span>`.

Свойство `gender` привязывает выходные данные к каждому из следующих строковых значений.

| Значение | Английское значение |
| :------- | :------------------ |
| female   | `female`            |
| male     | `male`              |
| other    | `other`             |

Предложение `select` сопоставляет значения с соответствующими переводами.
В следующем примере кода показано свойство `gender`, используемое с предложением select.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-select"/>

#### Пример `gender` и `minutes`

Комбинируйте различные предложения вместе, например, предложения `plural` и `select`.
В следующем примере кода показаны вложенные предложения, основанные на примерах `gender` и `minutes`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-nested"/>

## Что дальше

<docs-pill-row>
  <docs-pill href="guide/i18n/translation-files" title="Работа с файлами перевода"/>
</docs-pill-row>

[ApiLocalizeInitLocalize]: api/localize/init/$localize '$localize | init - localize - API  | Angular'
[GuideI18nCommonPrepareMarkAlternatesAndNestedExpressions]: guide/i18n/prepare#mark-alternates-and-nested-expressions 'Разметка альтернатив и вложенных выражений - Подготовка шаблонов к переводу | Angular'
[GuideI18nCommonPrepareMarkPlurals]: guide/i18n/prepare#mark-plurals 'Разметка множественного числа - Подготовка компонента к переводу | Angular'
[GuideI18nOptionalManageMarkedText]: guide/i18n/manage-marked-text 'Управление помеченным текстом с помощью пользовательских ID | Angular'
[GithubAngularAngularBlobEcffc3557fe1bff9718c01277498e877ca44588dPackagesCoreSrcI18nLocaleEnTsL14L18]: https://github.com/angular/angular/blob/ecffc3557fe1bff9718c01277498e877ca44588d/packages/core/src/i18n/locale_en.ts#L14-L18 'Строки с 14 по 18 - angular/packages/core/src/i18n/locale_en.ts | angular/angular | GitHub'
[GithubUnicodeOrgIcuUserguideFormatParseMessages]: https://unicode-org.github.io/icu/userguide/format_parse/messages 'Формат сообщений ICU - Документация ICU | Unicode | GitHub'
[UnicodeCldrMain]: https://cldr.unicode.org 'Проект Unicode CLDR'
[UnicodeCldrIndexCldrSpecPluralRules]: http://cldr.unicode.org/index/cldr-spec/plural-rules 'Правила плюрализации | CLDR - Общий репозиторий данных локали Unicode | Unicode'
[UnicodeCldrIndexCldrSpecPluralRulesTocChoosingPluralCategoryNames]: http://cldr.unicode.org/index/cldr-spec/plural-rules#TOC-Choosing-Plural-Category-Names 'Выбор имен категорий множественного числа - Правила плюрализации | CLDR - Общий репозиторий данных локали Unicode | Unicode'
