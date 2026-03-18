# Реактивные формы

Реактивные формы предоставляют управляемый моделью подход к обработке вводимых данных формы, значения которых изменяются со временем.
В этом руководстве показано, как создать и обновить базовый элемент управления формы, перейти к использованию нескольких элементов управления в группе, валидировать значения формы и создавать динамические формы, в которых можно добавлять или удалять элементы управления во время выполнения.

## Обзор реактивных форм {#overview-of-reactive-forms}

Реактивные формы используют явный и неизменяемый подход к управлению состоянием формы в заданный момент времени.
Каждое изменение состояния формы возвращает новое состояние, которое поддерживает целостность модели между изменениями.
Реактивные формы построены на потоках Observable, где входные данные и значения формы предоставляются как потоки входных значений, к которым можно получить доступ синхронно.

Реактивные формы также обеспечивают простой путь к тестированию, поскольку у вас есть гарантия согласованности и предсказуемости данных при запросе.
Любые потребители потоков имеют доступ к безопасному управлению этими данными.

Реактивные формы отличаются от [форм на основе шаблонов](guide/forms/template-driven-forms) по ряду параметров.
Реактивные формы обеспечивают синхронный доступ к модели данных, неизменяемость с операторами Observable и отслеживание изменений через потоки Observable.

Формы на основе шаблонов позволяют напрямую изменять данные в шаблоне, но менее явны, чем реактивные формы, поскольку полагаются на директивы, встроенные в шаблон, и изменяемые данные для асинхронного отслеживания изменений.
Подробное сравнение двух парадигм см. в разделе [Обзор форм](guide/forms).

## Добавление базового элемента управления формы {#adding-a-basic-form-control}

Использование элементов управления формы состоит из трёх шагов.

1. Создайте новый компонент и зарегистрируйте модуль реактивных форм. Этот модуль объявляет директивы реактивных форм, необходимые для их использования.
1. Создайте экземпляр нового `FormControl`.
1. Зарегистрируйте `FormControl` в шаблоне.

После этого можно отобразить форму, добавив компонент в шаблон.

Следующие примеры показывают, как добавить один элемент управления формы.
В примере пользователь вводит своё имя в поле ввода, захватывает это значение ввода и отображает текущее значение элемента управления формы.

<docs-workflow>

<docs-step title="Generate a new component and import the ReactiveFormsModule">
Используйте команду CLI `ng generate component` для создания компонента в вашем проекте и импортируйте `ReactiveFormsModule` из пакета `@angular/forms`, добавив его в массив `imports` вашего компонента.

<docs-code header="name-editor.component.ts (фрагмент)" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.ts" region="imports" />
</docs-step>

<docs-step title="Declare a FormControl instance">
Используйте конструктор `FormControl` для установки его начального значения, которое в данном случае является пустой строкой. Создавая эти элементы управления в классе компонента, вы получаете немедленный доступ для прослушивания, обновления и валидации состояния ввода формы.

<docs-code header="name-editor.component.ts" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.ts" region="create-control"/>
</docs-step>

<docs-step title="Register the control in the template">
После создания элемента управления в классе компонента необходимо связать его с элементом управления формы в шаблоне. Обновите шаблон с привязкой элемента управления формы с помощью привязки `formControl`, предоставляемой `FormControlDirective`, которая также включена в `ReactiveFormsModule`.

<docs-code header="name-editor.component.html" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.html" region="control-binding" />

Используя синтаксис привязки шаблона, элемент управления формы теперь зарегистрирован на элементе ввода `name` в шаблоне. Элемент управления формы и DOM-элемент взаимодействуют друг с другом: представление отражает изменения в модели, а модель отражает изменения в представлении.
</docs-step>

<docs-step title="Display the component">
`FormControl`, назначенный свойству `name`, отображается при добавлении компонента `<app-name-editor>` в шаблон.

<docs-code header="app.component.html (редактор имени)" path="adev/src/content/examples/reactive-forms/src/app/app.component.1.html" region="app-name-editor"/>
</docs-step>
</docs-workflow>

### Отображение значения элемента управления формы {#displaying-a-form-control-value}

Значение можно отобразить следующими способами.

- Через Observable `valueChanges`, где можно прослушивать изменения значения формы в шаблоне с помощью `AsyncPipe` или в классе компонента с помощью метода `subscribe()`
- С помощью свойства `value`, которое даёт моментальный снимок текущего значения

Следующий пример показывает, как отобразить текущее значение с помощью интерполяции в шаблоне.

