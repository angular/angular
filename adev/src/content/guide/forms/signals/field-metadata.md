# Метаданные поля

Метаданные поля — реактивные данные, которые можно прикрепить к отдельному полю. Встроенные constraint-валидаторы Angular вроде `required()` и `min()` используют эту систему внутри. Другими словами, каждый вызов валидатора вносит вклад в ключ метаданных для конкретного поля.

Это руководство подробно рассматривает систему метаданных: как reducers объединяют вклады от нескольких правил схемы, как писать пользовательские reducers, как чтение сочетается с `hasMetadata()`, и как managed metadata привязывает объекты с жизненным циклом к отдельным полям.

## Вы уже использовали метаданные {#you-have-already-been-using-metadata}

Когда вы вызываете `required()` в схеме и читаете `.required()` у получившегося поля в шаблоне, вы используете систему метаданных. `state.required` — не особое свойство. Это удобный getter, возвращающий текущее значение встроенного ключа метаданных `REQUIRED`.

```angular-ts
import {Component, signal} from '@angular/core';
import {form, required, FormField} from '@angular/forms/signals';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `
    <form>
      <label>
        Username
        @if (registrationForm.username().required()) {
          <span class="required-marker" aria-hidden="true">*</span>
        }
        <input [formField]="registrationForm.username" />
      </label>
    </form>
  `,
})
export class Registration {
  registrationModel = signal({username: ''});

  registrationForm = form(this.registrationModel, (path) => {
    required(path.username);
  });
}
```

Вызов `required(path.username)` вносит значение в ключ метаданных `REQUIRED` на этом поле. Чтение `registrationForm.username().required()` возвращает накопленное значение. Ключ метаданных — мост, связывающий эти два действия.

Несколько встроенных constraint-валидаторов следуют этому паттерну:

| Валидатор     | Ключ метаданных               | Тип                  | Getter `FieldState` |
| ------------- | -------------------------- | --------------------- | ------------------- |
| `required()`  | `REQUIRED`                 | `boolean`             | `required`          |
| `min()`       | `MIN` выбирает `MIN_NUMBER` | `number \| undefined` | `min`               |
| `max()`       | `MAX` выбирает `MAX_NUMBER` | `number \| undefined` | `max`               |
| `minDate()`   | `MIN` выбирает `MIN_DATE`   | `Date \| undefined`   | `min`               |
| `maxDate()`   | `MAX` выбирает `MAX_DATE`   | `Date \| undefined`   | `max`               |
| `minLength()` | `MIN_LENGTH`               | `number \| undefined` | `minLength`         |
| `maxLength()` | `MAX_LENGTH`               | `number \| undefined` | `maxLength`         |
| `pattern()`   | `PATTERN`                  | `RegExp[]`            | `pattern`           |

Валидаторы без ограничений вроде `email()` и `validate()` не вносят вклад в метаданные. Они выполняют проверку и показывают ошибку валидации, но не публикуют реактивное значение для чтения в шаблонах.

## Когда использовать пользовательские метаданные {#when-to-use-custom-metadata}

Когда нужны реактивные данные, привязанные к конкретному полю, которые не покрывают встроенные сигналы состояния вроде `valid()`, `disabled()` и `touched()`, используйте **пользовательские метаданные**.

Примеры:

- **Конфигурация, привязанная к переиспользуемым схемам полей.** Символ валюты на поле цены, чтобы любой шаблон или пользовательский контрол, отображающий поле, мог его показать. Или `MIN_DATE` и `MAX_DATE` на поле даты, читаемые переиспользуемым range picker.
- **Разобранные значения, общие для правил одного поля.** Номер телефона, один раз разобранный в формат E.164, чтобы валидатор формата и проверка уникальности читали одну каноническую форму без повторного разбора.
- **Подсказки отображения, собранные из состояния поля.** Уровень серьёзности (`'info' | 'warning' | 'error'`), который UI сопоставляет со значками и иконками, или контекстное сообщение помощи, меняющееся в зависимости от того, что ввёл пользователь и какие другие поля заполнены.

Если вы держите параллельный `Map<fieldKey, value>` рядом с формой, чтобы отслеживать что-то по полям, это признак, что метаданные — правильный инструмент. Метаданные остаются рядом со схемой, остаются реактивными и участвуют в жизненном цикле поля.

## Создание ключа метаданных {#creating-a-metadata-key}

