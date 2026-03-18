# Работа с файлами переводов

После подготовки компонента к переводу используйте команду [`extract-i18n`][CliExtractI18n] [Angular CLI][CliMain] для извлечения помеченного текста в компоненте в файл _исходного языка_.

Помеченный текст включает текст, помеченный `i18n`, атрибуты, помеченные `i18n-`_attribute_, и текст, тегированный `$localize`, как описано в [Подготовка компонента к переводу][GuideI18nCommonPrepare].

Выполните следующие шаги для создания и обновления файлов переводов для вашего проекта.

1. [Извлеките файл исходного языка][GuideI18nCommonTranslationFilesExtractTheSourceLanguageFile].
   1. При необходимости измените расположение, формат и имя.
1. Скопируйте файл исходного языка для [создания файла перевода для каждого языка][GuideI18nCommonTranslationFilesCreateATranslationFileForEachLanguage].
1. [Переведите каждый файл перевода][GuideI18nCommonTranslationFilesTranslateEachTranslationFile].
1. Переведите формы множественного числа и альтернативные выражения отдельно.
   1. [Переведите формы множественного числа][GuideI18nCommonTranslationFilesTranslatePlurals].
   1. [Переведите альтернативные выражения][GuideI18nCommonTranslationFilesTranslateAlternateExpressions].
   1. [Переведите вложенные выражения][GuideI18nCommonTranslationFilesTranslateNestedExpressions].

## Извлечение файла исходного языка {#extract-the-source-language-file}

Для извлечения файла исходного языка выполните следующие действия.

1. Откройте окно терминала.
1. Перейдите в корневой каталог вашего проекта.
1. Выполните следующую команду CLI.

<docs-code path="adev/src/content/examples/i18n/doc-files/commands.sh" region="extract-i18n-default"/>

Команда `extract-i18n` создаёт файл исходного языка с именем `messages.xlf` в корневом каталоге вашего проекта.
Дополнительные сведения о формате XML Localization Interchange File Format \(XLIFF, версия 1.2\) см. в [XLIFF][WikipediaWikiXliff].

Используйте следующие параметры команды [`extract-i18n`][CliExtractI18n] для изменения расположения, формата и имени файла исходного языка.

| Параметр команды | Подробности                                    |
| :--------------- | :--------------------------------------------- |
| `--format`       | Установить формат выходного файла              |
| `--out-file`     | Установить имя выходного файла                 |
| `--output-path`  | Установить путь к выходному каталогу           |

### Изменение расположения файла исходного языка {#change-the-source-language-file-location}

Для создания файла в каталоге `src/locale` укажите путь вывода в качестве параметра.

#### Пример `extract-i18n --output-path` {#extract-i18n-output-path-example}

В следующем примере путь вывода указывается в качестве параметра.

<docs-code path="adev/src/content/examples/i18n/doc-files/commands.sh" region="extract-i18n-output-path"/>

### Изменение формата файла исходного языка {#change-the-source-language-file-format}

Команда `extract-i18n` создаёт файлы в следующих форматах перевода.

| Формат перевода | Подробности                                                                                                                  | Расширение файла  |
| :-------------- | :--------------------------------------------------------------------------------------------------------------------------- | :---------------- |
| ARB             | [Application Resource Bundle][GithubGoogleAppResourceBundleWikiApplicationresourcebundlespecification]                       | `.arb`            |
| JSON            | [JavaScript Object Notation][JsonMain]                                                                                       | `.json`           |
| XLIFF 1.2       | [XML Localization Interchange File Format, version 1.2][OasisOpenDocsXliffXliffCoreXliffCoreHtml]                            | `.xlf`            |
| XLIFF 2         | [XML Localization Interchange File Format, version 2][OasisOpenDocsXliffXliffCoreV20Cos01XliffCoreV20Cose01Html]             | `.xlf`            |
| XMB             | [XML Message Bundle][UnicodeCldrDevelopmentDevelopmentProcessDesignProposalsXmb]                                             | `.xmb` \(`.xtb`\) |

Явно укажите формат перевода с помощью параметра команды `--format`.

HELPFUL: Формат XMB генерирует файлы исходного языка `.xmb`, но использует файлы перевода `.xtb`.

#### Пример `extract-i18n --format` {#extract-i18n-format-example}

В следующем примере демонстрируются несколько форматов перевода.

<docs-code path="adev/src/content/examples/i18n/doc-files/commands.sh" region="extract-i18n-formats"/>

### Изменение имени файла исходного языка {#change-the-source-language-file-name}

Чтобы изменить имя файла исходного языка, генерируемого инструментом извлечения, используйте параметр команды `--out-file`.

