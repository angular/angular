# Создайте своё первое Angular-приложение

Этот туториал состоит из уроков, которые знакомят с концепциями Angular, необходимыми для начала разработки.

Можно пройти столько уроков, сколько захотите, и в любом порядке.

HELPFUL: Предпочитаете видео? У нас также есть полный [курс на YouTube](https://youtube.com/playlist?list=PL1w1q3fL4pmj9k1FrJ3Pe91EPub2_h4jF&si=1q9889ulHp8VZ0e7) по этому туториалу!

<docs-video src="https://www.youtube.com/embed/xAT0lHYhHMY?si=cKUW_MGn3MesFT7o"/>

## Перед началом {#before-you-start}

Для лучшего опыта с этим туториалом проверьте требования ниже и убедитесь, что у вас есть всё необходимое.

### Ваш опыт {#your-experience}

Уроки предполагают опыт в следующем:

1. Создание HTML-страниц с прямым редактированием HTML.
1. Программирование содержимого сайта на JavaScript.
1. Чтение CSS и понимание, как работают селекторы.
1. Использование командной строки для задач на компьютере.

### Ваше оборудование {#your-equipment}

Уроки можно пройти с локальной установкой инструментов Angular или во встроенном редакторе. Локальная разработка Angular возможна на Windows, macOS или Linux.

NOTE: Обращайте внимание на такие предупреждения — они отмечают шаги, которые относятся только к локальному редактору.

## Концептуальный обзор вашего первого Angular-приложения {#conceptual-preview-of-your-first-angular-app}

Уроки создают Angular-приложение, которое показывает список домов в аренду и детали отдельных домов.
Приложение использует возможности, общие для многих Angular-приложений.

<img alt="Output of homes landing page" src="assets/images/tutorials/first-app/homes-app-landing-page.png">

## Локальная среда разработки {#local-development-environment}

NOTE: Этот шаг только для локальной среды!

Выполните эти шаги в командной строке на компьютере, который будете использовать для туториала.

<docs-workflow>

<docs-step title="Identify the version of `node.js` that Angular requires">
Angular требует активную LTS или maintenance LTS версию Node. Давайте подтвердим вашу версию `node.js`. О конкретных требованиях к версиям см. свойство engines в [файле package.json](https://unpkg.com/browse/@angular/core@15.1.5/package.json).

Из окна **Terminal**:

1. Выполните команду: `node --version`
1. Убедитесь, что отображаемая версия соответствует требованиям.
   </docs-step>

<docs-step title="Install the correct version of `node.js` for Angular">
Если `node.js` не установлен, следуйте [инструкциям по установке на nodejs.org](https://nodejs.org/en/download/)
</docs-step>

<docs-step title="Install the latest version of Angular">
После установки `node.js` и `npm` следующий шаг — установить [Angular CLI](tools/cli), который даёт инструменты для эффективной разработки на Angular.

Из окна **Terminal** выполните: `npm install -g @angular/cli`.
</docs-step>

<docs-step title="Install integrated development environment (IDE)">
Вы можете использовать любой инструмент для создания приложений на Angular. Мы рекомендуем:

1. [Visual Studio Code](https://code.visualstudio.com/)
2. Как необязательный, но рекомендуемый шаг можно улучшить опыт разработки, установив [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)
3. [WebStorm](https://www.jetbrains.com/webstorm/)
   </docs-step>

<docs-step title="Optional: set-up your AI powered IDE">

Если вы проходите туториал в IDE с поддержкой ИИ, [ознакомьтесь с правилами промптов и лучшими практиками Angular](/ai/develop-with-ai).

</docs-step>

</docs-workflow>

Подробнее о темах этого урока:

<docs-pill-row>
  <docs-pill href="/overview" title="Что такое Angular"/>
  <docs-pill href="/tools/cli/setup-local" title="Настройка локальной среды и workspace"/>
  <docs-pill href="/cli" title="Справка по Angular CLI"/>
</docs-pill-row>
