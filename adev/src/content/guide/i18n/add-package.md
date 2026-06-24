# Добавление пакета `@angular/localize`

Чтобы воспользоваться функциями локализации Angular, используйте [Angular CLI][CliMain] для добавления пакета
`@angular/localize` в ваш проект.

Для добавления пакета `@angular/localize` используйте следующую команду, которая обновит `package.json` и файлы
конфигурации TypeScript в вашем проекте.

<docs-code path="adev/src/content/examples/i18n/doc-files/commands.sh" region="add-localize"/>

Эта команда добавляет `types: ["@angular/localize"]` в файлы конфигурации TypeScript.
Она также добавляет строку `/// <reference types="@angular/localize" />` в начало файла `main.ts`, которая является
ссылкой на определение типов.

HELPFUL: Для получения дополнительной информации о файлах `package.json` и `tsconfig.json`
см. [npm-зависимости рабочего пространства][GuideNpmPackages] и [Конфигурация TypeScript][GuideTsConfig]. Чтобы узнать о
директивах с тройным слэшем (Triple-slash Directives),
посетите [Справочник по TypeScript](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types-).

Если пакет `@angular/localize` не установлен, и вы попытаетесь собрать локализованную версию вашего проекта (например,
используя атрибуты `i18n` в шаблонах), [Angular CLI][CliMain] выдаст ошибку, содержащую инструкции по включению i18n для
вашего проекта.

## Параметры

| ПАРАМЕТР           | ОПИСАНИЕ                                                                                                                                                                                                                       | ТИП ЗНАЧЕНИЯ | ЗНАЧЕНИЕ ПО УМОЛЧАНИЮ |
| :----------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------- | :-------------------- |
| `--project`        | Имя проекта.                                                                                                                                                                                                                   | `string`     |                       |
| `--use-at-runtime` | Если установлено, то `$localize` можно использовать во время выполнения. Кроме того, `@angular/localize` будет добавлен в раздел `dependencies` файла `package.json`, а не в `devDependencies`, как это делается по умолчанию. | `boolean`    | `false`               |

Информацию о других доступных параметрах см. в описании команды `ng add` в [Angular CLI][CliMain].

## Что дальше

<docs-pill-row>
  <docs-pill href="guide/i18n/locale-id" title="Обращение к локалям по ID"/>
</docs-pill-row>

[CliMain]: cli 'Обзор CLI и справочник команд | Angular'
[GuideNpmPackages]: reference/configs/npm-packages 'npm-зависимости рабочего пространства | Angular'
[GuideTsConfig]: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html 'Конфигурация TypeScript'
