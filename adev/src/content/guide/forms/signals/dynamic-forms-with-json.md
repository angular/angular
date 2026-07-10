# Динамические формы с JSON

Некоторые формы не могут определить свою структуру на этапе компиляции. Server-driven формы, админ-панели, multi-tenant приложения и контент, управляемый CMS, должны рендерить поля из конфигурации, доставляемой во время выполнения — обычно как JSON с backend, из админ-инструмента или из настроек тенанта.

Это руководство показывает, как строить формы, чьи модель, схема, валидация и рендеринг выводятся из одной runtime-конфигурации.

## Когда использовать JSON-driven формы {#when-to-use-json-driven-forms}

Этот паттерн хорош, когда:

- Backend определяет, какие поля появляются, на основе роли пользователя, feature flags или бизнес-правил
- Не-разработчики настраивают структуру формы через админ-панель или CMS
- У каждого тенанта в multi-tenant приложении своя структура формы, хранимая как конфигурация
- Формы должны эволюционировать без повторного деплоя frontend

Используйте статическую форму (с полями, определёнными напрямую в компоненте), когда структура известна на этапе сборки. Статические формы получают полную проверку TypeScript на каждом поле, а также простую поддержку тестирования и инструментов.

## Определение типизированной конфигурации поля {#defining-a-typed-field-config}

Когда нужно рендерить поля из runtime-конфигурации, начните с типа TypeScript, описывающего форму каждого поля. Дискриминированное объединение по `kind` позволяет каждому варианту объявлять свои опции валидации:

```ts
type FieldConfig =
  | {kind: 'text'; name: string; label: string; required?: boolean}
  | {kind: 'number'; name: string; label: string; required?: boolean; min?: number; max?: number};
```

У каждого варианта есть name, label и опциональный флаг `required`. Числовые поля дополнительно принимают границы `min` и `max`. Новые варианты добавляются новыми ветвями `kind`.

Конкретная конфигурация может выглядеть так:

```ts
const profileConfig: FieldConfig[] = [
  {kind: 'text', name: 'fullName', label: 'Full Name', required: true},
  {kind: 'number', name: 'age', label: 'Age', required: true, min: 18, max: 120},
];
```

На практике этот `FieldConfig[]` обычно приходит с backend, из админ-панели или CMS. Для краткости примеры ниже используют литерал внутри компонента.

## Построение модели из конфигурации {#building-the-model-from-config}

Модели формы нужна одна запись на поле со значением по умолчанию, соответствующим kind поля. Небольшой helper обрабатывает это:

```ts
function buildModel(configs: FieldConfig[]): Record<string, string | number | null> {
  const initial: Record<string, string | number | null> = {};
  for (const config of configs) {
    initial[config.name] = config.kind === 'number' ? null : '';
  }
  return initial;
}
```

Модель использует `Record<string, string | number | null>`, потому что ключи заранее неизвестны.

Кроме того, числовые поля инициализируются как `null`, а не `0`, чтобы пустое поле читалось как пустое. С `0` [`required()`](api/forms/signals/required) считал бы поле уже заполненным, а любое ограничение [`min()`](api/forms/signals/min) выше нуля помечало бы поле невалидным до того, как пользователь что-либо введёт.

## Построение схемы из конфигурации {#building-the-schema-from-config}

Схема также выводится из конфигурации. Можно пройтись по каждой записи и применить валидаторы, соответствующие её kind:

```ts
import {required, min, max, SchemaFn} from '@angular/forms/signals';

function buildSchema(configs: FieldConfig[]): SchemaFn<Record<string, string | number | null>> {
  return (path) => {
    for (const config of configs) {
      const fieldPath = path[config.name];

      if (config.required) {
        required(fieldPath);
      }

      if (config.kind === 'number') {
        if (config.min !== undefined) min(fieldPath, config.min);
        if (config.max !== undefined) max(fieldPath, config.max);
      }
    }
  };
}
```

Дискриминированное объединение сужает `config` внутри каждой ветви, поэтому `config.min` и `config.max` типизированы корректно, когда `config.kind === 'number'`.

## Выражение условных правил в конфигурации {#expressing-conditional-rules-in-config}

