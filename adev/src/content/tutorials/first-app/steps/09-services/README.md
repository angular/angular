# Сервисы Angular {#angular-services}

В этом уроке показано, как создать Angular-Сервис и использовать Внедрение зависимостей для подключения его в приложении.

<docs-video src="https://www.youtube.com/embed/-jRxG84AzCI?si=rieGfJawp9xJ00Sz"/>

## Что вы узнаете {#what-youll-learn}

В вашем приложении появится Сервис для передачи данных.
В конце этого урока Сервис будет считывать данные из локальных статических данных.
В более позднем уроке вы обновите Сервис для получения данных из веб-сервиса.

## Общее представление о Сервисах {#conceptual-preview-of-services}

В этом уроке рассматриваются Angular-Сервисы и Внедрение зависимостей.

### Angular-Сервисы {#angular-services-section}

_Angular-Сервисы_ предоставляют способ отделить данные и функции Angular-приложения, которые могут использоваться несколькими Компонентами.
Чтобы несколько Компонентов могли использовать Сервис, он должен быть сделан _injectable_ (встраиваемым).
Сервисы, которые являются встраиваемыми и используются Компонентом, становятся зависимостями этого Компонента.
Компонент зависит от этих Сервисов и не может функционировать без них.

### Внедрение зависимостей {#dependency-injection}

_Внедрение зависимостей_ — это механизм, управляющий зависимостями Компонентов приложения и Сервисов, которые могут использоваться другими Компонентами.

<docs-workflow>

<docs-step title="Создайте новый Сервис для приложения">
На этом шаге создаётся встраиваемый Сервис для вашего приложения.

В панели **Терминал** вашей IDE:

1. В директории проекта перейдите в директорию `first-app`.
1. В директории `first-app` выполните эту команду для создания нового Сервиса.

   ```shell
   ng generate service housing --skip-tests
   ```

1. Выполните `ng serve` для сборки приложения и его запуска по адресу `http://localhost:4200`.
1. Убедитесь, что приложение собирается без ошибок.
   Исправьте все ошибки перед переходом к следующему шагу.
   </docs-step>

<docs-step title="Добавьте статические данные в новый Сервис">
На этом шаге вы добавляете некоторые примеры данных в новый Сервис.
В более позднем уроке вы замените статические данные на веб-интерфейс для получения данных, как это происходит в реальном приложении.
Пока новый Сервис приложения использует данные, которые до сих пор создавались локально в `Home`.

В панели **Edit** вашей IDE:

1. В `src/app/home/home.ts`, из `Home`, скопируйте переменную `housingLocationList` и её массив значений.
1. В `src/app/housing.service.ts`:
   1. Внутри класса `HousingService` вставьте переменную, скопированную из `Home` на предыдущем шаге.
   1. Внутри класса `HousingService` вставьте эти функции после только что добавленных данных.
      Эти функции позволяют зависимостям получать доступ к данным Сервиса.

      <docs-code header="Service functions in src/app/housing.service.ts" path="adev/src/content/tutorials/first-app/steps/10-routing/src/app/housing.service.ts" visibleLines="[112,118]"/>

      Эти функции понадобятся в будущем уроке. Пока достаточно понимать, что они возвращают либо конкретный `HousingLocation` по id, либо весь список.

   1. Добавьте импорт `HousingLocation` на уровне файла.

      <docs-code header="Import HousingLocation type in  src/app/housing.service.ts" path="adev/src/content/tutorials/first-app/steps/10-routing/src/app/housing.service.ts" visibleLines="[2]"/>

1. Убедитесь, что приложение собирается без ошибок.
   Исправьте все ошибки перед переходом к следующему шагу.
   </docs-step>

<docs-step title="Внедрите новый Сервис в `Home`">
На этом шаге вы внедряете новый Сервис в `Home` приложения, чтобы он мог считывать данные приложения из Сервиса.
В более позднем уроке вы замените статические данные на источник живых данных для получения данных, как в реальном приложении.

В панели **Edit** вашей IDE, в `src/app/home/home.ts`:

1.  В верхней части `src/app/home/home.ts` добавьте `inject` к элементам, импортируемым из `@angular/core`. Это импортирует функцию `inject` в класс `Home`.

      <docs-code language="angular-ts" header="Update to src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/10-routing/src/app/home/home.ts" visibleLines="[1]"/>

1.  Добавьте новый импорт `HousingService` на уровне файла:

      <docs-code language="angular-ts" header="Add import to src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/10-routing/src/app/home/home.ts" visibleLines="[4]"/>

1.  Из `Home` удалите записи массива `housingLocationList` и присвойте `housingLocationList` значение пустого массива (`[]`). Через несколько шагов вы обновите код для получения данных из `HousingService`.

1.  В `Home` добавьте следующий код для внедрения нового Сервиса и инициализации данных приложения. `constructor` — это первая функция, которая выполняется при создании Компонента. Код в `constructor` присвоит `housingLocationList` значение, возвращённое вызовом `getAllHousingLocations`.

      <docs-code language="angular-ts" header="Initialize data from service in src/app/home/home.ts" path="adev/src/content/tutorials/first-app/steps/10-routing/src/app/home/home.ts" visibleLines="[23,30]"/>

1.  Сохраните изменения в `src/app/home/home.ts` и убедитесь, что приложение собирается без ошибок.
    Исправьте все ошибки перед переходом к следующему шагу.
    </docs-step>

</docs-workflow>

SUMMARY: В этом уроке вы добавили Angular-Сервис в приложение и внедрили его в класс `Home`.
Это разделяет способ получения данных приложением.
Пока новый Сервис получает данные из статического массива.
В более позднем уроке вы рефакторируете Сервис для получения данных из API-эндпоинта.

Для получения дополнительной информации по темам, рассмотренным в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="guide/di/creating-and-using-services" title="Создание встраиваемого Сервиса"/>
  <docs-pill href="guide/di" title="Внедрение зависимостей в Angular"/>
  <docs-pill href="cli/generate/service" title="ng generate service"/>
  <docs-pill href="cli/generate" title="ng generate"/>
</docs-pill-row>