Чтобы создать пользовательский ключ, вызовите `createMetadataKey<TWrite>()`. Параметр типа описывает значение, которое будут вносить правила схемы.

```ts
import {createMetadataKey} from '@angular/forms/signals';

export const USERNAME_HELP = createMetadataKey<string>();
```

Каждый вызов `createMetadataKey()` создаёт новый уникальный ключ. Два вызова с совпадающими параметрами типа — всё равно два разных ключа, поэтому определяйте каждый ключ один раз на уровне модуля и импортируйте его там, где нужно.

NOTE: Ключ, созданный без reducer, по умолчанию использует семантику "override": при нескольких правилах, задающих ключ, побеждает последний вклад.

## Задание значений из схемы {#setting-values-from-a-schema}

Чтобы зарегистрировать значение ключа на конкретном поле, используйте `metadata(path, key, logic)` внутри функции схемы.

```angular-ts
import {Component, computed, signal} from '@angular/core';
import {form, metadata, FormField} from '@angular/forms/signals';
import {USERNAME_HELP} from './metadata-keys';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `
    <form>
      <label>
        Username
        <input [formField]="registrationForm.username" />
      </label>
      <p class="help">{{ usernameHelp() }}</p>
    </form>
  `,
})
export class Registration {
  registrationModel = signal({username: ''});

  registrationForm = form(this.registrationModel, (path) => {
    metadata(path.username, USERNAME_HELP, ({value}) => {
      const username = value();
      if (username.length === 0) {
        return 'Choose a unique username between 3 and 20 characters.';
      }
      if (username.length < 3) {
        return 'Keep typing, usernames are at least 3 characters.';
      }
      if (username.length > 20) {
        return 'Usernames are at most 20 characters.';
      }
      return 'Looks good.';
    });
  });

  usernameHelp = computed(() => this.registrationForm.username().metadata(USERNAME_HELP)?.() ?? '');
}
```

Функция логики получает контекст поля, который предоставляет `value` как сигнал текущего значения поля, `state` как `FieldState` поля и методы вроде `valueOf(path)` и `stateOf(path)` для чтения других полей той же формы. Любой сигнал, который читает функция, становится реактивной зависимостью: когда меняется `value()`, метаданные пересчитываются, и любой шаблон, читающий ключ, обновляется.

## Чтение метаданных из поля {#reading-metadata-from-a-field}

`hasMetadata(key)` возвращает `true`, если какое-либо правило схемы зарегистрировало ключ на этом поле. `state.metadata(key)` возвращает `undefined`, если ни одно правило не зарегистрировало ключ, и сигнал текущего приведённого значения в противном случае.

```ts
registrationForm.username().hasMetadata(USERNAME_HELP); // true if any metadata() rule registered this key
```

Форма внутреннего значения (может ли оно само быть `undefined`, какой тип хранит) зависит от reducer ключа. Reducers рассматриваются в следующем разделе.

Когда ключ может быть не зарегистрирован, ограничивайте чтение через `hasMetadata()`:

```angular-html
@if (registrationForm.username().hasMetadata(USERNAME_HELP)) {
  <p class="help">{{ registrationForm.username().metadata(USERNAME_HELP)!() }}</p>
}
```

Когда известно, что правило всегда регистрирует ключ (потому что схема в том же файле это делает), проверку `hasMetadata()` можно пропустить и использовать optional chaining как компактную альтернативу:

```ts
const message = registrationForm.username().metadata(USERNAME_HELP)?.();
// message: string | undefined
```

Или, когда регистрация правила гарантирована, уберите optional chain и используйте assertion:

```ts
const message = registrationForm.username().metadata(USERNAME_HELP)!();
// message: string | undefined (still, because the inner value may be undefined)
```

Пример компонента выше использует optional chaining внутри `computed()`, чтобы шаблон привязывался к обычному `string` с пустым запасным значением для начального кадра.

Это весь API для одного вкладчика. Следующий раздел описывает, что происходит, когда несколько правил схемы вносят вклад в один ключ, и как объединять эти вклады с помощью reducers.

## Объединение вкладов с помощью reducers {#combining-contributions-with-reducers}

Семантика override работает, когда только одно правило вносит вклад в ключ на данном поле. Как только вносят вклад два правила, первое значение молча отбрасывается:

```ts
const HELP = createMetadataKey<string>();

form(model, (path) => {
  metadata(path.username, HELP, () => 'Choose something unique across the system.');
  metadata(path.username, HELP, () => 'Usernames are 3 to 20 characters.');
});
```

