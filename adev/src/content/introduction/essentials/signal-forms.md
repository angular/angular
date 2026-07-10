<docs-decorative-header title="Формы на сигналах" imgSrc="adev/src/assets/images/signals.svg"> </docs-decorative-header>

Signal Forms управляют состоянием форм с помощью сигналов Angular, обеспечивая автоматическую синхронизацию между моделью данных и UI.

Это руководство проводит по основным концепциям создания форм с Signal Forms. Как это работает:

## Создание первой формы {#creating-your-first-form}

### 1. Создайте модель формы с `signal()` {#1-create-a-form-model-with-signal}

Каждая форма начинается с создания сигнала, хранящего модель данных формы:

```ts
interface LoginData {
  email: string;
  password: string;
}

const loginModel = signal<LoginData>({
  email: '',
  password: '',
});
```

### 2. Передайте модель формы в `form()`, чтобы создать `FieldTree` {#2-pass-the-form-model-to-form-to-create-a-fieldtree}

Затем передайте модель формы в функцию `form()`, чтобы создать **дерево полей** — объектную структуру, зеркалирующую форму модели и позволяющую обращаться к полям через точечную нотацию.

И корневой объект формы, и его вложенные свойства — узлы `FieldTree`:

```ts
const loginForm = form(loginModel);

loginForm; // is a FieldTree
loginForm.email; // is also a FieldTree
```

### 3. Привяжите HTML-поля директивой `[formField]` {#3-bind-html-inputs-with-formfield-directive}

Далее привяжите HTML-поля к форме директивой `[formField]`, которая создаёт двустороннюю привязку:

```html
<input type="email" [formField]="loginForm.email" />
<input type="password" [formField]="loginForm.password" />
```

В результате изменения пользователя (например, ввод в поле) автоматически обновляют форму.

NOTE: Директива `[formField]` также синхронизирует состояние поля для атрибутов вроде `required`, `disabled` и `readonly`, когда это уместно.

### 4. Читайте состояние через сигналы `FieldTree` {#4-read-state-with-fieldtree-signals}

К состоянию любой части дерева можно обратиться, вызвав узел `FieldTree` как функцию. Это возвращает объект состояния с реактивными сигналами значения, статуса валидации и состояния взаимодействия:

```ts
loginForm(); // Returns state for the whole form
loginForm.email(); // Returns state for the email field
```

Чтобы прочитать текущее значение, обратитесь к сигналу `value()`:

```html
<!-- Render values that update automatically as user types -->
<p>Form value: {{ loginForm().value() | json }}</p>
<p>Email: {{ loginForm.email().value() }}</p>
```

```ts
// Get the current value
const currentEmail = loginForm.email().value();
```

### 5. Обновляйте значения через `set()` {#5-update-values-with-set}

Значения можно обновлять программно методом `value.set()` на любом узле. Это обновляет и `FieldTree`, и нижележащий сигнал модели:

```ts
// Update the value programmatically
loginForm.email().value.set('alice@wonderland.com');
```

В результате автоматически обновляются и значение поля, и сигнал модели:

```ts
// The model signal is also updated
console.log(loginModel().email); // 'alice@wonderland.com'
```

### Полный пример {#complete-example}

<docs-code-multifile preview path="adev/src/content/examples/signal-forms/src/login-simple/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signal-forms/src/login-simple/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signal-forms/src/login-simple/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signal-forms/src/login-simple/app/app.css"/>
</docs-code-multifile>

## Базовое использование {#basic-usage}

Директива `[formField]` работает со всеми стандартными типами HTML-полей. Вот самые распространённые паттерны:

### Текстовые поля {#text-inputs}

Текстовые поля работают с разными атрибутами `type` и textarea:

```html
<!-- Text and email -->
<input type="text" [formField]="form.name" />
<input type="email" [formField]="form.email" />
```

#### Числа {#numbers}

Числовые поля автоматически преобразуют строки в числа и обратно:

```html
<!-- Number - automatically converts to number type -->
<input type="number" [formField]="form.age" />
```

#### Дата и время {#date-and-time}

Поля даты хранят значения как строки `YYYY-MM-DD`, поля времени — в формате `HH:mm`:

```html
<!-- Date and time - stores as ISO format strings -->
<input type="date" [formField]="form.eventDate" />
<input type="time" [formField]="form.eventTime" />
```

Если нужно преобразовать строки дат в объекты Date, передайте значение поля в `Date()`:

```ts
const dateObject = new Date(form.eventDate().value());
```

#### Многострочный текст {#multiline-text}

Textarea работают так же, как текстовые поля:

```html
<!-- Textarea -->
<textarea [formField]="form.message" rows="4"></textarea>
```

### Чекбоксы {#checkboxes}

Чекбоксы привязываются к булевым значениям:

```html
<!-- Single checkbox -->
<label>
  <input type="checkbox" [formField]="form.agreeToTerms" />
  I agree to the terms
</label>
```

