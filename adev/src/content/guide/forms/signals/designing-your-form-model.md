# Проектирование модели формы {#designing-your-form-model}

Signal Forms использует подход, управляемый моделью: состояние и структура формы выводятся непосредственно из предоставленной вами модели. Поскольку модель служит основой всей формы, важно начать с хорошо спроектированной модели формы. В этом руководстве рассматриваются лучшие практики проектирования моделей форм.

## Модель формы и доменная модель {#form-model-vs-domain-model}

Формы используются для сбора пользовательского ввода. Скорее всего, в вашем приложении есть доменная модель, представляющая этот ввод в виде, оптимизированном для бизнес-логики или хранения. Однако это зачастую _отличается_ от того, как мы хотим моделировать данные в форме.

Модель формы представляет необработанный пользовательский ввод в том виде, в каком он отображается в UI. Например, в форме вы можете попросить пользователя выбрать дату и временной слот для записи в виде отдельных полей, даже если в вашей доменной модели это представлено как единый объект JavaScript `Date`.

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

Формы должны использовать модель формы, адаптированную к опыту ввода, а не просто переиспользовать доменную модель.

## Лучшие практики модели формы {#form-model-best-practices}

### Используйте конкретные типы {#use-specific-types}

Всегда определяйте интерфейсы или типы для ваших моделей, как показано в разделе [Использование TypeScript-типов](/guide/forms/signals/models#using-typescript-types). Явные типы обеспечивают лучший IntelliSense, обнаруживают ошибки на этапе компиляции и служат документацией того, какие данные содержит форма.

### Инициализируйте все поля {#initialize-all-fields}

Предоставляйте начальные значения для каждого поля в вашей модели:

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

Отсутствие начальных значений означает, что эти поля не будут существовать в дереве полей и станут недоступны для взаимодействий с формой.

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

Разделение моделей по разным задачам делает формы более понятными и переиспользуемыми. Создавайте несколько форм, если управляете различными наборами данных.

### Учитывайте требования к валидации {#consider-validation-requirements}

Проектируйте модели с учётом валидации. Группируйте поля, которые валидируются совместно:

```ts {prefer, header: 'Related fields grouped for comparison'}
// Password fields grouped for comparison
interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

Такая структура делает перекрёстную валидацию полей (например, проверку совпадения `newPassword` и `confirmPassword`) более естественной.

### Подбирайте типы данных под элементы управления UI {#match-data-types-to-ui-controls}

Свойства модели формы должны соответствовать типам данных, ожидаемым элементами управления UI.

Например, рассмотрим форму заказа напитков с полем `size` (упаковки по 6, 12 или 24 единицы) и полем `quantity`. В UI для размера используется выпадающий список (`<select>`), а для количества — числовое поле ввода (`<input type="number">`).

Хотя варианты размера выглядят числовыми, элементы `<select>` работают со строковыми значениями, поэтому `size` следует моделировать как строку. Элемент `<input type="number">`, напротив, работает с числами, поэтому `quantity` можно моделировать как число.

```ts {prefer, header: 'Appropriate data types for the bound UI controls'}
interface BeverageOrderFormModel {
  size: string; // Bound to: <select> (option values: "6", "12", "24")
  quantity: number; // Bound to: <input type="number">
}
```

### Избегайте `undefined` {#avoid-undefined}

Модель формы не должна содержать значения или свойства `undefined`. В Signal Forms структура формы выводится из структуры модели, и `undefined` означает _отсутствие поля_, а не поле с пустым значением. Это означает, что необходимо также избегать необязательных полей (например, `{property?: string}`), поскольку они неявно допускают `undefined`.

Чтобы представить свойство с пустым значением в модели формы, используйте значение, которое элемент управления UI понимает как «пустое» (например, `""` для `<input type="text">`). При проектировании собственного элемента управления `null` часто хорошо подходит для обозначения «пустоты».

```ts {prefer, header: 'Appropriate empty values'}
interface UserFormModel {
  name: string; // Bound to <input type="text">
  birthday: Date | null; // Bound to <input type="date">
}

// Initialize our form with empty values.
form(signal({name: '', birthday: null}));
```

### Избегайте моделей с динамической структурой {#avoid-models-with-dynamic-structure}

Модель формы имеет динамическую структуру, если её форма (набор свойств объекта) изменяется в зависимости от значения. Это происходит, когда тип модели допускает значения с разными формами: например, объединение типов объектов с разными свойствами или объединение объекта и примитива. В следующих разделах рассматриваются распространённые сценарии, где модели с динамической структурой могут казаться привлекательными, но в конечном счёте оказываются проблематичными.

#### Пустое значение для сложного объекта {#empty-value-for-a-complex-object}

Формы нередко используются для ввода новых данных, а не для редактирования существующих в системе. Хороший пример — форма создания аккаунта. Её можно смоделировать следующей моделью формы.

```ts
interface CreateAccountFormModel {
  name: {
    first: string;
    last: string;
  };
  username: string;
}
```

При создании формы возникает дилемма: каким должно быть начальное значение модели? Может возникнуть соблазн создать `form<CreateAccountFormModel | null>()`, поскольку у нас ещё нет ввода от пользователя.

```ts {avoid, header: 'Using null as empty value for complex object'}
createAccountForm = form<CreateAccountFormModel | null>(signal(/* what goes here, null? */));
```

Однако важно помнить, что Signal Forms _управляется моделью_. Если наша модель равна `null` и у `null` нет свойств `name` или `username`, то в нашей форме тоже не будет этих подполей. Вместо этого нам действительно нужен экземпляр `CreateAccountFormModel`, в котором все конечные поля установлены в пустое значение.

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

С таким представлением все необходимые подполя существуют, и мы можем привязать их с помощью директивы `[formField]` в шаблоне.

```html
First: <input [formField]="createAccountForm.name.first" /> Last:
<input [formField]="createAccountForm.name.last" /> Username:
<input [formField]="createAccountForm.username" />
```

#### Поля, условно скрытые или недоступные {#fields-that-are-conditionally-hidden-or-unavailable}

Формы не всегда линейны. Часто нужно создавать условные пути на основе предыдущего пользовательского ввода. Один из примеров — форма с разными вариантами оплаты. Представим, как может выглядеть UI такой формы.

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

Лучший способ справиться с этим — использовать модель формы со статической структурой, включающей поля для _всех_ возможных способов оплаты. В схеме можно скрыть или отключить поля, которые в данный момент недоступны.

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

При таком подходе объекты `card` и `bank` всегда присутствуют в состоянии формы. Когда пользователь переключает способ оплаты, обновляется только свойство `type`. Данные, введённые в поля карты, остаются в объекте `card` и готовы к отображению при обратном переключении.

Напротив, динамическая модель формы поначалу может казаться подходящей для данного случая. В конце концов, поля номера счёта и маршрутного номера не нужны, если пользователь выбрал «Кредитную карту». Может возникнуть соблазн смоделировать это как размеченное объединение:

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

Однако рассмотрим, что произойдёт в следующем сценарии:

1. Пользователь заполняет имя и данные кредитной карты
2. Он собирается отправить форму, но в последний момент замечает комиссию за удобство
3. Он переключается на оплату банковским счётом, решив избежать комиссии
4. Когда он начинает вводить данные банковского счёта, его одолевают сомнения — он не хотел бы, чтобы они попали в утечку
5. Он переключается обратно на кредитную карту, но замечает, что только что введённые данные исчезли!

Это иллюстрирует ещё одну проблему моделей форм с динамической структурой: они могут вызывать потерю данных. Такая модель предполагает, что как только поле становится скрытым, информация в нём больше никогда не понадобится. Она заменяет данные кредитной карты банковскими данными и не может восстановить данные кредитной карты.

#### Исключения {#exceptions}

Хотя статическая структура в целом предпочтительна, существуют конкретные сценарии, где динамическая структура необходима и поддерживается.

##### Массивы {#arrays}

Массивы — наиболее распространённое исключение. Формы часто должны собирать переменное количество элементов: список телефонных номеров, участников или позиций в заказе.

```ts
interface SendEmailFormModel {
  subject: string;
  recipientEmails: string[];
}
```

В этом случае массив `recipientEmails` растёт и сжимается по мере взаимодействия пользователя с формой. Хотя длина массива динамична, структура отдельных элементов должна быть согласованной (каждый элемент должен иметь одинаковую форму).

##### Поля, обрабатываемые элементом управления атомарно {#fields-that-are-treated-atomically-by-the-ui-control}

Ещё один случай, где динамическая структура допустима, — когда сложный объект обрабатывается элементом управления как единое атомарное значение. То есть элемент управления не пытается привязаться к каким-либо подполям или получить к ним доступ по отдельности. В этом сценарии элемент управления обновляет значение, заменяя весь объект целиком, а не изменяя его внутренние свойства. Поскольку структура формы в данном сценарии несущественна, динамическая структура допустима.

Например, рассмотрим форму профиля пользователя с полем `location`. Местоположение выбирается с помощью сложного виджета «выбор местоположения» (возможно, карты или выпадающего списка с поиском), который возвращает объект координат. В случае когда местоположение ещё не выбрано или пользователь решает не указывать его, виджет обозначает местоположение как `null`.

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

В шаблоне поле `location` привязывается напрямую к пользовательскому элементу управления:

```html
Username: <input [formField]="userForm.username" /> Location:
<location-picker [formField]="userForm.location"></location-picker>
```

Здесь `<location-picker>` потребляет и производит весь объект `Location` (или `null`) и не обращается к `userForm.location.lat` или `userForm.location.lng`. Поэтому `location` может безопасно иметь динамическую форму, не нарушая принципов форм, управляемых моделью.

## Перевод между моделью формы и доменной моделью {#translating-between-form-model-and-domain-model}

Поскольку модель формы и доменная модель представляют одно и то же понятие по-разному, необходим способ перевода между этими представлениями. Когда нужно отобразить существующие данные системы пользователю в форме, их следует преобразовать из представления доменной модели в представление модели формы. И наоборот, при сохранении изменений пользователя данные нужно преобразовать из представления модели формы в представление доменной модели.

Представим, что у нас есть доменная модель и модель формы, и мы написали функции для конвертации между ними.

```ts
interface MyDomainModel { ... }

interface MyFormModel { ... }

// Instance of `MyFormModel` populated with empty input (e.g. `''` for string inputs, etc.)
const EMPTY_MY_FORM_MODEL: MyFormModel = { ... };

function domainModelToFormModel(domainModel: MyDomainModel): MyFormModel { ... }

function formModelToDomainModel(formModel: MyFormModel): MyDomainModel { ... }
```

### Из доменной модели в модель формы {#domain-model-to-form-model}

При создании формы для редактирования существующей доменной модели в системе мы обычно получаем эту модель либо как `input()` компонента формы, либо с бэкенда (например, через ресурс). В обоих случаях `linkedSignal` предоставляет отличный способ применить наше преобразование.

Когда доменная модель поступает как `input()`, можно использовать `linkedSignal` для создания записываемой модели формы из входного сигнала.

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

Аналогично, когда доменная модель поступает с бэкенда через ресурс, можно создать `linkedSignal` на основе её значения для создания `formModel`. В этом сценарии загрузка доменной модели может занять некоторое время, и до тех пор форму следует отключить.

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

Примеры выше показывают чистое выведение модели формы непосредственно из доменной модели. Однако в некоторых случаях может понадобиться более сложная операция сравнения нового значения доменной модели с предыдущими значениями доменной модели и модели формы. Это можно реализовать на основе [предыдущего состояния](/guide/signals/linked-signal#accounting-for-previous-state) `linkedSignal`.

### Из модели формы в доменную модель {#form-model-to-domain-model}

Когда вы готовы сохранить ввод пользователя обратно в систему, его нужно конвертировать в представление доменной модели. Обычно это происходит при отправке формы или непрерывно в процессе редактирования для форм с автосохранением.

Для сохранения по отправке преобразование можно выполнить в функции `submit`.

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

Альтернативно, можно отправить модель формы непосредственно на сервер и выполнить преобразование из модели формы в доменную модель на стороне сервера.

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

Примеры выше показывают чистое преобразование из модели формы в доменную модель. Однако вполне допустимо учитывать полное состояние формы помимо значения модели. Например, для экономии трафика можно отправлять серверу только частичные обновления на основе того, что изменил пользователь. В этом случае функция преобразования может принимать всё состояние формы и возвращать разреженную доменную модель на основе значений и «грязности» полей формы.

```ts
type Sparse<T> = T extends object ? {
    [P in keyof T]?: Sparse<T[P]>;
} : T;

function formStateToPartialDomainModel(
  formState: FieldState<MyFormModel>
): Sparse<MyDomainModel> { ... }
```
