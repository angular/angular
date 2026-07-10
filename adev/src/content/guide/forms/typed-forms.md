# Типизированные формы

Начиная с Angular 14, reactive forms по умолчанию строго типизированы.

В качестве фона для этого руководства вы уже должны быть знакомы с [Angular Reactive Forms](guide/forms/reactive-forms).

## Обзор типизированных форм {#overview-of-typed-forms}

<docs-video src="https://www.youtube.com/embed/L-odCf4MfJc" alt="Typed Forms in Angular" />

В Angular reactive forms вы явно задаёте _модель формы_. Как простой пример рассмотрим базовую форму входа пользователя:

```ts
const login = new FormGroup({
  email: new FormControl(''),
  password: new FormControl(''),
});
```

Angular предоставляет множество API для взаимодействия с этим `FormGroup`. Например, можно вызвать `login.value`, `login.controls`, `login.patchValue` и т.д. (Полный справочник API см. в [документации API](api/forms/FormGroup).)

В предыдущих версиях Angular большинство этих API где-то в типах включали `any`, и взаимодействие со структурой controls или самими значениями не было типобезопасным. Например, можно было написать следующий некорректный код:

```ts
const emailDomain = login.value.email.domain;
```

Со строго типизированными reactive forms код выше не компилируется, потому что у `email` нет свойства `domain`.

Помимо дополнительной безопасности, типы дают и другие улучшения: лучшее автодополнение в IDE и явный способ задать структуру формы.

Эти улучшения сейчас применяются только к _reactive_ forms (не к [_template-driven_ forms](guide/forms/template-driven-forms)).

## Нетипизированные формы {#untyped-forms}

Нетипизированные формы по-прежнему поддерживаются и продолжают работать как раньше. Чтобы использовать их, нужно импортировать символы `Untyped` из `@angular/forms`:

```ts
const login = new UntypedFormGroup({
  email: new UntypedFormControl(''),
  password: new UntypedFormControl(''),
});
```

Каждый символ `Untyped` имеет ту же семантику, что и в предыдущих версиях Angular. Убрав префиксы `Untyped`, можно постепенно включать типы.

## `FormControl`: начало работы {#formcontrol-getting-started}

Самая простая возможная форма состоит из одного control:

```ts
const email = new FormControl('angularrox@gmail.com');
```

Для этого control автоматически выведется тип `FormControl<string|null>`. TypeScript будет автоматически обеспечивать этот тип во всём [`FormControl` API](api/forms/FormControl), например `email.value`, `email.valueChanges` и `email.setValue(...)`.

### Nullable {#nullability}

Может возникнуть вопрос: почему тип этого control включает `null`? Потому что control может стать `null` в любой момент при вызове reset:

```ts
const email = new FormControl('angularrox@gmail.com');
email.reset();
console.log(email.value); // null
```

TypeScript потребует всегда обрабатывать возможность того, что control стал `null`. Если нужно сделать control non-nullable, используйте опцию `nonNullable`. Тогда control будет сбрасываться к начальному значению, а не к `null`:

```ts
const email = new FormControl('angularrox@gmail.com', {nonNullable: true});
email.reset();
console.log(email.value); // angularrox@gmail.com
```

Повторим: эта опция влияет на runtime-поведение формы при вызове `.reset()` и должна включаться осознанно.

### Явное указание типа {#specifying-an-explicit-type}

Тип можно указать явно, вместо того чтобы полагаться на вывод. Рассмотрим control, инициализированный как `null`. Поскольку начальное значение — `null`, TypeScript выведет `FormControl<null>`, что уже, чем нужно.

```ts
const email = new FormControl(null);
email.setValue('angularrox@gmail.com'); // Error!
```

Чтобы предотвратить это, явно укажите тип как `string|null`:

```ts
const email = new FormControl<string | null>(null);
email.setValue('angularrox@gmail.com');
```

## `FormArray`: динамические однородные коллекции {#formarray-dynamic-homogenous-collections}

