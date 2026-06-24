# Типизированные формы

Начиная с Angular 14, реактивные формы строго типизированы по умолчанию.

В качестве подготовки к этому руководству вы уже должны быть знакомы
с [Реактивными формами Angular](guide/forms/reactive-forms).

## Обзор типизированных форм

<docs-video src="https://www.youtube.com/embed/L-odCf4MfJc" alt="Typed Forms in Angular" />

В реактивных формах Angular вы явно указываете _модель формы_. В качестве простого примера рассмотрим базовую форму
входа пользователя:

```ts
const login = new FormGroup({
  email: new FormControl(''),
  password: new FormControl(''),
});
```

Angular предоставляет множество API для взаимодействия с этим `FormGroup`. Например, вы можете вызывать `login.value`,
`login.controls`, `login.patchValue` и т.д. (Полный справочник API см. в [документации API](api/forms/FormGroup).)

В предыдущих версиях Angular большинство этих API содержали `any` в своих типах, и взаимодействие со структурой
элементов управления или самими значениями не было типобезопасным. Например, вы могли написать следующий невалидный код:

```ts
const emailDomain = login.value.email.domain;
```

При использовании строго типизированных реактивных форм приведенный выше код не скомпилируется, так как у `email` нет
свойства `domain`.

Помимо дополнительной безопасности, типы позволяют реализовать множество других улучшений, таких как лучшее
автодополнение в IDE и явный способ задания структуры формы.

Эти улучшения в настоящее время применимы только к _реактивным_ формам (не к [_формам на основе
шаблонов_](guide/forms/template-driven-forms)).

## Нетипизированные формы (Untyped Forms)

Нетипизированные формы по-прежнему поддерживаются и будут работать так же, как и раньше. Чтобы использовать их,
необходимо импортировать символы `Untyped` из `@angular/forms`:

```ts
const login = new UntypedFormGroup({
  email: new UntypedFormControl(''),
  password: new UntypedFormControl(''),
});
```

Каждый символ `Untyped` имеет точно такую же семантику, как и в предыдущих версиях Angular. Убирая префиксы `Untyped`,
вы можете постепенно включать типизацию.

## `FormControl`: Начало работы

Простейшая форма состоит из одного элемента управления (control):

```ts
const email = new FormControl('angularrox@gmail.com');
```

Тип этого элемента управления будет автоматически выведен как `FormControl<string|null>`. TypeScript будет автоматически
обеспечивать соблюдение этого типа во всем [API `FormControl`](api/forms/FormControl), например `email.value`,
`email.valueChanges`, `email.setValue(...)` и т.д.

### Nullability (Допустимость значения null)

Вы можете задаться вопросом: почему тип этого элемента управления включает `null`? Это связано с тем, что элемент
управления может стать `null` в любой момент при вызове сброса (reset):

```ts
const email = new FormControl('angularrox@gmail.com');
email.reset();
console.log(email.value); // null
```

TypeScript потребует, чтобы вы всегда обрабатывали возможность того, что элемент управления стал `null`. Если вы хотите
сделать этот элемент управления не допускающим значение null (non-nullable), вы можете использовать опцию `nonNullable`.
Это заставит элемент управления сбрасываться к своему начальному значению вместо `null`:

```ts
const email = new FormControl('angularrox@gmail.com', {nonNullable: true});
email.reset();
console.log(email.value); // angularrox@gmail.com
```

Повторим, эта опция влияет на поведение вашей формы во время выполнения при вызове `.reset()`, и ее следует переключать
с осторожностью.

### Явное указание типа

Можно указать тип явно, вместо того чтобы полагаться на вывод типов. Рассмотрим элемент управления, инициализированный
значением `null`. Поскольку начальное значение — `null`, TypeScript выведет тип `FormControl<null>`, что является более
узким типом, чем нам нужно.

```ts
const email = new FormControl(null);
email.setValue('angularrox@gmail.com'); // Ошибка!
```

Чтобы предотвратить это, мы явно указываем тип как `string|null`:

```ts
const email = new FormControl<string|null>(null);
email.setValue('angularrox@gmail.com');
```

## `FormArray`: Динамические однородные коллекции

`FormArray` содержит открытый (неограниченный) список элементов управления. Параметр типа соответствует типу каждого
внутреннего элемента управления:

