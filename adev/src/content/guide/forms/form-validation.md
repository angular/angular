# Валидация ввода формы

Валидация пользовательского ввода на точность и полноту повышает общее качество данных.
На этой странице показано, как валидировать ввод из UI и отображать полезные сообщения об ошибках — и в reactive, и в template-driven формах.

## Валидация ввода в template-driven формах {#validating-input-in-template-driven-forms}

Чтобы добавить валидацию в template-driven форму, используйте те же атрибуты валидации, что и при [нативной HTML-валидации форм](https://developer.mozilla.org/docs/Web/Guide/HTML/HTML5/Constraint_validation).
Angular сопоставляет эти атрибуты с функциями-валидаторами фреймворка через директивы.

При каждом изменении значения контрола формы Angular запускает валидацию и формирует либо список ошибок валидации со статусом `INVALID`, либо `null` со статусом `VALID`.

Состояние контрола можно проверить, экспортировав `ngModel` в локальную переменную шаблона.
В следующем примере `NgModel` экспортируется в переменную `name`:

<docs-code header="actor-form-template.component.html (name)" path="adev/src/content/examples/form-validation/src/app/template/actor-form-template.component.html" region="name-with-error-msg"/>

Обратите внимание на особенности, которые иллюстрирует пример.

- Элемент `<input>` несёт HTML-атрибуты валидации: `required` и `minlength`.
  Также на нём есть пользовательская директива-валидатор `forbiddenName`.
  Подробнее см. в разделе [Пользовательские валидаторы](#defining-custom-validators).

- `#name="ngModel"` экспортирует `NgModel` в локальную переменную `name`.
  `NgModel` отражает многие свойства лежащего в основе экземпляра `FormControl`, поэтому в шаблоне можно проверять состояния контрола, например `valid` и `dirty`.
  Полный список свойств контрола см. в справочнике API [AbstractControl](api/forms/AbstractControl).
  - Внешний `@if` показывает набор вложенных сообщений только если `name` невалиден и контрол либо `dirty`, либо `touched`.

  - Каждый вложенный `@if` может показать своё сообщение для одной из возможных ошибок валидации.
    Есть сообщения для `required`, `minlength` и `forbiddenName`.

HELPFUL: Чтобы валидатор не показывал ошибки до того, как пользователь успел отредактировать форму, проверяйте состояния `dirty` или `touched` у контрола.

- Когда пользователь меняет значение в отслеживаемом поле, контрол помечается как "dirty"
- Когда пользователь уводит фокус с элемента контрола формы, контрол помечается как "touched"

## Валидация ввода в reactive формах {#validating-input-in-reactive-forms}

В reactive форме источником истины является класс компонента.
Вместо атрибутов в шаблоне функции-валидаторы добавляются напрямую к модели контрола формы в классе компонента.
Angular вызывает эти функции при каждом изменении значения контрола.

### Функции-валидаторы {#validator-functions}

Функции-валидаторы могут быть синхронными или асинхронными.

| Тип валидатора   | Описание                                                                                                                                                                                                                 |
| :--------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sync validators  | Синхронные функции, которые принимают экземпляр контрола и сразу возвращают набор ошибок валидации или `null`. Передаются вторым аргументом при создании `FormControl`.                       |
| Async validators | Асинхронные функции, которые принимают экземпляр контрола и возвращают Promise или Observable, который позже эмитит набор ошибок валидации или `null`. Передаются третьим аргументом при создании `FormControl`. |

Из соображений производительности Angular запускает async-валидаторы только если все sync-валидаторы прошли успешно.
Каждый из них должен завершиться, прежде чем будут установлены ошибки.

### Встроенные функции-валидаторы {#built-in-validator-functions}

Можно [написать собственные функции-валидаторы](#defining-custom-validators) или использовать встроенные валидаторы Angular.

Те же встроенные валидаторы, что доступны как атрибуты в template-driven формах (`required`, `minlength` и другие), доступны и как функции класса `Validators`.
Полный список встроенных валидаторов см. в справочнике API [Validators](api/forms/Validators).

Чтобы сделать форму актёра reactive, используйте те же
встроенные валидаторы — на этот раз в виде функций, как в следующем примере.

<docs-code header="actor-form-reactive.component.ts (validator functions)" path="adev/src/content/examples/form-validation/src/app/reactive/actor-form-reactive.component.1.ts" region="form-group"/>

В этом примере контрол `name` настраивает два встроенных валидатора —`Validators.required` и `Validators.minLength(4)`— и один пользовательский, `forbiddenNameValidator`.

Все эти валидаторы синхронные, поэтому передаются вторым аргументом.
Несколько валидаторов можно передать массивом функций.

В примере также добавлены несколько getter-методов.
В reactive форме к любому контролу всегда можно обратиться через метод `get` родительской группы, но иногда удобно определить getters как сокращения для шаблона.

Если снова посмотреть на шаблон для input `name`, он довольно похож на template-driven пример.

<docs-code header="actor-form-reactive.component.html (name with error msg)" path="adev/src/content/examples/form-validation/src/app/reactive/actor-form-reactive.component.html" region="name-with-error-msg"/>

Эта форма отличается от template-driven версии тем, что больше не экспортирует директивы. Вместо этого используется getter `name`, определённый в классе компонента.

Обратите внимание, что атрибут `required` по-прежнему присутствует в шаблоне. Для валидации он не обязателен, но его стоит оставить ради доступности.

## Определение пользовательских валидаторов {#defining-custom-validators}

Встроенные валидаторы не всегда покрывают точный сценарий приложения, поэтому иногда нужно создать пользовательский валидатор.

Рассмотрим функцию `forbiddenNameValidator` из предыдущего примера.
Вот как выглядит её определение.

<docs-code header="forbidden-name.directive.ts (forbiddenNameValidator)" path="adev/src/content/examples/form-validation/src/app/shared/forbidden-name.directive.ts" region="custom-validator"/>

Функция — фабрика: она принимает регулярное выражение для обнаружения _конкретного_ запрещённого имени и возвращает функцию-валидатор.

В этом примере запрещённое имя — "bob", поэтому валидатор отклоняет любое имя актёра, содержащее "bob".
В другом месте он мог бы отклонять "alice" или любое имя, которое совпадает с настроенным регулярным выражением.

Фабрика `forbiddenNameValidator` возвращает настроенную функцию-валидатор.
Эта функция принимает объект контрола Angular и возвращает _либо_ null, если значение контрола валидно, _либо_ объект ошибки валидации.
У объекта ошибки валидации обычно есть свойство с именем ключа валидации `'forbiddenName'` и значением — произвольным словарём данных, которые можно подставить в сообщение об ошибке, `{name}`.

Пользовательские async-валидаторы похожи на sync-валидаторы, но вместо этого должны возвращать Promise или observable, который позже эмитит null или объект ошибки валидации.
В случае observable поток должен завершиться; форма использует последнее эмитированное значение для валидации.

### Добавление пользовательских валидаторов в reactive формы {#adding-custom-validators-to-reactive-forms}

В reactive формах пользовательский валидатор добавляется передачей функции напрямую в `FormControl`.

<docs-code header="actor-form-reactive.component.ts (validator functions)" path="adev/src/content/examples/form-validation/src/app/reactive/actor-form-reactive.component.1.ts" region="custom-validator"/>

### Добавление пользовательских валидаторов в template-driven формы {#adding-custom-validators-to-template-driven-forms}

В template-driven формах в шаблон добавляется директива, которая оборачивает функцию-валидатор.
Например, соответствующая `ForbiddenValidatorDirective` служит обёрткой вокруг `forbiddenNameValidator`.

Angular распознаёт роль директивы в процессе валидации, потому что директива регистрирует себя через провайдер `NG_VALIDATORS`, как показано в следующем примере.
`NG_VALIDATORS` — предопределённый провайдер с расширяемой коллекцией валидаторов.

<docs-code header="forbidden-name.directive.ts (providers)" path="adev/src/content/examples/form-validation/src/app/shared/forbidden-name.directive.ts" region="directive-providers"/>

Класс директивы затем реализует интерфейс `Validator`, чтобы легко интегрироваться с формами Angular.
Ниже — остальная часть директивы, чтобы было понятно, как всё складывается вместе.

<docs-code header="forbidden-name.directive.ts (directive)" path="adev/src/content/examples/form-validation/src/app/shared/forbidden-name.directive.ts" region="directive"/>

Когда `ForbiddenValidatorDirective` готова, её селектор `appForbiddenName` можно добавить к любому input-элементу, чтобы активировать её.
Например:

<docs-code header="actor-form-template.component.html (forbidden-name-input)" path="adev/src/content/examples/form-validation/src/app/template/actor-form-template.component.html" region="name-input"/>

HELPFUL: Обратите внимание, что пользовательская директива валидации создаётся с `useExisting`, а не с `useClass`.
Зарегистрированный валидатор должен быть _именно этим экземпляром_ `ForbiddenValidatorDirective` — экземпляром в форме со свойством `forbiddenName`, привязанным к "bob".

Если заменить `useExisting` на `useClass`, будет зарегистрирован новый экземпляр класса без `forbiddenName`.

## CSS-классы статуса контрола {#control-status-css-classes}

Angular автоматически отражает многие свойства контрола на элемент контрола формы в виде CSS-классов.
Используйте эти классы, чтобы стилизовать элементы контролов в соответствии с состоянием формы.
Сейчас поддерживаются следующие классы.

- `.ng-valid`
- `.ng-invalid`
- `.ng-pending`
- `.ng-pristine`
- `.ng-dirty`
- `.ng-untouched`
- `.ng-touched`
- `.ng-submitted` \(только на охватывающем элементе формы\)

В следующем примере форма актёра использует классы `.ng-valid` и `.ng-invalid`, чтобы
задать цвет границы каждого контрола формы.

<docs-code header="forms.css (status classes)" path="adev/src/content/examples/form-validation/src/assets/forms.css"/>

## Кросс-полевая валидация {#cross-field-validation}

Кросс-полевой валидатор — это [пользовательский валидатор](#defining-custom-validators 'Читать о пользовательских валидаторах'), который сравнивает значения разных полей формы и принимает или отклоняет их в совокупности.
Например, в форме могут быть взаимоисключающие варианты: пользователь может выбрать A или B, но не оба.
Некоторые значения полей могут зависеть от других: выбрать B разрешено только если также выбрано A.

Следующие примеры кросс-валидации показывают, как:

- Валидировать ввод reactive или template-based формы на основе значений двух соседних контролов,
- Показать понятное сообщение об ошибке после того, как пользователь взаимодействовал с формой и валидация не прошла.

В примерах кросс-валидация гарантирует, что актёры не используют одно и то же имя в роли при заполнении Actor Form.
Валидаторы проверяют, что имена актёров и роли не совпадают.

### Добавление кросс-валидации в reactive формы {#adding-cross-validation-to-reactive-forms}

Форма имеет следующую структуру:

```ts
const actorForm = new FormGroup({
  'name': new FormControl(),
  'role': new FormControl(),
  'skill': new FormControl(),
});
```

Обратите внимание, что `name` и `role` — соседние контролы.
Чтобы оценить оба контрола в одном пользовательском валидаторе, валидацию нужно выполнять в общем предке: `FormGroup`.
У `FormGroup` запрашиваются дочерние контролы, чтобы сравнить их значения.

Чтобы добавить валидатор к `FormGroup`, передайте новый валидатор вторым аргументом при создании.

```ts
const actorForm = new FormGroup(
  {
    'name': new FormControl(),
    'role': new FormControl(),
    'skill': new FormControl(),
  },
  {validators: unambiguousRoleValidator},
);
```

Код валидатора выглядит так.

<docs-code header="unambiguous-role.directive.ts" path="adev/src/content/examples/form-validation/src/app/shared/unambiguous-role.directive.ts" region="cross-validation-validator"/>

Валидатор `unambiguousRoleValidator` реализует интерфейс `ValidatorFn`.
Он принимает объект контрола Angular и возвращает либо null, если форма валидна, либо `ValidationErrors` в противном случае.

Валидатор получает дочерние контролы через метод [get](api/forms/AbstractControl#get) у `FormGroup`, затем сравнивает значения контролов `name` и `role`.

Если значения не совпадают, роль однозначна, оба валидны, и валидатор возвращает null.
Если совпадают, роль актёра неоднозначна, и валидатор должен пометить форму как невалидную, вернув объект ошибки.

Для лучшего UX шаблон показывает подходящее сообщение об ошибке, когда форма невалидна.

<docs-code header="actor-form-template.component.html" path="adev/src/content/examples/form-validation/src/app/reactive/actor-form-reactive.component.html" region="cross-validation-error-message"/>

Этот `@if` показывает ошибку, если у `FormGroup` есть ошибка кросс-валидации от `unambiguousRoleValidator`, но только если пользователь завершил [взаимодействие с формой](#control-status-css-classes).

### Добавление кросс-валидации в template-driven формы {#adding-cross-validation-to-template-driven-forms}

Для template-driven формы нужно создать директиву, оборачивающую функцию-валидатор.
Эту директиву предоставляют как валидатор через [`NG_VALIDATORS` token](/api/forms/NG_VALIDATORS), как показано в следующем примере.

<docs-code header="unambiguous-role.directive.ts" path="adev/src/content/examples/form-validation/src/app/shared/unambiguous-role.directive.ts" region="cross-validation-directive"/>

Новую директиву нужно добавить в HTML-шаблон.
Поскольку валидатор должен быть зарегистрирован на самом верхнем уровне формы, в следующем шаблоне директива ставится на тег `form`.

<docs-code header="actor-form-template.component.html" path="adev/src/content/examples/form-validation/src/app/template/actor-form-template.component.html" region="cross-validation-register-validator"/>

Для лучшего UX при невалидной форме появляется подходящее сообщение об ошибке.

<docs-code header="actor-form-template.component.html" path="adev/src/content/examples/form-validation/src/app/template/actor-form-template.component.html" region="cross-validation-error-message"/>

Это одинаково и для template-driven, и для reactive форм.

## Создание асинхронных валидаторов {#creating-asynchronous-validators}

Асинхронные валидаторы реализуют интерфейсы `AsyncValidatorFn` и `AsyncValidator`.
Они очень похожи на синхронные аналоги, со следующими отличиями.

- Функции `validate()` должны возвращать Promise или observable,
- Возвращаемый observable должен быть конечным, то есть в какой-то момент завершиться.
  Чтобы превратить бесконечный observable в конечный, пропустите его через фильтрующий оператор, например `first`, `last`, `take` или `takeUntil`.

Асинхронная валидация выполняется после синхронной и только если синхронная валидация успешна.
Эта проверка позволяет формам избегать потенциально дорогих async-процессов валидации \(например, HTTP-запроса\), если более базовые методы валидации уже нашли невалидный ввод.

После начала асинхронной валидации контрол формы переходит в состояние `pending`.
Проверяйте свойство `pending` контрола и используйте его для визуальной обратной связи о текущей операции валидации.

Распространённый UI-паттерн — показывать спиннер, пока выполняется async-валидация.
Следующий пример показывает, как сделать это в template-driven форме.

```angular-html
<input [(ngModel)]="name" #model="ngModel" appSomeAsyncValidator />

@if (model.pending) {
  <app-spinner />
}
```

### Реализация пользовательского async-валидатора {#implementing-a-custom-async-validator}

В следующем примере async-валидатор гарантирует, что актёры назначаются на роль, которая ещё не занята.
Новые актёры постоянно проходят пробы, старые уходят на пенсию, поэтому список доступных ролей нельзя получить заранее.
Чтобы валидировать потенциальный ввод роли, валидатор должен инициировать асинхронную операцию — обратиться к центральной базе всех текущих актёров.

Следующий код создаёт класс валидатора `UniqueRoleValidator`, реализующий интерфейс `AsyncValidator`.

<docs-code header="role.directive.ts" path="adev/src/content/examples/form-validation/src/app/shared/role.directive.ts" region="async-validator"/>

Свойство `actorsService` инициализируется экземпляром токена `ActorsService`, который определяет следующий интерфейс.

```ts
interface ActorsService {
  isRoleTaken: (role: string) => Observable<boolean>;
}
```

В реальном приложении `ActorsService` отвечал бы за HTTP-запрос к базе актёров, чтобы проверить доступность роли.
С точки зрения валидатора конкретная реализация сервиса не важна, поэтому пример может опираться только на интерфейс `ActorsService`.

Когда валидация начинается, `UniqueRoleValidator` делегирует методу `ActorsService` `isRoleTaken()` текущее значение контрола.
В этот момент контрол помечается как `pending` и остаётся в этом состоянии, пока цепочка observable, возвращённая из `validate()`, не завершится.

Метод `isRoleTaken()` отправляет HTTP-запрос, проверяющий доступность роли, и возвращает `Observable<boolean>` как результат.
Метод `validate()` пропускает ответ через оператор `map` и преобразует его в результат валидации.

Затем метод, как любой валидатор, возвращает `null`, если форма валидна, и `ValidationErrors`, если нет.
Этот валидатор обрабатывает возможные ошибки оператором `catchError`.
В данном случае ошибка `isRoleTaken()` трактуется как успешная валидация, потому что сбой запроса валидации не обязательно означает, что роль невалидна.
Ошибку можно обработать иначе и вместо этого вернуть объект `ValidationError`.

Через некоторое время цепочка observable завершается, и асинхронная валидация закончена.
Флаг `pending` становится `false`, и валидность формы обновляется.

### Добавление async-валидаторов в reactive формы {#adding-async-validators-to-reactive-forms}

Чтобы использовать async-валидатор в reactive формах, сначала внедрите валидатор в свойство класса компонента.

<docs-code header="actor-form-reactive.component.2.ts" path="adev/src/content/examples/form-validation/src/app/reactive/actor-form-reactive.component.2.ts" region="async-validator-inject"/>

Затем передайте функцию-валидатор напрямую в `FormControl`, чтобы применить её.

В следующем примере функция `validate` у `UniqueRoleValidator` применяется к `roleControl` через опцию `asyncValidators` контрола с привязкой к экземпляру `UniqueRoleValidator`, внедрённому в `ActorFormReactiveComponent`.
Значение `asyncValidators` может быть одной async-функцией-валидатором или массивом функций.
Подробнее об опциях `FormControl` см. в справочнике API [AbstractControlOptions](api/forms/AbstractControlOptions).

<docs-code header="actor-form-reactive.component.2.ts" path="adev/src/content/examples/form-validation/src/app/reactive/actor-form-reactive.component.2.ts" region="async-validator-usage"/>

### Добавление async-валидаторов в template-driven формы {#adding-async-validators-to-template-driven-forms}

Чтобы использовать async-валидатор в template-driven формах, создайте новую директиву и зарегистрируйте на ней провайдер `NG_ASYNC_VALIDATORS`.

В примере ниже директива внедряет класс `UniqueRoleValidator` с фактической логикой валидации и вызывает его в функции `validate`, которую Angular запускает, когда нужна валидация.

<docs-code header="role.directive.ts" path="adev/src/content/examples/form-validation/src/app/shared/role.directive.ts" region="async-validator-directive"/>

Затем, как и с синхронными валидаторами, добавьте селектор директивы к input, чтобы активировать её.

<docs-code header="actor-form-template.component.html (unique-unambiguous-role-input)" path="adev/src/content/examples/form-validation/src/app/template/actor-form-template.component.html" region="role-input"/>

### Оптимизация производительности async-валидаторов {#optimizing-performance-of-async-validators}

По умолчанию все валидаторы запускаются после каждого изменения значения формы.
У синхронных валидаторов это обычно не заметно влияет на производительность приложения.
Async-валидаторы же часто выполняют HTTP-запрос для валидации контрола.
Отправлять HTTP-запрос после каждого нажатия клавиши может нагружать backend API, и этого по возможности стоит избегать.

Обновление валидности формы можно отложить, изменив свойство `updateOn` с `change` (по умолчанию) на `submit` или `blur`.

В template-driven формах свойство задаётся в шаблоне.

```angular-html
<input [(ngModel)]="name" [ngModelOptions]="{updateOn: 'blur'}" />
```

В reactive формах свойство задаётся в экземпляре `FormControl`.

```ts
new FormControl('', {updateOn: 'blur'});
```

## Динамическое управление валидаторами в reactive формах {#managing-validators-dynamically-in-reactive-forms}

В сложных reactive формах может понадобиться добавлять, удалять или изменять валидаторы на основе ввода пользователя или состояния приложения.
Angular предоставляет несколько методов на `AbstractControl` для управления валидаторами во время выполнения без пересоздания контролов формы.

### Добавление и удаление валидаторов {#adding-and-removing-validators}

Методы [`addValidators`](api/forms/AbstractControl#addValidators) и [`removeValidators`](api/forms/AbstractControl#removeValidators) позволяют изменять валидаторы контрола после инициализации.

```ts
onCountryChange(country: string) {
    const postalCodeControl = this.profileForm.get('postalCode');

    if (country === 'US') {
      // Add validators for US postal codes
      postalCodeControl.addValidators([Validators.required, Validators.pattern(/^\d{5}$/)]);
    } else {
      // Remove validators when not US
      postalCodeControl.removeValidators([Validators.required]);
    }

    postalCodeControl.updateValueAndValidity();
}
```

### Замена всех валидаторов {#replacing-all-validators}

Используйте [`setValidators`](api/forms/AbstractControl#setValidators), чтобы заменить все существующие синхронные валидаторы контрола, или [`clearValidators`](api/forms/AbstractControl#clearValidators), чтобы удалить все валидаторы.

```ts
toggleStrictNameValidation(isStrict: boolean) {
  const nameControl = this.profileForm.get('name');

  if (enable) {
    // Set strict validation rules
    nameControl.setValidators([
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^[a-zA-Z]+$/),
    ]);
  } else {
    // Clear all validators
    nameControl.clearValidators();
  }

  nameControl.updateValueAndValidity();
}
```

Тот же паттерн применяется к async-валидаторам через [`addAsyncValidators`](api/forms/AbstractControl#addAsyncValidators), [`removeAsyncValidators`](api/forms/AbstractControl#removeAsyncValidators), [`setAsyncValidators`](api/forms/AbstractControl#setAsyncValidators) и [`clearAsyncValidators`](api/forms/AbstractControl#clearAsyncValidators).

### Запуск обновления валидации {#triggering-validation-updates}

После изменения валидаторов вызовите [`updateValueAndValidity`](api/forms/AbstractControl#updateValueAndValidity), чтобы пересчитать статус валидации контрола.
Метод принимает опции для управления поведением обновления.

```ts
// Update control and notify parent
control.updateValueAndValidity();

// Update control only, don't notify parent or emit events
control.updateValueAndValidity({onlySelf: true, emitEvent: false});
```

## Взаимодействие с нативной HTML-валидацией форм {#interaction-with-native-html-form-validation}

По умолчанию Angular отключает [нативную HTML-валидацию форм](https://developer.mozilla.org/docs/Web/Guide/HTML/Constraint_validation), добавляя атрибут `novalidate` на охватывающий `<form>`, и использует директивы для сопоставления этих атрибутов с функциями-валидаторами фреймворка.
Если нужно использовать нативную валидацию **вместе** с валидацией на основе Angular, её можно снова включить директивой `ngNativeValidate`.
Подробности см. в [документации API](api/forms/NgForm#native-dom-validation-ui).
