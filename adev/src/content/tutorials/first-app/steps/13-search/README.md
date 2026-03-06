# Добавление функции поиска в приложение {#add-the-search-feature-to-your-app}

В этом уроке показано, как добавить функцию поиска в Angular-приложение.

Приложение позволит пользователям искать по данным, предоставляемым приложением, и отображать только те результаты, которые соответствуют введённому запросу.

<docs-video src="https://www.youtube.com/embed/5K10oYJ5Y-E?si=TiuNKx_teR9baO7k&amp;start=457"/>

IMPORTANT: Для этого шага урока рекомендуется использовать локальную среду.

## Что вы узнаете {#what-youll-learn}

- Приложение будет использовать данные из формы для поиска подходящих объектов жилья
- Приложение будет отображать только совпадающие объекты жилья

<docs-workflow>

<docs-step title="Обновите свойства Компонента home">
На этом шаге вы обновите класс `Home` для хранения данных в новом свойстве-массиве, который будет использоваться для фильтрации.

1. В `src/app/home/home.ts` добавьте новое свойство в класс с именем `filteredLocationList`.

   <docs-code header="Add the filteredLocationList property in home.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[27]"/>

   `filteredLocationList` хранит значения, соответствующие критериям поиска, введённым пользователем.

1. `filteredLocationList` должен по умолчанию содержать полный набор объектов жилья при загрузке страницы. Обновите `constructor` для `Home`, чтобы установить значение.

   <docs-code header="Set the value of filteredLocationList" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[29,32]"/>

</docs-step>

<docs-step title="Обновите Шаблон Компонента home">
`Home` уже содержит поле ввода, которое будет использоваться для получения пользовательского ввода. Эта строка текста будет использоваться для фильтрации результатов.

1. Обновите Шаблон `Home`, включив переменную Шаблона в элемент `input` с именем `#filter`.

   <docs-code language="angular-ts" header="Add a template variable to the input HTML element in home.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[12]"/>
   В этом примере используется [переменная шаблонной ссылки](guide/templates) для получения доступа к элементу `input` и его значению.

1. Далее обновите Шаблон Компонента, привязав обработчик события к кнопке «Search».

   <docs-code language="angular-ts" header="Bind the button click event to a method in home.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[13]"/>

   Привязываясь к событию `click` элемента `button`, вы можете вызвать функцию `filterResults`. Аргументом функции является свойство `value` переменной Шаблона `filter`. Конкретно — свойство `.value` HTML-элемента `input`.

1. Последнее обновление Шаблона касается директивы `@for`. Обновите `@for` для итерации по значениям из массива `filteredLocationList`.

   <docs-code header="Update the @for template directive in home.ts" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[17,19]" language="html"/>

</docs-step>

<docs-step title="Реализуйте функцию обработчика событий">
Шаблон был обновлён для привязки функции `filterResults` к событию `click`. Далее необходимо реализовать функцию `filterResults` в классе `Home`.

1.  Обновите класс `Home`, включив реализацию функции `filterResults`.

    <docs-code header="Add the filterResults function implementation" path="adev/src/content/tutorials/first-app/steps/14-http/src/app/home/home.ts" visibleLines="[34,43]"/>

    Эта функция использует функцию `filter` объекта `String` для сравнения значения параметра `text` со свойством `housingLocation.city`. Для интересного упражнения можно обновить эту функцию для сравнения с любым свойством или несколькими свойствами.

1.  Сохраните код.

1.  Обновите браузер и убедитесь, что после ввода текста и нажатия кнопки «Search» можно искать данные объектов жилья по городу.

       <img alt="filtered search results based on user input" src="assets/images/tutorials/first-app/homes-app-lesson-13-step-3.png">

    </docs-step>

</docs-workflow>

SUMMARY: В этом уроке вы обновили приложение для использования переменных Шаблона для взаимодействия со значениями Шаблона и добавили функцию поиска с помощью Привязки событий и функций массивов.

Для получения дополнительной информации по темам, рассмотренным в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="guide/templates" title="Переменные Шаблона"/>
  <docs-pill href="guide/templates/event-listeners" title="Обработка событий"/>
</docs-pill-row>
