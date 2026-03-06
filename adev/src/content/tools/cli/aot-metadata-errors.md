# Ошибки метаданных AOT {#aot-metadata-errors}

Ниже приведены ошибки метаданных, с которыми можно столкнуться, с пояснениями и рекомендациями по исправлению.

## Форма выражения не поддерживается {#expression-form-not-supported}

HELPFUL: Компилятор встретил выражение, которое не смог вычислить при оценке метаданных Angular.

Языковые конструкции, выходящие за рамки [ограниченного синтаксиса выражений](tools/cli/aot-compiler) компилятора,
могут вызвать эту ошибку, как показано в следующем примере:

```ts
// ERROR
export class Fooish { … }
…
const prop = typeof Fooish; // typeof is not valid in metadata
  …
  // bracket notation is not valid in metadata
  { provide: 'token', useValue: { [prop]: 'value' } };
  …
```

`typeof` и нотацию в скобках можно использовать в обычном коде приложения.
Просто нельзя использовать эти конструкции в выражениях, определяющих метаданные Angular.

Избегайте этой ошибки, придерживаясь [ограниченного синтаксиса выражений](tools/cli/aot-compiler)
при написании метаданных Angular
и будьте осторожны с новыми или нестандартными конструкциями TypeScript.

## Ссылка на локальный (неэкспортируемый) символ {#reference-to-a-local-non-exported-symbol}

HELPFUL: Ссылка на локальный \(неэкспортируемый\) символ 'имя символа'. Рассмотрите возможность экспорта символа.

Компилятор встретил ссылку на локально определённый символ, который либо не был экспортирован, либо не был инициализирован.

Вот пример проблемы с провайдером.

```ts

// ERROR
let foo: number; // neither exported nor initialized

@Component({
  selector: 'my-component',
  template: … ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}

```

Компилятор генерирует фабрику компонента, включающую код провайдера `useValue`, в отдельном модуле. _Этот_ модуль фабрики не может обратиться к _данному_ исходному модулю для доступа к локальной (неэкспортируемой) переменной `foo`.

Проблему можно решить, инициализировав `foo`.

```ts
let foo = 42; // initialized
```

