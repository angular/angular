# Структурные директивы

Структурные директивы — это директивы, применяемые к элементу `<ng-template>`, которые условно или повторно рендерят содержимое этого `<ng-template>`.

## Пример сценария использования {#example-use-case}

В этом руководстве вы создадите структурную директиву, которая загружает данные из заданного источника и рендерит свой шаблон, когда данные доступны. Директива называется `SelectDirective` по SQL-ключевому слову `SELECT` и сопоставляется с attribute-селектором `[select]`.

У `SelectDirective` будет input, именующий источник данных, — `selectFrom`. Префикс `select` для этого input важен для [сокращённого синтаксиса](#structural-directive-shorthand). Директива будет создавать экземпляр своего `<ng-template>` с контекстом шаблона, предоставляющим выбранные данные.

Пример прямого использования этой директивы на `<ng-template>`:

```angular-html
<ng-template select let-data [selectFrom]="source">
  <p>The data is: {{ data }}</p>
</ng-template>
```

Структурная директива может дождаться доступности данных и затем отрендерить свой `<ng-template>`.

HELPFUL: Элемент Angular `<ng-template>` определяет шаблон, который по умолчанию ничего не рендерит: если просто обернуть элементы в `<ng-template>` без структурной директивы, эти элементы не будут отрендерены.

Подробнее см. документацию [ng-template API](api/core/ng-template).

## Сокращённый синтаксис структурных директив {#structural-directive-shorthand}

Angular поддерживает сокращённый синтаксис структурных директив, который избавляет от необходимости явно писать элемент `<ng-template>`.

Структурные директивы можно применять напрямую к элементу, префиксируя attribute-селектор директивы звёздочкой (`*`), например `*select`. Angular преобразует звёздочку перед структурной директивой в `<ng-template>`, который хостит директиву и окружает элемент и его потомков.

С `SelectDirective` это выглядит так:

```angular-html
<p *select="let data; from: source">The data is: {{ data }}</p>
```

Этот пример показывает гибкость сокращённого синтаксиса структурных директив, который иногда называют _microsyntax_.

При таком использовании к `<ng-template>` применяются только структурная директива и её привязки. Любые другие атрибуты или привязки на теге `<p>` остаются как есть. Например, эти две формы эквивалентны:

```angular-html
<!-- Shorthand syntax: -->
<p class="data-view" *select="let data; from: source">The data is: {{ data }}</p>

<!-- Long-form syntax: -->
<ng-template select let-data [selectFrom]="source">
  <p class="data-view">The data is: {{ data }}</p>
</ng-template>
```

Сокращённый синтаксис раскрывается через набор соглашений. Более полная [грамматика](#structural-directive-syntax-reference) определена ниже, но в примере выше преобразование можно объяснить так:

Первая часть выражения `*select` — `let data`, которая объявляет переменную шаблона `data`. Поскольку присваивания нет, переменная шаблона привязывается к свойству контекста шаблона `$implicit`.

Вторая часть синтаксиса — пара ключ–выражение `from source`. `from` — ключ привязки, а `source` — обычное выражение шаблона. Ключи привязки отображаются на свойства преобразованием в PascalCase и добавлением префикса селектора структурной директивы. Ключ `from` отображается на `selectFrom`, который затем привязывается к выражению `source`. Поэтому у многих структурных директив inputs имеют префикс селектора структурной директивы.

## Одна структурная директива на элемент {#one-structural-directive-per-element}

При использовании сокращённого синтаксиса на элемент можно применить только одну структурную директиву. Это потому что есть только один элемент `<ng-template>`, на который разворачивается директива. Несколько директив потребовали бы нескольких вложенных `<ng-template>`, и неочевидно, какая должна быть первой. `<ng-container>` можно использовать для создания обёрточных слоёв, когда несколько структурных директив нужно применить вокруг одного физического DOM-элемента или компонента, что позволяет пользователю определить вложенную структуру.

## Создание структурной директивы {#creating-a-structural-directive}

В этом разделе вы создадите `SelectDirective`.

<docs-workflow>
<docs-step title="Generate the directive">
С помощью Angular CLI выполните следующую команду, где `select` — имя директивы:

```shell
ng generate directive select
```

Angular создаёт класс директивы и задаёт CSS-селектор `[select]`, который идентифицирует директиву в шаблоне.
</docs-step>
<docs-step title="Make the directive structural">
Импортируйте `TemplateRef`, `ViewContainerRef` и `input`. Внедрите `TemplateRef` и `ViewContainerRef` в директиве как приватные свойства.

```ts
import {Directive, TemplateRef, ViewContainerRef, inject, input} from '@angular/core';

export interface DataSource<T> {
  load(): Promise<T>;
}

@Directive({
  selector: '[select]',
})
export class SelectDirective {
  private templateRef = inject(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);
}
```

</docs-step>
<docs-step title="Add the 'selectFrom' input">
Добавьте свойство `selectFrom` через `input()`.

```ts
export class SelectDirective {
  // ...
  selectFrom = input.required<DataSource<unknown>>();
}
```

</docs-step>
<docs-step title="Add the business logic">
Когда `SelectDirective` уже оформлена как структурная директива со своим input, можно добавить логику загрузки данных и рендера шаблона с ними:

```ts
export class SelectDirective {
  // ...
  async ngOnInit() {
    const data = await this.selectFrom().load();
    this.viewContainerRef.createEmbeddedView(this.templateRef, {
      // Create the embedded view with a context object that contains
      // the data via the key `$implicit`.
      $implicit: data,
    });
  }
}
```

</docs-step>
</docs-workflow>

Готово — `SelectDirective` работает. Следующим шагом может быть [добавление поддержки проверки типов шаблона](#typing-the-directives-context).

## Справочник синтаксиса структурных директив {#structural-directive-syntax-reference}

При написании собственных структурных директив используйте следующий синтаксис:

```ts {hideCopy}
_: prefix = "( :let | :expression ) (';' | ',')? ( :let | :as | :keyExp )_";
```

Следующие паттерны описывают каждую часть грамматики структурных директив:

```ts
as = :export "as" :local ";"?
keyExp = :key ":"? :expression ("as" :local)? ";"?
let = "let" :local "=" :export ";"?
```

| Ключевое слово | Подробности                                            |
| :------------- | :----------------------------------------------------- |
| `prefix`       | Ключ HTML-атрибута                                     |
| `key`          | Ключ HTML-атрибута                                     |
| `local`        | Имя локальной переменной, используемой в шаблоне       |
| `export`       | Значение, экспортируемое директивой под заданным именем |
| `expression`   | Стандартное выражение Angular                          |

### Как Angular переводит сокращённый синтаксис {#how-angular-translates-shorthand}

Angular переводит сокращённый синтаксис структурных директив в обычный синтаксис привязки так:

| Сокращение                      | Перевод                                                         |
| :------------------------------ | :-------------------------------------------------------------- |
| `prefix` и голое `expression`   | `[prefix]="expression"`                                         |
| `keyExp`                        | `[prefixKey]="expression"` (к `key` добавляется `prefix`)       |
| `let local`                     | `let-local="export"`                                            |

### Примеры сокращений {#shorthand-examples}

Следующая таблица приводит примеры сокращений:

| Сокращение                                                            | Как Angular интерпретирует синтаксис                                                                              |
| :-------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| `*myDir="let item of [1,2,3]"`                                        | `<ng-template myDir let-item [myDirOf]="[1, 2, 3]">`                                                              |
| `*myDir="let item of [1,2,3] as items; trackBy: myTrack; index as i"` | `<ng-template myDir let-item [myDirOf]="[1,2,3]" let-items="myDirOf" [myDirTrackBy]="myTrack" let-i="index">`     |
| `*ngComponentOutlet="componentClass";`                                | `<ng-template [ngComponentOutlet]="componentClass">`                                                              |
| `*ngComponentOutlet="componentClass; inputs: myInputs";`              | `<ng-template [ngComponentOutlet]="componentClass" [ngComponentOutletInputs]="myInputs">`                         |
| `*myDir="exp as value"`                                               | `<ng-template [myDir]="exp" let-value="myDir">`                                                                   |

## Улучшение проверки типов шаблона для пользовательских директив {#improving-template-type-checking-for-custom-directives}

Проверку типов шаблона для пользовательских директив можно улучшить, добавив template guards в определение директивы.
Эти guards помогают проверщику типов шаблона Angular находить ошибки в шаблоне на этапе компиляции, что позволяет избежать runtime-ошибок.
Возможны два типа guards:

- `ngTemplateGuard_(input)` позволяет контролировать, как выражение input должно сужаться на основе типа конкретного input.
- `ngTemplateContextGuard` используется для определения типа объекта контекста шаблона на основе типа самой директивы.

В этом разделе приведены примеры обоих видов guards.
Подробнее см. [Проверка типов шаблона](tools/cli/template-typecheck 'Template type-checking guide').

### Сужение типов с помощью template guards {#type-narrowing-with-template-guards}

Структурная директива в шаблоне контролирует, рендерится ли этот шаблон в runtime. Некоторые структурные директивы хотят выполнять сужение типов на основе типа выражения input.

С input guards возможны два вида сужения:

- Сужение выражения input на основе функции утверждения типа TypeScript.
- Сужение выражения input на основе его truthiness.

Чтобы сузить выражение input, определив функцию утверждения типа:

```ts
// This directive only renders its template if the actor is a user.
// You want to assert that within the template, the type of the `actor`
// expression is narrowed to `User`.
@Directive(...)
class ActorIsUser {
  actor = input<User | Robot>();

  static ngTemplateGuard_actor(dir: ActorIsUser, expr: User | Robot): expr is User {
    // The return statement is unnecessary in practice, but included to
    // prevent TypeScript errors.
    return true;
  }
}
```

Проверка типов внутри шаблона будет вести себя так, как будто `ngTemplateGuard_actor` был утверждён для выражения, привязанного к input.

Некоторые директивы рендерят свои шаблоны только когда input truthy. Полную семантику truthiness невозможно выразить функцией утверждения типа, поэтому вместо этого можно использовать литеральный тип `'binding'`, чтобы сигнализировать проверщику типов шаблона, что само выражение привязки следует использовать как guard:

```ts
@Directive(...)
class CustomIf {
  condition = input.required<boolean>();

  static ngTemplateGuard_condition: 'binding';
}
```

Проверщик типов шаблона будет вести себя так, как будто выражение, привязанное к `condition`, было утверждено как truthy внутри шаблона.

### Типизация контекста директивы {#typing-the-directives-context}

Если структурная директива предоставляет контекст создаваемому шаблону, его можно корректно типизировать внутри шаблона, предоставив статическую функцию утверждения типа `ngTemplateContextGuard`. Эта функция может использовать тип директивы для вывода типа контекста, что полезно, когда тип директивы generic.

Для описанной выше `SelectDirective` можно реализовать `ngTemplateContextGuard`, чтобы корректно указать тип данных, даже если источник данных generic.

```ts
// Declare an interface for the template context:
export interface SelectTemplateContext<T> {
  $implicit: T;
}

@Directive(...)
export class SelectDirective<T> {
  // The directive's generic type `T` will be inferred from the `DataSource` type
  // passed to the input.
  selectFrom = input.required<DataSource<T>>();

  // Narrow the type of the context using the generic type of the directive.
  static ngTemplateContextGuard<T>(dir: SelectDirective<T>, ctx: any): ctx is SelectTemplateContext<T> {
    // As before the guard body is not used at runtime, and included only to avoid
    // TypeScript errors.
    return true;
  }
}
```
