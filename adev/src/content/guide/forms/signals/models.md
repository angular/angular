# Модели форм

Модели форм являются основой Signal Forms, выступая в качестве единого источника истины для данных вашей формы. В этом
руководстве рассматривается создание моделей форм, их обновление и проектирование для удобства поддержки.

NOTE: Модели форм отличаются от сигнала `model()` в Angular, используемого для двусторонней привязки компонентов. Модель
формы — это записываемый (writable) сигнал, который хранит данные формы, тогда как `model()` создает input/output для
взаимодействия родительского и дочернего компонентов.

## Какие задачи решают модели форм

Формы требуют управления данными, которые меняются со временем. Без четкой структуры эти данные могут быть разбросаны по
свойствам компонента, что затрудняет отслеживание изменений, валидацию ввода или отправку данных на сервер.

Модели форм решают эту проблему, централизуя данные формы в одном записываемом сигнале. При обновлении модели форма
автоматически отражает эти изменения. Когда пользователи взаимодействуют с формой, модель обновляется соответствующим
образом.

## Создание моделей

Модель формы — это записываемый сигнал, созданный с помощью функции `signal()` в Angular. Сигнал содержит объект,
представляющий структуру данных вашей формы.

```angular-ts
import { Component, signal } from '@angular/core'
import { form, Field } from '@angular/forms/signals'

@Component({
  selector: 'app-login',
  imports: [Field],
  template: `
    <input type="email" [field]="loginForm.email" />
    <input type="password" [field]="loginForm.password" />
  `
})
export class LoginComponent {
  loginModel = signal({
    email: '',
    password: ''
  })

  loginForm = form(this.loginModel)
}
```

Функция `form()` принимает сигнал модели и создает **дерево полей** (field tree) — специальную структуру объекта,
которая зеркально отражает форму вашей модели. Дерево полей поддерживает как навигацию (доступ к дочерним полям через
точечную нотацию, например `loginForm.email`), так и вызов (вызов поля как функции для доступа к его состоянию).

Директива `[field]` привязывает каждый элемент ввода к соответствующему полю в дереве полей, обеспечивая автоматическую
двустороннюю синхронизацию между UI и моделью.

### Использование типов TypeScript {#using-typescript-types}

Хотя TypeScript выводит типы из литералов объектов, явное определение типов улучшает качество кода и обеспечивает лучшую
поддержку IntelliSense.

```ts
interface LoginData {
  email: string
  password: string
}

export class LoginComponent {
  loginModel = signal<LoginData>({
    email: '',
    password: ''
  })

  loginForm = form(this.loginModel)
}
```

При наличии явных типов дерево полей обеспечивает полную типобезопасность. Доступ к `loginForm.email` типизируется как
`FieldTree<string>`, а попытка доступа к несуществующему свойству приводит к ошибке во время компиляции.

```ts
// TypeScript знает, что это FieldTree<string>
const emailField = loginForm.email

// Ошибка TypeScript: Свойство 'username' не существует
const usernameField = loginForm.username
```

### Инициализация всех полей

Модели форм должны предоставлять начальные значения для всех полей, которые вы хотите включить в дерево полей.

```ts
// Хорошо: Все поля инициализированы
const userModel = signal({
  name: '',
  email: '',
  age: 0
})

// Избегайте: Отсутствует начальное значение
const userModel = signal({
  name: '',
  email: ''
  // поле age не определено — доступ к userForm.age невозможен
})
```

Для необязательных полей явно устанавливайте значение `null` или пустое значение:

```ts
interface UserData {
  name: string
  email: string
  phoneNumber: string | null
}

const userModel = signal<UserData>({
  name: '',
  email: '',
  phoneNumber: null
})
```

Поля, установленные в `undefined`, исключаются из дерева полей. Модель с `{value: undefined}` ведет себя идентично
`{}`, — доступ к полю возвращает `undefined`, а не `FieldTree`.