Некоторые правила валидации имеют смысл только при определённых условиях. Например, коды штатов США нужно валидировать только когда страна — US. Выразите эти зависимости в конфигурации, добавив дискриминатор `when`, который именует другое поле и значение, которому оно должно равняться:

```ts
type WhenCondition = {field: string; equals: string | number};

type FieldConfig =
  | {kind: 'text'; name: string; label: string; required?: boolean; when?: WhenCondition}
  | {
      kind: 'number';
      name: string;
      label: string;
      required?: boolean;
      min?: number;
      max?: number;
      when?: WhenCondition;
    };
```

Обновите `buildSchema()`, чтобы переводить `when` в вызов [`applyWhen()`](api/forms/signals/applyWhen). Общая логика применения правил выносится в небольшое замыкание, чтобы условная и безусловная ветви вызывали одну и ту же функцию:

```ts
import {applyWhen, required, min, max, SchemaFn} from '@angular/forms/signals';

function buildSchema(configs: FieldConfig[]): SchemaFn<Record<string, string | number | null>> {
  return (rootPath) => {
    for (const config of configs) {
      const applyRules = (path: typeof rootPath) => {
        const fieldPath = path[config.name];
        if (config.required) required(fieldPath);
        if (config.kind === 'number') {
          if (config.min !== undefined) min(fieldPath, config.min);
          if (config.max !== undefined) max(fieldPath, config.max);
        }
      };

      if (config.when) {
        const {field, equals} = config.when;
        applyWhen(rootPath, ({valueOf}) => valueOf(rootPath[field]) === equals, applyRules);
      } else {
        applyRules(rootPath);
      }
    }
  };
}
```

Когда условие `applyWhen()` истинно, правила внутри активируются. Когда условие становится ложным, правила деактивируются, и состояние валидации поля очищается. Поскольку функция условия читает через `valueOf(rootPath[field])`, форма переоценивает gate каждый раз, когда меняется ссылочное поле.

Конфигурация, использующая `when`, выглядит так:

```ts
const addressConfig: FieldConfig[] = [
  {kind: 'text', name: 'country', label: 'Country', required: true},
  {
    kind: 'text',
    name: 'stateCode',
    label: 'State',
    required: true,
    when: {field: 'country', equals: 'US'},
  },
];
```

Поле `stateCode` требует значение только когда `country` равно `'US'`. Пользователи, вводящие любую другую страну, могут оставить `stateCode` пустым, не блокируя отправку.

Для более сложных условий (несколько полей, диапазоны или проверки неравенства) расширьте `WhenCondition` дополнительными дискриминаторами (например, `in: string[]` или `notEquals: string | number`) и переводите каждый вариант внутри `buildSchema()`. Принцип тот же: конфигурация несёт данные, `buildSchema()` переводит их в вызовы `applyWhen()`.

