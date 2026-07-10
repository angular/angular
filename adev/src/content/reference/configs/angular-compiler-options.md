# Опции компилятора Angular

При использовании [ahead-of-time компиляции (AOT)](tools/cli/aot-compiler) можно управлять тем, как компилируется приложение, указывая опции компилятора Angular в [файле конфигурации TypeScript](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).

Объект опций Angular `angularCompilerOptions` является соседним к объекту `compilerOptions`, который передаёт стандартные опции компилятору TypeScript.

<docs-code header="tsconfig.json" path="adev/src/content/examples/angular-compiler-options/tsconfig.json" region="angular-compiler-options"/>

## Наследование конфигурации с `extends` {#configuration-inheritance-with-extends}

Как и компилятор TypeScript, AOT-компилятор Angular также поддерживает `extends` в секции `angularCompilerOptions` файла конфигурации TypeScript.
Свойство `extends` находится на верхнем уровне, параллельно `compilerOptions` и `angularCompilerOptions`.

Конфигурация TypeScript может наследовать настройки из другого файла с помощью свойства `extends`.
Опции конфигурации из базового файла загружаются первыми, затем переопределяются опциями в наследующем файле конфигурации.

Например:

<docs-code header="tsconfig.app.json" path="adev/src/content/examples/angular-compiler-options/tsconfig.app.json" region="angular-compiler-options-app"/>

Дополнительную информацию см. в [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).

## Опции шаблонов {#template-options}

Следующие опции доступны для настройки AOT-компилятора Angular.

### `annotationsAs` {#annotationsas}

Изменяет способ эмиссии Angular-специфичных аннотаций для улучшения tree-shaking.
Не-Angular аннотации не затрагиваются.
Одно из `static fields` или `decorators`. Значение по умолчанию — `static fields`.

