# AOT metadata errors

The following are metadata errors you may encounter, with explanations and suggested corrections.

[Expression form not supported](#expression-form-not-supported) <br /> 
[Reference to a local (non-exported) symbol](#reference-to-a-local-symbol) <br /> 
[Only initialized variables and constants](#only-initialized-variables) <br /> 
[Reference to a non-exported class](#reference-to-a-non-exported-class) <br /> 
[Reference to a non-exported function](#reference-to-a-non-exported-function) <br /> 
[Function calls are not supported](#function-calls-not-supported) <br /> 
[Destructured variable or constant not supported](#destructured-variable-not-supported) <br /> 
[Could not resolve type](#could-not-resolve-type) <br /> 
[Name expected](#name-expected) <br /> 
[Unsupported enum member name](#unsupported-enum-member-name) <br /> 
[Tagged template expressions are not supported](#tagged-template-expressions-not-supported) <br /> 
[Symbol reference expected](#symbol-reference-expected) <br /> 

<a id="expression-form-not-supported"></a>

## Expression form not supported

<div class="alert is-helpful">

*The compiler encountered an expression it didn't understand while evaluating Angular metadata.*

</div>

Language features outside of the compiler's [restricted expression syntax](guide/aot-compiler#expression-syntax)
can produce this error, as seen in the following example:

<code-example format="typescript" language="typescript">

// ERROR
export class Fooish { &hellip; }
&hellip;
const prop = typeof Fooish; // typeof is not valid in metadata
  &hellip;
  // bracket notation is not valid in metadata
  { provide: 'token', useValue: { [prop]: 'value' } };
  &hellip;

</code-example>

You can use `typeof` and bracket notation in normal application code.
You just can't use those features within expressions that define Angular metadata.

Avoid this error by sticking to the compiler's [restricted expression syntax](guide/aot-compiler#expression-syntax)
when writing Angular metadata
and be wary of new or unusual TypeScript features.

<a id="reference-to-a-local-symbol"></a>

## Reference to a local (non-exported) symbol

<div class="alert is-helpful">

*Reference to a local \(non-exported\) symbol 'symbol name'. Consider exporting the symbol.*

</div>

The compiler encountered a referenced to a locally defined symbol that either wasn't exported or wasn't initialized.

Here's a `provider` example of the problem.

<code-example format="typescript" language="typescript">

// ERROR
let foo: number; // neither exported nor initialized

&commat;Component({
  selector: 'my-component',
  template: &hellip; ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}

</code-example>

The compiler generates the component factory, which includes the `useValue` provider code, in a separate module. *That* factory module can't reach back to *this* source module to access the local \(non-exported\) `foo` variable.

You could fix the problem by initializing `foo`.

<code-example format="typescript" language="typescript">

let foo = 42; // initialized

</code-example>

The compiler will [fold](guide/aot-compiler#code-folding) the expression into the provider as if you had written this.

<code-example format="typescript" language="typescript">

providers: [
  { provide: Foo, useValue: 42 }
]

</code-example>

Alternatively, you can fix it by exporting `foo` with the expectation that `foo` will be assigned at runtime when you actually know its value.

<code-example format="typescript" language="typescript">

// CORRECTED
export let foo: number; // exported

&commat;Component({
  selector: 'my-component',
  template: &hellip; ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}

</code-example>

Adding `export` often works for variables referenced in metadata such as `providers` and `animations` because the compiler can generate *references* to the exported variables in these expressions. It doesn't need the *values* of those variables.

Adding `export` doesn't work when the compiler needs the *actual value*
in order to generate code.
For example, it doesn't work for the `template` property.

<code-example format="typescript" language="typescript">

// ERROR
export let someTemplate: string; // exported but not initialized

&commat;Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}

</code-example>

The compiler needs the value of the `template` property *right now* to generate the component factory.
The variable reference alone is insufficient.
Prefixing the declaration with `export` merely produces a new error, "[`Only initialized variables and constants can be referenced`](#only-initialized-variables)".

<a id="only-initialized-variables"></a>

## Only initialized variables and constants

<div class="alert is-helpful">

*Only initialized variables and constants can be referenced because the value of this variable is needed by the template compiler.*

</div>

The compiler found a reference to an exported variable or static field that wasn't initialized.
It needs the value of that variable to generate code.

The following example tries to set the component's `template` property to the value of the exported `someTemplate` variable which is declared but *unassigned*.

<code-example format="typescript" language="typescript">

// ERROR
export let someTemplate: string;

&commat;Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}

</code-example>

You'd also get this error if you imported `someTemplate` from some other module and neglected to initialize it there.

<code-example format="typescript" language="typescript">

// ERROR - not initialized there either
import { someTemplate } from './config';

&commat;Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}

</code-example>

The compiler cannot wait until runtime to get the template information.
It must statically derive the value of the `someTemplate` variable from the source code so that it can generate the component factory, which includes instructions for building the element based on the template.

To correct this error, provide the initial value of the variable in an initializer clause *on the same line*.

<code-example format="typescript" language="typescript">

// CORRECTED
export let someTemplate = '&lt;h1&gt;Greetings from Angular&lt;/h1&gt;';

&commat;Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}

</code-example>

<a id="reference-to-a-non-exported-class"></a>

## Reference to a non-exported class

<div class="alert is-helpful">

*Reference to a non-exported class `<class name>`.*
*Consider exporting the class.*

</div>

Metadata referenced a class that wasn't exported.

For example, you may have defined a class and used it as an injection token in a providers array but neglected to export that class.

<code-example format="typescript" language="typescript">

// ERROR
abstract class MyStrategy { }

  &hellip;
  providers: [
    { provide: MyStrategy, useValue: &hellip; }
  ]
  &hellip;

</code-example>

Angular generates a class factory in a separate module and that factory [can only access exported classes](guide/aot-compiler#exported-symbols).
To correct this error, export the referenced class.

<code-example format="typescript" language="typescript">

// CORRECTED
export abstract class MyStrategy { }

  &hellip;
  providers: [
    { provide: MyStrategy, useValue: &hellip; }
  ]
  &hellip;

</code-example>

<a id="reference-to-a-non-exported-function"></a>

## Reference to a non-exported function

<div class="alert is-helpful">

*Metadata referenced a function that wasn't exported.*

</div>

For example, you may have set a providers `useFactory` property to a locally defined function that you neglected to export.

<code-example format="typescript" language="typescript">

// ERROR
function myStrategy() { &hellip; }

  &hellip;
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  &hellip;

</code-example>

Angular generates a class factory in a separate module and that factory [can only access exported functions](guide/aot-compiler#exported-symbols).
To correct this error, export the function.

<code-example format="typescript" language="typescript">

// CORRECTED
export function myStrategy() { &hellip; }

  &hellip;
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  &hellip;

</code-example>

<a id="function-calls-not-supported"></a>

## Function calls are not supported

<div class="alert is-helpful">

*Function calls are not supported. Consider replacing the function or lambda with a reference to an exported function.*

</div>

The compiler does not currently support [function expressions or lambda functions](guide/aot-compiler#function-expression).
For example, you cannot set a provider's `useFactory` to an anonymous function or arrow function like this.

<code-example format="typescript" language="typescript">

// ERROR
  &hellip;
  providers: [
    { provide: MyStrategy, useFactory: function() { &hellip; } },
    { provide: OtherStrategy, useFactory: () =&gt; { &hellip; } }
  ]
  &hellip;

</code-example>

You also get this error if you call a function or method in a provider's `useValue`.

<code-example format="typescript" language="typescript">

// ERROR
import { calculateValue } from './utilities';

  &hellip;
  providers: [
    { provide: SomeValue, useValue: calculateValue() }
  ]
  &hellip;

</code-example>

To correct this error, export a function from the module and refer to the function in a `useFactory` provider instead.

<code-example format="typescript" language="typescript">

// CORRECTED
import { calculateValue } from './utilities';

export function myStrategy() { &hellip; }
export function otherStrategy() { &hellip; }
export function someValueFactory() {
  return calculateValue();
}
  &hellip;
  providers: [
    { provide: MyStrategy, useFactory: myStrategy },
    { provide: OtherStrategy, useFactory: otherStrategy },
    { provide: SomeValue, useFactory: someValueFactory }
  ]
  &hellip;

</code-example>

<a id="destructured-variable-not-supported"></a>

## Destructured variable or constant not supported

<div class="alert is-helpful">

*Referencing an exported destructured variable or constant is not supported by the template compiler. Consider simplifying this to avoid destructuring.*

</div>

The compiler does not support references to variables assigned by [destructuring](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#destructuring).

For example, you cannot write something like this:

<code-example format="typescript" language="typescript">

// ERROR
import { configuration } from './configuration';

// destructured assignment to foo and bar
const {foo, bar} = configuration;
  &hellip;
  providers: [
    {provide: Foo, useValue: foo},
    {provide: Bar, useValue: bar},
  ]
  &hellip;

</code-example>

To correct this error, refer to non-destructured values.

<code-example format="typescript" language="typescript">

// CORRECTED
import { configuration } from './configuration';
  &hellip;
  providers: [
    {provide: Foo, useValue: configuration.foo},
    {provide: Bar, useValue: configuration.bar},
  ]
  &hellip;

</code-example>

<a id="could-not-resolve-type"></a>

## Could not resolve type

<div class="alert is-helpful">

*The compiler encountered a type and can't determine which module exports that type.*

</div>

This can happen if you refer to an ambient type.
For example, the `Window` type is an ambient type declared in the global `.d.ts` file.

You'll get an error if you reference it in the component constructor, which the compiler must statically analyze.

<code-example format="typescript" language="typescript">

// ERROR
&commat;Component({ })
export class MyComponent {
  constructor (private win: Window) { &hellip; }
}

</code-example>

TypeScript understands ambient types so you don't import them.
The Angular compiler does not understand a type that you neglect to export or import.

In this case, the compiler doesn't understand how to inject something with the `Window` token.

Do not refer to ambient types in metadata expressions.

If you must inject an instance of an ambient type,
you can finesse the problem in four steps:

1.  Create an injection token for an instance of the ambient type.
1.  Create a factory function that returns that instance.
1.  Add a `useFactory` provider with that factory function.
1.  Use `@Inject` to inject the instance.

Here's an illustrative example.

<code-example format="typescript" language="typescript">

// CORRECTED
import { Inject } from '&commat;angular/core';

export const WINDOW = new InjectionToken('Window');
export function _window() { return window; }

&commat;Component({
  &hellip;
  providers: [
    { provide: WINDOW, useFactory: _window }
  ]
})
export class MyComponent {
  constructor (&commat;Inject(WINDOW) private win: Window) { &hellip; }
}

</code-example>

The `Window` type in the constructor is no longer a problem for the compiler because it
uses the `@Inject(WINDOW)` to generate the injection code.

Angular does something similar with the `DOCUMENT` token so you can inject the browser's `document` object \(or an abstraction of it, depending upon the platform in which the application runs\).

<code-example format="typescript" language="typescript">

import { Inject }   from '&commat;angular/core';
import { DOCUMENT } from '&commat;angular/common';

&commat;Component({ &hellip; })
export class MyComponent {
  constructor (&commat;Inject(DOCUMENT) private doc: Document) { &hellip; }
}

</code-example>

<a id="name-expected"></a>

## Name expected

<div class="alert is-helpful">

*The compiler expected a name in an expression it was evaluating.*

</div>

This can happen if you use a number as a property name as in the following example.

<code-example format="typescript" language="typescript">

// ERROR
provider: [{ provide: Foo, useValue: { 0: 'test' } }]

</code-example>

Change the name of the property to something non-numeric.

<code-example format="typescript" language="typescript">

// CORRECTED
provider: [{ provide: Foo, useValue: { '0': 'test' } }]

</code-example>

<a id="unsupported-enum-member-name"></a>

## Unsupported enum member name

<div class="alert is-helpful">

*Angular couldn't determine the value of the [enum member](https://www.typescriptlang.org/docs/handbook/enums.html) that you referenced in metadata.*

</div>

The compiler can understand simple enum values but not complex values such as those derived from computed properties.

<code-example format="typescript" language="typescript">

// ERROR
enum Colors {
  Red = 1,
  White,
  Blue = "Blue".length // computed
}

  &hellip;
  providers: [
    { provide: BaseColor,   useValue: Colors.White } // ok
    { provide: DangerColor, useValue: Colors.Red }   // ok
    { provide: StrongColor, useValue: Colors.Blue }  // bad
  ]
  &hellip;

</code-example>

Avoid referring to enums with complicated initializers or computed properties.

<a id="tagged-template-expressions-not-supported"></a>

## Tagged template expressions are not supported

<div class="alert is-helpful">

*Tagged template expressions are not supported in metadata.*

</div>

The compiler encountered a JavaScript ES2015 [tagged template expression](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals) such as the following.

<code-example format="typescript" language="typescript">

// ERROR
const expression = 'funky';
const raw = String.raw`A tagged template &dollar;{expression} string`;
 &hellip;
 template: '&lt;div&gt;' + raw + '&lt;/div&gt;'
 &hellip;

</code-example>

[`String.raw()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/raw) is a *tag function* native to JavaScript ES2015.

The AOT compiler does not support tagged template expressions; avoid them in metadata expressions.

<a id="symbol-reference-expected"></a>

## Symbol reference expected

<div class="alert is-helpful">

*The compiler expected a reference to a symbol at the location specified in the error message.*

</div>

This error can occur if you use an expression in the `extends` clause of a class.

<!--todo: Chuck: After reviewing your PR comment I'm still at a loss. See [comment there](https://github.com/angular/angular/pull/17712#discussion_r132025495). -->

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
