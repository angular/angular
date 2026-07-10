# Reactive forms

Reactive forms дают model-driven подход к обработке полей формы, значения которых меняются со временем.
В этом руководстве показано, как создать и обновить базовый form control, использовать несколько controls в группе, валидировать значения формы и создавать динамические формы, в которых можно добавлять и удалять controls во время выполнения.

## Обзор reactive forms {#overview-of-reactive-forms}

Reactive forms используют явный и неизменяемый подход к управлению состоянием формы в конкретный момент времени.
Каждое изменение состояния формы возвращает новое состояние, что сохраняет целостность модели между изменениями.
Reactive forms построены вокруг observable-потоков: ввод и значения формы предоставляются как потоки, к которым можно обращаться синхронно.

Reactive forms также упрощают тестирование, потому что данные при запросе согласованы и предсказуемы.
Любые потребители этих потоков могут безопасно манипулировать данными.

Reactive forms отличаются от [template-driven forms](guide/forms/template-driven-forms) по ряду существенных пунктов.
Reactive forms дают синхронный доступ к модели данных, неизменяемость через операторы Observable и отслеживание изменений через observable-потоки.

Template-driven forms позволяют напрямую изменять данные в шаблоне, но менее явны, чем reactive forms: они опираются на директивы в шаблоне и на изменяемые данные для асинхронного отслеживания изменений.
Подробное сравнение двух подходов см. в [обзоре форм](guide/forms).

## Добавление базового form control {#adding-a-basic-form-control}

Чтобы использовать form controls, выполните три шага.

1. Создайте новый компонент и подключите модуль reactive forms. Этот модуль объявляет директивы, необходимые для работы с reactive forms.
1. Создайте экземпляр `FormControl`.
1. Зарегистрируйте `FormControl` в шаблоне.

Затем можно отобразить форму, добавив компонент в шаблон.

Следующие примеры показывают, как добавить один form control.
В примере пользователь вводит имя в поле ввода, значение сохраняется, и отображается текущее значение элемента form control.

<docs-workflow>

<docs-step title="Generate a new component and import the ReactiveFormsModule">
С помощью CLI-команды `ng generate component` создайте компонент в проекте, импортируйте `ReactiveFormsModule` из пакета `@angular/forms` и добавьте его в массив `imports` компонента.

<docs-code header="name-editor.component.ts (excerpt)" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.ts" region="imports" />
</docs-step>

<docs-step title="Declare a FormControl instance">
С помощью конструктора `FormControl` задайте начальное значение — в этом случае пустую строку. Создавая эти controls в классе компонента, вы сразу получаете доступ к прослушиванию, обновлению и валидации состояния поля формы.

<docs-code header="name-editor.component.ts" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.ts" region="create-control"/>
</docs-step>

<docs-step title="Register the control in the template">
После создания control в классе компонента его нужно связать с элементом form control в шаблоне. Обновите шаблон, используя привязку `formControl`, которую предоставляет `FormControlDirective` (также входит в `ReactiveFormsModule`).

<docs-code header="name-editor.component.html" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.html" region="control-binding" />

Благодаря синтаксису привязки в шаблоне form control теперь зарегистрирован на элементе ввода `name`. Form control и DOM-элемент обмениваются данными: представление отражает изменения модели, а модель — изменения представления.
</docs-step>

<docs-step title="Display the component">
`FormControl`, назначенный свойству `name`, отображается, когда компонент `<app-name-editor>` добавляется в шаблон.

<docs-code header="app.component.html (name editor)" path="adev/src/content/examples/reactive-forms/src/app/app.component.1.html" region="app-name-editor"/>
</docs-step>
</docs-workflow>

### Отображение значения form control {#displaying-a-form-control-value}

Значение можно отобразить следующими способами:

- Через Observable `valueChanges`, где можно слушать изменения значения формы в шаблоне с помощью `AsyncPipe` или в классе компонента методом `subscribe()`
- Через свойство `value`, которое даёт снимок текущего значения

Следующий пример показывает, как отобразить текущее значение с помощью интерполяции в шаблоне.

<docs-code header="name-editor.component.html (control value)" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.html" region="display-value"/>

Отображаемое значение меняется при обновлении элемента form control.

