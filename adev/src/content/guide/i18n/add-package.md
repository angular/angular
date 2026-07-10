# Добавление пакета localize

Чтобы воспользоваться возможностями локализации Angular, используйте [Angular CLI][CliMain] для добавления пакета `@angular/localize` в проект.

Чтобы добавить пакет `@angular/localize`, используйте следующую команду — она обновит `package.json` и файлы конфигурации TypeScript в проекте.

<docs-code language="shell" path="adev/src/content/examples/i18n/doc-files/commands.sh" region="add-localize"/>

Она добавляет `types: ["@angular/localize"]` в файлы конфигурации TypeScript.
Также добавляет строку `/// <reference types="@angular/localize" />` в начало файла `main.ts` — это ссылка на определение типов.

HELPFUL: Подробнее о файлах `package.json` и `tsconfig.json` см. [Зависимости npm рабочей области][GuideNpmPackages] и [Конфигурация TypeScript][GuideTsConfig]. О Triple-slash Directives — в [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types-).

Если `@angular/localize` не установлен и вы пытаетесь собрать локализованную версию проекта (например, используя атрибуты `i18n` в шаблонах), [Angular CLI][CliMain] сгенерирует ошибку с шагами, которые можно предпринять для включения i18n в проекте.

## Опции {#options}

| OPTION             | DESCRIPTION                                                                                                                                                                                   | VALUE TYPE | DEFAULT VALUE |
| :----------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- | :------------ |
| `--project`        | Имя проекта.                                                                                                                                                                                  | `string`   |
| `--use-at-runtime` | Если задано, `$localize` можно использовать в runtime. Также `@angular/localize` попадает в секцию `dependencies` в `package.json`, а не в `devDependencies` (значение по умолчанию).         | `boolean`  | `false`       |

Другие доступные опции см. в `ng add` в [Angular CLI][CliMain].

## Что дальше {#whats-next}

<docs-pill-row>
  <docs-pill href="guide/i18n/locale-id" title="Refer to locales by ID"/>
</docs-pill-row>

[CliMain]: cli 'CLI Overview and Command Reference | Angular'
[GuideNpmPackages]: reference/configs/npm-packages 'Workspace npm dependencies | Angular'
[GuideTsConfig]: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html 'TypeScript Configuration'
