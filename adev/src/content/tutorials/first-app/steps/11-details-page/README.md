# Интеграция страницы с подробной информацией в приложение

В этом уроке демонстрируется, как подключить страницу с подробной информацией к вашему приложению.

<docs-video src="https://www.youtube.com/embed/-jRxG84AzCI?si=CbqIpmRpwp5ZZDnu&amp;start=345"/>

ВАЖНО: Мы рекомендуем использовать локальное окружение для изучения маршрутизации.

## Чему вы научитесь

К концу этого урока ваше приложение будет поддерживать маршрутизацию на страницу с подробной информацией.

## Концептуальный обзор маршрутизации с параметрами маршрута

Каждое жилье имеет специфические детали, которые должны отображаться, когда пользователь переходит на страницу с
подробной информацией об этом объекте. Для достижения этой цели вам потребуется использовать параметры маршрута.

Параметры маршрута позволяют включать динамическую информацию как часть URL вашего маршрута. Чтобы определить, на какое
жилье нажал пользователь, вы будете использовать свойство `id` типа `HousingLocation`.

<docs-workflow>

<docs-step title="Использование `routerLink` для динамической навигации">
В уроке 10 вы добавили второй маршрут в `src/app/routes.ts`, который включает специальный сегмент, определяющий параметр маршрута, `id`:

```
'details/:id'
```

В данном случае `:id` является динамическим и будет меняться в зависимости от того, как маршрут запрашивается кодом.

1. В `src/app/housing-location/housing-location.ts` добавьте тег ссылки к элементу `section` и включите директиву
   `routerLink`:

   <docs-code language="angular-ts" header="Add anchor with a routerLink directive to housing-location.ts" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/housing-location/housing-location.ts" visibleLines="[18]"/>

   Директива `routerLink` позволяет роутеру Angular создавать динамические ссылки в приложении. Значение, присвоенное
   `routerLink`, представляет собой массив с двумя записями: статической частью пути и динамическими данными.

   Чтобы `routerLink` работал в шаблоне, добавьте импорт `RouterLink` и `RouterOutlet` из '@angular/router' на уровне
   файла, затем обновите массив `imports` компонента, включив в него `RouterLink` и `RouterOutlet`.

1. На этом этапе вы можете убедиться, что маршрутизация работает в вашем приложении. В браузере обновите домашнюю
   страницу и нажмите кнопку "Learn More" для любого объекта жилья.

<img alt="details page displaying the text 'details works!'" src="assets/images/tutorials/first-app/homes-app-lesson-11-step-1.png">

</docs-step>

<docs-step title="Получение параметров маршрута">
На этом шаге вы получите параметр маршрута в компоненте `Details`. В настоящее время приложение отображает `details works!`. Далее вы обновите код, чтобы отобразить значение `id`, переданное с использованием параметров маршрута.

1. В `src/app/details/details.ts` обновите шаблон, чтобы импортировать функции, классы и сервисы, которые вам
   понадобятся в `Details`:

<docs-code header="Update file level imports" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.ts" visibleLines="[1,4]"/>

1. Обновите свойство `template` декоратора `@Component`, чтобы отобразить значение `housingLocationId`:

   ```angular-ts
     template: `<p>details works! {{ housingLocationId }}</p>`,
   ```

1. Обновите тело класса `Details` следующим кодом:

   ```ts
   export class Details {
     route: ActivatedRoute = inject(ActivatedRoute);
     housingLocationId = -1;
     constructor() {
       this.housingLocationId = Number(this.route.snapshot.params['id']);
     }
   }
   ```

   Этот код предоставляет компоненту `Details` доступ к функции роутера `ActivatedRoute`, которая позволяет получить
   доступ к данным о текущем маршруте. В `constructor` код преобразует параметр `id`, полученный из маршрута, из строки
   в число.

1. Сохраните все изменения.

1. В браузере нажмите на одну из ссылок "Learn More" и убедитесь, что числовое значение, отображаемое на странице,
   совпадает со свойством `id` для этого места в данных.
   </docs-step>

<docs-step title="Настройка компонента `Details`">
Теперь, когда маршрутизация работает правильно, самое время обновить шаблон `Details`, чтобы отображать конкретные данные, соответствующие параметру маршрута.

Для доступа к данным вы добавите вызов `HousingService`.

1. Обновите код шаблона, чтобы он соответствовал следующему коду:

   <docs-code language="angular-ts" header="Update the Details template in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.ts" visibleLines="[8,29]"/>

   Обратите внимание, что доступ к свойствам `housingLocation` осуществляется с помощью оператора опциональной
   последовательности `?`. Это гарантирует, что если значение `housingLocation` равно null или undefined, приложение не
   упадет с ошибкой.

1. Обновите тело класса `Details`, чтобы оно соответствовало следующему коду:

   <docs-code language="angular-ts" header="Update the Details class in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.ts" visibleLines="[32,41]"/>

   Теперь в компоненте есть код для отображения правильной информации на основе выбранного жилья. `constructor` теперь
   включает вызов `HousingService` для передачи параметра маршрута в качестве аргумента функции сервиса
   `getHousingLocationById`.

1. Скопируйте следующие стили в файл `src/app/details/details.css`:

   <docs-code header="Add styles for the Details" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.css" visibleLines="[1,71]"/>

   и сохраните изменения.

1. В `Details` используйте только что созданный файл `details.css` в качестве источника стилей:
   <docs-code language="angular-ts" header="Update details.ts to use the created css file" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/details/details.ts" visibleLines="[30]"/>

1. В браузере обновите страницу и убедитесь, что при нажатии на ссылку "Learn More" для данного жилья страница с
   подробной информацией отображает правильные данные для выбранного элемента.

<img alt="Details page listing home info" src="assets/images/tutorials/first-app/homes-app-lesson-11-step-3.png">

</docs-step>

<docs-step title="Проверка навигации в `Home`">
В предыдущем уроке вы обновили шаблон `App`, включив в него `routerLink`. Добавление этого кода обновило ваше приложение, позволив возвращаться на `Home` (домашнюю страницу) при каждом нажатии на логотип.

1.  Убедитесь, что ваш код соответствует следующему:

        <docs-code language="angular-ts" header="Confirm the routerLink in app.ts" path="adev/src/content/tutorials/first-app/steps/12-forms/src/app/app.ts" visibleLines="[8,19]"/>

    Ваш код уже должен быть актуальным, но проверьте, чтобы быть уверенным.

    </docs-step>

</docs-workflow>

РЕЗЮМЕ: В этом уроке вы добавили маршрутизацию для показа страниц с подробной информацией.

Теперь вы знаете, как:

- использовать параметры маршрута для передачи данных в маршрут;
- использовать директиву `routerLink` для создания маршрута с использованием динамических данных;
- использовать параметр маршрута для получения данных из `HousingService` для отображения информации о конкретном жилье.

Отличная работа.

Для получения дополнительной информации о темах, затронутых в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="guide/routing/common-router-tasks#accessing-query-parameters-and-fragments" title="Параметры маршрута"/>
  <docs-pill href="guide/routing" title="Обзор маршрутизации в Angular"/>
  <docs-pill href="guide/routing/common-router-tasks" title="Общие задачи маршрутизации"/>
  <docs-pill href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Optional_chaining" title="Оператор опциональной последовательности"/>
</docs-pill-row>
