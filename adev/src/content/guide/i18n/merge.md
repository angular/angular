# Объединение переводов с приложением

Чтобы объединить готовые переводы с проектом, выполните следующие действия

1. Используйте [Angular CLI][CliMain], чтобы собрать копию дистрибутивных файлов проекта
1. Используйте опцию `"localize"`, чтобы заменить все i18n-сообщения корректными переводами и собрать локализованный вариант приложения.
   Вариант приложения — полная копия дистрибутивных файлов приложения, переведённая для одной локали.

После объединения переводов обслуживайте каждую дистрибутивную копию приложения с помощью определения языка на стороне сервера или разных подкаталогов.

HELPFUL: Подробнее о том, как обслуживать каждую дистрибутивную копию приложения, см. [развёртывание нескольких локалей](guide/i18n/deploy).

Для compile-time перевода приложения процесс сборки использует ahead-of-time (AOT) компиляцию, чтобы получить небольшое, быстрое, готовое к запуску приложение.

HELPFUL: Подробное объяснение процесса сборки см. в [Сборка и обслуживание приложений Angular][GuideBuild].
Процесс сборки работает для файлов перевода в формате `.xlf` или в другом формате, который понимает Angular, например `.xtb`.
Подробнее о форматах файлов перевода, используемых Angular, см. [Изменение формата файла исходного языка][GuideI18nCommonTranslationFilesChangeTheSourceLanguageFileFormat]

Чтобы собрать отдельную дистрибутивную копию приложения для каждой локали, [определите локали в конфигурации сборки][GuideI18nCommonMergeDefineLocalesInTheBuildConfiguration] в файле конфигурации сборки рабочей области [`angular.json`][GuideWorkspaceConfig] вашего проекта.

Этот метод сокращает процесс сборки, убирая требование выполнять полную сборку приложения для каждой локали.

Чтобы [генерировать варианты приложения для каждой локали][GuideI18nCommonMergeGenerateApplicationVariantsForEachLocale], используйте опцию `"localize"` в файле конфигурации сборки рабочей области [`angular.json`][GuideWorkspaceConfig].
Также, чтобы [собирать из командной строки][GuideI18nCommonMergeBuildFromTheCommandLine], используйте команду [`build`][CliBuild] [Angular CLI][CliMain] с опцией `--localize`.

HELPFUL: Опционально [примените специфичные опции сборки только для одной локали][GuideI18nCommonMergeApplySpecificBuildOptionsForJustOneLocale] для пользовательской конфигурации локали.

## Определение локалей в конфигурации сборки {#define-locales-in-the-build-configuration}

Используйте опцию проекта `i18n` в файле конфигурации сборки рабочей области [`angular.json`][GuideWorkspaceConfig], чтобы определить локали для проекта.

Следующие подопции идентифицируют исходный язык и сообщают компилятору, где найти поддерживаемые переводы для проекта.

