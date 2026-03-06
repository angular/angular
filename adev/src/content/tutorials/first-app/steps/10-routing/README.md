# Добавление маршрутов в приложение {#add-routes-to-the-application}

В этом уроке показано, как добавить маршруты в приложение.

<docs-video src="https://www.youtube.com/embed/r5DEBMuStPw?si=H6Bx6nLJoMLaMxkx" />

IMPORTANT: Для изучения маршрутизации рекомендуется использовать локальную среду.

## Что вы узнаете {#what-youll-learn}

В конце этого урока ваше приложение будет поддерживать маршрутизацию.

## Общее представление о маршрутизации {#conceptual-preview-of-routing}

В этом уроке рассматривается маршрутизация в Angular. Маршрутизация — это возможность перемещаться от одного Компонента приложения к другому. В [одностраничных приложениях (SPA)](guide/routing) только части страницы обновляются для отображения запрошенного представления.

[Angular Router](guide/routing) позволяет разработчикам объявлять маршруты и указывать, какой Компонент должен отображаться на экране при запросе этого маршрута приложением.

В этом уроке вы включите маршрутизацию в приложении для перехода на страницу деталей.

<docs-workflow>

<docs-step title="Создайте Компонент деталей по умолчанию ">
1. В терминале введите следующую команду для создания `Details`:

    ```shell
    ng generate component details
    ```

    Этот Компонент будет представлять страницу деталей, предоставляющую дополнительную информацию о конкретном объекте жилья.

</docs-step>

<docs-step title="Добавьте маршрутизацию в приложение">
1.  В директории `src/app` создайте файл `routes.ts`. В этом файле будут определены маршруты приложения.

2.  В `main.ts` выполните следующие обновления для включения маршрутизации в приложении:
    1.  Импортируйте файл маршрутов и функцию `provideRouter`:

          <docs-code header="Import routing details in src/main.ts" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/main.ts" visibleLines="[7,8]"/>

    1.  Обновите вызов `bootstrapApplication`, включив конфигурацию маршрутизации:

          <docs-code header="Add router configuration in src/main.ts" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/main.ts" visibleLines="[10,17]"/>

3.  В `src/app/app.ts` обновите Компонент для использования маршрутизации:
    1.  Добавьте импорты директив Роутера `RouterOutlet` и `RouterLink` на уровне файла:

          <docs-code language="angular-ts" header="Import router directives in src/app/app.ts" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/app/app.ts" visibleLines="[3]"/>

    1.  Добавьте `RouterOutlet` и `RouterLink` в массив `imports` метаданных `@Component`

          <docs-code language="angular-ts" header="Add router directives to component imports in src/app/app.ts" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/app/app.ts" visibleLines="[6]"/>

    1.  В свойстве `template` замените тег `<app-home />` директивой `<router-outlet>` и добавьте ссылку обратно на главную страницу. Ваш код должен соответствовать этому:

          <docs-code language="angular-ts" header="Add router-outlet in src/app/app.ts" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/app/app.ts" visibleLines="[7,18]"/>

</docs-step>

<docs-step title="Добавьте маршрут к новому Компоненту">
На предыдущем шаге вы удалили ссылку на Компонент `<app-home>` из Шаблона. На этом шаге вы добавите новый маршрут к этому Компоненту.

1. В `routes.ts` выполните следующие обновления для создания маршрута.
   1. Добавьте импорты `Home`, `Details` и типа `Routes`, которые будут использоваться в определениях маршрутов, на уровне файла.

      <docs-code header="Import components and Routes" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/app/routes.ts" visibleLines="[1,3]"/>

   1. Определите переменную `routeConfig` типа `Routes` и задайте два маршрута для приложения:
      <docs-code header="Add routes to the app" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/app/routes.ts" visibleLines="[5,18]"/>

      Записи в массиве `routeConfig` представляют маршруты приложения. Первая запись выполняет переход к `Home` при совпадении URL с `''`. Вторая запись использует специальный синтаксис форматирования, который будет рассмотрен в будущем уроке.

1. Сохраните все изменения и убедитесь, что приложение работает в браузере. Приложение по-прежнему должно отображать список объектов жилья.
   </docs-step>

</docs-workflow>

SUMMARY: В этом уроке вы включили маршрутизацию в приложении и определили новые маршруты. Теперь приложение поддерживает навигацию между представлениями. В следующем уроке вы научитесь переходить на страницу «деталей» для конкретного объекта жилья.

Вы делаете отличные успехи в работе с приложением, молодцы.

Для получения дополнительной информации по темам, рассмотренным в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="guide/routing" title="Обзор маршрутизации в Angular"/>
  <docs-pill href="guide/routing/common-router-tasks" title="Общие задачи маршрутизации"/>
</docs-pill-row>