#### Несколько чекбоксов {#multiple-checkboxes}

Для нескольких опций создайте отдельный булев `formField` для каждой:

```html
<label>
  <input type="checkbox" [formField]="form.emailNotifications" />
  Email notifications
</label>
<label>
  <input type="checkbox" [formField]="form.smsNotifications" />
  SMS notifications
</label>
```

### Радиокнопки {#radio-buttons}

Радиокнопки работают похоже на чекбоксы. Пока радиокнопки используют одно и то же значение `[formField]`, Signal Forms автоматически привяжет одинаковый атрибут `name` ко всем:

```html
<label>
  <input type="radio" value="free" [formField]="form.plan" />
  Free
</label>
<label>
  <input type="radio" value="premium" [formField]="form.plan" />
  Premium
</label>
```

Когда пользователь выбирает радиокнопку, `formField` формы сохраняет значение из атрибута `value` этой радиокнопки. Например, выбор «Premium» устанавливает `form.plan().value()` в `"premium"`.

### Выпадающие списки select {#select-dropdowns}

Элементы select работают и со статическими, и с динамическими опциями:

```angular-html
<!-- Static options -->
<select [formField]="form.country">
  <option value="">Select a country</option>
  <option value="us">United States</option>
  <option value="ca">Canada</option>
</select>

<!-- Dynamic options with @for -->
<select [formField]="form.productId">
  <option value="">Select a product</option>
  @for (product of products; track product.id) {
    <option [value]="product.id">{{ product.name }}</option>
  }
</select>
```

NOTE: Множественный select (`<select multiple>`) сейчас не поддерживается директивой `[formField]`.

## Валидация и состояние {#validation-and-state}

Signal Forms предоставляет встроенные валидаторы, которые можно применять к полям формы. Чтобы добавить валидацию, передайте функцию схемы вторым аргументом в `form()`:

```ts
const loginForm = form(loginModel, (schemaPath) => {
  debounce(schemaPath.email, 500);
  required(schemaPath.email);
  email(schemaPath.email);
});
```

Функция схемы получает параметр **schema path**, дающий пути к полям для настройки правил валидации.

Распространённые валидаторы:

- **`required()`** — проверяет, что у поля есть значение
- **`email()`** — проверяет формат email
- **`min()`** / **`max()`** — проверяют диапазоны чисел
- **`minLength()`** / **`maxLength()`** — проверяют длину строки или коллекции
- **`pattern()`** — проверяет по regex-шаблону

Сообщения об ошибках можно настроить, передав объект опций вторым аргументом валидатора:

```ts
required(schemaPath.email, {message: 'Email is required'});
email(schemaPath.email, {message: 'Please enter a valid email address'});
```

Каждый узел в `FieldTree` предоставляет состояние валидации и взаимодействия через реактивные сигналы.

### Сигналы состояния FieldTree {#fieldtree-state-signals}

Каждый узел дерева, включая корневой объект формы, предоставляет одни и те же сигналы для отслеживания состояния. Поскольку каждый узел — `FieldTree`, API мониторинга валидности и взаимодействия одинаков на каждом уровне.

| Состояние    | Описание                                                                     |
| ------------ | ------------------------------------------------------------------------------- |
| `valid()`    | Возвращает `true`, если узел проходит все правила валидации                          |
| `invalid()`  | Возвращает `true`, если есть ошибки валидации                                   |
| `pending()`  | Возвращает `true`, если идёт асинхронная валидация                               |
| `touched()`  | Возвращает `true`, если пользователь сфокусировал и снял фокус с поля или любого дочернего поля |
| `dirty()`    | Возвращает `true`, если значение изменено пользователем                        |
| `disabled()` | Возвращает `true`, если узел отключён                                          |
| `readonly()` | Возвращает `true`, если узел только для чтения                                          |
| `errors()`   | Возвращает массив ошибок валидации со свойствами `kind` и `message`      |

### Полный пример {#complete-example-1}

<docs-code-multifile preview path="adev/src/content/examples/signal-forms/src/login-validation/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.css"/>
</docs-code-multifile>

## Следующие шаги {#next-steps}

Чтобы узнать больше о Signal Forms и их устройстве, см. подробные руководства:

- [Обзор](guide/forms/signals/overview) — введение в Signal Forms и когда их использовать
- [Модели форм](guide/forms/signals/models) — создание и управление данными форм с сигналами
- [Управление состоянием полей](guide/forms/signals/field-state-management) — работа с состоянием валидации, отслеживанием взаимодействия и видимостью полей
- [Валидация](guide/forms/signals/validation) — встроенные валидаторы, пользовательские правила и асинхронная валидация

<docs-pill-row>
  <docs-pill title="Модульный дизайн с внедрением зависимостей" href="essentials/dependency-injection" />
</docs-pill-row>
