# Unit-тестирование

Тестирование приложения Angular помогает проверить, что оно работает так, как вы ожидаете. Unit-тесты критичны для раннего обнаружения багов, обеспечения качества кода и безопасного рефакторинга.

NOTE: Это руководство охватывает настройку тестирования по умолчанию для новых проектов Angular CLI, которая использует Vitest. Если вы мигрируете существующий проект с Karma, см. [руководство по миграции с Karma на Vitest](guide/testing/migrating-to-vitest). Karma по-прежнему поддерживается; подробнее см. [руководство по тестированию с Karma](guide/testing/karma).

## Настройка для тестирования {#set-up-for-testing}

Angular CLI загружает и устанавливает всё необходимое для тестирования приложения Angular с [фреймворком тестирования Vitest](https://vitest.dev). Новые проекты включают `vitest` и `jsdom` по умолчанию.

Vitest запускает unit-тесты в окружении Node.js. Чтобы симулировать DOM браузера, Vitest использует библиотеку `jsdom`. Это позволяет быстрее выполнять тесты, избегая накладных расходов на запуск браузера. Можно заменить `jsdom` на альтернативу вроде `happy-dom`, установив её и удалив `jsdom`. Сейчас поддерживаемые библиотеки эмуляции DOM — `jsdom` и `happy-dom`.

Проект, созданный с CLI, сразу готов к тестированию. Запустите команду [`ng test`](cli/test):

```shell
ng test
```

Команда `ng test` собирает приложение в режиме _watch_ и запускает [test runner Vitest](https://vitest.dev).

Вывод консоли выглядит так:

```shell
 ✓ src/app/app.spec.ts (3)
   ✓ AppComponent should create the app
   ✓ AppComponent should have as title 'my-app'
   ✓ AppComponent should render title
 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  18:18:01
   Duration  2.46s (transform 615ms, setup 2ms, collect 2.21s, tests 5ms)
```

Команда `ng test` также следит за изменениями файлов. Если изменить файл и сохранить его, тесты запустятся снова.

## Конфигурация {#configuration}

Angular CLI обрабатывает большую часть конфигурации Vitest за вас. Поведение тестов можно настроить, изменив опции цели `test` в файле `angular.json`.

### Опции Angular.json {#angularjson-options}

- `include`: Glob-паттерны файлов для включения в тестирование. По умолчанию `['**/*.spec.ts', '**/*.test.ts']`.
- `exclude`: Glob-паттерны файлов для исключения из тестирования.
- `setupFiles`: Список путей к глобальным setup-файлам (например, polyfills или глобальные моки), выполняемым перед тестами.
- `providersFile`: Путь к файлу, экспортирующему массив Angular providers по умолчанию для тестового окружения. Полезно для настройки глобальных тестовых providers, внедряемых в тесты.
- `coverage`: Boolean для включения или отключения отчёта о покрытии кода. По умолчанию `false`.
- `browsers`: Массив имён браузеров для запуска тестов в реальном браузере (например, `["chromium"]`). Требует установки browser provider. См. раздел [Запуск тестов в браузере](#running-tests-in-a-browser).

### Глобальная настройка тестов и providers {#global-test-setup-and-providers}

Опции `setupFiles` и `providersFile` особенно полезны для управления глобальной конфигурацией тестов.

Например, можно создать файл `src/test-providers.ts` для предоставления `provideHttpClientTesting` всем тестам:

```typescript {header: "src/test-providers.ts"}
import {EnvironmentProviders, Provider} from '@angular/core';
import {provideHttpClientTesting} from '@angular/common/http/testing';

const testProviders: (Provider | EnvironmentProviders)[] = [provideHttpClientTesting()];

export default testProviders;
```

Затем сошлитесь на этот файл в `angular.json`:

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "providersFile": "src/test-providers.ts"
          }
        }
      }
    }
  }
}
```

HELPFUL: При создании новых TypeScript-файлов для setup тестов или providers, вроде `src/test-providers.ts`, убедитесь, что они включены в файл конфигурации TypeScript для тестов проекта (обычно `tsconfig.spec.json`). Это позволяет компилятору TypeScript корректно обрабатывать эти файлы во время тестирования.

### Продвинутая конфигурация Vitest {#advanced-vitest-configuration}

Для продвинутых сценариев можно предоставить пользовательский файл конфигурации Vitest через опцию `runnerConfig` в `angular.json`.

IMPORTANT: Хотя пользовательская конфигурация включает продвинутые опции, команда Angular не предоставляет поддержку содержимого файла конфигурации или сторонних плагинов. CLI также переопределит определённые свойства (`test.projects`, `test.include`) для обеспечения корректной интеграции.

Можно создать файл конфигурации Vitest (например, `vitest-base.config.ts`) и сослаться на него в `angular.json`:

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "runnerConfig": "vitest-base.config.ts"
          }
        }
      }
    }
  }
}
```

Также можно сгенерировать базовый файл конфигурации через CLI:

```shell
ng generate config vitest
```

Это создаёт файл `vitest-base.config.ts`, который можно настроить.