Чтобы управлять видимостью вместо валидации, следуйте тому же паттерну с [`hidden()`](api/forms/signals/hidden) на пути поля. Подробности см. в [Настройка состояния `hidden()` на полях](guide/forms/signals/form-logic#configuring-hidden-state-on-fields).

## Выражение повторяющихся полей в конфигурации {#expressing-repeating-fields-in-config}

Некоторым конфигурациям нужны поля, которые растут и уменьшаются во время выполнения: список телефонов, тегов или позиций счёта. Добавьте вариант `array` в конфигурацию и переведите его в [`applyEach()`](api/forms/signals/applyEach), чтобы правила на элемент применялись единообразно по мере появления и исчезновения элементов.

Расширьте `FieldConfig` вариантом `array`. В этом примере используются массивы строк; тот же подход масштабируется на массивы объектов заменой формы элемента на record:

```ts
type FieldConfig =
  | {kind: 'text'; name: string; label: string; required?: boolean; when?: WhenCondition}
  | {
      kind: 'number';
      name: string;
      label: string;
      required?: boolean;
      min?: number;
      max?: number;
      when?: WhenCondition;
    }
  | {kind: 'array'; name: string; label: string; itemRequired?: boolean; when?: WhenCondition};
```

Обновите `buildModel()`, чтобы инициализировать array-поля пустым массивом. Модель расширяется, включая `string[]`:

```ts
function buildModel(configs: FieldConfig[]): Record<string, string | number | null | string[]> {
  const initial: Record<string, string | number | null | string[]> = {};
  for (const config of configs) {
    if (config.kind === 'number') initial[config.name] = null;
    else if (config.kind === 'array') initial[config.name] = [];
    else initial[config.name] = '';
  }
  return initial;
}
```

Обновите `buildSchema()`, чтобы применять правила на элемент через `applyEach()`. Путь из модели `Record<string, string | number | null | string[]>` слишком широк для прямой проверки типов `applyEach()` (и `min()` / `max()`), поэтому приводите `fieldPath` к подходящей форме внутри каждой ветви `kind`:

```ts
import {
  applyEach,
  applyWhen,
  required,
  min,
  max,
  SchemaFn,
  SchemaPath,
} from '@angular/forms/signals';

function buildSchema(
  configs: FieldConfig[],
): SchemaFn<Record<string, string | number | null | string[]>> {
  return (rootPath) => {
    for (const config of configs) {
      const applyRules = (path: typeof rootPath) => {
        const fieldPath = path[config.name];

        if (config.kind === 'array') {
          const arrayPath = fieldPath as unknown as SchemaPath<string[]>;
          if (config.itemRequired) {
            applyEach(arrayPath, (item) => required(item));
          }
          return;
        }

        if (config.required) required(fieldPath);

        if (config.kind === 'number') {
          const numberPath = fieldPath as unknown as SchemaPath<number | null>;
          if (config.min !== undefined) min(numberPath, config.min);
          if (config.max !== undefined) max(numberPath, config.max);
        }
      };

      if (config.when) {
        const {field, equals} = config.when;
        applyWhen(rootPath, ({valueOf}) => valueOf(rootPath[field]) === equals, applyRules);
      } else {
        applyRules(rootPath);
      }
    }
  };
}
```

Приведения внутри каждой ветви — намеренные escape hatches: вы меняете структурную гарантию компилятора на runtime-инвариант, который обеспечивает окружающая проверка `kind`. Каждое приведение ограничено блоком `kind`, поэтому допущение остаётся локальным и простым для аудита.

Конфигурация, использующая kind `array`, выглядит так:

```ts
const contactConfig: FieldConfig[] = [
  {kind: 'text', name: 'fullName', label: 'Full name', required: true},
  {kind: 'array', name: 'phoneNumbers', label: 'Phone numbers', itemRequired: true},
];
```

Чтобы отрендерить array-поле, переберите его через `@for` и позвольте пользователям добавлять или удалять элементы обновлением сигнала модели. Добавьте типизированный accessor, возвращающий [`FieldTree`](api/forms/signals/FieldTree), чтобы итерация видела структуру массива, и определите методы для роста и уменьшения модели:

```ts
import {FieldTree} from '@angular/forms/signals';

// inside the component class
asArrayField(name: string): FieldTree<string[]> {
  return this.dynamicForm[name] as unknown as FieldTree<string[]>;
}

addItem(name: string) {
  this.model.update(current => ({
    ...current,
    [name]: [...(current[name] as string[]), ''],
  }));
}

removeItem(name: string, index: number) {
  this.model.update(current => ({
    ...current,
    [name]: (current[name] as string[]).filter((_, i) => i !== index),
  }));
}
```

`FieldTree<string[]>` итерируем, поэтому `@for` может по нему пройти; каждый элемент — `FieldTree<string>`, который напрямую удовлетворяет `[formField]`. Для листовых полей можно использовать accessors `Field<T>`, поскольку `Field<T>` — вызываемая сигнатура без итерации.

В шаблоне случай array рендерится так:

```angular-html
@case ('array') {
  <fieldset>
    <legend>{{ config.label }}</legend>
    @for (item of asArrayField(config.name); track item) {
      <input type="text" [formField]="item" />
      <button type="button" (click)="removeItem(config.name, $index)">Remove</button>
    }
    <button type="button" (click)="addItem(config.name)">Add</button>
  </fieldset>
}
```

Метод `addItem()` расширяет модель; форма автоматически перевыводит поля массива. Новые элементы начинаются со свежего состояния валидации. `removeItem()` фильтрует модель; состояние поля удалённого элемента уходит вместе с ним.

### Отслеживание идентичности элементов {#tracking-item-identity}

Signal Forms отслеживает каждый элемент в массиве объектов по его идентичности. Когда вы храните ссылку на поле в конкретной позиции, эта ссылка следует за лежащими в основе данными, а не за позицией. Чтение состояния через удерживаемую ссылку возвращает данные, даже если они переместились:

```ts
const contactModel = signal([
  {name: 'Alice', phone: '555-0001'},
  {name: 'Bob', phone: '555-0002'},
]);

const contactForm = form(contactModel);

// Hold a reference to the field that's currently at index 0 (Alice).
const aliceField = contactForm[0];

// Swap the array items so Bob is at index 0, Alice at index 1.
contactModel.update(([alice, bob]) => [bob, alice]);

// The held reference still points to Alice's field, even after the swap.
console.log(aliceField().value().phone); // '555-0001' (Alice's number)
console.log(contactForm[0]().value().phone); // '555-0002' (Bob, now at index 0)
```

Это отслеживание идентичности предотвращает баги при сортировке, переупорядочивании или фильтрации, пока ссылочный элемент остаётся в массиве. Сохранённые ссылки на поля остаются валидными даже при изменении порядка массива; удаление самого ссылочного элемента orphan'ит удерживаемую ссылку.

Для массивов примитивов (пример `phoneNumbers` выше) Signal Forms отслеживает элементы позиционно: индекс 0 всегда ссылается на то значение, которое сейчас в позиции 0.

Идентичность здесь — по ссылке на объект JavaScript, а не по логическому id вроде ключа базы данных. Если заменить массив свежедесериализованными объектами (например, после перезагрузки с сервера), состояние поля не следует за логическим элементом, даже если `id` каждого элемента не изменился. Гарантия покрывает in-memory операции вроде сортировки, переупорядочивания и фильтрации, но не обновление данных.

## Валидация конфигурации {#validating-the-config}

Конфигурации из внешних источников нужно валидировать до построения формы. В недоверенном JSON могут скрываться несколько режимов сбоя:

- Дублирующиеся значения `name` перезаписывают более ранние записи модели и ломают выражение `track config.name` в шаблоне.
- Предложение `when`, именующее несуществующее поле, падает во время выполнения при первой оценке условия.
- Предложение `when`, сравнивающее с полем `array`, не имеет определённой семантики равенства.
- Значение `when.equals`, чей тип не совпадает с kind ссылочного поля, молча никогда не совпадает, скрывая условное поведение так, будто правило никогда не было активным.

Ловите все четыре на границе:

```ts
function validateConfigs(configs: FieldConfig[]): FieldConfig[] {
  const knownNames = new Set<string>();

  for (const config of configs) {
    if (knownNames.has(config.name)) {
      throw new Error(`Duplicate field name in config: "${config.name}"`);
    }
    knownNames.add(config.name);
  }

  for (const config of configs) {
    if (!config.when) continue;
    if (!knownNames.has(config.when.field)) {
      throw new Error(
        `Field "${config.name}" references unknown field "${config.when.field}" in its 'when' condition.`,
      );
    }
    const referenced = configs.find((c) => c.name === config.when!.field)!;
    if (referenced.kind === 'array') {
      throw new Error(
        `Field "${config.name}" cannot use 'when' to compare against array field "${config.when.field}".`,
      );
    }
    const expected = referenced.kind === 'text' ? 'string' : 'number';
    if (typeof config.when.equals !== expected) {
      throw new Error(
        `Field "${config.name}" compares ${referenced.kind} field "${config.when.field}" against a ${typeof config.when.equals} value; expected a ${expected}.`,
      );
    }
  }

  return configs;
}
```

Первый проход обеспечивает уникальность; второй проходит каждое предложение `when`, чтобы подтвердить, что ссылочное поле существует, не является массивом и сравнивается со значением правильного типа. Функция возвращает конфигурации без изменений при успехе, поэтому чисто компонуется с инициализатором поля, хранящим конфигурации в компоненте. Сбои проявляются на границе между приложением и upstream-источником, а не как непрозрачное неправильное поведение формы позже.

## Динамический рендеринг формы {#rendering-the-form-dynamically}

В компоненте используйте `@for` для итерации конфигураций и `@switch` по `kind`, чтобы выбрать нужный input-контрол:

```angular-ts
import {Component, signal} from '@angular/core';
import {Field, FieldTree, form, FormField, FormRoot} from '@angular/forms/signals';

@Component({
  selector: 'app-dynamic-form',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="dynamicForm">
      @for (config of configs; track config.name) {
        @switch (config.kind) {
          @case ('text') {
            <label>
              {{ config.label }}
              <input type="text" [formField]="asTextField(config.name)" />
            </label>
          }
          @case ('number') {
            <label>
              {{ config.label }}
              <input type="number" [formField]="asNumberField(config.name)" />
            </label>
          }
          @case ('array') {
            <fieldset>
              <legend>{{ config.label }}</legend>
              @for (item of asArrayField(config.name); track item; let i = $index) {
                <input type="text" [formField]="item" />
                <button type="button" (click)="removeItem(config.name, i)">Remove</button>
              }
              <button type="button" (click)="addItem(config.name)">Add</button>
            </fieldset>
          }
        }
      }
    </form>
  `,
})
export class DynamicForm {
  configs: FieldConfig[] = validateConfigs([
    {kind: 'text', name: 'fullName', label: 'Full Name', required: true},
    {kind: 'number', name: 'age', label: 'Age', required: true, min: 18, max: 120},
    {kind: 'array', name: 'phoneNumbers', label: 'Phone numbers', itemRequired: true},
  ]);

