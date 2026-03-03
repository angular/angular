<docs-decorative-header title="Формы на основе сигналов" imgSrc="adev/src/assets/images/signals.svg"> </docs-decorative-header>

IMPORTANT: Формы на основе сигналов (Signal Forms) являются [экспериментальными](/reference/releases#experimental). API может измениться в будущих релизах. Избегайте использования экспериментальных API в продакшн-приложениях, не осознавая рисков.

Формы на основе сигналов управляют состоянием формы, используя сигналы Angular для обеспечения автоматической синхронизации между вашей моделью данных и пользовательским интерфейсом с помощью сигналов Angular.

Это руководство проведет вас через основные концепции создания форм с Signal Forms. Вот как это работает:

## Создание вашей первой формы {#creating-your-first-form}

### 1. Создайте модель формы с помощью `signal()` {#1-create-a-form-model-with-signal}

Каждая форма начинается с создания сигнала, который содержит модель данных вашей формы:

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

### 2. Передайте модель формы в `form()` для создания `FieldTree` {#2-pass-the-form-model-to-form-to-create-a-fieldtree}

Затем вы передаете вашу модель формы в функцию `form()` для создания **дерева полей** — объектной структуры, которая отражает форму вашей модели и позволяет обращаться к полям через точечную нотацию:

```ts
const loginForm = form(loginModel);

// Access fields directly by property name
loginForm.email;
loginForm.password;
```

### 3. Привяжите HTML-поля ввода с помощью директивы `[formField]` {#3-bind-html-inputs-with-formfield-directive}

Далее вы привязываете ваши HTML-поля ввода к форме с помощью директивы `[formField]`, которая создает двустороннюю привязку между ними:

```html
<input type="email" [formField]="loginForm.email" />
<input type="password" [formField]="loginForm.password" />
```

В результате пользовательские изменения (такие как ввод текста в поле) автоматически обновляют форму.

NOTE: Директива `[formField]` также синхронизирует состояние поля для атрибутов, таких как `required`, `disabled` и `readonly`, когда это уместно.

### 4. Читайте значения полей с помощью `value()` {#4-read-field-values-with-value}

Вы можете получить доступ к состоянию поля, вызвав поле как функцию. Это возвращает объект `FieldState`, содержащий реактивные сигналы для значения поля, статуса валидации и состояния взаимодействия:

```ts
loginForm.email(); // Returns FieldState with value(), valid(), touched(), etc.
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

### 5. Обновляйте значения полей с помощью `set()` {#5-update-field-values-with-set}

Вы можете программно обновить значение поля, используя метод `value.set()`. Это обновляет как поле, так и базовый сигнал модели:

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

## Базовое использование {#basic-usage}

Директива `[formField]` работает со всеми стандартными типами HTML-полей ввода. Вот наиболее распространенные шаблоны:

### Текстовые поля ввода {#text-inputs}

Текстовые поля ввода работают с различными атрибутами `type` и textarea:

```html
<!-- Text and email -->
<input type="text" [formField]="form.name" />
<input type="email" [formField]="form.email" />
```

#### Числа {#numbers}

Числовые поля ввода автоматически конвертируют между строками и числами:

```html
<!-- Number - automatically converts to number type -->
<input type="number" [formField]="form.age" />
```

#### Дата и время {#date-and-time}

Поля ввода даты сохраняют значения в формате строк `YYYY-MM-DD`, а поля времени используют формат `HH:mm`:

```html
<!-- Date and time - stores as ISO format strings -->
<input type="date" [formField]="form.eventDate" />
<input type="time" [formField]="form.eventTime" />
```

Если вам нужно преобразовать строки даты в объекты Date, вы можете сделать это, передав значение поля в `Date()`:

```ts
const dateObject = new Date(form.eventDate().value());
```

#### Многострочный текст {#multiline-text}

Textarea работает так же, как текстовые поля ввода:

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

#### Множественные чекбоксы {#multiple-checkboxes}

Для нескольких вариантов создайте отдельный `formField` с булевым значением для каждого:

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

### Радио-кнопки {#radio-buttons}

Радио-кнопки работают аналогично чекбоксам. Если радио-кнопки используют одно и то же значение `[formField]`, Signal Forms автоматически привяжет один и тот же атрибут `name` ко всем из них:

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

Когда пользователь выбирает радио-кнопку, `formField` формы сохраняет значение из атрибута `value` этой радио-кнопки. Например, выбор "Premium" устанавливает `form.plan().value()` в `"premium"`.

### Выпадающие списки {#select-dropdowns}

Элементы select работают как со статическими, так и с динамическими вариантами:

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

NOTE: Множественный выбор (`<select multiple>`) в настоящее время не поддерживается директивой `[formField]`.

## Валидация и состояние {#validation-and-state}

Signal Forms предоставляет встроенные валидаторы, которые вы можете применять к полям вашей формы. Чтобы добавить валидацию, передайте функцию схемы вторым аргументом в `form()`:

```ts
const loginForm = form(loginModel, (schemaPath) => {
  debounce(schemaPath.email, 500);
  required(schemaPath.email);
  email(schemaPath.email);
});
```

Функция схемы получает параметр **schema path**, который предоставляет пути к вашим полям для настройки правил валидации.

Распространенные валидаторы включают:

- **`required()`** — проверяет, что поле имеет значение
- **`email()`** — проверяет формат электронной почты
- **`min()`** / **`max()`** — проверяет числовые диапазоны
- **`minLength()`** / **`maxLength()`** — проверяет длину строки или коллекции
- **`pattern()`** — проверяет соответствие регулярному выражению

Вы также можете настроить сообщения об ошибках, передав объект параметров вторым аргументом валидатора:

```ts
required(schemaPath.email, {message: 'Email is required'});
email(schemaPath.email, {message: 'Please enter a valid email address'});
```

Каждое поле формы предоставляет свое состояние валидации через сигналы. Например, вы можете проверить `field().valid()`, чтобы узнать, проходит ли валидация, `field().touched()`, чтобы узнать, взаимодействовал ли пользователь с полем, и `field().errors()`, чтобы получить список ошибок валидации.

Вот полный пример:

<docs-code-multifile preview path="adev/src/content/examples/signal-forms/src/login-validation/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.css"/>
</docs-code-multifile>

### Сигналы состояния полей {#field-state-signals}

Каждый `field()` предоставляет следующие сигналы состояния:

| Состояние    | Описание                                                                          |
| ------------ | --------------------------------------------------------------------------------- |
| `valid()`    | Возвращает `true`, если поле проходит все правила валидации                        |
| `touched()`  | Возвращает `true`, если пользователь фокусировал и покидал поле                   |
| `dirty()`    | Возвращает `true`, если пользователь изменил значение                              |
| `disabled()` | Возвращает `true`, если поле отключено                                             |
| `readonly()` | Возвращает `true`, если поле доступно только для чтения                            |
| `pending()`  | Возвращает `true`, если выполняется асинхронная валидация                          |
| `errors()`   | Возвращает массив ошибок валидации со свойствами `kind` и `message`                |

## Следующие шаги {#next-steps}

Чтобы узнать больше о Signal Forms и принципах работы, ознакомьтесь с углубленными руководствами:

- [Обзор](guide/forms/signals/overview) — Введение в Signal Forms и когда их использовать
- [Модели форм](guide/forms/signals/models) — Создание и управление данными формы с помощью сигналов
- [Управление состоянием полей](guide/forms/signals/field-state-management) — Работа с состоянием валидации, отслеживанием взаимодействий и видимостью полей
- [Валидация](guide/forms/signals/validation) — Встроенные валидаторы, пользовательские правила валидации и асинхронная валидация