HELPFUL: Подробнее о конфигурации Vitest — в [официальной документации Vitest](https://vitest.dev/config/).

## Покрытие кода {#code-coverage}

Отчёт о покрытии кода можно сгенерировать, добавив флаг `--coverage` к команде `ng test`. Отчёт генерируется в каталоге `coverage/`.

Подробнее см. в [руководстве по покрытию кода](guide/testing/code-coverage).

## Запуск тестов в браузере {#running-tests-in-a-browser}

Хотя окружение Node.js по умолчанию быстрее для большинства unit-тестов, тесты также можно запускать в реальном браузере. Это полезно для тестов, опирающихся на browser-specific API (например, рендер), или для отладки.

Чтобы запускать тесты в браузере, сначала нужно установить browser provider. Подробнее о browser mode Vitest — в [официальной документации](https://vitest.dev/guide/browser).

После установки provider можно запускать тесты в браузере, настроив опцию `browsers` в `angular.json` или используя флаг CLI `--browsers`. По умолчанию тесты запускаются в headed-браузере. Если установлена переменная окружения `CI`, вместо этого используется headless-режим. Чтобы явно управлять headless-режимом, можно добавить суффикс `Headless` к имени браузера (например, `chromiumHeadless`).

```bash
# Example for Playwright (headed)
ng test --browsers=chromium

# Example for Playwright (headless)
ng test --browsers=chromiumHeadless

# Example for WebdriverIO (headed)
ng test --browsers=chrome

# Example for WebdriverIO (headless)
ng test --browsers=chromeHeadless
```

Выберите один из следующих browser providers в зависимости от потребностей:

### Playwright {#playwright}

[Playwright](https://playwright.dev/) — библиотека автоматизации браузера, поддерживающая Chromium, Firefox и WebKit.

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm install --save-dev @vitest/browser-playwright playwright
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn add --dev @vitest/browser-playwright playwright
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm add -D @vitest/browser-playwright playwright
  </docs-code>
  <docs-code header="bun" language="shell">
    bun add --dev @vitest/browser-playwright playwright
  </docs-code>
</docs-code-multifile>

### WebdriverIO {#webdriverio}

[WebdriverIO](https://webdriver.io/) — фреймворк автоматизации браузера и мобильных устройств, поддерживающий Chrome, Firefox, Safari и Edge.

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm install --save-dev @vitest/browser-webdriverio webdriverio
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn add --dev @vitest/browser-webdriverio webdriverio
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm add -D @vitest/browser-webdriverio webdriverio
  </docs-code>
  <docs-code header="bun" language="shell">
    bun add --dev @vitest/browser-webdriverio webdriverio
  </docs-code>
</docs-code-multifile>

### Preview {#preview}

Provider `@vitest/browser-preview` предназначен для окружений WebContainer вроде StackBlitz и не предназначен для использования в CI/CD.

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm install --save-dev @vitest/browser-preview
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn add --dev @vitest/browser-preview
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm add -D @vitest/browser-preview
  </docs-code>
  <docs-code header="bun" language="shell">
    bun add --dev @vitest/browser-preview
  </docs-code>
</docs-code-multifile>

HELPFUL: Для более продвинутой browser-specific конфигурации см. раздел [Продвинутая конфигурация Vitest](#advanced-vitest-configuration).

## Другие фреймворки тестирования {#other-test-frameworks}

Приложение Angular также можно unit-тестировать с другими библиотеками тестирования и test runners. У каждой библиотеки и runner свои процедуры установки, конфигурация и синтаксис.

## Тестирование в непрерывной интеграции {#testing-in-continuous-integration}

Надёжный набор тестов — ключевая часть пайплайна непрерывной интеграции (CI). CI-серверы позволяют автоматизировать тесты для запуска на каждом коммите и pull request.

Чтобы тестировать приложение Angular на CI-сервере, запустите стандартную команду тестирования:

```shell
ng test
```

Большинство CI-серверов устанавливают переменную окружения `CI=true`, которую обнаруживает `ng test`. Это автоматически настраивает тесты на запуск в неинтерактивном режиме single-run.

Если CI-сервер не устанавливает эту переменную или нужно принудительно включить режим single-run вручную, можно использовать флаги `--no-watch` и `--no-progress`:

```shell
ng test --no-watch --no-progress
```

## Дополнительная информация о тестировании {#more-information-on-testing}

После настройки приложения для тестирования могут быть полезны следующие руководства.

|                                                                    | Подробности                                                                       |
| :----------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| [Покрытие кода](guide/testing/code-coverage)                       | Сколько приложения покрывают тесты и как задать требуемые объёмы.                 |
| [Тестирование сервисов](guide/testing/services)                    | Как тестировать сервисы, которые использует приложение.                           |
| [Основы тестирования компонентов](guide/testing/components-basics) | Основы тестирования компонентов Angular.                                          |
| [Сценарии тестирования компонентов](guide/testing/components-scenarios) | Разные виды сценариев и use cases тестирования компонентов.                  |
| [Тестирование attribute-директив](guide/testing/attribute-directives) | Как тестировать attribute-директивы.                                          |
| [Тестирование pipes](guide/testing/pipes)                          | Как тестировать pipes.                                                            |
| [Отладка тестов](guide/testing/debugging)                          | Типичные баги тестирования.                                                       |
| [Утилитарные API тестирования](guide/testing/utility-apis)         | Возможности тестирования Angular.                                                 |
