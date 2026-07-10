# Сквозное тестирование (End-to-End)

Сквозное тестирование, или E2E, — это форма тестирования, используемая для проверки того, что всё приложение работает как ожидается от начала до конца, то есть _«end-to-end»_. E2E-тестирование отличается от модульного тестирования тем, что полностью отвязано от деталей реализации вашего кода. Обычно оно используется для валидации приложения способом, имитирующим взаимодействие пользователя с ним. Эта страница — руководство по началу работы со сквозным тестированием в Angular с помощью Angular CLI.

## Настройка E2E-тестирования {#set-up-e2e-testing}

Angular CLI загружает и устанавливает всё необходимое для запуска сквозных тестов Angular-приложения.

```shell

ng e2e

```

Команда `ng e2e` сначала проверит проект на наличие цели «e2e». Если она не найдена, CLI предложит выбрать e2e-пакет и проведёт через настройку.

```text

Cannot find "e2e" target for the specified project.
You can add a package that implements these capabilities.

For example:
Cypress: ng add @cypress/schematic
Nightwatch: ng add @nightwatch/schematics
WebdriverIO: ng add @wdio/schematics
Playwright: ng add playwright-ng-schematics
Puppeteer: ng add @puppeteer/ng-schematics

Would you like to add a package with "e2e" capabilities now?
No
❯ Cypress
Nightwatch
WebdriverIO
Playwright
Puppeteer

```

Если нужного test runner нет в списке выше, пакет можно добавить вручную с помощью `ng add`.

## Запуск E2E-тестов {#running-e2e-tests}

После настройки приложения для сквозного тестирования ту же команду можно использовать для выполнения тестов.

```shell

ng e2e

```

Обратите внимание: в запуске тестов с любым из интегрированных e2e-пакетов нет ничего «особого». Команда `ng e2e` по сути просто запускает builder `e2e`. Всегда можно [создать собственный custom builder](tools/cli/cli-builder#creating-a-builder) с именем `e2e` и запускать его через `ng e2e`.

## Дополнительная информация об инструментах сквозного тестирования {#more-information-on-end-to-end-testing-tools}

| Инструмент тестирования | Подробности                                                                                                              |
| :----------- | :------------------------------------------------------------------------------------------------------------------- |
| Cypress      | [Начало работы с Cypress](https://docs.cypress.io/guides/end-to-end-testing/writing-your-first-end-to-end-test) |
| Nightwatch   | [Начало работы с Nightwatch](https://nightwatchjs.org/guide/writing-tests/introduction.html)                    |
| WebdriverIO  | [Начало работы с Webdriver.io](https://webdriver.io/docs/gettingstarted)                                        |
| Playwright   | [Начало работы с Playwright](https://playwright.dev/docs/writing-tests)                                         |
| Puppeteer    | [Начало работы с Puppeteer](https://pptr.dev)                                                                   |
