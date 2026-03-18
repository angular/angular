# Настройка окружений приложения {#configuring-application-environments}

Вы можете определить различные именованные конфигурации сборки для своего проекта, например `development` и `staging`, с разными значениями по умолчанию.

Каждая именованная конфигурация может иметь значения по умолчанию для любых параметров, применимых к различным целям builder, таких как `build`, `serve` и `test`.
Команды `build`, `serve` и `test` [Angular CLI](tools/cli) могут заменять файлы соответствующими версиями для целевого окружения.

## Конфигурации Angular CLI {#angular-cli-configurations}

Builder'ы Angular CLI поддерживают объект `configurations`, который позволяет переопределять конкретные параметры builder'а на основе конфигурации, переданной в командной строке.

```json

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            // По умолчанию генерация source map отключена.
            "sourceMap": false
          },
          "configurations": {
            // Для конфигурации `debug` включить source map.
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

Выбрать конфигурацию можно с помощью параметра `--configuration`.

```shell

ng build --configuration debug

```

Конфигурации можно применять к любому builder'у Angular CLI. Несколько конфигураций можно указать через запятую. Конфигурации применяются по порядку, при конфликте параметров используется значение из последней конфигурации.

```shell

ng build --configuration debug,production,customer-facing

```

## Настройка значений по умолчанию для конкретного окружения {#configure-environment-specific-defaults}

`@angular-devkit/build-angular:browser` поддерживает замену файлов — параметр для подстановки исходных файлов перед выполнением сборки.
Использование этого механизма в сочетании с `--configuration` обеспечивает возможность настройки данных, специфичных для окружения, в вашем приложении.

Начните с [генерации окружений](cli/generate/environments), чтобы создать директорию `src/environments/` и настроить проект на использование замены файлов.

```shell

ng generate environments

```

Директория `src/environments/` проекта содержит базовый файл конфигурации `environment.ts`, который предоставляет конфигурацию по умолчанию для продакшена.
Вы можете переопределить значения по умолчанию для дополнительных окружений, таких как `development` и `staging`, в файлах конфигурации для конкретной цели.

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

Команда `build` использует этот файл как цель сборки, когда окружение не указано.
Вы можете добавить дополнительные переменные — как дополнительные свойства объекта environment, так и в виде отдельных объектов.
Например, следующий код добавляет переменную по умолчанию в конфигурацию окружения:

```ts
export const environment = {
  production: true,
  apiUrl: 'http://my-prod-url',
};
```

Вы можете добавить файлы конфигурации для конкретной цели, например `environment.development.ts`.
Следующее содержимое задаёт значения по умолчанию для цели сборки development:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://my-dev-url',
};
```

## Использование переменных окружения в приложении {#using-environment-specific-variables-in-your-app}

Для использования определённых конфигураций окружения ваши компоненты должны импортировать оригинальный файл environments:

```ts
import {environment} from './environments/environment';
```

Это гарантирует, что команды `build` и `serve` смогут найти конфигурации для конкретных целей сборки.

Следующий код в файле компонента (`app.ts`) использует переменную окружения, определённую в файлах конфигурации.

```ts
import {environment} from './../environments/environment';

// Обращается к `http://my-prod-url` в продакшене, `http://my-dev-url` в разработке.
fetch(environment.apiUrl);
```

Основной файл конфигурации CLI, `angular.json`, содержит раздел `fileReplacements` в конфигурации для каждой цели сборки, который позволяет заменять любой файл в TypeScript-программе версией этого файла для конкретной цели.
Это удобно для включения кода или переменных, специфичных для цели, в сборку для конкретного окружения, например продакшена или staging.

По умолчанию файлы не заменяются, однако `ng generate environments` автоматически настраивает эту конфигурацию.
Вы можете изменить или добавить замену файлов для конкретных целей сборки, отредактировав конфигурацию `angular.json` напрямую.

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

Это означает, что при сборке конфигурации development с помощью `ng build --configuration development` файл `src/environments/environment.ts` заменяется версией для конкретной цели `src/environments/environment.development.ts`.

Чтобы добавить окружение staging, создайте копию `src/environments/environment.ts` под названием `src/environments/environment.staging.ts`, а затем добавьте конфигурацию `staging` в `angular.json`:

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

Вы также можете добавить дополнительные параметры конфигурации для этого целевого окружения.
Любой параметр, поддерживаемый вашей сборкой, может быть переопределён в конфигурации цели сборки.

Чтобы выполнить сборку с конфигурацией staging, выполните следующую команду:

```shell

ng build --configuration staging

```

По умолчанию цель `build` включает конфигурации `production` и `development`, а `ng serve` использует сборку development.
Вы также можете настроить `ng serve` для использования целевой конфигурации сборки, задав параметр `buildTarget`:

```json

  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "options": { … },
    "configurations": {
      "development": {
        // Использовать конфигурацию `development` цели `build`.
        "buildTarget": "my-app:build:development"
      },
      "production": {
        // Использовать конфигурацию `production` цели `build`.
        "buildTarget": "my-app:build:production"
      }
    },
    "defaultConfiguration": "development"
  },

```

Параметр `defaultConfiguration` указывает, какая конфигурация используется по умолчанию.
Когда `defaultConfiguration` не задан, параметры `options` используются напрямую без изменений.
