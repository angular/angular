# Подготовка компонента к переводу {#prepare-component-for-translation}

Для подготовки проекта к переводу выполните следующие действия.

- Используйте атрибут `i18n` для пометки текста в шаблонах компонентов
- Используйте атрибут `i18n-` для пометки строк текста атрибутов в шаблонах компонентов
- Используйте тегированную строку сообщения `$localize` для пометки строк текста в коде компонентов

## Пометка текста в шаблоне компонента {#mark-text-in-component-template}

В шаблоне компонента метаданные i18n — это значение атрибута `i18n`.

```html
<element i18n="{i18n_metadata}">{string_to_translate}</element>
```

Используйте атрибут `i18n` для пометки статических текстовых сообщений в шаблонах компонентов для перевода.
Размещайте его на каждом теге элемента, содержащем фиксированный текст, который вы хотите перевести.

HELPFUL: Атрибут `i18n` — это пользовательский атрибут, распознаваемый инструментами и компиляторами Angular.

### Пример `i18n` {#i18n-example}

Следующий тег `<h1>` отображает простое приветствие на английском языке «Hello i18n!».

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="greeting"/>

Чтобы пометить приветствие для перевода, добавьте атрибут `i18n` к тегу `<h1>`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-attribute"/>

### Использование условного оператора с `i18n` {#using-conditional-statement-with-i18n}

Следующий тег `<div>` будет отображать переведённый текст как часть `div` и `aria-label` в зависимости от состояния переключателя

<docs-code-multifile>
    <docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html"  region="i18n-conditional"/>
    <docs-code header="app.component.ts" path="adev/src/content/examples/i18n/src/app/app.component.ts" visibleLines="[[14,21],[33,37]]"/>
</docs-code-multifile>

### Перевод встроенного текста без HTML-элемента {#translate-inline-text-without-html-element}

Используйте элемент `<ng-container>` для связывания поведения перевода с конкретным текстом без изменения способа отображения текста.

HELPFUL: Каждый HTML-элемент создаёт новый DOM-элемент.
Чтобы избежать создания нового DOM-элемента, оберните текст в элемент `<ng-container>`.
В следующем примере показан элемент `<ng-container>`, преобразованный в невидимый HTML-комментарий.

<docs-code path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-ng-container"/>

## Пометка атрибутов элементов для переводов {#mark-element-attributes-for-translations}

В шаблоне компонента метаданные i18n — это значение атрибута `i18n-{attribute_name}`.

```html
<element i18n-{attribute_name}="{i18n_metadata}" {attribute_name}="{attribute_value}" />
```

Атрибуты HTML-элементов включают текст, который должен быть переведён вместе с остальным отображаемым текстом в шаблоне компонента.

Используйте `i18n-{attribute_name}` для любого атрибута любого элемента, заменяя `{attribute_name}` именем атрибута.
Используйте следующий синтаксис для назначения смысла, описания и пользовательского ID.

```html
i18n-{attribute_name}="{meaning}|{description}@@{id}"
```

### Пример `i18n-title` {#i18n-title-example}

Для перевода заголовка изображения рассмотрите следующий пример.
В примере ниже отображается изображение с атрибутом `title`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-title"/>

Чтобы пометить атрибут title для перевода, выполните следующее действие.

Добавьте атрибут `i18n-title`

В следующем примере показано, как пометить атрибут `title` на теге `img`, добавив `i18n-title`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-title-translate"/>

## Пометка текста в коде компонента {#mark-text-in-component-code}

