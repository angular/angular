# Тестирование с Karma и Jasmine {#testing-with-karma-and-jasmine}

Хотя [Vitest](https://vitest.dev) является тест-раннером по умолчанию для новых Angular-проектов, [Karma](https://karma-runner.github.io) по-прежнему поддерживается и широко используется. Это руководство содержит инструкции по тестированию Angular-приложения с помощью тест-раннера Karma и фреймворка [Jasmine](https://jasmine.github.io).

## Настройка Karma и Jasmine {#setting-up-karma-and-jasmine}

Karma и Jasmine можно настроить как для нового проекта, так и добавить к существующему.

### Для новых проектов {#for-new-projects}

Чтобы создать новый проект с предварительно настроенными Karma и Jasmine, запустите команду `ng new` с параметром `--test-runner=karma`:

```shell
ng new my-karma-app --test-runner=karma
```

### Для существующих проектов {#for-existing-projects}

Чтобы добавить Karma и Jasmine в существующий проект, выполните следующие шаги:

1.  **Установите необходимые пакеты:**

    <docs-code-multifile>
      <docs-code header="npm" language="shell">
        npm install --save-dev karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core @types/jasmine
      </docs-code>
      <docs-code header="yarn" language="shell">
        yarn add --dev karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core @types/jasmine
      </docs-code>
      <docs-code header="pnpm" language="shell">
        pnpm add -D karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core @types/jasmine
      </docs-code>
      <docs-code header="bun" language="shell">
        bun add --dev karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core @types/jasmine
      </docs-code>
    </docs-code-multifile>

2.  **Настройте тест-раннер в `angular.json`:**

    В файле `angular.json` найдите цель `test` и установите для параметра `runner` значение `karma`:

    ```json
    {
      // ...
      "projects": {
        "your-project-name": {
          // ...
          "architect": {
            "test": {
              "builder": "@angular/build:unit-test",
              "options": {
                "runner": "karma"
                // ... other options
              }
            }
          }
        }
      }
    }
    ```

3.  **Обновите `tsconfig.spec.json` для типов Jasmine:**

    Чтобы TypeScript распознавал глобальные тестовые функции, такие как `describe` и `it`, добавьте `"jasmine"` в массив `types` в файле `tsconfig.spec.json`:

    ```json
    {
      // ...
      "compilerOptions": {
        // ...
        "types": ["jasmine"]
      }
      // ...
    }
    ```

## Запуск тестов {#running-tests}

После настройки проекта запустите тесты командой [`ng test`](cli/test):

```shell
ng test
```

Команда `ng test` собирает приложение в _режиме наблюдения_ и запускает [тест-раннер Karma](https://karma-runner.github.io).

Вывод в консоли выглядит следующим образом:

```shell

02 11 2022 09:08:28.605:INFO [karma-server]: Karma v6.4.1 server started at http://localhost:9876/
02 11 2022 09:08:28.607:INFO [launcher]: Launching browsers Chrome with concurrency unlimited
02 11 2022 09:08:28.620:INFO [launcher]: Starting browser Chrome
02 11 2022 09:08:31.312:INFO [Chrome]: Connected on socket -LaEYvD2R7MdcS0-AAAB with id 31534482
Chrome: Executed 3 of 3 SUCCESS (0.193 secs / 0.172 secs)
TOTAL: 3 SUCCESS

```

Результаты тестов отображаются в браузере с помощью [Karma Jasmine HTML Reporter](https://github.com/dfederm/karma-jasmine-html-reporter).

<img alt="Jasmine HTML Reporter in the browser" src="assets/images/guide/testing/initial-jasmine-html-reporter.png">

Нажмите на строку теста, чтобы перезапустить только его, или на описание, чтобы перезапустить тесты в выбранной группе («тестовом наборе»).

При этом команда `ng test` отслеживает изменения. Чтобы увидеть это в действии, внесите небольшое изменение в исходный файл и сохраните его. Тесты запустятся снова, браузер обновится, и появятся новые результаты.

## Конфигурация {#configuration}

Angular CLI берёт на себя настройку Jasmine и Karma. Полная конфигурация строится в памяти на основе параметров, указанных в файле `angular.json`.

### Настройка конфигурации Karma {#customizing-karma-configuration}

Если вам нужно настроить Karma, создайте файл `karma.conf.js` с помощью следующей команды:

```shell
ng generate config karma
```

HELPFUL: Подробнее о конфигурации Karma читайте в [руководстве по конфигурации Karma](http://karma-runner.github.io/6.4/config/configuration-file.html).

### Установка тест-раннера в `angular.json` {#setting-the-test-runner-in-angularjson}

Чтобы явно задать Karma в качестве тест-раннера для проекта, найдите цель `test` в файле `angular.json` и установите для параметра `runner` значение `karma`:

```json
{
  // ...
  "projects": {
    "your-project-name": {
      // ...
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "runner": "karma"
            // ... other options
          }
        }
      }
    }
  }
}
```

## Контроль покрытия кода {#code-coverage-enforcement}

Чтобы задать минимальный уровень покрытия кода, используйте свойство `check` в разделе `coverageReporter` файла `karma.conf.js`.

Например, чтобы требовать минимального покрытия 80%:

```javascript
coverageReporter: {
  dir: require('path').join(__dirname, './coverage/<project-name>'),
  subdir: '.',
  reporters: [
    { type: 'html' },
    { type: 'text-summary' }
  ],
  check: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
}
```

Если указанные пороговые значения покрытия не будут достигнуты, тестовый запуск завершится с ошибкой.

## Тестирование в непрерывной интеграции {#testing-in-continuous-integration}

Для запуска тестов Karma в среде CI используйте следующую команду:

```shell
ng test --no-watch --no-progress --browsers=ChromeHeadless
```

NOTE: Флаги `--no-watch` и `--no-progress` необходимы для Karma в среде CI, чтобы тесты запускались один раз и корректно завершались. Флаг `--browsers=ChromeHeadless` также обязателен для запуска тестов в браузерной среде без графического интерфейса.

## Отладка тестов {#debugging-tests}

Если тесты работают не так, как ожидается, их можно проверить и отладить в браузере.

Для отладки приложения с тест-раннером Karma:

1.  Откройте окно браузера Karma. Смотрите раздел [Настройка тестирования](guide/testing#set-up-for-testing), если нужна помощь с этим шагом.
2.  Нажмите кнопку **DEBUG**, чтобы открыть новую вкладку браузера и повторно запустить тесты.
3.  Откройте **Инструменты разработчика** браузера. В Windows нажмите `Ctrl-Shift-I`. На macOS нажмите `Command-Option-I`.
4.  Перейдите в раздел **Sources**.
5.  Нажмите `Control/Command-P` и начните вводить имя тестового файла, чтобы открыть его.
6.  Установите точку останова в тесте.
7.  Обновите браузер и обратите внимание, как выполнение останавливается на точке останова.

<img alt="Karma debugging" src="assets/images/guide/testing/karma-1st-spec-debug.png">