- По умолчанию компилятор заменяет декораторы статическим полем в классе, что позволяет продвинутым tree-shakers вроде [Closure compiler](https://github.com/google/closure-compiler) удалять неиспользуемые классы
- Значение `decorators` оставляет декораторы на месте, что ускоряет компиляцию.
  TypeScript эмитит вызовы хелпера `__decorate`.
  Используйте `--emitDecoratorMetadata` для runtime-рефлексии.

  HELPFUL: Результирующий код не может корректно подвергаться tree-shake.

### `annotateForClosureCompiler` {#annotateforclosurecompiler}

<!-- vale Angular.Angular_Spelling = NO -->

Когда `true`, использует [Tsickle](https://github.com/angular/tsickle) для аннотирования эмитируемого JavaScript комментариями [JSDoc](https://jsdoc.app), необходимыми [Closure Compiler](https://github.com/google/closure-compiler).
По умолчанию `false`.

<!-- vale Angular.Angular_Spelling = YES -->

### `compilationMode` {#compilationmode}

Указывает режим компиляции для использования.
Доступны следующие режимы:

| Режимы       | Подробности                                                                                             |
| :---------- | :-------------------------------------------------------------------------------------------------- |
| `'full'`    | Генерирует полностью AOT-скомпилированный код в соответствии с версией Angular, которая сейчас используется. |
| `'partial'` | Генерирует код в стабильной, но промежуточной форме, подходящей для опубликованной библиотеки.                 |

Значение по умолчанию — `'full'`.

Для большинства приложений `'full'` — корректный режим компиляции.

Используйте `'partial'` для независимо публикуемых библиотек, таких как npm-пакеты.
Компиляции `'partial'` выводят стабильный промежуточный формат, который лучше поддерживает использование приложениями, собранными с другими версиями Angular, чем библиотека.
Библиотеки, собираемые на «HEAD» вместе с приложениями и использующие ту же версию Angular, например в mono-repository, могут использовать `'full'`, так как нет риска рассинхронизации версий.

### `disableExpressionLowering` {#disableexpressionlowering}

Когда `true` (по умолчанию), трансформирует код, который используется или может использоваться в аннотации, чтобы его можно было импортировать из модулей фабрик шаблонов.
См. [переписывание метаданных](tools/cli/aot-compiler#metadata-rewriting) для дополнительной информации.

Когда `false`, отключает это переписывание, требуя выполнять его вручную.

### `disableTypeScriptVersionCheck` {#disabletypescriptversioncheck}

Когда `true`, компилятор не смотрит на версию TypeScript и не сообщает об ошибке при использовании неподдерживаемой версии TypeScript.
Не рекомендуется, так как неподдерживаемые версии TypeScript могут иметь неопределённое поведение.
По умолчанию `false`.

### `enableI18nLegacyMessageIdFormat` {#enablei18nlegacymessageidformat}

Указывает template compiler Angular создавать legacy ID для сообщений, помеченных в шаблонах атрибутом `i18n`.
См. [Пометка текста для переводов][GuideI18nCommonPrepareMarkTextInComponentTemplate] для дополнительной информации о пометке сообщений для локализации.

Установите эту опцию в `false`, если проект не опирается на переводы, созданные ранее с использованием legacy ID.
По умолчанию `true`.

Инструмент извлечения сообщений до Ivy создавал различные legacy-форматы для извлечённых ID сообщений.
Эти форматы сообщений имеют некоторые проблемы, такие как обработка пробелов и опора на информацию внутри исходного HTML шаблона.

Новый формат сообщений более устойчив к изменениям пробелов, одинаков для всех форматов файлов перевода и может создаваться напрямую из вызовов `$localize`.
Это позволяет сообщениям `$localize` в коде приложения использовать тот же ID, что и идентичные сообщения `i18n` в шаблонах компонентов.

### `enableResourceInlining` {#enableresourceinlining}

Когда `true`, заменяет свойства `templateUrl` и `styleUrls` во всех декораторах `@Component` встроенным содержимым в свойствах `template` и `styles`.

Когда включено, вывод `.js` от `ngc` не включает никаких лениво загружаемых URL шаблонов или стилей.

Для проектов библиотек, созданных с Angular CLI, значение по умолчанию в конфигурации development — `true`.

### `enableLegacyTemplate` {#enablelegacytemplate}

Когда `true`, включает устаревший элемент `<template>` вместо `<ng-template>`.
По умолчанию `false`.
Может требоваться некоторыми сторонними Angular-библиотеками.

### `flatModuleId` {#flatmoduleid}

ID модуля для использования при импорте flat module \(когда `flatModuleOutFile` — `true`\).
Ссылки, создаваемые template compiler, используют это имя модуля при импорте символов из flat module.
Игнорируется, если `flatModuleOutFile` — `false`.

### `flatModuleOutFile` {#flatmoduleoutfile}

Когда `true`, генерирует flat module index с данным именем файла и соответствующими метаданными flat module.
Используйте для создания flat modules, упакованных аналогично `@angular/core` и `@angular/common`.
Когда эта опция используется, `package.json` библиотеки должен ссылаться на созданный flat module index вместо файла индекса библиотеки.

Производит только один файл `.metadata.json`, содержащий все метаданные, необходимые для символов, экспортированных из индекса библиотеки.
В созданных файлах `.ngfactory.js` flat module index используется для импорта символов. Символы включают и публичный API из индекса библиотеки, и скрытые внутренние символы.

По умолчанию файл `.ts`, указанный в поле `files`, считается индексом библиотеки.
Если указано более одного файла `.ts`, для выбора файла используется `libraryIndex`.
Если указано более одного файла `.ts` без `libraryIndex`, возникает ошибка.

Flat module index `.d.ts` и `.js` создаётся с данным именем `flatModuleOutFile` в том же расположении, что и файл индекса библиотеки `.d.ts`.

Например, если библиотека использует файл `public_api.ts` как индекс модуля библиотеки, поле `files` в `tsconfig.json` было бы `["public_api.ts"]`.
Опцию `flatModuleOutFile` затем можно установить, например, в `"index.js"`, что производит файлы `index.d.ts` и `index.metadata.json`.
Поле `module` в `package.json` библиотеки было бы `"index.js"`, а поле `typings` — `"index.d.ts"`.

### `generateCodeForLibraries` {#generatecodeforlibraries}

Когда `true`, создаёт файлы фабрик \(`.ngfactory.js` и `.ngstyle.js`\) для файлов `.d.ts` с соответствующим файлом `.metadata.json`. Значение по умолчанию — `true`.

Когда `false`, файлы фабрик создаются только для файлов `.ts`.
Делайте это при использовании factory summaries.

### `preserveWhitespaces` {#preservewhitespaces}

Когда `false` (по умолчанию), удаляет пустые текстовые узлы из скомпилированных шаблонов, что приводит к меньшим эмитируемым модулям фабрик шаблонов.
Установите в `true`, чтобы сохранить пустые текстовые узлы.

HELPFUL: При использовании гидратации рекомендуется использовать `preserveWhitespaces: false`, что является значением по умолчанию. Если вы решите включить сохранение пробелов, добавив `preserveWhitespaces: true` в tsconfig, возможны проблемы с гидратацией. Это ещё не полностью поддерживаемая конфигурация. Убедитесь, что это также согласованно установлено между серверным и клиентским файлами tsconfig. См. [руководство по гидратации](guide/hydration#preserve-whitespaces-configuration) для подробностей.

### `skipMetadataEmit` {#skipmetadataemit}

Когда `true`, не производит файлы `.metadata.json`.
По умолчанию `false`.

Файлы `.metadata.json` содержат информацию, необходимую template compiler из файла `.ts`, которая не включена в файл `.d.ts`, производимый компилятором TypeScript.
Эта информация включает, например, содержимое аннотаций, таких как шаблон компонента, которое TypeScript эмитит в файл `.js`, но не в файл `.d.ts`.

Можно установить в `true` при использовании factory summaries, потому что factory summaries включают копию информации, которая есть в файле `.metadata.json`.

Установите в `true`, если используете опцию TypeScript `--outFile`, потому что файлы метаданных недействительны для этого стиля вывода TypeScript.
Сообщество Angular не рекомендует использовать `--outFile` с Angular.
Вместо этого используйте bundler, например [webpack](https://webpack.js.org).

### `skipTemplateCodegen` {#skiptemplatecodegen}

Когда `true`, не эмитит файлы `.ngfactory.js` и `.ngstyle.js`.
Это отключает большую часть template compiler и отключает сообщение о диагностике шаблонов.

Можно использовать, чтобы указать template compiler производить файлы `.metadata.json` для дистрибуции с пакетом `npm`. Это избегает производства файлов `.ngfactory.js` и `.ngstyle.js`, которые нельзя распространять в `npm`.

Для проектов библиотек, созданных с Angular CLI, значение по умолчанию в конфигурации development — `true`.

### `strictMetadataEmit` {#strictmetadataemit}

Когда `true`, сообщает об ошибке в файл `.metadata.json`, если `"skipMetadataEmit"` — `false`.
По умолчанию `false`.
Используйте только когда `"skipMetadataEmit"` — `false` и `"skipTemplateCodegen"` — `true`.

Эта опция предназначена для проверки файлов `.metadata.json`, эмитируемых для бандлинга с пакетом `npm`.
Валидация строгая и может эмитить ошибки для метаданных, которые никогда не произвели бы ошибку при использовании template compiler.
Можно подавить ошибку, эмитируемую этой опцией для экспортированного символа, включив `@dynamic` в комментарий, документирующий символ.

Для файлов `.metadata.json` допустимо содержать ошибки.
Template compiler сообщает об этих ошибках, если метаданные используются для определения содержимого аннотации.
Collector метаданных не может предсказать символы, предназначенные для использования в аннотации. Он превентивно включает узлы ошибок в метаданные для экспортированных символов.
Template compiler затем может использовать узлы ошибок для сообщения об ошибке, если эти символы используются.

Если клиент библиотеки намеревается использовать символ в аннотации, template compiler обычно об этом не сообщает. Об этом сообщается после того, как клиент фактически использует символ.
Эта опция позволяет обнаруживать эти ошибки на этапе сборки библиотеки и используется, например, при производстве самих библиотек Angular.

Для проектов библиотек, созданных с Angular CLI, значение по умолчанию в конфигурации development — `true`.

### `strictInjectionParameters` {#strictinjectionparameters}

Когда `true`, сообщает об ошибке для предоставленного параметра, тип внедрения которого не может быть определён.
Когда `false`, параметры конструктора классов, помеченных `@Injectable`, тип которых не может быть разрешён, производят предупреждение.
Рекомендуемое значение — `true`, но значение по умолчанию — `false`.

Когда вы используете команду Angular CLI `ng new --strict`, в конфигурации созданного проекта устанавливается `true`.

### `strictTemplates` {#stricttemplates}

Когда `true`, включает [строгую проверку типов шаблонов](tools/cli/template-typecheck#strict-mode).

Флаги строгости, которые включает эта опция, позволяют включать и отключать конкретные типы строгой проверки типов шаблонов.
См. [устранение ошибок шаблонов](tools/cli/template-typecheck#troubleshooting-template-errors).

Когда вы используете команду Angular CLI `ng new --strict`, в конфигурации нового проекта устанавливается `true`.

### `strictStandalone` {#strictstandalone}

Когда `true`, сообщает об ошибке, если компонент, директива или pipe не являются standalone.

### `trace` {#trace}

Когда `true`, печатает дополнительную информацию при компиляции шаблонов.
По умолчанию `false`.

### `typeCheckHostBindings` {#typecheckhostbindings}

Когда `true`, включает проверку типов выражений в литерале объекта `host` и декораторах `@HostBinding`/`@HostListener` компонентов и директив.
По умолчанию `true`.

## Опции командной строки {#command-line-options}

Большую часть времени вы взаимодействуете с компилятором Angular косвенно через [Angular CLI](reference/configs/angular-compiler-options). При отладке определённых проблем может быть полезно вызвать компилятор Angular напрямую.
Можно использовать команду `ngc`, предоставляемую npm-пакетом `@angular/compiler-cli`, для вызова компилятора из командной строки.

Команда `ngc` — обёртка вокруг команды компилятора TypeScript `tsc`. Компилятор Angular в основном настраивается через `tsconfig.json`, а Angular CLI — в основном через `angular.json`.

Помимо файла конфигурации, для настройки `ngc` также можно использовать [опции командной строки `tsc`](https://www.typescriptlang.org/docs/handbook/compiler-options.html).

[GuideI18nCommonPrepareMarkTextInComponentTemplate]: guide/i18n/prepare#mark-text-in-component-template 'Mark text in component template - Prepare component for translation | Angular'
