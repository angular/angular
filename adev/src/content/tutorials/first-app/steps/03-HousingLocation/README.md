# Create the application’s HousingLocation component

В этом уроке показано, как добавить компонент `HousingLocation` в ваше приложение Angular.

<docs-video src="https://www.youtube.com/embed/R0nRX8jD2D0?si=U4ONEbPvtptdUHTt&amp;start=440"/>

## Чему вы научитесь

- В вашем приложении появится новый компонент `HousingLocation`, который отображает сообщение, подтверждающее его
  добавление в приложение.

<docs-workflow>

<docs-step title="Создание `HousingLocation`">
На этом этапе вы создадите новый компонент для вашего приложения.

На панели **Terminal** вашей IDE:

1. В каталоге вашего проекта перейдите в директорию `first-app`.

1. Выполните эту команду, чтобы создать новый `HousingLocation`:

   ```shell
   ng generate component housingLocation
   ```

1. Выполните эту команду для сборки и запуска вашего приложения:

   ```shell
   ng serve
   ```

   ПРИМЕЧАНИЕ: Этот шаг предназначен только для вашей локальной среды!

1. Откройте браузер и перейдите по адресу `http://localhost:4200`, чтобы увидеть приложение.
1. Убедитесь, что приложение собирается без ошибок.

   ПОЛЕЗНО: Оно должно выглядеть так же, как и в предыдущем уроке, потому что, хотя вы и добавили новый компонент, вы
   еще не включили его ни в один из шаблонов приложения.

1. Оставьте `ng serve` запущенным, пока выполняете следующие шаги.
   </docs-step>

<docs-step title="Добавление нового компонента в макет приложения">
На этом этапе вы добавите новый компонент `HousingLocation` в компонент `Home` вашего приложения, чтобы он отображался в макете.

На панели **Edit** вашей IDE:

1. Откройте файл `home.ts` в редакторе.
1. В `home.ts` импортируйте `HousingLocation`, добавив эту строку к импортам на уровне файла.

<docs-code header="Import HousingLocation in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/home/home.ts" visibleLines="[2]"/>

1. Затем обновите свойство `imports` метаданных `@Component`, добавив `HousingLocation` в массив.

<docs-code  header="Add HousingLocation to imports array in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/home/home.ts" visibleLines="[6]"/>

1. Теперь компонент готов к использованию в шаблоне `Home`. Обновите свойство `template` метаданных `@Component`,
   включив ссылку на тег `<app-housing-location>`.

<docs-code language="angular-ts" header="Add housing location to the component template in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/home/home.ts" visibleLines="[7,17]"/>

</docs-step>

<docs-step title="Добавление стилей для компонента">
На этом этапе вы скопируете заранее написанные стили для `HousingLocation` в ваше приложение, чтобы оно отображалось корректно.

1. Откройте `src/app/housing-location/housing-location.css` и вставьте приведенные ниже стили в файл:

   ПРИМЕЧАНИЕ: В браузере (онлайн-редакторе) их можно поместить в массив `styles` файла
   `src/app/housing-location/housing-location.ts`.

   <docs-code header="Add CSS styles to housing location to the component in src/app/housing-location/housing-location.css" path="adev/src/content/tutorials/first-app/steps/04-interfaces/src/app/housing-location/housing-location.css"/>

1. Сохраните код, вернитесь в браузер и убедитесь, что приложение собирается без ошибок. Вы должны увидеть сообщение "
   housing-location works!", отображаемое на экране. Исправьте все ошибки, прежде чем переходить к следующему шагу.

<img alt="browser frame of homes-app displaying logo, filter text input box and search button and the message 'housing-location works!" src="assets/images/tutorials/first-app/homes-app-lesson-03-step-2.png">

</docs-step>

</docs-workflow>

РЕЗЮМЕ: В этом уроке вы создали новый компонент для вашего приложения и добавили его в макет приложения.
