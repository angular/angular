# Интеграция страницы подробностей в приложение

В этом уроке показано, как подключить страницу подробностей к вашему приложению.

<docs-video src="https://www.youtube.com/embed/-jRxG84AzCI?si=CbqIpmRpwp5ZZDnu&amp;start=345"/>

ВАЖНО: Для изучения маршрутизации рекомендуется использовать локальную среду.

## Чему вы научитесь {#what-youll-learn}

По окончании этого урока ваше приложение будет поддерживать маршрутизацию на страницу подробностей.

## Концептуальный обзор маршрутизации с параметрами маршрута {#conceptual-preview-of-routing-with-route-parameters}

Каждый объект жилья имеет конкретные детали, которые должны отображаться при переходе пользователя на страницу подробностей для этого элемента. Для достижения этой цели вам нужно использовать параметры маршрута.

Параметры маршрута позволяют включать динамическую информацию в URL маршрута. Чтобы определить, на какой объект жилья нажал пользователь, вы будете использовать свойство `id` типа `HousingLocation`.

<docs-workflow>

<docs-step title="Using `routerLink` for dynamic navigation">
В уроке 10 вы добавили второй маршрут в `src/app/routes.ts`, который включает специальный сегмент для параметра маршрута `id`:

```
'details/:id'
```

В данном случае `:id` является динамическим и будет меняться в зависимости от того, как маршрут запрашивается кодом.

1.  В `src/app/housing-location/housing-location.ts` добавьте тег якоря в элемент `section` и включите директиву `routerLink`:

    <docs-code language="angular-ts" header="Add anchor with a routerLink directive to housing-location.ts" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/housing-location/housing-location.ts" visibleLines="[18]"/>

    Директива `routerLink` позволяет маршрутизатору Angular создавать динамические ссылки в приложении. Значение, присвоенное `routerLink`, — это массив с двумя записями: статическая часть пути и динамические данные.

    Чтобы `routerLink` работал в шаблоне, добавьте импорт `RouterLink` и `RouterOutlet` из '@angular/router' на уровне файла, затем обновите массив `imports` компонента, включив оба элемента.

1.  На данном этапе вы можете убедиться, что маршрутизация работает в вашем приложении. В браузере обновите главную страницу и нажмите кнопку «Learn More» для объекта жилья.

      <img alt="страница подробностей с текстом 'details works!'" src="assets/images/tutorials/first-app/homes-app-lesson-11-step-1.png">

</docs-step>

<docs-step title="Get route parameters">
На этом шаге вы получите параметр маршрута в `Details`. В настоящее время приложение отображает `details works!`. Далее вы обновите код для отображения значения `id`, переданного с помощью параметров маршрута.

1.  В `src/app/details/details.ts` обновите шаблон, чтобы импортировать функции, классы и сервисы, которые вы будете использовать в `Details`:

      <docs-code header="Update file level imports" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.ts" visibleLines="[1,4]"/>

1.  Обновите свойство `template` декоратора `@Component`, чтобы отображать значение `housingLocationId`:

         ```angular-ts
         template: `<p>details works! {{ housingLocationId }}</p>`,
         ```

1.  Обновите тело класса `Details` следующим кодом:

         ```ts
         export class Details {
            route: ActivatedRoute = inject(ActivatedRoute);
            housingLocationId = -1;
            constructor() {
            this.housingLocationId = Number(this.route.snapshot.params['id']);
            }
         }
         ```

    Этот код даёт `Details` доступ к функции `ActivatedRoute` маршрутизатора, которая обеспечивает доступ к данным о текущем маршруте. В `constructor` код преобразует параметр `id`, полученный из маршрута, из строки в число.

1.  Сохраните все изменения.

1.  В браузере нажмите на одну из ссылок «Learn More» для объекта жилья и убедитесь, что числовое значение на странице соответствует свойству `id` для этого объекта в данных.
    </docs-step>

<docs-step title="Customize the `Details`">
Теперь, когда маршрутизация в приложении работает корректно, самое время обновить шаблон `Details`, чтобы отображать конкретные данные, соответствующие объекту жилья по параметру маршрута.

Для доступа к данным вы добавите вызов `HousingService`.

1. Обновите код шаблона, чтобы он соответствовал следующему:

   <docs-code language="angular-ts" header="Update the Details template in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.ts" visibleLines="[8,29]"/>

   Обратите внимание, что к свойствам `housingLocation` обращаются с помощью оператора опциональной цепочки `?`. Это гарантирует, что если значение `housingLocation` равно null или undefined, приложение не завершится с ошибкой.

1. Обновите тело класса `Details`, чтобы оно соответствовало следующему коду:

   <docs-code language="angular-ts" header="Update the Details class in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.ts" visibleLines="[32,41]"/>

   Теперь компонент содержит код для отображения правильной информации на основе выбранного объекта жилья. В `constructor` теперь включён вызов `HousingService` для передачи параметра маршрута в качестве аргумента функции сервиса `getHousingLocationById`.

1. Скопируйте следующие стили в файл `src/app/details/details.css`:

   <docs-code header="Add styles for the Details" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.css" visibleLines="[1,71]"/>

   и сохраните изменения

1. В `Details` используйте только что созданный файл `details.css` в качестве источника стилей:
   <docs-code language="angular-ts" header="Update details.ts to use the created css file" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.ts" visibleLines="[30]"/>

1. В браузере обновите страницу и убедитесь, что при нажатии на ссылку «Learn More» для конкретного объекта жилья страница подробностей отображает правильную информацию на основе данных этого элемента.

<img alt="Страница подробностей со сведениями о доме" src="assets/images/tutorials/first-app/homes-app-lesson-11-step-3.png">

</docs-step>

<docs-step title="Check navigation in the `Home`">
В предыдущем уроке вы обновили шаблон `App`, добавив `routerLink`. Добавление этого кода обновило приложение, чтобы при нажатии на логотип выполнялась навигация обратно к `Home`.

1.  Убедитесь, что ваш код соответствует следующему:

      <docs-code language="angular-ts" header="Confirm the routerLink in app.ts" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/app.ts" visibleLines="[8,19]"/>

    Ваш код уже должен быть актуальным, но проверьте для уверенности.

    </docs-step>

</docs-workflow>

РЕЗЮМЕ: В этом уроке вы добавили маршрутизацию для отображения страниц подробностей.

Теперь вы знаете, как:

- использовать параметры маршрута для передачи данных в маршрут
- использовать директиву `routerLink` для создания маршрута на основе динамических данных
- использовать параметр маршрута для получения данных из `HousingService` и отображения информации о конкретном объекте жилья.

Отличная работа!

Для получения дополнительной информации по темам, затронутым в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="guide/routing/read-route-state#get-information-about-the-current-route-with-activatedroute" title="Параметры маршрута"/>
  <docs-pill href="guide/routing" title="Обзор маршрутизации в Angular"/>
  <docs-pill href="guide/routing/common-router-tasks" title="Общие задачи маршрутизации"/>
  <docs-pill href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Optional_chaining" title="Оператор опциональной цепочки"/>
</docs-pill-row>
