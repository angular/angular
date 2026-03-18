# Ошибки AOT-метаданных

Ниже перечислены ошибки метаданных, с которыми вы можете столкнуться, с пояснениями и рекомендуемыми исправлениями.

## Expression form not supported {#expression-form-not-supported}

HELPFUL: Компилятор обнаружил выражение, которое не может интерпретировать при вычислении метаданных Angular.

Языковые возможности за пределами [ограниченного синтаксиса выражений](tools/cli/aot-compiler) компилятора могут привести к этой ошибке, как показано в следующем примере:

```ts
// ОШИБКА
export class Fooish { … }
…
const prop = typeof Fooish; // typeof недопустим в метаданных
  …
  // скобочная нотация недопустима в метаданных
  { provide: 'token', useValue: { [prop]: 'value' } };
  …
```

В обычном коде приложения вы можете использовать `typeof` и скобочную нотацию.
Просто нельзя использовать эти возможности внутри выражений, определяющих Angular-метаданные.

Избегайте этой ошибки, придерживаясь [ограниченного синтаксиса выражений](tools/cli/aot-compiler) компилятора
при написании Angular-метаданных,
и будьте осторожны с новыми или необычными функциями TypeScript.

## Reference to a local (non-exported) symbol {#reference-to-a-local-non-exported-symbol}

HELPFUL: Reference to a local (non-exported) symbol 'symbol name'. Consider exporting the symbol.

Компилятор обнаружил ссылку на локально определённый символ, который либо не был экспортирован, либо не был инициализирован.

Вот пример проблемы с `provider`.

```ts

// ОШИБКА
let foo: number; // не экспортирован и не инициализирован

@Component({
  selector: 'my-component',
  template: … ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}

```

Компилятор генерирует фабрику компонентов, включающую код провайдера `useValue`, в отдельном модуле. _Этот_ модуль фабрики не может получить доступ к _этому_ исходному модулю, чтобы прочитать локальную (неэкспортированную) переменную `foo`.

Можно исправить проблему, инициализировав `foo`.

```ts
let foo = 42; // инициализирован
```

