# Добавление логики формы

Signal Forms позволяют добавлять логику к форме с помощью схем. Логика валидации рассматривается в [руководстве по валидации](guide/forms/signals/validation), а это руководство обсуждает другие правила, доступные в схемах. Можно условно отключать поля, скрывать их на основе других значений, делать их readonly, debounce пользовательский ввод и прикреплять метаданные для пользовательских controls.

В этом руководстве показано, как использовать правила вроде `disabled()`, `hidden()`, `readonly()`, `debounce()` и `metadata()` для управления поведением полей.

## Когда добавлять логику формы {#when-to-add-form-logic}

Используйте правила, когда поведение поля зависит от значений других полей или должно обновляться реактивно. Например:

- Поле кода купона, которое отключено, когда сумма заказа слишком мала
- Поле адреса, которое скрыто, пока доставка не требуется
- Поле поиска с debounce для снижения числа API-вызовов

## Как работают правила {#how-rules-work}

Правила привязывают реактивную логику к конкретным полям формы. Большинство условных правил принимают объект options с функцией `when`. Функция `when` автоматически пересчитывается при изменении сигналов, на которые она ссылается, как и `computed`.

```ts
const orderForm = form(this.orderModel, (schemaPath) => {
  disabled(schemaPath.couponCode, {when: ({valueOf}) => valueOf(schemaPath.total) < 50});
  //~~~~~~ ~~~~~~~~~~~~~~~~~~~~~  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //rule     path                   reactive logic function
});
```

Функции реактивной логики получают объект `FieldContext`, который предоставляет доступ к значениям и состоянию полей через helper-функции вроде `valueOf()` и `stateOf()`. Часто его деструктурируют, чтобы обращаться к этим helpers напрямую.

NOTE: Параметр callback схемы (`schemaPath` в этих примерах) — объект `SchemaPathTree`, предоставляющий пути ко всем полям формы. Этот параметр можно назвать как угодно.

Полные детали свойств и методов `FieldContext` см. в [руководстве по валидации](guide/forms/signals/validation).

## Предотвращение обновлений поля с помощью `disabled()` {#prevent-field-updates-with-disabled}

Правило `disabled()` настраивает состояние disabled поля.

Оно работает с директивой `[formField]`, чтобы автоматически привязывать атрибут `disabled` на основе состояния поля, поэтому не нужно вручную добавлять `[disabled]="yourForm.fieldName().disabled()"` в шаблон.

NOTE: Отключённые поля пропускают валидацию — они не участвуют в проверках валидации формы. Значение поля сохраняется, но не валидируется. Подробности о поведении валидации см. в [руководстве по валидации](guide/forms/signals/validation).

### Всегда отключено {#always-disabled}

Чтобы отключить поле навсегда, вызовите `disabled()` только с путём поля:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, disabled} from '@angular/forms/signals';

@Component({
  selector: 'app-settings',
  imports: [FormField],
  template: `
    <label>
      System ID (cannot be changed)
      <input [formField]="settingsForm.systemId" />
    </label>
  `,
})
export class Settings {
  settingsModel = signal({
    systemId: 'SYS-12345',
    userName: '',
  });

  settingsForm = form(this.settingsModel, (schemaPath) => {
    disabled(schemaPath.systemId);
  });
}
```

### Условное отключение {#conditional-disabling}

Чтобы отключить поле на основе условий, предоставьте функцию `when`, которая возвращает `true` (отключено) или `false` (включено):

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, disabled} from '@angular/forms/signals';

@Component({
  selector: 'app-order',
  imports: [FormField],
  template: `
    <label>
      Order Total
      <input type="number" [formField]="orderForm.total" />
    </label>

    <label>
      Coupon Code
      <input [formField]="orderForm.couponCode" />
    </label>
  `,
})
export class Order {
  orderModel = signal({
    total: 25,
    couponCode: '',
  });

  orderForm = form(this.orderModel, (schemaPath) => {
    disabled(schemaPath.couponCode, {when: ({valueOf}) => valueOf(schemaPath.total) < 50});
  });
}
```

В этом примере, когда сумма заказа меньше $50, поле кода купона отключено.

### Причины отключения {#disabled-reasons}

При отключении поля предоставьте объяснения для пользователя, возвращая строку вместо `true`:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, disabled} from '@angular/forms/signals';

@Component({
  selector: 'app-order',
  imports: [FormField],
  template: `
    <label>
      Order Total
      <input type="number" [formField]="orderForm.total" />
    </label>

    <label>
      Coupon Code
      <input [formField]="orderForm.couponCode" />
    </label>

    @if (orderForm.couponCode().disabled()) {
      <div class="info">
        @for (reason of orderForm.couponCode().disabledReasons(); track reason) {
          <p>{{ reason.message }}</p>
        }
      </div>
    }
  `,
})
export class Order {
  orderModel = signal({
    total: 25,
    couponCode: '',
  });