После выполнения обоих правил `state.metadata(HELP)!()` возвращает только второе сообщение. Это почти никогда не то, что нужно. Вклады часто приходят из разных источников: две схемы, соединённые через `apply()`, каждая из которых добавляет текст помощи, или несколько правил валидации, каждое из которых вносит подсказку.

Чтобы объединять вклады, передайте reducer в `createMetadataKey()`. Reducer описывает, как свернуть отдельные значения в накопленный результат:

```ts
import {createMetadataKey, MetadataReducer} from '@angular/forms/signals';

const HELP = createMetadataKey<string, string[]>(MetadataReducer.list());

form(model, (path) => {
  metadata(path.username, HELP, () => 'Choose something unique across the system.');
  metadata(path.username, HELP, () => 'Usernames are 3 to 20 characters.');
});

// state.metadata(HELP)!() === [
//   'Choose something unique across the system.',
//   'Usernames are 3 to 20 characters.',
// ]
```

Обратите внимание на два параметра типа у `createMetadataKey<TWrite, TAcc>`: первый — тип, который вносит каждое правило, второй — тип, который производит reducer. С `list()` правила вносят `string`, а поле читает обратно `string[]`.

### Встроенные reducers {#built-in-reducers}

Angular предоставляет шесть встроенных reducers в пространстве имён [`MetadataReducer`](api/forms/signals/MetadataReducer). У `override()` две формы с немного разной семантикой, перечисленные отдельно в таблице:

| Reducer        | Тип аккумулятора      | Что делает                                                           | Начальное значение |
| -------------- | --------------------- | ---------------------------------------------------------------------- | ------------- |
| `list<T>()`    | `T[]`                 | Принимает вклады `T \| undefined`; добавляет значения, не равные `undefined` | `[]`          |
| `or()`         | `boolean`             | `true`, если любой вклад — `true`                                   | `false`       |
| `and()`        | `boolean`             | `true` только если каждый вклад — `true`                            | `true`        |
| `min()`        | `number \| undefined` | Сохраняет наименьшее внесённое число                                  | `undefined`   |
| `max()`        | `number \| undefined` | Сохраняет наибольшее внесённое число                                   | `undefined`   |
| `override()`   | `T \| undefined`      | Последний вклад заменяет предыдущий (по умолчанию)                      | `undefined`   |
| `override(fn)` | `T`                   | То же, но с заданным начальным значением                                | `fn()`        |

`list()` — единственный встроенный reducer, у которого тип элемента шире типа элемента аккумулятора. Правило может внести `undefined`, и reducer молча отбросит его. Так встроенный ключ `PATTERN` обрабатывает динамические правила `pattern()`, чья функция логики возвращает `undefined`: вклад `undefined` пропускается, а не включается в итоговый список regex.

### Как встроенные ключи валидаторов используют reducers {#how-built-in-validator-keys-use-reducers}

Хотя `MetadataReducer.min()` и `MetadataReducer.max()` — reducers, может удивить, что они не валидаторы. `MetadataReducer.min()` выбирает наименьший вклад в ключ, а валидатор `min()` накладывает нижнюю границу на значение поля. Они разделяют имя, но решают разные задачи.

Встроенные ключи ограничений выбирают reducers исходя из того, что значит «самый строгий» для ограничения, что часто противоположно тому, что предполагает имя ключа:

| Ключ          | Reducer          | Обоснование                                                                                                                              |
| ------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `REQUIRED`   | `or()`           | Если любое правило `required()` вычисляется в `true`, поле обязательно.                                                                   |
| `MIN_NUMBER` | `max()`          | Ограничение минимума числа самое строгое, когда наибольшее. Если одно правило требует `>= 5`, а другое `>= 10`, эффективный минимум — `10`. |
| `MIN_DATE`   | `max()`          | Та же логика, что у `MIN_NUMBER`: побеждает самая поздняя требуемая дата.                                                                             |
| `MAX_NUMBER` | `min()`          | Ограничение максимума числа самое строгое, когда наименьшее. Если одно правило ограничивает `100`, а другое `50`, эффективный максимум — `50`.  |
| `MAX_DATE`   | `min()`          | Та же логика, что у `MAX_NUMBER`: побеждает самая ранняя допустимая дата.                                                                            |
| `MIN_LENGTH` | `max()`          | Та же логика, что у `MIN_NUMBER`: побеждает наибольшая требуемая длина.                                                                          |
| `MAX_LENGTH` | `min()`          | Та же логика, что у `MAX_NUMBER`: побеждает наименьшая допустимая длина.                                                                          |
| `PATTERN`    | `list<RegExp>()` | Каждый вызов `pattern()` вносит regex; значение должно совпадать со всеми.                                                           |

