# Добавление функции поиска в приложение {#add-the-search-feature-to-your-app}

В этом уроке показано, как добавить функциональность поиска в ваше приложение Angular.

Приложение позволит пользователям выполнять поиск по данным, предоставляемым приложением, и отображать только те результаты, которые соответствуют введённому запросу.

<docs-video src="https://www.youtube.com/embed/5K10oYJ5Y-E?si=TiuNKx_teR9baO7k&amp;start=457"/>

ВАЖНО: Для этого шага руководства рекомендуется использовать локальную среду.

## Чему вы научитесь {#what-youll-learn}

- Ваше приложение будет использовать данные из формы для поиска подходящих объектов жилья.
- Ваше приложение будет отображать только совпадающие объекты жилья.

<docs-workflow>

<docs-step title="Update the home component properties">
На этом шаге вы обновите класс `Home`, чтобы хранить данные в новом свойстве-массиве, которое будет использоваться для фильтрации.

1. В `src/app/home/home.ts` добавьте новое свойство класса `filteredLocationList`.

   <docs-code header="Add the filteredLocationList property in home.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[28]"/>

   `filteredLocationList` хранит значения, соответствующие критериям поиска, введённым пользователем.

1. По умолчанию `filteredLocationList` должен содержать полный набор значений объектов жилья при загрузке страницы. Обновите `constructor` для `Home`, чтобы установить это значение.

   <docs-code header="Set the value of filteredLocationList" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[29,32]"/>

</docs-step>

<docs-step title="Update the home component template">
`Home` уже содержит поле ввода, которое вы будете использовать для получения ввода от пользователя. Эта строка текста будет использоваться для фильтрации результатов.

1. Обновите шаблон `Home`, включив переменную шаблона `#filter` в элемент `input`.

   <docs-code language="angular-ts" header="Add a template variable to the input HTML element in home.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[12]"/>
   В этом примере используется [переменная ссылки на шаблон](guide/templates) для получения доступа к элементу `input` и его значению.

1. Далее обновите шаблон компонента, чтобы привязать обработчик события к кнопке «Search».

   <docs-code language="angular-ts" header="Bind the button click event to a method in home.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[13]"/>

   Привязывая событие `click` к элементу `button`, вы можете вызвать функцию `filterResults`. Аргументом функции является свойство `value` переменной шаблона `filter`. Конкретно — свойство `.value` HTML-элемента `input`.

1. Последнее обновление шаблона касается директивы `@for`. Обновите `@for`, чтобы он перебирал значения из массива `filteredLocationList`.

   <docs-code header="Update the @for template directive in home.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[17,19]" language="html"/>

</docs-step>

<docs-step title="Implement the event handler function">
Шаблон обновлён для привязки функции `filterResults` к событию `click`. Теперь ваша задача — реализовать функцию `filterResults` в классе `Home`.

1.  Обновите класс `Home`, включив реализацию функции `filterResults`.

    <docs-code header="Add the filterResults function implementation" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[35,44]"/>

    Эта функция использует функцию `filter` объекта `String` для сравнения значения параметра `text` со свойством `housingLocation.city`. Вы можете обновить эту функцию для сравнения с любым свойством или несколькими свойствами — это хорошее упражнение.

1.  Сохраните код.

1.  Обновите браузер и убедитесь, что вы можете выполнять поиск по данным объектов жилья по городу при нажатии кнопки «Search» после ввода текста.

       <img alt="отфильтрованные результаты поиска на основе ввода пользователя" src="assets/images/tutorials/first-app/homes-app-lesson-13-step-3.png">

    </docs-step>

</docs-workflow>

РЕЗЮМЕ: В этом уроке вы обновили приложение, используя переменные шаблона для взаимодействия со значениями шаблона, и добавили функциональность поиска с помощью привязки событий и функций массивов.

Для получения дополнительной информации по темам, затронутым в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="guide/templates" title="Переменные шаблона"/>
  <docs-pill href="guide/templates/event-listeners" title="Обработка событий"/>
</docs-pill-row>
