# Создание template-driven формы

В этом руководстве показано, как создать template-driven форму. Элементы управления формы привязаны к свойствам данных с валидацией ввода. Валидация помогает сохранять целостность данных, а стилизация — улучшать пользовательский опыт.

Template-driven формы используют [двустороннюю привязку данных](guide/templates/two-way-binding), чтобы обновлять модель данных в компоненте при изменениях в шаблоне и наоборот.

<docs-callout helpful title="Template vs Reactive forms">
Angular поддерживает два подхода к интерактивным формам. Template-driven формы позволяют использовать специфичные для форм директивы в шаблоне Angular. Reactive forms дают model-driven подход к построению форм.

Template-driven формы хорошо подходят для небольших или простых форм, а reactive forms более масштабируемы и удобны для сложных форм. Сравнение двух подходов см. в [Выбор подхода](guide/forms#choosing-an-approach)
</docs-callout>

С помощью шаблона Angular можно построить почти любую форму — формы входа, контактные формы и практически любую бизнес-форму.
Элементы управления можно размещать творчески и привязывать к данным объектной модели.
Можно задавать правила валидации и показывать ошибки, условно разрешать ввод из конкретных контролов, включать встроенную визуальную обратную связь и многое другое.

## Цели {#objectives}

Это руководство учит, как:

- Создать форму Angular с компонентом и шаблоном
- Использовать `ngModel` для двусторонней привязки данных для чтения и записи значений input-контролов
- Давать визуальную обратную связь с помощью специальных CSS-классов, отслеживающих состояние контролов
- Показывать пользователям ошибки валидации и условно разрешать ввод из контролов формы на основе статуса формы
- Делиться информацией между HTML-элементами через [template reference variables](guide/templates/variables#template-reference-variables)

## Создание template-driven формы {#build-a-template-driven-form}

Template-driven формы опираются на директивы, определённые в `FormsModule`.

| Директивы      | Описание                                                                                                                                                                                                                                                                         |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NgModel`      | Согласует изменения значения привязанного элемента формы с изменениями модели данных, позволяя реагировать на ввод пользователя валидацией и обработкой ошибок.                                                                                                           |
| `NgForm`       | Создаёт экземпляр `FormGroup` верхнего уровня и привязывает его к элементу `<form>`, чтобы отслеживать агрегированное значение формы и статус валидации. Как только вы импортируете `FormsModule`, эта директива по умолчанию активна на всех тегах `<form>`. Специальный селектор добавлять не нужно. |
| `NgModelGroup` | Создаёт и привязывает экземпляр `FormGroup` к DOM-элементу.                                                                                                                                                                                                                      |

### Обзор шагов {#step-overview}

В ходе этого руководства вы привяжете пример формы к данным и обработаете ввод пользователя по следующим шагам.

1. Создайте базовую форму.
   - Определите пример модели данных
   - Подключите необходимую инфраструктуру, например `FormsModule`
1. Привяжите контролы формы к свойствам данных через директиву `ngModel` и синтаксис двусторонней привязки.
   - Изучите, как `ngModel` сообщает о состояниях контрола через CSS-классы
   - Задайте имена контролам, чтобы они были доступны `ngModel`
1. Отслеживайте валидность ввода и статус контрола через `ngModel`.
   - Добавьте пользовательский CSS для визуальной обратной связи о статусе
   - Показывайте и скрывайте сообщения об ошибках валидации
1. Реагируйте на нативное событие клика HTML-кнопки, добавляя данные в модель.
1. Обработайте отправку формы через output-свойство [`ngSubmit`](api/forms/NgForm#properties) формы.
   - Отключайте кнопку **Submit**, пока форма невалидна
   - После отправки замените заполненную форму другим содержимым на странице

## Создание формы {#build-the-form}

<!-- TODO: link to preview -->
<!-- <docs-code live/> -->

1. В предоставленном примере приложения создаётся класс `Actor`, который определяет модель данных, отражённую в форме.

   <docs-code header="actor.ts" language="typescript" path="adev/src/content/examples/forms/src/app/actor.ts"/>

1. Разметка и детали формы определены в классе `ActorFormComponent`.

   <docs-code header="actor-form.component.ts (v1)" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.ts" region="v1"/>

   Значение `selector` компонента `"app-actor-form"` означает, что форму можно вставить в родительский шаблон тегом `<app-actor-form>`.

1. Следующий код создаёт новый экземпляр актёра, чтобы начальная форма могла показать пример актёра.

   <docs-code language="typescript" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.ts" language="typescript" region="Marilyn"/>

   В этой демонстрации для `model` и `skills` используются фиктивные данные.
   В реальном приложении вы бы внедрили сервис данных для получения и сохранения реальных данных или открыли эти свойства как inputs и outputs.

1. Компонент включает возможность Forms, импортируя модуль `FormsModule`.

   <docs-code language="typescript" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.ts" language="typescript" region="imports"/>

1. Форма отображается в макете приложения, определённом шаблоном корневого компонента.

   <docs-code header="app.component.html" language="html" path="adev/src/content/examples/forms/src/app/app.component.html"/>

   Начальный шаблон задаёт макет формы с двумя группами полей и кнопкой отправки.
   Группы полей соответствуют двум свойствам модели данных Actor: name и studio.
   У каждой группы есть метка и поле для ввода пользователя.
   - У `<input>` **Name** есть HTML5-атрибут `required`
   - У `<input>` **Studio** его нет, потому что `studio` необязателен

   У кнопки **Submit** есть классы для стилизации.
   На этом этапе макет формы — обычный HTML5 без привязок и директив.

1. Пример формы использует несколько классов стилей из [Twitter Bootstrap](https://getbootstrap.com/css): `container`, `form-group`, `form-control` и `btn`.
   Чтобы использовать эти стили, таблица стилей приложения импортирует библиотеку.

   <docs-code header="styles.css" path="adev/src/content/examples/forms/src/styles.1.css"/>

1. Форма требует, чтобы навык актёра выбирался из предопределённого списка `skills`, хранящегося внутри `ActorFormComponent`.
   Цикл Angular `@for` перебирает значения данных, чтобы заполнить элемент `<select>`.

   <docs-code header="actor-form.component.html (skills)" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.html" region="skills"/>

Если запустить приложение прямо сейчас, в элементе выбора виден список навыков.
Элементы ввода ещё не привязаны к значениям данных или событиям, поэтому они пусты и не имеют поведения.

## Привязка input-контролов к свойствам данных {#bind-input-controls-to-data-properties}

Следующий шаг — привязать input-контролы к соответствующим свойствам `Actor` двусторонней привязкой данных, чтобы они реагировали на ввод пользователя обновлением модели данных и на программные изменения данных — обновлением отображения.

Директива `ngModel`, объявленная в `FormsModule`, позволяет привязывать контролы в template-driven форме к свойствам модели данных.
Когда директива включается синтаксисом двусторонней привязки `[(ngModel)]`, Angular может отслеживать значение и взаимодействие пользователя с контролом и синхронизировать представление с моделью.

1. Отредактируйте файл шаблона `actor-form.component.html`.
1. Найдите тег `<input>` рядом с меткой **Name**.
1. Добавьте директиву `ngModel` с синтаксисом двусторонней привязки `[(ngModel)]="..."`.

<docs-code header="actor-form.component.html (excerpt)" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.html" region="ngModelName-1"/>

HELPFUL: В этом примере после каждого тега input временно стоит диагностическая интерполяция `{{model.name}}`, чтобы показать текущее значение соответствующего свойства. Комментарий напоминает удалить диагностические строки, когда вы закончите наблюдать работу двусторонней привязки.

### Доступ к общему статусу формы {#access-the-overall-form-status}

Когда вы импортировали `FormsModule` в компонент, Angular автоматически создал и прикрепил директиву [NgForm](api/forms/NgForm) к тегу `<form>` в шаблоне (потому что у `NgForm` селектор `form`, совпадающий с элементами `<form>`).

Чтобы получить доступ к `NgForm` и общему статусу формы, объявите [template reference variable](guide/templates/variables#template-reference-variables).

1. Отредактируйте файл шаблона `actor-form.component.html`.
1. Обновите тег `<form>` template reference variable `#actorForm` и задайте её значение следующим образом.

   <docs-code header="actor-form.component.html (excerpt)" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.html" region="template-variable"/>

   Template variable `actorForm` теперь ссылается на экземпляр директивы `NgForm`, управляющий формой в целом.

1. Запустите приложение.
1. Начните вводить текст в поле **Name**.

   По мере добавления и удаления символов вы видите, как они появляются и исчезают в модели данных.

Диагностическая строка с интерполированными значениями показывает, что значения действительно текут из поля ввода в модель и обратно.

### Именование элементов управления {#naming-control-elements}

Когда на элементе используется `[(ngModel)]`, для этого элемента нужно определить атрибут `name`.
Angular использует назначенное имя, чтобы зарегистрировать элемент у директивы `NgForm`, прикреплённой к родительскому элементу `<form>`.

В примере к элементу `<input>` добавлен атрибут `name` со значением "name", что логично для имени актёра.
Подойдёт любое уникальное значение, но описательное имя удобнее.

1. Добавьте аналогичные привязки `[(ngModel)]` и атрибуты `name` к **Studio** и **Skill**.
1. Теперь можно удалить диагностические сообщения с интерполированными значениями.
1. Чтобы подтвердить, что двусторонняя привязка работает для всей модели актёра, добавьте в начало шаблона компонента новую текстовую привязку с pipe [`json`](api/common/JsonPipe), которая сериализует данные в строку.

После этих правок шаблон формы должен выглядеть так:

<docs-code header="actor-form.component.html (excerpt)" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.html" region="ngModel-2"/>

Обратите внимание:

- У каждого элемента `<input>` есть свойство `id`.
  Его использует атрибут `for` элемента `<label>`, чтобы связать метку с input-контролом.
  Это [стандартная возможность HTML](https://developer.mozilla.org/docs/Web/HTML/Element/label).

- У каждого элемента `<input>` также есть обязательное свойство `name`, которое Angular использует для регистрации контрола в форме.

Когда вы наблюдали эффекты, текстовую привязку `{{ model | json }}` можно удалить.

## Отслеживание состояний формы {#track-form-states}

Angular применяет класс `ng-submitted` к элементам `form` после отправки формы. Этот класс можно использовать, чтобы изменить стиль формы после отправки.

## Отслеживание состояний контрола {#track-control-states}

Добавление директивы `NgModel` к контролу добавляет к нему имена классов, описывающие его состояние.
Эти классы можно использовать, чтобы менять стиль контрола в зависимости от состояния.

В следующей таблице описаны имена классов, которые Angular применяет в зависимости от состояния контрола.

| Состояния                           | Класс если true | Класс если false |
| :------------------------------- | :------------ | :------------- |
| Контрол был посещён.    | `ng-touched`  | `ng-untouched` |
| Значение контрола изменилось. | `ng-dirty`    | `ng-pristine`  |
| Значение контрола валидно.    | `ng-valid`    | `ng-invalid`   |

Angular также применяет класс `ng-submitted` к элементам `form` при отправке, но не к контролам внутри элемента `form`.

Эти CSS-классы используют, чтобы задать стили контрола в зависимости от его статуса.

### Наблюдение за состояниями контрола {#observe-control-states}

Чтобы увидеть, как фреймворк добавляет и удаляет классы, откройте инструменты разработчика браузера и осмотрите элемент `<input>`, представляющий имя актёра.

1. С помощью инструментов разработчика браузера найдите элемент `<input>`, соответствующий полю **Name**.
   Видно, что у элемента несколько CSS-классов в дополнение к "form-control".

1. При первом открытии классы указывают, что значение валидно, не менялось с инициализации или сброса и контрол не посещался с инициализации или сброса.

   ```html
   <input class="form-control ng-untouched ng-pristine ng-valid" />
   ```

1. Выполните следующие действия с полем **Name** `<input>` и наблюдайте, какие классы появляются.
   - Посмотрите, но не трогайте.
     Классы указывают, что контрол untouched, pristine и valid.

   - Кликните внутри поля имени, затем кликните снаружи.
     Контрол теперь посещён, и у элемента класс `ng-touched` вместо `ng-untouched`.

   - Добавьте слэши в конец имени.
     Теперь контрол touched и dirty.

   - Сотрите имя.
     Значение становится невалидным, поэтому класс `ng-invalid` заменяет `ng-valid`.

### Визуальная обратная связь для состояний {#create-visual-feedback-for-states}

Пара `ng-valid`/`ng-invalid` особенно интересна, потому что при невалидных значениях нужен
сильный визуальный сигнал.
Также нужно отмечать обязательные поля.

Обязательные поля и невалидные данные можно отметить одновременно цветной полосой
слева от поля ввода.

Чтобы изменить внешний вид таким образом, выполните следующие шаги.

1. Добавьте определения для CSS-классов `ng-*`.
1. Добавьте эти определения классов в новый файл `forms.css`.
1. Добавьте новый файл в проект рядом с `index.html`:

   <docs-code header="forms.css" language="css" path="adev/src/content/examples/forms/src/assets/forms.css"/>

1. В файле `index.html` обновите тег `<head>`, чтобы подключить новую таблицу стилей.

   <docs-code header="index.html (styles)" path="adev/src/content/examples/forms/src/index.html" region="styles"/>

### Показ и скрытие сообщений об ошибках валидации {#show-and-hide-validation-error-messages}

Поле **Name** обязательно, и его очистка делает полосу красной.
Это указывает, что что-то не так, но пользователь не знает, что именно и что делать.
Можно дать полезное сообщение, проверяя состояние контрола и реагируя на него.

Выпадающий список **Skill** тоже обязателен, но ему не нужна такая обработка ошибок, потому что список уже ограничивает выбор валидными значениями.

Чтобы определить и показать сообщение об ошибке в нужный момент, выполните следующие шаги.

<docs-workflow>
<docs-step title="Add a local reference to the input">
Расширьте тег `input` template reference variable, чтобы из шаблона обращаться к Angular-контролу поля ввода. В примере переменная — `#name="ngModel"`.

Template reference variable (`#name`) задаётся как `"ngModel"`, потому что это значение свойства [`NgModel.exportAs`](api/core/Directive#exportAs). Это свойство говорит Angular, как связать reference variable с директивой.
</docs-step>

<docs-step title="Add the error message">
Добавьте `<div>` с подходящим сообщением об ошибке.
</docs-step>

<docs-step title="Make the error message conditional">
Показывайте или скрывайте сообщение об ошибке, привязав свойства контрола `name` к свойству `hidden` элемента `<div>` сообщения.
</docs-step>

<docs-code header="actor-form.component.html (hidden-error-msg)" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.html" region="hidden-error-msg"/>

<docs-step title="Add a conditional error message to name">
Добавьте условное сообщение об ошибке к полю `name`, как в следующем примере.

<docs-code header="actor-form.component.html (excerpt)" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.html" region="name-with-error-msg"/>
</docs-step>
</docs-workflow>

<docs-callout title='Illustrating the "pristine" state'>

В этом примере сообщение скрывается, когда контрол либо валиден, либо _pristine_.
Pristine означает, что пользователь не менял значение с момента отображения в этой форме.
Если игнорировать состояние `pristine`, сообщение скрывалось бы только при валидном значении.
Если попасть в этот компонент с новым пустым актёром или невалидным актёром, сообщение об ошибке появится сразу, до любых действий.

Возможно, сообщение нужно показывать только когда пользователь делает невалидное изменение.
Скрытие сообщения, пока контрол в состоянии `pristine`, достигает этой цели.
Значимость этого выбора станет ясна, когда в следующем шаге вы добавите нового актёра в форму.

</docs-callout>

## Добавление нового актёра {#add-a-new-actor}

Это упражнение показывает, как реагировать на нативное событие клика HTML-кнопки, добавляя данные в модель.
Чтобы пользователи формы могли добавить нового актёра, добавьте кнопку **New Actor**, реагирующую на событие click.

1. В шаблоне разместите элемент `<button>` "New Actor" внизу формы.
1. В файле компонента добавьте метод создания актёра в модель данных актёра.

   <docs-code header="actor-form.component.ts (New Actor method)" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.ts" region="new-actor"/>

1. Привяжите событие click кнопки к методу создания актёра `newActor()`.

   <docs-code header="actor-form.component.html (New Actor button)" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.html" region="new-actor-button-no-reset"/>

1. Снова запустите приложение и нажмите кнопку **New Actor**.

   Форма очищается, и _обязательные_ полосы слева от полей ввода красные, указывая на невалидные свойства `name` и `skill`.
   Обратите внимание, что сообщения об ошибках скрыты.
   Это потому, что форма pristine: вы ещё ничего не меняли.

1. Введите имя и снова нажмите **New Actor**.

   Теперь приложение показывает сообщение об ошибке `Name is required`, потому что поле ввода больше не pristine.
   Форма помнит, что вы вводили имя до нажатия **New Actor**.

1. Чтобы восстановить pristine-состояние контролов формы, сбросьте все флаги императивно, вызвав метод формы `reset()` после вызова `newActor()`.

   <docs-code header="actor-form.component.html (Reset the form)" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.html" region="new-actor-button-form-reset"/>

   Теперь нажатие **New Actor** сбрасывает и форму, и флаги её контролов.

## Отправка формы с `ngSubmit` {#submit-the-form-with-ngsubmit}

Пользователь должен иметь возможность отправить эту форму после заполнения.
Кнопка **Submit** внизу формы сама по себе ничего не делает, но запускает событие отправки формы из-за своего типа (`type="submit"`).

Чтобы отреагировать на это событие, выполните следующие шаги.

<docs-workflow>

<docs-step title="Listen to ngOnSubmit">
Привяжите событие [`ngSubmit`](api/forms/NgForm#properties) формы к методу `onSubmit()` компонента actor-form.

<docs-code header="actor-form.component.html (ngSubmit)" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.html" region="ngSubmit"/>
</docs-step>

<docs-step title="Bind the disabled property">
Используйте template reference variable `#actorForm`, чтобы получить доступ к форме, содержащей кнопку **Submit**, и создайте привязку события.

Привяжите свойство формы, указывающее на её общую валидность, к свойству `disabled` кнопки **Submit**.

<docs-code header="actor-form.component.html (submit-button)" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.html" region="submit-button"/>
</docs-step>

<docs-step title="Run the application">
Обратите внимание, что кнопка включена — хотя пока ничего полезного не делает.
</docs-step>

<docs-step title="Delete the Name value">
Это нарушает правило "required", поэтому показывается сообщение об ошибке — и обратите внимание, что кнопка **Submit** также отключается.

Не пришлось явно связывать состояние включения кнопки с валидностью формы.
`FormsModule` сделал это автоматически, когда вы определили template reference variable на расширенном элементе формы, а затем сослались на эту переменную в контроле кнопки.
</docs-step>
</docs-workflow>

### Реакция на отправку формы {#respond-to-form-submission}

Чтобы показать реакцию на отправку формы, можно скрыть область ввода данных и отобразить что-то другое на её месте.

<docs-workflow>
<docs-step title="Wrap the form">
Оберните всю форму в `<div>` и привяжите его свойство `hidden` к свойству `ActorFormComponent.submitted`.

<docs-code header="actor-form.component.html (excerpt)" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.html" region="edit-div"/>

Основная форма видна с самого начала, потому что свойство `submitted` равно false, пока вы не отправите форму, как показывает этот фрагмент из `ActorFormComponent`:

<docs-code header="actor-form.component.ts (submitted)" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.ts" region="submitted"/>

Когда вы нажимаете кнопку **Submit**, флаг `submitted` становится true, и форма исчезает.
</docs-step>

<docs-step title="Add the submitted state">
Чтобы показать что-то другое, пока форма в состоянии submitted, добавьте следующий HTML ниже новой обёртки `<div>`.

<docs-code header="actor-form.component.html (excerpt)" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.html" region="submitted"/>

Этот `<div>`, показывающий актёра только для чтения с интерполяционными привязками, появляется только пока компонент в состоянии submitted.

Альтернативное отображение включает кнопку _Edit_, событие click которой привязано к выражению, сбрасывающему флаг `submitted`.
</docs-step>

<docs-step title="Test the Edit button">
Нажмите кнопку *Edit*, чтобы вернуть отображение к редактируемой форме.
</docs-step>
</docs-workflow>

## Итог {#summary}

Форма Angular, рассмотренная на этой странице, использует следующие
возможности фреймворка для поддержки изменения данных, валидации и многого другого.

- HTML-шаблон формы Angular
- Класс компонента формы с декоратором `@Component`
- Обработка отправки формы привязкой к событию `NgForm.ngSubmit`
- Template-reference variables, такие как `#actorForm` и `#name`
- Синтаксис `[(ngModel)]` для двусторонней привязки данных
- Использование атрибутов `name` для валидации и отслеживания изменений элементов формы
- Свойство `valid` reference variable на input-контролах указывает, валиден ли контрол или нужно показать сообщения об ошибках
- Управление состоянием включения кнопки **Submit** привязкой к валидности `NgForm`
- Пользовательские CSS-классы, дающие пользователям визуальную обратную связь о невалидных контролах

Вот код финальной версии приложения:

<docs-code-multifile>
    <docs-code header="actor-form.component.ts" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.ts" region="final"/>
    <docs-code header="actor-form.component.html" path="adev/src/content/examples/forms/src/app/actor-form/actor-form.component.html" region="final"/>
    <docs-code header="actor.ts" path="adev/src/content/examples/forms/src/app/actor.ts"/>
    <docs-code header="app.component.html" path="adev/src/content/examples/forms/src/app/app.component.html"/>
    <docs-code header="app.component.ts" path="adev/src/content/examples/forms/src/app/app.component.ts"/>
    <docs-code header="main.ts" path="adev/src/content/examples/forms/src/main.ts"/>
    <docs-code header="forms.css" path="adev/src/content/examples/forms/src/assets/forms.css"/>
</docs-code-multifile>