  orderForm = form(this.orderModel, (schemaPath) => {
    disabled(schemaPath.couponCode, {
      when: ({valueOf}) =>
        valueOf(schemaPath.total) < 50 ? 'Order must be $50 or more to use a coupon' : false,
    });
  });
}
```

Функция `when` возвращает:

- **Строку**, чтобы отключить поле с причиной
- `false`, чтобы включить поле (не любое falsy-значение — используйте `false` явно)

Доступ к причинам — через сигнал `disabledReasons()` на состоянии поля. У каждой причины есть свойство `message`, содержащее возвращённую строку.

#### Несколько причин отключения {#multiple-disabled-reasons}

Также можно вызвать `disabled()` несколько раз для одного и того же поля, и все возвращённые причины накапливаются:

```angular-ts
orderForm = form(this.orderModel, (schemaPath) => {
  disabled(schemaPath.promoCode, {
    when: ({valueOf}) =>
      !valueOf(schemaPath.hasAccount) ? 'You must have an account to use promo codes' : false,
  });
  disabled(schemaPath.promoCode, {
    when: ({valueOf}) => (valueOf(schemaPath.total) < 25 ? 'Order must be at least $25' : false),
  });
});
```

Если оба условия истинны, поле показывает обе причины отключения. Этот паттерн полезен для сложных правил доступности, которые хочется держать отдельно.

## Настройка состояния `hidden()` на полях {#configuring-hidden-state-on-fields}

Правило `hidden()` настраивает состояние hidden поля. Однако это только задаёт программное состояние. **Вы контролируете, появляется ли поле в UI**.

IMPORTANT: В отличие от `disabled` и `readonly`, для состояния `hidden` нет нативного DOM-свойства. Директива `[formField]` не применяет атрибут `hidden` к элементам. Нужно использовать `@if` или CSS в шаблоне, чтобы условно отрисовывать поля на основе состояния `hidden()`.

NOTE: Как и отключённые поля, скрытые поля также пропускают валидацию. См. [руководство по валидации](guide/forms/signals/validation) для подробностей.

### Базовое скрытие поля {#basic-field-hiding}

Используйте `hidden()` с функцией `when`, которая возвращает `true` (скрыто) или `false` (видимо):

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, hidden} from '@angular/forms/signals';

@Component({
  selector: 'app-profile',
  imports: [FormField],
  template: `
    <label>
      <input type="checkbox" [formField]="profileForm.isPublic" />
      Make profile public
    </label>

    @if (!profileForm.publicUrl().hidden()) {
      <label>
        Public URL
        <input [formField]="profileForm.publicUrl" />
      </label>
    }
  `,
})
export class Profile {
  profileModel = signal({
    isPublic: false,
    publicUrl: '',
  });

  profileForm = form(this.profileModel, (schemaPath) => {
    hidden(schemaPath.publicUrl, {when: ({valueOf}) => !valueOf(schemaPath.isPublic)});
  });
}
```

## Отображение нередактируемых полей с помощью `readonly()` {#display-uneditable-fields-with-readonly}

Правило `readonly()` не позволяет пользователям обновлять поле. Директива `[FormField]` автоматически привязывает это состояние к HTML-атрибуту `readonly`, который предотвращает редактирование, но всё ещё позволяет пользователям фокусироваться и выделять текст.

NOTE: Readonly-поля пропускают [валидацию](guide/forms/signals/validation).

### Всегда readonly {#always-readonly}

Чтобы сделать поле постоянно readonly, вызовите `readonly()` только с путём поля:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, readonly} from '@angular/forms/signals';

@Component({
  selector: 'app-account',
  imports: [FormField],
  template: `
    <label>
      Username (cannot be changed)
      <input [formField]="accountForm.username" />
    </label>

    <label>
      Email
      <input [formField]="accountForm.email" />
    </label>
  `,
})
export class Account {
  accountModel = signal({
    username: 'johndoe',
    email: 'john@example.com',
  });

