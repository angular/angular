# Работа с файлами перевода {#work-with-translation-files}

После подготовки компонента к переводу используйте команду [`extract-i18n`][CliExtractI18n] [Angular CLI][CliMain] для извлечения размеченного текста компонента в _файл исходного языка_.

Размеченный текст включает текст, помеченный атрибутом `i18n`, строки атрибутов, помеченные `i18n-`_attribute_, и текст, теговый с `$localize`, как описано в разделе [Подготовка компонента к переводу][GuideI18nCommonPrepare].

Выполните следующие шаги для создания и обновления файлов перевода проекта.

1. [Извлеките файл исходного языка][GuideI18nCommonTranslationFilesExtractTheSourceLanguageFile].
   1. При необходимости измените расположение, формат и имя.
1. Скопируйте файл исходного языка для [создания файла перевода для каждого языка][GuideI18nCommonTranslationFilesCreateATranslationFileForEachLanguage].
1. [Переведите каждый файл перевода][GuideI18nCommonTranslationFilesTranslateEachTranslationFile].
1. Отдельно переведите множественные числа и альтернативные выражения.
   1. [Перевод множественных чисел][GuideI18nCommonTranslationFilesTranslatePlurals].
   1. [Перевод альтернативных выражений][GuideI18nCommonTranslationFilesTranslateAlternateExpressions].
   1. [Перевод вложенных выражений][GuideI18nCommonTranslationFilesTranslateNestedExpressions].

## Извлечение файла исходного языка {#extract-the-source-language-file}

Чтобы извлечь файл исходного языка, выполните следующие действия.

1. Откройте окно терминала.
1. Перейдите в корневой каталог проекта.
1. Выполните следующую команду CLI.

<docs-code path="adev/src/content/examples/i18n/doc-files/commands.sh" region="extract-i18n-default"/>

Команда `extract-i18n` создаёт файл исходного языка с именем `messages.xlf` в корневом каталоге проекта.
Подробнее о формате файлов XML Localization Interchange File Format \(XLIFF, версия 1.2\) см. в статье [XLIFF][WikipediaWikiXliff].

Используйте следующие параметры команды [`extract-i18n`][CliExtractI18n] для изменения расположения, формата и имени файла исходного языка.

| Параметр команды | Описание                                  |
| :--------------- | :---------------------------------------- |
| `--format`       | Задаёт формат выходного файла             |
| `--out-file`     | Задаёт имя выходного файла                |
| `--output-path`  | Задаёт путь к выходному каталогу          |

### Изменение расположения файла исходного языка {#change-the-source-language-file-location}

Чтобы создать файл в каталоге `src/locale`, укажите путь вывода в качестве параметра.

#### Пример `extract-i18n --output-path` {#extract-i18n-output-path-example}

Следующий пример задаёт путь вывода в качестве параметра.

<docs-code path="adev/src/content/examples/i18n/doc-files/commands.sh" region="extract-i18n-output-path"/>

### Изменение формата файла исходного языка {#change-the-source-language-file-format}

Команда `extract-i18n` создаёт файлы в следующих форматах перевода.

| Формат перевода | Описание                                                                                                                   | Расширение файла  |
| :-------------- | :------------------------------------------------------------------------------------------------------------------------- | :---------------- |
| ARB             | [Application Resource Bundle][GithubGoogleAppResourceBundleWikiApplicationresourcebundlespecification]                     | `.arb`            |
| JSON            | [JavaScript Object Notation][JsonMain]                                                                                     | `.json`           |
| XLIFF 1.2       | [XML Localization Interchange File Format, версия 1.2][OasisOpenDocsXliffXliffCoreXliffCoreHtml]                          | `.xlf`            |
| XLIFF 2         | [XML Localization Interchange File Format, версия 2][OasisOpenDocsXliffXliffCoreV20Cos01XliffCoreV20Cose01Html]            | `.xlf`            |
| XMB             | [XML Message Bundle][UnicodeCldrDevelopmentDevelopmentProcessDesignProposalsXmb]                                           | `.xmb` \(`.xtb`\) |

Явно укажите формат перевода с помощью параметра команды `--format`.

HELPFUL: Формат XMB создаёт файлы исходного языка `.xmb`, но использует файлы перевода `.xtb`.

#### Пример `extract-i18n --format` {#extract-i18n-format-example}

Следующий пример демонстрирует несколько форматов перевода.

<docs-code path="adev/src/content/examples/i18n/doc-files/commands.sh" region="extract-i18n-formats"/>

### Изменение имени файла исходного языка {#change-the-source-language-file-name}

Чтобы изменить имя файла исходного языка, создаваемого инструментом извлечения, используйте параметр `--out-file`.

#### Пример `extract-i18n --out-file` {#extract-i18n-out-file-example}

Следующий пример демонстрирует именование выходного файла.

<docs-code path="adev/src/content/examples/i18n/doc-files/commands.sh" region="extract-i18n-out-file"/>

## Создание файла перевода для каждого языка {#create-a-translation-file-for-each-language}

Чтобы создать файл перевода для локали или языка, выполните следующие действия.

1. [Извлеките файл исходного языка][GuideI18nCommonTranslationFilesExtractTheSourceLanguageFile].
1. Создайте копию файла исходного языка — это будет _файл перевода_ для каждого языка.
1. Переименуйте _файл перевода_, добавив локаль.

   ```file {hideCopy}

   messages.xlf --> messages.{locale}.xlf

   ```

