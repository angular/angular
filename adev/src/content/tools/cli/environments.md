# Настройка окружений приложения

Для проекта можно определить разные именованные конфигурации сборки, например `development` и `staging`, с разными значениями по умолчанию.

Каждая именованная конфигурация может задавать значения по умолчанию для любых опций, применимых к различным целям builder, таким как `build`, `serve` и `test`.
Команды [Angular CLI](tools/cli) `build`, `serve` и `test` затем могут заменять файлы подходящими версиями для целевого окружения.

## Конфигурации Angular CLI {#angular-cli-configurations}

Builders Angular CLI поддерживают объект `configurations`, который позволяет переопределять конкретные опции builder на основе конфигурации, указанной в командной строке.

```json

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
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

Выбрать конфигурацию можно с помощью опции `--configuration`.

```shell

ng build --configuration debug

```

Конфигурации можно применять к любому builder Angular CLI. Несколько конфигураций указываются через запятую. Конфигурации применяются по порядку; при конфликте опций используется значение из последней конфигурации.

```shell

ng build --configuration debug,production,customer-facing

```

## Настройка значений по умолчанию для окружений {#configure-environment-specific-defaults}

`@angular/build:application` поддерживает замену файлов — опцию подстановки исходных файлов перед выполнением сборки.
В сочетании с `--configuration` это даёт механизм настройки данных, специфичных для окружения, в приложении.

Начните с [генерации окружений](cli/generate/environments), чтобы создать каталог `src/environments/` и настроить проект на использование замены файлов.

```shell

ng generate environments

```

Каталог проекта `src/environments/` содержит базовый файл конфигурации `environment.ts`, который задаёт конфигурацию по умолчанию для production.
Значения по умолчанию для дополнительных окружений, таких как `development` и `staging`, можно переопределить в целевых файлах конфигурации.

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

Команда `build` использует его как цель сборки, когда окружение не указано.
Можно добавить дополнительные переменные — как свойства объекта environment или как отдельные объекты.
Например, следующее добавляет значение по умолчанию для переменной в окружение по умолчанию:

```ts
export const environment = {
  production: true,
  apiUrl: 'http://my-prod-url',
};
```

CRITICAL: Файлы в `src/environments/` попадают в клиентский бандл приложения и видны любому, кто загружает страницу. Никогда не храните здесь секреты, такие как API-ключи. Вместо этого используйте серверный proxy или менеджер секретов.

Можно добавить целевые файлы конфигурации, например `environment.development.ts`.
Следующее содержимое задаёт значения по умолчанию для цели сборки development:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://my-dev-url',
};
```

## Использование переменных окружения в приложении {#using-environment-specific-variables-in-your-app}

Чтобы использовать определённые конфигурации окружений, компоненты должны импортировать исходный файл окружений:

```ts
import {environment} from './environments/environment';
```

Это гарантирует, что команды build и serve смогут найти конфигурации для конкретных целей сборки.

Следующий код в файле компонента (`app.ts`) использует переменную окружения, определённую в файлах конфигурации.

```ts
import {environment} from './../environments/environment';

// Fetches from `http://my-prod-url` in production, `http://my-dev-url` in development.
fetch(environment.apiUrl);
```

Основной файл конфигурации CLI, `angular.json`, содержит секцию `fileReplacements` в конфигурации каждой цели сборки, которая позволяет заменить любой файл в программе TypeScript целевой версией этого файла.
Это полезно для включения целевого кода или переменных в сборку для конкретного окружения, например production или staging.

По умолчанию файлы не заменяются, однако `ng generate environments` настраивает эту конфигурацию автоматически.
Замены файлов для конкретных целей сборки можно изменить или добавить, редактируя конфигурацию `angular.json` напрямую.

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

Это означает, что при сборке конфигурации development с `ng build --configuration development` файл `src/environments/environment.ts` заменяется целевой версией `src/environments/environment.development.ts`.

Чтобы добавить окружение staging, создайте копию `src/environments/environment.ts` с именем `src/environments/environment.staging.ts`, затем добавьте конфигурацию `staging` в `angular.json`:

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

В эту целевую конфигурацию окружения можно добавить и другие опции.
Любую опцию, поддерживаемую сборкой, можно переопределить в конфигурации цели сборки.

Чтобы собрать с конфигурацией staging, выполните следующую команду:

```shell

ng build --configuration staging

```

По умолчанию цель `build` включает конфигурации `production` и `development`, а `ng serve` использует development-сборку приложения.
Также можно настроить `ng serve` на использование целевой конфигурации сборки, задав опцию `buildTarget`:

```json

  "serve": {
    "builder": "@angular/build:dev-server",
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
Если `defaultConfiguration` не задана, `options` используются напрямую без изменений.