<docs-code header="name-editor.component.html (значение элемента управления)" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.html" region="display-value"/>

Отображаемое значение изменяется при обновлении элемента управления формы.

Реактивные формы предоставляют доступ к информации о конкретном элементе управления через свойства и методы каждого экземпляра.
Эти свойства и методы базового класса [AbstractControl](api/forms/AbstractControl 'Справочник API') используются для управления состоянием формы и определения времени отображения сообщений при обработке [валидации ввода](#validating-form-input 'Узнайте больше о валидации ввода формы').

Подробнее о других свойствах и методах `FormControl` читайте в [Справочнике API](api/forms/FormControl 'Подробный справочник синтаксиса').

### Замена значения элемента управления формы {#replacing-a-form-control-value}

Реактивные формы имеют методы для программного изменения значения элемента управления, что даёт гибкость для обновления значения без взаимодействия с пользователем.
Экземпляр элемента управления формы предоставляет метод `setValue()`, который обновляет значение элемента управления формы и валидирует структуру предоставленного значения по отношению к структуре элемента управления.
Например, при получении данных формы из бэкенд-API или сервиса используйте метод `setValue()` для обновления элемента управления до нового значения, полностью заменяя старое значение.

Следующий пример добавляет метод в класс компонента для обновления значения элемента управления до _Nancy_ с помощью метода `setValue()`.

<docs-code header="name-editor.component.ts (обновление значения)" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.ts" region="update-value"/>

Обновите шаблон кнопкой для имитации обновления имени.
При нажатии кнопки **Обновить имя** значение, введённое в элемент управления формы, отражается как текущее значение.

<docs-code header="name-editor.component.html (обновление значения)" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.html" region="update-value"/>

Модель формы является источником истины для элемента управления, поэтому при нажатии кнопки значение ввода изменяется в классе компонента, переопределяя текущее значение.

HELPFUL: В этом примере используется один элемент управления.
При использовании метода `setValue()` с экземпляром [группы форм](#grouping-form-controls) или [массива форм](#creating-dynamic-forms) значение должно соответствовать структуре группы или массива.

## Группировка элементов управления формы {#grouping-form-controls}

Формы обычно содержат несколько связанных элементов управления.
Реактивные формы предоставляют два способа группировки нескольких связанных элементов управления в единую форму ввода.

| Группы форм  | Подробности                                                                                                                                                                                                                                           |
| :----------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FormGroup    | Определяет форму с фиксированным набором элементов управления, которыми можно управлять совместно. Основы FormGroup рассматриваются в этом разделе. Вы также можете [вкладывать FormGroup](#creating-nested-form-groups 'Подробнее о вложении групп') для создания более сложных форм. |
| FormArray    | Определяет динамическую форму, в которой можно добавлять и удалять элементы управления во время выполнения. Вы также можете вкладывать массивы форм для создания более сложных форм. Подробнее об этом варианте см. в разделе [Создание динамических форм](#creating-dynamic-forms). |

Подобно тому, как экземпляр элемента управления формы даёт контроль над одним полем ввода, экземпляр FormGroup отслеживает состояние формы группы экземпляров элементов управления формы \(например, формы\).
Каждый элемент управления в экземпляре FormGroup отслеживается по имени при создании группы форм.
Следующий пример показывает, как управлять несколькими экземплярами элементов управления формы в одной группе.

Создайте компонент `ProfileEditor` и импортируйте классы `FormGroup` и `FormControl` из пакета `@angular/forms`.

```shell
ng generate component ProfileEditor
```

<docs-code header="profile-editor.component.ts (импорты)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="imports"/>

Чтобы добавить группу форм в этот компонент, выполните следующие шаги.

1. Создайте экземпляр `FormGroup`.
1. Свяжите модель и представление `FormGroup`.
1. Сохраните данные формы.

<docs-workflow>

<docs-step title="Create a FormGroup instance">
Создайте свойство в классе компонента с именем `profileForm` и установите его в новый экземпляр группы форм. Для инициализации группы форм предоставьте конструктору объект именованных ключей, сопоставленных с их элементами управления.

Для формы профиля добавьте два экземпляра элементов управления формы с именами `firstName` и `lastName`

<docs-code header="profile-editor.component.ts (группа форм)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup"/>

Отдельные элементы управления формы теперь собраны в группу. Экземпляр `FormGroup` предоставляет своё значение модели в виде объекта, составленного из значений каждого элемента управления в группе. Экземпляр FormGroup имеет те же свойства (такие как `value` и `untouched`) и методы (такие как `setValue()`), что и экземпляр элемента управления формы.
</docs-step>

<docs-step title="Associate the FormGroup model and view">
FormGroup отслеживает статус и изменения для каждого из своих элементов управления, поэтому если один из них изменится, родительский элемент управления также испустит новый статус или изменение значения. Модель для группы поддерживается её членами. После определения модели необходимо обновить шаблон для отражения модели в представлении.

<docs-code header="profile-editor.component.html (шаблон группы форм)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="formgroup"/>

Подобно тому, как FormGroup содержит группу элементов управления, `FormGroup` _profileForm_ привязан к элементу `form` с директивой `FormGroup`, создавая коммуникационный уровень между моделью и формой, содержащей вводы. Ввод `formControlName`, предоставляемый директивой `FormControlName`, связывает каждый отдельный ввод с элементом управления формы, определённым в `FormGroup`. Элементы управления формы взаимодействуют с соответствующими им элементами. Они также сообщают об изменениях экземпляру FormGroup, который является источником истины для значения модели.
</docs-step>

<docs-step title="Save form data">
Компонент `ProfileEditor` принимает ввод от пользователя, но в реальном сценарии вы хотите захватить значение формы и сделать его доступным для дальнейшей обработки вне компонента. Директива `FormGroup` прослушивает событие `submit`, испускаемое элементом `form`, и испускает событие `ngSubmit`, которое можно привязать к функции обратного вызова. Добавьте прослушиватель события `ngSubmit` к тегу `form` с методом обратного вызова `onSubmit()`.

<docs-code header="profile-editor.component.html (событие отправки)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.html" region="ng-submit"/>

Метод `onSubmit()` в компоненте `ProfileEditor` захватывает текущее значение `profileForm`. Используйте `EventEmitter` для сохранения инкапсуляции формы и предоставления её значения вне компонента. Следующий пример использует `console.warn` для записи сообщения в консоль браузера.

<docs-code header="profile-editor.component.ts (метод отправки)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="on-submit"/>

Событие `submit` испускается тегом `form` с помощью встроенного DOM-события. Вы инициируете событие, нажимая кнопку с типом `submit`. Это позволяет пользователю нажать клавишу **Enter** для отправки заполненной формы.

Используйте элемент `button` для добавления кнопки внизу формы для инициирования отправки формы.

<docs-code header="profile-editor.component.html (кнопка отправки)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.html" region="submit-button"/>

Кнопка в приведённом фрагменте также имеет привязку `disabled` для отключения кнопки, когда `profileForm` недействителен. Валидация ещё не выполняется, поэтому кнопка всегда активна. Базовая валидация формы рассматривается в разделе [Валидация ввода формы](#validating-form-input).
</docs-step>

<docs-step title="Display the component">
Для отображения компонента `ProfileEditor`, содержащего форму, добавьте его в шаблон компонента.

<docs-code header="app.component.html (редактор профиля)" path="adev/src/content/examples/reactive-forms/src/app/app.component.1.html" region="app-profile-editor"/>

`ProfileEditor` позволяет управлять экземплярами элементов управления формы `firstName` и `lastName` в экземпляре группы форм.

### Создание вложенных групп форм {#creating-nested-form-groups}

FormGroup может принимать как отдельные экземпляры элементов управления формы, так и другие экземпляры FormGroup в качестве дочерних.
Это упрощает составление сложных моделей форм и облегчает их логическую группировку.

При создании сложных форм управлять различными областями информации проще в меньших разделах.
Использование вложенного экземпляра FormGroup позволяет разбить большие группы форм на более мелкие и управляемые.

Для создания более сложных форм выполните следующие шаги.

1. Создайте вложенную группу.
1. Сгруппируйте вложенную форму в шаблоне.

Некоторые типы информации естественно относятся к одной группе.
Имя и адрес — типичные примеры таких вложенных групп, которые используются в следующих примерах.

<docs-workflow>
<docs-step title="Create a nested group">
Для создания вложенной группы в `profileForm` добавьте вложенный элемент `address` в экземпляр группы форм.

<docs-code header="profile-editor.component.ts (вложенная группа форм)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="nested-formgroup"/>

В этом примере `address group` объединяет текущие элементы управления `firstName` и `lastName` с новыми элементами управления `street`, `city`, `state` и `zip`. Несмотря на то что элемент `address` в группе форм является дочерним по отношению к общему элементу `profileForm` в группе форм, к нему применяются те же правила в отношении изменений значения и статуса. Изменения статуса и значения из вложенной группы форм распространяются в родительскую группу форм, сохраняя согласованность с общей моделью.
</docs-step>

<docs-step title="Group the nested form in the template">
После обновления модели в классе компонента обновите шаблон для подключения экземпляра группы форм и его элементов ввода. Добавьте группу форм `address`, содержащую поля `street`, `city`, `state` и `zip`, в шаблон `ProfileEditor`.

<docs-code header="profile-editor.component.html (шаблон вложенной группы форм)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="formgroupname"/>

Форма `ProfileEditor` отображается как одна группа, но модель разбита далее для представления логических областей группировки.

Отобразите значение для экземпляра группы форм в шаблоне компонента, используя свойство `value` и `JsonPipe`.
</docs-step>
</docs-workflow>

### Обновление частей модели данных {#updating-parts-of-the-data-model}

При обновлении значения для экземпляра FormGroup, содержащего несколько элементов управления, вы можете захотеть обновить только части модели.
В этом разделе рассматривается обновление конкретных частей модели данных элемента управления формы.

Есть два способа обновить значение модели:

| Методы         | Подробности                                                                                                                                                                                   |
| :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setValue()`   | Устанавливает новое значение для отдельного элемента управления. Метод `setValue()` строго соответствует структуре группы форм и полностью заменяет значение элемента управления.            |
| `patchValue()` | Заменяет любые свойства, определённые в объекте, которые изменились в модели формы.                                                                                                          |

Строгие проверки метода `setValue()` помогают выявлять ошибки вложенности в сложных формах, тогда как `patchValue()` молча игнорирует такие ошибки.

В `ProfileEditorComponent` используйте метод `updateProfile` из следующего примера для обновления имени и адреса улицы пользователя.

<docs-code header="profile-editor.component.ts (patch value)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="patch-value"/>

Имитируйте обновление, добавив кнопку в шаблон для обновления профиля пользователя по запросу.

<docs-code header="profile-editor.component.html (обновление значения)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="patch-value"/>

При нажатии пользователем кнопки модель `profileForm` обновляется новыми значениями для `firstName` и `street`. Обратите внимание, что `street` предоставляется в объекте внутри свойства `address`.
Это необходимо, поскольку метод `patchValue()` применяет обновление к структуре модели.
`PatchValue()` обновляет только те свойства, которые определены в модели формы.

## Использование сервиса FormBuilder для генерации элементов управления {#using-the-formbuilder-service-to-generate-controls}

Ручное создание экземпляров элементов управления формы может стать повторяющимся при работе с несколькими формами.
Сервис `FormBuilder` предоставляет удобные методы для генерации элементов управления.

Для использования этого сервиса выполните следующие шаги.

1. Импортируйте класс `FormBuilder`.
1. Внедрите сервис `FormBuilder`.
1. Генерируйте содержимое формы.

Следующие примеры показывают, как переработать компонент `ProfileEditor` для использования сервиса form builder при создании экземпляров элементов управления и групп форм.

<docs-workflow>
<docs-step title="Import the FormBuilder class">
Импортируйте класс `FormBuilder` из пакета `@angular/forms`.

<docs-code header="profile-editor.component.ts (импорт)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-builder-imports"/>

</docs-step>

<docs-step title="Inject the FormBuilder service">
Сервис `FormBuilder` является внедряемым провайдером из модуля реактивных форм. Используйте функцию `inject()` для внедрения этой зависимости в ваш компонент.

<docs-code header="profile-editor.component.ts (инициализация свойства)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="inject-form-builder"/>

</docs-step>
<docs-step title="Generate form controls">
Сервис `FormBuilder` имеет три метода: `control()`, `group()` и `array()`. Это фабричные методы для генерации экземпляров в классах компонентов, включая элементы управления формы, группы форм и массивы форм. Используйте метод `group` для создания элементов управления `profileForm`.

<docs-code header="profile-editor.component.ts (form builder)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-builder"/>

В приведённом примере вы используете метод `group()` с тем же объектом для определения свойств в модели. Значение для каждого имени элемента управления — это массив, содержащий начальное значение в качестве первого элемента.

TIP: Вы можете определить элемент управления только с начальным значением, но если вашим элементам управления нужна синхронная или асинхронная валидация, добавьте синхронные и асинхронные валидаторы в качестве второго и третьего элементов массива. Сравните использование form builder с созданием экземпляров вручную.

  <docs-code-multifile>
    <docs-code header="profile-editor.component.ts (экземпляры)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup-compare"/>
    <docs-code header="profile-editor.component.ts (form builder)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="formgroup-compare"/>
  </docs-code-multifile>
</docs-step>

</docs-workflow>

## Валидация ввода формы {#validating-form-input}

_Валидация формы_ используется для обеспечения полноты и корректности ввода пользователя.
В этом разделе рассматривается добавление одного валидатора к элементу управления формы и отображение общего статуса формы.
Валидация форм более подробно рассматривается в руководстве [Валидация форм](guide/forms/form-validation).

Для добавления валидации формы выполните следующие шаги.

1. Импортируйте функцию валидатора в компонент формы.
1. Добавьте валидатор в поле формы.
1. Добавьте логику для обработки статуса валидации.

Наиболее распространённой валидацией является обязательность поля.
Следующий пример показывает, как добавить обязательную валидацию к элементу управления `firstName` и отобразить результат валидации.

<docs-workflow>
<docs-step title="Import a validator function">
Реактивные формы включают набор функций валидатора для распространённых случаев использования. Эти функции получают элемент управления для валидации и возвращают объект ошибки или значение null в зависимости от проверки валидации.

Импортируйте класс `Validators` из пакета `@angular/forms`.

<docs-code header="profile-editor.component.ts (импорт)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="validator-imports"/>
</docs-step>

<docs-step title="Make a field required">
В компоненте `ProfileEditor` добавьте статический метод `Validators.required` в качестве второго элемента массива для элемента управления `firstName`.

<docs-code header="profile-editor.component.ts (обязательный валидатор)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="required-validator"/>
</docs-step>

<docs-step title="Display form status">
Когда вы добавляете обязательное поле в элемент управления формы, его начальный статус является недействительным. Этот недействительный статус распространяется на родительский элемент группы форм, делая его статус недействительным. Доступ к текущему статусу экземпляра группы форм осуществляется через его свойство `status`.

Отобразите текущий статус `profileForm` с помощью интерполяции.

<docs-code header="profile-editor.component.html (отображение статуса)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.html" region="display-status"/>

Кнопка **Submit** отключена, поскольку `profileForm` недействителен из-за обязательного элемента управления `firstName`. После заполнения ввода `firstName` форма становится действительной, и кнопка **Submit** активируется.

Подробнее о валидации форм см. руководство [Валидация форм](guide/forms/form-validation).
</docs-step>
</docs-workflow>

## Создание динамических форм {#creating-dynamic-forms}

`FormArray` — альтернатива `FormGroup` для управления любым количеством безымянных элементов управления.
Как и в случае с экземплярами FormGroup, вы можете динамически вставлять и удалять элементы управления из экземпляров FormArray, и значение и статус валидации экземпляра FormArray вычисляются из дочерних элементов управления.
Однако вам не нужно определять ключ для каждого элемента управления по имени, поэтому это отличный вариант, если вы не знаете количество дочерних значений заранее.

Для определения динамической формы выполните следующие шаги.

1. Импортируйте класс `FormArray`.
1. Определите элемент управления `FormArray`.
1. Получите доступ к элементу управления `FormArray` с помощью метода getter.
1. Отобразите массив форм в шаблоне.

Следующий пример показывает, как управлять массивом _псевдонимов_ в `ProfileEditor`.

<docs-workflow>
<docs-step title="Import the `FormArray` class">
Импортируйте класс `FormArray` из `@angular/forms` для использования информации о типах. Сервис `FormBuilder` готов создать экземпляр `FormArray`.

<docs-code header="profile-editor.component.ts (импорт)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-array-imports"/>
</docs-step>

<docs-step title="Define a `FormArray` control">
Вы можете инициализировать массив форм с любым количеством элементов управления, от нуля до многих, определив их в массиве. Добавьте свойство `aliases` в экземпляр группы форм для `profileForm` для определения массива форм.

Используйте метод `FormBuilder.array()` для определения массива и метод `FormBuilder.control()` для заполнения массива начальным элементом управления.

<docs-code header="profile-editor.component.ts (массив форм псевдонимов)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="aliases"/>

Элемент управления псевдонимов в экземпляре группы форм теперь заполнен одним элементом управления до тех пор, пока не будут добавлены дополнительные элементы управления динамически.
</docs-step>

<docs-step title="Access the `FormArray` control">
Getter обеспечивает доступ к псевдонимам в экземпляре массива форм по сравнению с повторением метода `profileForm.get()` для получения каждого экземпляра. Экземпляр массива форм представляет неопределённое количество элементов управления в массиве. Удобно получать доступ к элементу управления через getter, и этот подход легко повторить для дополнительных элементов управления. <br />

Используйте синтаксис getter для создания свойства класса `aliases` для получения элемента управления массива форм псевдонимов из родительской группы форм.

<docs-code header="profile-editor.component.ts (getter псевдонимов)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="aliases-getter"/>

Поскольку возвращаемый элемент управления имеет тип `AbstractControl`, необходимо предоставить явный тип для доступа к синтаксису метода экземпляра массива форм. Определите метод для динамической вставки элемента управления псевдонима в массив форм псевдонимов. Метод `FormArray.push()` вставляет элемент управления как новый элемент в массив, и вы также можете передать массив элементов управления в FormArray.push() для одновременной регистрации нескольких элементов управления.

<docs-code header="profile-editor.component.ts (добавление псевдонима)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="add-alias"/>

В шаблоне каждый элемент управления отображается как отдельное поле ввода.

</docs-step>

<docs-step title="Display the form array in the template">

Для привязки псевдонимов из модели формы необходимо добавить их в шаблон. Аналогично вводу `formGroupName`, предоставляемому `FormGroupNameDirective`, `formArrayName` привязывает коммуникацию от экземпляра массива форм к шаблону с помощью `FormArrayNameDirective`.

Добавьте следующий HTML-шаблон после закрывающего тега `<div>` элемента `formGroupName`.

<docs-code header="profile-editor.component.html (шаблон массива форм псевдонимов)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.html" region="formarrayname"/>

Блок `@for` перебирает каждый экземпляр элемента управления формы, предоставленный экземпляром массива форм псевдонимов. Поскольку элементы массива форм безымянны, вы назначаете индекс переменной `i` и передаёте его каждому элементу управления для привязки к входу `formControlName`.

Каждый раз при добавлении нового экземпляра псевдонима новому экземпляру массива форм предоставляется его элемент управления на основе индекса. Это позволяет отслеживать каждый отдельный элемент управления при вычислении статуса и значения корневого элемента управления.

NOTE: В беззонных приложениях изменение модели реактивных форм (например, вызов `FormArray.push()`) не запускает автоматически обнаружение изменений компонента. Если ваш шаблон зависит от структурных изменений модели, таких как `aliases.controls`, убедитесь, что компонент уведомляет Angular о необходимости запустить обнаружение изменений, например, через Observable форм к `ChangeDetectorRef.markForCheck()`:

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

### Использование `FormArrayDirective` для массивов форм верхнего уровня {#using-formarraydirective-for-top-level-form-arrays}

Вы можете привязать `FormArray` напрямую к элементу `<form>`, используя `FormArrayDirective`.
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

Изначально форма содержит одно поле `Alias`. Чтобы добавить другое поле, нажмите кнопку **Добавить псевдоним**. Вы также можете проверить массив псевдонимов, отображаемый моделью формы, в поле `Form Value` внизу шаблона. Вместо экземпляра элемента управления формы для каждого псевдонима вы можете создать другой экземпляр группы форм с дополнительными полями. Процесс определения элемента управления для каждого элемента одинаков.
</docs-step>

</docs-workflow>

## Унифицированные события изменения состояния элемента управления {#unified-control-state-change-events}

Все элементы управления формы предоставляют единый унифицированный поток **событий изменения состояния** через Observable `events` на `AbstractControl` (`FormControl`, `FormGroup`, `FormArray` и `FormRecord`).
Этот унифицированный поток позволяет реагировать на изменения состояния **значения**, **статуса**, **pristine**, **touched** и **reset**, а также на **действия уровня формы**, такие как **submit**, позволяя обрабатывать все обновления с одной подпиской вместо нескольких Observable.

### Типы событий {#event-types}

Каждый элемент, испускаемый `events`, является экземпляром конкретного класса события:

- **`ValueChangeEvent`** — при изменении **значения** элемента управления.
- **`StatusChangeEvent`** — при обновлении **статуса валидации** элемента управления до одного из значений `FormControlStatus` (`VALID`, `INVALID`, `PENDING` или `DISABLED`).
- **`PristineChangeEvent`** — при изменении состояния **pristine/dirty** элемента управления.
- **`TouchedChangeEvent`** — при изменении состояния **touched/untouched** элемента управления.
- **`FormResetEvent`** — при сбросе элемента управления или формы через API `reset()` или нативное действие.
- **`FormSubmittedEvent`** — при отправке формы.

Все классы событий расширяют `ControlEvent` и включают ссылку `source` на `AbstractControl`, из которого возникло изменение, что полезно в больших формах.

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

@Component({
  /*...*/
})
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

Используйте операторы RxJS, когда вам нужно только подмножество типов событий.

```ts
import {filter} from 'rxjs/operators';
import {StatusChangeEvent} from '@angular/forms';

control.events
  .pipe(filter((e) => e instanceof StatusChangeEvent))
  .subscribe((e) => console.log('Status:', e.status));
```

### Объединение нескольких подписок {#unifying-from-multiple-subscriptions}

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

NOTE: При изменении значения испускание происходит сразу после обновления значения этого элемента управления. Значение родительского элемента управления (например, если данный FormControl является частью FormGroup) обновляется позже, поэтому доступ к значению родительского элемента управления (через свойство `value`) из обратного вызова этого события может привести к получению ещё не обновлённого значения. Вместо этого подпишитесь на `events` родительского элемента управления.

## Управление состоянием элемента управления формы {#managing-form-control-state}

Реактивные формы отслеживают состояние элемента управления через **touched/untouched** и **pristine/dirty**. Angular обновляет их автоматически во время DOM-взаимодействий, но вы также можете управлять ими программно.

**[`markAsTouched`](api/forms/FormControl#markAsTouched)** — Помечает элемент управления или форму как touched событиями фокуса и потери фокуса, не изменяющими значение. По умолчанию распространяется на родительские элементы управления.

```ts
// Показывать ошибки валидации после того, как пользователь покинул поле
onEmailBlur() {
  const email = this.form.get('email');
  email.markAsTouched();
}
```

**[`markAsUntouched`](api/forms/FormControl#markAsUntouched)** — Помечает элемент управления или форму как untouched. Каскадно распространяется на все дочерние элементы управления и пересчитывает статус touched всех родительских элементов управления.

```ts
// Сброс состояния формы после успешной отправки
onSubmitSuccess() {
  this.form.markAsUntouched();
  this.form.markAsPristine();
}
```

**[`markAsDirty`](api/forms/FormControl#markAsDirty)** — Помечает элемент управления или форму как dirty, то есть значение было изменено. По умолчанию распространяется на родительские элементы управления.

```ts
// Пометить программно изменённые значения как изменённые
autofillAddress() {
  const previousAddress = getAddress();
  this.form.patchValue(previousAddress, { emitEvent: false });
  this.form.markAsDirty();
}
```

**[`markAsPristine`](api/forms/FormControl#markAsPristine)** — Помечает элемент управления или форму как pristine. Помечает все дочерние элементы управления как pristine и пересчитывает статус pristine всех родительских элементов управления.

```ts
// Сброс состояния pristine после сохранения для отслеживания новых изменений
saveForm() {
  this.api.save(this.form.value).subscribe(() => {
    this.form.markAsPristine();
  });
}
```

**[`markAllAsDirty`](api/forms/FormControl#markAllAsDirty)** — Помечает элемент управления или форму и все её дочерние элементы управления как dirty.

```ts
// Пометить импортированные данные как dirty
loadData(data: FormData) {
  this.form.patchValue(data);
  this.form.markAllAsDirty();
}
```

**[`markAllAsTouched`](api/forms/FormControl#markAllAsTouched)** — Помечает элемент управления или форму и все её дочерние элементы управления как touched. Полезно для отображения ошибок валидации по всей форме.

```ts
// Показать все ошибки валидации перед отправкой
onSubmit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
  this.saveForm();
}
```

## Управление испусканием событий и распространением {#controlling-event-emission-and-propagation}

При программном обновлении элементов управления формы у вас есть точный контроль над тем, как изменения распространяются по иерархии форм и испускаются ли события.

### Понимание испускания событий {#understanding-event-emission}

По умолчанию `emitEvent: true` — любое изменение элемента управления испускает события через Observable `valueChanges` и `statusChanges`. Установка `emitEvent: false` подавляет эти испускания, что полезно при программной установке значений без запуска реактивного поведения (например, автосохранения), для избежания циклических обновлений между элементами управления или при массовых обновлениях, когда события должны испускаться только один раз в конце.

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
    // Автосохранение черновика при каждом вводе пользователя
    this.postForm.valueChanges.subscribe((formValue) => {
      this.autosaveDraft(formValue);
    });
  }

  loadExistingDraft(savedDraft: {title: string; content: string}) {
    // Восстановление черновика без запуска автосохранения
    this.postForm.setValue(savedDraft, {emitEvent: false});
  }
}
```

### Понимание управления распространением {#understanding-propagation-control}

По умолчанию `onlySelf: false` — обновления каскадно распространяются на родительские элементы управления, пересчитывая их значения и статус валидации. Установка `onlySelf: true` изолирует обновление до текущего элемента управления, предотвращая уведомление родителя. Это полезно для пакетных операций, где вы хотите вручную инициировать обновление родителя один раз.

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

## Утилиты для уточнения типов элементов управления формы {#utility-functions-for-narrowing-form-control-types}

Angular предоставляет четыре утилиты, которые помогают определить конкретный тип `AbstractControl`. Эти функции действуют как **защитники типов** и сужают тип элемента управления, когда возвращают `true`, что позволяет безопасно обращаться к специфическим для подтипа свойствам внутри одного блока.

| Утилита          | Подробности                                                      |
| :--------------- | :--------------------------------------------------------------- |
| `isFormControl`  | Возвращает `true`, когда элемент управления является `FormControl`. |
| `isFormGroup`    | Возвращает `true`, когда элемент управления является `FormGroup`    |
| `isFormRecord`   | Возвращает `true`, когда элемент управления является `FormRecord`   |
| `isFormArray`    | Возвращает `true`, когда элемент управления является `FormArray`    |

Эти вспомогательные функции особенно полезны в **пользовательских валидаторах**, где сигнатура функции получает `AbstractControl`, но логика предназначена для конкретного вида элемента управления.

```ts
import {AbstractControl, isFormArray} from '@angular/forms';

export function positiveValues(control: AbstractControl) {
  if (!isFormArray(control)) {
    return null; // Не FormArray: валидатор неприменим.
  }

  // Безопасный доступ к API FormArray после уточнения типа.
  const hasNegative = control.controls.some((c) => c.value < 0);
  return hasNegative ? {positiveValues: true} : null;
}
```

## Краткое описание API реактивных форм {#reactive-forms-api-summary}

В следующей таблице перечислены базовые классы и сервисы, используемые для создания и управления элементами управления реактивных форм.
Подробный синтаксис см. в справочной документации API для [пакета Forms](api#forms 'Справочник API').

### Классы {#classes}

| Класс             | Подробности                                                                                                                                                                                              |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AbstractControl` | Абстрактный базовый класс для конкретных классов элементов управления формы `FormControl`, `FormGroup` и `FormArray`. Предоставляет их общие поведения и свойства.                                      |
| `FormControl`     | Управляет значением и статусом валидности отдельного элемента управления формы. Соответствует HTML-элементу управления формы, такому как `<input>` или `<select>`.                                       |
| `FormGroup`       | Управляет значением и состоянием валидности группы экземпляров `AbstractControl`. Свойства группы включают её дочерние элементы управления. Форма верхнего уровня в вашем компоненте — это `FormGroup`. |
| `FormArray`       | Управляет значением и состоянием валидности числово-индексированного массива экземпляров `AbstractControl`.                                                                                               |
| `FormBuilder`     | Внедряемый сервис, предоставляющий фабричные методы для создания экземпляров элементов управления.                                                                                                       |
| `FormRecord`      | Отслеживает значение и состояние валидности коллекции экземпляров `FormControl`, каждый из которых имеет одинаковый тип значения.                                                                        |

### Директивы {#directives}

| Директива              | Подробности                                                                                          |
| :--------------------- | :--------------------------------------------------------------------------------------------------- |
| `FormControlDirective` | Синхронизирует отдельный экземпляр `FormControl` с элементом управления формы.                       |
| `FormControlName`      | Синхронизирует `FormControl` в существующем экземпляре `FormGroup` с элементом управления формы по имени. |
| `FormGroupDirective`   | Синхронизирует существующий экземпляр `FormGroup` с DOM-элементом.                                   |
| `FormGroupName`        | Синхронизирует вложенный экземпляр `FormGroup` с DOM-элементом.                                      |
| `FormArrayName`        | Синхронизирует вложенный экземпляр `FormArray` с DOM-элементом.                                      |
| `FormArrayDirective`   | Синхронизирует отдельный экземпляр `FormArray` с DOM-элементом.                                      |