### Динамическое добавление полей

Вы можете динамически добавлять поля, обновляя модель новыми свойствами. Дерево полей автоматически обновляется, включая
новые поля, когда они появляются в значении модели.

```ts
// Начинаем только с email
const model = signal({ email: '' })
const myForm = form(model)

// Позже добавляем поле пароля
model.update(current => ({ ...current, password: '' }))
// myForm.password теперь доступно
```

Этот паттерн полезен, когда поля становятся актуальными в зависимости от выбора пользователя или загруженных данных.

## Чтение значений модели

Вы можете получить доступ к значениям формы двумя способами: непосредственно из сигнала модели или через отдельные поля.
Каждый подход служит своей цели.

### Чтение из модели

Обращайтесь к сигналу модели, когда вам нужны полные данные формы, например, во время отправки формы:

```ts
onSubmit() {
  const formData = this.loginModel();
  console.log(formData.email, formData.password);

  // Отправка на сервер
  await this.authService.login(formData);
}
```

Сигнал модели возвращает весь объект данных, что делает его идеальным для операций, работающих с полным состоянием
формы.

### Чтение из состояния поля

Каждое поле в дереве полей является функцией. Вызов поля возвращает объект `FieldState`, содержащий реактивные сигналы
для значения поля, статуса валидации и состояния взаимодействия.

Обращайтесь к состоянию поля при работе с отдельными полями в шаблонах или реактивных вычислениях:

```angular-ts
@Component({
  template: `
    <p>Current email: {{ loginForm.email().value() }}</p>
    <p>Password length: {{ passwordLength() }}</p>
  `
})
export class LoginComponent {
  loginModel = signal({ email: '', password: '' })
  loginForm = form(this.loginModel)

  passwordLength = computed(() => {
    return this.loginForm.password().value().length
  })
}
```

Состояние поля предоставляет реактивные сигналы для значения каждого поля, что делает его подходящим для отображения
информации, специфичной для поля, или создания производного состояния.

TIP: Состояние поля включает в себя гораздо больше сигналов, помимо `value()`, таких как состояние валидации (например,
valid, invalid, errors), отслеживание взаимодействия (например, touched, dirty) и видимость (например, hidden,
disabled).

<!-- TODO: UNCOMMENT BELOW WHEN GUIDE IS AVAILABLE -->
<!-- See the [Field State Management guide](guide/forms/signals/field-state-management) for complete coverage. -->

## Программное обновление моделей форм

Модели форм обновляются с помощью программных механизмов:

