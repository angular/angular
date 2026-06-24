# Добавление функции поиска в приложение

В этом уроке показано, как добавить функцию поиска в ваше Angular-приложение.

Приложение позволит пользователям выполнять поиск по данным и отображать только те результаты, которые соответствуют
введенному запросу.

<docs-video src="https://www.youtube.com/embed/5K10oYJ5Y-E?si=TiuNKx_teR9baO7k&amp;start=457"/>

ВАЖНО: Для этого этапа руководства рекомендуется использовать локальную среду разработки.

## Чему вы научитесь

- Ваше приложение будет использовать данные из формы для поиска подходящих объектов жилья.
- Ваше приложение будет отображать только найденные объекты жилья.

<docs-workflow>

<docs-step title="Обновление свойств компонента home">
В этом шаге вы обновите класс `Home`, чтобы хранить данные в новом свойстве-массиве, которое будет использоваться для фильтрации.

1. В `src/app/home/home.ts` добавьте в класс новое свойство с именем `filteredLocationList`.

   <docs-code header="Add the filteredLocationList property in home.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[27]"/>

   Свойство `filteredLocationList` содержит значения, соответствующие критериям поиска, введенным пользователем.

1. По умолчанию при загрузке страницы `filteredLocationList` должен содержать полный набор объектов жилья. Обновите
   `constructor` класса `Home`, чтобы установить это значение.

   <docs-code header="Set the value of filteredLocationList" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[29,32]"/>

</docs-step>

<docs-step title="Обновление шаблона компонента home">
Компонент `Home` уже содержит поле ввода, которое вы будете использовать для получения данных от пользователя. Этот текст будет использоваться для фильтрации результатов.

1. Обновите шаблон `Home`, добавив в элемент `input` переменную шаблона с именем `#filter`.

   <docs-code language="angular-ts" header="Add a template variable to the input HTML element in home.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[12]"/>
   В этом примере используется [переменная ссылки на шаблон](guide/templates) для получения доступа к элементу `input`.

1. Далее обновите шаблон компонента, чтобы привязать обработчик событий к кнопке "Search".

   <docs-code language="angular-ts" header="Bind the button click event to a method in home.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[13]"/>

   Привязавшись к событию `click` на элементе `button`, вы можете вызвать функцию `filterResults`. Аргументом функции
   является свойство `value` переменной шаблона `filter`. В частности, это свойство `.value` HTML-элемента `input`.

1. Последнее обновление шаблона касается директивы `@for`. Обновите `@for`, чтобы перебирать значения из массива
   `filteredLocationList`.

   <docs-code header="Update the @for template directive in home.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[17,19]" language="html"/>

</docs-step>

<docs-step title="Реализация функции обработчика событий">
Шаблон был обновлен для привязки функции `filterResults` к событию `click`. Теперь ваша задача — реализовать функцию `filterResults` в классе `Home`.

1. Обновите класс `Home`, добавив реализацию функции `filterResults`.

   <docs-code header="Add the filterResults function implementation" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[34,43]"/>

   Эта функция использует метод массива `filter` для сравнения значения параметра `text` со свойством
   `housingLocation.city`. В качестве упражнения вы можете обновить эту функцию для сопоставления с любым другим
   свойством или несколькими свойствами.

1. Сохраните код.

1. Обновите страницу в браузере и убедитесь, что вы можете искать данные об объектах жилья по городу, нажав кнопку "
   Search" после ввода текста.

<img alt="filtered search results based on user input" src="assets/images/tutorials/first-app/homes-app-lesson-13-step-3.png">
</docs-step>

</docs-workflow>

РЕЗЮМЕ: В этом уроке вы обновили приложение, чтобы использовать переменные шаблона для взаимодействия со значениями в
шаблоне, а также добавили функцию поиска с использованием привязки событий и функций массива.

Для получения дополнительной информации по темам, затронутым в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="guide/templates" title="Переменные шаблона"/>
  <docs-pill href="guide/templates/event-listeners" title="Обработка событий"/>
</docs-pill-row>
