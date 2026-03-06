# Юнит-тестирование {#unit-testing}

Тестирование Angular-приложения помогает убедиться, что оно работает так, как ожидается. Юнит-тесты критически важны для раннего обнаружения ошибок, обеспечения качества кода и безопасного рефакторинга.

NOTE: Это руководство охватывает настройку тестирования по умолчанию для новых Angular CLI-проектов, использующую Vitest. Если вы мигрируете существующий проект с Karma, смотрите [руководство по миграции с Karma на Vitest](guide/testing/migrating-to-vitest). Karma по-прежнему поддерживается; подробнее смотрите в [руководстве по тестированию с Karma](guide/testing/karma).

## Настройка тестирования {#set-up-for-testing}

Angular CLI загружает и устанавливает всё необходимое для тестирования Angular-приложения с помощью [фреймворка Vitest](https://vitest.dev). Новые проекты включают `vitest` и `jsdom` по умолчанию.

Vitest запускает юнит-тесты в среде Node.js. Для эмуляции DOM браузера Vitest использует библиотеку `jsdom`. Это позволяет ускорить выполнение тестов, избегая накладных расходов на запуск браузера. Вместо `jsdom` можно использовать `happy-dom`: установите его и удалите `jsdom`. В настоящее время поддерживаются только `jsdom` и `happy-dom`.

Проект, созданный с помощью CLI, сразу готов к тестированию. Запустите команду [`ng test`](cli/test):

```shell
ng test
```

Команда `ng test` собирает приложение в _режиме наблюдения_ и запускает [тест-раннер Vitest](https://vitest.dev).

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

Команда `ng test` также отслеживает изменения в файлах. При изменении и сохранении файла тесты запустятся снова.

## Конфигурация {#configuration}

Angular CLI берёт на себя большую часть конфигурации Vitest. Поведение тестов можно настроить, изменив параметры цели `test` в файле `angular.json`.

### Параметры Angular.json {#angularjson-options}

- `include`: glob-шаблоны файлов для включения в тестирование. По умолчанию: `['**/*.spec.ts', '**/*.test.ts']`.
- `exclude`: glob-шаблоны файлов для исключения из тестирования.
- `setupFiles`: список путей к глобальным файлам настройки (например, полифиллам или глобальным моккам), которые выполняются до запуска тестов.
- `providersFile`: путь к файлу, экспортирующему массив Angular-провайдеров по умолчанию для тестовой среды. Полезен для настройки глобальных тестовых провайдеров, внедряемых в тесты.
- `coverage`: булево значение для включения или отключения отчёта о покрытии кода. По умолчанию: `false`.
- `browsers`: массив имён браузеров для запуска тестов в реальном браузере (например, `["chromium"]`). Требует установки провайдера браузера. Подробнее смотрите в разделе [Запуск тестов в браузере](#running-tests-in-a-browser).

### Глобальная настройка тестов и провайдеры {#global-test-setup-and-providers}

Параметры `setupFiles` и `providersFile` особенно полезны для управления глобальной конфигурацией тестов.

Например, можно создать файл `src/test-providers.ts` для предоставления `provideHttpClientTesting` во всех тестах:

```typescript {header: "src/test-providers.ts"}
import {Provider} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';

const testProviders: Provider[] = [provideHttpClient(), provideHttpClientTesting()];

export default testProviders;
```

Затем укажите этот файл в `angular.json`:

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

HELPFUL: При создании новых TypeScript-файлов для настройки тестов или провайдеров, таких как `src/test-providers.ts`, убедитесь, что они включены в конфигурационный файл TypeScript для тестов проекта (обычно `tsconfig.spec.json`). Это позволит компилятору TypeScript корректно обрабатывать эти файлы при тестировании.

### Расширенная конфигурация Vitest {#advanced-vitest-configuration}

Для сложных случаев можно предоставить пользовательский конфигурационный файл Vitest, используя параметр `configFile` в `angular.json`.

IMPORTANT: Хотя использование пользовательской конфигурации открывает расширенные возможности, команда Angular не оказывает поддержку содержимого конфигурационного файла или сторонних плагинов. CLI также переопределяет определённые свойства (`test.projects`, `test.include`) для обеспечения правильной интеграции.

Создайте файл конфигурации Vitest (например, `vitest-base.config.ts`) и укажите его в `angular.json`:

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

Базовый конфигурационный файл также можно сгенерировать с помощью CLI:

```shell
ng generate config vitest
```

Это создаёт файл `vitest-base.config.ts`, который можно настроить.

HELPFUL: Подробнее о конфигурации Vitest читайте в [официальной документации Vitest](https://vitest.dev/config/).

## Покрытие кода {#code-coverage}

Отчёт о покрытии кода можно сгенерировать, добавив флаг `--coverage` к команде `ng test`. Отчёт будет помещён в директорию `coverage/`.

Подробнее смотрите в [руководстве по покрытию кода](guide/testing/code-coverage).

## Запуск тестов в браузере {#running-tests-in-a-browser}

Хотя среда Node.js по умолчанию быстрее для большинства юнит-тестов, тесты также можно запускать в реальном браузере. Это полезно для тестов, зависящих от браузерных API (например, рендеринга), или для отладки.

Для запуска тестов в браузере сначала установите провайдер браузера. Подробнее о браузерном режиме Vitest читайте в [официальной документации](https://vitest.dev/guide/browser).

После установки провайдера запустите тесты в браузере, настроив параметр `browsers` в `angular.json` или используя флаг `--browsers` CLI. Тесты запускаются в режиме с интерфейсом по умолчанию. Если установлена переменная окружения `CI`, вместо этого используется безголовый режим. Для явного управления безголовым режимом добавьте суффикс `Headless` к имени браузера (например, `chromiumHeadless`).

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

Выберите один из следующих провайдеров браузера в зависимости от ваших потребностей:

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

[WebdriverIO](https://webdriver.io/) — фреймворк для тестирования автоматизации браузера и мобильных устройств, поддерживающий Chrome, Firefox, Safari и Edge.

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

HELPFUL: Для более расширенной конфигурации, специфичной для браузера, смотрите раздел [Расширенная конфигурация Vitest](#advanced-vitest-configuration).

## Другие тестовые фреймворки {#other-test-frameworks}

Юнит-тесты Angular-приложения можно также писать с использованием других тестовых библиотек и тест-раннеров. Каждая библиотека и раннер имеют свои процедуры установки, конфигурации и синтаксис.

## Тестирование в непрерывной интеграции {#testing-in-continuous-integration}

Надёжный набор тестов — важная часть конвейера непрерывной интеграции (CI). Серверы CI позволяют автоматически запускать тесты при каждом коммите и пул-реквесте.

Для тестирования Angular-приложения на CI-сервере выполните стандартную команду тестирования:

```shell
ng test
```

Большинство CI-серверов устанавливают переменную окружения `CI=true`, которую `ng test` обнаруживает. Это автоматически настраивает тесты на запуск в неинтерактивном одноразовом режиме.

Если ваш CI-сервер не устанавливает эту переменную или нужно принудительно задать одноразовый режим, используйте флаги `--no-watch` и `--no-progress`:

```shell
ng test --no-watch --no-progress
```

## Дополнительная информация о тестировании {#more-information-on-testing}

После настройки приложения для тестирования могут быть полезны следующие руководства.

|                                                                    | Описание                                                                          |
| :----------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| [Покрытие кода](guide/testing/code-coverage)                       | Насколько тесты охватывают приложение и как задавать требуемый уровень покрытия. |
| [Тестирование сервисов](guide/testing/services)                    | Как тестировать сервисы, используемые приложением.                                |
| [Основы тестирования компонентов](guide/testing/components-basics) | Основы тестирования Angular-компонентов.                                          |
| [Сценарии тестирования компонентов](guide/testing/components-scenarios) | Различные виды сценариев и случаев тестирования компонентов.               |
| [Тестирование атрибутивных директив](guide/testing/attribute-directives) | Как тестировать атрибутивные директивы.                                   |
| [Тестирование Pipe](guide/testing/pipes)                           | Как тестировать Pipe.                                                             |
| [Отладка тестов](guide/testing/debugging)                          | Распространённые ошибки при тестировании.                                         |
| [API вспомогательных утилит тестирования](guide/testing/utility-apis) | Функции тестирования Angular.                                                  |