  accountForm = form(this.accountModel, (schemaPath) => {
    readonly(schemaPath.username);
  });
}
```

Директива `[FormField]` автоматически привязывает атрибут `readonly` на основе состояния поля.

### Условный readonly {#conditional-readonly}

Чтобы сделать поле readonly на основе условий, предоставьте функцию `when`:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, readonly} from '@angular/forms/signals';

@Component({
  selector: 'app-document',
  imports: [FormField],
  template: `
    <label>
      <input type="checkbox" [formField]="documentForm.isLocked" />
      Lock document
    </label>

    <label>
      Document Title
      <input [formField]="documentForm.title" />
    </label>
  `,
})
export class Document {
  documentModel = signal({
    isLocked: false,
    title: 'Untitled',
  });

  documentForm = form(this.documentModel, (schemaPath) => {
    readonly(schemaPath.title, {when: ({valueOf}) => valueOf(schemaPath.isLocked)});
  });
}
```

Когда `isLocked` равно true, поле title становится readonly.

## Выбор между hidden, disabled и readonly {#choose-between-hidden-disabled-and-readonly}

Эти три функции конфигурации по-разному управляют доступностью поля:

Выбирайте `hidden()`, когда поле:

- Вообще не должно появляться в UI
- Нерелевантно текущему состоянию формы
- Пример: поля адреса доставки, когда отмечено «тот же, что и billing»

Выбирайте `disabled()`, когда поле:

- Должно быть видимым, но не редактируемым
- Нужно показать, почему оно недоступно (через причины отключения)
- Должно быть исключено из HTML form submission
- Пример: кнопка Submit отключена, пока форма невалидна; поля одобрения отключены для не-admin пользователей

Выбирайте `readonly()`, когда поле:

- Должно быть видимым, но не редактируемым
- Содержит данные, которые пользователям нужно видеть, выделять или копировать
- Должно быть включено в HTML form submission
- Пример: номер подтверждения заказа, системные reference-коды

Все три пропускают валидацию и предотвращают редактирование пользователем, пока активны. Ключевые различия:

| Возможность                          | `hidden()` | `disabled()` | `readonly()` |
| -------------------------------- | ---------- | ------------ | ------------ |
| Видимо в UI                    | Нет         | Да          | Да          |
| Пользователи могут фокусироваться/выделять           | Нет         | Нет           | Да          |
| Включено в HTML form submission | Нет         | Нет           | Да          |

## Задержка операций ввода с помощью `debounce()` {#delay-input-operations-with-debounce}

Правило `debounce()` задерживает обновление модели формы. Это полезно для оптимизации производительности и снижения ненужных операций при быстром вводе.

### Что делает debouncing {#what-debouncing-does}

Без debouncing каждое нажатие клавиши сразу обновляет модель формы. Это может запускать:

- Дорогие computed-сигналы, которые пересчитываются при каждом изменении
- Проверки валидации после каждого символа
- API-вызовы или другие побочные эффекты, связанные со значением модели

Debouncing задерживает эти обновления и снижает ненужную работу.

### Базовый debouncing {#basic-debouncing}

Можно применить debounce к полю, указав задержку в миллисекундах:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, debounce} from '@angular/forms/signals';

@Component({
  selector: 'app-search',
  imports: [FormField],
  template: `
    <label>
      Search
      <input [formField]="searchForm.query" />
    </label>

    <p>Searching for: {{ searchForm.query().value() }}</p>
  `,
})
export class Search {
  searchModel = signal({
    query: '',
  });

  searchForm = form(this.searchModel, (schemaPath) => {
    debounce(schemaPath.query, 300);
  });
}
```

С debounce 300 мс:

- Пользователь вводит в поле ввода
- Модель формы обновляется только после 300 мс бездействия при вводе
- Если пользователь продолжает печатать, таймер сбрасывается с каждым нажатием клавиши
- Как только пользователь делает паузу на 300 мс, модель обновляется финальным значением

### Гарантии по времени {#timing-guarantees}

Функция `debounce()` гарантирует, что пользователи не потеряют данные, через эти механизмы:

- **При пометке как touched:** Значение синхронизируется сразу, прерывая любую ожидающую задержку debounce. Это происходит, когда поле теряет фокус (blur) или когда явно помечается как touched.
- **При отправке формы:** Все поля помечаются как touched перед валидацией, что гарантирует немедленную синхронизацию всех debounced-значений.

Это означает, что пользователи могут быстро печатать, уходить Tab'ом или отправлять форму, не дожидаясь истечения задержек debounce.

### Пользовательская логика debounce {#custom-debounce-logic}

Для расширенного контроля предоставьте функцию-debouncer, которая управляет, когда синхронизировать значение. Эта функция вызывается каждый раз при обновлении значения control и может вернуть либо `undefined` для немедленной синхронизации, либо Promise, который предотвращает синхронизацию до своего разрешения:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, debounce} from '@angular/forms/signals';

@Component({
  selector: 'app-search',
  imports: [FormField],
  template: `
    <label>
      Search
      <input [formField]="searchForm.query" />
    </label>
  `,
})
export class Search {
  searchModel = signal({
    query: '',
  });

  searchForm = form(this.searchModel, (schemaPath) => {
    debounce(schemaPath.query, () => {
      // Return a promise that resolves after 500ms
      return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 500);
      });
    });
  });
}
```