  model = signal(buildModel(this.configs));

  dynamicForm = form(this.model, buildSchema(this.configs));

  asTextField(name: string): Field<string> {
    // <input type="text"> requires Field<string>.
    return this.dynamicForm[name] as unknown as Field<string>;
  }

  asNumberField(name: string): Field<number | null> {
    // <input type="number"> requires Field<number | null>.
    return this.dynamicForm[name] as unknown as Field<number | null>;
  }

  asArrayField(name: string): FieldTree<string[]> {
    // FieldTree (not Field) so @for can iterate the array.
    return this.dynamicForm[name] as unknown as FieldTree<string[]>;
  }

  addItem(name: string) {
    this.model.update((current) => ({
      ...current,
      [name]: [...(current[name] as string[]), ''],
    }));
  }

  removeItem(name: string, index: number) {
    this.model.update((current) => ({
      ...current,
      [name]: (current[name] as string[]).filter((_, i) => i !== index),
    }));
  }
}
```

Проверка типов шаблона трактует `dynamicForm[name]` как независимое выражение, поэтому сужение `@switch` по `config.kind` не достигает индексированного доступа. Accessors повторяют это сужение как приведение в месте привязки, а соответствующая ветвь `kind` гарантирует корректность суженного типа во время выполнения.

Поскольку модель и схема выводятся из одного `FieldConfig[]` при создании компонента, они не могут разойтись для данной конфигурации. Пример выше предполагает, что конфигурация доступна синхронно при создании компонента.

## Следующие шаги {#next-steps}

JSON-driven формы держат модель и схему согласованными, выводя обе из одного `FieldConfig[]`. Каждое расширение в этом руководстве (условные правила, повторяющиеся поля) расширяет тип и добавляет шаг перевода внутри `buildSchema()`, сохраняя это согласование. Модель и схема остаются связанными независимо от того, откуда приходит конфигурация и как она растёт.

Связанные руководства по другим аспектам Signal Forms:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/schemas" title="Schemas and schema composability" />
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/form-logic" title="Adding form logic" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
</docs-pill-row>

Подробную документацию API см. в:

- [`form()`](api/forms/signals/form) — создать форму из сигнала модели
- [`applyWhen()`](api/forms/signals/applyWhen) — применить схему условно на основе реактивного состояния
- [`applyEach()`](api/forms/signals/applyEach) — применить схему к каждому элементу array-поля
- [`FieldTree`](api/forms/signals/FieldTree) — навигируемое дерево полей, предоставляемое `form()`
- [`SchemaFn`](api/forms/signals/SchemaFn) — сигнатура типа для функций схемы
