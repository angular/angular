# Ahead-of-time (AOT) компиляция

Приложение Angular в основном состоит из компонентов и их HTML-шаблонов.
Поскольку компоненты и шаблоны, предоставляемые Angular, не могут быть напрямую поняты браузером, приложения Angular требуют процесса компиляции, прежде чем они смогут работать в браузере.

Ahead-of-time (AOT) компилятор Angular преобразует ваш Angular HTML и TypeScript-код в эффективный JavaScript-код на этапе сборки _до_ того, как браузер загрузит и выполнит этот код.
Компиляция приложения во время сборки обеспечивает более быстрый рендеринг в браузере.

В этом руководстве объясняется, как указывать метаданные и применять доступные опции компилятора для эффективной компиляции приложений с помощью AOT-компилятора.

HELPFUL: [Посмотрите, как Alex Rickabaugh объясняет компилятор Angular](https://www.youtube.com/watch?v=anphffaCZrQ) на AngularConnect 2019.

Вот несколько причин, по которым может понадобиться AOT.

| Причины                                 | Подробности                                                                                                                                                                                                                                            |
| :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Более быстрый рендеринг                        | С AOT браузер загружает предварительно скомпилированную версию приложения. Браузер загружает исполняемый код, поэтому может сразу отрисовать приложение, не ожидая предварительной компиляции.                                       |
| Меньше асинхронных запросов             | Компилятор _встраивает_ внешние HTML-шаблоны и CSS-таблицы стилей в JavaScript приложения, устраняя отдельные ajax-запросы к этим исходным файлам.                                                                                  |
| Меньший размер загрузки фреймворка Angular | Нет необходимости загружать компилятор Angular, если приложение уже скомпилировано. Компилятор составляет примерно половину Angular, поэтому его исключение существенно уменьшает payload приложения.                                              |
| Более раннее обнаружение ошибок шаблонов          | AOT-компилятор обнаруживает и сообщает об ошибках привязки в шаблонах на этапе сборки, до того как их увидят пользователи.                                                                                                                                      |
| Лучшая безопасность                         | AOT компилирует HTML-шаблоны и компоненты в JavaScript-файлы задолго до того, как они будут отданы клиенту. Без шаблонов для чтения и без рискованной клиентской оценки HTML или JavaScript меньше возможностей для injection-атак. |

## Выбор компилятора {#choosing-a-compiler}

Angular предлагает два способа компиляции приложения:

| Компиляция Angular       | Подробности                                                                                           |
| :-------------------- | :------------------------------------------------------------------------------------------------ |
| Just-in-Time \(JIT\)  | Компилирует приложение в браузере во время выполнения. Это был режим по умолчанию до Angular 8.        |
| Ahead-of-Time \(AOT\) | Компилирует приложение и библиотеки на этапе сборки. Это режим по умолчанию начиная с Angular 9. |

Когда вы запускаете команды CLI [`ng build`](cli/build) \(только сборка\) или [`ng serve`](cli/serve) \(сборка и локальная раздача\), тип компиляции \(JIT или AOT\) зависит от значения свойства `aot` в конфигурации сборки, указанной в `angular.json`.
По умолчанию для новых CLI-приложений `aot` установлен в `true`.

См. [справочник команд CLI](cli) и [Сборка и раздача Angular-приложений](tools/cli/build) для дополнительной информации.

## Как работает AOT {#how-aot-works}

AOT-компилятор Angular извлекает **метаданные**, чтобы интерпретировать части приложения, которыми должен управлять Angular.
Метаданные можно указать явно в **декораторах**, таких как `@Component()`, или неявно в объявлениях конструкторов декорированных классов.
Метаданные сообщают Angular, как создавать экземпляры классов приложения и взаимодействовать с ними во время выполнения.

В следующем примере объект метаданных `@Component()` и конструктор класса сообщают Angular, как создать и отобразить экземпляр `Typical`.

```angular-ts
@Component({
  selector: 'app-typical',
  template: '<div>A typical component for {{data.name}}</div>',
})
export class Typical {
  data = input.required<TypicalData>();
  private someService = inject(SomeService);
}
```

Компилятор Angular извлекает метаданные _один раз_ и генерирует _фабрику_ для `Typical`.
Когда нужно создать экземпляр `Typical`, Angular вызывает фабрику, которая создаёт новый визуальный элемент, привязанный к новому экземпляру класса компонента с внедрённой зависимостью.

### Фазы компиляции {#compilation-phases}

Существует три фазы AOT-компиляции.

|     | Фаза                  | Подробности                                                                                                                                                                                                                                                                                                        |
| :-- | :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | анализ кода          | На этой фазе компилятор TypeScript и _AOT collector_ создают представление исходного кода. Collector не пытается интерпретировать собираемые метаданные. Он представляет метаданные насколько возможно и записывает ошибки при обнаружении нарушения синтаксиса метаданных.                              |
| 2   | генерация кода        | На этой фазе `StaticReflector` компилятора интерпретирует метаданные, собранные на фазе 1, выполняет дополнительную валидацию метаданных и выбрасывает ошибку при обнаружении нарушения ограничений метаданных.                                                                                              |
| 3   | проверка типов шаблонов | На этой необязательной фазе _template compiler_ Angular использует компилятор TypeScript для валидации выражений привязки в шаблонах. Эту фазу можно явно включить, установив опцию конфигурации `strictTemplates`; см. [Опции компилятора Angular](reference/configs/angular-compiler-options). |

### Ограничения метаданных {#metadata-restrictions}

Метаданные пишутся на _подмножестве_ TypeScript, которое должно соответствовать следующим общим ограничениям:

- Ограничьте [синтаксис выражений](#expression-syntax-limitations) поддерживаемым подмножеством JavaScript
- Ссылайтесь только на экспортированные символы после [code folding](#code-folding)
- Вызывайте только [функции, поддерживаемые](#supported-classes-and-functions) компилятором
- Input/Outputs и члены класса с привязкой данных должны быть public или protected. Дополнительные рекомендации и инструкции по подготовке приложения к AOT-компиляции см. в [Angular: Writing AOT-friendly applications](https://medium.com/sparkles-blog/angular-writing-aot-friendly-applications-7b64c8afbe3f).

HELPFUL: Ошибки AOT-компиляции часто возникают из-за метаданных, не соответствующих требованиям компилятора \(подробнее описано ниже\).
Для понимания и решения этих проблем см. [Ошибки метаданных AOT](tools/cli/aot-metadata-errors).

### Настройка AOT-компиляции {#configuring-aot-compilation}

Опции, управляющие процессом компиляции, можно указать в [файле конфигурации TypeScript](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).
Полный список доступных опций см. в [Опции компилятора Angular](reference/configs/angular-compiler-options).

## Фаза 1: Анализ кода {#phase-1-code-analysis}

Компилятор TypeScript выполняет часть аналитической работы первой фазы.
Он генерирует файлы _определений типов_ `.d.ts` с информацией о типах, необходимой AOT-компилятору для генерации кода приложения.
Одновременно AOT **collector** анализирует метаданные, записанные в декораторах Angular, и выводит информацию о метаданных в файлы **`.metadata.json`**, по одному на каждый файл `.d.ts`.

Файл `.metadata.json` можно представить как диаграмму общей структуры метаданных декоратора в виде [абстрактного синтаксического дерева (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree).

HELPFUL: [schema.ts](https://github.com/angular/angular/blob/main/packages/compiler-cli/src/metadata/schema.ts) Angular описывает JSON-формат как набор интерфейсов TypeScript.

### Ограничения синтаксиса выражений {#expression-syntax-limitations}

AOT collector понимает только подмножество JavaScript.
Определяйте объекты метаданных со следующим ограниченным синтаксисом:

| Синтаксис                    | Пример                                                    |
| :------------------------ | :--------------------------------------------------------- |
| Literal object            | `{cherry: true, apple: true, mincemeat: false}`            |
| Literal array             | `['cherries', 'flour', 'sugar']`                           |
| Spread in literal array   | `['apples', 'flour', …]`                                   |
| Calls                     | `bake(ingredients)`                                        |
| New                       | `new Oven()`                                               |
| Property access           | `pie.slice`                                                |
| Array index               | `ingredients[0]`                                           |
| Identity reference        | `Component`                                                |
| A template string         | <code>`pie is ${multiplier} times better than cake`</code> |
| Literal string            | `'pi'`                                                     |
| Literal number            | `3.14153265`                                               |
| Literal boolean           | `true`                                                     |
| Literal null              | `null`                                                     |
| Supported prefix operator | `!cake`                                                    |
| Supported binary operator | `a+b`                                                      |
| Conditional operator      | `a ? b : c`                                                |
| Parentheses               | `(a+b)`                                                    |

Если выражение использует неподдерживаемый синтаксис, collector записывает узел ошибки в файл `.metadata.json`.
Компилятор позже сообщит об ошибке, если этот фрагмент метаданных понадобится для генерации кода приложения.

HELPFUL: Если нужно, чтобы `ngc` сразу сообщал о синтаксических ошибках, а не создавал файл `.metadata.json` с ошибками, установите опцию `strictMetadataEmit` в файле конфигурации TypeScript.

```json

"angularCompilerOptions": {
  …
  "strictMetadataEmit" : true
}

```

Библиотеки Angular используют эту опцию, чтобы все файлы Angular `.metadata.json` были чистыми, и рекомендуется делать то же самое при сборке собственных библиотек.

### Без стрелочных функций {#no-arrow-functions}

AOT-компилятор не поддерживает [function expressions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/function)
и [arrow functions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/Arrow_functions), также называемые _lambda_-функциями.

Рассмотрим следующий декоратор компонента:

```ts

@Component({
  …
  providers: [{provide: server, useFactory: () => new Server()}]
})

```

AOT collector не поддерживает стрелочную функцию `() => new Server()` в выражении метаданных.
Он генерирует узел ошибки вместо функции.
Когда компилятор позже интерпретирует этот узел, он сообщает об ошибке и предлагает превратить стрелочную функцию в _экспортированную функцию_.

Ошибку можно исправить, преобразовав код так:

```ts

export function serverFactory() {
  return new Server();
}

@Component({
  …
  providers: [{provide: server, useFactory: serverFactory}]
})

```

В версии 5 и новее компилятор автоматически выполняет это переписывание при генерации файла `.js`.

### Code folding {#code-folding}

Компилятор может разрешать ссылки только на **_экспортированные_** символы.
Однако collector может вычислить выражение во время сбора и записать результат в `.metadata.json` вместо исходного выражения.
Это позволяет ограниченно использовать неэкспортированные символы внутри выражений.

Например, collector может вычислить выражение `1 + 2 + 3 + 4` и заменить его результатом `10`.
Этот процесс называется _folding_.
Выражение, которое можно так сократить, является _foldable_.

Collector может вычислять ссылки на локальные для модуля объявления `const` и инициализированные объявления `var` и `let`, фактически удаляя их из файла `.metadata.json`.

Рассмотрим следующее определение компонента:

```angular-ts
const template = '<div>{{hero().name}}</div>';

@Component({
  selector: 'app-hero',
  template: template,
})
export class Hero {
  hero = input.required<Hero>();
}
```

Компилятор не мог бы ссылаться на константу `template`, потому что она не экспортирована.
Однако collector может свернуть константу `template` в определение метаданных, встроив её содержимое.
Эффект тот же, как если бы вы написали:

```angular-ts
@Component({
  selector: 'app-hero',
  template: '<div>{{hero().name}}</div>',
})
export class Hero {
  hero = input.required<Hero>();
}
```

Ссылки на `template` больше нет, и поэтому компилятору нечему мешать при последующей интерпретации вывода _collector_ в `.metadata.json`.

Этот пример можно развить дальше, включив константу `template` в другое выражение:

```angular-ts
const template = '<div>{{hero().name}}</div>';

@Component({
  selector: 'app-hero',
  template: template + '<div>{{hero().title}}</div>',
})
export class Hero {
  hero = input.required<Hero>();
}
```

Collector сводит это выражение к эквивалентной _свёрнутой_ строке:

```angular-ts
'<div>{{hero().name}}</div><div>{{hero().title}}</div>';
```

#### Сворачиваемый синтаксис {#foldable-syntax}

В следующей таблице описано, какие выражения collector может и не может сворачивать:

| Синтаксис                           | Сворачиваемый                                 |
| :------------------------------- | :--------------------------------------- |
| Literal object                   | yes                                      |
| Literal array                    | yes                                      |
| Spread in literal array          | no                                       |
| Calls                            | no                                       |
| New                              | no                                       |
| Property access                  | yes, if target is foldable               |
| Array index                      | yes, if target and index are foldable    |
| Identity reference               | yes, if it is a reference to a local     |
| A template with no substitutions | yes                                      |
| A template with substitutions    | yes, if the substitutions are foldable   |
| Literal string                   | yes                                      |
| Literal number                   | yes                                      |
| Literal boolean                  | yes                                      |
| Literal null                     | yes                                      |
| Supported prefix operator        | yes, if operand is foldable              |
| Supported binary operator        | yes, if both left and right are foldable |
| Conditional operator             | yes, if condition is foldable            |
| Parentheses                      | yes, if the expression is foldable       |

Если выражение не сворачиваемо, collector записывает его в `.metadata.json` как [AST](https://en.wikipedia.org/wiki/Abstract*syntax*tree) для разрешения компилятором.

## Фаза 2: генерация кода {#phase-2-code-generation}

Collector не пытается понять метаданные, которые собирает и выводит в `.metadata.json`.
Он представляет метаданные насколько возможно и записывает ошибки при обнаружении нарушения синтаксиса метаданных.
Интерпретировать `.metadata.json` на фазе генерации кода — задача компилятора.

Компилятор понимает все формы синтаксиса, которые поддерживает collector, но может отклонить _синтаксически_ корректные метаданные, если _семантика_ нарушает правила компилятора.

### Public или protected символы {#public-or-protected-symbols}

Компилятор может ссылаться только на _экспортированные символы_.

- Декорированные члены класса компонента должны быть public или protected.
  Нельзя сделать свойство `input()` private.

- Свойства с привязкой данных также должны быть public или protected

### Поддерживаемые классы и функции {#supported-classes-and-functions}

Collector может представить вызов функции или создание объекта с `new`, пока синтаксис корректен.
Однако компилятор позже может отказаться генерировать вызов _конкретной_ функции или создание _конкретного_ объекта.

Компилятор может создавать экземпляры только определённых классов, поддерживает только основные декораторы и поддерживает только вызовы макросов \(функций или статических методов\), возвращающих выражения.

| Действие компилятора      | Подробности                                                                                                                                                |
| :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| New instances        | Компилятор допускает только метаданные, создающие экземпляры класса `InjectionToken` из `@angular/core`.                                            |
| Supported decorators | Компилятор поддерживает только метаданные для [декораторов Angular в модуле `@angular/core`](/api?type=decorator).                                   |
| Function calls       | Фабричные функции должны быть экспортированными именованными функциями. AOT-компилятор не поддерживает lambda-выражения \("arrow functions"\) для фабричных функций. |

### Вызовы функций и статических методов {#functions-and-static-method-calls}

Collector принимает любую функцию или статический метод, содержащий один оператор `return`.
Однако компилятор поддерживает только макросы в виде функций или статических методов, возвращающих _выражение_.

Например, рассмотрим следующую функцию:

```ts
export function wrapInArray<T>(value: T): T[] {
  return [value];
}
```

Можно вызвать `wrapInArray` в определении метаданных, потому что она возвращает значение выражения, соответствующего ограничивающему подмножеству JavaScript компилятора.

`wrapInArray()` можно использовать так:

```ts
@NgModule({
  declarations: wrapInArray(Typical),
})
export class TypicalModule {}
```

Компилятор обрабатывает это использование так, как если бы вы написали:

```ts
@NgModule({
  declarations: [Typical],
})
export class TypicalModule {}
```

[`RouterModule`](api/router/RouterModule) Angular экспортирует два макроса-статических метода, `forRoot` и `forChild`, для объявления корневых и дочерних маршрутов.
Изучите [исходный код](https://github.com/angular/angular/blob/main/packages/router/src/router_module.ts#L139 'RouterModule.forRoot source code')
этих методов, чтобы увидеть, как макросы могут упростить конфигурацию сложных [NgModules](guide/ngmodules/overview).

### Переписывание метаданных {#metadata-rewriting}

Компилятор особым образом обрабатывает литералы объектов, содержащие поля `useClass`, `useValue`, `useFactory` и `data`, преобразуя выражение, инициализирующее одно из этих полей, в экспортированную переменную, которая заменяет выражение.
Процесс переписывания этих выражений снимает все ограничения на их содержимое, потому что
компилятору не нужно знать значение выражения — ему достаточно уметь сгенерировать ссылку на значение.

Можно написать что-то вроде:

```ts
class TypicalServer {}

@NgModule({
  providers: [{provide: SERVER, useFactory: () => TypicalServer}],
})
export class TypicalModule {}
```

Без переписывания это было бы некорректно, потому что lambda не поддерживаются, а `TypicalServer` не экспортирован.
Чтобы это разрешить, компилятор автоматически переписывает код примерно так:

```ts
class TypicalServer {}

export const θ0 = () => new TypicalServer();

@NgModule({
  providers: [{provide: SERVER, useFactory: θ0}],
})
export class TypicalModule {}
```

Это позволяет компилятору сгенерировать ссылку на `θ0` в фабрике, не зная, что содержит значение `θ0`.

Компилятор выполняет переписывание при генерации файла `.js`.
Однако он не переписывает файл `.d.ts`, поэтому TypeScript не распознаёт это как экспорт.
И это не мешает экспортированному API ES-модуля.

## Фаза 3: Проверка типов шаблонов {#phase-3-template-type-checking}

Одна из самых полезных возможностей компилятора Angular — проверка типов выражений в шаблонах и перехват ошибок до того, как они вызовут сбои во время выполнения.
На фазе проверки типов шаблонов template compiler Angular использует компилятор TypeScript для валидации выражений привязки в шаблонах.

Включите эту фазу явно, добавив опцию компилятора `"strictTemplates"` в `"angularCompilerOptions"` файла конфигурации TypeScript проекта
(см. [Опции компилятора Angular](reference/configs/angular-compiler-options)).

Валидация шаблонов выдаёт сообщения об ошибках при обнаружении ошибки типа в выражении привязки шаблона,
аналогично тому, как ошибки типов сообщаются компилятором TypeScript для кода в файле `.ts`.

Например, рассмотрим следующий компонент:

```angular-ts
@Component({
  selector: 'my-component',
  template: '{{person.addresss.street}}',
})
class MyComponent {
  person?: Person;
}
```

Это приводит к следующей ошибке:

```shell {hideCopy}

my.component.ts.MyComponent.html(1,1): : Property 'addresss' does not exist on type 'Person'. Did you mean 'address'?

```

Имя файла в сообщении об ошибке, `my.component.ts.MyComponent.html`, — это синтетический файл,
сгенерированный template compiler и содержащий содержимое шаблона класса `MyComponent`.
Компилятор никогда не записывает этот файл на диск.
Номера строк и столбцов относительны к строке шаблона в аннотации `@Component` класса, в данном случае `MyComponent`.
Если компонент использует `templateUrl` вместо `template`, ошибки сообщаются в HTML-файле, на который ссылается `templateUrl`, а не в синтетическом файле.

Расположение ошибки — начало текстового узла, содержащего выражение интерполяции с ошибкой.
Если ошибка в привязке атрибута, например `[value]="person.address.street"`, расположение ошибки —
это расположение атрибута, содержащего ошибку.

Валидация использует проверку типов TypeScript и опции, переданные компилятору TypeScript, для управления детальностью проверки типов.
Например, если указан `strictTypeChecks`, ошибка

```shell {hideCopy}

my.component.ts.MyComponent.html(1,1): : Object is possibly 'undefined'

```

также будет сообщена вместе с приведённым выше сообщением об ошибке.

### Сужение типов {#type-narrowing}

Выражение, используемое в директиве `ngIf`, применяется для сужения union-типов в template compiler Angular
так же, как выражение `if` в TypeScript.
Например, чтобы избежать ошибки `Object is possibly 'undefined'` в шаблоне выше, измените его так, чтобы интерполяция выводилась только если значение `person` инициализировано, как показано ниже:

```angular-ts
@Component({
  selector: 'my-component',
  template: '<span *ngIf="person"> {{person.address.street}} </span>',
})
class MyComponent {
  person?: Person;
}
```

Использование `*ngIf` позволяет компилятору TypeScript вывести, что `person`, используемый в выражении привязки, никогда не будет `undefined`.

Дополнительную информацию о сужении типов input см. в [Улучшение проверки типов шаблонов для пользовательских директив](/guide/directives/structural-directives#improving-template-type-checking-for-custom-directives).

### Оператор утверждения non-null типа {#non-null-type-assertion-operator}

Используйте оператор утверждения non-null типа, чтобы подавить ошибку `Object is possibly 'undefined'`, когда неудобно использовать `*ngIf` или когда некоторое ограничение в компоненте гарантирует, что выражение всегда non-null при интерполяции выражения привязки.

В следующем примере свойства `person` и `address` всегда устанавливаются вместе, подразумевая, что `address` всегда non-null, если `person` non-null.
Нет удобного способа описать это ограничение для TypeScript и template compiler, но ошибка подавляется в примере с помощью `address!.street`.

```angular-ts
@Component({
  selector: 'my-component',
  template: '<span *ngIf="person"> {{person.name}} lives on {{address!.street}} </span>',
})
class MyComponent {
  person?: Person;
  address?: Address;

  setData(person: Person, address: Address) {
    this.person = person;
    this.address = address;
  }
}
```

Оператор non-null assertion следует использовать редко, так как рефакторинг компонента может нарушить это ограничение.

В этом примере рекомендуется включить проверку `address` в `*ngIf`, как показано ниже:

```angular-ts
@Component({
  selector: 'my-component',
  template: '<span *ngIf="person && address"> {{person.name}} lives on {{address.street}} </span>',
})
class MyComponent {
  person?: Person;
  address?: Address;

  setData(person: Person, address: Address) {
    this.person = person;
    this.address = address;
  }
}
```
