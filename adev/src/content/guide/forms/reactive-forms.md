# Реактивные формы {#reactive-forms}

Реактивные формы предоставляют управляемый моделью подход к обработке вводимых данных формы, значения которых изменяются со временем.
В этом руководстве показано, как создать и обновить базовый элемент управления формы, перейти к использованию нескольких элементов управления в группе, валидировать значения формы и создавать динамические формы, в которых можно добавлять или удалять элементы управления во время выполнения.

## Обзор реактивных форм {#overview-of-reactive-forms}

Реактивные формы используют явный и неизменяемый подход к управлению состоянием формы в заданный момент времени.
Каждое изменение состояния формы возвращает новое состояние, что сохраняет целостность модели между изменениями.
Реактивные формы построены вокруг Observable-потоков, где вводимые данные и значения формы предоставляются как потоки входных значений, к которым можно получить доступ синхронно.

Реактивные формы также предоставляют простой путь к тестированию, поскольку при запросе данных они гарантированно согласованны и предсказуемы.
Любые потребители потоков имеют доступ к безопасному управлению этими данными.

Реактивные формы отличаются от [форм на основе шаблонов](guide/forms/template-driven-forms) рядом особенностей.
Реактивные формы предоставляют синхронный доступ к модели данных, неизменяемость с операторами Observable и отслеживание изменений через Observable-потоки.

Формы на основе шаблонов позволяют напрямую изменять данные в шаблоне, но менее явны по сравнению с реактивными формами, поскольку используют встроенные директивы и изменяемые данные для асинхронного отслеживания изменений.
Подробное сравнение двух подходов см. в [Обзоре форм](guide/forms).

## Добавление базового элемента управления формы {#adding-a-basic-form-control}

Для использования элементов управления формы нужно выполнить три шага.

1. Создать новый компонент и зарегистрировать модуль реактивных форм. Этот модуль объявляет директивы реактивных форм, необходимые для их использования.
1. Создать экземпляр `FormControl`.
1. Зарегистрировать `FormControl` в шаблоне.

Затем можно отобразить форму, добавив компонент в шаблон.

Следующие примеры показывают, как добавить один элемент управления формы.
В примере пользователь вводит своё имя в поле ввода, записывает это значение и отображает текущее значение элемента управления формы.

<docs-workflow>

<docs-step title="Создайте новый компонент и импортируйте ReactiveFormsModule">
Используйте CLI-команду `ng generate component`, чтобы создать компонент в вашем проекте, импортируйте `ReactiveFormsModule` из пакета `@angular/forms` и добавьте его в массив `imports` вашего компонента.

<docs-code header="name-editor.component.ts (excerpt)" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.ts" region="imports" />
</docs-step>

<docs-step title="Объявите экземпляр FormControl">
Используйте конструктор `FormControl` для установки его начального значения, в данном случае — пустой строки. Создавая эти элементы управления в классе компонента, вы получаете немедленный доступ для прослушивания, обновления и валидации состояния ввода формы.

<docs-code header="name-editor.component.ts" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.ts" region="create-control"/>
</docs-step>

<docs-step title="Зарегистрируйте элемент управления в шаблоне">
После создания элемента управления в классе компонента его необходимо связать с элементом управления формы в шаблоне. Обновите шаблон, добавив привязку формы с помощью привязки `formControl`, предоставляемой `FormControlDirective`, которая также входит в `ReactiveFormsModule`.

<docs-code header="name-editor.component.html" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.html" region="control-binding" />

Используя синтаксис привязки шаблона, элемент управления формы теперь зарегистрирован с элементом ввода `name` в шаблоне. Элемент управления формы и элемент DOM взаимодействуют друг с другом: представление отражает изменения в модели, а модель отражает изменения в представлении.
</docs-step>

<docs-step title="Отобразите компонент">
`FormControl`, назначенный свойству `name`, отображается, когда компонент `<app-name-editor>` добавляется в шаблон.

<docs-code header="app.component.html (name editor)" path="adev/src/content/examples/reactive-forms/src/app/app.component.1.html" region="app-name-editor"/>
</docs-step>
</docs-workflow>

### Отображение значения элемента управления формы {#displaying-a-form-control-value}

Значение можно отобразить следующими способами.

