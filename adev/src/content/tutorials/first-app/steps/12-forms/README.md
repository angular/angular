# Добавление формы в приложение Angular {#adding-a-form-to-your-angular-app}

В этом уроке показано, как добавить форму, собирающую данные пользователя, в приложение Angular.
Урок начинается с работающего приложения Angular и показывает, как добавить в него форму.

Данные, которые собирает форма, отправляются только сервису приложения, который записывает их в консоль браузера.
Отправка и получение данных формы через REST API в этом уроке не рассматривается.

<docs-video src="https://www.youtube.com/embed/kWbk-dOJaNQ?si=FYMXGdUiT-qh321h"/>

ВАЖНО: Для этого шага руководства рекомендуется использовать локальную среду.

## Чему вы научитесь {#what-youll-learn}

- В вашем приложении появится форма, в которую пользователи могут вводить данные, отправляемые сервису приложения.
- Сервис записывает данные из формы в консоль браузера.

<docs-workflow>

<docs-step title="Add a method to send form data">
На этом шаге вы добавите метод в сервис приложения, который получает данные формы для отправки по назначению.
В данном примере метод записывает данные из формы в консоль браузера.

В панели **Edit** вашей IDE:

1.  В `src/app/housing.service.ts`, внутри класса `HousingService`, вставьте этот метод в конец определения класса.

       <docs-code header="Submit method in src/app/housing.service.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/housing.service.ts" visibleLines="[120,124]"/>

1.  Убедитесь, что приложение собирается без ошибок.
    Исправьте все ошибки перед переходом к следующему шагу.
    </docs-step>

<docs-step title="Add the form functions to the details page">
На этом шаге добавляется код на страницу подробностей, который обрабатывает взаимодействия с формой.

В панели **Edit** вашей IDE, в `src/app/details/details.ts`:

1.  После операторов `import` в начале файла добавьте следующий код для импорта классов форм Angular.

      <docs-code header="Forms imports in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/details/details.ts" visibleLines="[5]"/>

1.  В метаданных декоратора `Details` обновите свойство `imports` следующим кодом:

      <docs-code header="imports directive in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/details/details.ts" visibleLines="[9]"/>

1.  В классе `Details`, перед методом `constructor()`, добавьте следующий код для создания объекта формы.

      <docs-code header="template directive in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/details/details.ts" visibleLines="[52,56]"/>

    В Angular `FormGroup` и `FormControl` — это типы, позволяющие создавать формы. Тип `FormControl` может задавать значение по умолчанию и форму данных формы. В данном примере `firstName` является строкой, а значение по умолчанию — пустая строка.

1.  В классе `Details`, после метода `constructor()`, добавьте следующий код для обработки нажатия кнопки **Apply now**.

      <docs-code header="template directive in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/details/details.ts" visibleLines="[62,68]"/>

    Эта кнопка ещё не существует — вы добавите её на следующем шаге. В приведённом выше коде `FormControl`-элементы могут возвращать `null`. Код использует оператор нулевого слияния для подстановки пустой строки, если значение равно `null`.

1.  Убедитесь, что приложение собирается без ошибок.
    Исправьте все ошибки перед переходом к следующему шагу.
    </docs-step>

<docs-step title="Add the form's markup to the details page">
На этом шаге добавляется разметка на страницу подробностей, отображающая форму.

В панели **Edit** вашей IDE, в `src/app/details/details.ts`:

1. В метаданных декоратора `Details` обновите HTML в свойстве `template`, чтобы он соответствовал следующему коду для добавления разметки формы.

   <docs-code language="angular-ts" header="template directive in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/details/details.ts" visibleLines="[10,45]"/>

   Теперь шаблон включает обработчик события `(submit)="submitApplication()"`. Angular использует синтаксис со скобками вокруг имени события для определения событий в коде шаблона. Код справа от знака равенства — это код, который должен выполняться при срабатывании этого события. Вы можете привязываться к событиям браузера и пользовательским событиям.

1. Убедитесь, что приложение собирается без ошибок.
   Исправьте все ошибки перед переходом к следующему шагу.

   <img alt="страница подробностей с формой для подачи заявки на проживание" src="assets/images/tutorials/first-app/homes-app-lesson-12-step-3.png">

</docs-step>

<docs-step title="Test your app's new form">
На этом шаге тестируется новая форма, чтобы убедиться, что при отправке данных формы они появляются в консоли.

1. В панели **Terminal** вашей IDE выполните `ng serve`, если он ещё не запущен.
1. В браузере откройте приложение по адресу `http://localhost:4200`.
1. Кликните правой кнопкой мыши на приложение в браузере и в контекстном меню выберите **Inspect** (Инспектировать).
1. В окне инструментов разработчика выберите вкладку **Console** (Консоль).
   Убедитесь, что окно инструментов разработчика видимо для следующих шагов.
1. В вашем приложении:
   1. Выберите объект жилья и нажмите **Learn more**, чтобы увидеть подробности о доме.
   1. На странице подробностей дома прокрутите вниз, чтобы найти новую форму.
   1. Введите данные в поля формы — любые данные подойдут.
   1. Нажмите **Apply now** для отправки данных.
1. В окне инструментов разработчика просмотрите вывод консоли, чтобы найти данные вашей формы.
   </docs-step>

</docs-workflow>

РЕЗЮМЕ: В этом уроке вы обновили приложение, добавив форму с использованием функции форм Angular, и подключили данные, захваченные в форме, к компоненту с помощью обработчика событий.

Для получения дополнительной информации по темам, затронутым в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="guide/forms" title="Формы Angular"/>
  <docs-pill href="guide/templates/event-listeners" title="Обработка событий"/>
</docs-pill-row>
