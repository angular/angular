# Добавление формы в Angular-приложение {#adding-a-form-to-your-angular-app}

В этом уроке показано, как добавить форму для сбора пользовательских данных в Angular-приложение.
Урок начинается с функционального Angular-приложения и показывает, как добавить форму в него.

Данные, собранные формой, отправляются только в Сервис приложения, который записывает их в консоль браузера.
Использование REST API для отправки и получения данных формы в этом уроке не рассматривается.

<docs-video src="https://www.youtube.com/embed/kWbk-dOJaNQ?si=FYMXGdUiT-qh321h"/>

IMPORTANT: Для этого шага урока рекомендуется использовать локальную среду.

## Что вы узнаете {#what-youll-learn}

- В вашем приложении появится форма, в которую пользователи могут вводить данные, отправляемые в Сервис приложения.
- Сервис записывает данные из формы в журнал консоли браузера.

<docs-workflow>

<docs-step title="Добавьте метод для отправки данных формы">
На этом шаге вы добавляете в Сервис приложения метод, который получает данные формы для отправки по назначению.
В этом примере метод записывает данные из формы в журнал консоли браузера.

В панели **Edit** вашей IDE:

1.  В `src/app/housing.service.ts`, внутри класса `HousingService`, вставьте этот метод в конец определения класса.

       <docs-code header="Submit method in src/app/housing.service.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/housing.service.ts" visibleLines="[120,124]"/>

1.  Убедитесь, что приложение собирается без ошибок.
    Исправьте все ошибки перед переходом к следующему шагу.
    </docs-step>

<docs-step title="Добавьте функции формы на страницу деталей">
На этом шаге вы добавляете код на страницу деталей, который управляет взаимодействиями формы.

В панели **Edit** вашей IDE, в `src/app/details/details.ts`:

1.  После инструкций `import` в верхней части файла добавьте следующий код для импорта классов Angular-форм.

      <docs-code header="Forms imports in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/details/details.ts" visibleLines="[5]"/>

1.  В метаданных декоратора `Details` обновите свойство `imports` следующим кодом:

      <docs-code header="imports directive in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/details/details.ts" visibleLines="[9]"/>

1.  В классе `Details`, перед методом `constructor()`, добавьте следующий код для создания объекта формы.

      <docs-code header="template directive in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/details/details.ts" visibleLines="[52,56]"/>

    В Angular `FormGroup` и `FormControl` — это типы, позволяющие создавать формы. Тип `FormControl` может предоставлять значение по умолчанию и формировать данные формы. В этом примере `firstName` является строкой (`string`), а значение по умолчанию — пустая строка.

1.  В классе `Details`, после метода `constructor()`, добавьте следующий код для обработки нажатия кнопки **Apply now**.

      <docs-code header="template directive in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/details/details.ts" visibleLines="[62,68]"/>

    Эта кнопка ещё не существует — вы добавите её на следующем шаге. В приведённом выше коде `FormControl`ы могут возвращать `null`. Этот код использует оператор нулевого слияния для подстановки пустой строки в случае, если значение равно `null`.

1.  Убедитесь, что приложение собирается без ошибок.
    Исправьте все ошибки перед переходом к следующему шагу.
    </docs-step>

<docs-step title="Добавьте разметку формы на страницу деталей">
На этом шаге вы добавляете разметку на страницу деталей, отображающую форму.

В панели **Edit** вашей IDE, в `src/app/details/details.ts`:

1. В метаданных декоратора `Details` обновите HTML `template`, чтобы он соответствовал следующему коду с разметкой формы.

   <docs-code language="angular-ts" header="template directive in src/app/details/details.ts" path="adev/src/content/tutorials/first-app/steps/13-search/src/app/details/details.ts" visibleLines="[10,45]"/>

   Шаблон теперь включает обработчик событий `(submit)="submitApplication()"`. Angular использует синтаксис с круглыми скобками вокруг имени события для определения событий в коде Шаблона. Код справа от знака равенства — это код, который должен выполняться при возникновении этого события. Вы можете использовать привязку как к браузерным, так и к пользовательским событиям.

1. Убедитесь, что приложение собирается без ошибок.
   Исправьте все ошибки перед переходом к следующему шагу.

   <img alt="details page with a form for applying to live at this location" src="assets/images/tutorials/first-app/homes-app-lesson-12-step-3.png">

</docs-step>

<docs-step title="Протестируйте новую форму приложения">
На этом шаге тестируется новая форма, чтобы убедиться, что при отправке данных формы в приложение они появляются в журнале консоли.

1. В панели **Терминал** вашей IDE выполните `ng serve`, если он ещё не запущен.
1. В браузере откройте приложение по адресу `http://localhost:4200`.
1. Щёлкните правой кнопкой мыши по приложению в браузере и в контекстном меню выберите **Inspect** (Просмотр кода).
1. В окне инструментов разработчика выберите вкладку **Console** (Консоль).
   Убедитесь, что окно инструментов разработчика видно на следующих шагах.
1. В приложении:
   1. Выберите объект жилья и нажмите **Learn more**, чтобы увидеть детали о нём.
   1. На странице деталей прокрутите страницу вниз, чтобы найти новую форму.
   1. Введите данные в поля формы — любые данные подойдут.
   1. Нажмите **Apply now** для отправки данных.
1. В окне инструментов разработчика изучите вывод журнала, чтобы найти данные формы.
   </docs-step>

</docs-workflow>

SUMMARY: В этом уроке вы обновили приложение, добавив форму с использованием функциональности Angular-форм, и связали данные, введённые в форму, с Компонентом с помощью обработчика событий.

Для получения дополнительной информации по темам, рассмотренным в этом уроке, посетите:

<docs-pill-row>
  <docs-pill href="guide/forms" title="Angular-формы"/>
  <docs-pill href="guide/templates/event-listeners" title="Обработка событий"/>
</docs-pill-row>
