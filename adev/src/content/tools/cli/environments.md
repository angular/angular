# Настройка окружений приложения

Вы можете определить различные именованные конфигурации сборки для вашего проекта, такие как `development` (разработка)
и `staging` (промежуточная среда), с разными настройками по умолчанию.

Каждая именованная конфигурация может иметь значения по умолчанию для любых опций, применимых к различным целям
билдера (builder targets), таким как `build`, `serve` и `test`.
Команды [Angular CLI](tools/cli) `build`, `serve` и `test` могут затем заменять файлы соответствующими версиями для
вашей целевой среды.

## Конфигурации Angular CLI

Билдеры Angular CLI поддерживают объект `configurations`, который позволяет переопределять конкретные опции билдера на
основе конфигурации, указанной в командной строке.

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

Вы можете выбрать, какую конфигурацию использовать, с помощью опции `--configuration`.

```shell

ng build --configuration debug

```

Конфигурации могут применяться к любому билдеру Angular CLI. Можно указать несколько конфигураций через запятую.
Конфигурации применяются по порядку, при этом конфликтующие опции используют значение из последней конфигурации.

```shell

ng build --configuration debug,production,customer-facing

```

## Настройка значений по умолчанию для конкретных окружений

`@angular-devkit/build-angular:browser` поддерживает замену файлов (file replacements) — опцию для подмены исходных
файлов перед выполнением сборки.
Использование этого в сочетании с `--configuration` обеспечивает механизм для настройки данных, специфичных для
окружения, в вашем приложении.

Начните с [генерации окружений](cli/generate/environments), чтобы создать директорию `src/environments/` и настроить
проект на использование замены файлов.

```shell

ng generate environments

```

Директория проекта `src/environments/` содержит базовый файл конфигурации `environment.ts`, который предоставляет
конфигурацию по умолчанию для продакшна.
Вы можете переопределить значения по умолчанию для дополнительных окружений, таких как `development` и `staging`, в
конфигурационных файлах, специфичных для цели.

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
  production: true
};

```

Команда `build` использует это как цель сборки, когда окружение не указано.
Вы можете добавить дополнительные переменные либо как дополнительные свойства объекта environment, либо как отдельные
объекты.
Например, следующий код добавляет значение по умолчанию для переменной в окружение по умолчанию:

```ts

export const environment = {
  production: true,
  apiUrl: 'http://my-prod-url'
};

```

Вы можете добавить конфигурационные файлы для конкретных целей, например `environment.development.ts`.
Следующее содержимое устанавливает значения по умолчанию для цели сборки разработки:

```ts

export const environment = {
  production: false,
  apiUrl: 'http://my-dev-url'
};

```

## Использование переменных, специфичных для окружения, в вашем приложении

Чтобы использовать определенные вами конфигурации окружения, ваши компоненты должны импортировать исходный файл
окружения:

```ts

import { environment } from './environments/environment';

```

Это гарантирует, что команды `build` и `serve` смогут найти конфигурации для конкретных целей сборки.

Следующий код в файле компонента (`app.component.ts`) использует переменную окружения, определенную в конфигурационных
файлах.

```ts

import { environment } from './../environments/environment';

// Fetches from `http://my-prod-url` in production, `http://my-dev-url` in development.
fetch(environment.apiUrl);

```

Главный конфигурационный файл CLI, `angular.json`, содержит секцию `fileReplacements` в конфигурации для каждой цели
сборки, что позволяет заменять любой файл в программе TypeScript на версию этого файла, специфичную для цели.
Это полезно для включения кода или переменных, специфичных для цели, в сборку, предназначенную для конкретного
окружения, такого как продакшн или стейджинг.

По умолчанию файлы не заменяются, однако `ng generate environments` настраивает эту конфигурацию автоматически.
Вы можете изменить или добавить замену файлов для конкретных целей сборки, отредактировав конфигурацию `angular.json`
напрямую.

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

Это означает, что когда вы собираете конфигурацию разработки с помощью `ng build --configuration development`, файл
`src/environments/environment.ts` заменяется версией файла для конкретной цели:
`src/environments/environment.development.ts`.

Чтобы добавить окружение staging, создайте копию `src/environments/environment.ts` с именем
`src/environments/environment.staging.ts`, затем добавьте конфигурацию `staging` в `angular.json`:

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

Вы также можете добавить больше опций конфигурации в это целевое окружение.
Любая опция, которую поддерживает ваша сборка, может быть переопределена в конфигурации цели сборки.

Чтобы выполнить сборку с использованием конфигурации staging, выполните следующую команду:

```shell

ng build --configuration staging

```

По умолчанию цель `build` включает конфигурации `production` и `development`, а `ng serve` использует сборку приложения
для разработки.
Вы также можете настроить `ng serve` на использование целевой конфигурации сборки, если установите опцию `buildTarget`:

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

Опция `defaultConfiguration` указывает, какая конфигурация используется по умолчанию.
Если `defaultConfiguration` не установлена, `options` используются напрямую без изменений.
