# Миграция с Karma на Vitest

Angular CLI использует [Vitest](https://vitest.dev/) как test runner unit-тестов по умолчанию для новых проектов. Это руководство предоставляет инструкции по миграции существующего проекта с Karma и Jasmine на Vitest.

IMPORTANT: Миграция существующего проекта на Vitest считается экспериментальной. Этот процесс также требует использования системы сборки `application`, которая является значением по умолчанию для всех вновь создаваемых проектов.

## Шаги ручной миграции {#manual-migration-steps}

Перед использованием автоматизированной схемы рефакторинга нужно вручную обновить проект для использования test runner Vitest.

### 1. Установка зависимостей {#1-install-dependencies}

Установите `vitest` и библиотеку эмуляции DOM. Хотя тестирование в браузере по-прежнему возможно (см. [шаг 5](#5-configure-browser-mode-optional)), Vitest по умолчанию использует библиотеку эмуляции DOM для симуляции окружения браузера в Node.js для более быстрого выполнения тестов. CLI автоматически обнаруживает и использует `happy-dom`, если он установлен; иначе откатывается к `jsdom`. Один из этих пакетов должен быть установлен.

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

В файле `angular.json` найдите цель `test` для проекта и измените `builder` на `@angular/build:unit-test`.

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

Builder `unit-test` по умолчанию использует `"tsConfig": "tsconfig.spec.json"` и `"buildTarget": "::development"`. Можно явно задать эти опции, если проекту нужны другие значения. Например, если конфигурация сборки `development` отсутствует или для тестирования нужны другие опции, можно создать и использовать конфигурацию сборки `testing` или с похожим именем для `buildTarget`.

Builder `@angular/build:karma` ранее позволял настраивать опции сборки (вроде `polyfills`, `assets` или `styles`) напрямую внутри цели `test`. Новый builder `@angular/build:unit-test` это не поддерживает. Если опции сборки, специфичные для тестов, отличаются от существующей конфигурации сборки `development`, их нужно перенести в выделенную конфигурацию цели сборки. Если опции сборки тестов уже совпадают с конфигурацией сборки `development`, действий не требуется.

### 3. Обработка пользовательских конфигураций `karma.conf.js` {#3-handle-custom-karmaconfjs-configurations}

Пользовательские конфигурации в `karma.conf.js` не мигрируются автоматически. Перед удалением файла `karma.conf.js` просмотрите его на предмет пользовательских настроек, которые нужно мигрировать.

Многие опции Karma имеют эквиваленты в Vitest, которые можно задать в пользовательском файле конфигурации Vitest (например, `vitest.config.ts`) и связать с `angular.json` через опцию `runnerConfig`.

Типичные пути миграции:

- **Reporters**: reporters Karma нужно заменить на совместимые с Vitest. Их часто можно настроить напрямую в `angular.json` в свойстве `test.options.reporters`. Для более продвинутых конфигураций используйте пользовательский файл `vitest.config.ts`.
- **Plugins**: у плагинов Karma могут быть эквиваленты Vitest, которые нужно найти и установить. Обратите внимание, что покрытие кода — first-class возможность в Angular CLI и может быть включено через `ng test --coverage`.
- **Custom Browser Launchers**: заменяются опцией `browsers` в `angular.json` и установкой browser provider вроде `@vitest/browser-playwright`.

Для других настроек обратитесь к официальной [документации Vitest](https://vitest.dev/config/).

### 4. Удаление файлов Karma и `test.ts` {#4-remove-karma-and-testts-files}

Теперь можно удалить `karma.conf.js` и `src/test.ts` из проекта и удалить пакеты, связанные с Karma. Следующие команды основаны на пакетах, устанавливаемых в новом проекте Angular CLI; в вашем проекте могут быть другие пакеты, связанные с Karma, для удаления.

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

### 5. Настройка browser mode (опционально) {#5-configure-browser-mode-optional}

Если нужно запускать тесты в реальном браузере, нужно установить browser provider и настроить `angular.json`.

**Установите browser provider:**

Выберите один из следующих browser providers в зависимости от потребностей:

- **Playwright**: `@vitest/browser-playwright` для Chromium, Firefox и WebKit.
- **WebdriverIO**: `@vitest/browser-webdriverio` для Chrome, Firefox, Safari и Edge.
- **Preview**: `@vitest/browser-preview` для окружений WebContainer (вроде StackBlitz).

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

**Обновите `angular.json` для browser mode:**

Добавьте опцию `browsers` в опции цели `test`. Имя браузера зависит от установленного provider (например, `chromium` для Playwright, `chrome` для WebdriverIO).

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

Headless-режим включается автоматически, если установлена переменная окружения `CI` или если имя браузера включает «Headless» (например, `ChromeHeadless`). Иначе тесты запускаются в headed-браузере.

## Автоматизированный рефакторинг тестов со схемами {#automated-test-refactoring-with-schematics}

IMPORTANT: Схема `refactor-jasmine-vitest` экспериментальна и может не покрывать все возможные паттерны тестов. Всегда просматривайте изменения, сделанные схемой.

Angular CLI предоставляет схему `refactor-jasmine-vitest` для автоматического рефакторинга тестов Jasmine на использование Vitest.

### Обзор {#overview}

Схема автоматизирует следующие преобразования в тестовых файлах (`.spec.ts`):

- Преобразует `fit` и `fdescribe` в `it.only` и `describe.only`.
- Преобразует `xit` и `xdescribe` в `it.skip` и `describe.skip`.
- Преобразует вызовы `spyOn` в эквивалент `vi.spyOn`.
- Заменяет `jasmine.objectContaining` на `expect.objectContaining`.
- Заменяет `jasmine.any` на `expect.any`.
- Заменяет `jasmine.createSpy` на `vi.fn`.
- Обновляет `beforeAll`, `beforeEach`, `afterAll` и `afterEach` до их эквивалентов Vitest.
- Преобразует `fail()` в `vi.fail()` Vitest.
- Корректирует expectations для соответствия API Vitest
- Добавляет TODO-комментарии для кода, который нельзя преобразовать автоматически

Схема **не** выполняет следующие действия:

- Не устанавливает `vitest` или связанные зависимости.
- Не меняет `angular.json` для использования Vitest builder и не мигрирует опции сборки (вроде `polyfills` или `styles`) из цели `test`.
- Не удаляет файлы `karma.conf.js` или `test.ts`.
- Не обрабатывает сложные или вложенные сценарии spy, которые могут потребовать ручного рефакторинга.

### Запуск схемы {#running-the-schematic}

Когда проект настроен для Vitest, можно запустить схему для рефакторинга тестовых файлов.

Чтобы рефакторить **все** тестовые файлы в проекте по умолчанию, выполните:

```bash
ng g @schematics/angular:refactor-jasmine-vitest
```

### Опции {#options}

Можно использовать следующие опции для настройки поведения схемы:

| Опция                    | Описание                                                                                            |
| :----------------------- | :-------------------------------------------------------------------------------------------------- |
| `--project <name>`       | Указать проект для рефакторинга в multi-project workspace. <br> Пример: `--project=my-lib`          |
| `--include <path>`       | Рефакторить только конкретный файл или каталог. <br> Пример: `--include=src/app/app.component.spec.ts` |
| `--file-suffix <suffix>` | Указать другой суффикс файла для тестовых файлов. <br> Пример: `--file-suffix=.test.ts`             |
| `--add-imports`          | Добавить явные импорты `vitest`, если globals отключены в конфигурации Vitest.                      |
| `--verbose`              | Показать подробное логирование всех применённых преобразований.                                     |
| `--browser-mode`         | Если вы намерены запускать тесты в browser mode.                                                    |

### После миграции {#after-migrating}

После завершения схемы хорошая практика:

1.  **Запустить тесты**: выполните `ng test`, чтобы убедиться, что все тесты по-прежнему проходят после рефакторинга.
2.  **Просмотреть изменения**: просмотрите изменения, сделанные схемой, уделяя особое внимание сложным тестам, особенно с запутанными spies или моками, поскольку они могут потребовать дальнейших ручных корректировок.

Команда `ng test` собирает приложение в режиме _watch_ и запускает настроенный runner. Режим watch включён по умолчанию при использовании интерактивного терминала и не запуске на CI.

## Конфигурация {#configuration}

Angular CLI берёт на себя конфигурацию Vitest, строя полную конфигурацию в памяти на основе опций в `angular.json`.

### Пользовательская конфигурация Vitest {#custom-vitest-configuration}

IMPORTANT: Хотя пользовательская конфигурация включает продвинутые опции, команда Angular не предоставляет прямую поддержку конкретного содержимого файла конфигурации или сторонних плагинов, используемых в нём. CLI также переопределит определённые свойства (`test.projects`, `test.include`) для обеспечения корректной работы.

Можно предоставить пользовательский файл конфигурации Vitest для переопределения настроек по умолчанию. Полный список доступных опций см. в официальной [документации Vitest](https://vitest.dev/config/).

**1. Прямой путь:**
Предоставьте прямой путь к файлу конфигурации Vitest в `angular.json`:

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
Если установить `runnerConfig` в `true`, builder автоматически будет искать общий файл `vitest-base.config.*` в корнях проекта и рабочей области.

## Патч `zone.js` для Vitest {#zonejs-vitest-patch}

Чтобы использовать функции вроде `fakeAsync`, `flush` или `waitForAsync`, или чтобы существующие тесты работали с ними, можно добавить `zone.js/plugins/vitest-patch` в polyfills цели test в `angular.json`.

Тем не менее, мы настоятельно рекомендуем начать планировать преобразование существующих наборов тестов на нативный `async` и fake timers Vitest, поскольку это устоявшийся подход.

См. [пример здесь](/guide/testing/components-scenarios#async-test-with-a-vitest-fake-timers) использования fake timers с Vitest.

## Отчёты об ошибках {#bug-reports}

Сообщайте о проблемах и запросах возможностей на [GitHub](https://github.com/angular/angular-cli/issues).

По возможности предоставляйте минимальное воспроизведение, чтобы помочь команде в решении проблем.
