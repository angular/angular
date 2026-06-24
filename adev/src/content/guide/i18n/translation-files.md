# Работа с файлами перевода

После подготовки компонента к переводу используйте команду [`extract-i18n`][CliExtractI18n] [Angular CLI][CliMain],
чтобы извлечь помеченный текст из компонента в файл _исходного языка_.

Помеченный текст включает текст с атрибутом `i18n`, атрибуты с `i18n-`_attribute_ и текст с тегом `$localize`, как
описано в разделе [Подготовка компонента к переводу][GuideI18nCommonPrepare].

Выполните следующие шаги для создания и обновления файлов перевода вашего проекта.

1. [Извлеките файл исходного языка][GuideI18nCommonTranslationFilesExtractTheSourceLanguageFile].
1. При необходимости измените расположение, формат и имя.
1. Скопируйте файл исходного языка,
   чтобы [создать файл перевода для каждого языка][GuideI18nCommonTranslationFilesCreateATranslationFileForEachLanguage].
1. [Переведите каждый файл перевода][GuideI18nCommonTranslationFilesTranslateEachTranslationFile].
1. Переводите формы множественного числа и альтернативные выражения отдельно.
1. [Перевод форм множественного числа][GuideI18nCommonTranslationFilesTranslatePlurals].
1. [Перевод альтернативных выражений][GuideI18nCommonTranslationFilesTranslateAlternateExpressions].
1. [Перевод вложенных выражений][GuideI18nCommonTranslationFilesTranslateNestedExpressions].

## Извлечение файла исходного языка

Чтобы извлечь файл исходного языка, выполните следующие действия.

1. Откройте терминал.
1. Перейдите в корневую директорию вашего проекта.
1. Запустите следующую команду CLI.

<docs-code path="adev/src/content/examples/i18n/doc-files/commands.sh" visibleRegion="extract-i18n-default"/>

Команда `extract-i18n` создает файл исходного языка с именем `messages.xlf` в корневой директории вашего проекта.
Для получения дополнительной информации о формате XML Localization Interchange File Format (XLIFF, версия 1.2)
см. [XLIFF][WikipediaWikiXliff].

Используйте следующие опции команды [`extract-i18n`][CliExtractI18n] для изменения расположения, формата и имени файла
исходного языка.

| Опция команды   | Детали                                |
| :-------------- | :------------------------------------ |
| `--format`      | Установить формат выходного файла     |
| `--out-file`    | Установить имя выходного файла        |
| `--output-path` | Установить путь к выходной директории |

### Изменение расположения файла исходного языка

Чтобы создать файл в директории `src/locale`, укажите путь вывода в качестве опции.

#### Пример `extract-i18n --output-path`

В следующем примере путь вывода указывается как опция.

<docs-code path="adev/src/content/examples/i18n/doc-files/commands.sh" visibleRegion="extract-i18n-output-path"/>

### Изменение формата файла исходного языка

Команда `extract-i18n` создает файлы в следующих форматах перевода.

| Формат перевода | Детали                                                                                                          | Расширение файла  |
| :-------------- | :-------------------------------------------------------------------------------------------------------------- | :---------------- |
| ARB             | [Application Resource Bundle][GithubGoogleAppResourceBundleWikiApplicationresourcebundlespecification]          | `.arb`            |
| JSON            | [JavaScript Object Notation][JsonMain]                                                                          | `.json`           |
| XLIFF 1.2       | [XML Localization Interchange File Format, версия 1.2][OasisOpenDocsXliffXliffCoreXliffCoreHtml]                | `.xlf`            |
| XLIFF 2         | [XML Localization Interchange File Format, версия 2][OasisOpenDocsXliffXliffCoreV20Cos01XliffCoreV20Cose01Html] | `.xlf`            |
| XMB             | [XML Message Bundle][UnicodeCldrDevelopmentDevelopmentProcessDesignProposalsXmb]                                | `.xmb` \(`.xtb`\) |

Явно укажите формат перевода с помощью опции команды `--format`.

ПОЛЕЗНО: Формат XMB генерирует файлы исходного языка `.xmb`, но использует файлы перевода `.xtb`.

#### Пример `extract-i18n --format`

Следующий пример демонстрирует несколько форматов перевода.

<docs-code path="adev/src/content/examples/i18n/doc-files/commands.sh" visibleRegion="extract-i18n-formats"/>

### Изменение имени файла исходного языка

Чтобы изменить имя файла исходного языка, создаваемого инструментом извлечения, используйте опцию команды `--out-file`.

#### Пример `extract-i18n --out-file`

Следующий пример демонстрирует именование выходного файла.

<docs-code path="adev/src/content/examples/i18n/doc-files/commands.sh" visibleRegion="extract-i18n-out-file"/>

## Создание файла перевода для каждого языка

Чтобы создать файл перевода для локали или языка, выполните следующие действия.

1. [Извлеките файл исходного языка][GuideI18nCommonTranslationFilesExtractTheSourceLanguageFile].
1. Сделайте копию файла исходного языка, чтобы создать файл _перевода_ для каждого языка.
1. Переименуйте файл _перевода_, добавив локаль.

   <docs-code language="file">

   messages.xlf --> messages.{locale}.xlf

   </docs-code>

1. Создайте новую директорию в корне проекта с именем `locale`.

   <docs-code language="file">

   src/locale

   </docs-code>