```ts
const names = new FormArray([new FormControl('Alex')]);
names.push(new FormControl('Jess'));
```

Передайте массив элементов управления в `aliases.push()`, если нужно добавить несколько записей сразу.

```ts
const aliases = new FormArray([new FormControl('ng')]);
aliases.push([new FormControl('ngDev'), new FormControl('ngAwesome')]);
```

Этот `FormArray` будет иметь тип внутренних элементов управления `FormControl<string|null>`.

Если вы хотите иметь несколько различных типов элементов внутри массива, вы должны использовать `UntypedFormArray`, так
как TypeScript не может определить, элемент какого типа будет находиться в какой позиции.

`FormArray` также предоставляет метод `clear()` для удаления всех содержащихся в нем элементов управления:

```ts
const aliases = new FormArray([new FormControl('ngDev'), new FormControl('ngAwesome')]);
aliases.clear();
console.log(aliases.length); // 0
```

## `FormGroup` и `FormRecord`

Angular предоставляет тип `FormGroup` для форм с фиксированным набором ключей и тип под названием `FormRecord` для
открытых или динамических групп.

### Частичные значения (Partial Values)

Снова рассмотрим форму входа:

```ts
const login = new FormGroup({
    email: new FormControl('', {nonNullable: true}),
    password: new FormControl('', {nonNullable: true}),
});
```

В любом `FormGroup` [можно отключать элементы управления](api/forms/FormGroup). Любой отключенный элемент управления не
будет присутствовать в значении группы.

Как следствие, типом `login.value` является `Partial<{email: string, password: string}>`. `Partial` в этом типе
означает, что каждый член может быть `undefined`.

Точнее, типом `login.value.email` является `string|undefined`, и TypeScript потребует, чтобы вы обрабатывали возможное
значение `undefined` (если у вас включен `strictNullChecks`).

Если вы хотите получить доступ к значению, _включая_ отключенные элементы управления, и тем самым обойти возможные поля
`undefined`, вы можете использовать `login.getRawValue()`.

### Необязательные элементы управления и динамические группы

В некоторых формах есть элементы управления, которые могут присутствовать или отсутствовать, и которые могут быть
добавлены или удалены во время выполнения. Вы можете представить эти элементы управления, используя _необязательные
поля_:

```ts
interface LoginForm {
  email: FormControl<string>;
  password?: FormControl<string>;
}

const login = new FormGroup<LoginForm>({
  email: new FormControl('', {nonNullable: true}),
  password: new FormControl('', {nonNullable: true}),
});

login.removeControl('password');
```

В этой форме мы явно указываем тип, что позволяет нам сделать элемент управления `password` необязательным. TypeScript
будет следить за тем, чтобы добавлялись или удалялись только необязательные элементы управления.

### `FormRecord`

Некоторые варианты использования `FormGroup` не подходят под вышеописанный шаблон, так как ключи неизвестны заранее.
Класс `FormRecord` предназначен именно для этого случая:

```ts
const addresses = new FormRecord<FormControl<string|null>>({});
addresses.addControl('Andrew', new FormControl('2340 Folsom St'));
```

Любой элемент управления типа `string|null` может быть добавлен в этот `FormRecord`.

Если вам нужен `FormGroup`, который является одновременно динамическим (открытым) и гетерогенным (элементы управления
имеют разные типы), улучшенная типобезопасность невозможна, и вам следует использовать `UntypedFormGroup`.

`FormRecord` также можно создать с помощью `FormBuilder`:

```ts
const addresses = fb.record({'Andrew': '2340 Folsom St'});
```

## `FormBuilder` и `NonNullableFormBuilder`

Класс `FormBuilder` также был обновлен для поддержки новых типов, аналогично приведенным выше примерам.

Кроме того, доступен дополнительный билдер: `NonNullableFormBuilder`. Этот тип является сокращением для указания
`{nonNullable: true}` для каждого элемента управления и может устранить значительное количество шаблонного кода в
больших формах, не допускающих значения null. Вы можете получить к нему доступ, используя свойство `nonNullable` в
`FormBuilder`:

```ts
const fb = new FormBuilder();
const login = fb.nonNullable.group({
  email: '',
  password: '',
});
```

В приведенном выше примере оба внутренних элемента управления будут non-nullable (т.е. будет установлено `nonNullable`).

Вы также можете внедрить его, используя имя `NonNullableFormBuilder`.
