# Модульное тестирование

Тестирование Angular-приложения помогает убедиться, что оно работает так, как вы ожидаете. Модульные тесты играют ключевую роль в раннем обнаружении ошибок, обеспечении качества кода и безопасном рефакторинге.

ПРИМЕЧАНИЕ: Это руководство охватывает стандартную настройку тестирования для новых проектов Angular CLI, которая использует Vitest. Если вы переносите существующий проект с Karma, см. [руководство по миграции с Karma на Vitest](guide/testing/migrating-to-vitest). Karma по-прежнему поддерживается; дополнительную информацию см. в [руководстве по тестированию с Karma](guide/testing/karma).

## Настройка для тестирования {#set-up-for-testing}

Angular CLI загружает и устанавливает всё необходимое для тестирования Angular-приложения с помощью [фреймворка тестирования Vitest](https://vitest.dev). В новых проектах по умолчанию включены `vitest` и `jsdom`.

Vitest запускает модульные тесты в среде Node.js. Для имитации DOM браузера Vitest использует библиотеку `jsdom`. Это позволяет ускорить выполнение тестов, избегая накладных расходов на запуск браузера. Вы можете заменить `jsdom` альтернативой, например `happy-dom`, установив его и удалив `jsdom`. На данный момент `jsdom` и `happy-dom` являются поддерживаемыми библиотеками эмуляции DOM.

Проект, созданный с помощью CLI, сразу готов к тестированию. Выполните команду [`ng test`](cli/test):

```shell
ng test
```

Команда `ng test` собирает приложение в _режиме наблюдения_ и запускает [средство запуска тестов Vitest](https://vitest.dev).

Вывод в консоли выглядит следующим образом:

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

Команда `ng test` также следит за изменениями файлов. Если вы изменяете файл и сохраняете его, тесты будут запущены снова.

## Конфигурация {#configuration}

Angular CLI берёт на себя большую часть настройки Vitest. Вы можете настроить поведение тестов, изменив параметры цели `test` в файле `angular.json`.

### Параметры Angular.json {#angularjson-options}

- `include`: Glob-паттерны для включаемых в тестирование файлов. По умолчанию `['**/*.spec.ts', '**/*.test.ts']`.
- `exclude`: Glob-паттерны для исключаемых из тестирования файлов.
- `setupFiles`: Список путей к глобальным файлам настройки (например, полифиллы или глобальные моки), которые выполняются перед тестами.
- `providersFile`: Путь к файлу, который экспортирует массив Angular-провайдеров по умолчанию для тестовой среды. Полезно для настройки глобальных тестовых провайдеров, внедряемых в тесты.
- `coverage`: Логическое значение для включения или отключения отчёта о покрытии кода. По умолчанию `false`.
- `browsers`: Массив имён браузеров для запуска тестов в реальном браузере (например, `["chromium"]`). Требует установки провайдера браузера. Подробнее см. раздел [Запуск тестов в браузере](#running-tests-in-a-browser).

### Глобальная настройка тестов и провайдеры {#global-test-setup-and-providers}

Параметры `setupFiles` и `providersFile` особенно полезны для управления глобальной конфигурацией тестов.

Например, можно создать файл `src/test-providers.ts`, чтобы предоставить `provideHttpClientTesting` для всех тестов:

```typescript {header: "src/test-providers.ts"}
import {Provider} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';

const testProviders: Provider[] = [provideHttpClient(), provideHttpClientTesting()];

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

ПОЛЕЗНО: При создании новых файлов TypeScript для настройки тестов или провайдеров, таких как `src/test-providers.ts`, убедитесь, что они включены в конфигурационный файл TypeScript для тестов вашего проекта (обычно `tsconfig.spec.json`). Это позволяет компилятору TypeScript правильно обрабатывать эти файлы во время тестирования.

### Расширенная конфигурация Vitest {#advanced-vitest-configuration}

Для продвинутых случаев можно указать пользовательский файл конфигурации Vitest с помощью параметра `configFile` в `angular.json`.

ВАЖНО: Хотя использование пользовательской конфигурации открывает расширенные возможности, команда Angular не предоставляет поддержку содержимого конфигурационного файла или сторонних плагинов. CLI также переопределит некоторые свойства (`test.projects`, `test.include`) для обеспечения корректной интеграции.

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

Также можно сгенерировать базовый конфигурационный файл с помощью CLI:

```shell
ng generate config vitest
```

Это создаёт файл `vitest-base.config.ts`, который можно настроить.

ПОЛЕЗНО: Подробнее о конфигурации Vitest читайте в [официальной документации Vitest](https://vitest.dev/config/).

## Покрытие кода {#code-coverage}

Вы можете сгенерировать отчёт о покрытии кода, добавив флаг `--coverage` к команде `ng test`. Отчёт создаётся в директории `coverage/`.

Подробнее см. в [руководстве по покрытию кода](guide/testing/code-coverage).

## Запуск тестов в браузере {#running-tests-in-a-browser}

Хотя стандартная среда Node.js быстрее для большинства модульных тестов, вы также можете запускать тесты в реальном браузере. Это полезно для тестов, зависящих от API, специфичных для браузера (например, рендеринга), или для отладки.

Для запуска тестов в браузере необходимо сначала установить провайдер браузера. Подробнее о браузерном режиме Vitest читайте в [официальной документации](https://vitest.dev/guide/browser).

После установки провайдера вы можете запускать тесты в браузере, настроив параметр `browsers` в `angular.json` или используя флаг CLI `--browsers`. По умолчанию тесты запускаются в видимом браузере. Если установлена переменная окружения `CI`, вместо этого используется безголовый (headless) режим. Для явного управления безголовым режимом добавьте к имени браузера суффикс `Headless` (например, `chromiumHeadless`).

```bash
# Пример для Playwright (с интерфейсом)
ng test --browsers=chromium

# Пример для Playwright (безголовой)
ng test --browsers=chromiumHeadless

# Пример для WebdriverIO (с интерфейсом)
ng test --browsers=chrome

# Пример для WebdriverIO (безголовой)
ng test --browsers=chromeHeadless
```

Выберите один из следующих провайдеров браузера в зависимости от ваших потребностей:

### Playwright

[Playwright](https://playwright.dev/) — библиотека автоматизации браузера с поддержкой Chromium, Firefox и WebKit.

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

### WebdriverIO

[WebdriverIO](https://webdriver.io/) — фреймворк для автоматизированного тестирования браузеров и мобильных устройств с поддержкой Chrome, Firefox, Safari и Edge.

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

### Preview

Провайдер `@vitest/browser-preview` предназначен для сред Webcontainer, таких как StackBlitz, и не предназначен для использования в CI/CD.

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

ПОЛЕЗНО: Для более продвинутой конфигурации браузера см. раздел [Расширенная конфигурация Vitest](#advanced-vitest-configuration).

## Другие фреймворки тестирования {#other-test-frameworks}

Вы также можете проводить модульное тестирование Angular-приложения с помощью других библиотек тестирования и средств запуска тестов. Каждая библиотека и средство запуска имеют собственные процедуры установки, конфигурацию и синтаксис.

## Тестирование в системе непрерывной интеграции {#testing-in-continuous-integration}

Надёжный набор тестов является ключевым компонентом конвейера непрерывной интеграции (CI). Серверы CI позволяют автоматизировать запуск тестов при каждом коммите и pull request.

Для тестирования Angular-приложения на сервере CI выполните стандартную команду:

```shell
ng test
```

Большинство серверов CI устанавливают переменную окружения `CI=true`, которую `ng test` обнаруживает. Это автоматически настраивает тесты на запуск в неинтерактивном, однократном режиме.

Если сервер CI не устанавливает эту переменную или если нужно принудительно включить однократный режим вручную, используйте флаги `--no-watch` и `--no-progress`:

```shell
ng test --no-watch --no-progress
```

## Дополнительная информация о тестировании {#more-information-on-testing}

После настройки приложения для тестирования вам могут оказаться полезными следующие руководства.

|                                                                                        | Подробности                                                                                              |
| :------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| [Покрытие кода](guide/testing/code-coverage)                                           | Какую часть приложения покрывают тесты и как задать требуемый уровень покрытия.                          |
| [Тестирование сервисов](guide/testing/services)                                        | Как тестировать сервисы, используемые в приложении.                                                     |
| [Основы тестирования компонентов](guide/testing/components-basics)                    | Основы тестирования Angular-компонентов.                                                                 |
| [Сценарии тестирования компонентов](guide/testing/components-scenarios)               | Различные виды сценариев и варианты использования при тестировании компонентов.                          |
| [Тестирование атрибутных директив](guide/testing/attribute-directives)                | Как тестировать атрибутные директивы.                                                                    |
| [Тестирование пайпов](guide/testing/pipes)                                             | Как тестировать пайпы.                                                                                   |
| [Отладка тестов](guide/testing/debugging)                                              | Распространённые ошибки при тестировании.                                                               |
| [API утилит тестирования](guide/testing/utility-apis)                                  | Возможности Angular для тестирования.                                                                    |