Reactive forms дают доступ к информации о control через свойства и методы каждого экземпляра.
Эти свойства и методы базового класса [AbstractControl](api/forms/AbstractControl 'API reference') используются для управления состоянием формы и определения, когда показывать сообщения при [валидации ввода](#validating-form-input 'Learn more about validating form input').

О других свойствах и методах `FormControl` читайте в [справочнике API](api/forms/FormControl 'Detailed syntax reference').

### Замена значения form control {#replacing-a-form-control-value}

В reactive forms есть методы для программного изменения значения control, что позволяет обновлять значение без взаимодействия пользователя.
Экземпляр form control предоставляет метод `setValue()`, который обновляет значение form control и проверяет структуру переданного значения относительно структуры control.
Например, при получении данных формы из backend API или сервиса используйте `setValue()`, чтобы полностью заменить старое значение control новым.

Следующий пример добавляет в класс компонента метод, который обновляет значение control на _Nancy_ с помощью `setValue()`.

<docs-code header="name-editor.component.ts (update value)" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.ts" region="update-value"/>

Обновите шаблон кнопкой, имитирующей обновление имени.
При нажатии кнопки **Update Name** значение, введённое в элемент form control, отражается как текущее значение.

<docs-code header="name-editor.component.html (update value)" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.html" region="update-value"/>

Модель формы — источник истины для control, поэтому при нажатии кнопки значение input меняется в классе компонента, перезаписывая текущее значение.

HELPFUL: В этом примере используется один control.
При использовании `setValue()` с экземпляром [form group](#grouping-form-controls) или [form array](#creating-dynamic-forms) значение должно соответствовать структуре группы или массива.

## Группировка form controls {#grouping-form-controls}

Формы обычно содержат несколько связанных controls.
Reactive forms дают два способа сгруппировать несколько связанных controls в одну форму ввода.

| Form groups | Подробности                                                                                                                                                                                                                                                |
| :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Form group  | Определяет форму с фиксированным набором controls, которыми можно управлять вместе. Основы form group рассматриваются в этом разделе. Также можно [вкладывать form groups](#creating-nested-form-groups 'See more about nesting groups'), чтобы создавать более сложные формы. |
| Form array  | Определяет динамическую форму, в которой можно добавлять и удалять controls во время выполнения. Form arrays также можно вкладывать для более сложных форм. Подробнее об этом варианте см. в разделе [Создание динамических форм](#creating-dynamic-forms).                              |

Как экземпляр form control даёт управление одним полем ввода, так экземпляр form group отслеживает состояние формы для группы экземпляров form control \(например, формы\).
Каждый control в экземпляре form group отслеживается по имени при создании form group.
Следующий пример показывает, как управлять несколькими экземплярами form control в одной группе.

Создайте компонент `ProfileEditor` и импортируйте классы `FormGroup` и `FormControl` из пакета `@angular/forms`.

```shell
ng generate component ProfileEditor
```

<docs-code header="profile-editor.component.ts (imports)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="imports"/>

Чтобы добавить form group в этот компонент, выполните следующие шаги.

1. Создайте экземпляр `FormGroup`.
1. Свяжите модель `FormGroup` и представление.
1. Сохраните данные формы.

<docs-workflow>

<docs-step title="Create a FormGroup instance">
Создайте в классе компонента свойство с именем `profileForm` и присвойте ему новый экземпляр form group. Чтобы инициализировать form group, передайте в конструктор объект с именованными ключами, сопоставленными с их controls.

Для формы профиля добавьте два экземпляра form control с именами `firstName` и `lastName`

<docs-code header="profile-editor.component.ts (form group)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup"/>

Отдельные form controls теперь собраны в группу. Экземпляр `FormGroup` предоставляет значение модели как объект, собранный из значений каждого control в группе. У экземпляра form group те же свойства (например, `value` и `untouched`) и методы (например, `setValue()`), что и у экземпляра form control.
</docs-step>

<docs-step title="Associate the FormGroup model and view">
Form group отслеживает статус и изменения каждого своего control, поэтому если один из controls меняется, родительский control также испускает новый статус или изменение значения. Модель группы поддерживается её участниками. После определения модели нужно обновить шаблон, чтобы отразить модель в представлении.

<docs-code header="profile-editor.component.html (template form group)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="formgroup"/>

Как form group содержит группу controls, так _profileForm_ `FormGroup` привязывается к элементу `form` директивой `FormGroup`, создавая слой связи между моделью и формой с полями ввода. Input `formControlName`, предоставляемый директивой `FormControlName`, привязывает каждый отдельный input к form control, определённому в `FormGroup`. Form controls обмениваются данными со своими элементами. Они также сообщают об изменениях экземпляру form group, который является источником истины для значения модели.
</docs-step>

<docs-step title="Save form data">
Компонент `ProfileEditor` принимает ввод пользователя, но в реальном сценарии нужно захватить значение формы и сделать его доступным для дальнейшей обработки вне компонента. Директива `FormGroup` слушает событие `submit`, испускаемое элементом `form`, и испускает событие `ngSubmit`, которое можно привязать к callback-функции. Добавьте слушатель события `ngSubmit` к тегу `form` с callback-методом `onSubmit()`.

<docs-code header="profile-editor.component.html (submit event)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.html" region="ng-submit"/>

Метод `onSubmit()` в компоненте `ProfileEditor` захватывает текущее значение `profileForm`. Используйте `output()`, чтобы сохранить инкапсуляцию формы и предоставить значение формы вне компонента. В следующем примере `console.warn` записывает сообщение в консоль браузера.

<docs-code header="profile-editor.component.ts (submit method)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="on-submit"/>

Событие `submit` испускается тегом `form` через встроенное DOM-событие. Событие запускается нажатием кнопки с типом `submit`. Это позволяет пользователю нажать клавишу **Enter**, чтобы отправить заполненную форму.

Используйте элемент `button`, чтобы добавить кнопку внизу формы для отправки формы.

<docs-code header="profile-editor.component.html (submit button)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.html" region="submit-button"/>

У кнопки в предыдущем фрагменте также есть привязка `disabled`, которая отключает кнопку, когда `profileForm` невалидна. Пока валидация не выполняется, кнопка всегда включена. Базовая валидация формы рассматривается в разделе [Валидация ввода формы](#validating-form-input).
</docs-step>

<docs-step title="Display the component">
Чтобы отобразить компонент `ProfileEditor` с формой, добавьте его в шаблон компонента.

<docs-code header="app.component.html (profile editor)" path="adev/src/content/examples/reactive-forms/src/app/app.component.1.html" region="app-profile-editor"/>

`ProfileEditor` позволяет управлять экземплярами form control для controls `firstName` и `lastName` внутри экземпляра form group.

### Создание вложенных form groups {#creating-nested-form-groups}

Form groups могут принимать в качестве дочерних элементов как отдельные экземпляры form control, так и другие экземпляры form group.
Это упрощает поддержку сложных моделей форм и логическую группировку.

При создании сложных форм удобнее управлять разными областями информации в меньших секциях.
Вложенный экземпляр form group позволяет разбить большие form groups на более мелкие и управляемые.

Чтобы создать более сложные формы, выполните следующие шаги.

1. Создайте вложенную группу.
1. Сгруппируйте вложенную форму в шаблоне.

Некоторые типы информации естественно относятся к одной группе.
Имя и адрес — типичные примеры таких вложенных групп; они используются в следующих примерах.

<docs-workflow>
<docs-step title="Create a nested group">
Чтобы создать вложенную группу в `profileForm`, добавьте вложенный элемент `address` в экземпляр form group.

<docs-code header="profile-editor.component.ts (nested form group)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="nested-formgroup"/>

В этом примере `address group` объединяет текущие controls `firstName` и `lastName` с новыми controls `street`, `city`, `state` и `zip`. Хотя элемент `address` в form group является дочерним по отношению к общему элементу `profileForm` в form group, те же правила применяются к изменениям значения и статуса. Изменения статуса и значения из вложенной form group распространяются на родительскую form group, сохраняя согласованность с общей моделью.
</docs-step>

<docs-step title="Group the nested form in the template">
После обновления модели в классе компонента обновите шаблон, чтобы связать экземпляр form group и его элементы ввода. Добавьте form group `address` с полями `street`, `city`, `state` и `zip` в шаблон `ProfileEditor`.

<docs-code header="profile-editor.component.html (template nested form group)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="formgroupname"/>

Форма `ProfileEditor` отображается как одна группа, но модель дополнительно разбита, чтобы отражать логические области группировки.

Отобразите значение экземпляра form group в шаблоне компонента с помощью свойства `value` и `JsonPipe`.
</docs-step>
</docs-workflow>

### Обновление частей модели данных {#updating-parts-of-the-data-model}

При обновлении значения экземпляра form group, содержащего несколько controls, может потребоваться обновить только части модели.
В этом разделе рассматривается, как обновлять конкретные части модели данных form control.

Есть два способа обновить значение модели:

| Методы        | Подробности                                                                                                                                                               |
| :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setValue()`   | Задаёт новое значение для отдельного control. Метод `setValue()` строго следует структуре form group и полностью заменяет значение control. |
| `patchValue()` | Заменяет любые свойства, определённые в объекте, которые изменились в модели формы.                                                                                     |

Строгие проверки метода `setValue()` помогают выявлять ошибки вложенности в сложных формах, тогда как `patchValue()` при таких ошибках молча завершается неудачей.

В `ProfileEditorComponent` используйте метод `updateProfile` со следующим примером, чтобы обновить имя и улицу пользователя.

<docs-code header="profile-editor.component.ts (patch value)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="patch-value"/>

Смоделируйте обновление, добавив в шаблон кнопку для обновления профиля пользователя по запросу.

<docs-code header="profile-editor.component.html (update value)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="patch-value"/>

Когда пользователь нажимает кнопку, модель `profileForm` обновляется новыми значениями для `firstName` и `street`. Обратите внимание, что `street` передаётся в объекте внутри свойства `address`.
Это необходимо, потому что метод `patchValue()` применяет обновление относительно структуры модели.
`patchValue()` обновляет только те свойства, которые определены в модели формы.

## Использование сервиса FormBuilder для генерации controls {#using-the-formbuilder-service-to-generate-controls}

Ручное создание экземпляров form control может стать повторяющимся при работе с несколькими формами.
Сервис `FormBuilder` предоставляет удобные методы для генерации controls.

Чтобы воспользоваться этим сервисом, выполните следующие шаги.

1. Импортируйте класс `FormBuilder`.
1. Внедрите сервис `FormBuilder`.
1. Сгенерируйте содержимое формы.

Следующие примеры показывают, как рефакторить компонент `ProfileEditor`, чтобы использовать сервис form builder для создания экземпляров form control и form group.

<docs-workflow>
<docs-step title="Import the FormBuilder class">
Импортируйте класс `FormBuilder` из пакета `@angular/forms`.

<docs-code header="profile-editor.component.ts (import)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-builder-imports"/>

</docs-step>

<docs-step title="Inject the FormBuilder service">
Сервис `FormBuilder` — внедряемый провайдер из модуля reactive forms. Используйте функцию `inject()`, чтобы внедрить эту зависимость в компонент.

<docs-code header="profile-editor.component.ts (property init)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="inject-form-builder"/>

</docs-step>
<docs-step title="Generate form controls">
У сервиса `FormBuilder` три метода: `control()`, `group()` и `array()`. Это фабричные методы для генерации экземпляров в классах компонентов, включая form controls, form groups и form arrays. Используйте метод `group`, чтобы создать controls `profileForm`.

<docs-code header="profile-editor.component.ts (form builder)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-builder"/>

В предыдущем примере метод `group()` используется с тем же объектом для определения свойств в модели. Значение для каждого имени control — массив, в котором первый элемент — начальное значение.

TIP: Можно определить control только с начальным значением, но если controls нуждаются в синхронной или асинхронной валидации, добавьте sync- и async-валидаторы как второй и третий элементы массива. Сравните использование form builder с ручным созданием экземпляров.

  <docs-code-multifile>
    <docs-code header="profile-editor.component.ts (instances)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup-compare"/>
    <docs-code header="profile-editor.component.ts (form builder)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="formgroup-compare"/>
  </docs-code-multifile>
</docs-step>

</docs-workflow>

## Валидация ввода формы {#validating-form-input}

_Валидация формы_ используется, чтобы убедиться, что ввод пользователя полный и корректный.
В этом разделе рассматривается добавление одного валидатора к form control и отображение общего статуса формы.
Валидация формы подробнее описана в руководстве [Валидация форм](guide/forms/form-validation).

Чтобы добавить валидацию формы, выполните следующие шаги.

1. Импортируйте функцию-валидатор в компонент формы.
1. Добавьте валидатор к полю в форме.
1. Добавьте логику обработки статуса валидации.

Самая распространённая валидация — сделать поле обязательным.
Следующий пример показывает, как добавить required-валидацию к control `firstName` и отобразить результат валидации.

<docs-workflow>
<docs-step title="Import a validator function">
Reactive forms включают набор функций-валидаторов для типичных сценариев. Эти функции принимают control для проверки и возвращают объект ошибки или значение null в зависимости от результата проверки.

Импортируйте класс `Validators` из пакета `@angular/forms`.

<docs-code header="profile-editor.component.ts (import)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="validator-imports"/>
</docs-step>

<docs-step title="Make a field required">
В компоненте `ProfileEditor` добавьте статический метод `Validators.required` как второй элемент массива для control `firstName`.

<docs-code header="profile-editor.component.ts (required validator)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="required-validator"/>
</docs-step>

<docs-step title="Display form status">
Когда к form control добавляется обязательное поле, его начальный статус — invalid. Этот невалидный статус распространяется на родительский элемент form group, делая его статус invalid. Текущий статус экземпляра form group доступен через свойство `status`.

Отобразите текущий статус `profileForm` с помощью интерполяции.

<docs-code header="profile-editor.component.html (display status)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.html" region="display-status"/>

Кнопка **Submit** отключена, потому что `profileForm` невалидна из-за обязательного form control `firstName`. После заполнения поля `firstName` форма становится валидной, и кнопка **Submit** включается.

Подробнее о валидации форм см. в руководстве [Валидация форм](guide/forms/form-validation).
</docs-step>
</docs-workflow>

## Создание динамических форм {#creating-dynamic-forms}

`FormArray` — альтернатива `FormGroup` для управления любым числом безымянных controls.
Как и с экземплярами form group, в экземпляры form array можно динамически вставлять и удалять controls, а значение и статус валидации экземпляра form array вычисляются из дочерних controls.
Однако не нужно определять ключ для каждого control по имени, поэтому это отличный вариант, если заранее неизвестно число дочерних значений.

Чтобы определить динамическую форму, выполните следующие шаги.

1. Импортируйте класс `FormArray`.
1. Определите control `FormArray`.
1. Получите доступ к control `FormArray` через getter-метод.
1. Отобразите form array в шаблоне.

Следующий пример показывает, как управлять массивом _aliases_ в `ProfileEditor`.

<docs-workflow>
<docs-step title="Import the `FormArray` class">
Импортируйте класс `FormArray` из `@angular/forms` для информации о типах. Сервис `FormBuilder` готов создать экземпляр `FormArray`.

<docs-code header="profile-editor.component.ts (import)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-array-imports"/>
</docs-step>

<docs-step title="Define a `FormArray` control">
Form array можно инициализировать любым числом controls — от нуля до многих — определив их в массиве. Добавьте свойство `aliases` в экземпляр form group для `profileForm`, чтобы определить form array.

Используйте метод `FormBuilder.array()`, чтобы определить массив, и метод `FormBuilder.control()`, чтобы заполнить массив начальным control.

<docs-code header="profile-editor.component.ts (aliases form array)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="aliases"/>

Control aliases в экземпляре form group теперь заполнен одним control, пока динамически не будут добавлены дополнительные controls.
</docs-step>

<docs-step title="Access the `FormArray` control">
Getter даёт доступ к aliases в экземпляре form array по сравнению с повторным вызовом метода `profileForm.get()` для получения каждого экземпляра. Экземпляр form array представляет неопределённое число controls в массиве. Удобно обращаться к control через getter, и этот подход легко повторить для дополнительных controls. <br />

Используйте синтаксис getter, чтобы создать свойство класса `aliases` для получения form array control alias из родительской form group.

<docs-code header="profile-editor.component.ts (aliases getter)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="aliases-getter"/>

Поскольку возвращаемый control имеет тип `AbstractControl`, нужно явно указать тип, чтобы получить доступ к синтаксису методов экземпляра form array. Определите метод для динамической вставки alias control в form array aliases. Метод `FormArray.push()` вставляет control как новый элемент массива; также можно передать массив controls в FormArray.push(), чтобы зарегистрировать несколько controls сразу.

<docs-code header="profile-editor.component.ts (add alias)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="add-alias"/>

В шаблоне каждый control отображается как отдельное поле ввода.

</docs-step>

<docs-step title="Display the form array in the template">

Чтобы привязать aliases из модели формы, их нужно добавить в шаблон. Аналогично input `formGroupName`, предоставляемому `FormGroupNameDirective`, `formArrayName` связывает обмен данными от экземпляра form array с шаблоном через `FormArrayNameDirective`.

Добавьте следующий HTML шаблона после закрывающего `</div>` элемента `formGroupName`.

<docs-code header="profile-editor.component.html (aliases form array template)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.html" region="formarrayname"/>

Блок `@for` перебирает каждый экземпляр form control, предоставляемый экземпляром form array aliases. Поскольку элементы form array безымянны, индекс присваивается переменной `i` и передаётся каждому control для привязки к input `formControlName`.

Каждый раз, когда добавляется новый экземпляр alias, новому экземпляру form array предоставляется его control на основе индекса. Это позволяет отслеживать каждый отдельный control при вычислении статуса и значения корневого control.

NOTE: В zoneless-приложениях мутация модели reactive forms (например, вызов `FormArray.push()`) не планирует автоматически обнаружение изменений компонента. Если шаблон зависит от структурных изменений модели, таких как `aliases.controls`, убедитесь, что компонент уведомляет Angular о необходимости запустить обнаружение изменений, например связав Observable формы с `ChangeDetectorRef.markForCheck()`:

```ts
import {ChangeDetectorRef, Component, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  /* ... */
})
export class ProfileEditor {
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.profileForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.cdr.markForCheck());
  }
}
```

</docs-step>

### Использование `FormArrayDirective` для form arrays верхнего уровня {#using-formarraydirective-for-top-level-form-arrays}

Можно привязать `FormArray` напрямую к элементу `<form>` с помощью `FormArrayDirective`.  
Это полезно, когда форма не использует `FormGroup` верхнего уровня, а сам массив представляет полную модель формы.

```angular-ts
import {Component} from '@angular/core';
import {FormArray, FormControl} from '@angular/forms';

@Component({
  selector: 'form-array-example',
  template: `
    <form [formArray]="form">
      @for (control of form.controls; track $index) {
        <input [formControlName]="$index" />
      }
    </form>
  `,
})
export class FormArrayExampleComponent {
  controls = [new FormControl('fish'), new FormControl('cat'), new FormControl('dog')];

  form = new FormArray(this.controls);
}
```

<docs-step title="Add an alias">

Изначально форма содержит одно поле `Alias`. Чтобы добавить ещё одно поле, нажмите кнопку **Add Alias**. Также можно проверить массив aliases, сообщаемый моделью формы и отображаемый как `Form Value` внизу шаблона. Вместо экземпляра form control для каждого alias можно составить другой экземпляр form group с дополнительными полями. Процесс определения control для каждого элемента тот же.
</docs-step>

</docs-workflow>

## Единые события изменения состояния control {#unified-control-state-change-events}

Все form controls предоставляют единый поток **событий изменения состояния control** через Observable `events` на `AbstractControl` (`FormControl`, `FormGroup`, `FormArray` и `FormRecord`).
Этот единый поток позволяет реагировать на изменения состояния **value**, **status**, **pristine**, **touched** и **reset**, а также на **действия уровня формы**, такие как **submit**, обрабатывая все обновления одной подпиской вместо подключения нескольких Observable.

### Типы событий {#event-types}

Каждый элемент, испускаемый `events`, — экземпляр конкретного класса события:

- **`ValueChangeEvent`** — когда меняется **value** control.
- **`StatusChangeEvent`** — когда **статус валидации** control обновляется до одного из значений `FormControlStatus` (`VALID`, `INVALID`, `PENDING` или `DISABLED`).
- **`PristineChangeEvent`** — когда меняется состояние **pristine/dirty** control.
- **`TouchedChangeEvent`** — когда меняется состояние **touched/untouched** control.
- **`FormResetEvent`** — когда control или форма сбрасывается через API `reset()` или нативное действие.
- **`FormSubmittedEvent`** — когда форма отправляется.

Все классы событий расширяют `ControlEvent` и включают ссылку `source` на `AbstractControl`, инициировавший изменение, что полезно в больших формах.

```ts
import {Component} from '@angular/core';
import {
  FormControl,
  ValueChangeEvent,
  StatusChangeEvent,
  PristineChangeEvent,
  TouchedChangeEvent,
  FormResetEvent,
  FormSubmittedEvent,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';

@Component(/* ... */)
export class UnifiedEventsBasicComponent {
  form = new FormGroup({
    username: new FormControl(''),
  });

  constructor() {
    this.form.events.subscribe((e) => {
      if (e instanceof ValueChangeEvent) {
        console.log('Value changed to: ', e.value);
      }

      if (e instanceof StatusChangeEvent) {
        console.log('Status changed to: ', e.status);
      }

      if (e instanceof PristineChangeEvent) {
        console.log('Pristine status changed to: ', e.pristine);
      }

      if (e instanceof TouchedChangeEvent) {
        console.log('Touched status changed to: ', e.touched);
      }

      if (e instanceof FormResetEvent) {
        console.log('Form was reset');
      }

      if (e instanceof FormSubmittedEvent) {
        console.log('Form was submitted');
      }
    });
  }
}
```

### Фильтрация конкретных событий {#filtering-specific-events}

Предпочитайте операторы RxJS, когда нужны только определённые типы событий.

```ts
import {filter} from 'rxjs/operators';
import {StatusChangeEvent} from '@angular/forms';

control.events
  .pipe(filter((e) => e instanceof StatusChangeEvent))
  .subscribe((e) => console.log('Status:', e.status));
```

### Объединение вместо нескольких подписок {#unifying-from-multiple-subscriptions}

**До**

```ts
import {combineLatest} from 'rxjs/operators';

combineLatest([control.valueChanges, control.statusChanges]).subscribe(([value, status]) => {
  /* ... */
});
```

**После**

```ts
control.events.subscribe((e) => {
  // Handle ValueChangeEvent, StatusChangeEvent, etc.
});
```

NOTE: При изменении значения emit происходит сразу после обновления значения этого control. Значение родительского control (например, если этот FormControl является частью FormGroup) обновляется позже, поэтому обращение к значению родительского control (через свойство `value`) из callback этого события может вернуть ещё не обновлённое значение. Вместо этого подписывайтесь на `events` родительского control.

## Управление состоянием form control {#managing-form-control-state}

Reactive forms отслеживают состояние control через **touched/untouched** и **pristine/dirty**. Angular обновляет их автоматически при взаимодействии с DOM, но ими также можно управлять программно.

**[`markAsTouched`](api/forms/FormControl#markAsTouched)** — Помечает control или форму как touched при событиях focus и blur, которые не меняют значение. По умолчанию распространяется на родительские controls.

```ts
// Show validation errors after user leaves a field
onEmailBlur() {
  const email = this.form.get('email');
  email.markAsTouched();
}
```

**[`markAsUntouched`](api/forms/FormControl#markAsUntouched)** — Помечает control или форму как untouched. Каскадно применяется ко всем дочерним controls и пересчитывает статус touched всех родительских controls.

```ts
// Reset form state after successful submission
onSubmitSuccess() {
  this.form.markAsUntouched();
  this.form.markAsPristine();
}
```

**[`markAsDirty`](api/forms/FormControl#markAsDirty)** — Помечает control или форму как dirty, то есть значение было изменено. По умолчанию распространяется на родительские controls.

```ts
// Mark programmatically changed values as modified
autofillAddress() {
  const previousAddress = getAddress();
  this.form.patchValue(previousAddress, { emitEvent: false });
  this.form.markAsDirty();
}
```

**[`markAsPristine`](api/forms/FormControl#markAsPristine)** — Помечает control или форму как pristine. Помечает все дочерние controls как pristine и пересчитывает статус pristine всех родительских controls.

```ts
// Reset pristine state after saving to track new changes
saveForm() {
  this.api.save(this.form.value).subscribe(() => {
    this.form.markAsPristine();
  });
}
```

**[`markAllAsDirty`](api/forms/FormControl#markAllAsDirty)** — Помечает control или форму и все их потомки как dirty.

```ts
// Mark imported data as dirty
loadData(data: FormData) {
  this.form.patchValue(data);
  this.form.markAllAsDirty();
}
```

**[`markAllAsTouched`](api/forms/FormControl#markAllAsTouched)** — Помечает control или форму и все их потомки как touched. Полезно для показа ошибок валидации по всей форме.

```ts
// Show all validation errors before submission
onSubmit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
  this.saveForm();
}
```

## Управление испусканием событий и распространением {#controlling-event-emission-and-propagation}

При программном обновлении form controls есть точный контроль над тем, как изменения распространяются по иерархии формы и испускаются ли события.

### Понимание испускания событий {#understanding-event-emission}

По умолчанию `emitEvent: true` — любое изменение control испускает события через Observable `valueChanges` и `statusChanges`. Установка `emitEvent: false` подавляет эти испускания, что полезно при программной установке значений без запуска реактивного поведения вроде автосохранения, избежания циклических обновлений между controls или пакетных обновлений, когда события должны испуститься только один раз в конце.

```ts
@Component({
  /* ... */
})
export class BlogPostEditor {
  postForm = new FormGroup({
    title: new FormControl(''),
    content: new FormControl(''),
  });

  constructor() {
    // Auto-save draft every time user types
    this.postForm.valueChanges.subscribe((formValue) => {
      this.autosaveDraft(formValue);
    });
  }

  loadExistingDraft(savedDraft: {title: string; content: string}) {
    // Restore draft without triggering auto-save
    this.postForm.setValue(savedDraft, {emitEvent: false});
  }
}
```

### Понимание управления распространением {#understanding-propagation-control}

По умолчанию `onlySelf: false` — обновления каскадно применяются к родительским controls, пересчитывая их значения и статус валидации. Установка `onlySelf: true` изолирует обновление текущим control, предотвращая уведомление родителя. Это полезно для пакетных операций, когда родительское обновление нужно запустить вручную один раз.

```ts
updatePostalCodeValidator(country: string) {
  const postal = this.addressForm.get('postalCode');

  const validators = country === 'US'
    ? [Validators.maxLength(5)]
    : [Validators.maxLength(7)];

  postal.setValidators(validators);
  postal.updateValueAndValidity({ onlySelf: true, emitEvent: false });
}
```

HELPFUL: О динамическом управлении валидаторами во время выполнения см. раздел [Управление валидаторами динамически в reactive forms](guide/forms/form-validation#managing-validators-dynamically-in-reactive-forms) в руководстве по валидации форм.

## Утилитарные функции для сужения типов form control {#utility-functions-for-narrowing-form-control-types}

Angular предоставляет четыре утилитарные функции, которые помогают определить конкретный тип `AbstractControl`. Эти функции работают как **type guards** и сужают тип control, когда возвращают `true`, что позволяет безопасно обращаться к свойствам подтипа внутри того же блока.

| Утилитарная функция | Подробности                                             |
| :--------------- | :-------------------------------------------------- |
| `isFormControl`  | Возвращает `true`, когда control — это `FormControl`. |
| `isFormGroup`    | Возвращает `true`, когда control — это `FormGroup`    |
| `isFormRecord`   | Возвращает `true`, когда control — это `FormRecord`   |
| `isFormArray`    | Возвращает `true`, когда control — это `FormArray`    |

Эти помощники особенно полезны в **пользовательских валидаторах**, где сигнатура функции принимает `AbstractControl`, но логика предназначена для конкретного вида control.

```ts
import {AbstractControl, isFormArray} from '@angular/forms';

export function positiveValues(control: AbstractControl) {
  if (!isFormArray(control)) {
    return null; // Not a FormArray: validator is not applicable.
  }

  // Safe to access FormArray-specific API after narrowing.
  const hasNegative = control.controls.some((c) => c.value < 0);
  return hasNegative ? {positiveValues: true} : null;
}
```

## Сводка API reactive forms {#reactive-forms-api-summary}

В следующей таблице перечислены базовые классы и сервисы, используемые для создания и управления reactive form controls.
Полные детали синтаксиса см. в справочной документации API пакета [Forms](api#forms 'API reference').

### Классы {#classes}

| Класс             | Подробности                                                                                                                                                                                 |
| :---------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AbstractControl` | Абстрактный базовый класс для конкретных классов form control `FormControl`, `FormGroup` и `FormArray`. Предоставляет их общее поведение и свойства.                           |
| `FormControl`     | Управляет значением и статусом валидности отдельного form control. Соответствует HTML form control, такому как `<input>` или `<select>`.                                            |
| `FormGroup`       | Управляет значением и состоянием валидности группы экземпляров `AbstractControl`. Свойства группы включают её дочерние controls. Форма верхнего уровня в компоненте — это `FormGroup`. |
| `FormArray`       | Управляет значением и состоянием валидности численно индексированного массива экземпляров `AbstractControl`.                                                                                     |
| `FormBuilder`     | Внедряемый сервис, предоставляющий фабричные методы для создания экземпляров control.                                                                                                     |
| `FormRecord`      | Отслеживает значение и состояние валидности коллекции экземпляров `FormControl`, каждый из которых имеет одинаковый тип значения.                                                                  |

### Директивы {#directives}

| Директива              | Подробности                                                                                    |
| :--------------------- | :----------------------------------------------------------------------------------------- |
| `FormControlDirective` | Синхронизирует автономный экземпляр `FormControl` с элементом form control.                       |
| `FormControlName`      | Синхронизирует `FormControl` в существующем экземпляре `FormGroup` с элементом form control по имени. |
| `FormGroupDirective`   | Синхронизирует существующий экземпляр `FormGroup` с DOM-элементом.                                   |
| `FormGroupName`        | Синхронизирует вложенный экземпляр `FormGroup` с DOM-элементом.                                      |
| `FormArrayName`        | Синхронизирует вложенный экземпляр `FormArray` с DOM-элементом.                                      |
| `FormArrayDirective`   | Синхронизирует автономный экземпляр `FormArray` с DOM-элементом.                                  |
