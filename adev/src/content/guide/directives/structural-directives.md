# Структурные директивы

Структурные директивы — это директивы, применяемые к элементу `<ng-template>`, которые условно или многократно рендерят
содержимое этого `<ng-template>`.

## Пример использования

В этом руководстве вы создадите структурную директиву, которая получает данные из заданного источника данных и рендерит
свой шаблон, когда эти данные доступны. Эта директива называется `SelectDirective` (в честь SQL-ключевого слова
`SELECT`) и соответствует селектору атрибута `[select]`.

У `SelectDirective` будет input, указывающий используемый источник данных, который вы назовете `selectFrom`. Префикс
`select` для этого input'а важен для [сокращенного синтаксиса](#structural-directive-shorthand). Директива создаст
экземпляр своего `<ng-template>` с контекстом шаблона, предоставляющим выбранные данные.

Ниже приведен пример того, как использование этой директивы непосредственно на `<ng-template>` будет выглядеть:

```angular-html
<ng-template select let-data [selectFrom]="source">
  <p>The data is: {{ data }}</p>
</ng-template>
```

Структурная директива может подождать, пока данные станут доступны, а затем отрендерить свой `<ng-template>`.

HELPFUL: Обратите внимание, что элемент Angular `<ng-template>` определяет шаблон, который по умолчанию ничего не
рендерит. Если вы просто обернете элементы в `<ng-template>` без применения структурной директивы, эти элементы не будут
отрендерены.

Для получения дополнительной информации см. документацию по [API ng-template](api/core/ng-template).

## Сокращенный синтаксис структурных директив {#structural-directive-shorthand}

Angular поддерживает сокращенный синтаксис для структурных директив, который позволяет избежать необходимости явного
создания элемента `<ng-template>`.

Структурные директивы можно применять непосредственно к элементу, добавив перед селектором атрибута директивы
звездочку (`*`), например `*select`. Angular преобразует звездочку перед структурной директивой в `<ng-template>`,
который содержит директиву и оборачивает элемент и его потомков.

Вы можете использовать это с `SelectDirective` следующим образом:

```angular-html
<p *select="let data from source">The data is: {{data}}</p>
```

Этот пример показывает гибкость сокращенного синтаксиса структурных директив, который иногда называют
_микросинтаксисом_.

При таком использовании к `<ng-template>` применяются только структурная директива и ее привязки. Любые другие атрибуты
или привязки тега `<p>` остаются нетронутыми. Например, эти две формы эквивалентны:

```angular-html
<!-- Shorthand syntax: -->
<p class="data-view" *select="let data from source">The data is: {{data}}</p>

<!-- Long-form syntax: -->
<ng-template select let-data [selectFrom]="source">
  <p class="data-view">The data is: {{data}}</p>
</ng-template>
```