Функция-debouncer может вернуть:

- `undefined`, чтобы синхронизировать значение сразу
- `Promise<void>`, который предотвращает синхронизацию до своего разрешения

Сценарии использования пользовательской логики debounce:

- Реализация пользовательской логики времени за пределами простых задержек
- Координация синхронизации с внешними событиями
- Условный debouncing на основе состояния приложения

### Когда использовать debouncing {#when-to-use-debouncing}

Debouncing наиболее полезен, когда:

- Есть дорогие computed-сигналы, зависящие от значения поля
- Поле запускает API-вызовы или другие побочные эффекты
- Нужно снизить накладные расходы валидации при быстром вводе
- Профилирование производительности показывает, что обновления модели вызывают замедления

Не используйте debouncing, если:

- Полю нужны немедленные обновления для хорошего UX (например, ввод калькулятора)
- Выигрыш в производительности незначителен
- Пользователи ожидают обратную связь в реальном времени

## Связывание данных с полем с помощью `metadata()` {#associate-data-with-a-field-using-metadata}

Метаданные прикрепляют реактивные данные к полю. Правила валидации используют эту систему внутренне, и вы можете публиковать собственные ключи для информации, специфичной для приложения: текст помощи, конфигурация или вычисляемые отображаемые значения.

Signal Forms предоставляет предопределённые ключи метаданных, которые встроенные валидаторы заполняют автоматически:

| Ключ          | Заполняется         | Читается через              |
| ------------ | -------------------- | --------------------- |
| `REQUIRED`   | `required()`         | `field().required()`  |
| `MIN`        | `min()`, `minDate()` | `field().min()`       |
| `MAX`        | `max()`, `maxDate()` | `field().max()`       |
| `MIN_LENGTH` | `minLength()`        | `field().minLength()` |
| `MAX_LENGTH` | `maxLength()`        | `field().maxLength()` |
| `PATTERN`    | `pattern()`          | `field().pattern()`   |

Директива `[formField]` автоматически привязывает пять из них (`REQUIRED`, `MIN`, `MAX`, `MIN_LENGTH` и `MAX_LENGTH`) к соответствующему HTML-атрибуту на нативном form control. `PATTERN` — исключение, потому что Signal Forms поддерживает несколько паттернов на поле, а HTML-атрибут `pattern` принимает только одно регулярное выражение.

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, required, min, max} from '@angular/forms/signals';

@Component({
  selector: 'app-age',
  imports: [FormField],
  template: `
    <label>
      Age (between {{ ageForm.age().min?.() }} and {{ ageForm.age().max?.() }})
      <input type="number" [formField]="ageForm.age" />
    </label>

    @if (ageForm.age().required()) {
      <span class="required-indicator">*</span>
    }
  `,
})
export class Age {
  ageModel = signal({age: 0});

  ageForm = form(this.ageModel, (schemaPath) => {
    required(schemaPath.age);
    min(schemaPath.age, 18);
    max(schemaPath.age, 120);
  });
}
```

### Реактивные метаданные {#reactive-metadata}

Правила валидации могут выводить свои ограничения из других полей, делая опубликованные метаданные реактивными:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, max} from '@angular/forms/signals';

@Component({
  selector: 'app-inventory',
  imports: [FormField],
  template: `
    <label>
      Item
      <select [formField]="inventoryForm.item">
        <option value="widget">Widget</option>
        <option value="gadget">Gadget</option>
      </select>
    </label>

    <label>
      Quantity (max: {{ inventoryForm.quantity().max?.() }})
      <input type="number" [formField]="inventoryForm.quantity" />
    </label>
  `,
})
export class Inventory {
  inventoryModel = signal({
    item: 'widget',
    quantity: 0,
  });

  inventoryForm = form(this.inventoryModel, (schemaPath) => {
    max(schemaPath.quantity, ({valueOf}) => {
      const item = valueOf(schemaPath.item);
      return item === 'widget' ? 100 : 50;
    });
  });
}
```

Правило валидации `max()` задаёт метаданные `MAX` реактивно на основе выбранного item, поэтому любой шаблон или control, читающий `field().max()`, обновляется при изменении item.

Более глубокое покрытие, включая определение пользовательских ключей, объединение вкладов с reducers и использование managed metadata для объектов с учётом жизненного цикла, см. в [руководстве по метаданным полей](guide/forms/signals/field-metadata).

