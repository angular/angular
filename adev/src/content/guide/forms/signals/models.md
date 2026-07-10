# Модели форм

Модели форм — основа Signal Forms и единый источник истины для данных формы. В этом руководстве рассматривается, как создавать модели форм, обновлять их и проектировать для удобства сопровождения.

NOTE: Модели форм отличаются от сигнала Angular `model()`, используемого для двусторонней привязки компонентов. Модель формы — записываемый сигнал, хранящий данные формы, а `model()` создаёт inputs/outputs для общения родительского и дочернего компонентов.

## Какие задачи решают модели форм {#what-form-models-solve}

Формы требуют управления данными, которые меняются со временем. Без чёткой структуры эти данные могут оказаться разбросанными по свойствам компонента, что затрудняет отслеживание изменений, валидацию ввода или отправку данных на сервер.

Модели форм решают это, централизуя данные формы в одном записываемом сигнале. Когда модель обновляется, форма автоматически отражает эти изменения. Когда пользователи взаимодействуют с формой, модель обновляется соответственно.

## Создание моделей {#creating-models}

Модель формы — записываемый сигнал, созданный функцией Angular `signal()`. Сигнал хранит объект, представляющий структуру данных формы.

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

Функция [`form()`](api/forms/signals/form) принимает сигнал модели и создаёт **дерево полей** — особую структуру объекта, зеркально отражающую форму модели. Дерево полей и навигируемо (доступ к дочерним полям через точечную нотацию вроде `loginForm.email`), и вызываемо (вызов поля как функции даёт доступ к его состоянию).

Директива `[formField]` привязывает каждый элемент input к соответствующему полю в дереве полей, обеспечивая автоматическую двустороннюю синхронизацию между UI и моделью.

### Поддерживаемые структуры моделей {#supported-model-structures}

Signal Forms строит дерево полей, обходя модель. Объекты и массивы, через которые идёт обход (**структурный слой**), должны быть обычными объектами и массивами JavaScript. Значения на **листьях** (позиции без вложенных полей) обычно примитивы (строки, числа, булевы) или `null`. Нативные inputs `date`, `month`, `time` и `week` также принимают `Date`, а пользовательские контролы могут принимать любой тип значения, который понимают.

```ts {prefer, header: 'Plain structure'}
interface UserFormModel {
  name: string;
  birthday: Date | null;
  preferences: {
    theme: string;
    notifications: boolean;
  };
  tags: string[];
}

const userModel = signal<UserFormModel>({
  name: '',
  birthday: null,
  preferences: {
    theme: 'dark',
    notifications: true,
  },
  tags: [],
});
```

IMPORTANT: Экземпляры классов, `Map` и `Set` **не поддерживаются в структурном слое**, даже если TypeScript их примет. Signal Forms не валидирует форму модели во время выполнения, поэтому фреймворк принимает эти значения без исключения, а затем ведёт себя некорректно по-разному в зависимости от формы:

- **Экземпляры классов** теряют прототип при первой записи, потому что Signal Forms поверхностно копирует родительские объекты при обновлении. Методы, getters и проверки `instanceof` после этого исчезают.
- **Нерасширяемые или замороженные объекты внутри массивов** вызывают исключение, когда Signal Forms назначает tracking-символ для сохранения идентичности элементов при переупорядочивании.
- **`Map` и `Set`** дают пустые деревья полей, потому что Signal Forms перечисляет дочерние элементы через `Object.keys`.

