# Проектирование модели формы

Signal Forms используют model-driven подход: состояние и структура формы выводятся напрямую из предоставленной модели. Поскольку модель — основа всей формы, важно начинать с хорошо спроектированной модели формы. В этом руководстве рассматриваются лучшие практики проектирования моделей форм.

## Модель формы и доменная модель {#form-model-vs-domain-model}

Формы собирают пользовательский ввод. В приложении, скорее всего, есть доменная модель, представляющая этот ввод так, как удобно для бизнес-логики или хранения. Однако это часто _отличается_ от того, как данные моделируются в форме.

Модель формы представляет «сырой» пользовательский ввод так, как он выглядит в UI. Например, в форме можно попросить пользователя выбрать дату и временной слот для встречи отдельными полями ввода, даже если доменная модель представляет это одним объектом JavaScript `Date`.

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

Формы должны использовать модель формы, адаптированную под опыт ввода, а не просто переиспользовать доменную модель.

## Лучшие практики модели формы {#form-model-best-practices}

### Используйте конкретные типы {#use-specific-types}

Всегда определяйте интерфейсы или типы для моделей, как показано в [Использование типов TypeScript](/guide/forms/signals/models#using-typescript-types). Явные типы дают лучший IntelliSense, ловят ошибки на этапе компиляции и служат документацией того, какие данные содержит форма.

### Инициализируйте все поля {#initialize-all-fields}

Задавайте начальные значения для каждого поля модели:

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

Отсутствие начальных значений означает, что эти поля не появятся в дереве полей и будут недоступны для взаимодействия с формой.

### Держите модели сфокусированными {#keep-models-focused}

Каждая модель должна представлять одну форму или связный набор связанных данных:

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

Отдельные модели для разных задач делают формы понятнее и проще для повторного использования. Создавайте несколько форм, если управляете разными наборами данных.

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

Такая структура делает кросс-полевую валидацию (например, проверку совпадения `newPassword` и `confirmPassword`) естественнее.

### Сопоставляйте типы данных с UI-контролами {#match-data-types-to-ui-controls}

Свойства модели формы должны соответствовать типам данных, ожидаемым UI-контролами.

Например, рассмотрим форму заказа напитков с полем `size` (упаковка 6, 12 или 24) и полем `quantity`. UI использует выпадающий список (`<select>`) для размера и числовой input (`<input type="number">`) для количества.

Хотя варианты размера выглядят числовыми, элементы `<select>` работают со строковыми значениями, поэтому `size` следует моделировать как строку. `<input type="number">`, напротив, работает с числами, поэтому `quantity` можно моделировать как число.

```ts {prefer, header: 'Appropriate data types for the bound UI controls'}
interface BeverageOrderFormModel {
  size: string; // Bound to: <select> (option values: "6", "12", "24")
  quantity: number; // Bound to: <input type="number">
}
```

### Избегайте `undefined` {#avoid-undefined}

Модель формы не должна содержать значения или свойства `undefined`. В Signal Forms структура формы выводится из структуры модели, а `undefined` означает _отсутствие поля_, а не поле с пустым значением. Поэтому также нужно избегать опциональных полей (например, `{property?: string}`), так как они неявно допускают `undefined`.

Чтобы представить свойство с пустым значением в модели формы, используйте значение, которое UI-контрол понимает как «пустое» (например, `""` для `<input type="text">`). Если вы проектируете пользовательский UI-контрол, `null` часто хорошо подходит как значение «пусто».

```ts {prefer, header: 'Appropriate empty values'}
interface UserFormModel {
  name: string; // Bound to <input type="text">
  birthday: Date | null; // Bound to <input type="date">
}

// Initialize our form with empty values.
form(signal({name: '', birthday: null}));
```

### Избегайте моделей с динамической структурой {#avoid-models-with-dynamic-structure}

У модели формы динамическая структура, если её форма меняется (если меняются свойства объекта) в зависимости от значения. Это происходит, когда тип модели допускает значения разной формы — например, объединение объектных типов с разными свойствами или объединение объекта и примитива. В следующих разделах рассматриваются распространённые сценарии, где модели с динамической структурой могут казаться привлекательными, но в итоге оказываются проблемными.

#### Пустое значение для сложного объекта {#empty-value-for-a-complex-object}

Формы часто используют, чтобы попросить пользователей ввести совершенно новые данные, а не редактировать существующие в системе. Хороший пример — форма создания аккаунта. Её можно смоделировать следующей моделью формы.

```ts
interface CreateAccountFormModel {
  name: {
    first: string;
    last: string;
  };
  username: string;
}
```

При создании формы возникает дилемма: каким должно быть начальное значение в модели? Может возникнуть соблазн создать `form<CreateAccountFormModel | null>()`, поскольку ввода от пользователя ещё нет.

```ts {avoid, header: 'Using null as empty value for complex object'}
createAccountForm = form<CreateAccountFormModel | null>(signal(/* what goes here, null? */));
```

Однако важно помнить, что Signal Forms — _model driven_. Если модель — `null`, а у `null` нет свойств `name` или `username`, то и у формы не будет этих подполей. На самом деле нужен экземпляр `CreateAccountFormModel` со всеми листовыми полями, установленными в пустое значение.

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

При таком представлении все нужные подполя существуют, и их можно привязать директивой `[formField]` в шаблоне.

```html
First: <input [formField]="createAccountForm.name.first" /> Last:
<input [formField]="createAccountForm.name.last" /> Username:
<input [formField]="createAccountForm.username" />
```

#### Поля, условно скрытые или недоступные {#fields-that-are-conditionally-hidden-or-unavailable}

Формы не всегда линейны. Часто нужны условные пути на основе предыдущего ввода пользователя. Один из примеров — форма с разными вариантами оплаты. Начнём с того, как может выглядеть UI такой формы.

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

Лучший способ обработать это — использовать модель формы со статической структурой, включающей поля для _всех_ потенциальных способов оплаты. В схеме можно скрывать или отключать поля, которые сейчас недоступны.

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
  hidden(billPay.method.card, {when: ({valueOf}) => valueOf(billPay.method.type) !== 'card'});
  // Hide bank account details when user has selected a method other than bank account.
  hidden(billPay.method.bank, {when: ({valueOf}) => valueOf(billPay.method.type) !== 'bank'});
});
```

При такой модели объекты `card` и `bank` всегда присутствуют в состоянии формы. Когда пользователь переключает способ оплаты, обновляется только свойство `type`. Данные, введённые в поля карты, остаются безопасно сохранёнными в объекте `card` и готовы к повторному отображению при переключении обратно.

Напротив, динамическая модель формы может сначала казаться подходящей. В конце концов, поля номера счёта и routing number не нужны, если пользователь выбрал "Credit Card". Может возникнуть соблазн смоделировать это как дискриминированное объединение:

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

Однако подумайте, что произойдёт в следующем сценарии:

1. Пользователь заполняет имя и данные кредитной карты
2. Он почти готов отправить форму, но в последний момент замечает комиссию за удобство.
3. Он переключается на вариант банковского счёта, решив избежать комиссии.
4. Когда он уже собирается ввести данные счёта, появляются сомнения — вдруг данные утекут.
5. Он переключается обратно на кредитную карту и замечает, что вся только что введённая информация исчезла!

Это иллюстрирует ещё одну проблему моделей форм с динамической структурой: они могут приводить к потере данных. Такая модель предполагает, что как только поле скрыто, информация в нём больше не понадобится. Она заменяет данные карты банковскими и не может вернуть данные карты.

#### Исключения {#exceptions}

Хотя статическая структура обычно предпочтительнее, есть конкретные сценарии, где динамическая структура необходима и поддерживается.

##### Массивы {#arrays}

Массивы — самое распространённое исключение. Формам часто нужно собирать переменное число элементов: список телефонов, участников или позиций заказа.

```ts
interface SendEmailFormModel {
  subject: string;
  recipientEmails: string[];
}
```

В этом случае массив `recipientEmails` растёт и уменьшается по мере взаимодействия пользователя с формой. Хотя длина массива динамическая, структура отдельных элементов должна быть согласованной (у каждого элемента должна быть одна и та же форма).

##### Поля, которые UI-контрол обрабатывает атомарно {#fields-that-are-treated-atomically-by-the-ui-control}

Ещё один случай, когда динамическая структура приемлема, — когда сложный объект обрабатывается UI-контролом как одно атомарное значение. То есть контрол не пытается привязываться к отдельным подполям или обращаться к ним. В этом сценарии контрол обновляет значение, заменяя весь объект целиком, а не изменяя внутренние свойства. Поскольку структура формы в этом сценарии не важна, допустимо, чтобы она была динамической.

Например, рассмотрим форму профиля пользователя с полем `location`. Местоположение выбирается сложным виджетом «location picker» (возможно, картой или выпадающим списком с поиском), который возвращает объект координат. Если местоположение ещё не выбрано или пользователь решил не делиться им, picker указывает местоположение как `null`.

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

В шаблоне поле `location` привязывается напрямую к пользовательскому контролу:

```html
Username: <input [formField]="userForm.username" /> Location:
<location-picker [formField]="userForm.location"></location-picker>
```

Здесь `<location-picker>` потребляет и производит весь объект `Location` (или `null`) и не обращается к `userForm.location.lat` или `userForm.location.lng`. Поэтому у `location` может безопасно быть динамическая форма без нарушения принципов model-driven форм.

## Преобразование между моделью формы и доменной моделью {#translating-between-form-model-and-domain-model}

Поскольку модель формы и доменная модель представляют одну и ту же концепцию по-разному, нужен способ преобразования между этими представлениями. Когда нужно показать пользователю существующие данные системы в форме, их преобразуют из доменной модели в модель формы. И наоборот, когда нужно сохранить изменения пользователя, данные преобразуют из модели формы в доменную модель.

Представим, что есть доменная модель и модель формы, и написаны функции преобразования между ними.

```ts
interface MyDomainModel { ... }

