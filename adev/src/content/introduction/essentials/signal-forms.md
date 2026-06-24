<docs-decorative-header title="Формы с сигналами" imgSrc="adev/src/assets/images/signals.svg"> </docs-decorative-header>

ВАЖНО: Формы с сигналами являются [экспериментальными](/reference/releases#experimental). API может измениться в будущих
релизах. Избегайте использования экспериментальных API в продакшн-приложениях без понимания рисков.

Формы с сигналами (Signal Forms) управляют состоянием формы, используя сигналы Angular, чтобы обеспечить автоматическую
синхронизацию между вашей моделью данных и UI с помощью Angular Signals.

Это руководство проведет вас через основные концепции создания форм с Signal Forms. Вот как это работает:

## Создание вашей первой формы

### 1. Создайте модель формы с `signal()`

Каждая форма начинается с создания сигнала, который хранит модель данных вашей формы:

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

### 2. Передайте модель формы в `form()` для создания `FieldTree`

Затем вы передаете модель вашей формы в функцию `form()` для создания **дерева полей (field tree)** - структуры
объектов, которая отражает форму вашей модели, позволяя вам получать доступ к полям через точечную нотацию:

```ts
const loginForm = form(loginModel);

// Access fields directly by property name
loginForm.email
loginForm.password
```

### 3. Свяжите HTML инпуты с директивой `[field]`

Далее, вы связываете ваши HTML инпуты с формой, используя директиву `[field]`, которая создает двустороннюю привязку
между ними:

```html
<input type="email" [field]="loginForm.email" />
<input type="password" [field]="loginForm.password" />
```

В результате действия пользователя (например, ввод в поле) автоматически обновляют форму.

ПРИМЕЧАНИЕ: Директива `[field]` также синхронизирует состояние поля для таких атрибутов, как `required`, `disabled` и
`readonly`, когда это уместно.

### 4. Чтение значений полей с `value()`

Вы можете получить доступ к состоянию поля, вызвав поле как функцию. Это возвращает объект `FieldState`, содержащий
реактивные сигналы для значения поля, статуса валидации и состояния взаимодействия:

```ts
loginForm.email() // Returns FieldState with value(), valid(), touched(), etc.
```

Чтобы прочитать текущее значение поля, обратитесь к сигналу `value()`:

```html
<!-- Render form value that updates automatically as user types -->
<p>Email: {{ loginForm.email().value() }}</p>
```

```ts
// Get the current value
const currentEmail = loginForm.email().value();
```

### 5. Обновление значений полей с `set()`

Вы можете программно обновить значение поля, используя метод `value.set()`. Это обновляет как поле, так и сигнал базовой
модели:

```ts
// Update the value programmatically
loginForm.email().value.set('alice@wonderland.com');
```

В результате и значение поля, и сигнал модели обновляются автоматически:

```ts
// The model signal is also updated
console.log(loginModel().email); // 'alice@wonderland.com'
```

Вот полный пример:

<docs-code-multifile preview path="adev/src/content/examples/signal-forms/src/login-simple/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signal-forms/src/login-simple/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signal-forms/src/login-simple/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signal-forms/src/login-simple/app/app.css"/>
</docs-code-multifile>

## Базовое использование

Директива `[field]` работает со всеми стандартными типами HTML инпутов. Вот наиболее распространенные паттерны:

### Текстовые поля ввода

Текстовые поля ввода работают с различными атрибутами `type` и текстовыми областями (textareas):

```html
<!-- Text and email -->
<input type="text" [field]="form.name" />
<input type="email" [field]="form.email" />
```

#### Числа

Числовые поля ввода автоматически преобразуют значения между строками и числами:

```html
<!-- Number - automatically converts to number type -->
<input type="number" [field]="form.age" />
```

#### Дата и время

Поля ввода даты хранят значения в виде строк `YYYY-MM-DD`, а поля ввода времени используют формат `HH:mm`:

```html
<!-- Date and time - stores as ISO format strings -->
<input type="date" [field]="form.eventDate" />
<input type="time" [field]="form.eventTime" />
```

Если вам нужно преобразовать строки даты в объекты Date, вы можете сделать это, передав значение поля в `Date()`:

```ts
const dateObject = new Date(form.eventDate().value());
```

#### Многострочный текст

Текстовые области (textareas) работают так же, как и текстовые поля ввода:

```html
<!-- Textarea -->
<textarea [field]="form.message" rows="4"></textarea>
```

### Чекбоксы

Чекбоксы привязываются к булевым значениям:

```html
<!-- Single checkbox -->
<label>
  <input type="checkbox" [field]="form.agreeToTerms" />
  I agree to the terms
</label>
```

#### Множественные чекбоксы

Для нескольких опций создайте отдельное булево поле `field` для каждой:

```html
<label>
  <input type="checkbox" [field]="form.emailNotifications" />
  Email notifications
</label>
<label>
  <input type="checkbox" [field]="form.smsNotifications" />
  SMS notifications
</label>
```

### Радиокнопки

Радиокнопки работают аналогично чекбоксам. Пока радиокнопки используют одно и то же значение `[field]`, Signal Forms
будет автоматически привязывать один и тот же атрибут `name` ко всем ним:

```html
<label>
  <input type="radio" value="free" [field]="form.plan" />
  Free
</label>
<label>
  <input type="radio" value="premium" [field]="form.plan" />
  Premium
</label>
```

Когда пользователь выбирает радиокнопку, `field` формы сохраняет значение из атрибута `value` этой радиокнопки.
Например, выбор "Premium" устанавливает `form.plan().value()` в `"premium"`.

### Выпадающие списки (Select)

Элементы select работают как со статическими, так и с динамическими опциями:

```html
<!-- Static options -->
<select [field]="form.country">
  <option value="">Select a country</option>
  <option value="us">United States</option>
  <option value="ca">Canada</option>
</select>

<!-- Dynamic options with @for -->
<select [field]="form.productId">
  <option value="">Select a product</option>
  @for (product of products; track product.id) {
    <option [value]="product.id">{{ product.name }}</option>
  }
</select>
```

ПРИМЕЧАНИЕ: Множественный выбор (`<select multiple>`) в настоящее время не поддерживается директивой `[field]`.

## Валидация и состояние

Signal Forms предоставляет встроенные валидаторы, которые вы можете применить к полям вашей формы. Чтобы добавить
валидацию, передайте функцию схемы в качестве второго аргумента в `form()`:

```ts
const loginForm = form(loginModel, (schemaPath) => {
  debounce(schemaPath.email, 500);
  required(schemaPath.email);
  email(schemaPath.email);
});
```

Функция схемы принимает параметр **schema path**, который предоставляет пути к вашим полям для настройки правил
валидации.

Распространенные валидаторы включают:

- **`required()`** - Гарантирует, что поле имеет значение
- **`email()`** - Проверяет формат электронной почты
- **`min()`** / **`max()`** - Проверяет диапазоны чисел
- **`minLength()`** / **`maxLength()`** - Проверяет длину строки или коллекции
- **`pattern()`** - Проверяет соответствие regex паттерну

Вы также можете настроить сообщения об ошибках, передав объект опций в качестве второго аргумента валидатору:

```ts
required(schemaPath.email, { message: 'Email is required' });
email(schemaPath.email, { message: 'Please enter a valid email address' });
```

Каждое поле формы предоставляет свое состояние валидации через сигналы. Например, вы можете проверить `field().valid()`,
чтобы узнать, прошла ли валидация, `field().touched()`, чтобы узнать, взаимодействовал ли пользователь с ним, и
`field().errors()`, чтобы получить список ошибок валидации.

Вот полный пример:

<docs-code-multifile preview path="adev/src/content/examples/signal-forms/src/login-validation/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.css"/>
</docs-code-multifile>

### Сигналы состояния поля

Каждое `field()` предоставляет следующие сигналы состояния:

| State        | Description                                                         |
|--------------|---------------------------------------------------------------------|
| `valid()`    | Возвращает `true`, если поле проходит все правила валидации         |
| `touched()`  | Возвращает `true`, если пользователь сфокусировался и ушел с поля   |
| `dirty()`    | Возвращает `true`, если пользователь изменил значение               |
| `disabled()` | Возвращает `true`, если поле отключено (disabled)                   |
| `readonly()` | Возвращает `true`, если поле доступно только для чтения (readonly)  |
| `pending()`  | Возвращает `true`, если выполняется асинхронная валидация           |
| `errors()`   | Возвращает массив ошибок валидации со свойствами `kind` и `message` |

## Следующие шаги

Чтобы узнать больше о Signal Forms и о том, как они работают, ознакомьтесь с подробными руководствами:

- [Обзор](guide/forms/signals/overview) - Введение в Signal Forms и когда их использовать
- [Модели форм](guide/forms/signals/models) - Создание и управление данными форм с помощью сигналов
- [Управление состоянием поля](guide/forms/signals/field-state-management) - Работа с состоянием валидации,
  отслеживанием взаимодействия и видимостью полей
- [Валидация](guide/forms/signals/validation) - Встроенные валидаторы, пользовательские правила валидации и асинхронная
  валидация