Если приложение использует классы для доменного моделирования, преобразуйте их в обычные объекты на границе формы. См. [Преобразование между моделью формы и доменной моделью](guide/forms/signals/model-design#translating-between-form-model-and-domain-model).

### Использование типов TypeScript {#using-typescript-types}

Хотя TypeScript выводит типы из литералов объектов, явные типы улучшают качество кода и дают лучшую поддержку IntelliSense.

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

С явными типами дерево полей обеспечивает полную типобезопасность. Обращение к `loginForm.email` типизировано как `FieldTree<string>`, а попытка обратиться к несуществующему свойству приводит к ошибке компиляции.

```ts
// TypeScript knows this is FieldTree<string>
const emailField = loginForm.email;

// TypeScript error: Property 'username' does not exist
const usernameField = loginForm.username;
```

### Инициализация всех полей {#initializing-all-fields}

Модели форм должны задавать начальные значения для всех полей, которые нужно включить в дерево полей.

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

Для опциональных полей явно задавайте пустое значение или `null`:

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

HELPFUL: Нативные текстовые контролы вроде `<input type=text>` и `<textarea>` не поддерживают `null`; используйте `''` для представления пустого значения.

Поля, установленные в `undefined`, исключаются из дерева полей. Модель с `{value: undefined}` ведёт себя идентично `{}` — обращение к полю возвращает `undefined`, а не `FieldTree`.

## Чтение значений модели {#reading-model-values}

К значениям формы можно обращаться двумя способами: напрямую из сигнала модели или через отдельные поля. Каждый подход служит своей цели.

### Чтение из модели {#reading-from-the-model}

Обращайтесь к сигналу модели, когда нужны полные данные формы, например при отправке:

```ts
async onSubmit() {
  const formData = this.loginModel();
  console.log(formData.email, formData.password);

  // Send to server
  await this.authService.login(formData);
}
```

Сигнал модели возвращает весь объект данных, что идеально для операций с полным состоянием формы.

### Чтение из состояния поля {#reading-from-field-state}

Каждое поле в дереве полей — функция. Вызов поля возвращает объект `FieldState` с реактивными сигналами значения поля, статуса валидации и состояния взаимодействия.

Обращайтесь к состоянию поля при работе с отдельными полями в шаблонах или реактивных вычислениях:

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

Состояние поля предоставляет реактивные сигналы для значения каждого поля, что подходит для отображения информации о поле или создания производного состояния.

TIP: Состояние поля включает много сигналов помимо `value()`: состояние валидации (например, valid, invalid, errors), отслеживание взаимодействия (например, touched, dirty) и видимость (например, hidden, disabled).

<!-- TODO: UNCOMMENT BELOW WHEN GUIDE IS AVAILABLE -->
<!-- See the [Field State Management guide](guide/forms/signals/field-state-management) for complete coverage. -->

## Программное обновление моделей форм {#updating-form-models-programmatically}

### Замена моделей форм через `set()` {#replacing-form-models-with-set}

Используйте `set()` на модели формы, чтобы заменить всё значение:

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

Этот подход хорошо подходит при загрузке данных из API или сбросе всей формы.

### Обновление одного поля напрямую через `set()` или `update()` {#update-a-single-field-directly-with-set-or-update}

Используйте `set()` на значениях отдельных полей, чтобы напрямую обновить состояние поля:

```ts
clearEmail() {
  this.userForm.email().value.set('');
}

incrementAge() {
  this.userForm.age().value.update(currentAge => currentAge + 1);
}
```

Это также называют «обновлениями на уровне поля». Они автоматически распространяются на сигнал модели и поддерживают оба в синхронизации.

### Пример: загрузка данных из API {#example-loading-data-from-an-api}

Распространённый паттерн — получить данные и заполнить модель:

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

### Как текут данные {#how-data-flows}

Изменения текут в обе стороны:

**Ввод пользователя → Модель:**

1. Пользователь вводит текст в элемент input
2. Директива `[formField]` обнаруживает изменение
3. Обновляется состояние поля
4. Обновляется сигнал модели

**Программное обновление → UI:**

1. Код обновляет модель через `set()` или `update()`
2. Сигнал модели уведомляет подписчиков
3. Обновляется состояние поля
4. Директива `[formField]` обновляет элемент input

Эта синхронизация происходит автоматически. Не нужно писать подписки или обработчики событий, чтобы держать модель и UI в синхронизации.

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

Когда пользователь вводит текст в input, обновляется `userModel().name`. Когда нажимается кнопка, значение input меняется на "Bob". Ручной код синхронизации не требуется.

## Паттерны структуры модели {#model-structure-patterns}

Модели форм могут быть плоскими объектами или содержать вложенные объекты и массивы. Выбранная структура влияет на доступ к полям и организацию валидации.

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

**Используйте плоские структуры, когда:**

- У полей нет явных концептуальных группировок
- Нужен более простой доступ к полям (`userForm.city` вместо `userForm.address.city`)
- Правила валидации охватывают несколько потенциальных групп

**Используйте вложенные структуры, когда:**

- Поля образуют ясную концептуальную группу (например, адрес)
- Сгруппированные данные соответствуют структуре API
- Нужно валидировать группу как единое целое

### Работа с вложенными объектами {#working-with-nested-objects}

К вложенным полям можно обращаться, следуя пути объекта:

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

Элементы массива, содержащие объекты, автоматически получают tracking-идентичности, что помогает сохранять состояние поля даже при смене позиции элементов в массиве. Это гарантирует, что состояние валидации и взаимодействия пользователя корректно сохраняются при переупорядочивании массивов.

<!-- TBD: For dynamic arrays and complex array operations, see the [Working with arrays guide](guide/forms/signals/arrays). -->

## Следующие шаги {#next-steps}

В этом руководстве рассмотрено создание моделей и обновление значений. Связанные руководства исследуют другие аспекты Signal Forms:

<!-- TODO: UNCOMMENT WHEN THE GUIDES ARE AVAILABLE -->
<docs-pill-row>
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/custom-controls" title="Custom controls" />
  <!-- <docs-pill href="guide/forms/signals/arrays" title="Working with Arrays" /> -->
</docs-pill-row>