## Комбинирование правил {#combining-rules}

Можно применять несколько правил к одному полю и использовать условную логику для применения целых групп правил на основе состояния формы.

### Несколько правил на одном поле {#multiple-rules-on-one-field}

Применяйте несколько правил, чтобы настроить все аспекты поведения поля:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, disabled, hidden, debounce, metadata} from '@angular/forms/signals';
import {PLACEHOLDER} from './metadata-keys';

@Component({
  selector: 'app-promo',
  imports: [FormField],
  template: `
    @if (!promoForm.promoCode().hidden()) {
      <label>
        Promo Code
        <input [formField]="promoForm.promoCode" />
      </label>
    }
  `,
})
export class Promo {
  promoModel = signal({
    hasAccount: false,
    subscriptionType: 'free' as 'free' | 'premium',
    promoCode: '',
  });

  promoForm = form(this.promoModel, (schemaPath) => {
    disabled(schemaPath.promoCode, {
      when: ({valueOf}) => (!valueOf(schemaPath.hasAccount) ? 'You must have an account' : false),
    });
    hidden(schemaPath.promoCode, {
      when: ({valueOf}) => valueOf(schemaPath.subscriptionType) === 'free',
    });
    debounce(schemaPath.promoCode, 300);
    metadata(schemaPath.promoCode, PLACEHOLDER, () => 'Enter promo code');
  });
}
```

Эти правила работают вместе:

- Hidden имеет приоритет — если поле скрыто, состояние disabled не важно
- Disabled предотвращает редактирование независимо от состояния readonly
- Debouncing влияет на обновления модели независимо от другого состояния
- Метаданные независимы и всегда доступны

### Условная логика с applyWhen {#conditional-logic-with-applywhen}

Используйте `applyWhen()`, чтобы условно применять целые группы правил:

```angular-ts
import {Component, signal} from '@angular/core';
import {form, FormField, applyWhen, required, pattern} from '@angular/forms/signals';

@Component({
  selector: 'app-address',
  imports: [FormField],
  template: `
    <label>
      Country
      <select [formField]="addressForm.country">
        <option value="US">United States</option>
        <option value="CA">Canada</option>
      </select>
    </label>

    <label>
      Zip/Postal Code
      <input [formField]="addressForm.zipCode" />
    </label>
  `,
})
export class Address {
  addressModel = signal({
    country: 'US',
    zipCode: '',
  });

  addressForm = form(this.addressModel, (schemaPath) => {
    applyWhen(
      schemaPath,
      ({valueOf}) => valueOf(schemaPath.country) === 'US',
      (schemaPath) => {
        // Only applied when country is US
        required(schemaPath.zipCode);
        pattern(schemaPath.zipCode, /^\d{5}(-\d{4})?$/);
      },
    );
  });
}
```

Функция `applyWhen()` получает:

1. Путь, к которому применяется логика (часто корневой путь формы)
2. Функцию реактивной логики, которая возвращает `true` (применять) или `false` (не применять)
3. Функцию схемы, определяющую условные правила

Условные правила выполняются только когда условие истинно. Это полезно для сложных форм, где правила валидации или поведение меняются на основе выбора пользователя.

### Переиспользуемые функции схем {#reusable-schema-functions}

Вынесите общие конфигурации правил в переиспользуемые функции:

```ts
import {SchemaPath, debounce, metadata, maxLength} from '@angular/forms/signals';
import {PLACEHOLDER} from './metadata-keys';

function emailFieldConfig(path: SchemaPath<string>) {
  debounce(path, 300);
  metadata(path, PLACEHOLDER, () => 'user@example.com');
  maxLength(path, 255);
}

// Use in multiple forms
const contactForm = form(contactModel, (schemaPath) => {
  emailFieldConfig(schemaPath.email);
  emailFieldConfig(schemaPath.alternateEmail);
});

const registrationForm = form(registrationModel, (schemaPath) => {
  emailFieldConfig(schemaPath.email);
});
```

Этот паттерн полезен, когда есть стандартные конфигурации полей, используемые в нескольких формах приложения.

## Следующие шаги {#next-steps}

Чтобы узнать больше о Signal Forms, ознакомьтесь с этими связанными руководствами:

- [Управление состоянием полей](guide/forms/signals/field-state-management) — как использовать сигналы состояния, создаваемые этими функциями, в шаблонах и логике компонента
- [Валидация](guide/forms/signals/validation) — правила валидации и обработка ошибок
- [Пользовательские controls](guide/forms/signals/custom-controls) — как пользовательские controls могут читать метаданные и состояние, чтобы настраивать себя автоматически
