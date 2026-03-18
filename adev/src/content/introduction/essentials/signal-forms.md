<docs-decorative-header title="Формы с сигналами" imgSrc="adev/src/assets/images/signals.svg"> </docs-decorative-header>

IMPORTANT: Signal Forms являются [экспериментальными](/reference/releases#experimental). API может измениться в будущих релизах. Избегайте использования экспериментальных API в продакшн-приложениях без понимания связанных рисков.

Signal Forms управляют состоянием формы с помощью сигналов Angular, обеспечивая автоматическую синхронизацию между моделью данных и пользовательским интерфейсом.

Это руководство знакомит вас с основными концепциями создания форм с помощью Signal Forms. Вот как это работает:

## Создание первой формы {#creating-your-first-form}

### 1. Создайте модель формы с помощью `signal()` {#1-create-a-form-model-with-signal}

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

### 2. Передайте модель формы в `form()` для создания `FieldTree` {#2-pass-the-form-model-to-form-to-create-a-fieldtree}

Затем вы передаёте модель формы в функцию `form()`, чтобы создать **дерево полей (field tree)** — объектную структуру, отражающую форму вашей модели и позволяющую обращаться к полям через точечную нотацию:

```ts
const loginForm = form(loginModel);

// Access fields directly by property name
loginForm.email;
loginForm.password;
```

### 3. Привяжите HTML-поля ввода с помощью директивы `[formField]` {#3-bind-html-inputs-with-formfield-directive}

Затем вы привязываете HTML-поля ввода к форме с помощью директивы `[formField]`, которая создаёт двустороннюю привязку между ними:

```html
<input type="email" [formField]="loginForm.email" />
<input type="password" [formField]="loginForm.password" />
```

В результате изменения пользователя (например, ввод текста в поле) автоматически обновляют форму.

NOTE: Директива `[formField]` также синхронизирует состояние поля для таких атрибутов, как `required`, `disabled` и `readonly`, где это уместно.

### 4. Читайте значения полей с помощью `value()` {#4-read-field-values-with-value}

Вы можете получить состояние поля, вызвав его как функцию. Это возвращает объект `FieldState`, содержащий реактивные сигналы для значения поля, статуса валидации и состояния взаимодействия:

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

Вы можете программно обновить значение поля с помощью метода `value.set()`. Это обновляет как поле, так и базовый сигнал модели:

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

## Основное использование {#basic-usage}

Директива `[formField]` работает со всеми стандартными типами HTML-полей ввода. Вот наиболее распространённые шаблоны:

### Текстовые поля ввода {#text-inputs}

Текстовые поля ввода работают с различными атрибутами `type` и элементами textarea:

```html
<!-- Text and email -->
<input type="text" [formField]="form.name" />
<input type="email" [formField]="form.email" />
```

#### Числа {#numbers}

Числовые поля ввода автоматически конвертируют строки в числа:

```html
<!-- Number - automatically converts to number type -->
<input type="number" [formField]="form.age" />
```

#### Дата и время {#date-and-time}

Поля даты хранят значения в виде строк формата `YYYY-MM-DD`, а поля времени используют формат `HH:mm`:

```html
<!-- Date and time - stores as ISO format strings -->
<input type="date" [formField]="form.eventDate" />
<input type="time" [formField]="form.eventTime" />
```

Если нужно преобразовать строки дат в объекты `Date`, это можно сделать, передав значение поля в `Date()`:

```ts
const dateObject = new Date(form.eventDate().value());
```

#### Многострочный текст {#multiline-text}

Элементы textarea работают так же, как текстовые поля ввода:

```html
<!-- Textarea -->
<textarea [formField]="form.message" rows="4"></textarea>
```

### Флажки (чекбоксы) {#checkboxes}

Флажки привязываются к булевым значениям:

```html
<!-- Single checkbox -->
<label>
  <input type="checkbox" [formField]="form.agreeToTerms" />
  I agree to the terms
</label>
```

#### Несколько флажков {#multiple-checkboxes}

Для нескольких параметров создайте отдельный булев `formField` для каждого:

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

### Переключатели (радиокнопки) {#radio-buttons}

Переключатели работают аналогично флажкам. Пока переключатели используют одно и то же значение `[formField]`, Signal Forms автоматически привяжет одинаковый атрибут `name` ко всем им:

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

Когда пользователь выбирает переключатель, `formField` формы сохраняет значение из атрибута `value` этого переключателя. Например, выбор «Premium» устанавливает `form.plan().value()` равным `"premium"`.

### Выпадающие списки (select) {#select-dropdowns}

Элементы select работают как со статическими, так и с динамическими опциями:

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

NOTE: Множественный выбор (`<select multiple>`) на данный момент не поддерживается директивой `[formField]`.

## Валидация и состояние {#validation-and-state}

Signal Forms предоставляет встроенные валидаторы, которые можно применять к полям формы. Чтобы добавить валидацию, передайте функцию-схему вторым аргументом в `form()`:

```ts
const loginForm = form(loginModel, (schemaPath) => {
  debounce(schemaPath.email, 500);
  required(schemaPath.email);
  email(schemaPath.email);
});
```

Функция-схема получает параметр **пути схемы (schema path)**, предоставляющий пути к полям для настройки правил валидации.

Распространённые валидаторы включают:

- **`required()`** — проверяет, что поле имеет значение
- **`email()`** — проверяет формат email
- **`min()`** / **`max()`** — проверяет диапазоны чисел
- **`minLength()`** / **`maxLength()`** — проверяет длину строки или коллекции
- **`pattern()`** — проверяет соответствие регулярному выражению

Вы также можете настраивать сообщения об ошибках, передав объект с параметрами вторым аргументом в валидатор:

```ts
required(schemaPath.email, {message: 'Email is required'});
email(schemaPath.email, {message: 'Please enter a valid email address'});
```

Каждое поле формы предоставляет своё состояние валидации через сигналы. Например, вы можете проверить `field().valid()`, чтобы узнать, прошла ли валидация, `field().touched()` — взаимодействовал ли пользователь с полем, и `field().errors()` — получить список ошибок валидации.

Вот полный пример:

<docs-code-multifile preview path="adev/src/content/examples/signal-forms/src/login-validation/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.css"/>
</docs-code-multifile>

### Сигналы состояния поля {#field-state-signals}

Каждый `field()` предоставляет следующие сигналы состояния:

| Состояние    | Описание                                                                           |
| ------------ | ---------------------------------------------------------------------------------- |
| `valid()`    | Возвращает `true`, если поле прошло все правила валидации                          |
| `touched()`  | Возвращает `true`, если пользователь сфокусировался на поле и затем покинул его    |
| `dirty()`    | Возвращает `true`, если пользователь изменил значение                              |
| `disabled()` | Возвращает `true`, если поле отключено                                             |
| `readonly()` | Возвращает `true`, если поле доступно только для чтения                            |
| `pending()`  | Возвращает `true`, если асинхронная валидация выполняется                          |
| `errors()`   | Возвращает массив ошибок валидации со свойствами `kind` и `message`                |

## Следующие шаги {#next-steps}

Чтобы узнать больше о Signal Forms и принципах их работы, ознакомьтесь с углубленными руководствами:

- [Обзор](guide/forms/signals/overview) — введение в Signal Forms и случаи их применения
- [Модели форм](guide/forms/signals/models) — создание и управление данными формы с помощью сигналов
- [Управление состоянием поля](guide/forms/signals/field-state-management) — работа со состоянием валидации, отслеживанием взаимодействий и видимостью полей
- [Валидация](guide/forms/signals/validation) — встроенные валидаторы, пользовательские правила валидации и асинхронная валидация
