# Ошибки метаданных AOT

Ниже приведены ошибки метаданных, с которыми вы можете столкнуться, с объяснениями и предлагаемыми исправлениями.

## Форма выражения не поддерживается (Expression form not supported)

ПОЛЕЗНО: Компилятор встретил выражение, которое он не понял при оценке метаданных Angular.

Возможности языка, выходящие за рамки [ограниченного синтаксиса выражений](tools/cli/aot-compiler#expression-syntax)
компилятора, могут вызвать эту ошибку, как показано в следующем примере:

```ts
// ERROR
export class Fooish { … }
…
const prop = typeof Fooish; // typeof недопустим в метаданных
  …
  // скобочная нотация недопустима в метаданных
  { provide: 'token', useValue: { [prop]: 'value' } };
  …
```

Вы можете использовать `typeof` и скобочную нотацию в обычном коде приложения.
Вы просто не можете использовать эти возможности внутри выражений, определяющих метаданные Angular.

Избегайте этой ошибки, придерживаясь [ограниченного синтаксиса выражений](tools/cli/aot-compiler#expression-syntax)
компилятора при написании метаданных Angular, и с осторожностью относитесь к новым или необычным возможностям
TypeScript.

## Ссылка на локальный (неэкспортируемый) символ (Reference to a local (non-exported) symbol)

ПОЛЕЗНО: Ссылка на локальный \(неэкспортируемый\) символ 'symbol name'. Рассмотрите возможность экспорта символа.

Компилятор обнаружил ссылку на локально определенный символ, который либо не был экспортирован, либо не был
инициализирован.

Вот пример проблемы с `provider`.

```ts

// ERROR
let foo: number; // не экспортирована и не инициализирована

@Component({
  selector: 'my-component',
  template: … ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}

```

Компилятор генерирует фабрику компонента, которая включает код провайдера `useValue`, в отдельном модуле. _Этот_
фабричный модуль не может обратиться к _этому_ исходному модулю для доступа к локальной \(неэкспортируемой\) переменной
`foo`.

Вы можете исправить проблему, инициализировав `foo`.

```ts
let foo = 42; // инициализирована
```

Компилятор [свернет](tools/cli/aot-compiler#code-folding) выражение в провайдер, как если бы вы написали это:

```ts
providers: [
  { provide: Foo, useValue: 42 }
]
```

В качестве альтернативы, вы можете исправить это, экспортировав `foo` с расчетом на то, что `foo` будет присвоено
значение во время выполнения, когда вы действительно узнаете его значение.

```ts
// CORRECTED
export let foo: number; // экспортирована

@Component({
  selector: 'my-component',
  template: … ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}
```

Добавление `export` часто работает для переменных, на которые ссылаются в метаданных (например, `providers` и
`animations`), потому что компилятор может генерировать _ссылки_ на экспортируемые переменные в этих выражениях. Ему не
нужны _значения_ этих переменных.

Добавление `export` не работает, когда компилятору нужно _фактическое значение_ для генерации кода.
Например, это не работает для свойства `template`.

```ts
// ERROR
export let someTemplate: string; // экспортирована, но не инициализирована

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

Компилятору нужно значение свойства `template` _прямо сейчас_, чтобы сгенерировать фабрику компонента.
Одной ссылки на переменную недостаточно.
Добавление префикса `export` к объявлению лишь вызывает новую ошибку: "[
`Only initialized variables and constants can be referenced`](#only-initialized-variables-and-constants)".

## Только инициализированные переменные и константы (Only initialized variables and constants) {#only-initialized-variables-and-constants}

ПОЛЕЗНО: _Можно ссылаться только на инициализированные переменные и константы, так как значение этой переменной
необходимо компилятору шаблонов._

Компилятор обнаружил ссылку на экспортируемую переменную или статическое поле, которое не было инициализировано.
Ему нужно значение этой переменной для генерации кода.

В следующем примере делается попытка установить свойство `template` компонента в значение экспортируемой переменной
`someTemplate`, которая объявлена, но ей _не присвоено значение_.

```ts
// ERROR
export let someTemplate: string;

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

Вы также получите эту ошибку, если импортируете `someTemplate` из другого модуля и забудете инициализировать её там.

```ts
// ERROR - там тоже не инициализирована
import { someTemplate } from './config';

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

Компилятор не может ждать выполнения программы (runtime), чтобы получить информацию о шаблоне.
Он должен статически вывести значение переменной `someTemplate` из исходного кода, чтобы сгенерировать фабрику
компонента, которая включает инструкции для построения элемента на основе шаблона.

Чтобы исправить эту ошибку, укажите начальное значение переменной в инициализаторе _на той же строке_.

```ts
// CORRECTED
export let someTemplate = '<h1>Greetings from Angular</h1>';

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

## Ссылка на неэкспортируемый класс (Reference to a non-exported class)

ПОЛЕЗНО: _Ссылка на неэкспортируемый класс `<class name>`._
_Рассмотрите возможность экспорта класса._

Метаданные ссылаются на класс, который не был экспортирован.

Например, вы могли определить класс и использовать его как токен внедрения (injection token) в массиве `providers`, но
забыли экспортировать этот класс.

```ts
// ERROR
abstract class MyStrategy { }

  …
  providers: [
    { provide: MyStrategy, useValue: … }
  ]
  …
```

Angular генерирует фабрику класса в отдельном модуле, и эта
фабрика [может обращаться только к экспортируемым классам](tools/cli/aot-compiler#exported-symbols).
Чтобы исправить эту ошибку, экспортируйте указанный класс.

```ts
// CORRECTED
export abstract class MyStrategy { }

  …
  providers: [
    { provide: MyStrategy, useValue: … }
  ]
  …
```

## Ссылка на неэкспортируемую функцию (Reference to a non-exported function)

ПОЛЕЗНО: _Метаданные ссылаются на функцию, которая не была экспортирована._

Например, вы могли установить свойство `useFactory` провайдера на локально определенную функцию, которую забыли
экспортировать.

```ts
// ERROR
function myStrategy() { … }

  …
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  …
```

Angular генерирует фабрику класса в отдельном модуле, и эта
фабрика [может обращаться только к экспортируемым функциям](tools/cli/aot-compiler#exported-symbols).
Чтобы исправить эту ошибку, экспортируйте функцию.

```ts
// CORRECTED
export function myStrategy() { … }

  …
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  …
```

## Вызовы функций не поддерживаются (Function calls are not supported)

ПОЛЕЗНО: _Вызовы функций не поддерживаются. Рассмотрите возможность замены функции или лямбда-выражения ссылкой на
экспортируемую функцию._

Компилятор в настоящее время не
поддерживает [функциональные выражения или лямбда-функции](tools/cli/aot-compiler#function-expression).
Например, вы не можете установить `useFactory` провайдера на анонимную функцию или стрелочную функцию следующим образом.

```ts
// ERROR
  …
  providers: [
    { provide: MyStrategy, useFactory: function() { … } },
    { provide: OtherStrategy, useFactory: () => { … } }
  ]
  …
```

Вы также получите эту ошибку, если вызовете функцию или метод в `useValue` провайдера.

```ts
// ERROR
import { calculateValue } from './utilities';

  …
  providers: [
    { provide: SomeValue, useValue: calculateValue() }
  ]
  …
```

Чтобы исправить эту ошибку, экспортируйте функцию из модуля и вместо этого сошлитесь на неё в провайдере `useFactory`.

```ts
// CORRECTED
import { calculateValue } from './utilities';

export function myStrategy() { … }
export function otherStrategy() { … }
export function someValueFactory() {
  return calculateValue();
}
  …
  providers: [
    { provide: MyStrategy, useFactory: myStrategy },
    { provide: OtherStrategy, useFactory: otherStrategy },
    { provide: SomeValue, useFactory: someValueFactory }
  ]
  …
```

## Деструктурированная переменная или константа не поддерживается (Destructured variable or constant not supported)

ПОЛЕЗНО: _Ссылка на экспортируемую деструктурированную переменную или константу не поддерживается компилятором шаблонов.
Рассмотрите возможность упрощения, чтобы избежать деструктуризации._

Компилятор не поддерживает ссылки на переменные, присвоенные с
помощью [деструктуризации](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#destructuring).

Например, вы не можете написать что-то подобное:

```ts
// ERROR
import { configuration } from './configuration';

// деструктурированное присваивание foo и bar
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
// CORRECTED
import { configuration } from './configuration';
  …
  providers: [
    {provide: Foo, useValue: configuration.foo},
    {provide: Bar, useValue: configuration.bar},
  ]
  …
```

## Не удалось разрешить тип (Could not resolve type)

ПОЛЕЗНО: _Компилятор встретил тип и не может определить, какой модуль экспортирует этот тип._

Это может произойти, если вы ссылаетесь на ambient-тип (тип из окружения).
Например, тип `Window` — это ambient-тип, объявленный в глобальном файле `.d.ts`.

Вы получите ошибку, если сошлетесь на него в конструкторе компонента, который компилятор должен статически
проанализировать.

```ts
// ERROR
@Component({ })
export class MyComponent {
  constructor (private win: Window) { … }
}
```

TypeScript понимает ambient-типы, поэтому вы их не импортируете.
Компилятор Angular не понимает тип, который вы забыли экспортировать или импортировать.

В данном случае компилятор не понимает, как внедрить что-то с токеном `Window`.

Не ссылайтесь на ambient-типы в выражениях метаданных.

Если вам необходимо внедрить экземпляр ambient-типа, вы можете обойти проблему в четыре шага:

1. Создайте токен внедрения (injection token) для экземпляра ambient-типа.
2. Создайте фабричную функцию, которая возвращает этот экземпляр.
3. Добавьте провайдер `useFactory` с этой фабричной функцией.
4. Используйте `@Inject` для внедрения экземпляра.

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

Тип `Window` в конструкторе больше не является проблемой для компилятора, потому что он использует `@Inject(WINDOW)` для
генерации кода внедрения.

Angular делает нечто подобное с токеном `DOCUMENT`, поэтому вы можете внедрить объект браузера `document` (или его
абстракцию, в зависимости от платформы, на которой работает приложение).

```ts
import { Inject }   from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({ … })
export class MyComponent {
  constructor (@Inject(DOCUMENT) private doc: Document) { … }
}
```

## Ожидалось имя (Name expected)

ПОЛЕЗНО: _Компилятор ожидал имя в выражении, которое он оценивал._

Это может произойти, если вы используете число в качестве имени свойства, как в следующем примере.

```ts
// ERROR
provider: [{ provide: Foo, useValue: { 0: 'test' } }]
```

Измените имя свойства на нечисловое.

```ts
// CORRECTED
provider: [{ provide: Foo, useValue: { '0': 'test' } }]
```

## Неподдерживаемое имя члена перечисления (Unsupported enum member name)

ПОЛЕЗНО: _Angular не смог определить
значение [члена перечисления](https://www.typescriptlang.org/docs/handbook/enums.html), на который вы ссылались в
метаданных._

Компилятор может понимать простые значения перечислений (enum), но не сложные значения, такие как те, что получены из
вычисляемых свойств.

```ts
// ERROR
enum Colors {
  Red = 1,
  White,
  Blue = "Blue".length // вычисляемое
}

  …
  providers: [
    { provide: BaseColor,   useValue: Colors.White } // ok
    { provide: DangerColor, useValue: Colors.Red }   // ok
    { provide: StrongColor, useValue: Colors.Blue }  // bad
  ]
  …
```

Избегайте ссылок на перечисления (enum) со сложными инициализаторами или вычисляемыми свойствами.

## Тегированные шаблонные строки не поддерживаются (Tagged template expressions are not supported)

ПОЛЕЗНО: _Тегированные шаблонные строки не поддерживаются в метаданных._

Компилятор встретил JavaScript
ES2015 [тегированную шаблонную строку](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals),
такую как следующая.

```ts

// ERROR
const expression = 'funky';
const raw = String.raw`A tagged template ${expression} string`;
 …
 template: '<div>' + raw + '</div>'
 …

```

[`String.raw()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/raw) — это
_функция-тег_, встроенная в JavaScript ES2015.

AOT-компилятор не поддерживает тегированные шаблонные строки; избегайте их в выражениях метаданных.

## Ожидалась ссылка на символ (Symbol reference expected)

ПОЛЕЗНО: _Компилятор ожидал ссылку на символ в месте, указанном в сообщении об ошибке._

Эта ошибка может возникнуть, если вы используете выражение в предложении `extends` класса.

<!--todo: Chuck: After reviewing your PR comment I'm still at a loss. See [comment there](https://github.com/angular/angular/pull/17712#discussion_r132025495). -->