#### Пример `extract-i18n --out-file` {#extract-i18n-out-file-example}

В следующем примере демонстрируется именование выходного файла.

<docs-code path="adev/src/content/examples/i18n/doc-files/commands.sh" region="extract-i18n-out-file"/>

## Создание файла перевода для каждого языка {#create-a-translation-file-for-each-language}

Для создания файла перевода для локали или языка выполните следующие действия.

1. [Извлеките файл исходного языка][GuideI18nCommonTranslationFilesExtractTheSourceLanguageFile].
1. Сделайте копию файла исходного языка для создания _файла перевода_ для каждого языка.
1. Переименуйте _файл перевода_, добавив локаль.

   ```file {hideCopy}

   messages.xlf --> messages.{locale}.xlf

   ```

1. Создайте новый каталог в корне проекта с именем `locale`.

   ```file {hideCopy}

   src/locale

   ```

1. Переместите _файл перевода_ в новый каталог.
1. Отправьте _файл перевода_ переводчику.
1. Повторите указанные выше шаги для каждого языка, который вы хотите добавить в своё приложение.

### Пример `extract-i18n` для французского языка {#extract-i18n-example-for-french}

Например, для создания файла перевода на французский язык выполните следующие действия.

1. Выполните команду `extract-i18n`.
1. Сделайте копию файла исходного языка `messages.xlf`.
1. Переименуйте копию в `messages.fr.xlf` для перевода на французский язык \(`fr`\).
1. Переместите файл перевода `fr` в каталог `src/locale`.
1. Отправьте файл перевода `fr` переводчику.

## Перевод каждого файла перевода {#translate-each-translation-file}

Если вы не владеете языком в совершенстве и не располагаете временем для редактирования переводов, вы, вероятно, выполните следующие шаги.

1. Отправьте каждый файл перевода переводчику.
1. Переводчик использует редактор XLIFF-файлов для выполнения следующих действий.
   1. Создание перевода.
   1. Редактирование перевода.

### Пример процесса перевода для французского языка {#translation-process-example-for-french}

Для демонстрации процесса просмотрите файл `messages.fr.xlf` в [примере приложения Angular Internationalization][GuideI18nExample]. [Пример приложения Angular Internationalization][GuideI18nExample] включает перевод на французский язык, который можно редактировать без специального редактора XLIFF или знания французского.

Следующие действия описывают процесс перевода для французского языка.

1. Откройте `messages.fr.xlf` и найдите первый элемент `<trans-unit>`.
   Это _единица перевода_, также известная как _текстовый узел_, представляющая перевод тега приветствия `<h1>`, ранее помеченного атрибутом `i18n`.

   <docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translated-hello-before"/>

   `id="introductionHeader"` является [пользовательским ID][GuideI18nOptionalManageMarkedText], но без префикса `@@`, необходимого в исходном HTML.

1. Продублируйте элемент `<source>... </source>` в текстовом узле, переименуйте его в `target`, а затем замените содержимое текстом на французском языке.

   <docs-code header="src/locale/messages.fr.xlf (<trans-unit>, after translation)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translated-hello"/>

   При более сложном переводе информация и контекст в [элементах описания и смысла][GuideI18nCommonPrepareAddHelpfulDescriptionsAndMeanings] помогают выбрать правильные слова для перевода.

1. Переведите остальные текстовые узлы.
   В следующем примере показан способ перевода.

   <docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translated-other-nodes"/>

IMPORTANT: Не изменяйте ID единиц перевода.
Каждый атрибут `id` генерируется Angular и зависит от содержимого текста компонента и присвоенного смысла.

Если вы изменяете текст или смысл, атрибут `id` также изменяется.
Дополнительные сведения об управлении обновлениями текста и ID см. в [пользовательских ID][GuideI18nOptionalManageMarkedText].

## Перевод форм множественного числа {#translate-plurals}

Добавляйте или удаляйте варианты множественного числа по мере необходимости для каждого языка.

HELPFUL: Правила множественного числа для языков см. в [правилах множественного числа CLDR][GithubUnicodeOrgCldrStagingChartsLatestSupplementalLanguagePluralRulesHtml].

### Пример `minute` `plural` {#minute-plural-example}

Для перевода `plural` переведите значения совпадений формата ICU.

- `just now`
- `one minute ago`
- `<x id="INTERPOLATION" equiv-text="{{minutes}}"/> minutes ago`

В следующем примере показан способ перевода.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translated-plural"/>

## Перевод альтернативных выражений {#translate-alternate-expressions}

Angular также извлекает альтернативные ICU-выражения `select` как отдельные единицы перевода.

### Пример `gender` `select` {#gender-select-example}