Сокращенный синтаксис разворачивается с помощью набора соглашений. Более
подробная [грамматика](#structural-directive-syntax-reference) определена ниже, но в приведенном выше примере это
преобразование можно объяснить следующим образом:

Первая часть выражения `*select` — это `let data`, которая объявляет переменную шаблона `data`. Поскольку присваивание
не следует, переменная шаблона привязывается к свойству контекста шаблона `$implicit`.

Вторая часть синтаксиса — это пара ключ-выражение, `from source`. `from` — это ключ привязки, а `source` — обычное
выражение шаблона. Ключи привязки сопоставляются со свойствами путем их преобразования в PascalCase и добавления
префикса селектора структурной директивы. Ключ `from` сопоставляется с `selectFrom`, который затем привязывается к
выражению `source`. Именно поэтому многие структурные директивы имеют input'ы, которые начинаются с селектора
структурной директивы.

## Одна структурная директива на элемент

При использовании сокращенного синтаксиса к одному элементу можно применить только одну структурную директиву. Это
связано с тем, что существует только один элемент `<ng-template>`, в который разворачивается эта директива. Несколько
директив потребовали бы нескольких вложенных `<ng-template>`, и неясно, какая директива должна быть первой.
`<ng-container>` можно использовать для создания слоев-оберток, когда необходимо применить несколько структурных
директив вокруг одного и того же физического DOM-элемента или компонента, что позволяет пользователю определить
вложенную структуру.

## Создание структурной директивы

В этом разделе описывается создание `SelectDirective`.

<docs-workflow>
<docs-step title="Сгенерируйте директиву">
Используя Angular CLI, выполните следующую команду, где `select` — имя директивы:

```shell
ng generate directive select
```

Angular создает класс директивы и указывает CSS-селектор `[select]`, который идентифицирует директиву в шаблоне.
</docs-step>
<docs-step title="Сделайте директиву структурной">
Импортируйте `TemplateRef` и `ViewContainerRef`. Внедрите `TemplateRef` и `ViewContainerRef` в директиву как приватные
свойства.

```ts
import {Directive, TemplateRef, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[select]',
})
export class SelectDirective {
  private templateRef = inject(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);
}

```

</docs-step>
<docs-step title="Добавьте input 'selectFrom'">
Добавьте свойство `input()` `selectFrom`.

```ts
export class SelectDirective {
  // ...

  selectFrom = input.required<DataSource>();
}
```

</docs-step>
<docs-step title="Добавьте бизнес-логику">
Теперь, когда `SelectDirective` создана как структурная директива со своим input'ом, вы можете добавить логику для получения данных и рендеринга шаблона с ними:

```ts
export class SelectDirective {
  // ...

  async ngOnInit() {
    const data = await this.selectFrom.load();
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

Вот и всё — `SelectDirective` готова к работе. Следующим шагом может
быть [добавление поддержки проверки типов в шаблоне](#typing-the-directives-context).

## Справочник по синтаксису структурных директив {#structural-directive-syntax-reference}

При написании собственных структурных директив используйте следующий синтаксис:

<docs-code hideCopy language="typescript">

_:prefix="( :let | :expression ) (';' | ',')? ( :let | :as | :keyExp )_"

</docs-code>

Следующие шаблоны описывают каждую часть грамматики структурной директивы:

```ts
as = :export "as" :local ";"?
keyExp = :key ":"? :expression ("as" :local)? ";"?
let = "let" :local "=" :export ";"?
```

| Ключевое слово | Подробности                                             |
| :------------- | :------------------------------------------------------ |
| `prefix`       | Ключ атрибута HTML                                      |
| `key`          | Ключ атрибута HTML                                      |
| `local`        | Имя локальной переменной, используемой в шаблоне        |
| `export`       | Значение, экспортируемое директивой под заданным именем |
| `expression`   | Стандартное выражение Angular                           |

### Как Angular транслирует сокращенный синтаксис

Angular транслирует сокращенный синтаксис структурных директив в обычный синтаксис привязки следующим образом:

| Сокращение                      | Трансляция                                                |
| :------------------------------ | :-------------------------------------------------------- |
| `prefix` и "голое" `expression` | `[prefix]="expression"`                                   |
| `keyExp`                        | `[prefixKey]="expression"` (`prefix` добавляется к `key`) |
| `let local`                     | `let-local="export"`                                      |

### Примеры сокращений

В следующей таблице приведены примеры сокращений:

| Сокращение                                                            | Как Angular интерпретирует синтаксис                                                                          |
| :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| `*myDir="let item of [1,2,3]"`                                        | `<ng-template myDir let-item [myDirOf]="[1, 2, 3]">`                                                          |
| `*myDir="let item of [1,2,3] as items; trackBy: myTrack; index as i"` | `<ng-template myDir let-item [myDirOf]="[1,2,3]" let-items="myDirOf" [myDirTrackBy]="myTrack" let-i="index">` |
| `*ngComponentOutlet="componentClass";`                                | `<ng-template [ngComponentOutlet]="componentClass">`                                                          |
| `*ngComponentOutlet="componentClass; inputs: myInputs";`              | `<ng-template [ngComponentOutlet]="componentClass" [ngComponentOutletInputs]="myInputs">`                     |
| `*myDir="exp as value"`                                               | `<ng-template [myDir]="exp" let-value="myDir">`                                                               |

## Улучшение проверки типов шаблонов для пользовательских директив {#typing-the-directives-context}

Вы можете улучшить проверку типов шаблонов для пользовательских директив, добавив "защитников" шаблона (template guards)
в определение директивы.
Эти защитники помогают средству проверки типов шаблонов Angular находить ошибки в шаблоне во время компиляции, что
позволяет избежать ошибок во время выполнения.
Возможны два различных типа защитников:

- `ngTemplateGuard_(input)` позволяет контролировать, как выражение input'а должно быть сужено (narrowed) на основе типа
  конкретного input'а.
- `ngTemplateContextGuard` используется для определения типа объекта контекста для шаблона на основе типа самой
  директивы.

В этом разделе приведены примеры обоих видов защитников.
Для получения дополнительной информации
см. [Проверка типов шаблонов](tools/cli/template-typecheck 'Руководство по проверке типов шаблонов').

### Сужение типов с помощью защитников шаблона

Структурная директива в шаблоне управляет тем, рендерится ли этот шаблон во время выполнения. Некоторые структурные
директивы хотят выполнять сужение типов на основе типа входного выражения.

С помощью защитников input'ов возможны два вида сужения:

- Сужение входного выражения на основе функции утверждения типа (type assertion function) TypeScript.
- Сужение входного выражения на основе его истинности (truthiness).

Чтобы сузить входное выражение путем определения функции утверждения типа:

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

Проверка типов внутри шаблона будет вести себя так, как будто `ngTemplateGuard_actor` был применен к выражению,
привязанному к input'у.

Некоторые директивы рендерят свои шаблоны только тогда, когда input является истинным (truthy). Невозможно охватить
полную семантику истинности в функции утверждения типа, поэтому вместо этого можно использовать литеральный тип
`'binding'`, чтобы сигнализировать средству проверки типов шаблонов, что само выражение привязки должно использоваться в
качестве защитника:

```ts
@Directive(...)
class CustomIf {
  condition = input.required<boolean>();

  static ngTemplateGuard_condition: 'binding';
}
```

Средство проверки типов шаблонов будет вести себя так, как будто выражение, привязанное к `condition`, было утверждено
как истинное (truthy) внутри шаблона.

### Типизация контекста директивы

Если ваша структурная директива предоставляет контекст для созданного шаблона, вы можете правильно типизировать его
внутри шаблона, предоставив статическую функцию утверждения типа `ngTemplateContextGuard`. Эта функция может
использовать тип директивы для вывода типа контекста, что полезно, когда тип директивы является обобщенным (generic).

Для описанной выше `SelectDirective` вы можете реализовать `ngTemplateContextGuard`, чтобы правильно указать тип данных,
даже если источник данных является обобщенным.

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