В коде компонента исходный текст перевода и метаданные заключены в символы обратных кавычек \(<code>&#96;</code>\).

Используйте тегированную строку сообщения [`$localize`][ApiLocalizeInitLocalize] для пометки строки в коде для перевода.

```ts
$localize`string_to_translate`;
```

Метаданные i18n заключены в символы двоеточия \(`:`\) и предшествуют исходному тексту перевода.

```ts
$localize`:{i18n_metadata}:string_to_translate`;
```

### Включение интерполированного текста {#include-interpolated-text}

Включите [интерполяции](guide/templates/binding#render-dynamic-text-with-text-interpolation) в тегированную строку сообщения [`$localize`][ApiLocalizeInitLocalize].

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

Следующие параметры предоставляют контекст и дополнительную информацию для снижения путаницы у переводчика.

| Параметр метаданных | Подробности                                                                  |
| :------------------ | :--------------------------------------------------------------------------- |
| Custom ID           | Укажите пользовательский идентификатор                                       |
| Description         | Предоставьте дополнительную информацию или контекст                          |
| Meaning             | Укажите значение или намерение текста в конкретном контексте                 |

Дополнительные сведения о пользовательских ID см. в [Управление помеченным текстом с помощью пользовательских ID][GuideI18nOptionalManageMarkedText].

### Добавление полезных описаний и смыслов {#add-helpful-descriptions-and-meanings}

Для точного перевода текстового сообщения предоставьте переводчику дополнительную информацию или контекст.

Добавьте _описание_ текстового сообщения в качестве значения атрибута `i18n` или тегированной строки сообщения [`$localize`][ApiLocalizeInitLocalize].

В следующем примере показано значение атрибута `i18n`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-attribute-desc"/>

В следующем примере показано значение тегированной строки сообщения [`$localize`][ApiLocalizeInitLocalize] с описанием.

```ts
$localize`:An introduction header for this sample:Hello i18n!`;
```

Переводчику также может потребоваться знать значение или намерение текстового сообщения в данном контексте приложения, чтобы перевести его так же, как другой текст с тем же значением.
Начните значение атрибута `i18n` со _смысла_ и отделите его от _описания_ символом `|`: `{meaning}|{description}`.

#### Пример `h1` {#h1-example}

Например, вы можете указать, что тег `<h1>` является заголовком сайта, который нужно перевести одинаково, независимо от того, используется ли он как заголовок или упоминается в другой части текста.

В следующем примере показано, как указать, что тег `<h1>` должен переводиться как заголовок или упоминаться в другом месте.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/doc-files/app.component.html" region="i18n-attribute-meaning"/>

В результате любой текст, помеченный `site header` как _смысл_, переводится одинаково.

В следующем примере показано значение тегированной строки сообщения [`$localize`][ApiLocalizeInitLocalize] со смыслом и описанием.

```ts
$localize`:site header|An introduction header for this sample:Hello i18n!`;
```

<docs-callout title="Как смыслы управляют извлечением и слиянием текста">

Инструмент извлечения Angular генерирует запись единицы перевода для каждого атрибута `i18n` в шаблоне.
Инструмент извлечения Angular присваивает каждой единице перевода уникальный ID на основе _смысла_ и _описания_.

HELPFUL: Дополнительные сведения об инструменте извлечения Angular см. в [Работа с файлами переводов](guide/i18n/translation-files).

Одинаковые текстовые элементы с разными _смыслами_ извлекаются с разными ID.
Например, если слово «right» используется в двух разных значениях в двух разных местах, слово переводится по-разному и объединяется обратно в приложение как разные записи перевода.

- `correct` — как в «you are right»
- `direction` — как в «turn right»

Если одинаковые текстовые элементы удовлетворяют следующим условиям, они извлекаются только один раз и используют один и тот же ID.

- Одинаковый смысл или определение
- Разные описания

Эта одна запись перевода объединяется обратно в приложение везде, где появляются одинаковые текстовые элементы.

</docs-callout>

## ICU-выражения {#icu-expressions}

ICU-выражения помогают помечать альтернативный текст в шаблонах компонентов для соответствия условиям.
ICU-выражение включает свойство компонента, предложение ICU и варианты, заключённые в открывающую фигурную скобку \(`{`\) и закрывающую фигурную скобку \(`}`\).

```html
{ component_property, icu_clause, case_statements }
```

Свойство компонента определяет переменную.
Предложение ICU определяет тип условного текста.

| Предложение ICU                                                              | Подробности                                                                       |
| :--------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| [`plural`][GuideI18nCommonPrepareMarkPlurals]                                | Пометка использования числа во множественном числе                                |
| [`select`][GuideI18nCommonPrepareMarkAlternatesAndNestedExpressions]         | Пометка вариантов альтернативного текста на основе определённых строковых значений |

Для упрощения перевода используйте предложения International Components for Unicode \(ICU\) с регулярными выражениями.

HELPFUL: Предложения ICU соответствуют [формату ICU Message Format][GithubUnicodeOrgIcuUserguideFormatParseMessages], указанному в [правилах множественного числа CLDR][UnicodeCldrIndexCldrSpecPluralRules].

### Пометка множественного числа {#mark-plurals}

В разных языках действуют разные правила образования множественного числа, что усложняет перевод.
Поскольку другие локали выражают кардинальность по-разному, может потребоваться задать категории множественного числа, не совпадающие с английскими.
Используйте предложение `plural` для пометки выражений, которые могут потерять смысл при дословном переводе.

```html
{ component_property, plural, pluralization_categories }
```

После категории множественного числа введите стандартный текст \(на английском\), заключённый в открывающую фигурную скобку \(`{`\) и закрывающую фигурную скобку \(`}`\).

```html
pluralization_category { }
```

Для английского языка доступны следующие категории множественного числа, которые могут изменяться в зависимости от локали.

| Категория множественного числа | Подробности                        | Пример                      |
| :----------------------------- | :--------------------------------- | :--------------------------- |
| `zero`                         | Количество равно нулю              | `=0 { }` <br /> `zero { }` |
| `one`                          | Количество равно 1                 | `=1 { }` <br /> `one { }`  |
| `two`                          | Количество равно 2                 | `=2 { }` <br /> `two { }`  |
| `few`                          | Количество равно 2 или более       | `few { }`                   |
| `many`                         | Количество является большим числом | `many { }`                  |
| `other`                        | Количество по умолчанию            | `other { }`                 |

Если ни одна из категорий множественного числа не совпадает, Angular использует `other` как стандартный запасной вариант для отсутствующей категории.

```html
other { default_quantity }
```

HELPFUL: Дополнительные сведения о категориях множественного числа см. в [Выбор имён категорий множественного числа][UnicodeCldrIndexCldrSpecPluralRulesTocChoosingPluralCategoryNames] в [CLDR - Unicode Common Locale Data Repository][UnicodeCldrMain].

<docs-callout header='Справка: Локали могут не поддерживать некоторые категории множественного числа'>

Многие локали не поддерживают некоторые категории множественного числа.
Локаль по умолчанию \(`en-US`\) использует очень простую функцию `plural()`, не поддерживающую категорию множественного числа `few`.
Другая локаль с простой функцией `plural()` — `es`.
В следующем примере кода показана функция [en-US `plural()`][GithubAngularAngularBlobEcffc3557fe1bff9718c01277498e877ca44588dPackagesCoreSrcI18nLocaleEnTsL14L18].

<docs-code path="adev/src/content/examples/i18n/doc-files/locale_plural_function.ts" class="no-box" hideCopy/>

Функция `plural()` возвращает только 1 \(`one`\) или 5 \(`other`\).
Категория `few` никогда не совпадает.

</docs-callout>

#### Пример `minutes` {#minutes-example}

Если вы хотите отобразить следующую фразу на английском, где `x` — число.

```html
updated x minutes ago
```

И также отобразить следующие фразы в зависимости от кардинальности `x`.

```html
updated just now
```

```html
updated one minute ago
```

Используйте HTML-разметку и [интерполяции](guide/templates/binding#render-dynamic-text-with-text-interpolation).
В следующем примере показано, как использовать предложение `plural` для выражения трёх приведённых выше ситуаций в элементе `<span>`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-plural"/>

Рассмотрим следующие детали предыдущего примера кода.

| Параметры                         | Подробности                                                                                                              |
| :-------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| `minutes`                         | Первый параметр указывает, что свойство компонента — `minutes`, и определяет количество минут.                           |
| `plural`                          | Второй параметр указывает, что предложение ICU — `plural`.                                                               |
| `=0 {just now}`                   | Для нуля минут категория множественного числа — `=0`. Значение — `just now`.                                             |
| `=1 {one minute}`                 | Для одной минуты категория множественного числа — `=1`. Значение — `one minute`.                                         |
| `other {{{minutes}} minutes ago}` | Для любой несовпадающей кардинальности стандартная категория множественного числа — `other`. Значение — `{{minutes}} minutes ago`. |

`{{minutes}}` — это [интерполяция](guide/templates/binding#render-dynamic-text-with-text-interpolation).

### Пометка альтернатив и вложенных выражений {#mark-alternates-and-nested-expressions}

Предложение `select` помечает варианты альтернативного текста на основе определённых строковых значений.

```html
{ component_property, select, selection_categories }
```

Переведите все альтернативы для отображения альтернативного текста в зависимости от значения переменной.

После категории выбора введите текст \(на английском\), заключённый в открывающую фигурную скобку \(`{`\) и закрывающую фигурную скобку \(`}`\).

```html
selection_category { text }
```

Разные локали имеют разные грамматические конструкции, усложняющие перевод.
Используйте HTML-разметку.
Если ни одна из категорий выбора не совпадает, Angular использует `other` как стандартный запасной вариант для отсутствующей категории.

```html
other { default_value }
```

#### Пример `gender` {#gender-example}

Если вы хотите отобразить следующую фразу на английском.

```html
The author is other
```

И также отобразить следующие фразы в зависимости от свойства `gender` компонента.

```html
The author is female
```

```html
The author is male
```

В следующем примере показано, как привязать свойство `gender` компонента и использовать предложение `select` для выражения трёх приведённых выше ситуаций в элементе `<span>`.

Свойство `gender` связывает выходные данные с каждым из следующих строковых значений.

| Значение | Значение на английском |
| :------- | :--------------------- |
| female   | `female`               |
| male     | `male`                 |
| other    | `other`                |

Предложение `select` сопоставляет значения с соответствующими переводами.
В следующем примере показано свойство `gender`, используемое с предложением select.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-select"/>

#### Пример `gender` и `minutes` {#gender-and-minutes-example}

Объедините различные предложения вместе, например `plural` и `select`.
В следующем примере показаны вложенные предложения на основе примеров `gender` и `minutes`.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-nested"/>

## Что дальше {#whats-next}

<docs-pill-row>
  <docs-pill href="guide/i18n/translation-files" title="Работа с файлами переводов"/>
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
