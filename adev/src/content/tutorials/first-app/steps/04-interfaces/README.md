# Создание интерфейса {#creating-an-interface}

В этом уроке показано, как создать интерфейс и включить его в компонент приложения.

<docs-video src="https://www.youtube.com/embed/eM3zi_n7lNs?si=YkFSeUeV8Ixtz8pm"/>

## Чему вы научитесь {#what-youll-learn}

- В вашем приложении появится новый интерфейс, который можно использовать как тип данных.
- В вашем приложении появится экземпляр нового интерфейса с примерными данными.

## Концептуальный обзор интерфейсов {#conceptual-preview-of-interfaces}

[Интерфейсы](https://www.typescriptlang.org/docs/handbook/interfaces.html) — это пользовательские типы данных для вашего приложения.

Angular использует TypeScript, чтобы воспользоваться преимуществами работы в строго типизированной среде программирования.
Строгая проверка типов снижает вероятность того, что один элемент приложения отправит неправильно отформатированные данные другому.
Такие ошибки несоответствия типов перехватываются компилятором TypeScript, а многие из них также могут быть обнаружены в вашей IDE.

В этом уроке вы создадите интерфейс для определения свойств, представляющих данные об отдельном объекте жилья.

<docs-workflow>

<docs-step title="Create a new Angular interface">
На этом шаге создаётся новый интерфейс в вашем приложении.

В панели **Terminal** вашей IDE:

1. В директории проекта перейдите в папку `first-app`.
1. В папке `first-app` выполните эту команду для создания нового интерфейса.

   ```shell

   ng generate interface housinglocation

   ```

1. Выполните `ng serve`, чтобы собрать приложение и запустить его по адресу `http://localhost:4200`.
1. В браузере откройте `http://localhost:4200`, чтобы посмотреть на своё приложение.
1. Убедитесь, что приложение собирается без ошибок.
   Исправьте все ошибки перед переходом к следующему шагу.
   </docs-step>

<docs-step title="Add properties to the new interface">
На этом шаге добавляются свойства в интерфейс, необходимые приложению для представления объекта жилья.

1.  В панели **Terminal** вашей IDE запустите команду `ng serve`, если она ещё не запущена, чтобы собрать приложение и запустить его по адресу `http://localhost:4200`.
1.  В панели **Edit** вашей IDE откройте файл `src/app/housinglocation.ts`.
1.  В `housinglocation.ts` замените содержимое по умолчанию следующим кодом, чтобы ваш новый интерфейс соответствовал этому примеру.

      <docs-code header="Update src/app/housinglocation.ts to match this code" path="adev/src/content/tutorials/first-app/steps/05-inputs/src/app/housinglocation.ts" visibleLines="[1,10]" />

1.  Сохраните изменения и убедитесь, что приложение не отображает ошибок. Исправьте все ошибки перед переходом к следующему шагу.

На данном этапе вы определили интерфейс, представляющий данные об объекте жилья, включая `id`, `name` и информацию о местоположении.
</docs-step>

<docs-step title="Create a test house for your app">
У вас есть интерфейс, но вы ещё не используете его.

На этом шаге вы создадите экземпляр интерфейса и присвоите ему некоторые примерные данные.
Пока эти примерные данные не будут отображаться в вашем приложении.
Прежде чем это произойдёт, нужно завершить ещё несколько уроков.

1.  В панели **Terminal** вашей IDE выполните команду `ng serve`, если она ещё не запущена, чтобы собрать приложение и запустить его по адресу `http://localhost:4200`.
1.  В панели **Edit** вашей IDE откройте `src/app/home/home.ts`.
1.  В `src/app/home/home.ts` добавьте этот импорт после существующих операторов `import`, чтобы `Home` мог использовать новый интерфейс.

      <docs-code language="angular-ts" header="Import Home in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/05-inputs/src/app/home/home.ts" visibleLines="[3]"/>

1.  В `src/app/home/home.ts` замените пустое определение `export class Home {}` этим кодом, чтобы создать один экземпляр нового интерфейса в компоненте.

      <docs-code language="angular-ts" header="Add sample data to src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/05-inputs/src/app/home/home.ts" visibleLines="[22,35]"/>

1.  Убедитесь, что ваш файл `home.ts` соответствует этому примеру.

      <docs-code language="angular-ts" header="src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/05-inputs/src/app/home/home.ts" visibleLines="[[1,7],[9,36]]" />

    Добавив свойство `housingLocation` типа `HousingLocation` в класс `Home`, мы можем убедиться, что данные соответствуют описанию интерфейса. Если данные не удовлетворяют описанию интерфейса, IDE предоставит полезные сообщения об ошибках.

1.  Сохраните изменения и убедитесь, что приложение не содержит ошибок. Откройте браузер и убедитесь, что ваше приложение по-прежнему отображает сообщение «housing-location works!»

      <img alt="окно браузера с приложением homes-app, отображающим логотип, поле ввода фильтра, кнопку поиска и сообщение 'housing-location works!'" src="assets/images/tutorials/first-app/homes-app-lesson-03-step-2.png">

1.  Исправьте все ошибки перед переходом к следующему шагу.
    </docs-step>

</docs-workflow>

РЕЗЮМЕ: В этом уроке вы создали интерфейс, который добавил новый тип данных в ваше приложение.
Этот новый тип данных позволяет указывать, где требуются данные `HousingLocation`.
Также этот тип данных позволяет вашей IDE и компилятору TypeScript убедиться, что данные `HousingLocation` используются там, где это необходимо.

Для получения дополнительной информации по темам, затронутым в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="cli/generate/interface" title="ng generate interface"/>
  <docs-pill href="cli/generate" title="ng generate"/>
</docs-pill-row>
