# Тестирование с помощью Karma и Jasmine

Хотя [Vitest](https://vitest.dev) является тест-раннером по умолчанию для новых проектов
Angular, [Karma](https://karma-runner.github.io) по-прежнему поддерживается и широко используется. В этом руководстве
приведены инструкции по тестированию вашего приложения Angular с использованием тест-раннера Karma и фреймворка
тестирования [Jasmine](https://jasmine.github.io).

## Настройка Karma и Jasmine

Вы можете настроить Karma и Jasmine для нового проекта или добавить их в существующий.

### Для новых проектов

Чтобы создать новый проект с предварительно настроенными Karma и Jasmine, выполните команду `ng new` с опцией
`--test-runner=karma`:

```shell
ng new my-karma-app --test-runner=karma
```

### Для существующих проектов

Чтобы добавить Karma и Jasmine в существующий проект, выполните следующие шаги:

1. **Установите необходимые пакеты:**

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

2. **Настройте тест-раннер в `angular.json`:**

   В файле `angular.json` найдите цель `test` и установите для опции `runner` значение `karma`:

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
               "runner": "karma",
               // ... other options
             }
           }
         }
       }
     }
   }
   ```

3. **Обновите `tsconfig.spec.json` для типов Jasmine:**

   Чтобы TypeScript распознавал глобальные функции тестирования, такие как `describe` и `it`, добавьте `"jasmine"` в
   массив `types` в вашем файле `tsconfig.spec.json`:

   ```json
   {
     // ...
     "compilerOptions": {
       // ...
       "types": [
         "jasmine"
       ]
     },
     // ...
   }
   ```

## Запуск тестов

После настройки проекта запустите тесты с помощью команды [`ng test`](cli/test):

```shell
ng test
```

Команда `ng test` собирает приложение в _режиме отслеживания_ (watch mode) и
запускает [тест-раннер Karma](https://karma-runner.github.io).

Вывод консоли выглядит следующим образом:

```shell

02 11 2022 09:08:28.605:INFO [karma-server]: Karma v6.4.1 server started at http://localhost:9876/
02 11 2022 09:08:28.607:INFO [launcher]: Launching browsers Chrome with concurrency unlimited
02 11 2022 09:08:28.620:INFO [launcher]: Starting browser Chrome
02 11 2022 09:08:31.312:INFO [Chrome]: Connected on socket -LaEYvD2R7MdcS0-AAAB with id 31534482
Chrome: Executed 3 of 3 SUCCESS (0.193 secs / 0.172 secs)
TOTAL: 3 SUCCESS

```

Результаты тестов отображаются в браузере с
использованием [Karma Jasmine HTML Reporter](https://github.com/dfederm/karma-jasmine-html-reporter).

<img alt="Jasmine HTML Reporter in the browser" src="assets/images/guide/testing/initial-jasmine-html-reporter.png">

Нажмите на строку теста, чтобы перезапустить только этот тест, или нажмите на описание, чтобы перезапустить тесты в
выбранной группе ("наборе тестов").

Тем временем команда `ng test` отслеживает изменения. Чтобы увидеть это в действии, внесите небольшое изменение в
исходный файл и сохраните его. Тесты запустятся снова, браузер обновится, и появятся новые результаты тестов.

## Конфигурация

Angular CLI берет на себя настройку Jasmine и Karma. Он создает полную конфигурацию в памяти на основе опций, указанных
в файле `angular.json`.

### Настройка конфигурации Karma

Если вы хотите настроить Karma, вы можете создать файл `karma.conf.js`, выполнив следующую команду:

```shell
ng generate config karma
```

ПОЛЕЗНО: Подробнее о конфигурации Karma читайте
в [руководстве по конфигурации Karma](http://karma-runner.github.io/6.4/config/configuration-file.html).

### Установка тест-раннера в `angular.json`

Чтобы явно установить Karma в качестве тест-раннера для вашего проекта, найдите цель `test` в файле `angular.json` и
установите для опции `runner` значение `karma`:

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
            "runner": "karma",
            // ... other options
          }
        }
      }
    }
  }
}
```

## Контроль покрытия кода

Чтобы обеспечить минимальный уровень покрытия кода, вы можете использовать свойство `check` в секции `coverageReporter`
вашего файла `karma.conf.js`.

Например, чтобы требовать минимум 80% покрытия:

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

Это приведет к сбою выполнения тестов, если указанные пороги покрытия не будут достигнуты.

## Тестирование в непрерывной интеграции (CI)

Чтобы запустить тесты Karma в среде CI, используйте следующую команду:

```shell
ng test --no-watch --no-progress --browsers=ChromeHeadless
```

ПРИМЕЧАНИЕ: Флаги `--no-watch` и `--no-progress` имеют решающее значение для Karma в средах CI, чтобы гарантировать, что
тесты запускаются один раз и корректно завершаются. Флаг `--browsers=ChromeHeadless` также необходим для запуска тестов
в среде браузера без графического интерфейса.

## Отладка тестов

Если ваши тесты работают не так, как ожидается, вы можете проверить и отладить их в браузере.

Чтобы отладить приложение с помощью тест-раннера Karma:

1. Откройте окно браузера Karma. См. [Настройка для тестирования](guide/testing/overview#set-up-for-testing), если вам
   нужна помощь с этим шагом.
2. Нажмите кнопку **DEBUG**, чтобы открыть новую вкладку браузера и перезапустить тесты.
3. Откройте **Инструменты разработчика** (Developer Tools) браузера. В Windows нажмите `Ctrl-Shift-I`. В macOS нажмите
   `Command-Option-I`.
4. Выберите раздел **Sources**.
5. Нажмите `Control/Command-P`, а затем начните вводить имя файла теста, чтобы открыть его.
6. Установите точку останова (breakpoint) в тесте.
7. Обновите страницу браузера и обратите внимание, как выполнение останавливается на точке останова.

<img alt="Karma debugging" src="assets/images/guide/testing/karma-1st-spec-debug.png">