`MIN` и `MAX` — ключи выбора. Они указывают на конкретный ключ, соответствующий типу значения поля, например `MIN_NUMBER` для `min()` и `MIN_DATE` для `minDate()`. Поэтому `field().min()` и `field().max()` работают и для числовых, и для date-полей.

Такое сочетание «побеждает самый строгий» — причина, почему вызовы `min(path.age, 18)` и `min(path.age, 21)` в двух соединённых схемах работают корректно. Каждый вызов регистрирует свой валидатор, проверяющий свою конкретную границу (поэтому значение ниже любой из границ не проходит валидацию). Отдельно каждый вызов вносит вклад в ключ `MIN_NUMBER`, и `state.min!()` сообщает агрегат (`21`), чтобы UI и пользовательские контролы могли прочитать эффективный минимум.

### Написание пользовательского reducer {#writing-a-custom-reducer}

Чтобы написать собственный reducer, реализуйте объект, соответствующий интерфейсу `MetadataReducer<TAcc, TItem>`:

```ts
interface MetadataReducer<TAcc, TItem> {
  reduce: (acc: TAcc, item: TItem) => TAcc;
  getInitial: () => TAcc;
}
```

Пользовательский reducer можно определить, когда ни один из встроенных не соответствует нужной семантике. Например, ключ `SEVERITY`, сохраняющий самый серьёзный уровень, внесённый любым правилом:

```ts
import {createMetadataKey, type MetadataReducer} from '@angular/forms/signals';

type Severity = 'info' | 'warning' | 'error';

const SEVERITY_RANK: Record<Severity, number> = {info: 0, warning: 1, error: 2};

const maxSeverity: MetadataReducer<Severity | undefined, Severity> = {
  reduce(acc, item) {
    if (acc === undefined) return item;
    return SEVERITY_RANK[item] > SEVERITY_RANK[acc] ? item : acc;
  },
  getInitial: () => undefined,
};

export const SEVERITY = createMetadataKey<Severity, Severity | undefined>(maxSeverity);
```

Любое число правил теперь может вносить severity, и поле сообщает наивысший:

```ts
form(model, (path) => {
  metadata(path.password, SEVERITY, () => 'info');
  metadata(path.password, SEVERITY, ({value}) => (value().length < 12 ? 'warning' : 'info'));
  metadata(path.password, SEVERITY, ({value}) =>
    /password|1234/i.test(value()) ? 'error' : 'info',
  );
});
```

Reducer запускается при изменении сигналов любого вклада, поэтому `state.metadata(SEVERITY)!()` остаётся синхронизированным с текущим худшим случаем по всем правилам.

TIP: Держите reducers чистыми: `reduce()` должен зависеть только от двух аргументов, а `getInitial()` должен возвращать одно и то же значение при каждом вызове. Reducers выполняются внутри реактивного вычисления, которое перезапускается при изменении сигналов любого вклада, поэтому нечистые reducers дают несогласованные метаданные.

## Прикрепление объектов с жизненным циклом через managed metadata {#attaching-lifecycle-aware-objects-with-managed-metadata}

Managed metadata хранит на поле объект с жизненным циклом вместо реактивного значения. Используйте его для объектов на уровне поля: `resource()`, загружающий внешние данные, `effect()`, синхронизирующий с внешней системой, или handle сервиса, ограниченный одним полем.

### Создание managed-ключа {#creating-a-managed-key}

Чтобы определить managed-ключ, вызовите `createManagedMetadataKey<TRead, TWrite>(create)`. Передаваемая функция `create` производит значение, которое хранит ключ.

```ts
import {Signal} from '@angular/core';
import {httpResource} from '@angular/common/http';
import {createManagedMetadataKey} from '@angular/forms/signals';

export interface UrlPreview {
  title: string;
  description?: string;
  image?: string;
}

export const URL_PREVIEW = createManagedMetadataKey((_state, url: Signal<string | undefined>) => {
  return httpResource<UrlPreview>(() => {
    const currentUrl = url();
    return currentUrl ? {url: '/api/url-preview', params: {url: currentUrl}} : undefined;
  });
});
```