1. Создайте новый каталог `locale` в корне проекта.

   ```file {hideCopy}

   src/locale

   ```

1. Переместите _файл перевода_ в новый каталог.
1. Отправьте _файл перевода_ переводчику.
1. Повторите описанные шаги для каждого языка, который нужно добавить в приложение.

### Пример `extract-i18n` для французского языка {#extract-i18n-example-for-french}

Например, чтобы создать файл перевода на французском языке, выполните следующие действия.

1. Выполните команду `extract-i18n`.
1. Создайте копию файла исходного языка `messages.xlf`.
1. Переименуйте копию в `messages.fr.xlf` для перевода на французский язык \(`fr`\).
1. Переместите файл `fr` перевода в каталог `src/locale`.
1. Отправьте файл `fr` перевода переводчику.

## Перевод каждого файла перевода {#translate-each-translation-file}

Если вы не владеете языком свободно и у вас нет времени редактировать переводы, вероятно, вы выполните следующие шаги.

1. Отправьте каждый файл перевода переводчику.
1. Переводчик использует редактор файлов XLIFF для выполнения следующих действий.
   1. Создание перевода.
   1. Редактирование перевода.

### Пример процесса перевода для французского языка {#translation-process-example-for-french}

Для демонстрации процесса рассмотрим файл `messages.fr.xlf` в [примере приложения Angular Internationalization][GuideI18nExample]. [Пример приложения Angular Internationalization][GuideI18nExample] включает перевод на французский язык, который можно редактировать без специального редактора XLIFF или знания французского.

Следующие действия описывают процесс перевода для французского языка.

1. Откройте `messages.fr.xlf` и найдите первый элемент `<trans-unit>`.
   Это _единица перевода_, также известная как _текстовый узел_, представляющая перевод тега приветствия `<h1>`, ранее помеченного атрибутом `i18n`.

   <docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translated-hello-before"/>

   `id="introductionHeader"` — это [пользовательский идентификатор][GuideI18nOptionalManageMarkedText], но без префикса `@@`, обязательного в исходном HTML.

1. Продублируйте элемент `<source>... </source>` в текстовом узле, переименуйте его в `target`, затем замените содержимое французским текстом.

   <docs-code header="src/locale/messages.fr.xlf (<trans-unit>, after translation)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translated-hello"/>

   В более сложном переводе информация и контекст в [элементах описания и значения][GuideI18nCommonPrepareAddHelpfulDescriptionsAndMeanings] помогают выбрать правильные слова для перевода.

1. Переведите остальные текстовые узлы.
   Следующий пример демонстрирует способ перевода.

   <docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translated-other-nodes"/>

IMPORTANT: Не изменяйте идентификаторы единиц перевода.
Каждый атрибут `id` генерируется Angular и зависит от содержимого текста компонента и присвоенного значения.

Если изменить текст или значение, атрибут `id` также изменится.
Подробнее об управлении обновлениями текста и идентификаторами см. в разделе [пользовательские идентификаторы][GuideI18nOptionalManageMarkedText].

## Перевод множественных чисел {#translate-plurals}

Добавляйте или удаляйте варианты множественного числа по мере необходимости для каждого языка.

HELPFUL: Правила образования множественного числа для языков см. в [правилах склонения CLDR][GithubUnicodeOrgCldrStagingChartsLatestSupplementalLanguagePluralRulesHtml].

### Пример `minute` `plural` {#minute-plural-example}

Для перевода `plural` переведите значения совпадений формата ICU.

- `just now`
- `one minute ago`
- `<x id="INTERPOLATION" equiv-text="{{minutes}}"/> minutes ago`

Следующий пример демонстрирует способ перевода.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translated-plural"/>

## Перевод альтернативных выражений {#translate-alternate-expressions}

Angular также извлекает альтернативные ICU-выражения `select` как отдельные единицы перевода.

### Пример `gender` `select` {#gender-select-example}

Следующий пример отображает ICU-выражение `select` в шаблоне компонента.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" region="i18n-select"/>

В этом примере Angular извлекает выражение в две единицы перевода.
Первая содержит текст вне предложения `select` и использует заполнитель для `select` \(`<x id="ICU">`\):

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translate-select-1"/>

IMPORTANT: При переводе текста перемещайте заполнитель при необходимости, но не удаляйте его.
Если удалить заполнитель, ICU-выражение будет удалено из переведённого приложения.

Следующий пример отображает вторую единицу перевода, содержащую предложение `select`.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translate-select-2"/>

Следующий пример отображает обе единицы перевода после завершения перевода.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translated-select"/>

## Перевод вложенных выражений {#translate-nested-expressions}

Angular обрабатывает вложенное выражение так же, как альтернативное.
Angular извлекает выражение в две единицы перевода.

### Пример вложенного `plural` {#nested-plural-example}

Следующий пример отображает первую единицу перевода, содержащую текст вне вложенного выражения.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translate-nested-1"/>

Следующий пример отображает вторую единицу перевода, содержащую полное вложенное выражение.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translate-nested-2"/>

Следующий пример отображает обе единицы перевода после перевода.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf" visibleRegion="translate-nested"/>

## Что дальше {#whats-next}

<docs-pill-row>
  <docs-pill href="guide/i18n/merge" title="Объединение переводов в приложении"/>
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
