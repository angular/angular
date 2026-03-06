# Интеграция страницы деталей в приложение {#integrate-details-page-into-application}

В этом уроке показано, как подключить страницу деталей к приложению.

<docs-video src="https://www.youtube.com/embed/-jRxG84AzCI?si=CbqIpmRpwp5ZZDnu&amp;start=345"/>

IMPORTANT: Для изучения маршрутизации рекомендуется использовать локальную среду.

## Что вы узнаете {#what-youll-learn}

В конце этого урока ваше приложение будет поддерживать маршрутизацию на страницу деталей.

## Общее представление о маршрутизации с параметрами маршрута {#conceptual-preview-of-routing-with-route-parameters}

Каждый объект жилья имеет конкретные детали, которые должны отображаться при переходе пользователя на страницу деталей этого объекта. Для достижения этой цели необходимо использовать параметры маршрута.

Параметры маршрута позволяют включать динамическую информацию как часть URL маршрута. Для определения объекта жилья, на который нажал пользователь, используется свойство `id` типа `HousingLocation`.

<docs-workflow>

<docs-step title="Использование `routerLink` для динамической навигации">
В уроке 10 вы добавили второй маршрут в `src/app/routes.ts`, включающий специальный сегмент, определяющий параметр маршрута `id`:

```
'details/:id'
```

В данном случае `:id` является динамическим и будет меняться в зависимости от того, как маршрут запрашивается кодом.

1.  В `src/app/housing-location/housing-location.ts` добавьте тег привязки в элемент `section` и включите директиву `routerLink`:

    <docs-code language="angular-ts" header="Add anchor with a routerLink directive to housing-location.ts" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/housing-location/housing-location.ts" visibleLines="[18]"/>

    Директива `routerLink` позволяет Роутеру Angular создавать динамические ссылки в приложении. Значение, присвоенное `routerLink`, является массивом с двумя элементами: статической частью пути и динамическими данными.

    Чтобы `routerLink` работал в Шаблоне, добавьте импорт `RouterLink` и `RouterOutlet` из '@angular/router' на уровне файла, а затем обновите массив `imports` Компонента, включив оба элемента: `RouterLink` и `RouterOutlet`.

1.  На этом этапе можно убедиться, что маршрутизация работает в приложении. В браузере обновите главную страницу и нажмите кнопку «Learn More» для любого объекта жилья.

      <img alt="details page displaying the text 'details works!'" src="assets/images/tutorials/first-app/homes-app-lesson-11-step-1.png">

</docs-step>

<docs-step title="Получите параметры маршрута">
На этом шаге вы получаете параметр маршрута в `Details`. В данный момент приложение отображает `details works!`. Далее вы обновите код для отображения значения `id`, переданного через параметры маршрута.

1.  В `src/app/details/details.ts` обновите Шаблон, импортировав функции, классы и Сервисы, которые будут использоваться в `Details`:

      <docs-code header="Update file level imports" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.ts" visibleLines="[1,4]"/>

1.  Обновите свойство `template` декоратора `@Component` для отображения значения `housingLocationId`:

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

    Этот код предоставляет `Details` доступ к функциональности `ActivatedRoute` Роутера, которая позволяет получить доступ к данным текущего маршрута. В `constructor` код преобразует параметр `id`, полученный из маршрута, из строки в число.

1.  Сохраните все изменения.

1.  В браузере нажмите на одну из ссылок «Learn More» объектов жилья и убедитесь, что числовое значение, отображаемое на странице, совпадает со свойством `id` данного объекта в данных.
    </docs-step>

<docs-step title="Настройте `Details`">
Теперь, когда маршрутизация работает корректно, самое время обновить Шаблон `Details` для отображения конкретных данных объекта жилья, соответствующего параметру маршрута.

Для доступа к данным необходимо добавить вызов `HousingService`.

1. Обновите код Шаблона в соответствии со следующим:

   <docs-code language="angular-ts" header="Update the Details template in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.ts" visibleLines="[8,29]"/>

   Обратите внимание, что к свойствам `housingLocation` применяется оператор опциональной цепочки `?`. Это гарантирует, что приложение не «упадёт» при значении `housingLocation` равном null или undefined.

1. Обновите тело класса `Details` в соответствии со следующим:

   <docs-code language="angular-ts" header="Update the Details class in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.ts" visibleLines="[32,41]"/>

   Теперь Компонент содержит код для отображения корректной информации на основе выбранного объекта жилья. `constructor` теперь включает вызов `HousingService` для передачи параметра маршрута в качестве аргумента функции Сервиса `getHousingLocationById`.

1. Скопируйте следующие стили в файл `src/app/details/details.css`:

   <docs-code header="Add styles for the Details" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.css" visibleLines="[1,71]"/>

   и сохраните изменения

1. В `Details` используйте только что созданный файл `details.css` как источник стилей:
   <docs-code language="angular-ts" header="Update details.ts to use the created css file" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.ts" visibleLines="[30]"/>

1. В браузере обновите страницу и убедитесь, что при нажатии на ссылку «Learn More» для конкретного объекта жилья страница деталей отображает корректную информацию на основе данных выбранного объекта.

<img alt="Details page listing home info" src="assets/images/tutorials/first-app/homes-app-lesson-11-step-3.png">

</docs-step>

<docs-step title="Проверьте навигацию в `Home`">
В предыдущем уроке вы обновили Шаблон `App`, включив `routerLink`. Добавление этого кода обновило приложение для включения навигации обратно к `Home` при нажатии на логотип.

1.  Убедитесь, что ваш код соответствует следующему:

      <docs-code language="angular-ts" header="Confirm the routerLink in app.ts" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/app.ts" visibleLines="[8,19]"/>

    Ваш код уже должен быть актуальным, но проверьте на всякий случай.

    </docs-step>

</docs-workflow>

SUMMARY: В этом уроке вы добавили маршрутизацию для отображения страниц деталей.

Теперь вы знаете, как:

- использовать параметры маршрута для передачи данных в маршрут
- использовать директиву `routerLink` для создания маршрута на основе динамических данных
- использовать параметр маршрута для получения данных из `HousingService` с целью отображения информации о конкретном объекте жилья.

Отличная работа!

Для получения дополнительной информации по темам, рассмотренным в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="guide/routing/read-route-state#get-information-about-the-current-route-with-activatedroute" title="Параметры маршрута"/>
  <docs-pill href="guide/routing" title="Обзор маршрутизации в Angular"/>
  <docs-pill href="guide/routing/common-router-tasks" title="Общие задачи маршрутизации"/>
  <docs-pill href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Optional_chaining" title="Оператор опциональной цепочки"/>
</docs-pill-row>
