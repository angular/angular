# Модели форм {#form-models}

Модели форм — это основа Signal Forms, служащая единственным источником истины для данных формы. В этом руководстве рассматривается создание моделей форм, их обновление и проектирование для удобства поддержки.

NOTE: Модели форм отличаются от сигнала `model()` Angular, используемого для двусторонней привязки компонентов. Модель формы — это записываемый сигнал, хранящий данные формы, тогда как `model()` создаёт входные/выходные параметры для взаимодействия родительского и дочернего компонентов.

## Что решают модели форм {#what-form-models-solve}

Формы требуют управления данными, изменяющимися со временем. Без чёткой структуры эти данные могут быть разбросаны по свойствам компонента, что затрудняет отслеживание изменений, валидацию ввода или отправку данных на сервер.

Модели форм решают эту проблему, централизуя данные формы в одном записываемом сигнале. При обновлении модели форма автоматически отражает эти изменения. Когда пользователи взаимодействуют с формой, модель обновляется соответственно.

## Создание моделей {#creating-models}

Модель формы — это записываемый сигнал, созданный с помощью функции Angular `signal()`. Сигнал содержит объект, представляющий структуру данных вашей формы.

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField} from '@angular/forms/signals';

@Component({
  selector: 'app-login',
  imports: [FormField],
  template: `
    <input type="email" [formField]="loginForm.email" />
    <input type="password" [formField]="loginForm.password" />
  `,
})
export class LoginComponent {
  loginModel = signal({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel);
}
```

Функция [`form()`](api/forms/signals/form) принимает сигнал модели и создаёт **дерево полей** — специальную объектную структуру, отражающую форму вашей модели. Дерево полей одновременно является навигируемым (доступ к дочерним полям через точечную нотацию, например `loginForm.email`) и вызываемым (вызов поля как функции для доступа к его состоянию).

Директива `[formField]` привязывает каждый элемент ввода к соответствующему полю в дереве полей, обеспечивая автоматическую двустороннюю синхронизацию между UI и моделью.

### Использование TypeScript-типов {#using-typescript-types}

Хотя TypeScript выводит типы из объектных литералов, определение явных типов улучшает качество кода и обеспечивает лучшую поддержку IntelliSense.

```ts
interface LoginData {
  email: string;
  password: string;
}

export class LoginComponent {
  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel);
}
```

С явными типами дерево полей обеспечивает полную типобезопасность. Доступ к `loginForm.email` типизируется как `FieldTree<string>`, а попытка доступа к несуществующему свойству приводит к ошибке времени компиляции.

```ts
// TypeScript knows this is FieldTree<string>
const emailField = loginForm.email;

// TypeScript error: Property 'username' does not exist
const usernameField = loginForm.username;
```

### Инициализация всех полей {#initializing-all-fields}

Модели форм должны предоставлять начальные значения для всех полей, которые необходимо включить в дерево полей.

```ts {prefer}
// Good: All fields initialized
const userModel = signal({
  name: '',
  email: '',
  age: 0,
});
```

```ts {avoid}
// Avoid: Missing initial value
const userModel = signal({
  name: '',
  email: '',
  // age field is not defined - cannot access userForm.age
});
```

Для необязательных полей явно задавайте им пустое значение или `null`:

```ts
interface UserData {
  name: string;
  email: string;
  phoneNumber: string | null;
}

