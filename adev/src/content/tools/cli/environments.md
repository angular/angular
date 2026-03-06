# Настройка окружений приложения {#configuring-application-environments}

Для проекта можно определить различные именованные конфигурации сборки, например `development` и `staging`, с разными значениями по умолчанию.

Каждая именованная конфигурация может задавать значения по умолчанию для любых параметров, применимых к различным целям Builder, таким как `build`, `serve` и `test`.
Затем команды `build`, `serve` и `test` [Angular CLI](tools/cli) могут заменять файлы соответствующими версиями для целевого окружения.

## Конфигурации Angular CLI {#angular-cli-configurations}

Builder-ы Angular CLI поддерживают объект `configurations`, позволяющий переопределять определённые параметры Builder на основе конфигурации, переданной в командной строке.

```json

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            // By default, disable source map generation.
            "sourceMap": false
          },
          "configurations": {
            // For the `debug` configuration, enable source maps.
            "debug": {
              "sourceMap": true
            }
          }
        },
        …
      }
    }
  }
}

```

Выбор конфигурации осуществляется с помощью опции `--configuration`.

```shell

ng build --configuration debug

```

Конфигурации можно применять к любому Builder Angular CLI. Несколько конфигураций можно указать через запятую. Конфигурации применяются по порядку, при конфликте параметров используется значение из последней конфигурации.

```shell

ng build --configuration debug,production,customer-facing

```

## Настройка значений по умолчанию для конкретного окружения {#configure-environment-specific-defaults}

`@angular-devkit/build-angular:browser` поддерживает замену файлов — параметр для подстановки исходных файлов перед выполнением сборки.
Использование этого параметра вместе с `--configuration` предоставляет механизм настройки данных для конкретного окружения в приложении.

Начните с [генерации окружений](cli/generate/environments) для создания директории `src/environments/` и настройки проекта для использования замены файлов.

```shell

ng generate environments

```

Директория `src/environments/` проекта содержит базовый файл конфигурации `environment.ts`, предоставляющий конфигурацию по умолчанию для production.
Значения по умолчанию можно переопределять для дополнительных окружений, таких как `development` и `staging`, в файлах конфигурации для конкретных целей.

Например:

```text

my-app/src/environments
├── environment.development.ts
├── environment.staging.ts
└── environment.ts

```

Базовый файл `environment.ts` содержит настройки окружения по умолчанию.
Например:

```ts
export const environment = {
  production: true,
};
```

Команда `build` использует это как цель сборки при отсутствии указанного окружения.
Можно добавить дополнительные переменные в виде дополнительных свойств объекта окружения или отдельных объектов.
Например, следующий код добавляет переменную по умолчанию в окружение по умолчанию:

```ts
export const environment = {
  production: true,
  apiUrl: 'http://my-prod-url',
};
```

Можно добавлять файлы конфигурации для конкретных целей, например `environment.development.ts`.
Следующее содержимое задаёт значения по умолчанию для цели сборки development:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://my-dev-url',
};
```

## Использование переменных окружения в приложении {#using-environment-specific-variables-in-your-app}

Для использования определённых конфигураций окружения компоненты должны импортировать исходный файл окружений:

```ts
import {environment} from './environments/environment';
```

Это гарантирует, что команды сборки и запуска смогут найти конфигурации для конкретных целей сборки.

Следующий код в файле компонента (`app.ts`) использует переменную окружения, определённую в файлах конфигурации.

```ts
import {environment} from './../environments/environment';

// Fetches from `http://my-prod-url` in production, `http://my-dev-url` in development.
fetch(environment.apiUrl);
```

Основной файл конфигурации CLI, `angular.json`, содержит раздел `fileReplacements` в конфигурации каждой цели сборки, позволяющий заменять любой файл в TypeScript-программе версией этого файла для конкретной цели.
Это полезно для включения специфичного для цели кода или переменных в сборку, предназначенную для конкретного окружения, например production или staging.

По умолчанию файлы не заменяются, однако `ng generate environments` автоматически настраивает эту конфигурацию.
Можно изменять или добавлять замены файлов для конкретных целей сборки, редактируя конфигурацию `angular.json` напрямую.

```json

  "configurations": {
    "development": {
      "fileReplacements": [
          {
            "replace": "src/environments/environment.ts",
            "with": "src/environments/environment.development.ts"
          }
        ],
        …

```

Это означает, что при сборке конфигурации development с помощью `ng build --configuration development` файл `src/environments/environment.ts` заменяется версией файла для конкретной цели `src/environments/environment.development.ts`.

Для добавления окружения staging создайте копию `src/environments/environment.ts` с именем `src/environments/environment.staging.ts`, затем добавьте конфигурацию `staging` в `angular.json`:

```json

  "configurations": {
    "development": { … },
    "production": { … },
    "staging": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.staging.ts"
        }
      ]
    }
  }

```

Для этого целевого окружения можно добавить дополнительные параметры конфигурации.
Любой параметр, поддерживаемый сборкой, может быть переопределён в конфигурации цели сборки.

Для сборки с конфигурацией staging выполните следующую команду:

```shell

ng build --configuration staging

```

По умолчанию цель `build` включает конфигурации `production` и `development`, а `ng serve` использует конфигурацию development сборки приложения.
Также можно настроить `ng serve` для использования конфигурации сборки для конкретной цели, установив параметр `buildTarget`:

```json

  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "options": { … },
    "configurations": {
      "development": {
        // Use the `development` configuration of the `build` target.
        "buildTarget": "my-app:build:development"
      },
      "production": {
        // Use the `production` configuration of the `build` target.
        "buildTarget": "my-app:build:production"
      }
    },
    "defaultConfiguration": "development"
  },

```

Параметр `defaultConfiguration` указывает, какая конфигурация используется по умолчанию.
Если `defaultConfiguration` не задан, `options` используются напрямую без изменений.