- Через Observable `valueChanges`, где можно прослушивать изменения значения формы в шаблоне с помощью `AsyncPipe` или в классе компонента с помощью метода `subscribe()`
- С помощью свойства `value`, которое даёт мгновенный снимок текущего значения

Следующий пример показывает, как отобразить текущее значение с помощью интерполяции в шаблоне.

<docs-code header="name-editor.component.html (control value)" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.html" region="display-value"/>

Отображаемое значение изменяется при обновлении элемента управления формы.

Реактивные формы предоставляют доступ к информации об элементе управления через свойства и методы каждого экземпляра.
Эти свойства и методы базового класса [AbstractControl](api/forms/AbstractControl 'API reference') используются для управления состоянием формы и определения времени отображения сообщений при обработке [валидации ввода](#validating-form-input 'Learn more about validating form input').

Подробнее о других свойствах и методах `FormControl` читайте в [Справочнике API](api/forms/FormControl 'Detailed syntax reference').

### Замена значения элемента управления формы {#replacing-a-form-control-value}

Реактивные формы имеют методы для программного изменения значения элемента управления, что даёт гибкость для обновления значения без взаимодействия с пользователем.
Экземпляр элемента управления формы предоставляет метод `setValue()`, который обновляет значение и валидирует структуру предоставленного значения относительно структуры элемента управления.
Например, при получении данных формы из бэкенда API или сервиса используйте метод `setValue()` для обновления элемента управления до нового значения, полностью заменяя старое.

Следующий пример добавляет метод в класс компонента для обновления значения элемента управления на _Nancy_ с помощью метода `setValue()`.

<docs-code header="name-editor.component.ts (update value)" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.ts" region="update-value"/>

Обновите шаблон, добавив кнопку для имитации обновления имени.
При нажатии кнопки **Update Name** значение, введённое в элемент управления формы, отражается как его текущее значение.

<docs-code header="name-editor.component.html (update value)" path="adev/src/content/examples/reactive-forms/src/app/name-editor/name-editor.component.html" region="update-value"/>

Модель формы является источником истины для элемента управления, поэтому при нажатии кнопки значение поля ввода изменяется внутри класса компонента, перезаписывая текущее значение.

HELPFUL: В этом примере используется один элемент управления.
При использовании метода `setValue()` с экземпляром [группы формы](#grouping-form-controls) или [массива формы](#creating-dynamic-forms) значение должно соответствовать структуре группы или массива.

## Группировка элементов управления формы {#grouping-form-controls}

Формы обычно содержат несколько связанных элементов управления.
Реактивные формы предоставляют два способа объединения нескольких связанных элементов управления в одну форму ввода.

| Группы форм   | Подробности                                                                                                                                                                                                                                                                             |
| :------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Группа формы  | Определяет форму с фиксированным набором элементов управления, которыми можно управлять совместно. Основы группы формы рассматриваются в этом разделе. Также можно [вкладывать группы форм](#creating-nested-form-groups 'See more about nesting groups') для создания более сложных форм. |
| Массив формы  | Определяет динамическую форму, где можно добавлять и удалять элементы управления во время выполнения. Также можно вкладывать массивы форм для создания более сложных форм. Подробнее см. в разделе [Создание динамических форм](#creating-dynamic-forms).                               |

Так же как экземпляр элемента управления формы даёт контроль над одним полем ввода, экземпляр группы формы отслеживает состояние группы экземпляров элементов управления формы \(например, формы\).
Каждый элемент управления в экземпляре группы формы отслеживается по имени при создании группы.
Следующий пример показывает, как управлять несколькими экземплярами элементов управления формы в одной группе.

Создайте компонент `ProfileEditor` и импортируйте классы `FormGroup` и `FormControl` из пакета `@angular/forms`.

```shell
ng generate component ProfileEditor
```

<docs-code header="profile-editor.component.ts (imports)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="imports"/>

Чтобы добавить группу формы в этот компонент, выполните следующие шаги.

1. Создайте экземпляр `FormGroup`.
1. Свяжите модель и представление `FormGroup`.
1. Сохраните данные формы.

<docs-workflow>

<docs-step title="Создайте экземпляр FormGroup">
Создайте свойство в классе компонента с именем `profileForm` и установите его как новый экземпляр группы формы. Для инициализации группы формы передайте конструктору объект с именованными ключами, сопоставленными с элементами управления.

Для формы профиля добавьте два экземпляра элементов управления с именами `firstName` и `lastName`

<docs-code header="profile-editor.component.ts (form group)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup"/>

Отдельные элементы управления формы теперь собраны в группу. Экземпляр `FormGroup` предоставляет значение модели как объект, сводный из значений каждого элемента управления в группе. Экземпляр группы формы имеет те же свойства (например, `value` и `untouched`) и методы (например, `setValue()`), что и экземпляр элемента управления формы.
</docs-step>

<docs-step title="Свяжите модель и представление FormGroup">
Группа формы отслеживает статус и изменения каждого из своих элементов управления, поэтому при изменении одного из них родительский элемент управления также генерирует новый статус или изменение значения. Модель группы поддерживается из её членов. После определения модели шаблон необходимо обновить, чтобы отразить модель в представлении.

<docs-code header="profile-editor.component.html (template form group)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="formgroup"/>

Так же как группа формы содержит группу элементов управления, `FormGroup` _profileForm_ привязан к элементу `form` с помощью директивы `FormGroup`, создавая коммуникационный слой между моделью и формой, содержащей поля ввода. Входной параметр `formControlName`, предоставляемый директивой `FormControlName`, привязывает каждый отдельный ввод к элементу управления формы, определённому в `FormGroup`. Элементы управления формы взаимодействуют с соответствующими элементами. Они также сообщают об изменениях экземпляру группы формы, который является источником истины для значения модели.
</docs-step>

<docs-step title="Сохраните данные формы">
Компонент `ProfileEditor` принимает ввод от пользователя, но в реальном сценарии вы хотите захватить значение формы и сделать его доступным для дальнейшей обработки вне компонента. Директива `FormGroup` прослушивает событие `submit`, генерируемое элементом `form`, и генерирует событие `ngSubmit`, которое можно привязать к функции обратного вызова. Добавьте прослушиватель события `ngSubmit` к тегу `form` с методом обратного вызова `onSubmit()`.

<docs-code header="profile-editor.component.html (submit event)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.html" region="ng-submit"/>

Метод `onSubmit()` в компоненте `ProfileEditor` захватывает текущее значение `profileForm`. Используйте `EventEmitter` для инкапсуляции формы и предоставления значения формы вне компонента. В следующем примере `console.warn` используется для вывода сообщения в консоль браузера.

<docs-code header="profile-editor.component.ts (submit method)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="on-submit"/>

Событие `submit` генерируется тегом `form` с помощью встроенного события DOM. Событие запускается нажатием кнопки типа `submit`. Это позволяет пользователю нажать клавишу **Enter** для отправки заполненной формы.

Используйте элемент `button`, чтобы добавить кнопку в нижнюю часть формы для инициирования отправки формы.

<docs-code header="profile-editor.component.html (submit button)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.html" region="submit-button"/>

К кнопке в приведённом фрагменте также добавлена привязка `disabled` для отключения кнопки при недействительности `profileForm`. Пока валидация не настроена, кнопка всегда активна. Базовая валидация форм рассматривается в разделе [Валидация ввода формы](#validating-form-input).
</docs-step>

<docs-step title="Отобразите компонент">
Чтобы отобразить компонент `ProfileEditor`, содержащий форму, добавьте его в шаблон компонента.

<docs-code header="app.component.html (profile editor)" path="adev/src/content/examples/reactive-forms/src/app/app.component.1.html" region="app-profile-editor"/>

`ProfileEditor` позволяет управлять экземплярами элементов управления формы `firstName` и `lastName` внутри экземпляра группы формы.

### Создание вложенных групп форм {#creating-nested-form-groups}

Группы форм могут принимать как отдельные экземпляры элементов управления, так и другие экземпляры групп форм в качестве дочерних элементов.
Это упрощает создание и логическое группирование сложных моделей форм.

При создании сложных форм управлять различными областями информации проще в небольших секциях.
Использование вложенного экземпляра группы форм позволяет разбивать большие группы форм на более мелкие и управляемые.

Для создания более сложных форм выполните следующие шаги.

1. Создайте вложенную группу.
1. Сгруппируйте вложенную форму в шаблоне.

Некоторые типы информации естественно относятся к одной группе.
Имя и адрес — типичные примеры таких вложенных групп, которые используются в следующих примерах.

<docs-workflow>
<docs-step title="Создайте вложенную группу">
Чтобы создать вложенную группу в `profileForm`, добавьте вложенный элемент `address` в экземпляр группы формы.

<docs-code header="profile-editor.component.ts (nested form group)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="nested-formgroup"/>

В этом примере `address group` объединяет текущие элементы управления `firstName` и `lastName` с новыми `street`, `city`, `state` и `zip`. Хотя элемент `address` в группе формы является дочерним для общего элемента `profileForm` в группе формы, те же правила применяются для изменений значений и статуса. Изменения статуса и значения из вложенной группы форм распространяются на родительскую группу форм, поддерживая согласованность с общей моделью.
</docs-step>

<docs-step title="Сгруппируйте вложенную форму в шаблоне">
После обновления модели в классе компонента обновите шаблон, чтобы связать экземпляр группы формы с его элементами ввода. Добавьте группу формы `address`, содержащую поля `street`, `city`, `state` и `zip`, в шаблон `ProfileEditor`.

<docs-code header="profile-editor.component.html (template nested form group)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="formgroupname"/>

Форма `ProfileEditor` отображается как одна группа, но модель разбита дополнительно для отражения логических областей группировки.

Отобразите значение экземпляра группы формы в шаблоне компонента с помощью свойства `value` и `JsonPipe`.
</docs-step>
</docs-workflow>

### Обновление частей модели данных {#updating-parts-of-the-data-model}

При обновлении значения экземпляра группы формы, содержащей несколько элементов управления, может потребоваться обновить только части модели.
В этом разделе описывается обновление конкретных частей модели данных элемента управления формы.

Существует два способа обновления значения модели:

| Методы         | Подробности                                                                                                                                                                               |
| :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setValue()`   | Установить новое значение для отдельного элемента управления. Метод `setValue()` строго придерживается структуры группы формы и полностью заменяет значение элемента управления.        |
| `patchValue()` | Заменить любые свойства, определённые в объекте, которые изменились в модели формы.                                                                                                      |

Строгие проверки метода `setValue()` помогают обнаруживать ошибки вложения в сложных формах, тогда как `patchValue()` молча игнорирует такие ошибки.

В `ProfileEditorComponent` используйте метод `updateProfile` из следующего примера для обновления имени и адреса улицы пользователя.

<docs-code header="profile-editor.component.ts (patch value)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="patch-value"/>

Имитируйте обновление, добавив кнопку в шаблон для обновления профиля пользователя по запросу.

<docs-code header="profile-editor.component.html (update value)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="patch-value"/>

При нажатии кнопки модель `profileForm` обновляется новыми значениями `firstName` и `street`. Заметьте, что `street` предоставляется в объекте внутри свойства `address`.
Это необходимо, потому что метод `patchValue()` применяет обновление к структуре модели.
`PatchValue()` обновляет только свойства, определённые в модели формы.

## Использование сервиса FormBuilder для генерации элементов управления {#using-the-formbuilder-service-to-generate-controls}

Создание экземпляров элементов управления формы вручную может стать повторяющейся задачей при работе с несколькими формами.
Сервис `FormBuilder` предоставляет удобные методы для генерации элементов управления.

Для использования этого сервиса выполните следующие шаги.

1. Импортируйте класс `FormBuilder`.
1. Внедрите сервис `FormBuilder`.
1. Сгенерируйте содержимое формы.

Следующие примеры показывают, как реорганизовать компонент `ProfileEditor` для использования сервиса form builder при создании экземпляров элементов управления формы и групп.

<docs-workflow>
<docs-step title="Импортируйте класс FormBuilder">
Импортируйте класс `FormBuilder` из пакета `@angular/forms`.

<docs-code header="profile-editor.component.ts (import)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-builder-imports"/>

</docs-step>

<docs-step title="Внедрите сервис FormBuilder">
Сервис `FormBuilder` является инжектируемым провайдером из модуля реактивных форм. Используйте функцию `inject()` для внедрения этой зависимости в ваш компонент.

<docs-code header="profile-editor.component.ts (property init)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="inject-form-builder"/>

</docs-step>
<docs-step title="Генерируйте элементы управления формы">
Сервис `FormBuilder` предоставляет три метода: `control()`, `group()` и `array()`. Это фабричные методы для генерации экземпляров в классах компонента, включая элементы управления, группы и массивы форм. Используйте метод `group` для создания элементов управления `profileForm`.

<docs-code header="profile-editor.component.ts (form builder)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-builder"/>

В предыдущем примере для определения свойств модели используется метод `group()` с тем же объектом. Значение для каждого имени элемента управления — массив, содержащий начальное значение в качестве первого элемента.

TIP: Можно определить элемент управления только с начальным значением, но если вашим элементам управления нужна синхронная или асинхронная валидация, добавьте синхронные и асинхронные валидаторы как второй и третий элементы массива. Сравните использование form builder с созданием экземпляров вручную.

  <docs-code-multifile>
    <docs-code header="profile-editor.component.ts (instances)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup-compare"/>
    <docs-code header="profile-editor.component.ts (form builder)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="formgroup-compare"/>
  </docs-code-multifile>
</docs-step>

</docs-workflow>

## Валидация ввода формы {#validating-form-input}

_Валидация формы_ используется для обеспечения полноты и корректности пользовательского ввода.
В этом разделе рассматривается добавление одного валидатора к элементу управления формы и отображение общего статуса формы.
Валидация форм более подробно рассматривается в руководстве [Валидация форм](guide/forms/form-validation).

Для добавления валидации формы выполните следующие шаги.

1. Импортируйте функцию-валидатор в компонент формы.
1. Добавьте валидатор к полю в форме.
1. Добавьте логику для обработки статуса валидации.

Наиболее распространённая валидация — обязательное заполнение поля.
Следующий пример показывает, как добавить обязательную валидацию к элементу управления `firstName` и отобразить результат валидации.

<docs-workflow>
<docs-step title="Импортируйте функцию-валидатор">
Реактивные формы включают набор функций-валидаторов для распространённых случаев использования. Эти функции принимают элемент управления для валидации и возвращают объект ошибки или значение null в зависимости от результата проверки.

Импортируйте класс `Validators` из пакета `@angular/forms`.

<docs-code header="profile-editor.component.ts (import)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="validator-imports"/>
</docs-step>

<docs-step title="Сделайте поле обязательным">
В компоненте `ProfileEditor` добавьте статический метод `Validators.required` как второй элемент массива для элемента управления `firstName`.

<docs-code header="profile-editor.component.ts (required validator)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="required-validator"/>
</docs-step>

<docs-step title="Отобразите статус формы">
При добавлении обязательного поля к элементу управления формы его начальный статус — недействительный. Этот недействительный статус распространяется на родительский элемент группы формы, делая его статус также недействительным. Получите доступ к текущему статусу экземпляра группы формы через его свойство `status`.

Отобразите текущий статус `profileForm` с помощью интерполяции.

<docs-code header="profile-editor.component.html (display status)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.html" region="display-status"/>

Кнопка **Submit** отключена, потому что `profileForm` недействителен из-за обязательного элемента управления `firstName`. После заполнения поля `firstName` форма становится действительной и кнопка **Submit** активируется.

Подробнее о валидации форм см. в руководстве [Валидация форм](guide/forms/form-validation).
</docs-step>
</docs-workflow>

## Создание динамических форм {#creating-dynamic-forms}

`FormArray` является альтернативой `FormGroup` для управления любым количеством неименованных элементов управления.
Как и в случае с экземплярами группы формы, можно динамически вставлять и удалять элементы управления из экземпляров массива формы, а значение и статус валидации экземпляра массива формы вычисляются из его дочерних элементов управления.
Однако не нужно определять ключ для каждого элемента управления по имени, что является хорошим вариантом, если количество дочерних значений заранее неизвестно.

Для определения динамической формы выполните следующие шаги.

1. Импортируйте класс `FormArray`.
1. Определите элемент управления `FormArray`.
1. Получите доступ к элементу управления `FormArray` с помощью геттера.
1. Отобразите массив формы в шаблоне.

Следующий пример показывает, как управлять массивом _псевдонимов_ в `ProfileEditor`.

<docs-workflow>
<docs-step title="Импортируйте класс `FormArray`">
Импортируйте класс `FormArray` из `@angular/forms` для использования информации о типах. Сервис `FormBuilder` готов к созданию экземпляра `FormArray`.

<docs-code header="profile-editor.component.ts (import)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-array-imports"/>
</docs-step>

<docs-step title="Определите элемент управления `FormArray`">
Массив формы можно инициализировать любым количеством элементов управления, от нуля до нескольких, определив их в массиве. Добавьте свойство `aliases` к экземпляру группы формы для `profileForm`, чтобы определить массив формы.

Используйте метод `FormBuilder.array()` для определения массива и метод `FormBuilder.control()` для заполнения массива начальным элементом управления.

<docs-code header="profile-editor.component.ts (aliases form array)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="aliases"/>

Элемент управления aliases в экземпляре группы формы теперь заполнен одним элементом управления до добавления новых динамически.
</docs-step>

<docs-step title="Получите доступ к элементу управления `FormArray`">
Геттер предоставляет доступ к псевдонимам в экземпляре массива формы по сравнению с повторным использованием метода `profileForm.get()` для получения каждого экземпляра. Экземпляр массива формы представляет неопределённое количество элементов управления в массиве. Удобно получать доступ к элементу управления через геттер, и этот подход легко повторить для дополнительных элементов управления. <br />

Используйте синтаксис геттера для создания свойства класса `aliases`, чтобы получить элемент управления массива формы псевдонимов из родительской группы формы.

<docs-code header="profile-editor.component.ts (aliases getter)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="aliases-getter"/>

Поскольку возвращаемый элемент управления имеет тип `AbstractControl`, необходимо предоставить явный тип для доступа к синтаксису методов экземпляра массива формы. Определите метод для динамической вставки элемента управления псевдонима в массив формы псевдонимов. Метод `FormArray.push()` вставляет элемент управления как новый элемент в массив, и можно также передать массив элементов управления в `FormArray.push()` для одновременной регистрации нескольких элементов.

<docs-code header="profile-editor.component.ts (add alias)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="add-alias"/>

В шаблоне каждый элемент управления отображается как отдельное поле ввода.

</docs-step>

<docs-step title="Отобразите массив формы в шаблоне">

Чтобы прикрепить псевдонимы из модели формы, необходимо добавить их в шаблон. Аналогично входному параметру `formGroupName`, предоставляемому `FormGroupNameDirective`, `formArrayName` привязывает коммуникацию от экземпляра массива формы к шаблону с помощью `FormArrayNameDirective`.

Добавьте следующий HTML-код шаблона после `<div>`, закрывающего элемент `formGroupName`.

<docs-code header="profile-editor.component.html (aliases form array template)" path="adev/src/content/examples/reactive-forms/src/app/profile-editor/profile-editor.component.html" region="formarrayname"/>

Блок `@for` перебирает каждый экземпляр элемента управления, предоставляемый экземпляром массива формы псевдонимов. Поскольку элементы массива формы не именованы, индекс присваивается переменной `i` и передаётся каждому элементу управления для его привязки к входному параметру `formControlName`.

Каждый раз при добавлении нового экземпляра псевдонима новый экземпляр массива формы получает свой элемент управления на основе индекса. Это позволяет отслеживать каждый отдельный элемент управления при вычислении статуса и значения корневого элемента.

</docs-step>

### Использование `FormArrayDirective` для массивов форм верхнего уровня {#using-formarraydirective-for-top-level-form-arrays}

Можно привязать `FormArray` непосредственно к элементу `<form>` с помощью `FormArrayDirective`.
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

<docs-step title="Добавьте псевдоним">

Изначально форма содержит одно поле `Alias`. Чтобы добавить ещё одно, нажмите кнопку **Add Alias**. Можно также проверить массив псевдонимов, отображаемый моделью формы в разделе `Form Value` в нижней части шаблона. Вместо экземпляра элемента управления для каждого псевдонима можно составить ещё один экземпляр группы формы с дополнительными полями. Процесс определения элемента управления для каждого элемента одинаков.
</docs-step>

</docs-workflow>

## Унифицированные события изменения состояния элемента управления {#unified-control-state-change-events}

Все элементы управления формы предоставляют единый унифицированный поток **событий изменения состояния элемента управления** через Observable `events` на `AbstractControl` (`FormControl`, `FormGroup`, `FormArray` и `FormRecord`).
Этот унифицированный поток позволяет реагировать на изменения состояний **value**, **status**, **pristine**, **touched** и **reset**, а также на **действия на уровне формы**, такие как **submit**, позволяя обрабатывать все обновления с одной подпиской вместо подключения нескольких Observable.

### Типы событий {#event-types}

Каждый элемент, генерируемый `events`, является экземпляром конкретного класса события:

- **`ValueChangeEvent`** — при изменении **значения** элемента управления.
- **`StatusChangeEvent`** — при обновлении **статуса валидации** элемента управления до одного из значений `FormControlStatus` (`VALID`, `INVALID`, `PENDING` или `DISABLED`).
- **`PristineChangeEvent`** — при изменении состояния **pristine/dirty** элемента управления.
- **`TouchedChangeEvent`** — при изменении состояния **touched/untouched** элемента управления.
- **`FormResetEvent`** — при сбросе элемента управления или формы через API `reset()` или нативное действие.
- **`FormSubmittedEvent`** — при отправке формы.

Все классы событий расширяют `ControlEvent` и включают ссылку `source` на `AbstractControl`, который инициировал изменение, что полезно в больших формах.

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

При необходимости только подмножества типов событий предпочтительнее использовать операторы RxJS.

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

NOTE: При изменении значения событие генерируется сразу после обновления значения этого элемента управления. Значение родительского элемента управления (например, если данный `FormControl` является частью `FormGroup`) обновляется позже, поэтому обращение к значению родительского элемента управления (через свойство `value`) из обратного вызова этого события может привести к получению ещё не обновлённого значения. Вместо этого подпишитесь на `events` родительского элемента управления.

## Управление состоянием элемента управления формы {#managing-form-control-state}

Реактивные формы отслеживают состояние элемента управления через **touched/untouched** и **pristine/dirty**. Angular обновляет их автоматически во время взаимодействия с DOM, но можно также управлять ими программно.

**[`markAsTouched`](api/forms/FormControl#markAsTouched)** — Помечает элемент управления или форму как затронутые событиями фокуса и размытия, которые не изменяют значение. По умолчанию распространяется на родительские элементы управления.

```ts
// Show validation errors after user leaves a field
onEmailBlur() {
  const email = this.form.get('email');
  email.markAsTouched();
}
```

**[`markAsUntouched`](api/forms/FormControl#markAsUntouched)** — Помечает элемент управления или форму как нетронутые. Каскадно применяется ко всем дочерним элементам управления и пересчитывает статус touched всех родительских элементов.

```ts
// Reset form state after successful submission
onSubmitSuccess() {
  this.form.markAsUntouched();
  this.form.markAsPristine();
}
```

**[`markAsDirty`](api/forms/FormControl#markAsDirty)** — Помечает элемент управления или форму как грязные, то есть значение было изменено. По умолчанию распространяется на родительские элементы управления.

```ts
// Mark programmatically changed values as modified
autofillAddress() {
  const previousAddress = getAddress();
  this.form.patchValue(previousAddress, { emitEvent: false });
  this.form.markAsDirty();
}
```

**[`markAsPristine`](api/forms/FormControl#markAsPristine)** — Помечает элемент управления или форму как нетронутые (pristine). Помечает все дочерние элементы как pristine и пересчитывает статус pristine всех родительских элементов.

```ts
// Reset pristine state after saving to track new changes
saveForm() {
  this.api.save(this.form.value).subscribe(() => {
    this.form.markAsPristine();
  });
}
```

**[`markAllAsDirty`](api/forms/FormControl#markAllAsDirty)** — Помечает элемент управления или форму и все его потомки как грязные.

```ts
// Mark imported data as dirty
loadData(data: FormData) {
  this.form.patchValue(data);
  this.form.markAllAsDirty();
}
```

**[`markAllAsTouched`](api/forms/FormControl#markAllAsTouched)** — Помечает элемент управления или форму и все его потомки как затронутые. Полезно для отображения ошибок валидации по всей форме.

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

## Управление генерацией событий и распространением {#controlling-event-emission-and-propagation}

При программном обновлении элементов управления формы имеется точный контроль над тем, как изменения распространяются по иерархии формы и генерируются ли события.

### Понимание генерации событий {#understanding-event-emission}

По умолчанию `emitEvent: true` — любое изменение элемента управления генерирует события через Observable `valueChanges` и `statusChanges`. Установка `emitEvent: false` подавляет эти генерации, что полезно при программной установке значений без запуска реактивного поведения, такого как автосохранение, для избежания циклических обновлений между элементами управления или для пакетных обновлений, где события должны генерироваться только один раз в конце.

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

По умолчанию `onlySelf: false` — обновления каскадно применяются к родительским элементам управления, пересчитывая их значения и статус валидации. Установка `onlySelf: true` изолирует обновление для текущего элемента управления, предотвращая уведомление родительского. Это полезно для пакетных операций, где нужно вручную инициировать обновление родительского элемента один раз.

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

## Вспомогательные функции для сужения типов элементов управления формы {#utility-functions-for-narrowing-form-control-types}

Angular предоставляет четыре вспомогательные функции, которые помогают определить конкретный тип `AbstractControl`. Эти функции действуют как **type guards** (охранники типов) и сужают тип элемента управления при возврате `true`, что позволяет безопасно обращаться к специфическим для подтипа свойствам в одном блоке.

| Вспомогательная функция | Подробности                                                      |
| :---------------------- | :--------------------------------------------------------------- |
| `isFormControl`         | Возвращает `true`, если элемент управления является `FormControl`. |
| `isFormGroup`           | Возвращает `true`, если элемент управления является `FormGroup`  |
| `isFormRecord`          | Возвращает `true`, если элемент управления является `FormRecord`  |
| `isFormArray`           | Возвращает `true`, если элемент управления является `FormArray`  |

Эти вспомогательные функции особенно полезны в **пользовательских валидаторах**, где сигнатура функции принимает `AbstractControl`, но логика предназначена для конкретного вида элемента управления.

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

## Краткое описание API реактивных форм {#reactive-forms-api-summary}

В следующей таблице перечислены базовые классы и сервисы, используемые для создания и управления элементами управления реактивных форм.
Полные сведения о синтаксисе см. в документации справочника API для [пакета Forms](api#forms 'API reference').

### Классы {#classes}

| Класс             | Подробности                                                                                                                                                                                             |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AbstractControl` | Абстрактный базовый класс для конкретных классов элементов управления формы `FormControl`, `FormGroup` и `FormArray`. Предоставляет их общее поведение и свойства.                                     |
| `FormControl`     | Управляет значением и статусом валидности отдельного элемента управления формы. Соответствует HTML-элементу формы, такому как `<input>` или `<select>`.                                                |
| `FormGroup`       | Управляет значением и статусом валидности группы экземпляров `AbstractControl`. Свойства группы включают её дочерние элементы управления. Форма верхнего уровня в вашем компоненте — `FormGroup`.      |
| `FormArray`       | Управляет значением и статусом валидности нумерованного массива экземпляров `AbstractControl`.                                                                                                          |
| `FormBuilder`     | Инжектируемый сервис, предоставляющий фабричные методы для создания экземпляров элементов управления.                                                                                                  |
| `FormRecord`      | Отслеживает значение и статус валидности коллекции экземпляров `FormControl`, каждый из которых имеет одинаковый тип значения.                                                                         |

### Директивы {#directives}

| Директива              | Подробности                                                                                          |
| :--------------------- | :--------------------------------------------------------------------------------------------------- |
| `FormControlDirective` | Синхронизирует отдельный экземпляр `FormControl` с элементом управления формы.                      |
| `FormControlName`      | Синхронизирует `FormControl` в существующем экземпляре `FormGroup` с элементом управления по имени. |
| `FormGroupDirective`   | Синхронизирует существующий экземпляр `FormGroup` с элементом DOM.                                  |
| `FormGroupName`        | Синхронизирует вложенный экземпляр `FormGroup` с элементом DOM.                                     |
| `FormArrayName`        | Синхронизирует вложенный экземпляр `FormArray` с элементом DOM.                                     |
| `FormArrayDirective`   | Синхронизирует отдельный экземпляр `FormArray` с элементом DOM.                                     |
