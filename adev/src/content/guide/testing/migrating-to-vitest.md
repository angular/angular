# Миграция с Karma на Vitest

Angular CLI использует [Vitest](https://vitest.dev/) в качестве инструмента запуска модульных тестов по умолчанию для
новых проектов. В этом руководстве приведены инструкции по миграции существующего проекта с Karma и Jasmine на Vitest.

ВАЖНО: Миграция существующего проекта на Vitest считается экспериментальной. Этот процесс также требует использования
системы сборки `application`, которая является стандартной для всех вновь создаваемых проектов.

## Шаги ручной миграции

Перед использованием схемы автоматического рефакторинга необходимо вручную обновить проект для использования Vitest.

### 1. Установка зависимостей

Установите `vitest` и библиотеку эмуляции DOM. Хотя тестирование в браузере по-прежнему возможно (
см. [шаг 5](#5-configure-browser-mode-optional)), Vitest по умолчанию использует библиотеку эмуляции DOM для симуляции
браузерной среды внутри Node.js для более быстрого выполнения тестов. CLI автоматически обнаруживает и использует
`happy-dom`, если он установлен; в противном случае он переключается на `jsdom`. У вас должен быть установлен один из
этих пакетов.

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

### 2. Обновление `angular.json`

В файле `angular.json` найдите таргет `test` для вашего проекта и измените `builder` на `@angular/build:unit-test`.

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

Билдер `unit-test` по умолчанию использует `"tsConfig": "tsconfig.spec.json"` и `"buildTarget": "::development"`. Вы
можете явно задать эти опции, если вашему проекту требуются другие значения. Например, если конфигурация сборки
`development` отсутствует или вам нужны другие опции для тестирования, вы можете создать и использовать конфигурацию
сборки `testing` (или с похожим именем) для `buildTarget`.

Ранее билдер `@angular/build:karma` позволял настраивать опции сборки (такие как `polyfills`, `assets` или `styles`)
непосредственно внутри таргета `test`. Новый билдер `@angular/build:unit-test` этого не поддерживает. Если ваши опции
сборки для тестов отличаются от существующей конфигурации сборки `development`, вы должны перенести их в отдельную
конфигурацию таргета сборки. Если опции сборки для тестов уже совпадают с конфигурацией `development`, никаких действий
не требуется.

### 3. Обработка пользовательских конфигураций `karma.conf.js`

Пользовательские конфигурации в `karma.conf.js` не мигрируются автоматически. Перед удалением файла `karma.conf.js`
проверьте его на наличие пользовательских настроек, которые необходимо перенести.

Многие опции Karma имеют эквиваленты в Vitest, которые можно задать в пользовательском конфигурационном файле Vitest (
например, `vitest.config.ts`) и связать с `angular.json` через опцию `runnerConfig`.

Распространенные пути миграции включают:

- **Reporters (Репортеры)**: Репортеры Karma должны быть заменены на совместимые с Vitest. Их часто можно настроить
  прямо в `angular.json` в свойстве `test.options.reporters`. Для более сложных конфигураций используйте файл
  `vitest.config.ts`.
- **Plugins (Плагины)**: У плагинов Karma могут быть эквиваленты для Vitest, которые нужно найти и установить. Обратите
  внимание, что покрытие кода (code coverage) является встроенной функцией Angular CLI и может быть включено с помощью
  `ng test --coverage`.
- **Custom Browser Launchers (Пользовательские лаунчеры браузеров)**: Они заменяются опцией `browsers` в `angular.json`
  и установкой провайдера браузера, например `@vitest/browser-playwright`.

Для других настроек обратитесь к официальной [документации Vitest](https://vitest.dev/config/).

### 4. Удаление файлов Karma и `test.ts`

Теперь вы можете удалить `karma.conf.js` и `src/test.ts` из вашего проекта и удалить пакеты, связанные с Karma.
Следующие команды основаны на пакетах, установленных в новом проекте Angular CLI; в вашем проекте могут быть другие
пакеты, связанные с Karma, которые также нужно удалить.

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

Если вам нужно запускать тесты в реальном браузере, необходимо установить провайдер браузера и настроить `angular.json`.

**Установка провайдера браузера:**

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

**Обновление `angular.json` для режима браузера:**

Добавьте опцию `browsers` в настройки таргета `test`. Имя браузера зависит от установленного провайдера (например,
`chromium` для Playwright, `chrome` для WebdriverIO).

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

Режим Headless (без графического интерфейса) включается автоматически, если установлена переменная окружения `CI` или
если имя браузера содержит "Headless" (например, `ChromeHeadless`). В противном случае тесты будут запускаться в
браузере с графическим интерфейсом.

## Автоматический рефакторинг тестов с помощью схем

ВАЖНО: Схема `refactor-jasmine-vitest` является экспериментальной и может не охватывать все возможные паттерны тестов.
Всегда проверяйте изменения, внесенные схемой.

Angular CLI предоставляет схему `refactor-jasmine-vitest` для автоматического рефакторинга ваших тестов Jasmine для
использования Vitest.

### Обзор

Схема автоматизирует следующие преобразования в ваших файлах тестов (`.spec.ts`):

- Преобразует `fit` и `fdescribe` в `it.only` и `describe.only`.
- Преобразует `xit` и `xdescribe` в `it.skip` и `describe.skip`.
- Преобразует вызовы `spyOn` в эквивалентные `vi.spyOn`.
- Заменяет `jasmine.objectContaining` на `expect.objectContaining`.
- Заменяет `jasmine.any` на `expect.any`.
- Заменяет `jasmine.createSpy` на `vi.fn`.
- Обновляет `beforeAll`, `beforeEach`, `afterAll` и `afterEach` до их эквивалентов в Vitest.
- Преобразует `fail()` в `vi.fail()` из Vitest.
- Корректирует ожидания (expectations) для соответствия API Vitest.
- Добавляет комментарии TODO для кода, который не может быть преобразован автоматически.

Схема **не выполняет** следующие действия:

- Не устанавливает `vitest` или другие связанные зависимости.
- Не изменяет `angular.json` для использования билдера Vitest и не мигрирует опции сборки (такие как `polyfills` или
  `styles`) из таргета `test`.
- Не удаляет файлы `karma.conf.js` или `test.ts`.
- Не обрабатывает сложные или вложенные сценарии со шпионами (spies), которые могут потребовать ручного рефакторинга.

### Запуск схемы

После настройки проекта для Vitest вы можете запустить схему для рефакторинга файлов тестов.

Чтобы выполнить рефакторинг **всех** файлов тестов в проекте по умолчанию, выполните:

```bash
ng g @schematics/angular:refactor-jasmine-vitest
```

### Опции

Вы можете использовать следующие опции для настройки поведения схемы:

| Опция                    | Описание                                                                                                      |
| :----------------------- | :------------------------------------------------------------------------------------------------------------ |
| `--project <name>`       | Указывает проект для рефакторинга в многопроектном рабочем пространстве. <br> Пример: `--project=my-lib`      |
| `--include <path>`       | Рефакторинг только определенного файла или директории. <br> Пример: `--include=src/app/app.component.spec.ts` |
| `--file-suffix <suffix>` | Указывает другой суффикс файла для файлов тестов. <br> Пример: `--file-suffix=.test.ts`                       |
| `--add-imports`          | Добавляет явные импорты `vitest`, если вы отключили глобальные переменные в конфигурации Vitest.              |
| `--verbose`              | Показывает подробный лог всех примененных преобразований.                                                     |

### После миграции

После завершения работы схемы рекомендуется:

1. **Запустить тесты**: Выполните `ng test`, чтобы убедиться, что все тесты проходят после рефакторинга.
2. **Проверить изменения**: Просмотрите изменения, внесенные схемой, обращая особое внимание на сложные тесты, особенно
   те, которые содержат запутанные шпионы (spies) или моки (mocks), так как они могут потребовать дополнительной ручной
   корректировки.

Команда `ng test` собирает приложение в _режиме наблюдения_ (watch mode) и запускает настроенный раннер. Режим
наблюдения включен по умолчанию при использовании интерактивного терминала и запуске не в CI.

## Конфигурация

Angular CLI берет на себя конфигурацию Vitest, создавая полную конфигурацию в памяти на основе опций в `angular.json`.

### Пользовательская конфигурация Vitest

ВАЖНО: Хотя использование пользовательской конфигурации позволяет задействовать расширенные опции, команда Angular не
предоставляет прямой поддержки по конкретному содержимому конфигурационного файла или по любым сторонним плагинам,
используемым в нем. CLI также переопределит определенные свойства (`test.projects`, `test.include`) для обеспечения
правильной работы.

Вы можете предоставить пользовательский файл конфигурации Vitest для переопределения настроек по умолчанию. Полный
список доступных опций см. в официальной [документации Vitest](https://vitest.dev/config/).

**1. Прямой путь:**
Укажите прямой путь к файлу конфигурации Vitest в `angular.json`:

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": { "runnerConfig": "vitest.config.ts" }
        }
      }
    }
  }
}
```

**2. Автоматический поиск базовой конфигурации:**
Если вы установите `runnerConfig` в `true`, билдер автоматически будет искать общий файл `vitest-base.config.*` в корнях
вашего проекта и рабочего пространства.

## Сообщения об ошибках

Сообщайте о проблемах и запросах на новые функции на [GitHub](https://github.com/angular/angular-cli/issues).

Пожалуйста, по возможности предоставляйте минимальное воспроизведение проблемы, чтобы помочь команде в ее решении.
