# Добавление маршрутов в приложение

В этом уроке показано, как добавить маршруты в ваше приложение.

<docs-video src="https://www.youtube.com/embed/r5DEBMuStPw?si=H6Bx6nLJoMLaMxkx" />

ВАЖНО: Для изучения маршрутизации рекомендуется использовать локальную среду.

## Чему вы научитесь {#what-youll-learn}

По окончании этого урока ваше приложение будет поддерживать маршрутизацию.

## Концептуальный обзор маршрутизации {#conceptual-preview-of-routing}

В этом уроке вводится маршрутизация в Angular. Маршрутизация — это возможность переходить от одного компонента приложения к другому. В [одностраничных приложениях (SPA)](guide/routing) при переходе обновляются только части страницы, представляющие запрошенный пользователем вид.

[Angular Router](guide/routing) позволяет разработчикам объявлять маршруты и указывать, какой компонент должен отображаться на экране при запросе этого маршрута.

В этом уроке вы включите маршрутизацию в приложении для навигации на страницу подробностей.

<docs-workflow>

<docs-step title="Create a default details component ">
1. В терминале выполните следующую команду для создания компонента `Details`:

    ```shell
    ng generate component details
    ```

    Этот компонент будет представлять страницу подробностей с дополнительной информацией о конкретном объекте жилья.

</docs-step>

<docs-step title="Add routing to the application">
1.  В директории `src/app` создайте файл `routes.ts`. В этом файле будут определены маршруты приложения.

2.  В `main.ts` внесите следующие изменения для включения маршрутизации:
    1.  Импортируйте файл маршрутов и функцию `provideRouter`:

          <docs-code header="Import routing details in src/main.ts" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/main.ts" visibleLines="[7,8]"/>

    1.  Обновите вызов `bootstrapApplication`, включив конфигурацию маршрутизации:

          <docs-code header="Add router configuration in src/main.ts" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/main.ts" visibleLines="[10,17]"/>

3.  В `src/app/app.ts` обновите компонент для использования маршрутизации:
    1.  Добавьте импорты директив маршрутизатора `RouterOutlet` и `RouterLink` на уровне файла:

          <docs-code language="angular-ts" header="Import router directives in src/app/app.ts" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/app/app.ts" visibleLines="[3]"/>

    1.  Добавьте `RouterOutlet` и `RouterLink` в массив `imports` метаданных `@Component`

          <docs-code language="angular-ts" header="Add router directives to component imports in src/app/app.ts" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/app/app.ts" visibleLines="[6]"/>

    1.  В свойстве `template` замените тег `<app-home />` директивой `<router-outlet>` и добавьте ссылку для возврата на главную страницу. Ваш код должен соответствовать этому коду:

          <docs-code language="angular-ts" header="Add router-outlet in src/app/app.ts" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/app/app.ts" visibleLines="[7,18]"/>

</docs-step>

<docs-step title="Add route to new component">
На предыдущем шаге вы удалили ссылку на компонент `<app-home>` из шаблона. На этом шаге вы добавите новый маршрут к этому компоненту.

1. В `routes.ts` внесите следующие изменения для создания маршрута.
   1. Добавьте импорты на уровне файла для `Home`, `Details` и типа `Routes`, который вы будете использовать в определениях маршрутов.

      <docs-code header="Import components and Routes" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/app/routes.ts" visibleLines="[1,3]"/>

   1. Определите переменную `routeConfig` типа `Routes` и задайте два маршрута для приложения:
      <docs-code header="Add routes to the app" path="adev/src/content/tutorials/first-app/steps/11-details-page/src/app/routes.ts" visibleLines="[5,18]"/>

      Записи в массиве `routeConfig` представляют маршруты приложения. Первая запись переходит к `Home`, когда URL соответствует `''`. Вторая запись использует специальное форматирование, к которому мы вернёмся в будущем уроке.

1. Сохраните все изменения и убедитесь, что приложение работает в браузере. Приложение должно по-прежнему отображать список объектов жилья.
   </docs-step>

</docs-workflow>

РЕЗЮМЕ: В этом уроке вы включили маршрутизацию в приложении и определили новые маршруты. Теперь ваше приложение поддерживает навигацию между представлениями. В следующем уроке вы научитесь переходить на страницу «подробностей» для конкретного объекта жилья.

Вы делаете отличный прогресс, продолжайте в том же духе!

Для получения дополнительной информации по темам, затронутым в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="guide/routing" title="Обзор маршрутизации в Angular"/>
  <docs-pill href="guide/routing/common-router-tasks" title="Общие задачи маршрутизации"/>
</docs-pill-row>
