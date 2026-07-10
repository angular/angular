# Создание динамических форм

Многие формы, например анкеты, могут быть очень похожи друг на друга по формату и назначению.
Чтобы быстрее и проще генерировать разные версии такой формы, можно создать _шаблон динамической формы_ на основе метаданных, описывающих модель бизнес-объекта.
Затем используйте шаблон для автоматической генерации новых форм в соответствии с изменениями модели данных.

Техника особенно полезна, когда есть тип формы, содержимое которой должно часто меняться, чтобы соответствовать быстро меняющимся бизнес- и регуляторным требованиям.
Типичный сценарий — анкета.
Может понадобиться получать ввод от пользователей в разных контекстах.
Формат и стиль форм, которые видит пользователь, должны оставаться постоянными, а фактические вопросы, которые нужно задать, меняются с контекстом.

В этом туториале вы создадите динамическую форму, представляющую базовую анкету.
Вы создаёте онлайн-заявку для героев, ищущих работу.
Агентство постоянно меняет процесс подачи заявки, но используя динамическую форму,
можно создавать новые формы на лету без изменения кода приложения.

Туториал проводит вас через следующие шаги:

1. Включить reactive forms для проекта.
1. Создать модель данных для представления form controls.
1. Заполнить модель примерными данными.
1. Разработать компонент для динамического создания form controls.

Создаваемая форма использует валидацию ввода и стилизацию для улучшения пользовательского опыта.
У неё есть кнопка Submit, которая включается только когда весь пользовательский ввод валиден, и помечает невалидный ввод цветовой кодировкой и сообщениями об ошибках.

Базовая версия может развиваться для поддержки более богатого разнообразия вопросов, более изящного рендера и лучшего пользовательского опыта.

## Включение reactive forms для проекта {#enable-reactive-forms-for-your-project}

Динамические формы основаны на reactive forms.

Чтобы дать приложению доступ к директивам reactive forms, импортируйте `ReactiveFormsModule` из пакета `@angular/forms` в необходимые компоненты.

<docs-code-multifile>
    <docs-code header="dynamic-form.component.ts" path="adev/src/content/examples/dynamic-form/src/app/dynamic-form.component.ts"/>
    <docs-code header="dynamic-form-question.component.ts" path="adev/src/content/examples/dynamic-form/src/app/dynamic-form-question.component.ts"/>
</docs-code-multifile>

## Создание объектной модели формы {#create-a-form-object-model}

Динамической форме нужна объектная модель, которая может описать все сценарии, требуемые функциональностью формы.
Пример формы заявки героя — набор вопросов: каждый control в форме должен задать вопрос и принять ответ.

Модель данных для такого типа формы должна представлять вопрос.
Пример включает `DynamicFormQuestionComponent`, который определяет вопрос как фундаментальный объект в модели.

Следующий `QuestionBase` — базовый класс для набора controls, которые могут представлять вопрос и его ответ в форме.

<docs-code header="question-base.ts" path="adev/src/content/examples/dynamic-form/src/app/question-base.ts"/>

### Определение классов controls {#define-control-classes}

От этой базы пример выводит два новых класса — `TextboxQuestion` и `DropdownQuestion` — представляющих разные типы controls.
Когда вы создадите шаблон формы на следующем шаге, вы создадите экземпляры этих конкретных типов вопросов, чтобы динамически рендерить соответствующие controls.

Тип control `TextboxQuestion` представляется в шаблоне формы элементом `<input>`. Он представляет вопрос и позволяет пользователям вводить данные. Атрибут `type` элемента определяется на основе поля `type`, указанного в аргументе `options` (например, `text`, `email`, `url`).

<docs-code header="question-textbox.ts" path="adev/src/content/examples/dynamic-form/src/app/question-textbox.ts"/>

Тип control `DropdownQuestion` представляет список вариантов в select box.

 <docs-code header="question-dropdown.ts" path="adev/src/content/examples/dynamic-form/src/app/question-dropdown.ts"/>

### Композиция групп форм {#compose-form-groups}

Динамическая форма использует сервис для создания сгруппированных наборов input controls на основе модели формы.
Следующий `QuestionControlService` собирает набор экземпляров `FormGroup`, которые потребляют метаданные из модели вопроса.
Можно указать значения по умолчанию и правила валидации.

<docs-code header="question-control.service.ts" path="adev/src/content/examples/dynamic-form/src/app/question-control.service.ts"/>

## Композиция содержимого динамической формы {#compose-dynamic-form-contents}

