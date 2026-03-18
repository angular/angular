# Проектирование модели формы {#designing-your-form-model}

Signal Forms использует подход, управляемый моделью, напрямую выводя состояние и структуру формы из предоставляемой вами модели. Поскольку она служит основой всей формы, важно начать с хорошо спроектированной модели формы. В этом руководстве рассматриваются лучшие практики проектирования моделей форм.

## Модель формы vs доменная модель {#form-model-vs-domain-model}

Формы используются для сбора пользовательского ввода. Ваше приложение, вероятно, имеет доменную модель для представления этого ввода в виде, оптимизированном для бизнес-логики или хранения. Однако это часто _отличается_ от того, как мы хотим моделировать данные в форме.

Модель формы представляет необработанный пользовательский ввод в том виде, в котором он появляется в UI. Например, в форме вы можете попросить пользователя выбрать дату и временной слот для встречи в виде отдельных полей ввода, даже если ваша доменная модель представляет это как единый объект JavaScript `Date`.

```ts
interface AppointmentFormModel {
  name: string; // Appointment owner's name
  date: Date; // Appointment date (carries only date information, time component is unused)
  time: string; // Selected time as a string
}

interface AppointmentDomainModel {
  name: string; // Appointment owner's name
  time: Date; // Appointment time (carries both date and time information)
}
```

Формы должны использовать модель формы, адаптированную к процессу ввода, а не просто переиспользовать доменную модель.

## Лучшие практики модели формы {#form-model-best-practices}

### Используйте конкретные типы {#use-specific-types}