Компилятор [свернёт](tools/cli/aot-compiler#code-folding) выражение в провайдер, как если бы было написано:

```ts
providers: [{provide: Foo, useValue: 42}];
```

Альтернативно, можно исправить это, экспортировав `foo`, ожидая, что `foo` будет присвоено во время выполнения, когда его значение будет известно.

```ts
// CORRECTED
export let foo: number; // exported

@Component({
  selector: 'my-component',
  template: … ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}
```

Добавление `export` часто работает для переменных, на которые ссылаются в метаданных, таких как `providers` и `animations`, поскольку компилятор может генерировать _ссылки_ на экспортируемые переменные в этих выражениях. Ему не нужны _значения_ этих переменных.

Добавление `export` не работает, когда компилятору нужно _фактическое значение_
для генерации кода.
Например, это не работает для свойства `template`.

```ts
// ERROR
export let someTemplate: string; // exported but not initialized

@Component({
  selector: 'my-component',
  template: someTemplate,
})
export class MyComponent {}
```

Компилятору нужно значение свойства `template` _прямо сейчас_ для генерации фабрики компонента.
Одной ссылки на переменную недостаточно.
Добавление `export` к объявлению лишь создаёт новую ошибку: "[`Только инициализированные переменные и константы могут быть использованы`](#only-initialized-variables-and-constants)".

## Только инициализированные переменные и константы {#only-initialized-variables-and-constants}

HELPFUL: _Только инициализированные переменные и константы могут использоваться, поскольку значение этой переменной необходимо компилятору шаблонов._

Компилятор нашёл ссылку на экспортируемую переменную или статическое поле, которое не было инициализировано.
Ему нужно значение этой переменной для генерации кода.

Следующий пример пытается задать свойство `template` компонента значением экспортируемой переменной `someTemplate`, которая объявлена, но _не присвоена_.

```ts
// ERROR
export let someTemplate: string;

@Component({
  selector: 'my-component',
  template: someTemplate,
})
export class MyComponent {}
```

Эта ошибка также возникнет, если `someTemplate` импортируется из другого модуля, но там не инициализируется.

```ts
// ERROR - not initialized there either
import {someTemplate} from './config';

@Component({
  selector: 'my-component',
  template: someTemplate,
})
export class MyComponent {}
```

Компилятор не может ждать до времени выполнения для получения информации о шаблоне.
Ему необходимо статически определить значение переменной `someTemplate` из исходного кода, чтобы сгенерировать фабрику компонента, включающую инструкции по созданию элемента на основе шаблона.

Для исправления этой ошибки укажите начальное значение переменной в инициализирующем предложении _в той же строке_.

```ts
// CORRECTED
export let someTemplate = '<h1>Greetings from Angular</h1>';

@Component({
  selector: 'my-component',
  template: someTemplate,
})
export class MyComponent {}
```

## Ссылка на неэкспортируемый класс {#reference-to-a-non-exported-class}

HELPFUL: _Ссылка на неэкспортируемый класс `<имя класса>`._
_Рассмотрите возможность экспорта класса._

В метаданных была ссылка на неэкспортируемый класс.

Например, может быть определён класс и использован как токен внедрения в массиве провайдеров, но этот класс не экспортирован.

```ts
// ERROR
abstract class MyStrategy { }

  …
  providers: [
    { provide: MyStrategy, useValue: … }
  ]
  …
```

Angular генерирует фабрику класса в отдельном модуле, и эта фабрика [может обращаться только к экспортируемым классам](tools/cli/aot-compiler#public-or-protected-symbols).
Для исправления ошибки экспортируйте указанный класс.

```ts
// CORRECTED
export abstract class MyStrategy { }

  …
  providers: [
    { provide: MyStrategy, useValue: … }
  ]
  …
```

## Ссылка на неэкспортируемую функцию {#reference-to-a-non-exported-function}

HELPFUL: _В метаданных была ссылка на неэкспортируемую функцию._

Например, свойство `useFactory` провайдера может быть задано локально определённой функцией, которая не была экспортирована.

```ts
// ERROR
function myStrategy() { … }

  …
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  …
```

Angular генерирует фабрику класса в отдельном модуле, и эта фабрика [может обращаться только к экспортируемым функциям](tools/cli/aot-compiler#public-or-protected-symbols).
Для исправления ошибки экспортируйте функцию.

```ts
// CORRECTED
export function myStrategy() { … }

  …
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  …
```

## Деструктурируемые переменные или константы не поддерживаются {#destructured-variable-or-constant-not-supported}

HELPFUL: _Ссылка на экспортируемую деструктурируемую переменную или константу не поддерживается компилятором шаблонов. Рассмотрите возможность упрощения, чтобы избежать деструктуризации._

Компилятор не поддерживает ссылки на переменные, присвоенные с помощью [деструктуризации](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#destructuring).

Например, нельзя писать следующее:

```ts
// ERROR
import { configuration } from './configuration';

// destructured assignment to foo and bar
const {foo, bar} = configuration;
  …
  providers: [
    {provide: Foo, useValue: foo},
    {provide: Bar, useValue: bar},
  ]
  …
```

Для исправления ошибки используйте неразрушенные значения.

```ts
// CORRECTED
import { configuration } from './configuration';
  …
  providers: [
    {provide: Foo, useValue: configuration.foo},
    {provide: Bar, useValue: configuration.bar},
  ]
  …
```

## Не удалось разрешить тип {#could-not-resolve-type}

HELPFUL: _Компилятор встретил тип и не может определить, какой модуль его экспортирует._

Это может произойти при ссылке на тип окружения.
Например, тип `Window` — это тип окружения, объявленный в глобальном файле `.d.ts`.

Ошибка возникнет при ссылке на него в конструкторе компонента, который компилятор должен статически проанализировать.

```ts
// ERROR
@Component({ })
export class MyComponent {
  constructor (private win: Window) { … }
}
```

TypeScript понимает типы окружения, поэтому их не нужно импортировать.
Angular-компилятор не понимает тип, который не был экспортирован или импортирован.

В этом случае компилятор не понимает, как выполнить внедрение чего-либо с токеном `Window`.

Не используйте типы окружения в выражениях метаданных.

Если необходимо внедрить экземпляр типа окружения,
можно решить проблему в четыре шага:

1. Создайте токен внедрения для экземпляра типа окружения.
1. Создайте фабричную функцию, возвращающую этот экземпляр.
1. Добавьте провайдер `useFactory` с этой фабричной функцией.
1. Используйте `@Inject` для внедрения экземпляра.

Вот наглядный пример.

```ts
// CORRECTED
import { Inject } from '@angular/core';

export const WINDOW = new InjectionToken('Window');
export function _window() { return window; }

@Component({
  …
  providers: [
    { provide: WINDOW, useFactory: _window }
  ]
})
export class MyComponent {
  constructor (@Inject(WINDOW) private win: Window) { … }
}
```

Тип `Window` в конструкторе больше не является проблемой для компилятора, поскольку
он использует `@Inject(WINDOW)` для генерации кода внедрения.

Angular делает нечто подобное с токеном `DOCUMENT`, что позволяет внедрять объект `document` браузера \(или его абстракцию, в зависимости от платформы, на которой работает приложение\).

```ts
import { Inject }   from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({ … })
export class MyComponent {
  constructor (@Inject(DOCUMENT) private doc: Document) { … }
}
```

## Ожидалось имя {#name-expected}

HELPFUL: _Компилятор ожидал имя в вычисляемом выражении._

Это может произойти при использовании числа в качестве имени свойства, как в следующем примере.

```ts
// ERROR
provider: [{provide: Foo, useValue: {0: 'test'}}];
```

Измените имя свойства на нечисловое.

```ts
// CORRECTED
provider: [{provide: Foo, useValue: {'0': 'test'}}];
```

## Неподдерживаемое имя члена перечисления {#unsupported-enum-member-name}

HELPFUL: _Angular не смог определить значение [члена перечисления](https://www.typescriptlang.org/docs/handbook/enums.html), на который есть ссылка в метаданных._

Компилятор понимает простые значения перечислений, но не сложные, например производные от вычисляемых свойств.

```ts
// ERROR
enum Colors {
  Red = 1,
  White,
  Blue = "Blue".length // computed
}

  …
  providers: [
    { provide: BaseColor,   useValue: Colors.White } // ok
    { provide: DangerColor, useValue: Colors.Red }   // ok
    { provide: StrongColor, useValue: Colors.Blue }  // bad
  ]
  …
```

Избегайте ссылок на перечисления со сложными инициализаторами или вычисляемыми свойствами.

## Теговые шаблонные выражения не поддерживаются {#tagged-template-expressions-are-not-supported}

HELPFUL: _Теговые шаблонные выражения не поддерживаются в метаданных._

Компилятор встретил JavaScript ES2015 [теговое шаблонное выражение](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals), такое как:

```ts

// ERROR
const expression = 'funky';
const raw = String.raw`A tagged template ${expression} string`;
 …
 template: '<div>' + raw + '</div>'
 …

```

[`String.raw()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/raw) — это _тег-функция_, встроенная в JavaScript ES2015.

AOT-компилятор не поддерживает теговые шаблонные выражения; избегайте их в выражениях метаданных.

## Ожидалась ссылка на символ {#symbol-reference-expected}

HELPFUL: _Компилятор ожидал ссылку на символ в месте, указанном в сообщении об ошибке._

Эта ошибка может возникнуть при использовании выражения в предложении `extends` класса.

<!--todo: Chuck: After reviewing your PR comment I'm still at a loss. See [comment there](https://github.com/angular/angular/pull/17712#discussion_r132025495). -->
