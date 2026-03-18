# Сервисы Angular {#angular-services}

В этом уроке показано, как создать сервис Angular и использовать внедрение зависимостей для его подключения к приложению.

<docs-video src="https://www.youtube.com/embed/-jRxG84AzCI?si=rieGfJawp9xJ00Sz"/>

## Чему вы научитесь {#what-youll-learn}

В вашем приложении появится сервис для предоставления данных.
По окончании этого урока сервис будет читать данные из локальных статических данных.
В следующем уроке вы обновите сервис для получения данных из веб-сервиса.

## Концептуальный обзор сервисов {#conceptual-preview-of-services}

В этом уроке вводятся сервисы Angular и внедрение зависимостей.

### Сервисы Angular {#angular-services-concept}

_Сервисы Angular_ предоставляют способ разделения данных и функций приложения Angular, которые могут использоваться несколькими компонентами.
Чтобы несколько компонентов могли использовать сервис, он должен быть _инжектируемым_.
Сервисы, которые инжектируются и используются компонентом, становятся зависимостями этого компонента.
Компонент зависит от этих сервисов и не может функционировать без них.

### Внедрение зависимостей {#dependency-injection}

_Внедрение зависимостей_ — это механизм, который управляет зависимостями компонентов приложения и сервисами, которые могут использовать другие компоненты.

<docs-workflow>

<docs-step title="Создайте новый сервис для вашего приложения">
На этом шаге создаётся инжектируемый сервис для вашего приложения.

В панели **Terminal** вашей IDE:

1. В директории проекта перейдите в папку `first-app`.
1. В папке `first-app` выполните эту команду для создания нового сервиса.

   ```shell
   ng generate service housing --skip-tests
   ```

1. Выполните `ng serve`, чтобы собрать приложение и запустить его по адресу `http://localhost:4200`.
1. Убедитесь, что приложение собирается без ошибок.
   Исправьте все ошибки перед переходом к следующему шагу.
   </docs-step>

<docs-step title="Добавьте статические данные в новый сервис">
На этом шаге вы добавите примерные данные в новый сервис.
В следующем уроке вы замените статические данные веб-интерфейсом для получения данных, как в реальном приложении.
Пока что новый сервис приложения использует данные, которые до сих пор создавались локально в `Home`.

В панели **Edit** вашей IDE:

1. В `src/app/home/home.ts` скопируйте переменную `housingLocationList` и её массив из `Home`.
1. В `src/app/housing.service.ts`:
   1. Внутри класса `HousingService` вставьте переменную, скопированную из `Home` на предыдущем шаге.
   1. Внутри класса `HousingService` вставьте эти функции после скопированных данных.
      Эти функции позволяют зависимостям получать доступ к данным сервиса.

      <docs-code header="Service functions in src/app/housing.service.ts" path="adev/src/content/tutorials/first-app/steps/10-routing/src/app/housing.service.ts" visibleLines="[112,118]"/>

      Эти функции понадобятся в будущем уроке. Пока достаточно понимать, что они возвращают либо конкретный `HousingLocation` по идентификатору, либо весь список.

   1. Добавьте импорт `HousingLocation` на уровне файла.

      <docs-code header="Import HousingLocation type in  src/app/housing.service.ts" path="adev/src/content/tutorials/first-app/steps/10-routing/src/app/housing.service.ts" visibleLines="[2]"/>

1. Убедитесь, что приложение собирается без ошибок.
   Исправьте все ошибки перед переходом к следующему шагу.
   </docs-step>

<docs-step title="Внедрите новый сервис в `Home`">
На этом шаге вы внедрите новый сервис в `Home` приложения, чтобы компонент мог читать данные из сервиса.
В следующем уроке вы замените статические данные живым источником данных, как в реальном приложении.

В панели **Edit** вашей IDE, в `src/app/home/home.ts`:

1.  В начале `src/app/home/home.ts` добавьте `inject` к элементам, импортируемым из `@angular/core`. Это импортирует функцию `inject` в класс `Home`.

      <docs-code language="angular-ts" header="Update to src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/10-routing/src/app/home/home.ts" visibleLines="[1]"/>

1.  Добавьте новый импорт `HousingService` на уровне файла:

      <docs-code language="angular-ts" header="Add import to src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/10-routing/src/app/home/home.ts" visibleLines="[4]"/>

1.  В `Home` удалите записи массива `housingLocationList` и присвойте `housingLocationList` значение пустого массива (`[]`). Через несколько шагов вы обновите код для получения данных из `HousingService`.

1.  В `Home` добавьте следующий код для внедрения нового сервиса и инициализации данных приложения. `constructor` — это первая функция, которая запускается при создании компонента. Код в `constructor` присвоит `housingLocationList` значение, возвращённое вызовом `getAllHousingLocations`.

      <docs-code language="angular-ts" header="Initialize data from service in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/10-routing/src/app/home/home.ts" visibleLines="[23,30]"/>

1.  Сохраните изменения в `src/app/home/home.ts` и убедитесь, что приложение собирается без ошибок.
    Исправьте все ошибки перед переходом к следующему шагу.
    </docs-step>

</docs-workflow>

РЕЗЮМЕ: В этом уроке вы добавили сервис Angular в приложение и внедрили его в класс `Home`.
Это разделяет способ получения данных вашим приложением.
Пока что новый сервис получает данные из статического массива.
В следующем уроке вы реорганизуете сервис для получения данных из конечной точки API.

Для получения дополнительной информации по темам, затронутым в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="guide/di/creating-and-using-services" title="Создание инжектируемого сервиса"/>
  <docs-pill href="guide/di" title="Внедрение зависимостей в Angular"/>
  <docs-pill href="cli/generate/service" title="ng generate service"/>
  <docs-pill href="cli/generate" title="ng generate"/>
</docs-pill-row>
