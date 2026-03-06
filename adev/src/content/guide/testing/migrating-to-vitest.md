# Миграция с Karma на Vitest {#migrating-from-karma-to-vitest}

Angular CLI использует [Vitest](https://vitest.dev/) в качестве тест-раннера по умолчанию для новых проектов. Это руководство содержит инструкции по миграции существующего проекта с Karma и Jasmine на Vitest.

IMPORTANT: Миграция существующего проекта на Vitest считается экспериментальной. Этот процесс также требует использования системы сборки `application`, которая является стандартной для всех вновь создаваемых проектов.

## Шаги ручной миграции {#manual-migration-steps}

Перед использованием автоматизированной схемы рефакторинга необходимо вручную обновить проект для использования тест-раннера Vitest.

### 1. Установка зависимостей {#1-install-dependencies}

Установите `vitest` и библиотеку эмуляции DOM. Хотя браузерное тестирование по-прежнему возможно (смотрите [шаг 5](#5-configure-browser-mode-optional)), Vitest по умолчанию использует библиотеку эмуляции DOM для имитации браузерной среды в Node.js, что ускоряет выполнение тестов. CLI автоматически обнаруживает и использует `happy-dom`, если он установлен; в противном случае используется `jsdom`. Необходимо установить один из этих пакетов.

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

В файле `angular.json` найдите цель `test` для вашего проекта и измените `builder` на `@angular/build:unit-test`.

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

Компоновщик `unit-test` по умолчанию использует `"tsConfig": "tsconfig.spec.json"` и `"buildTarget": "::development"`. Эти параметры можно явно задать, если проект требует других значений. Например, если конфигурация сборки `development` отсутствует или нужны другие параметры тестирования, можно создать и использовать конфигурацию `testing` или аналогичную для `buildTarget`.

Компоновщик `@angular/build:karma` ранее позволял настраивать параметры сборки (такие как `polyfills`, `assets` или `styles`) непосредственно в цели `test`. Новый компоновщик `@angular/build:unit-test` этого не поддерживает. Если параметры тестовой сборки отличаются от существующей конфигурации `development`, перенесите их в отдельную конфигурацию цели сборки. Если параметры тестовой сборки уже совпадают с конфигурацией `development`, никаких действий не требуется.

### 3. Обработка пользовательских конфигураций `karma.conf.js` {#3-handle-custom-karmaconfjs-configurations}

Пользовательские конфигурации в `karma.conf.js` не мигрируют автоматически. Перед удалением файла `karma.conf.js` просмотрите его на предмет пользовательских настроек, которые нужно перенести.

Многие параметры Karma имеют эквиваленты в Vitest, которые можно задать в пользовательском файле конфигурации Vitest (например, `vitest.config.ts`) и связать с `angular.json` через параметр `runnerConfig`.

Типичные пути миграции:

- **Репортёры**: репортёры Karma необходимо заменить совместимыми с Vitest. Их часто можно настроить прямо в `angular.json` в свойстве `test.options.reporters`. Для более сложных конфигураций используйте пользовательский файл `vitest.config.ts`.
- **Плагины**: плагины Karma могут иметь эквиваленты в Vitest, которые нужно найти и установить. Обратите внимание, что покрытие кода является первоклассной функцией Angular CLI и может быть включено с помощью `ng test --coverage`.
- **Пользовательские запускатели браузера**: заменяются параметром `browsers` в `angular.json` и установкой провайдера браузера, например `@vitest/browser-playwright`.

Для других настроек обратитесь к официальной [документации Vitest](https://vitest.dev/config/).

### 4. Удаление Karma и файлов `test.ts` {#4-remove-karma-and-testts-files}

Теперь можно удалить `karma.conf.js` и `src/test.ts` из проекта и удалить связанные с Karma пакеты. Следующие команды основаны на пакетах, установленных в новом Angular CLI-проекте; в вашем проекте могут быть и другие связанные с Karma пакеты.

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm uninstall karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn remove karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm remove karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter
  </docs-code>
  <docs-code header="bun" language="shell">
    bun remove karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter
  </docs-code>
</docs-code-multifile>

### 5. Настройка режима браузера (необязательно) {#5-configure-browser-mode-optional}

Если нужно запускать тесты в реальном браузере, установите провайдер браузера и настройте `angular.json`.

**Установите провайдер браузера:**

Выберите один из следующих провайдеров в зависимости от ваших потребностей:

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

**Обновите `angular.json` для режима браузера:**

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

Безголовый режим включается автоматически, если задана переменная окружения `CI` или если имя браузера содержит «Headless» (например, `ChromeHeadless`). В противном случае тесты запускаются в браузере с интерфейсом.

NOTE: Отладка с `ng test --debug` не поддерживается в режиме браузера.

## Автоматизированный рефакторинг тестов с помощью схем {#automated-test-refactoring-with-schematics}

IMPORTANT: Схема `refactor-jasmine-vitest` является экспериментальной и может не охватывать все возможные паттерны тестов. Всегда проверяйте изменения, внесённые схемой.

Angular CLI предоставляет схему `refactor-jasmine-vitest` для автоматического рефакторинга тестов Jasmine для использования Vitest.

### Обзор {#overview}

Схема автоматизирует следующие преобразования в тестовых файлах (`.spec.ts`):

- Преобразует `fit` и `fdescribe` в `it.only` и `describe.only`.
- Преобразует `xit` и `xdescribe` в `it.skip` и `describe.skip`.
- Преобразует вызовы `spyOn` в эквивалентный `vi.spyOn`.
- Заменяет `jasmine.objectContaining` на `expect.objectContaining`.
- Заменяет `jasmine.any` на `expect.any`.
- Заменяет `jasmine.createSpy` на `vi.fn`.
- Обновляет `beforeAll`, `beforeEach`, `afterAll` и `afterEach` до их эквивалентов в Vitest.
- Преобразует `fail()` в `vi.fail()` Vitest.
- Корректирует утверждения в соответствии с API Vitest.
- Добавляет комментарии TODO для кода, который нельзя преобразовать автоматически.

Схема **не** выполняет следующие действия:

- Не устанавливает `vitest` или другие связанные зависимости.
- Не изменяет `angular.json` для использования компоновщика Vitest и не переносит параметры сборки (такие как `polyfills` или `styles`) из цели `test`.
- Не удаляет файлы `karma.conf.js` или `test.ts`.
- Не обрабатывает сложные или вложенные сценарии с шпионами, которые могут потребовать ручного рефакторинга.

### Запуск схемы {#running-the-schematic}

После настройки проекта для Vitest запустите схему для рефакторинга тестовых файлов.

Для рефакторинга **всех** тестовых файлов в проекте по умолчанию выполните:

```bash
ng g @schematics/angular:refactor-jasmine-vitest
```

### Параметры {#options}

Для настройки поведения схемы можно использовать следующие параметры:

| Параметр                 | Описание                                                                                                               |
| :----------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| `--project <name>`       | Укажите проект для рефакторинга в многопроектном рабочем пространстве. <br> Пример: `--project=my-lib`                |
| `--include <path>`       | Рефакторинг только конкретного файла или директории. <br> Пример: `--include=src/app/app.component.spec.ts`           |
| `--file-suffix <suffix>` | Укажите другой суффикс для тестовых файлов. <br> Пример: `--file-suffix=.test.ts`                                     |
| `--add-imports`          | Добавляет явные импорты `vitest`, если в конфигурации Vitest отключены глобальные переменные.                          |
| `--verbose`              | Показывает подробное логирование всех применяемых преобразований.                                                      |
| `--browser-mode`         | Используйте, если планируете запускать тесты в режиме браузера.                                                        |

### После миграции {#after-migrating}

После завершения работы схемы рекомендуется:

1.  **Запустить тесты**: выполните `ng test`, чтобы убедиться, что все тесты по-прежнему проходят после рефакторинга.
2.  **Проверить изменения**: просмотрите изменения, внесённые схемой, уделив особое внимание сложным тестам, особенно тем, которые содержат сложные шпионы или мокки, — они могут потребовать дополнительной ручной доработки.

Команда `ng test` собирает приложение в _режиме наблюдения_ и запускает настроенный раннер. Режим наблюдения включён по умолчанию при использовании интерактивного терминала и отключении в среде CI.

## Конфигурация {#configuration}

Angular CLI берёт на себя конфигурацию Vitest, формируя полную конфигурацию в памяти на основе параметров из `angular.json`.

### Пользовательская конфигурация Vitest {#custom-vitest-configuration}

IMPORTANT: Хотя использование пользовательской конфигурации открывает расширенные возможности, команда Angular не оказывает прямой поддержки содержимого конфигурационного файла или сторонних плагинов. CLI также переопределяет определённые свойства (`test.projects`, `test.include`) для обеспечения правильной работы.

Можно предоставить пользовательский конфигурационный файл Vitest для переопределения настроек по умолчанию. Полный список доступных параметров смотрите в официальной [документации Vitest](https://vitest.dev/config/).

**1. Прямой путь:**
Укажите прямой путь к конфигурационному файлу Vitest в `angular.json`:

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
Если установить `runnerConfig` в `true`, компоновщик автоматически найдёт общий файл `vitest-base.config.*` в корнях проекта и рабочего пространства.

## Вспомогательные утилиты zone.js не поддерживаются {#zonejs-based-helpers-are-not-supported}

Патчи zone.js не применяются при запуске тестов с Vitest, поэтому нельзя использовать такие функции, как `fakeAsync`, `flush` или `waitForAsync`.
Для миграции на Vitest также потребуется перевести тесты на нативный async и поддельные таймеры Vitest. Смотрите [пример здесь](/guide/testing/components-scenarios#async-test-with-a-vitest-fake-timers) для использования поддельных таймеров с Vitest.

## Сообщения об ошибках {#bug-reports}

Сообщайте об ошибках и запросах функций на [GitHub](https://github.com/angular/angular-cli/issues).

По возможности предоставляйте минимальный воспроизводящий пример, чтобы помочь команде в решении проблем.
