# Builders Angular CLI

Ряд команд Angular CLI запускает сложный процесс над вашим кодом, например сборку, тестирование или раздачу приложения.
Команды используют внутренний инструмент Architect для запуска _CLI builders_, которые вызывают другой инструмент (bundler, test runner, сервер) для выполнения желаемой задачи.
Пользовательские builders могут выполнять совершенно новую задачу или менять, какой сторонний инструмент используется существующей командой.

Этот документ объясняет, как CLI builders интегрируются с файлом конфигурации workspace, и показывает, как создать собственный builder.

HELPFUL: Код из используемых здесь примеров можно найти в этом [репозитории GitHub](https://github.com/mgechev/cli-builders-demo).

## CLI builders {#cli-builders}

Внутренний инструмент Architect делегирует работу функциям-обработчикам, называемым _builders_.
Функция-обработчик builder получает два аргумента:

| Аргумент  | Тип             |
| :-------- | :--------------- |
| `options` | `JSONObject`     |
| `context` | `BuilderContext` |

Разделение ответственности здесь такое же, как у [schematics](tools/cli/schematics-authoring), которые используются для других команд CLI, затрагивающих ваш код (например `ng generate`).

- Объект `options` предоставляется опциями и конфигурацией пользователя CLI, а объект `context` предоставляется CLI Builder API автоматически.
- Помимо контекстной информации, объект `context` также предоставляет доступ к методу планирования `context.scheduleTarget()`.
  Планировщик выполняет функцию-обработчик builder с данной конфигурацией цели.

Функция-обработчик builder может быть синхронной (возвращать значение), асинхронной (возвращать `Promise`) или отслеживать и возвращать несколько значений (возвращать `Observable`).
Возвращаемые значения всегда должны быть типа `BuilderOutput`.
Этот объект содержит Boolean-поле `success` и необязательное поле `error`, которое может содержать сообщение об ошибке.

Angular предоставляет некоторые builders, используемые CLI для команд вроде `ng build` и `ng test`.
Конфигурации целей по умолчанию для этих и других встроенных CLI builders можно найти и настроить в секции «architect» [файла конфигурации workspace](reference/configs/workspace-config) `angular.json`.
Также можно расширить и настроить Angular, создавая собственные builders, которые можно запускать напрямую с помощью [команды CLI `ng run`](cli/run).

### Структура проекта builder {#builder-project-structure}

Builder находится в папке «project», похожей по структуре на Angular workspace, с глобальными файлами конфигурации на верхнем уровне и более специфичной конфигурацией в исходной папке с файлами кода, определяющими поведение.
Например, папка `myBuilder` может содержать следующие файлы.

| Файлы                    | Назначение                                                                                                   |
| :----------------------- | :-------------------------------------------------------------------------------------------------------- |
| `src/my-builder.ts`      | Основной исходный файл определения builder.                                                              |
| `src/my-builder.spec.ts` | Исходный файл для тестов.                                                                                    |
| `src/schema.json`        | Определение входных опций builder.                                                                      |
| `builders.json`          | Определение builders.                                                                                      |
| `package.json`           | Зависимости. См. [https://docs.npmjs.com/files/package.json](https://docs.npmjs.com/files/package.json). |
| `tsconfig.json`          | [Конфигурация TypeScript](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).              |

Builders можно публиковать в `npm`, см. [Публикация библиотеки](tools/libraries/creating-libraries).

## Создание builder {#creating-a-builder}

В качестве примера создайте builder, который копирует файл в новое расположение.
Чтобы создать builder, используйте функцию CLI Builder `createBuilder()` и верните объект `Promise<BuilderOutput>`.

<docs-code header="src/my-builder.ts (builder skeleton)" path="adev/src/content/examples/cli-builder/src/my-builder.ts" region="builder-skeleton"/>

Теперь добавим в него логику.
Следующий код получает пути исходного и целевого файлов из опций пользователя и копирует файл из источника в назначение \(используя [Promise-версию встроенной функции Node.js `copyFile()`](https://nodejs.org/api/fs.html#fs_fspromises_copyfile_src_dest_mode)\).
Если операция копирования не удалась, он возвращает ошибку с сообщением о лежащей в основе проблеме.

<docs-code header="src/my-builder.ts (builder)" path="adev/src/content/examples/cli-builder/src/my-builder.ts" region="builder"/>

### Обработка вывода {#handling-output}

По умолчанию `copyFile()` ничего не печатает в стандартный вывод или ошибку процесса.
Если возникает ошибка, может быть трудно понять, что именно пытался сделать builder, когда произошла проблема.
Добавьте дополнительный контекст, логируя дополнительную информацию с помощью API `Logger`.
Это также позволяет выполнять сам builder в отдельном процессе, даже если стандартный вывод и ошибка деактивированы.

Экземпляр `Logger` можно получить из контекста.

<docs-code header="src/my-builder.ts (handling output)" path="adev/src/content/examples/cli-builder/src/my-builder.ts" region="handling-output"/>

### Отчёт о прогрессе и статусе {#progress-and-status-reporting}

CLI Builder API включает инструменты отчёта о прогрессе и статусе, которые могут давать подсказки для определённых функций и интерфейсов.

Чтобы сообщать о прогрессе, используйте метод `context.reportProgress()`, который принимает текущее значение, необязательный total и строку статуса как аргументы.
Total может быть любым числом. Например, если известно, сколько файлов нужно обработать, total может быть числом файлов, а current — числом уже обработанных.
Строка статуса не изменяется, пока вы не передадите новое строковое значение.

В нашем примере операция копирования либо завершается, либо всё ещё выполняется, поэтому отчёт о прогрессе не нужен, но можно сообщать статус, чтобы родительский builder, вызвавший наш builder, знал, что происходит.
Используйте метод `context.reportStatus()` для генерации строки статуса любой длины.

HELPFUL: Нет гарантии, что длинная строка будет показана полностью; она может быть обрезана, чтобы уместиться в UI, который её отображает.

Передайте пустую строку, чтобы удалить статус.

<docs-code header="src/my-builder.ts (progress reporting)" path="adev/src/content/examples/cli-builder/src/my-builder.ts" region="progress-reporting"/>

## Ввод builder {#builder-input}

Builder можно вызвать косвенно через команду CLI вроде `ng build` или напрямую командой Angular CLI `ng run`.
В любом случае необходимо предоставить обязательные входы, но другие входы могут использовать значения по умолчанию, предварительно настроенные для конкретной _цели_, указанные [конфигурацией](tools/cli/environments) или заданные в командной строке.

### Валидация ввода {#input-validation}

Входы builder определяются в JSON-схеме, связанной с этим builder.
Подобно schematics, инструмент Architect собирает разрешённые входные значения в объект `options` и проверяет их типы по схеме перед передачей в функцию builder.

Для нашего примера builder `options` должен быть `JsonObject` с двумя ключами:
`source` и `destination`, каждый из которых — строка.

Можно предоставить следующую схему для валидации типов этих значений.

```json {header: "schema.json"}
{
  "$schema": "http://json-schema.org/schema",
  "type": "object",
  "properties": {
    "source": {
      "type": "string"
    },
    "destination": {
      "type": "string"
    }
  }
}
```

HELPFUL: Это минимальный пример, но использование схемы для валидации может быть очень мощным.
Дополнительную информацию см. на [сайте JSON schemas](http://json-schema.org).

Чтобы связать реализацию builder с его схемой и именем, нужно создать файл _определения builder_, на который можно указать в `package.json`.

Создайте файл с именем `builders.json`, который выглядит так:

```json {header: "builders.json"}
{
  "builders": {
    "copy": {
      "implementation": "./dist/my-builder.js",
      "schema": "./src/schema.json",
      "description": "Copies a file."
    }
  }
}
```

В файле `package.json` добавьте ключ `builders`, который сообщает инструменту Architect, где найти файл определения builder.

```json {header: "package.json"}
{
  "name": "@example/copy-file",
  "version": "1.0.0",
  "description": "Builder for copying files",
  "builders": "builders.json",
  "dependencies": {
    "@angular/build": "^21.2.0"
  }
}
```

Официальное имя нашего builder теперь `@example/copy-file:copy`.
Первая часть — имя пакета, вторая — имя builder, как указано в файле `builders.json`.

Эти значения доступны в `options.source` и `options.destination`.

<docs-code header="src/my-builder.ts (report status)" path="adev/src/content/examples/cli-builder/src/my-builder.ts" region="report-status"/>

### Конфигурация цели {#target-configuration}

У builder должна быть определённая цель, связывающая его с конкретной входной конфигурацией и проектом.

Цели определяются в [файле конфигурации CLI](reference/configs/workspace-config) `angular.json`.
Цель указывает используемый builder, его конфигурацию опций по умолчанию и именованные альтернативные конфигурации.
Architect в Angular CLI использует определение цели для разрешения входных опций для данного запуска.

Файл `angular.json` имеет секцию для каждого проекта, а секция «architect» каждого проекта настраивает цели для builders, используемых командами CLI вроде 'build', 'test' и 'serve'.
По умолчанию, например, команда `ng build` запускает builder `@angular/build:application` для выполнения задачи сборки и передаёт значения опций по умолчанию, указанные для цели `build` в `angular.json`.

```json {header: "angular.json"}
{
  "myApp": {
    "...": "...",
    "architect": {
      "build": {
        "builder": "@angular/build:application",
        "options": {
          "outputPath": "dist/myApp",
          "index": "src/index.html",
          "...": "..."
        },
        "configurations": {
          "production": {
            "fileReplacements": [
              {
                "replace": "src/environments/environment.ts",
                "with": "src/environments/environment.prod.ts"
              }
            ],
            "optimization": true,
            "outputHashing": "all",
            "...": "..."
          }
        }
      },
      "...": "..."
    }
  }
}
```

Команда передаёт builder набор опций по умолчанию, указанных в секции «options».
Если передать флаг `--configuration=production`, используются значения переопределения, указанные в конфигурации `production`.
Дальнейшие переопределения опций указываются индивидуально в командной строке.

#### Строки целей {#target-strings}

Общая команда CLI `ng run` принимает в качестве первого аргумента строку цели следующей формы.

```shell

project:target[:configuration]

```

|               | Подробности                                                                                                               |
| :------------ | :-------------------------------------------------------------------------------------------------------------------- |
| project       | Имя проекта Angular CLI, с которым связана цель.                                               |
| target        | Именованная конфигурация builder из секции `architect` файла `angular.json`.                                |
| configuration | (необязательно) Имя конкретного переопределения конфигурации для данной цели, как определено в файле `angular.json`. |

Если ваш builder вызывает другой builder, ему может потребоваться прочитать переданную строку цели.
Разберите эту строку в объект с помощью утилитарной функции `targetFromTargetString()` из `@angular-devkit/architect`.

## Планирование и запуск {#schedule-and-run}

Architect запускает builders асинхронно.
Чтобы вызвать builder, вы планируете задачу, которая будет выполнена, когда всё разрешение конфигурации завершено.

Функция builder не выполняется, пока планировщик не вернёт управляющий объект `BuilderRun`.
CLI обычно планирует задачи, вызывая функцию `context.scheduleTarget()`, а затем разрешает входные опции, используя определение цели в файле `angular.json`.

Architect разрешает входные опции для данной цели, беря объект опций по умолчанию, затем перезаписывая значения из конфигурации, затем дополнительно перезаписывая значения из объекта overrides, переданного в `context.scheduleTarget()`.
Для Angular CLI объект overrides строится из аргументов командной строки.

Architect проверяет результирующие значения опций по схеме builder.
Если входы корректны, Architect создаёт контекст и выполняет builder.

Дополнительную информацию см. в [Конфигурация workspace](reference/configs/workspace-config).

HELPFUL: Builder также можно вызвать напрямую из другого builder или теста, вызвав `context.scheduleBuilder()`.
Вы передаёте объект `options` напрямую в метод, и эти значения опций проверяются по схеме builder без дальнейшей корректировки.

Только метод `context.scheduleTarget()` разрешает конфигурацию и переопределения через файл `angular.json`.

### Конфигурация architect по умолчанию {#default-architect-configuration}

Создадим простой файл `angular.json`, который помещает конфигурации целей в контекст.

Можно опубликовать builder в npm (см. [Публикация библиотеки](tools/libraries/creating-libraries#publishing-your-library)) и установить его следующей командой:

```shell

npm install @example/copy-file

```

Если создать новый проект с `ng new builder-test`, сгенерированный файл `angular.json` выглядит примерно так, только с конфигурациями builders по умолчанию.

```json {header: "angular.json"}
{
  "projects": {
    "builder-test": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "outputPath": "dist/builder-test",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": "src/polyfills.ts",
            "tsConfig": "src/tsconfig.app.json"
          },
          "configurations": {
            "production": {
              "optimization": true,
              "aot": true
            }
          }
        }
      }
    }
  }
}
```

### Добавление цели {#adding-a-target}

Добавьте новую цель, которая запустит наш builder для копирования файла.
Эта цель сообщает builder скопировать файл `package.json`.

- Мы добавим новую секцию цели в объект `architect` для нашего проекта
- Цель с именем `copy-package` использует наш builder, который вы опубликовали в `@example/copy-file`.
- Объект options предоставляет значения по умолчанию для двух определённых вами входов.
  - `source` — существующий файл, который вы копируете.
  - `destination` — путь, куда вы хотите скопировать.

```json {header: "angular.json"}
{
  "projects": {
    "builder-test": {
      "architect": {
        "copy-package": {
          "builder": "@example/copy-file:copy",
          "options": {
            "source": "package.json",
            "destination": "package-copy.json"
          }
        }
        // Existing targets...
      }
    }
  }
}
```

### Запуск builder {#running-the-builder}

Чтобы запустить наш builder с конфигурацией новой цели по умолчанию, используйте следующую команду CLI.

```shell

ng run builder-test:copy-package

```

Это копирует файл `package.json` в `package-copy.json`.

Используйте аргументы командной строки для переопределения настроенных значений по умолчанию.
Например, чтобы запустить с другим значением `destination`, используйте следующую команду CLI.

```shell

ng run builder-test:copy-package --destination=package-other.json

```

Это копирует файл в `package-other.json` вместо `package-copy.json`.
Поскольку вы не переопределили опцию _source_, копирование по-прежнему будет из файла `package.json` по умолчанию.

## Тестирование builder {#testing-a-builder}

Используйте интеграционное тестирование для builder, чтобы можно было использовать планировщик Architect для создания контекста, как в этом [примере](https://github.com/mgechev/cli-builders-demo).
В каталоге исходников builder создайте новый тестовый файл `my-builder.spec.ts`. Тест создаёт новые экземпляры `JsonSchemaRegistry` (для валидации схемы), `TestingArchitectHost` (in-memory реализация `ArchitectHost`) и `Architect`.

Вот пример теста, который запускает builder копирования файла.
Тест использует builder для копирования файла `package.json` и проверяет, что содержимое скопированного файла совпадает с источником.

<docs-code header="src/my-builder.spec.ts" path="adev/src/content/examples/cli-builder/src/my-builder.spec.ts"/>

HELPFUL: При запуске этого теста в вашем репозитории нужен пакет [`ts-node`](https://github.com/TypeStrong/ts-node).
Этого можно избежать, переименовав `my-builder.spec.ts` в `my-builder.spec.js`.

### Режим watch {#watch-mode}

Большинство builders запускаются один раз и возвращают результат. Однако это поведение не полностью совместимо с builder, который отслеживает изменения (например, devserver).
Architect может поддерживать режим watch, но есть несколько моментов, на которые стоит обратить внимание.

- Для использования с режимом watch функция-обработчик builder должна возвращать `Observable`.
  Architect подписывается на `Observable`, пока он не завершится, и может переиспользовать его, если builder снова запланирован с теми же аргументами.

- Builder всегда должен эмитить объект `BuilderOutput` после каждого выполнения.
  После выполнения он может войти в режим watch, запускаемый внешним событием.
  Если событие заставляет его перезапуститься, builder должен выполнить функцию `context.reportRunning()`, чтобы сообщить Architect, что он снова выполняется.
  Это предотвращает остановку builder Architect'ом, если запланирован другой запуск.

Когда ваш builder вызывает `BuilderRun.stop()` для выхода из режима watch, Architect отписывается от `Observable` builder и вызывает логику teardown builder для очистки.
Это поведение также позволяет останавливать и очищать долго выполняющиеся сборки.

В общем, если ваш builder отслеживает внешнее событие, следует разделить запуск на три фазы.

| Фазы     | Подробности                                                                                                                                                                                                                                       |
| :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Running    | Выполняемая задача, например вызов компилятора. Заканчивается, когда компилятор завершается и ваш builder эмитит объект `BuilderOutput`.                                                                                                  |
| Watching   | Между двумя запусками отслеживается внешний поток событий. Например, отслеживание файловой системы на любые изменения. Заканчивается, когда компилятор перезапускается и вызывается `context.reportRunning()`.                                                          |
| Completion | Либо задача полностью завершена, например компилятор, которому нужно запуститься несколько раз, либо запуск builder был остановлен (с помощью `BuilderRun.stop()`). Architect выполняет логику teardown и отписывается от `Observable` вашего builder. |

## Итог {#summary}

CLI Builder API предоставляет средство изменения поведения Angular CLI с помощью builders для выполнения пользовательской логики.

- Builders могут быть синхронными или асинхронными, выполняться один раз или отслеживать внешние события, а также планировать другие builders или цели.
- У builders есть значения опций по умолчанию, указанные в файле конфигурации `angular.json`, которые могут быть перезаписаны альтернативной конфигурацией для цели и дополнительно перезаписаны флагами командной строки
- Команда Angular рекомендует использовать интеграционные тесты для тестирования Architect builders. Используйте модульные тесты для валидации логики, которую выполняет builder.
- Если ваш builder возвращает `Observable`, он должен очищать builder в логике teardown этого `Observable`.