`FormArray` содержит открытый список controls. Параметр типа соответствует типу каждого внутреннего control:

```ts
const names = new FormArray([new FormControl('Alex')]);
names.push(new FormControl('Jess'));
```

Передавайте массив controls в `aliases.push()`, когда нужно добавить несколько записей сразу.

```ts
const aliases = new FormArray([new FormControl('ng')]);
aliases.push([new FormControl('ngDev'), new FormControl('ngAwesome')]);
```

У этого `FormArray` тип внутренних controls будет `FormControl<string|null>`.

Если нужны разные типы элементов внутри массива, используйте `UntypedFormArray`, потому что TypeScript не может вывести, какой тип элемента окажется в какой позиции.

У `FormArray` также есть метод `clear()` для удаления всех содержащихся controls:

```ts
const aliases = new FormArray([new FormControl('ngDev'), new FormControl('ngAwesome')]);
aliases.clear();
console.log(aliases.length); // 0
```

## `FormGroup` и `FormRecord` {#formgroup-and-formrecord}

Angular предоставляет тип `FormGroup` для форм с перечислимым набором ключей и тип `FormRecord` для открытых или динамических групп.

### Частичные значения {#partial-values}

Снова рассмотрим форму входа:

```ts
const login = new FormGroup({
  email: new FormControl('', {nonNullable: true}),
  password: new FormControl('', {nonNullable: true}),
});
```

На любом `FormGroup` [можно отключать controls](api/forms/FormGroup). Любой отключённый control не появится в значении группы.

Как следствие, тип `login.value` — `Partial<{email: string, password: string}>`. `Partial` в этом типе означает, что каждый член может быть undefined.

Точнее, тип `login.value.email` — `string|undefined`, и TypeScript потребует обрабатывать возможно `undefined` значение (если включён `strictNullChecks`).

Если нужно получить значение _включая_ отключённые controls и тем самым обойти возможные поля `undefined`, используйте `login.getRawValue()`.

### Опциональные controls и динамические группы {#optional-controls-and-dynamic-groups}

В некоторых формах controls могут присутствовать или отсутствовать и добавляться/удаляться в runtime. Такие controls можно представить через _опциональные поля_:

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

В этой форме мы явно указываем тип, что позволяет сделать control `password` опциональным. TypeScript потребует, чтобы добавлять или удалять можно было только опциональные controls.

### `FormRecord` {#formrecord}

Некоторые использования `FormGroup` не подходят под паттерн выше, потому что ключи заранее неизвестны. Класс `FormRecord` предназначен для этого случая:

```ts
const addresses = new FormRecord<FormControl<string | null>>({});
addresses.addControl('Andrew', new FormControl('2340 Folsom St'));
```

В этот `FormRecord` можно добавить любой control типа `string|null`.

Если нужен `FormGroup`, который одновременно динамический (открытый) и гетерогенный (controls разных типов), улучшенная типобезопасность невозможна — используйте `UntypedFormGroup`.

`FormRecord` также можно построить с помощью `FormBuilder`:

```ts
const addresses = fb.record({'Andrew': '2340 Folsom St'});
```

## `FormBuilder` и `NonNullableFormBuilder` {#formbuilder-and-nonnullableformbuilder}

Класс `FormBuilder` также обновлён для поддержки новых типов, аналогично примерам выше.

Кроме того, доступен дополнительный builder: `NonNullableFormBuilder`. Этот тип — сокращение для указания `{nonNullable: true}` на каждом control и может устранить значительный шаблонный код в крупных non-nullable формах. Доступ к нему — через свойство `nonNullable` у `FormBuilder`:

```ts
const fb = new FormBuilder();
const login = fb.nonNullable.group({
  email: '',
  password: '',
});
```

В примере выше оба внутренних control будут non-nullable (то есть будет установлен `nonNullable`).

Его также можно внедрить по имени `NonNullableFormBuilder`.