interface MyFormModel { ... }

// Instance of `MyFormModel` populated with empty input (e.g. `''` for string inputs, etc.)
const EMPTY_MY_FORM_MODEL: MyFormModel = { ... };

function domainModelToFormModel(domainModel: MyDomainModel): MyFormModel { ... }

function formModelToDomainModel(formModel: MyFormModel): MyDomainModel { ... }
```

### Из доменной модели в модель формы {#domain-model-to-form-model}

Когда создаётся форма для редактирования существующей доменной модели в системе, доменная модель обычно приходит либо как `input()` компонента формы, либо с backend (например, через resource). В обоих случаях `linkedSignal` — отличный способ применить преобразование.

Если доменная модель приходит как `input()`, можно использовать `linkedSignal`, чтобы создать записываемую модель формы из input-сигнала.

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

Аналогично, когда доменная модель приходит с backend через resource, можно создать `linkedSignal` на основе её значения для `formModel`. В этом сценарии загрузка доменной модели может занять время, и форму следует отключить, пока данные не загружены.

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
    disabled(root, {when: () => this.domainModelResource.isLoading()});
  });
}
```

Примеры выше показывают чистое выведение модели формы напрямую из доменной модели. Однако в некоторых случаях может понадобиться более продвинутая операция diff между новым значением доменной модели и предыдущими значениями доменной модели и модели формы. Это можно реализовать на основе [предыдущего состояния](/guide/signals/linked-signal#accounting-for-previous-state) `linkedSignal`.

### Из модели формы в доменную модель {#form-model-to-domain-model}

Когда нужно сохранить ввод пользователя обратно в систему, его преобразуют в представление доменной модели. Обычно это происходит при отправке формы или непрерывно по мере редактирования — для формы с автосохранением.

Чтобы сохранять при отправке, преобразование можно выполнить в функции `submit`.

```ts {prefer, header: 'Convert form model to domain model on submit'}
@Component(...)
class MyForm {
  private readonly myDataService = inject(MyDataService);

  protected readonly myForm = form<MyFormModel>(...);

  handleSubmit() {
    submit(this.myForm, async () => {
      await this.myDataService.update(formModelToDomainModel(this.myForm().value()));
    });
  };
}
```

Альтернативно можно отправить модель формы напрямую на сервер и выполнить преобразование из
модели формы в доменную модель на сервере.

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
        this.domainModel.set(formModelToDomainModel(this.myForm().value()));
      }
    });
  };
}
```

Примеры выше показывают чистое преобразование из модели формы в доменную модель. Однако вполне допустимо учитывать полное состояние формы, а не только значение модели формы. Например, чтобы экономить байты, можно отправлять на сервер только частичные обновления на основе того, что изменил пользователь. В этом случае функция преобразования может принимать всё состояние формы и возвращать разреженную доменную модель на основе значений формы и dirtiness.

```ts
type Sparse<T> = T extends object ? {
    [P in keyof T]?: Sparse<T[P]>;
} : T;

function formStateToPartialDomainModel(
  formState: FieldState<MyFormModel>
): Sparse<MyDomainModel> { ... }
```
