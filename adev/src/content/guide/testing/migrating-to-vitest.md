# Миграция с Karma на Vitest

Angular CLI использует [Vitest](https://vitest.dev/) в качестве средства запуска модульных тестов по умолчанию для новых проектов. Это руководство содержит инструкции по миграции существующего проекта с Karma и Jasmine на Vitest.

ВАЖНО: Миграция существующего проекта на Vitest считается экспериментальной. Этот процесс также требует использования системы сборки `application`, которая является стандартной для всех новых проектов.

## Шаги ручной миграции {#manual-migration-steps}

Перед использованием автоматизированного схематика рефакторинга необходимо вручную обновить проект для использования Vitest.

### 1. Установка зависимостей {#1-install-dependencies}

Установите `vitest` и библиотеку эмуляции DOM. Хотя браузерное тестирование по-прежнему возможно (см. [шаг 5](#5-configure-browser-mode-optional)), Vitest по умолчанию использует библиотеку эмуляции DOM для имитации среды браузера в Node.js, что обеспечивает более быстрое выполнение тестов. CLI автоматически обнаруживает и использует `happy-dom`, если он установлен; иначе использует `jsdom`. Один из этих пакетов должен быть установлен.

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm install --save-dev vitest jsdom
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn add --dev vitest jsdom
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm add -D vitest jsdom
  </docs-code>
  <docs-code header="bun" language="shell">
    bun add --dev vitest jsdom
  </docs-code>
</docs-code-multifile>

### 2. Обновление `angular.json` {#2-update-angularjson}

В файле `angular.json` найдите цель `test` для своего проекта и измените `builder` на `@angular/build:unit-test`.

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test"
        }
      }
    }
  }
}
```

Сборщик `unit-test` по умолчанию использует `"tsConfig": "tsconfig.spec.json"` и `"buildTarget": "::development"`. Эти параметры можно явно задать, если проект требует других значений. Например, если конфигурация сборки `development` отсутствует или нужны другие параметры для тестирования, можно создать и использовать конфигурацию сборки `testing` или с другим именем для `buildTarget`.

Сборщик `@angular/build:karma` ранее позволял настраивать параметры сборки (такие как `polyfills`, `assets` или `styles`) непосредственно в цели `test`. Новый сборщик `@angular/build:unit-test` этого не поддерживает. Если специфичные для теста параметры сборки отличаются от существующей конфигурации сборки `development`, их необходимо перенести в отдельную конфигурацию цели сборки. Если параметры тестовой сборки уже совпадают с конфигурацией `development`, никаких действий не требуется.

### 3. Обработка пользовательских конфигураций `karma.conf.js` {#3-handle-custom-karmaconfjs-configurations}

Пользовательские конфигурации в `karma.conf.js` не переносятся автоматически. Перед удалением файла `karma.conf.js` просмотрите его на наличие пользовательских настроек, которые необходимо перенести.

Многие параметры Karma имеют эквиваленты в Vitest, которые можно задать в пользовательском файле конфигурации Vitest (например, `vitest.config.ts`) и связать с `angular.json` через параметр `runnerConfig`.

Общие пути миграции:

- **Репортёры**: репортёры Karma необходимо заменить совместимыми с Vitest. Их зачастую можно настроить напрямую в `angular.json` в свойстве `test.options.reporters`. Для более сложных конфигураций используйте пользовательский файл `vitest.config.ts`.
- **Плагины**: плагины Karma могут иметь эквиваленты в Vitest, которые нужно найти и установить. Обратите внимание, что покрытие кода является встроенной функцией Angular CLI и может быть включено с помощью `ng test --coverage`.
- **Пользовательские запуска браузеров**: они заменяются параметром `browsers` в `angular.json` и установкой провайдера браузера, такого как `@vitest/browser-playwright`.

Для других настроек обратитесь к официальной [документации Vitest](https://vitest.dev/config/).

### 4. Удаление Karma и файлов `test.ts` {#4-remove-karma-and-testts-files}

Теперь можно удалить `karma.conf.js` и `src/test.ts` из проекта и удалить пакеты, связанные с Karma. Следующие команды основаны на пакетах, установленных в новом проекте Angular CLI; ваш проект может содержать другие связанные с Karma пакеты для удаления.

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm uninstall karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn remove karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm remove karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core
  </docs-code>
  <docs-code header="bun" language="shell">
    bun remove karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core
  </docs-code>
</docs-code-multifile>

### 5. Настройка браузерного режима (необязательно) {#5-configure-browser-mode-optional}

Если нужно запускать тесты в реальном браузере, установите провайдер браузера и настройте `angular.json`.

**Установите провайдер браузера:**

Выберите один из следующих провайдеров браузера в зависимости от ваших потребностей:

- **Playwright**: `@vitest/browser-playwright` для Chromium, Firefox и WebKit.
- **WebdriverIO**: `@vitest/browser-webdriverio` для Chrome, Firefox, Safari и Edge.
- **Preview**: `@vitest/browser-preview` для сред Webcontainer (например, StackBlitz).

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm install --save-dev @vitest/browser-playwright
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn add --dev @vitest/browser-playwright
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm add -D @vitest/browser-playwright
  </docs-code>
  <docs-code header="bun" language="shell">
    bun add --dev @vitest/browser-playwright
  </docs-code>
</docs-code-multifile>

**Обновите `angular.json` для браузерного режима:**

Добавьте параметр `browsers` в параметры цели `test`. Имя браузера зависит от установленного провайдера (например, `chromium` для Playwright, `chrome` для WebdriverIO).

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "browsers": ["chromium"]
          }
        }
      }
    }
  }
}
```

Безголовый режим включается автоматически, если установлена переменная окружения `CI` или если имя браузера включает «Headless» (например, `ChromeHeadless`). В противном случае тесты будут запускаться в видимом браузере.

