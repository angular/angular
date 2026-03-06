# Создание интерфейса {#creating-an-interface}

В этом уроке показано, как создать интерфейс и использовать его в Компоненте приложения.

<docs-video src="https://www.youtube.com/embed/eM3zi_n7lNs?si=YkFSeUeV8Ixtz8pm"/>

## Что вы узнаете {#what-youll-learn}

- В вашем приложении появится новый интерфейс, который можно использовать как тип данных.
- В вашем приложении будет экземпляр нового интерфейса с примерами данных.

## Общее представление об интерфейсах {#conceptual-preview-of-interfaces}

[Интерфейсы](https://www.typescriptlang.org/docs/handbook/interfaces.html) — это пользовательские типы данных для вашего приложения.

Angular использует TypeScript, чтобы воспользоваться преимуществами строго типизированной среды программирования.
Строгая проверка типов снижает вероятность того, что один элемент приложения отправит некорректно отформатированные данные другому.
Такие ошибки несоответствия типов перехватываются компилятором TypeScript, а многие из них также могут быть обнаружены в вашей IDE.

В этом уроке вы создадите интерфейс для определения свойств, представляющих данные об отдельном объекте жилья.

<docs-workflow>

<docs-step title="Создайте новый интерфейс Angular">
На этом шаге создаётся новый интерфейс в вашем приложении.

В панели **Терминал** вашей IDE:

1. В директории проекта перейдите в директорию `first-app`.
1. В директории `first-app` выполните эту команду для создания нового интерфейса.

   ```shell

   ng generate interface housinglocation

   ```

1. Выполните `ng serve` для сборки приложения и его запуска по адресу `http://localhost:4200`.
1. В браузере откройте `http://localhost:4200`, чтобы увидеть приложение.
1. Убедитесь, что приложение собирается без ошибок.
   Исправьте все ошибки перед переходом к следующему шагу.
   </docs-step>

<docs-step title="Добавьте свойства в новый интерфейс">
На этом шаге вы добавляете в интерфейс свойства, которые нужны приложению для представления объекта жилья.

1.  В панели **Терминал** вашей IDE запустите команду `ng serve`, если она ещё не запущена, для сборки приложения и его запуска по адресу `http://localhost:4200`.
1.  В панели **Edit** вашей IDE откройте файл `src/app/housinglocation.ts`.
1.  В `housinglocation.ts` замените содержимое по умолчанию следующим кодом, чтобы новый интерфейс соответствовал этому примеру.

      <docs-code header="Update src/app/housinglocation.ts to match this code" path="adev/src/content/tutorials/first-app/steps/05-inputs/src/app/housinglocation.ts" visibleLines="[1,10]" />

1.  Сохраните изменения и убедитесь, что приложение не отображает никаких ошибок. Исправьте все ошибки перед переходом к следующему шагу.

На этом этапе вы определили интерфейс, представляющий данные об объекте жилья, включая `id`, `name` и сведения о местоположении.
</docs-step>

<docs-step title="Создайте тестовый объект жилья для приложения">
У вас есть интерфейс, но вы ещё не используете его.

На этом шаге вы создаёте экземпляр интерфейса и присваиваете ему некоторые примеры данных.
Эти примеры данных пока не будут отображаться в приложении.
Для этого потребуется выполнить ещё несколько уроков.

1.  В панели **Терминал** вашей IDE выполните команду `ng serve`, если она ещё не запущена, для сборки приложения и его запуска по адресу `http://localhost:4200`.
1.  В панели **Edit** вашей IDE откройте `src/app/home/home.ts`.
1.  В `src/app/home/home.ts` добавьте эту инструкцию импорта после существующих инструкций `import`, чтобы `Home` мог использовать новый интерфейс.

      <docs-code language="angular-ts" header="Import Home in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/05-inputs/src/app/home/home.ts" visibleLines="[3]"/>

1.  В `src/app/home/home.ts` замените пустое определение `export class Home {}` следующим кодом, чтобы создать единственный экземпляр нового интерфейса в Компоненте.

      <docs-code language="angular-ts" header="Add sample data to src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/05-inputs/src/app/home/home.ts" visibleLines="[22,35]"/>

1.  Убедитесь, что ваш файл `home.ts` соответствует этому примеру.

      <docs-code language="angular-ts" header="src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/05-inputs/src/app/home/home.ts" visibleLines="[[1,7],[9,36]]" />

    Добавив свойство `housingLocation` типа `HousingLocation` в класс `Home`, мы можем подтвердить, что данные соответствуют описанию интерфейса. Если данные не удовлетворяют описанию интерфейса, IDE располагает достаточно информацией для отображения полезных ошибок.

1.  Сохраните изменения и убедитесь, что приложение не содержит никаких ошибок. Откройте браузер и убедитесь, что приложение по-прежнему отображает сообщение «housing-location works!»

      <img alt="browser frame of homes-app displaying logo, filter text input box and search button and the message 'housing-location works!'" src="assets/images/tutorials/first-app/homes-app-lesson-03-step-2.png">

1.  Исправьте все ошибки перед переходом к следующему шагу.
    </docs-step>

</docs-workflow>

SUMMARY: В этом уроке вы создали интерфейс, который задаёт новый тип данных для приложения.
Этот новый тип данных позволяет указывать, где требуются данные `HousingLocation`.
Он также позволяет IDE и компилятору TypeScript обеспечивать использование данных `HousingLocation` там, где это необходимо.

Для получения дополнительной информации по темам, рассмотренным в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="cli/generate/interface" title="ng generate interface"/>
  <docs-pill href="cli/generate" title="ng generate"/>
</docs-pill-row>