В следующем примере показано ICU-выражение `select` в шаблоне компонента.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-select"/>

В этом примере Angular извлекает выражение в две единицы перевода.
Первая содержит текст вне предложения `select` и использует заполнитель для `select` \(`<x id="ICU">`\):

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translate-select-1"/>

IMPORTANT: При переводе текста при необходимости перемещайте заполнитель, но не удаляйте его.
Если вы удалите заполнитель, ICU-выражение будет удалено из переведённого приложения.

В следующем примере показана вторая единица перевода, содержащая предложение `select`.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translate-select-2"/>

В следующем примере показаны обе единицы перевода после завершения перевода.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translated-select"/>

## Перевод вложенных выражений {#translate-nested-expressions}

Angular обрабатывает вложенные выражения так же, как альтернативные.
Angular извлекает выражение в две единицы перевода.

### Пример вложенного `plural` {#nested-plural-example}

В следующем примере показана первая единица перевода, содержащая текст вне вложенного выражения.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translate-nested-1"/>

В следующем примере показана вторая единица перевода, содержащая полное вложенное выражение.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translate-nested-2"/>

В следующем примере показаны обе единицы перевода после перевода.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translate-nested"/>

## Что дальше {#whats-next}

<docs-pill-row>
  <docs-pill href="guide/i18n/merge" title="Слияние переводов в приложение"/>
</docs-pill-row>

[CliMain]: cli 'CLI Overview and Command Reference | Angular'
[CliExtractI18n]: cli/extract-i18n 'ng extract-i18n | CLI | Angular'
[GuideI18nCommonPrepare]: guide/i18n/prepare 'Prepare component for translation | Angular'
[GuideI18nCommonPrepareAddHelpfulDescriptionsAndMeanings]: guide/i18n/prepare#add-helpful-descriptions-and-meanings 'Add helpful descriptions and meanings - Prepare component for translation | Angular'
[GuideI18nCommonTranslationFilesCreateATranslationFileForEachLanguage]: guide/i18n/translation-files#create-a-translation-file-for-each-language 'Create a translation file for each language - Work with translation files | Angular'
[GuideI18nCommonTranslationFilesExtractTheSourceLanguageFile]: guide/i18n/translation-files#extract-the-source-language-file 'Extract the source language file - Work with translation files | Angular'
[GuideI18nCommonTranslationFilesTranslateAlternateExpressions]: guide/i18n/translation-files#translate-alternate-expressions 'Translate alternate expressions - Work with translation files | Angular'
[GuideI18nCommonTranslationFilesTranslateEachTranslationFile]: guide/i18n/translation-files#translate-each-translation-file 'Translate each translation file - Work with translation files | Angular'
[GuideI18nCommonTranslationFilesTranslateNestedExpressions]: guide/i18n/translation-files#translate-nested-expressions 'Translate nested expressions - Work with translation files | Angular'
[GuideI18nCommonTranslationFilesTranslatePlurals]: guide/i18n/translation-files#translate-plurals 'Translate plurals - Work with translation files | Angular'
[GuideI18nExample]: guide/i18n/example 'Example Angular Internationalization application | Angular'
[GuideI18nOptionalManageMarkedText]: guide/i18n/manage-marked-text 'Manage marked text with custom IDs | Angular'
[GithubGoogleAppResourceBundleWikiApplicationresourcebundlespecification]: https://github.com/google/app-resource-bundle/wiki/ApplicationResourceBundleSpecification 'ApplicationResourceBundleSpecification | google/app-resource-bundle | GitHub'
[GithubUnicodeOrgCldrStagingChartsLatestSupplementalLanguagePluralRulesHtml]: https://cldr.unicode.org/index/cldr-spec/plural-rules 'Language Plural Rules - CLDR Charts | Unicode | GitHub'
[JsonMain]: https://www.json.org 'Introducing JSON | JSON'
[OasisOpenDocsXliffXliffCoreXliffCoreHtml]: https://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html 'XLIFF Version 1.2 Specification | Oasis Open Docs'
[OasisOpenDocsXliffXliffCoreV20Cos01XliffCoreV20Cose01Html]: http://docs.oasis-open.org/xliff/xliff-core/v2.0/cos01/xliff-core-v2.0-cos01.html 'XLIFF Version 2.0 | Oasis Open Docs'
[UnicodeCldrDevelopmentDevelopmentProcessDesignProposalsXmb]: http://cldr.unicode.org/development/development-process/design-proposals/xmb 'XMB | CLDR - Unicode Common Locale Data Repository | Unicode'
[WikipediaWikiXliff]: https://en.wikipedia.org/wiki/XLIFF 'XLIFF | Wikipedia'