1. Переместите файл _перевода_ в новую директорию.
1. Отправьте файл _перевода_ вашему переводчику.
1. Повторите вышеуказанные шаги для каждого языка, который вы хотите добавить в приложение.

### Пример `extract-i18n` для французского языка

Например, чтобы создать файл перевода на французский язык, выполните следующие действия.

1. Запустите команду `extract-i18n`.
1. Сделайте копию файла исходного языка `messages.xlf`.
1. Переименуйте копию в `messages.fr.xlf` для перевода на французский язык \(`fr`\).
1. Переместите файл перевода `fr` в директорию `src/locale`.
1. Отправьте файл перевода `fr` переводчику.

## Перевод каждого файла перевода

Если вы не владеете языком свободно и у вас нет времени на редактирование переводов, вы, вероятно, выполните следующие
шаги.

1. Отправьте каждый файл перевода переводчику.
1. Переводчик использует редактор файлов XLIFF для выполнения следующих действий.
1. Создание перевода.
1. Редактирование перевода.

### Пример процесса перевода для французского языка

Чтобы продемонстрировать процесс, рассмотрите файл `messages.fr.xlf`
в [примере приложения Angular Internationalization][GuideI18nExample]. [Пример приложения Angular Internationalization][GuideI18nExample]
включает французский перевод, который вы можете редактировать без специального редактора XLIFF или знания французского
языка.

Следующие действия описывают процесс перевода на французский язык.

1. Откройте `messages.fr.xlf` и найдите первый элемент `<trans-unit>`.
   Это _единица перевода_, также известная как _текстовый узел_, которая представляет собой перевод тега приветствия
   `<h1>`, ранее помеченного атрибутом `i18n`.

   <docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf.html" visibleRegion="translated-hello-before"/>

   `id="introductionHeader"` — это [пользовательский ID][GuideI18nOptionalManageMarkedText], но без префикса `@@`,
   требуемого в исходном HTML.

1. Скопируйте элемент `<source>... </source>` в текстовом узле, переименуйте его в `target`, а затем замените содержимое
   французским текстом.

   <docs-code header="src/locale/messages.fr.xlf (<trans-unit>, после перевода)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf.html" visibleRegion="translated-hello"/>

   В более сложном переводе информация и контекст
   в [элементах описания и значения][GuideI18nCommonPrepareAddHelpfulDescriptionsAndMeanings] помогают выбрать
   правильные слова для перевода.

1. Переведите остальные текстовые узлы.
   Следующий пример показывает, как переводить.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf.html" visibleRegion="translated-other-nodes"/>

ВАЖНО: Не изменяйте ID единиц перевода.
Каждый атрибут `id` генерируется Angular и зависит от содержимого текста компонента и назначенного значения (meaning).

Если вы измените текст или значение, атрибут `id` изменится.
Подробнее об управлении обновлениями текста и ID см. в разделе [пользовательские ID][GuideI18nOptionalManageMarkedText].

## Перевод форм множественного числа

Добавляйте или удаляйте варианты множественного числа по мере необходимости для каждого языка.

ПОЛЕЗНО: Правила множественного числа для языков см.
в [CLDR plural rules][GithubUnicodeOrgCldrStagingChartsLatestSupplementalLanguagePluralRulesHtml].

### Пример `plural` для `minute`

Чтобы перевести `plural`, переведите значения сопоставления формата ICU.

- `just now`
- `one minute ago`
- `<x id="INTERPOLATION" equiv-text="{{minutes}}"/> minutes ago`

Следующий пример показывает, как переводить.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf.html" visibleRegion="translated-plural"/>

## Перевод альтернативных выражений

Angular также извлекает альтернативные выражения ICU `select` как отдельные единицы перевода.

### Пример `select` для `gender`

Следующий пример показывает выражение ICU `select` в шаблоне компонента.

<docs-code header="app.component.html" path="adev/src/content/examples/i18n/src/app/app.component.html" visibleRegion="i18n-select"/>

В этом примере Angular извлекает выражение в две единицы перевода.
Первая содержит текст за пределами условия `select` и использует заполнитель для `select` \(`<x id="ICU">`\):

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf.html" visibleRegion="translate-select-1"/>

ВАЖНО: При переводе текста перемещайте заполнитель при необходимости, но не удаляйте его.
Если вы удалите заполнитель, выражение ICU будет удалено из вашего переведенного приложения.

Следующий пример показывает вторую единицу перевода, содержащую условие `select`.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf.html" visibleRegion="translate-select-2"/>

Следующий пример показывает обе единицы перевода после завершения перевода.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf.html" visibleRegion="translated-select"/>

## Перевод вложенных выражений

Angular обрабатывает вложенное выражение так же, как и альтернативное выражение.
Angular извлекает выражение в две единицы перевода.

### Пример вложенного `plural`

Следующий пример показывает первую единицу перевода, содержащую текст за пределами вложенного выражения.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf.html" visibleRegion="translate-nested-1"/>

Следующий пример показывает вторую единицу перевода, содержащую полное вложенное выражение.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf.html" visibleRegion="translate-nested-2"/>

Следующий пример показывает обе единицы перевода после перевода.

<docs-code header="src/locale/messages.fr.xlf (<trans-unit>)" path="adev/src/content/examples/i18n/doc-files/messages.fr.xlf.html" visibleRegion="translate-nested"/>

## Что дальше

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