Всегда определяйте интерфейсы или типы для моделей, как показано в [Использование типов TypeScript](/guide/forms/signals/models#using-typescript-types). Явные типы обеспечивают лучший IntelliSense, обнаруживают ошибки во время компиляции и служат документацией о том, какие данные содержит форма.

### Инициализируйте все поля {#initialize-all-fields}

Предоставляйте начальные значения для каждого поля в модели:

```ts {prefer, header: 'All fields initialized'}
const taskModel = signal({
  title: '',
  description: '',
  priority: 'medium',
  completed: false,
});
```

```ts {avoid, header: 'Partial initialization'}
const taskModel = signal({
  title: '',
  // Missing description, priority, completed
});
```

Отсутствие начальных значений означает, что эти поля не будут существовать в дереве полей, делая их недоступными для взаимодействия с формой.

### Делайте модели сфокусированными {#keep-models-focused}

Каждая модель должна представлять одну форму или связанный набор данных:

```ts {prefer, header: 'Focused on a single purpose'}
const loginModel = signal({
  email: '',
  password: '',
});
```

```ts {avoid, header: 'Mixing unrelated concerns'}
const appModel = signal({
  // Login data
  email: '',
  password: '',
  // User preferences
  theme: 'light',
  language: 'en',
  // Shopping cart
  cartItems: [],
});
```

Раздельные модели для разных задач делают формы проще для понимания и повторного использования. Создавайте несколько форм, если управляете отдельными наборами данных.

### Учитывайте требования валидации {#consider-validation-requirements}

Проектируйте модели с учётом валидации. Группируйте поля, которые валидируются вместе:

```ts {prefer, header: 'Related fields grouped for comparison'}
// Password fields grouped for comparison
interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

Такая структура делает кросс-поля валидацию (например, проверку совпадения `newPassword` с `confirmPassword`) более естественной.

### Сопоставляйте типы данных с UI-элементами управления {#match-data-types-to-ui-controls}

Свойства модели формы должны соответствовать типам данных, ожидаемым вашими UI-элементами управления.

Например, рассмотрим форму заказа напитков с полем `size` (упаковка по 6, 12 или 24 штуки) и полем `quantity`. UI использует выпадающий список (`<select>`) для размера и числовой ввод (`<input type="number">`) для количества.

Хотя варианты размера выглядят числовыми, элементы `<select>` работают со строковыми значениями, поэтому `size` должен быть смоделирован как строка. `<input type="number">`, напротив, работает с числами, поэтому `quantity` может быть смоделирован как число.

```ts {prefer, header: 'Appropriate data types for the bound UI controls'}
interface BeverageOrderFormModel {
  size: string; // Bound to: <select> (option values: "6", "12", "24")
  quantity: number; // Bound to: <input type="number">
}
```

### Избегайте `undefined` {#avoid-undefined}

Модель формы не должна содержать значения или свойства `undefined`. В Signal Forms структура формы выводится из структуры модели, и `undefined` означает _отсутствие поля_, а не поле с пустым значением. Это означает, что необходимо также избегать необязательных полей (например, `{property?: string}`), поскольку они неявно допускают `undefined`.

Чтобы представить свойство с пустым значением в модели формы, используйте значение, которое UI-элемент управления понимает как «пусто» (например, `""` для `<input type="text">`). Если вы проектируете пользовательский UI-элемент управления, `null` часто служит хорошим значением для обозначения «пусто».

```ts {prefer, header: 'Appropriate empty values'}
interface UserFormModel {
  name: string; // Bound to <input type="text">
  birthday: Date | null; // Bound to <input type="date">
}

// Initialize our form with empty values.
form(signal({name: '', birthday: null}));
```

### Избегайте моделей с динамической структурой {#avoid-models-with-dynamic-structure}

Модель формы имеет динамическую структуру, если она меняет форму (если свойства объекта меняются) в зависимости от её значения. Это происходит, когда тип модели допускает значения с разными формами, например объединение типов объектов с разными свойствами или объединение объекта и примитива. В следующих разделах рассматриваются несколько распространённых сценариев, где модели с динамической структурой могут казаться привлекательными, но в итоге оказываются проблематичными.

#### Пустое значение для сложного объекта {#empty-value-for-a-complex-object}

Мы часто используем формы для ввода пользователем совершенно новых данных, а не для редактирования существующих. Хорошим примером является форма создания аккаунта. Мы можем смоделировать это с помощью следующей модели формы.

```ts
interface CreateAccountFormModel {
  name: {
    first: string;
    last: string;
  };
  username: string;
}
```

При создании формы мы сталкиваемся с дилеммой: каким должно быть начальное значение в модели? Может возникнуть соблазн создать `form<CreateAccountFormModel | null>()`, поскольку у нас ещё нет ввода от пользователя.

```ts {avoid, header: 'Using null as empty value for complex object'}
createAccountForm = form<CreateAccountFormModel | null>(signal(/* what goes here, null? */));
```

Однако важно помнить, что Signal Forms _управляется моделью_. Если наша модель — `null` и у `null` нет свойств `name` или `username`, это означает, что наша форма тоже не будет иметь этих подполей. Вместо этого нам действительно нужен экземпляр `CreateAccountFormModel` со всеми листовыми полями, установленными в пустое значение.

```ts {prefer, header: 'Same shape value with empty values for properties'}
createAccountForm = form<CreateAccountFormModel>(
  signal({
    name: {
      first: '',
      last: '',
    },
    username: '',
  }),
);
```

Используя это представление, все необходимые нам подполя теперь существуют, и мы можем привязать их с помощью директивы `[formField]` в шаблоне.

```html
First: <input [formField]="createAccountForm.name.first" /> Last:
<input [formField]="createAccountForm.name.last" /> Username:
<input [formField]="createAccountForm.username" />
```

#### Поля, которые условно скрыты или недоступны {#fields-that-are-conditionally-hidden-or-unavailable}

Формы не всегда линейны. Часто нужно создавать условные пути на основе предыдущего ввода пользователя. Один из примеров — форма, в которой мы предлагаем пользователю разные варианты оплаты. Давайте начнём с представления того, как может выглядеть UI такой формы.

```html
Name: <input type="text" />

<section>
  <h2>Payment Info</h2>
  <input type="radio" /> Credit Card @if (/* credit card selected */) {
  <section>
    Card Number <input type="text" /> Security Code <input type="text" /> Expiration
    <input type="text" />
  </section>
  }
  <input type="radio" /> Bank Account @if (/* bank account selected */) {
  <section>Account Number <input type="text" /> Routing Number <input type="text" /></section>
  }
</section>
```

Лучший способ справиться с этим — использовать модель формы со статической структурой, включающей поля для _всех_ потенциальных способов оплаты. В схеме можно скрыть или отключить поля, которые в данный момент недоступны.

```ts {prefer, header: 'Static structure model'}
interface BillPayFormModel {
  name: string;
  method: {
    type: string;
    card: {
      cardNumber: string;
      securityCode: string;
      expiration: string;
    };
    bank: {
      accountNumber: string;
      routingNumber: string;
    };
  };
}

const billPaySchema = schema<BillPayFormModel>((billPay) => {
  // Hide credit card details when user has selected a method other than credit card.
  hidden(billPay.method.card, ({valueOf}) => valueOf(billPay.method.type) !== 'card');
  // Hide bank account details when user has selected a method other than bank account.
  hidden(billPay.method.bank, ({valueOf}) => valueOf(billPay.method.type) !== 'bank');
});
```

Используя эту модель, оба объекта `card` и `bank` всегда присутствуют в состоянии формы. Когда пользователь переключает способ оплаты, мы обновляем только свойство `type`. Данные, введённые в поля карты, безопасно хранятся в объекте `card`, готовые к повторному отображению при переключении обратно.

Напротив, динамическая модель формы может изначально казаться подходящей для этого случая. В конце концов, нам не нужны поля для номера счёта и маршрутного номера, если пользователь выбрал «Кредитная карта». Нас может возникнуть соблазн смоделировать это как дискриминированное объединение:

```ts {avoid, header: 'Dynamic structure model'}
interface BillPayFormModel {
  name: string;
  method:
    | {
        type: 'card';
        cardNumber: string;
        securityCode: string;
        expiration: string;
      }
    | {
        type: 'bank';
        accountNumber: string;
        routingNumber: string;
      };
}
```

Однако рассмотрим следующий сценарий:

1. Пользователь заполняет имя и данные кредитной карты
2. Он готов отправить, но в последний момент замечает комиссию за удобство
3. Он переключается на вариант банковского счёта, решив избежать комиссии
4. Он начинает вводить данные банковского счёта, но задумывается — не хотел бы, чтобы данные попали в утечку
5. Он переключается обратно на кредитную карту, но обнаруживает, что все только что введённые данные исчезли!

Это иллюстрирует ещё одну проблему с моделями форм с динамической структурой: они могут вызывать потерю данных. Такая модель предполагает, что как только поле становится скрытым, информация в нём больше никогда не понадобится. Она заменяет данные кредитной карты данными банковского счёта и не может вернуть данные кредитной карты обратно.

#### Исключения {#exceptions}

Хотя статическая структура в целом предпочтительна, существуют конкретные сценарии, где динамическая структура необходима и поддерживается.

##### Массивы {#arrays}

Массивы являются наиболее распространённым исключением. Формы часто должны собирать переменное количество элементов, например список номеров телефонов, участников или позиций в заказе.

```ts
interface SendEmailFormModel {
  subject: string;
  recipientEmails: string[];
}
```

В этом случае массив `recipientEmails` растёт и уменьшается по мере взаимодействия пользователя с формой. Хотя длина массива динамична, структура отдельных элементов должна быть одинаковой (каждый элемент должен иметь одну и ту же форму).

##### Поля, обрабатываемые атомарно UI-элементом управления {#fields-that-are-treated-atomically-by-the-ui-control}

Ещё один случай, когда динамическая структура приемлема — когда сложный объект обрабатывается как единое, атомарное значение UI-элементом управления. То есть если элемент управления не пытается привязаться к каким-либо подполям или обращаться к ним индивидуально. В этом сценарии элемент управления обновляет значение, заменяя весь объект сразу, а не изменяя его внутренние свойства. Поскольку структура формы в этом сценарии несущественна, допустимо, чтобы эта структура была динамической.

Например, рассмотрим форму профиля пользователя, включающую поле `location`. Местоположение выбирается с помощью сложного виджета «выбора местоположения» (возможно, карты или выпадающего списка с поиском), который возвращает объект координат. В случае, когда местоположение ещё не выбрано или пользователь решает не делиться местоположением, выбор указывает местоположение как `null`.

```ts {prefer, header: 'Dynamic structure is ok when field is treated as atomic'}
interface Location {
  lat: number;
  lng: number;
}

interface UserProfileFormModel {
  username: string;
  // This property has dynamic structure,
  // but that's ok because the location picker treats this field as atomic.
  location: Location | null;
}
```

В шаблоне мы привязываем поле `location` непосредственно к нашему пользовательскому элементу управления:

```html
Username: <input [formField]="userForm.username" /> Location:
<location-picker [formField]="userForm.location"></location-picker>
```

Здесь `<location-picker>` потребляет и производит весь объект `Location` (или `null`) и не обращается к `userForm.location.lat` или `userForm.location.lng`. Поэтому `location` может безопасно иметь динамическую форму без нарушения принципов форм, управляемых моделью.

## Перевод между моделью формы и доменной моделью {#translating-between-form-model-and-domain-model}

Поскольку модель формы и доменная модель представляют одну и ту же концепцию по-разному, нам нужен способ перевода между этими разными представлениями. Когда мы хотим представить пользователю в форме некоторые существующие данные из системы, нам нужно преобразовать их из представления доменной модели в представление модели формы. И наоборот, когда мы хотим сохранить изменения пользователя, нам нужно преобразовать данные из представления модели формы в представление доменной модели.

Представим, что у нас есть доменная модель и модель формы, и мы написали функции для преобразования между ними.

```ts
interface MyDomainModel { ... }

interface MyFormModel { ... }

// Instance of `MyFormModel` populated with empty input (e.g. `''` for string inputs, etc.)
const EMPTY_MY_FORM_MODEL: MyFormModel = { ... };

function domainModelToFormModel(domainModel: MyDomainModel): MyFormModel { ... }

function formModelToDomainModel(formModel: MyFormModel): MyDomainModel { ... }
```

### Из доменной модели в модель формы {#domain-model-to-form-model}

Когда мы создаём форму для редактирования некоторой существующей доменной модели в системе, мы обычно получаем эту доменную модель либо как `input()` компонента формы, либо из бэкенда (например, через resource). В любом случае `linkedSignal` предоставляет отличный способ применить преобразование.

В случае получения доменной модели как `input()` можно использовать `linkedSignal` для создания записываемой модели формы из входного сигнала.

```ts {prefer, header: 'Use linkedSignal to convert domain model to form model'}
@Component(...)
class MyForm {
  // The domain model to initialize the form with, if not given we start with an empty form.
  readonly domainModel = input<MyDomainModel>();

  private readonly formModel = linkedSignal({
    // Linked signal based on the domain model
    source: this.domainModel,
    // If domain model is defined convert it to a form model, otherwise use an empty form model.
    computation: (domainModel) => domainModel
      ? domainModelToFormModel(domainModel)
      : EMPTY_MY_FORM_MODEL
  });

  protected readonly myForm = form(this.formModel);
}
```

Аналогично, когда мы получаем доменную модель с бэкенда через resource, можно создать `linkedSignal` на основе её значения для создания `formModel`. В этом сценарии получение доменной модели может занять некоторое время, и нам следует отключить форму до загрузки данных.

```ts {prefer, header: 'Disable or hide the form when data is unavailable'}
@Component(...)
class MyForm {
  // Fetch the domain model from the backend.
  readonly domainModelResource: ResourceRef<MyDomainModel | undefined> = httpResource(...);

  private readonly formModel = linkedSignal({
    // Linked signal based on the domain model resource
    source: this.domainModelResource.value,
    // Convert the domain model once it loads, use an empty form model while loading.
    computation: (domainModel) => domainModel
      ? domainModelToFormModel(domainModel)
      : EMPTY_MY_FORM_MODEL
  });

  protected readonly myForm = form(this.formModel, (root) => {
    // Disable the entire form when the resource is loading.
    disabled(root, () => this.domainModelResource.isLoading());
  });
}
```

Приведённые выше примеры показывают чистое выведение модели формы непосредственно из доменной модели. Однако в некоторых случаях может потребоваться более сложная операция сравнения между новым значением доменной модели и предыдущими значениями доменной модели и модели формы. Это можно реализовать на основе [предыдущего состояния](/guide/signals/linked-signal#accounting-for-previous-state) `linkedSignal`.

### Из модели формы в доменную модель {#form-model-to-domain-model}

Когда мы готовы сохранить пользовательский ввод обратно в систему, нам нужно преобразовать его в представление доменной модели. Обычно это происходит при отправке формы пользователем или непрерывно по мере редактирования для формы с автосохранением.

Для сохранения при отправке можно обработать преобразование в функции `submit`.

```ts {prefer, header: 'Convert form model to domain model on submit'}
@Component(...)
class MyForm {
  private readonly myDataService = inject(MyDataService);

  protected readonly myForm = form<MyFormModel>(...);

  handleSubmit() {
    submit(this.myForm, async () => {
      await this.myDataService.update(formModelToDomainModel(this.myForm.value()));
    });
  };
}
```

Как вариант, можно также отправить модель формы непосредственно на сервер и выполнить преобразование из модели формы в доменную модель на стороне сервера.

Для непрерывного сохранения обновляйте доменную модель в `effect`.

```ts {prefer, header: 'Convert form model to domain model in an effect for auto-saving'}
@Component(...)
class MyForm {
  readonly domainModel = model.required<MyDomainModel>()

  protected readonly myForm = form(...);

  constructor() {
    effect(() => {
      // When the form model changes to a valid value, update the domain model.
      if (this.myForm().valid()) {
        this.domainModel.set(formModelToDomainModel(this.myForm.value()));
      }
    });
  };
}
```

Приведённые выше примеры показывают чистое преобразование из модели формы в доменную модель. Однако вполне допустимо учитывать полное состояние формы помимо просто значения модели формы. Например, для экономии байт мы можем захотеть отправлять на сервер только частичные обновления на основе того, что изменил пользователь. В этом случае наша функция преобразования может быть разработана так, чтобы принимать всё состояние формы и возвращать разреженную доменную модель на основе значений и состояния dirty формы.

```ts
type Sparse<T> = T extends object ? {
    [P in keyof T]?: Sparse<T[P]>;
} : T;

function formStateToPartialDomainModel(
  formState: FieldState<MyFormModel>
): Sparse<MyDomainModel> { ... }
```
