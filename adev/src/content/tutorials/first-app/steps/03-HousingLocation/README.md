# Создание компонента HousingLocation приложения

В этом уроке показано, как добавить компонент `HousingLocation` в ваше приложение Angular.

<docs-video src="https://www.youtube.com/embed/R0nRX8jD2D0?si=U4ONEbPvtptdUHTt&amp;start=440"/>

## Чему вы научитесь {#what-youll-learn}

- В вашем приложении появится новый компонент: `HousingLocation`, который отображает сообщение, подтверждающее, что компонент был добавлен в приложение.

<docs-workflow>

<docs-step title="Create the `HousingLocation`">
На этом шаге вы создадите новый компонент для вашего приложения.

В панели **Terminal** вашей IDE:

1. В директории проекта перейдите в папку `first-app`.

1. Выполните эту команду для создания нового компонента `HousingLocation`

   ```shell
   ng generate component housingLocation
   ```

1. Выполните эту команду для сборки и запуска приложения.

   ```shell
   ng serve
   ```

   ПРИМЕЧАНИЕ: Этот шаг предназначен только для локальной среды!

1. Откройте браузер и перейдите на `http://localhost:4200`, чтобы найти приложение.
1. Убедитесь, что приложение собирается без ошибок.

   ПОЛЕЗНО: Оно должно выглядеть так же, как в предыдущем уроке, поскольку, несмотря на добавление нового компонента, вы ещё не включили его ни в один из шаблонов приложения.

1. Оставьте `ng serve` работающим пока выполняете следующие шаги.
   </docs-step>

<docs-step title="Add the new component to your app's layout">
На этом шаге вы добавите новый компонент `HousingLocation` в компонент `Home` приложения, чтобы он отображался в макете.

В панели **Edit** вашей IDE:

1.  Откройте `home.ts` в редакторе.
1.  В `home.ts` импортируйте `HousingLocation`, добавив эту строку к импортам на уровне файла.

      <docs-code header="Import HousingLocation in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/home/home.ts" visibleLines="[2]"/>

1.  Далее обновите свойство `imports` метаданных `@Component`, добавив `HousingLocation` в массив.

      <docs-code  header="Add HousingLocation to imports array in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/home/home.ts" visibleLines="[6]"/>

1.  Теперь компонент готов к использованию в шаблоне `Home`. Обновите свойство `template` метаданных `@Component`, включив ссылку на тег `<app-housing-location>`.

      <docs-code language="angular-ts" header="Add housing location to the component template in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/home/home.ts" visibleLines="[7,17]"/>

</docs-step>

<docs-step title="Add the styles for the component">
На этом шаге вы скопируете заранее подготовленные стили для `HousingLocation` в ваше приложение, чтобы оно отображалось корректно.

1. Откройте `src/app/housing-location/housing-location.css` и вставьте в файл следующие стили:

   ПРИМЕЧАНИЕ: В браузере их можно разместить в `src/app/housing-location/housing-location.ts` в массиве `styles`.

   <docs-code header="Add CSS styles to housing location to the component in src/app/housing-location/housing-location.css" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/housing-location/housing-location.css"/>

1. Сохраните код, вернитесь в браузер и убедитесь, что приложение собирается без ошибок. На экране должно отобразиться сообщение «housing-location works!». Исправьте все ошибки перед переходом к следующему шагу.

   <img alt="окно браузера с приложением homes-app, отображающим логотип, поле ввода фильтра, кнопку поиска и сообщение 'housing-location works!'" src="assets/images/tutorials/first-app/homes-app-lesson-03-step-2.png">

</docs-step>

</docs-workflow>

РЕЗЮМЕ: В этом уроке вы создали новый компонент для вашего приложения и добавили его в макет приложения.
