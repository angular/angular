# Создание Компонента HousingLocation приложения {#create-the-applications-housinglocation-component}

В этом уроке показано, как добавить Компонент `HousingLocation` в ваше Angular-приложение.

<docs-video src="https://www.youtube.com/embed/R0nRX8jD2D0?si=U4ONEbPvtptdUHTt&amp;start=440"/>

## Что вы узнаете {#what-youll-learn}

- В вашем приложении появится новый Компонент: `HousingLocation`, который отображает сообщение, подтверждающее его добавление в приложение.

<docs-workflow>

<docs-step title="Создайте `HousingLocation`">
На этом шаге вы создаёте новый Компонент для вашего приложения.

В панели **Терминал** вашей IDE:

1. В директории проекта перейдите в директорию `first-app`.

1. Выполните эту команду для создания нового `HousingLocation`

   ```shell
   ng generate component housingLocation
   ```

1. Выполните эту команду для сборки и запуска приложения.

   ```shell
   ng serve
   ```

   NOTE: Этот шаг только для локальной среды!

1. Откройте браузер и перейдите по адресу `http://localhost:4200`, чтобы найти приложение.
1. Убедитесь, что приложение собирается без ошибок.

   HELPFUL: Приложение должно выглядеть так же, как в предыдущем уроке, потому что несмотря на добавление нового Компонента, вы ещё не включили его ни в один Шаблон приложения.

1. Оставьте `ng serve` запущенным на время выполнения следующих шагов.
   </docs-step>

<docs-step title="Добавьте новый Компонент в макет приложения">
На этом шаге вы добавляете новый Компонент `HousingLocation` в `Home` приложения, чтобы он отображался в макете приложения.

В панели **Edit** вашей IDE:

1.  Откройте `home.ts` в редакторе.
1.  В `home.ts` импортируйте `HousingLocation`, добавив эту строку в импорты на уровне файла.

      <docs-code header="Import HousingLocation in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/home/home.ts" visibleLines="[2]"/>

1.  Затем обновите свойство `imports` метаданных `@Component`, добавив `HousingLocation` в массив.

      <docs-code  header="Add HousingLocation to imports array in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/home/home.ts" visibleLines="[6]"/>

1.  Теперь Компонент готов к использованию в Шаблоне `Home`. Обновите свойство `template` метаданных `@Component`, включив ссылку на тег `<app-housing-location>`.

      <docs-code language="angular-ts" header="Add housing location to the component template in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/home/home.ts" visibleLines="[7,17]"/>

</docs-step>

<docs-step title="Добавьте стили для Компонента">
На этом шаге вы скопируете заранее написанные стили для `HousingLocation` в ваше приложение, чтобы оно отображалось корректно.

1. Откройте `src/app/housing-location/housing-location.css` и вставьте следующие стили в файл:

   NOTE: В браузере они могут находиться в `src/app/housing-location/housing-location.ts` в массиве `styles`.

   <docs-code header="Add CSS styles to housing location to the component in src/app/housing-location/housing-location.css" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/housing-location/housing-location.css"/>

1. Сохраните код, вернитесь в браузер и убедитесь, что приложение собирается без ошибок. На экране должно отображаться сообщение «housing-location works!». Исправьте все ошибки перед переходом к следующему шагу.

   <img alt="browser frame of homes-app displaying logo, filter text input box and search button and the message 'housing-location works!" src="assets/images/tutorials/first-app/homes-app-lesson-03-step-2.png">

</docs-step>

</docs-workflow>

SUMMARY: В этом уроке вы создали новый Компонент для приложения и добавили его в макет приложения.