Сама динамическая форма представлена компонентом-контейнером, который вы добавите на более позднем шаге.
Каждый вопрос представляется в шаблоне компонента формы тегом `<app-question>`, который соответствует экземпляру `DynamicFormQuestionComponent`.

`DynamicFormQuestionComponent` отвечает за рендер деталей отдельного вопроса на основе значений в data-bound объекте вопроса.
Форма опирается на [директиву `[formGroup]`](api/forms/FormGroupDirective 'API reference') для связи HTML шаблона с underlying объектами controls.
`DynamicFormQuestionComponent` создаёт группы форм и заполняет их controls, определёнными в модели вопроса, указывая правила отображения и валидации.

<docs-code-multifile>
  <docs-code header="dynamic-form-question.component.html" path="adev/src/content/examples/dynamic-form/src/app/dynamic-form-question.component.html"/>
  <docs-code header="dynamic-form-question.component.ts" path="adev/src/content/examples/dynamic-form/src/app/dynamic-form-question.component.ts"/>
</docs-code-multifile>

Цель `DynamicFormQuestionComponent` — представлять типы вопросов, определённые в вашей модели.
Сейчас у вас только два типа вопросов, но можно представить гораздо больше.
Блок `@switch` в шаблоне определяет, какой тип вопроса отображать.
Switch использует директивы с селекторами [`formControlName`](api/forms/FormControlName 'FormControlName directive API reference') и [`formGroup`](api/forms/FormGroupDirective 'FormGroupDirective API reference').
Обе директивы определены в `ReactiveFormsModule`.

### Поставка данных {#supply-data}

Нужен ещё один сервис, чтобы поставлять конкретный набор вопросов, из которых строится отдельная форма.
Для этого упражнения вы создаёте `QuestionService` для поставки этого массива вопросов из захардкоженных примерных данных.
В реальном приложении сервис мог бы загружать данные из backend-системы.
Ключевой момент, однако, в том, что вы полностью контролируете вопросы заявки героя через объекты, возвращаемые из `QuestionService`.
Чтобы поддерживать анкету при изменении требований, нужно только добавлять, обновлять и удалять объекты из массива `questions`.

`QuestionService` поставляет набор вопросов в виде массива, привязанного к `input()` questions.

<docs-code header="question.service.ts" path="adev/src/content/examples/dynamic-form/src/app/question.service.ts"/>

## Создание шаблона динамической формы {#create-a-dynamic-form-template}

Компонент `DynamicFormComponent` — точка входа и основной контейнер формы, представленный как `<app-dynamic-form>` в шаблоне.

Компонент `DynamicFormComponent` представляет список вопросов, привязывая каждый к элементу `<app-question>`, который соответствует `DynamicFormQuestionComponent`.

<docs-code-multifile>
    <docs-code header="dynamic-form.component.html" path="adev/src/content/examples/dynamic-form/src/app/dynamic-form.component.html"/>
    <docs-code header="dynamic-form.component.ts" path="adev/src/content/examples/dynamic-form/src/app/dynamic-form.component.ts"/>
</docs-code-multifile>

### Отображение формы {#display-the-form}

Чтобы отобразить экземпляр динамической формы, shell-шаблон `AppComponent` передаёт массив `questions`, возвращённый `QuestionService`, компоненту-контейнеру формы `<app-dynamic-form>`.

<docs-code header="app.component.ts" path="adev/src/content/examples/dynamic-form/src/app/app.component.ts"/>

Это разделение модели и данных позволяет переиспользовать компоненты для любого типа опроса, пока он совместим с объектной моделью _вопроса_.

### Обеспечение валидных данных {#ensuring-valid-data}

Шаблон формы использует динамическую привязку данных метаданных для рендера формы без каких-либо захардкоженных предположений о конкретных вопросах.
Он динамически добавляет и метаданные controls, и критерии валидации.

Чтобы обеспечить валидный ввод, кнопка _Save_ отключена, пока форма не в валидном состоянии.
Когда форма валидна, нажмите _Save_, и приложение отрендерит текущие значения формы как JSON.

Следующий рисунок показывает финальную форму.

<img alt="Dynamic-Form" src="assets/images/guide/dynamic-form/dynamic-form.png">

## Следующие шаги {#next-steps}

<docs-pill-row>
  <docs-pill title="Validating form input" href="guide/forms/reactive-forms#validating-form-input" />
  <docs-pill title="Form validation guide" href="guide/forms/form-validation" />
</docs-pill-row>