const userModel = signal<UserData>({
  name: '',
  email: '',
  phoneNumber: null,
});
```

HELPFUL: Нативные текстовые элементы управления, такие как `<input type=text>` и `<textarea>`, не поддерживают `null`; используйте `''` для представления пустого значения.

Поля, установленные в `undefined`, исключаются из дерева полей. Модель с `{value: undefined}` ведёт себя идентично `{}` — доступ к полю возвращает `undefined`, а не `FieldTree`.

## Чтение значений модели {#reading-model-values}

Получить доступ к значениям формы можно двумя способами: напрямую из сигнала модели или через отдельные поля. Каждый подход служит разным целям.

### Чтение из модели {#reading-from-the-model}

Получайте доступ к сигналу модели, когда вам нужны полные данные формы, например при отправке формы:

```ts
async onSubmit() {
  const formData = this.loginModel();
  console.log(formData.email, formData.password);

  // Send to server
  await this.authService.login(formData);
}
```

Сигнал модели возвращает весь объект данных, что делает его идеальным для операций, работающих с полным состоянием формы.

### Чтение из состояния поля {#reading-from-field-state}

Каждое поле в дереве полей является функцией. Вызов поля возвращает объект `FieldState`, содержащий реактивные сигналы для значения поля, статуса валидации и состояния взаимодействия.

Получайте доступ к состоянию поля при работе с отдельными полями в шаблонах или реактивных вычислениях:

```angular-ts
@Component({
  template: `
    <p>Current email: {{ loginForm.email().value() }}</p>
    <p>Password length: {{ passwordLength() }}</p>
  `,
})
export class LoginComponent {
  loginModel = signal({email: '', password: ''});
  loginForm = form(this.loginModel);

  passwordLength = computed(() => {
    return this.loginForm.password().value().length;
  });
}
```

Состояние поля предоставляет реактивные сигналы для значения каждого поля, что делает его подходящим для отображения информации, специфичной для поля, или создания производного состояния.

TIP: Состояние поля включает гораздо больше сигналов помимо `value()`, таких как состояние валидации (например, valid, invalid, errors), отслеживание взаимодействия (например, touched, dirty) и видимость (например, hidden, disabled).

<!-- TODO: UNCOMMENT BELOW WHEN GUIDE IS AVAILABLE -->
<!-- See the [Field State Management guide](guide/forms/signals/field-state-management) for complete coverage. -->

## Программное обновление моделей форм {#updating-form-models-programmatically}

### Замена модели формы с помощью `set()` {#replacing-form-models-with-set}

Используйте `set()` для модели формы, чтобы полностью заменить значение:

```ts
loadUserData() {
  this.userModel.set({
    name: 'Alice',
    email: 'alice@example.com',
    age: 30,
  });
}

resetForm() {
  this.userModel.set({
    name: '',
    email: '',
    age: 0,
  });
}
```

Этот подход хорошо работает при загрузке данных из API или сбросе всей формы.

### Обновление отдельного поля с помощью `set()` или `update()` {#update-a-single-field-directly-with-set-or-update}

Используйте `set()` для отдельных значений полей, чтобы напрямую обновить состояние поля:

```ts
clearEmail() {
  this.userForm.email().value.set('');
}

incrementAge() {
  this.userForm.age().value.update(currentAge => currentAge + 1);
}
```

Это также называется «обновлениями на уровне поля». Они автоматически распространяются на сигнал модели и поддерживают синхронизацию обоих.

### Пример: загрузка данных из API {#example-loading-data-from-an-api}

Распространённый паттерн включает получение данных и заполнение модели:

```ts
export class UserProfileComponent {
  userModel = signal({
    name: '',
    email: '',
    bio: '',
  });

  userForm = form(this.userModel);
  private userService = inject(UserService);

  ngOnInit() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    const userData = await this.userService.getUserProfile();
    this.userModel.set(userData);
  }
}
```

Поля формы автоматически обновляются при изменении модели, отображая полученные данные без дополнительного кода.

## Двусторонняя привязка данных {#two-way-data-binding}

Директива `[formField]` создаёт автоматическую двустороннюю синхронизацию между моделью, состоянием формы и UI.

### Как течёт поток данных {#how-data-flows}

Изменения передаются в обоих направлениях:

**Пользовательский ввод → Модель:**

1. Пользователь вводит данные в элемент ввода
2. Директива `[formField]` обнаруживает изменение
3. Состояние поля обновляется
4. Сигнал модели обновляется

**Программное обновление → UI:**

1. Код обновляет модель с помощью `set()` или `update()`
2. Сигнал модели уведомляет подписчиков
3. Состояние поля обновляется
4. Директива `[formField]` обновляет элемент ввода

Эта синхронизация происходит автоматически. Не нужно писать подписки или обработчики событий для поддержания синхронизации модели и UI.

### Пример: оба направления {#example-both-directions}

```angular-ts
@Component({
  template: `
    <input type="text" [formField]="userForm.name" />
    <button (click)="setName('Bob')">Set Name to Bob</button>
    <p>Current name: {{ userModel().name }}</p>
  `,
})
export class UserComponent {
  userModel = signal({name: ''});
  userForm = form(this.userModel);

