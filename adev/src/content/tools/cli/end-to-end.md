# E2E-тестирование

End-to-end (или E2E) тестирование — это вид тестирования, используемый для проверки того, что все приложение работает
так, как ожидается, от начала до конца (сквозное тестирование). E2E-тестирование отличается от модульного (unit)
тестирования тем, что оно полностью отвязано от деталей реализации вашего кода. Обычно оно используется для валидации
приложения способом, имитирующим взаимодействие пользователя с ним. Эта страница служит руководством по началу работы с
E2E-тестированием в Angular с использованием Angular CLI.

## Настройка E2E-тестирования

Angular CLI загружает и устанавливает все необходимое для запуска E2E-тестов для вашего Angular-приложения.

```shell

ng e2e

```

Команда `ng e2e` сначала проверит наличие цели "e2e" в вашем проекте. Если она не будет найдена, CLI предложит выбрать
пакет для E2E-тестирования, который вы хотите использовать, и поможет выполнить настройку.

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

Если вы не нашли в приведенном выше списке нужный вам инструмент для запуска тестов, вы можете добавить пакет вручную,
используя `ng add`.

## Запуск E2E-тестов

Теперь, когда ваше приложение настроено для сквозного тестирования, можно запустить ту же команду для выполнения тестов.

```shell

ng e2e

```

Обратите внимание, что в запуске тестов с помощью любого из интегрированных E2E-пакетов нет ничего "особенного". Команда
`ng e2e` на самом деле просто запускает билдер `e2e` "под капотом". Вы всегда
можете [создать свой собственный билдер](tools/cli/cli-builder#creating-a-builder) с именем `e2e` и запускать его с
помощью `ng e2e`.

## Дополнительная информация об инструментах для E2E-тестирования

| Инструмент тестирования | Подробности                                                                                                     |
| :---------------------- | :-------------------------------------------------------------------------------------------------------------- |
| Cypress                 | [Начало работы с Cypress](https://docs.cypress.io/guides/end-to-end-testing/writing-your-first-end-to-end-test) |
| Nightwatch              | [Начало работы с Nightwatch](https://nightwatchjs.org/guide/writing-tests/introduction.html)                    |
| WebdriverIO             | [Начало работы с Webdriver.io](https://webdriver.io/docs/gettingstarted)                                        |
| Playwright              | [Начало работы с Playwright](https://playwright.dev/docs/writing-tests)                                         |
| Puppeteer               | [Начало работы с Puppeteer](https://pptr.dev)                                                                   |