1. [Замена всей модели формы](#replacing-form-models-with-set) с помощью `set()`
2. [Обновление одного или нескольких полей](#update-one-or-more-fields-with-update) с помощью `update()`
3. [Обновление отдельного поля напрямую](#update-a-single-field-directly-with-set) через состояние поля

### Замена моделей форм с помощью `set()` {#replacing-form-models-with-set}

Используйте `set()` на модели формы, чтобы заменить все значение целиком:

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

### Обновление одного или нескольких полей с помощью `update()` {#update-one-or-more-fields-with-update}

Используйте `update()` для изменения конкретных полей при сохранении остальных:

```ts
updateEmail(newEmail: string) {
  this.userModel.update(current => ({
    ...current,
    email: newEmail,
  }));
}
```

Этот паттерн полезен, когда нужно изменить одно или несколько полей на основе текущего состояния модели.

### Обновление отдельного поля напрямую с помощью `set()` {#update-a-single-field-directly-with-set}

Используйте `set()` на значениях отдельных полей, чтобы напрямую обновить состояние поля:

```ts
clearEmail() {
  this.userForm.email().value.set('');
}

incrementAge() {
  const currentAge = this.userForm.age().value();
  this.userForm.age().value.set(currentAge + 1);
}
```

Это также известно как «обновления на уровне полей». Они автоматически распространяются на сигнал модели и поддерживают
синхронизацию обоих.

### Пример: Загрузка данных из API

Распространенный паттерн включает получение данных и заполнение модели:

```ts
export class UserProfileComponent {
  userModel = signal({
    name: '',
    email: '',
    bio: ''
  })

  userForm = form(this.userModel)
  private userService = inject(UserService)

  ngOnInit() {
    this.loadUserProfile()
  }

  async loadUserProfile() {
    const userData = await this.userService.getUserProfile()
    this.userModel.set(userData)
  }
}
```

Поля формы автоматически обновляются при изменении модели, отображая полученные данные без дополнительного кода.

## Двусторонняя привязка данных

Директива `[field]` создает автоматическую двустороннюю синхронизацию между моделью, состоянием формы и UI.

### Как передаются данные

Изменения передаются в обоих направлениях:

**Пользовательский ввод → Модель:**

1. Пользователь вводит данные в элемент ввода
2. Директива `[field]` обнаруживает изменение
3. Состояние поля обновляется
4. Сигнал модели обновляется

**Программное обновление → UI:**

1. Код обновляет модель с помощью `set()` или `update()`
2. Сигнал модели уведомляет подписчиков
3. Состояние поля обновляется
4. Директива `[field]` обновляет элемент ввода

Эта синхронизация происходит автоматически. Вам не нужно писать подписки или обработчики событий для синхронизации
модели и UI.

### Пример: Оба направления

```angular-ts
@Component({
  template: `
    <input type="text" [field]="userForm.name" />
    <button (click)="setName('Bob')">Set Name to Bob</button>
    <p>Current name: {{ userModel().name }}</p>
  `
})
export class UserComponent {
  userModel = signal({ name: '' })
  userForm = form(this.userModel)

  setName(name: string) {
    this.userModel.update(current => ({ ...current, name }))
    // Input автоматически отображает 'Bob'
  }
}
```

Когда пользователь вводит данные в поле ввода, `userModel().name` обновляется. При нажатии кнопки значение поля ввода
меняется на «Bob». Ручной код синхронизации не требуется.

## Паттерны структуры модели

Модели форм могут быть плоскими объектами или содержать вложенные объекты и массивы. Выбранная структура влияет на то,
как вы получаете доступ к полям и организуете валидацию.

### Плоские и вложенные модели

Плоские модели форм хранят все поля на верхнем уровне:

```ts
// Плоская структура
const userModel = signal({
  name: '',
  email: '',
  street: '',
  city: '',
  state: '',
  zip: ''
})
```

Вложенные модели группируют связанные поля:

```ts
// Вложенная структура
const userModel = signal({
  name: '',
  email: '',
  address: {
    street: '',
    city: '',
    state: '',
    zip: ''
  }
})
```

**Используйте плоские структуры, когда:**

- Поля не имеют четкой концептуальной группировки
- Вам нужен более простой доступ к полям (`userForm.city` против `userForm.address.city`)
- Правила валидации охватывают несколько потенциальных групп

**Используйте вложенные структуры, когда:**

- Поля образуют четкую концептуальную группу (например, адрес)
- Сгруппированные данные соответствуют структуре вашего API
- Вы хотите валидировать группу как единое целое

### Работа с вложенными объектами

Вы можете получить доступ к вложенным полям, следуя по пути объекта:

```ts
const userModel = signal({
  profile: {
    firstName: '',
    lastName: ''
  },
  settings: {
    theme: 'light',
    notifications: true
  }
})

const userForm = form(userModel)

// Доступ к вложенным полям
userForm.profile.firstName // FieldTree<string>
userForm.settings.theme // FieldTree<string>
```

В шаблонах вы привязываете вложенные поля так же, как и поля верхнего уровня:

```angular-ts
@Component({
  template: `
    <input [field]="userForm.profile.firstName" />
    <input [field]="userForm.profile.lastName" />

    <select [field]="userForm.settings.theme">
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  `,
})
```

### Работа с массивами

Модели могут включать массивы для коллекций элементов:

```ts
const orderModel = signal({
  customerName: '',
  items: [{ product: '', quantity: 0, price: 0 }]
})

const orderForm = form(orderModel)

// Доступ к элементам массива по индексу
orderForm.items[0].product // FieldTree<string>
orderForm.items[0].quantity // FieldTree<number>
```

Элементы массива, содержащие объекты, автоматически получают идентификаторы отслеживания, что помогает сохранять
состояние полей даже при изменении позиции элементов в массиве. Это гарантирует, что состояние валидации и
взаимодействия пользователя сохраняются корректно при переупорядочивании массивов.

<!-- TBD: For dynamic arrays and complex array operations, see the [Working with arrays guide](guide/forms/signals/arrays). -->

## Лучшие практики проектирования моделей

Хорошо спроектированные модели форм делают формы проще в поддержке и расширении. Следуйте этим паттернам при
проектировании ваших моделей.

### Используйте конкретные типы

Всегда определяйте интерфейсы или типы для ваших моделей, как показано в
разделе [Использование типов TypeScript](#using-typescript-types). Явные типы обеспечивают лучший IntelliSense,
отлавливают ошибки во время компиляции и служат документацией того, какие данные содержит форма.

### Инициализируйте все поля

Предоставляйте начальные значения для каждого поля в вашей модели:

```ts
// Хорошо: Все поля инициализированы
const taskModel = signal({
  title: '',
  description: '',
  priority: 'medium',
  completed: false
})
```

```ts
// Избегайте: Частичная инициализация
const taskModel = signal({
  title: ''
  // Отсутствуют description, priority, completed
})
```

Отсутствие начальных значений означает, что эти поля не будут существовать в дереве полей, что сделает их недоступными
для взаимодействия с формой.

### Сохраняйте модели сфокусированными

Каждая модель должна представлять одну форму или связный набор связанных данных:

```ts
// Хорошо: Сфокусировано на входе
const loginModel = signal({
  email: '',
  password: ''
})
```

```ts
// Избегайте: Смешивание несвязанных задач
const appModel = signal({
  // Данные входа
  email: '',
  password: '',
  // Настройки пользователя
  theme: 'light',
  language: 'en',
  // Корзина покупок
  cartItems: []
})
```

Разделение моделей для разных задач делает формы проще для понимания и повторного использования. Создавайте несколько
форм, если вы управляете различными наборами данных.

### Учитывайте требования валидации

Проектируйте модели с учетом валидации. Группируйте поля, которые валидируются вместе:

```ts
// Хорошо: Поля пароля сгруппированы для сравнения
interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
```

Такая структура делает перекрестную валидацию полей (например, проверку совпадения `newPassword` и `confirmPassword`)
более естественной.

### Планируйте начальное состояние

Подумайте, начинается ли ваша форма пустой или предварительно заполненной:

```ts
// Форма, которая начинается пустой (новый пользователь)
const newUserModel = signal({
  name: '',
  email: '',
});

// Форма, которая загружает существующие данные
const editUserModel = signal({
  name: '',
  email: '',
});

// Позже, в ngOnInit:
ngOnInit() {
  this.loadExistingUser();
}

async loadExistingUser() {
  const user = await this.userService.getUser(this.userId);
  this.editUserModel.set(user);
}
```

Для форм, которые всегда начинаются с существующих данных, вы можете подождать с рендерингом формы до загрузки данных,
чтобы избежать мигания пустых полей.

<!-- TODO: UNCOMMENT WHEN THE GUIDES ARE AVAILABLE -->
<!-- ## Next steps

<docs-pill-row>
  <docs-pill href="guide/forms/signals/field-state-management" title="Field State Management" />
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/arrays" title="Working with Arrays" />
</docs-pill-row> -->