  setName(name: string) {
    this.userForm.name().value.set(name);
    // Input automatically displays 'Bob'
  }
}
```

Когда пользователь вводит текст, `userModel().name` обновляется. При нажатии кнопки значение поля ввода меняется на «Bob». Ручного кода синхронизации не требуется.

## Паттерны структуры модели {#model-structure-patterns}

Модели форм могут быть плоскими объектами или содержать вложенные объекты и массивы. Выбранная структура влияет на то, как вы получаете доступ к полям и организуете валидацию.

### Плоские и вложенные модели {#flat-vs-nested-models}

Плоские модели форм держат все поля на верхнем уровне:

```ts
// Flat structure
const userModel = signal({
  name: '',
  email: '',
  street: '',
  city: '',
  state: '',
  zip: '',
});
```

Вложенные модели группируют связанные поля:

```ts
// Nested structure
const userModel = signal({
  name: '',
  email: '',
  address: {
    street: '',
    city: '',
    state: '',
    zip: '',
  },
});
```

**Используйте плоскую структуру, когда:**

- Поля не имеют чётких концептуальных группировок
- Вам нужен более простой доступ к полям (`userForm.city` вместо `userForm.address.city`)
- Правила валидации охватывают несколько потенциальных групп

**Используйте вложенную структуру, когда:**

- Поля образуют чёткую концептуальную группу (например, адрес)
- Сгруппированные данные соответствуют структуре вашего API
- Вы хотите валидировать группу как единое целое

### Работа с вложенными объектами {#working-with-nested-objects}

Для доступа к вложенным полям следуйте по пути объекта:

```ts
const userModel = signal({
  profile: {
    firstName: '',
    lastName: '',
  },
  settings: {
    theme: 'light',
    notifications: true,
  },
});

const userForm = form(userModel);

// Access nested fields
userForm.profile.firstName; // FieldTree<string>
userForm.settings.theme; // FieldTree<string>
```

В шаблонах вложенные поля привязываются так же, как поля верхнего уровня:

```angular-ts
@Component({
  template: `
    <input [formField]="userForm.profile.firstName" />
    <input [formField]="userForm.profile.lastName" />

    <select [formField]="userForm.settings.theme">
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  `,
})
```

### Работа с массивами {#working-with-arrays}

Модели могут включать массивы для коллекций элементов:

```ts
const orderModel = signal({
  customerName: '',
  items: [{product: '', quantity: 0, price: 0}],
});

const orderForm = form(orderModel);

// Access array items by index
orderForm.items[0].product; // FieldTree<string>
orderForm.items[0].quantity; // FieldTree<number>
```

Элементы массива, содержащие объекты, автоматически получают идентификаторы отслеживания, что помогает сохранять состояние поля даже при изменении позиции элементов в массиве. Это обеспечивает корректное сохранение состояния валидации и взаимодействий пользователя при изменении порядка элементов массива.

<!-- TBD: For dynamic arrays and complex array operations, see the [Working with arrays guide](guide/forms/signals/arrays). -->

## Следующие шаги {#next-steps}

В этом руководстве рассмотрено создание моделей и обновление значений. Связанные руководства охватывают другие аспекты Signal Forms:

<!-- TODO: UNCOMMENT WHEN THE GUIDES ARE AVAILABLE -->
<docs-pill-row>
  <docs-pill href="guide/forms/signals/field-state-management" title="Управление состоянием поля" />
  <docs-pill href="guide/forms/signals/validation" title="Валидация" />
  <docs-pill href="guide/forms/signals/custom-controls" title="Пользовательские элементы управления" />
  <!-- <docs-pill href="guide/forms/signals/arrays" title="Working with Arrays" /> -->
</docs-pill-row>