Функция `create` получает `FieldState` поля и `Signal<TAcc>` данных, внесённых правилами `metadata()` для этого ключа, и возвращает объект, который должен жить на поле. Возвращаемое значение хранится как есть: в отличие от не-managed ключей, фреймворк не оборачивает его в `computed()`.

`create` выполняется один раз при создании поля, внутри injection context поля. Это позволяет вызывать `inject()`, `resource()` и `effect()` внутри `create` и привязывает очистку к жизненному циклу поля: когда поле уничтожается, Angular уничтожает injection context, и любой `resource()`, `effect()` или callback `DestroyRef`, зарегистрированный там, очищается автоматически.

Поскольку сама `create` не реактивна, любое поведение, которое должно реагировать на изменения сигналов, должно жить внутри `effect()`, `resource()` или `httpResource()`, настроенных при этом начальном вызове. `URL_PREVIEW` демонстрирует паттерн: `httpResource()` читает сигнал URL внутри функции запроса, поэтому запрос перезапускается при изменении сигнала. Правило схемы (`metadata(path.url, URL_PREVIEW, ({value}) => value())`) решает, какие данные подавать; managed-ключ решает, что с ними делать.

### Использование managed-ключа в форме {#using-a-managed-key-in-a-form}

Чтобы использовать managed-ключ в форме, зарегистрируйте правило `metadata()` для ключа, а затем читайте возвращённый объект из состояния поля.

```angular-ts
import {Component, computed, signal} from '@angular/core';
import {applyEach, form, metadata, FormField} from '@angular/forms/signals';
import {URL_PREVIEW} from './url-preview';

@Component({
  selector: 'app-link-editor',
  imports: [FormField],
  template: `
    <form>
      @for (link of linksForm.links; track link) {
        <fieldset>
          <label>
            URL
            <input [formField]="link.url" />
          </label>
          <!-- Read the URL_PREVIEW key for this link's url field; the result is the resource its create function produced -->
          @let preview = link.url().metadata(URL_PREVIEW);
          @if (preview?.isLoading()) {
            <p>Loading preview...</p>
          } @else if (preview?.hasValue() && preview.value(); as data) {
            <article class="preview">
              <h3>{{ data.title }}</h3>
              @if (data.description) {
                <p>{{ data.description }}</p>
              }
            </article>
          } @else if (preview?.error()) {
            <p class="error">Could not load preview.</p>
          }
        </fieldset>
      }
      <button type="button" (click)="addLink()">Add link</button>
    </form>
  `,
})
export class LinkEditor {
  linksModel = signal({links: [{url: ''}]});

  linksForm = form(this.linksModel, (path) => {
    // Register the URL_PREVIEW key on each link's url field.
    // applyEach runs the schema per item, so create() runs once per link
    // and each link gets its own resource.
    applyEach(path.links, (itemPath) => {
      metadata(itemPath.url, URL_PREVIEW, ({value}) => value());
    });
  });

  addLink() {
    this.linksForm.links().value.update((links) => [...links, {url: ''}]);
  }
}
```

Каждый элемент массива получает свой resource `URL_PREVIEW`, потому что `applyEach` регистрирует правила схемы для каждого элемента независимо. Когда пользователь добавляет ссылку, `create` выполняется для поля нового элемента. Когда ссылка удаляется (здесь не показано, но распространённый паттерн), фреймворк уничтожает injector этого поля вместе с resource.

## Следующие шаги {#next-steps}

Помните: метаданные существуют, чтобы реактивные данные могли путешествовать с полем через композицию схем, накапливаться по правилам и уничтожаться вместе с жизненным циклом поля. Они используют ту же систему, что и встроенные валидаторы Angular, и могут быть адаптированы под ваши сценарии.

Подробную документацию API см. в:

- [`createMetadataKey()`](api/forms/signals/createMetadataKey) — определить ключ метаданных с опциональным reducer
- [`createManagedMetadataKey()`](api/forms/signals/createManagedMetadataKey) — определить ключ метаданных с жизненным циклом
- [`metadata()`](api/forms/signals/metadata) — внести значение в ключ метаданных в схеме
- [`MetadataReducer`](api/forms/signals/MetadataReducer) — встроенные reducers для объединения вкладов

Дополнительные связанные руководства по Signal Forms:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/form-logic" title="Adding form logic" />
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/async-operations" title="Async operations" />
</docs-pill-row>
