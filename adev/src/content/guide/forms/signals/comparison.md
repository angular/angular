# Сравнение с другими подходами к формам

Angular предоставляет три подхода к созданию форм: Signal Forms, Reactive Forms и Template-driven Forms. У каждого свои паттерны управления состоянием, валидацией и потоком данных. Это руководство помогает понять различия и выбрать подходящий подход для проекта.

## Краткое сравнение {#quick-comparison}

| Возможность      | Signal Forms                       | Reactive Forms                        | Template-driven Forms   |
| ---------------- | ---------------------------------- | ------------------------------------- | ----------------------- |
| Источник истины  | Пользовательская writable signal-модель | `FormControl`/`FormGroup`          | Модель пользователя в компоненте |
| Типобезопасность | Выводится из модели                | Явная с typed forms                   | Минимальная             |
| Валидация        | Схема с path-based валидаторами    | Список валидаторов, передаваемых Controls | На основе директив   |
| Управление состоянием | На основе сигналов            | На основе Observable                  | Управляется Angular     |
| Настройка        | Signal + функция схемы             | Дерево FormControl                    | NgModel в шаблоне       |
| Лучше всего для  | Приложений на сигналах             | Сложных форм                          | Простых форм            |
| Кривая обучения  | Средняя                            | Средняя–высокая                       | Низкая                  |
| Статус           | Stable (v22+)                      | Stable                                | Stable                  |

## На примере: форма входа {#by-example-login-form}

Лучший способ понять различия — увидеть одну и ту же форму, реализованную всеми тремя подходами.

<docs-code-multifile>
  <docs-code language="angular-ts" header="Signal forms" path="adev/src/content/examples/signal-forms/src/comparison/app/signal-forms.ts"/>
  <docs-code header="Reactive forms" path="adev/src/content/examples/signal-forms/src/comparison/app/reactive-forms.ts"/>
  <docs-code header="Template-driven forms" path="adev/src/content/examples/signal-forms/src/comparison/app/template-driven-forms.ts"/>
</docs-code-multifile>

## Понимание различий {#understanding-the-differences}

Три подхода делают разные проектные выборы, влияющие на то, как вы пишете и сопровождаете формы. Эти различия связаны с тем, где каждый подход хранит состояние формы и как управляет валидацией.

### Где живут данные формы {#where-your-form-data-lives}

Самое фундаментальное различие — где каждый подход считает «источником истины» значения формы.

Signal Forms хранят данные в writable signal. Когда нужны текущие значения формы, вы вызываете сигнал:

```ts
const credentials = this.loginModel(); // { email: '...', password: '...' }
```

Это держит данные формы в одном реактивном контейнере, который автоматически уведомляет Angular при изменении значений. Структура формы точно отражает модель данных.

Reactive Forms хранят данные внутри экземпляров FormControl и FormGroup. Значения доступны через иерархию формы:

```ts
const credentials = this.loginForm.value; // { email: '...', password: '...' }
```

Это отделяет управление состоянием формы от модели данных компонента. Структура формы явная, но требует больше кода настройки.

Template-driven Forms хранят данные в свойствах компонента. Значения доступны напрямую:

```ts
const credentials = {email: this.email, password: this.password};
```

Это самый прямой подход, но требует вручную собирать значения, когда они нужны. Angular управляет состоянием формы через директивы в шаблоне.

### Как работает валидация {#how-validation-works}

Каждый подход определяет правила валидации по-разному, влияя на то, где живёт логика валидации и как её сопровождать.

Signal Forms используют функцию схемы, где валидаторы привязываются к путям полей:

```ts
loginForm = form(this.loginModel, (fieldPath) => {
  required(fieldPath.email, {message: 'Email is required'});
  email(fieldPath.email, {message: 'Enter a valid email address'});
});
```

Все правила валидации живут вместе в одном месте. Функция схемы выполняется один раз при создании формы, а валидаторы запускаются автоматически при изменении значений полей. Сообщения об ошибках — часть определения валидации.

Reactive Forms прикрепляют валидаторы при создании controls:

```ts
loginForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
});
```

Валидаторы привязаны к отдельным controls в структуре формы. Это распределяет валидацию по определению формы. Сообщения об ошибках обычно живут в шаблоне.

Template-driven Forms используют атрибуты директив в шаблоне:

```html
<input [(ngModel)]="email" required email />
```

Правила валидации живут в шаблоне рядом с HTML. Это держит валидацию близко к UI, но распределяет логику между шаблоном и компонентом.

### Типобезопасность и автодополнение {#type-safety-and-autocomplete}

Интеграция с TypeScript существенно различается между подходами, влияя на то, насколько компилятор помогает избегать ошибок.

Signal Forms выводят типы из структуры модели:

```ts
const loginModel = signal({email: '', password: ''});
const loginForm = form(loginModel);
// TypeScript knows: loginForm.email exists and returns FieldState<string>
```

Форма данных определяется один раз в сигнале, и TypeScript автоматически знает, какие поля существуют и их типы. Обращение к `loginForm.username` (которого нет) даёт ошибку типа.

Reactive Forms требуют явных аннотаций типов с typed forms:

```ts
const loginForm = new FormGroup({
  email: new FormControl<string>(''),
  password: new FormControl<string>(''),
});
// TypeScript knows: loginForm.controls.email is FormControl<string>
```

Типы указываются для каждого control отдельно. TypeScript проверяет структуру формы, но информацию о типах нужно поддерживать отдельно от модели данных.

Template-driven Forms предлагают минимальную типобезопасность:

```ts
email = '';
password = '';
// TypeScript only knows these are strings, no form-level typing
```

TypeScript понимает свойства компонента, но не знает о структуре формы или валидации. Проверка на этапе компиляции для операций с формой теряется.

## Выбор подхода {#choose-your-approach}

### Используйте Signal Forms, если: {#use-signal-forms-if}

- Вы создаёте новые приложения на сигналах (Angular v22+)
- Нужна типобезопасность, выводимая из структуры модели
- Вам близка валидация на основе схем
- Команда знакома с сигналами

### Используйте Reactive Forms, если: {#use-reactive-forms-if}

- Нужна production-ready стабильность
- Вы создаёте сложные динамические формы
- Предпочитаете паттерны на основе Observable
- Нужен тонкий контроль над состоянием формы
- Вы работаете с существующей кодовой базой reactive forms

### Используйте Template-driven Forms, если: {#use-template-driven-forms-if}

- Вы создаёте простые формы (вход, контакт, поиск)
- Делаете быстрый прототип
- Логика формы прямолинейна
- Предпочитаете держать логику формы в шаблонах
- Вы работаете с существующей кодовой базой template-driven forms

## Следующие шаги {#next-steps}

Чтобы узнать больше о каждом подходе:

- **Signal Forms**: см. [обзорное руководство](guide/forms/signals/overview) для старта или углубитесь в [модели форм](guide/forms/signals/models), [валидацию](guide/forms/signals/validation) и [управление состоянием полей](guide/forms/signals/field-state-management)
- **Reactive Forms**: см. [руководство по Reactive Forms](guide/forms/reactive-forms) в документации Angular
- **Template-driven Forms**: см. [руководство по Template-driven Forms](guide/forms/template-driven-forms) в документации Angular