| Подопция       | Подробности                                                                                                                                                |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sourceLocale` | Локаль, которую вы используете в исходном коде приложения \(`en-US` по умолчанию\). Также может быть объектом со свойствами `code`, `baseHref` и `subPath`. |
| `locales`      | Карта идентификаторов локалей на файлы перевода. Каждая запись также может быть объектом со свойствами `translation`, `baseHref` и `subPath`.              |

Полный список свойств `i18n` и их типов см. в [опциях i18n][GuideWorkspaceConfigI18n].

### Пример `angular.json` для `en-US` и `fr` {#angularjson-for-en-us-and-fr-example}

Например, следующий фрагмент файла конфигурации сборки рабочей области [`angular.json`][GuideWorkspaceConfig] задаёт исходную локаль как `en-US` и предоставляет путь к файлу перевода французской \(`fr`\) локали.

<docs-code header="angular.json" path="adev/src/content/examples/i18n/angular.json" region="locale-config"/>

## Генерация вариантов приложения для каждой локали {#generate-application-variants-for-each-locale}

Чтобы использовать определение локалей в конфигурации сборки, используйте опцию `"localize"` в файле конфигурации сборки рабочей области [`angular.json`][GuideWorkspaceConfig], чтобы сообщить CLI, для каких локалей генерировать сборку.

- Установите `"localize"` в `true` для всех локалей, ранее определённых в конфигурации сборки.
- Установите `"localize"` в массив подмножества ранее определённых идентификаторов локалей, чтобы собрать только эти версии локалей.
- Установите `"localize"` в `false`, чтобы отключить локализацию и не генерировать версии, специфичные для локали.

HELPFUL: Для локализации шаблонов компонентов требуется ahead-of-time (AOT) компиляция.

Если вы изменили эту настройку, установите `"aot"` в `true`, чтобы использовать AOT.

HELPFUL: Из-за сложностей развёртывания i18n и необходимости минимизировать время пересборки сервер разработки поддерживает локализацию только одной локали за раз.
Если установить `"localize"` в `true`, определить более одной локали и использовать `ng serve`, произойдёт ошибка.
Если нужно разрабатывать против конкретной локали, установите `"localize"` в конкретную локаль.
Например, для французского \(`fr`\) укажите `"localize": ["fr"]`.

CLI загружает и регистрирует данные локали, размещает каждую сгенерированную версию в каталоге, специфичном для локали, чтобы отделить её от других версий локалей, и помещает файлы в настроенный `outputPath` проекта.
Для каждого варианта приложения атрибут `lang` элемента `html` устанавливается в локаль.
CLI также корректирует HTML base HREF для каждой версии приложения, добавляя локаль к настроенному `baseHref`.

Задайте свойство `"localize"` как общую конфигурацию, чтобы эффективно наследовать его для всех конфигураций.
Также задайте свойство для переопределения других конфигураций.

### Пример `angular.json` со всеми локалями из сборки {#angularjson-include-all-locales-from-build-example}

Следующий пример показывает опцию `"localize"`, установленную в `true` в файле конфигурации сборки рабочей области [`angular.json`][GuideWorkspaceConfig], чтобы собирались все локали, определённые в конфигурации сборки.

<docs-code header="angular.json" path="adev/src/content/examples/i18n/angular.json" region="build-localize-true"/>

## Сборка из командной строки {#build-from-the-command-line}

Также используйте опцию `--localize` с командой [`ng build`][CliBuild] и существующей конфигурацией `production`.
CLI собирает все локали, определённые в конфигурации сборки.
Если локали заданы в конфигурации сборки, это аналогично установке `"localize"` в `true`.

HELPFUL: Подробнее о том, как задать локали, см. [Генерация вариантов приложения для каждой локали][GuideI18nCommonMergeGenerateApplicationVariantsForEachLocale].

<docs-code path="adev/src/content/examples/i18n/doc-files/commands.sh" region="build-localize"/>

## Применение специфичных опций сборки только для одной локали {#apply-specific-build-options-for-just-one-locale}

Чтобы применить специфичные опции сборки только к одной локали, укажите одну локаль для создания пользовательской конфигурации, специфичной для локали.

IMPORTANT: Используйте сервер разработки [Angular CLI][CliMain] \(`ng serve`\) только с одной локалью.

### Пример сборки для французского {#build-for-french-example}

Следующий пример показывает пользовательскую конфигурацию, специфичную для локали, с использованием одной локали.

<docs-code header="angular.json" path="adev/src/content/examples/i18n/angular.json" region="build-single-locale"/>

Передайте эту конфигурацию командам `ng serve` или `ng build`.
Следующий пример кода показывает, как обслуживать файл французского языка.

<docs-code path="adev/src/content/examples/i18n/doc-files/commands.sh" region="serve-french"/>

Для production-сборок используйте композицию конфигураций, чтобы запустить обе конфигурации.

<docs-code path="adev/src/content/examples/i18n/doc-files/commands.sh" region="build-production-french"/>

<docs-code header="angular.json" path="adev/src/content/examples/i18n/angular.json" region="build-production-french" />

## Сообщение об отсутствующих переводах {#report-missing-translations}

Когда перевод отсутствует, сборка завершается успешно, но генерирует предупреждение вроде `Missing translation for message "{translation_text}"`.
Чтобы настроить уровень предупреждения, генерируемого компилятором Angular, укажите один из следующих уровней.

| Уровень предупреждения | Подробности                                          | Вывод                                                  |
| :--------------------- | :--------------------------------------------------- | :----------------------------------------------------- |
| `error`                | Выбросить ошибку, сборка завершается неудачей        | n/a                                                    |
| `ignore`               | Ничего не делать                                     | n/a                                                    |
| `warning`              | Показать предупреждение по умолчанию в консоли или shell | `Missing translation for message "{translation_text}"` |

Укажите уровень предупреждения в секции `options` для цели `build` файла конфигурации сборки рабочей области [`angular.json`][GuideWorkspaceConfig].

### Пример предупреждения `error` в `angular.json` {#angularjson-error-warning-example}

Следующий пример показывает, как установить уровень предупреждения в `error`.

<docs-code header="angular.json" path="adev/src/content/examples/i18n/angular.json" region="missing-translation-error" />

HELPFUL: Когда вы компилируете проект Angular в приложение Angular, экземпляры атрибута `i18n` заменяются экземплярами tagged message string [`$localize`][ApiLocalizeInitLocalize].
Это значит, что приложение Angular переводится после компиляции.
Это также значит, что можно создавать локализованные версии приложения Angular без повторной компиляции всего проекта Angular для каждой локали.

Когда вы переводите приложение Angular, _преобразование перевода_ заменяет и переупорядочивает части \(статические строки и выражения\) строки template literal строками из коллекции переводов.
Подробнее см. [`$localize`][ApiLocalizeInitLocalize].

TLDR: Скомпилируйте один раз, затем переводите для каждой локали.

## Что дальше {#whats-next}

<docs-pill-row>
  <docs-pill href="guide/i18n/deploy" title="Deploy multiple locales"/>
</docs-pill-row>

[ApiLocalizeInitLocalize]: api/localize/init/$localize '$localize | init - localize - API | Angular'
[CliMain]: cli 'CLI Overview and Command Reference | Angular'
[CliBuild]: cli/build 'ng build | CLI | Angular'
[GuideBuild]: tools/cli/build 'Building and serving Angular apps | Angular'
[GuideI18nCommonMergeApplySpecificBuildOptionsForJustOneLocale]: guide/i18n/merge#apply-specific-build-options-for-just-one-locale 'Apply specific build options for just one locale - Merge translations into the application | Angular'
[GuideI18nCommonMergeBuildFromTheCommandLine]: guide/i18n/merge#build-from-the-command-line 'Build from the command line - Merge translations into the application | Angular'
[GuideI18nCommonMergeDefineLocalesInTheBuildConfiguration]: guide/i18n/merge#define-locales-in-the-build-configuration 'Define locales in the build configuration - Merge translations into the application | Angular'
[GuideI18nCommonMergeGenerateApplicationVariantsForEachLocale]: guide/i18n/merge#generate-application-variants-for-each-locale 'Generate application variants for each locale - Merge translations into the application | Angular'
[GuideI18nCommonTranslationFilesChangeTheSourceLanguageFileFormat]: guide/i18n/translation-files#change-the-source-language-file-format 'Change the source language file format - Work with translation files | Angular'
[GuideWorkspaceConfig]: reference/configs/workspace-config 'Angular workspace configuration | Angular'
[GuideWorkspaceConfigI18n]: reference/configs/workspace-config#i18n-options 'i18n options - Angular workspace configuration | Angular'