Компилятор выполнит [свёртку](tools/cli/aot-compiler#code-folding) выражения в провайдер, как если бы вы написали следующее.

```ts
providers: [{provide: Foo, useValue: 42}];
```

Альтернативно, можно исправить это, экспортировав `foo` в ожидании того, что `foo` будет присвоено во время выполнения, когда вы узнаете его значение.

```ts
// ИСПРАВЛЕНО
export let foo: number; // экспортирован

@Component({
  selector: 'my-component',
  template: … ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}
```

Добавление `export` часто работает для переменных, на которые ссылаются в метаданных, таких как `providers` и `animations`, потому что компилятор может генерировать _ссылки_ на экспортированные переменные в этих выражениях. Ему не нужны _значения_ этих переменных.

Добавление `export` не работает, когда компилятору нужно _фактическое значение_
для генерации кода.
Например, это не работает для свойства `template`.

```ts
// ОШИБКА
export let someTemplate: string; // экспортирован, но не инициализирован

@Component({
  selector: 'my-component',
  template: someTemplate,
})
export class MyComponent {}
```

Компилятору нужно значение свойства `template` _прямо сейчас_ для генерации фабрики компонентов.
Одной ссылки на переменную недостаточно.
Добавление префикса `export` к объявлению лишь приводит к новой ошибке: "[`Only initialized variables and constants can be referenced`](#only-initialized-variables-and-constants)".

## Only initialized variables and constants {#only-initialized-variables-and-constants}

HELPFUL: _Only initialized variables and constants can be referenced because the value of this variable is needed by the template compiler._

Компилятор обнаружил ссылку на экспортированную переменную или статическое поле, которые не были инициализированы.
Ему нужно значение этой переменной для генерации кода.

В следующем примере предпринимается попытка установить свойство `template` компонента в значение экспортированной переменной `someTemplate`, которая объявлена, но _не присвоена_.

```ts
// ОШИБКА
export let someTemplate: string;

@Component({
  selector: 'my-component',
  template: someTemplate,
})
export class MyComponent {}
```

Вы также получите эту ошибку, если импортировали `someTemplate` из другого модуля и забыли инициализировать её там.

```ts
// ОШИБКА — там тоже не инициализирована
import {someTemplate} from './config';

@Component({
  selector: 'my-component',
  template: someTemplate,
})
export class MyComponent {}
```

Компилятор не может ждать до выполнения, чтобы получить информацию о шаблоне.
Он должен статически вывести значение переменной `someTemplate` из исходного кода, чтобы сгенерировать фабрику компонентов, включающую инструкции для построения элемента на основе шаблона.

Чтобы исправить эту ошибку, укажите начальное значение переменной в предложении инициализатора _в той же строке_.

```ts
// ИСПРАВЛЕНО
export let someTemplate = '<h1>Greetings from Angular</h1>';

@Component({
  selector: 'my-component',
  template: someTemplate,
})
export class MyComponent {}
```

## Reference to a non-exported class {#reference-to-a-non-exported-class}

HELPFUL: _Reference to a non-exported class `<class name>`._
_Consider exporting the class._

Метаданные ссылаются на класс, который не был экспортирован.

Например, вы могли определить класс и использовать его как injection token в массиве providers, но забыли экспортировать этот класс.

```ts
// ОШИБКА
abstract class MyStrategy { }

  …
  providers: [
    { provide: MyStrategy, useValue: … }
  ]
  …
```

Angular генерирует фабрику классов в отдельном модуле, и эта фабрика [может обращаться только к экспортированным классам](tools/cli/aot-compiler#public-or-protected-symbols).
Чтобы исправить эту ошибку, экспортируйте указанный класс.

```ts
// ИСПРАВЛЕНО
export abstract class MyStrategy { }

  …
  providers: [
    { provide: MyStrategy, useValue: … }
  ]
  …
```

## Reference to a non-exported function {#reference-to-a-non-exported-function}

HELPFUL: _Metadata referenced a function that wasn't exported._

Например, вы могли установить свойство `useFactory` провайдеров в локально определённую функцию, которую забыли экспортировать.

```ts
// ОШИБКА
function myStrategy() { … }

  …
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  …
```

Angular генерирует фабрику классов в отдельном модуле, и эта фабрика [может обращаться только к экспортированным функциям](tools/cli/aot-compiler#public-or-protected-symbols).
Чтобы исправить эту ошибку, экспортируйте функцию.

```ts
// ИСПРАВЛЕНО
export function myStrategy() { … }

  …
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  …
```

## Destructured variable or constant not supported {#destructured-variable-or-constant-not-supported}

HELPFUL: _Referencing an exported destructured variable or constant is not supported by the template compiler. Consider simplifying this to avoid destructuring._

Компилятор не поддерживает ссылки на переменные, присвоенные с помощью [деструктуризации](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#destructuring).

Например, нельзя писать следующее:

```ts
// ОШИБКА
import { configuration } from './configuration';

// деструктурирующее присваивание для foo и bar
const {foo, bar} = configuration;
  …
  providers: [
    {provide: Foo, useValue: foo},
    {provide: Bar, useValue: bar},
  ]
  …
```

Чтобы исправить эту ошибку, ссылайтесь на недеструктурированные значения.

```ts
// ИСПРАВЛЕНО
import { configuration } from './configuration';
  …
  providers: [
    {provide: Foo, useValue: configuration.foo},
    {provide: Bar, useValue: configuration.bar},
  ]
  …
```

## Could not resolve type {#could-not-resolve-type}

HELPFUL: _The compiler encountered a type and can't determine which module exports that type._

Это может произойти, если вы ссылаетесь на ambient-тип.
Например, тип `Window` — это ambient-тип, объявленный в глобальном файле `.d.ts`.

Вы получите ошибку, если ссылаетесь на него в конструкторе компонента, который компилятор должен статически анализировать.

```ts
// ОШИБКА
@Component({ })
export class MyComponent {
  constructor (private win: Window) { … }
}
```

TypeScript понимает ambient-типы, поэтому вы не импортируете их.
Angular-компилятор не понимает тип, который вы забыли экспортировать или импортировать.

В этом случае компилятор не понимает, как внедрить что-либо с токеном `Window`.

Не ссылайтесь на ambient-типы в выражениях метаданных.

Если вам необходимо внедрить экземпляр ambient-типа,
вы можете решить проблему в четыре шага:

1. Создайте injection token для экземпляра ambient-типа.
1. Создайте фабричную функцию, возвращающую этот экземпляр.
1. Добавьте провайдер `useFactory` с этой фабричной функцией.
1. Используйте `@Inject` для внедрения экземпляра.

Вот иллюстративный пример.

```ts
// ИСПРАВЛЕНО
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

Тип `Window` в конструкторе больше не является проблемой для компилятора, поскольку он
использует `@Inject(WINDOW)` для генерации кода внедрения.

Angular делает нечто похожее с токеном `DOCUMENT`, что позволяет внедрять объект `document` браузера (или его абстракцию, в зависимости от платформы, на которой работает приложение).

```ts
import { Inject }   from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({ … })
export class MyComponent {
  constructor (@Inject(DOCUMENT) private doc: Document) { … }
}
```

## Name expected {#name-expected}

HELPFUL: _The compiler expected a name in an expression it was evaluating._

Это может произойти, если вы используете число в качестве имени свойства, как в следующем примере.

```ts
// ОШИБКА
provider: [{provide: Foo, useValue: {0: 'test'}}];
```

Измените имя свойства на нечисловое.

```ts
// ИСПРАВЛЕНО
provider: [{provide: Foo, useValue: {'0': 'test'}}];
```

## Unsupported enum member name {#unsupported-enum-member-name}

HELPFUL: _Angular couldn't determine the value of the [enum member](https://www.typescriptlang.org/docs/handbook/enums.html) that you referenced in metadata._

Компилятор понимает простые значения enum, но не сложные, например производные от вычисляемых свойств.

```ts
// ОШИБКА
enum Colors {
  Red = 1,
  White,
  Blue = "Blue".length // вычисляемое
}

  …
  providers: [
    { provide: BaseColor,   useValue: Colors.White } // ok
    { provide: DangerColor, useValue: Colors.Red }   // ok
    { provide: StrongColor, useValue: Colors.Blue }  // плохо
  ]
  …
```

Избегайте ссылок на enum со сложными инициализаторами или вычисляемыми свойствами.

## Tagged template expressions are not supported {#tagged-template-expressions-are-not-supported}

HELPFUL: _Tagged template expressions are not supported in metadata._

Компилятор обнаружил [tagged template expression](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals) из JavaScript ES2015, например следующее.

```ts

// ОШИБКА
const expression = 'funky';
const raw = String.raw`A tagged template ${expression} string`;
 …
 template: '<div>' + raw + '</div>'
 …

```

[`String.raw()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/raw) — это _тег-функция_, встроенная в JavaScript ES2015.

AOT-компилятор не поддерживает tagged template expressions; избегайте их в выражениях метаданных.

## Symbol reference expected {#symbol-reference-expected}

HELPFUL: _The compiler expected a reference to a symbol at the location specified in the error message._

Эта ошибка может возникнуть, если вы используете выражение в предложении `extends` класса.