ПРИМЕЧАНИЕ: Отладка с помощью `ng test --debug` не поддерживается в браузерном режиме.

## Автоматизированный рефакторинг тестов с помощью схематиков {#automated-test-refactoring-with-schematics}

ВАЖНО: Схематик `refactor-jasmine-vitest` является экспериментальным и может не охватывать все возможные паттерны тестов. Всегда проверяйте изменения, внесённые схематиком.

Angular CLI предоставляет схематик `refactor-jasmine-vitest` для автоматического рефакторинга тестов Jasmine под Vitest.

### Обзор {#overview}

Схематик автоматизирует следующие преобразования в тестовых файлах (`.spec.ts`):

- Преобразует `fit` и `fdescribe` в `it.only` и `describe.only`.
- Преобразует `xit` и `xdescribe` в `it.skip` и `describe.skip`.
- Преобразует вызовы `spyOn` в эквивалентные `vi.spyOn`.
- Заменяет `jasmine.objectContaining` на `expect.objectContaining`.
- Заменяет `jasmine.any` на `expect.any`.
- Заменяет `jasmine.createSpy` на `vi.fn`.
- Обновляет `beforeAll`, `beforeEach`, `afterAll` и `afterEach` до эквивалентов Vitest.
- Преобразует `fail()` в `vi.fail()` Vitest.
- Корректирует ожидания для соответствия API Vitest.
- Добавляет TODO-комментарии для кода, который не может быть преобразован автоматически.

Схематик **не** выполняет следующие действия:

- Не устанавливает `vitest` или другие связанные зависимости.
- Не изменяет `angular.json` для использования сборщика Vitest и не переносит параметры сборки (например, `polyfills` или `styles`) из цели `test`.
- Не удаляет файлы `karma.conf.js` или `test.ts`.
- Не обрабатывает сложные или вложенные сценарии шпионов, которые могут потребовать ручного рефакторинга.

### Запуск схематика {#running-the-schematic}

После настройки проекта для Vitest можно запустить схематик для рефакторинга тестовых файлов.

Для рефакторинга **всех** тестовых файлов в проекте по умолчанию выполните:

```bash
ng g @schematics/angular:refactor-jasmine-vitest
```

### Параметры {#options}

Для настройки поведения схематика можно использовать следующие параметры:

| Параметр                 | Описание                                                                                                                       |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `--project <name>`       | Укажите проект для рефакторинга в рабочей области с несколькими проектами. <br> Пример: `--project=my-lib`                    |
| `--include <path>`       | Выполнить рефакторинг только конкретного файла или директории. <br> Пример: `--include=src/app/app.component.spec.ts`         |
| `--file-suffix <suffix>` | Укажите другой суффикс для тестовых файлов. <br> Пример: `--file-suffix=.test.ts`                                             |
| `--add-imports`          | Добавьте явные импорты `vitest`, если вы отключили глобальные настройки в конфигурации Vitest.                                 |
| `--verbose`              | Подробное журналирование всех применённых преобразований.                                                                      |
| `--browser-mode`         | Если планируется запуск тестов в браузерном режиме.                                                                            |

### После миграции {#after-migrating}

После завершения схематика рекомендуется:

1.  **Запустить тесты**: выполните `ng test`, чтобы убедиться, что все тесты по-прежнему проходят после рефакторинга.
2.  **Проверить изменения**: просмотрите изменения, внесённые схематиком, уделив особое внимание сложным тестам, особенно с замысловатыми шпионами или моками, которые могут потребовать дополнительной ручной корректировки.

Команда `ng test` собирает приложение в _режиме наблюдения_ и запускает настроенное средство запуска. Режим наблюдения включён по умолчанию при использовании интерактивного терминала и при отсутствии CI-среды.

## Конфигурация {#configuration}

Angular CLI берёт на себя конфигурацию Vitest, строя полную конфигурацию в памяти на основе параметров в `angular.json`.

### Пользовательская конфигурация Vitest {#custom-vitest-configuration}

ВАЖНО: Хотя использование пользовательской конфигурации открывает расширенные возможности, команда Angular не предоставляет прямую поддержку конкретного содержимого конфигурационного файла или каких-либо сторонних плагинов. CLI также переопределит некоторые свойства (`test.projects`, `test.include`) для обеспечения корректной работы.

Можно предоставить пользовательский файл конфигурации Vitest для переопределения настроек по умолчанию. Полный список доступных параметров см. в официальной [документации Vitest](https://vitest.dev/config/).

**1. Прямой путь:**
Укажите прямой путь к файлу конфигурации Vitest в `angular.json`:

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {"runnerConfig": "vitest.config.ts"}
        }
      }
    }
  }
}
```

**2. Автоматический поиск базовой конфигурации:**
Если задать `runnerConfig` в значение `true`, сборщик автоматически будет искать общий файл `vitest-base.config.*` в корнях проекта и рабочей области.

## Вспомогательные функции на основе `zone.js` не поддерживаются {#zonejs-based-helpers-are-not-supported}

Патчи zone.js не применяются при запуске тестов с Vitest, поэтому нельзя использовать функции `fakeAsync`, `flush` или `waitForAsync`.
Для миграции на Vitest также потребуется перевести тесты на нативный async и поддельные таймеры Vitest. Пример использования поддельных таймеров с Vitest см. [здесь](/guide/testing/components-scenarios#async-test-with-a-vitest-fake-timers).

## Сообщения об ошибках {#bug-reports}

Сообщайте о проблемах и запросах новых функций на [GitHub](https://github.com/angular/angular-cli/issues).

По возможности предоставляйте минимальный воспроизводящий пример, чтобы помочь команде в решении проблем.
