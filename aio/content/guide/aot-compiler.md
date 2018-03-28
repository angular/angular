# The Ahead-of-Time (AOT) Compiler

The Angular Ahead-of-Time (AOT) compiler converts your Angular HTML and TypeScript code into efficient JavaScript code during the build phase _before_ the browser downloads and runs that code.

This guide explains how to build with the AOT compiler using different compiler options and how to write Angular metadata that AOT can compile.

<div class="l-sub-section">

  <a href="https://www.youtube.com/watch?v=kW9cJsvcsGo">Watch compiler author Tobias Bosch explain the Angular Compiler</a> at AngularConnect 2016.

</div>

{@a overview}

## Angular compilation

An Angular application consists largely of components and their HTML templates.
Before the browser can render the application,
the components and templates must be converted to executable JavaScript by an _Angular compiler_.

Angular offers two ways to compile your application:

1. **_Just-in-Time_ (JIT)**, which compiles your app in the browser at runtime
1. **_Ahead-of-Time_ (AOT)**, which compiles your app at build time.

JIT compilation is the default when you run the _build-only_ or the _build-and-serve-locally_ CLI commands:

<code-example language="sh" class="code-shell">
  ng build
  ng serve
</code-example>

{@a compile}

For AOT compilation, append the `--aot` flags to the _build-only_ or the _build-and-serve-locally_ CLI commands:

<code-example language="sh" class="code-shell">
  ng build --aot
  ng serve --aot
</code-example>

<div class="l-sub-section">

The `--prod` meta-flag compiles with AOT by default.

See the [CLI documentation](https://github.com/angular/angular-cli/wiki) for details, especially the [`build` topic](https://github.com/angular/angular-cli/wiki/build).

</div>

{@a why-aot}

## Why compile with AOT?

*Faster rendering*

With AOT, the browser downloads a pre-compiled version of the application.
The browser loads executable code so it can render the application immediately, without waiting to compile the app first.

*Fewer asynchronous requests*

The compiler _inlines_ external HTML templates and CSS style sheets within the application JavaScript,
eliminating separate ajax requests for those source files.

*Smaller Angular framework download size*

There's no need to download the Angular compiler if the app is already compiled.
The compiler is roughly half of Angular itself, so omitting it dramatically reduces the application payload.

*Detect template errors earlier*

The AOT compiler detects and reports template binding errors during the build step
before users can see them.

*Better security*

AOT compiles HTML templates and components into JavaScript files long before they are served to the client.
With no templates to read and no risky client-side HTML or JavaScript evaluation,
there are fewer opportunities for injection attacks.

{@a compiler-options}

## Angular Compiler Options

You can control your app compilation by providing template compiler options in the `tsconfig.json` file along with the options supplied to the TypeScript compiler. The template compiler options are specified as members of
`"angularCompilerOptions"` object as shown below:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    ...
  },
  "angularCompilerOptions": {
    "fullTemplateTypeCheck": true,
    "preserveWhitespaces": true,
    ...
  }
}
```

### *skipMetadataEmit*

This option tells the compiler not to produce `.metadata.json` files.
The option is `false` by default.

`.metadata.json` files contain infomration needed by the template compiler from a `.ts`
file that is not included in the `.d.ts` file produced by the TypeScript compiler. This information contains,
for example, the content of annotations (such as a component's template) which TypeScript
emits to the `.js` file but not to the `.d.ts` file.

This option should be set to `true` if using TypeScript's `--outFile` option, as the metadata files
are not valid for this style of TypeScript output. It is not recommeded to use `--outFile` with
Angular. Use a bundler, such as [webpack](https://webpack.js.org/), instead.

This option can also be set to `true` when using factory summaries as the factory summaries
include a copy of the information that is in the `.metadata.json` file.

### *strictMetadataEmit*

This option tells the template compiler to report an error to the `.metadata.json`
file if `"skipMetadataEmit"` is `false` . This option is `false` by default. This should only be used when `"skipMetadataEmit"` is `false` and `"skipTemplateCodeGen"` is `true`.

It is intended to validate the `.metadata.json` files emitted for bundling with an `npm` package. The validation is overly strict and can emit errors for metadata that would never produce an error when used by the template compiler. You can choose to suppress the error emitted by this option for an exported symbol by including `@dynamic` in the comment documenting the symbol.

It is valid for `.metadata.json` files to contain errors. The template compiler reports these errors
if the metadata is used to determine the contents of an annotation. The metadata
collector cannot predict the symbols that are designed to use in an annotation, so it will preemptively
include error nodes in the metadata for the exported symbols. The template compiler can then use the error
nodes to report an error if these symbols are used. If the client of a library intends to use a symbol in an annotation, the template compiler will not normally report
this until the client uses the symbol. This option allows detecting these errors during the build phase of
the library and is used, for example, in producing Angular libraries themselves.

### *skipTemplateCodegen*

This option tells the compiler to suppress emitting `.ngfactory.js` and `.ngstyle.js` files. When set,
this turns off most of the template compiler and disables reporting template diagnostics.
This option can be used to instruct the
template compiler to produce `.metadata.json` files for distribution with an `npm` package while
avoiding the production of `.ngfactory.js` and `.ngstyle.js` files that cannot be distributed to
`npm`.

### *strictInjectionParameters*

When set to `true`, this options tells the compiler to report an error for a parameter supplied
whose injection type cannot be determined. When this value option is not provided or is `false`, constructor parameters of classes marked with `@Injectable` whose type cannot be resolved will
produce a warning.

*Note*: It is recommended to change this option explicitly to `true` as this option will default to `true` in the future.

### *flatModuleOutFile*

When set to `true`, this option tells the template compiler to generate a flat module
index of the given file name and the corresponding flat module metadata. Use this option when creating
flat modules that are packaged similarly to `@angular/core` and `@angular/common`. When this option
is used, the `package.json` for the library should refer
to the generated flat module index instead of the library index file. With this
option only one `.metadata.json` file is produced that contains all the metadata necessary
for symbols exported from the library index. In the generated `.ngfactory.js` files, the flat
module index is used to import symbols that includes both the public API from the library index
as well as shrowded internal symbols.

By default the `.ts` file supplied in the `files` field is assumed to be library index.
If more than one `.ts` file is specified, `libraryIndex` is used to select the file to use.
If more than one `.ts` file is supplied without a `libraryIndex`, an error is produced. A flat module
index `.d.ts` and `.js` will be created with the given `flatModuleOutFile` name in the same
location as the library index `.d.ts` file. For example, if a library uses
`public_api.ts` file as the library index of the module, the `tsconfig.json` `files` field
would be `["public_api.ts"]`. The `flatModuleOutFile` options could then be set to, for
example `"index.js"`, which produces `index.d.ts` and  `index.metadata.json` files. The
library's `package.json`'s `module` field would be `"index.js"` and the `typings` field
would be `"index.d.ts"`.

### *flatModuleId*

This option specifies the preferred module id to use for importing a flat module.
References generated by the template compiler will use this module name when importing symbols
from the flat module.
This is only meaningful when `flatModuleOutFile` is also supplied. Otherwise the compiler ignores
this option.

### *generateCodeForLibraries*

This option tells the template compiler to generate factory files (`.ngfactory.js` and `.ngstyle.js`)
for `.d.ts` files with a corresponding `.metadata.json` file. This option defaults to
`true`. When this option is `false`, factory files are generated only for `.ts` files.

This option should be set to `false` when using factory summaries.

### *fullTemplateTypeCheck*

This option tells the compiler to enable the [binding expression validation](#binding-expression-validation)
phase of the template compiler which uses TypeScript to validate binding expressions.

This option is `false` by default.

*Note*: It is recommended to set this to `true` as this option will default to `true` in the future.

### *annotateForClosureCompiler*

This option tells the compiler to use [Tsickle](https://github.com/angular/tsickle) to annotate the emitted
JavaScript with [JsDoc](http://usejsdoc.org/) comments needed by the
[Closure Compiler](https://github.com/google/closure-compiler). This option defaults to `false`.

### *annotationsAs*

Use this option to modify how the Angular specific annotations are emitted to improve tree-shaking. Non-Angular
annotations and decorators are unaffected. Default is `static fields`.

value           | description
----------------|-------------------------------------------------------------
`decorators`    | Leave the Decorators in-place. This makes compilation faster. TypeScript will emit calls to the __decorate helper.  Use `--emitDecoratorMetadata` for runtime reflection.  However, the resulting code will not properly tree-shake.
`static fields` | Replace decorators with a static field in the class. Allows advanced tree-shakers like [Closure Compiler](https://github.com/google/closure-compiler) to remove unused classes.

### *trace*

This tells the compiler to print extra information while compiling templates.

### *disableExpressionLowering*

The Angular template compiler transforms code that is used, or could be used, in an annotation
to allow it to be imported from template factory modules. See
[metadata rewriting](#metadata-rewriting) for more information.

Setting this option to `false` disables this rewriting, requiring the rewriting to be
done manually.

### *preserveWhitespaces*

This option tells the compiler whether to remove blank text nodes from compiled templates.
As of v6, this option is `false` by default, which results in smaller emitted template factory modules.

### *allowEmptyCodegenFiles*

Tells the compiler to generate all the possible generated files even if they are empty. This option is
`false` by default. This is an option used by `bazel` build rules and is needed to simplify
how `bazel` rules track file dependencies. It is not recommended to use this option outside of the `bazel`
rules.

  ### *enableIvy*

  Tells the compiler to generate definitions using the Render3 style code generation. This option defaults to `false`.

  Not all features are supported with this option enabled. It is only supported
  for experimentation and testing of Render3 style code generation.

  *Note*: Is it not recommended to use this option as it is not yet feature complete with the Render2 code generation.


## Angular Metadata and AOT

The Angular **AOT compiler** extracts and interprets **metadata** about the parts of the application that Angular is supposed to manage.

Angular metadata tells Angular how to construct instances of your application classes and interact with them at runtime.

You specify the metadata with **decorators** such as `@Component()` and `@Input()`.
You also specify metadata implicitly in the constructor declarations of these decorated classes.

In the following example, the `@Component()` metadata object and the class constructor tell Angular how to create and display an instance of `TypicalComponent`.

```typescript
@Component({
  selector: 'app-typical',
  template: '<div>A typical component for {{data.name}}</div>'
)}
export class TypicalComponent {
  @Input() data: TypicalData;
  constructor(private someService: SomeService) { ... }
}
```

The Angular compiler extracts the metadata _once_ and generates a _factory_ for `TypicalComponent`.
When it needs to create a `TypicalComponent` instance, Angular calls the factory, which produces a new visual element, bound to a new instance of the component class with its injected dependency.

## Metadata restrictions

You write metadata in a _subset_ of TypeScript that must conform to the following general constraints:

1. Limit [expression syntax](#expression-syntax) to the supported subset of JavaScript.
2. Only reference exported symbols after [code folding](#folding).
3. Only call [functions supported](#supported-functions) by the compiler.
4. Decorated and data-bound class members must be public.

The next sections elaborate on these points.

## How AOT works

It helps to think of the AOT compiler as having two phases: a code analysis phase in which it simply records a representation of the source; and a code generation phase in which the compiler's `StaticReflector` handles the interpretation as well as places restrictions on what it interprets.

## Phase 1: analysis

The TypeScript compiler does some of the analytic work of the first phase. It emits the `.d.ts` _type definition files_ with type information that the AOT compiler needs to generate application code.

At the same time, the AOT **_collector_** analyzes the metadata recorded in the Angular decorators and outputs metadata information in **`.metadata.json`** files, one per `.d.ts` file.

You can think of `.metadata.json` as a diagram of the overall structure of a decorator's metadata, represented as an [abstract syntax tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree).

<div class="l-sub-section">

Angular's [schema.ts](https://github.com/angular/angular/blob/master/packages/compiler-cli/src/metadata/schema.ts)
describes the JSON format as a collection of TypeScript interfaces.

</div>

{@a expression-syntax}
### Expression syntax

The _collector_ only understands a subset of JavaScript.
Define metadata objects with the following limited syntax:

Syntax                             | Example
-----------------------------------|-----------------------------------
Literal object                     | `{cherry: true, apple: true, mincemeat: false}`
Literal array                      | `['cherries', 'flour', 'sugar']`
Spread in literal array            | `['apples', 'flour', ...the_rest]`
Calls                              | `bake(ingredients)`
New                                | `new Oven()`
Property access                    | `pie.slice`
Array index                        | `ingredients[0]`
Identifier reference               | `Component`
A template string                  | <code>&#96;pie is ${multiplier} times better than cake&#96;</code>
Literal string                     | `'pi'`
Literal number                     | `3.14153265`
Literal boolean                    | `true`
Literal null                       | `null`
Supported prefix operator          | `!cake`
Supported Binary operator          | `a + b`
Conditional operator               | `a ? b : c`
Parentheses                        | `(a + b)`

If an expression uses unsupported syntax, the _collector_ writes an error node to the `.metadata.json` file. The compiler later reports the error if it needs that
piece of metadata to generate the application code.

<div class="l-sub-section">

 If you want `ngc` to report syntax errors immediately rather than produce a `.metadata.json` file with errors, set the `strictMetadataEmit` option in `tsconfig`.

```
  "angularCompilerOptions": {
   ...
   "strictMetadataEmit" : true
 }
 ```

Angular libraries have this option to ensure that all Angular `.metadata.json` files are clean and it is a best practice to do the same when building your own libraries.

</div>

{@a function-expression}
{@a arrow-functions}
### No arrow functions

The AOT compiler does not support [function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function)
and [arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions), also called _lambda_ functions.

Consider the following component decorator:

```typescript
@Component({
  ...
  providers: [{provide: server, useFactory: () => new Server()}]
})
```

The AOT _collector_ does not support the arrow function, `() => new Server()`, in a metadata expression.
It generates an error node in place of the function.

When the compiler later interprets this node, it reports an error that invites you to turn the arrow function into an _exported function_.

You can fix the error by converting to this:

```typescript
export function serverFactory() {
  return new Server();
}

@Component({
  ...
  providers: [{provide: server, useFactory: serverFactory}]
})
```

Beginning in version 5, the compiler automatically performs this rewriting while emitting the `.js` file.

{@a function-calls}
### Limited function calls

The _collector_ can represent a function call or object creation with `new` as long as the syntax is valid. The _collector_ only cares about proper syntax.

But beware. The compiler may later refuse to generate a call to a _particular_ function or creation of a _particular_ object.
The compiler only supports calls to a small set of functions and will use `new` for only a few designated classes. These functions and classes are in a table of [below](#supported-functions).


### Folding
{@a exported-symbols}
The compiler can only resolve references to **_exported_** symbols.
Fortunately, the _collector_ enables limited use of non-exported symbols through _folding_.

The _collector_ may be able to evaluate an expression during collection and record the result in the `.metadata.json` instead of the original expression.

For example, the _collector_ can evaluate the expression `1 + 2 + 3 + 4` and replace it with the result, `10`.

This process is called _folding_. An expression that can be reduced in this manner is _foldable_.

{@a var-declaration}
The collector can evaluate references to
module-local `const` declarations and initialized `var` and `let` declarations, effectively removing them from the `.metadata.json` file.

Consider the following component definition:

```typescript
const template = '<div>{{hero.name}}</div>';

@Component({
  selector: 'app-hero',
  template: template
})
export class HeroComponent {
  @Input() hero: Hero;
}
```

The compiler could not refer to the `template` constant because it isn't exported.

But the _collector_ can _fold_ the `template` constant into the metadata definition by inlining its contents.
The effect is the same as if you had written:

```typescript
@Component({
  selector: 'app-hero',
  template: '<div>{{hero.name}}</div>'
})
export class HeroComponent {
  @Input() hero: Hero;
}
```

There is no longer a reference to `template` and, therefore, nothing to trouble the compiler when it later interprets the _collector's_ output in `.metadata.json`.

You can take this example a step further by including the `template` constant in another expression:

```typescript
const template = '<div>{{hero.name}}</div>';

@Component({
  selector: 'app-hero',
  template: template + '<div>{{hero.title}}</div>'
})
export class HeroComponent {
  @Input() hero: Hero;
}
```

The _collector_ reduces this expression to its equivalent _folded_ string:

`'<div>{{hero.name}}</div><div>{{hero.title}}</div>'`.

#### Foldable syntax

The following table describes which expressions the _collector_ can and cannot fold:

Syntax                             | Foldable
-----------------------------------|-----------------------------------
Literal object                     | yes
Literal array                      | yes
Spread in literal array            | no
Calls                              | no
New                                | no
Property access                    | yes, if target is foldable
Array index                        | yes, if target and index are foldable
Identifier reference               | yes, if it is a reference to a local
A template with no substitutions   | yes
A template with substitutions      | yes, if the substitutions are foldable
Literal string                     | yes
Literal number                     | yes
Literal boolean                    | yes
Literal null                       | yes
Supported prefix operator          | yes, if operand is foldable
Supported binary operator          | yes, if both left and right are foldable
Conditional operator               | yes, if condition is foldable
Parentheses                        | yes, if the expression is foldable

If an expression is not foldable, the collector writes it to `.metadata.json` as an [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) for the compiler to resolve.


## Phase 2: code generation

The _collector_ makes no attempt to understand the metadata that it collects and outputs to `.metadata.json`. It represents the metadata as best it can and records errors when it detects a metadata syntax violation.

It's the compiler's job to interpret the `.metadata.json` in the code generation phase.

The compiler understands all syntax forms that the _collector_ supports, but it may reject _syntactically_ correct metadata if the _semantics_ violate compiler rules.

The compiler can only reference _exported symbols_.

Decorated component class members must be public. You cannot make an `@Input()` property private or internal.

Data bound properties must also be public.

```typescript
// BAD CODE - title is private
@Component({
  selector: 'app-root',
  template: '<h1>{{title}}</h1>'
})
export class AppComponent {
  private title = 'My App'; // Bad
}
```

{@a supported-functions}
Most importantly, the compiler only generates code to create instances of certain classes, support certain decorators, and call certain functions from the following lists.


### New instances

The compiler only allows metadata that create instances of the class `InjectionToken` from `@angular/core`.

### Annotations/Decorators

The compiler only supports metadata for these Angular decorators.

Decorator         | Module
------------------|--------------
`Attribute`       | `@angular/core`
`Component`       | `@angular/core`
`ContentChild`    | `@angular/core`
`ContentChildren` | `@angular/core`
`Directive`       | `@angular/core`
`Host`            | `@angular/core`
`HostBinding`     | `@angular/core`
`HostListener`    | `@angular/core`
`Inject`          | `@angular/core`
`Injectable`      | `@angular/core`
`Input`           | `@angular/core`
`NgModule`        | `@angular/core`
`Optional`        | `@angular/core`
`Output`          | `@angular/core`
`Pipe`            | `@angular/core`
`Self`            | `@angular/core`
`SkipSelf`        | `@angular/core`
`ViewChild`       | `@angular/core`


### Macro-functions and macro-static methods

The compiler also supports _macros_ in the form of functions or static
methods that return an expression.

For example, consider the following function:

```typescript
export function wrapInArray<T>(value: T): T[] {
  return [value];
}
```

You can call the `wrapInArray` in a metadata definition because it returns the value of an expression that conforms to the compiler's restrictive JavaScript subset.

You might use  `wrapInArray()` like this:

```typescript
@NgModule({
  declarations: wrapInArray(TypicalComponent)
})
export class TypicalModule {}
```

The compiler treats this usage as if you had written:

```typescript
@NgModule({
  declarations: [TypicalComponent]
})
export class TypicalModule {}
```

The collector is simplistic in its determination of what qualifies as a macro
function; it can only contain a single `return` statement.

The Angular [`RouterModule`](api/router/RouterModule) exports two macro static methods, `forRoot` and `forChild`, to help declare root and child routes.
Review the [source code](https://github.com/angular/angular/blob/master/packages/router/src/router_module.ts#L139 "RouterModule.forRoot source code")
for these methods to see how macros can simplify configuration of complex [NgModules](guide/ngmodules).

{@a metadata-rewriting}

### Metadata rewriting

The compiler treats object literals containing the fields `useClass`, `useValue`, `useFactory`, and `data` specially. The compiler converts the expression initializing one of these fields into an exported variable, which replaces the expression. This process of rewriting these expressions removes all the restrictions on what can be in them because
the compiler doesn't need to know the expression's value&mdash;it just needs to be able to generate a reference to the value.



You might write something like:

```typescript
class TypicalServer {

}

@NgModule({
  providers: [{provide: SERVER, useFactory: () => TypicalServer}]
})
export class TypicalModule {}
```

Without rewriting, this would be invalid because lambdas are not supported and `TypicalServer` is not exported.

To allow this, the compiler automatically rewrites this to something like:

```typescript
class TypicalServer {

}

export const ɵ0 = () => new TypicalServer();

@NgModule({
  providers: [{provide: SERVER, useFactory: ɵ0}]
})
export class TypicalModule {}
```

This allows the compiler to generate a reference to `ɵ0` in the
factory without having to know what the value of `ɵ0` contains.

The compiler does the rewriting during the emit of the `.js` file. This doesn't rewrite the `.d.ts` file, however, so TypeScript doesn't recognize it as being an export. Thus, it does not pollute the ES module's exported API.


## Metadata Errors

The following are metadata errors you may encounter, with explanations and suggested corrections.

[Expression form not supported](#expression-form-not-supported)<br>
[Reference to a local (non-exported) symbol](#reference-to-a-local-symbol)<br>
[Only initialized variables and constants](#only-initialized-variables)<br>
[Reference to a non-exported class](#reference-to-a-non-exported-class)<br>
[Reference to a non-exported function](#reference-to-a-non-exported-function)<br>
[Function calls are not supported](#function-calls-not-supported)<br>
[Destructured variable or constant not supported](#destructured-variable-not-supported)<br>
[Could not resolve type](#could-not-resolve-type)<br>
[Name expected](#name-expected)<br>
[Unsupported enum member name](#unsupported-enum-member-name)<br>
[Tagged template expressions are not supported](#tagged-template-expressions-not-supported)<br>
[Symbol reference expected](#symbol-reference-expected)<br>

<hr>

<h3 class="no-toc">Expression form not supported</h3>

The compiler encountered an expression it didn't understand while evaluating Angular metadata.

Language features outside of the compiler's [restricted expression syntax](#expression-syntax)
can produce this error, as seen in the following example:

```
// ERROR
export class Fooish { ... }
...
const prop = typeof Fooish; // typeof is not valid in metadata
  ...
  // bracket notation is not valid in metadata
  { provide: 'token', useValue: { [prop]: 'value' } };
  ...
```

You can use `typeof` and bracket notation in normal application code.
You just can't use those features within expressions that define Angular metadata.

Avoid this error by sticking to the compiler's [restricted expression syntax](#expression-syntax)
when writing Angular metadata
and be wary of new or unusual TypeScript features.

<hr>

{@a reference-to-a-local-symbol}
<h3 class="no-toc">Reference to a local (non-exported) symbol</h3>

<div class="alert is-helpful">

_Reference to a local (non-exported) symbol 'symbol name'. Consider exporting the symbol._

</div>

The compiler encountered a referenced to a locally defined symbol that either wasn't exported or wasn't initialized.

Here's a `provider` example of the problem.

```
// ERROR
let foo: number; // neither exported nor initialized

@Component({
  selector: 'my-component',
  template: ... ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}
```
The compiler generates the component factory, which includes the `useValue` provider code, in a separate module. _That_ factory module can't reach back to _this_ source module to access the local (non-exported) `foo` variable.

You could fix the problem by initializing `foo`.

```
let foo = 42; // initialized
```

The compiler will [fold](#folding) the expression into the provider as if you had written this.

```
  providers: [
    { provide: Foo, useValue: 42 }
  ]
```

Alternatively, you can fix it by exporting `foo` with the expectation that `foo` will be assigned at runtime when you actually know its value.

```
// CORRECTED
export let foo: number; // exported

@Component({
  selector: 'my-component',
  template: ... ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}
```

Adding `export` often works for variables referenced in metadata such as `providers` and `animations` because the compiler can generate _references_ to the exported variables in these expressions. It doesn't need the _values_ of those variables.

Adding `export` doesn't work when the compiler needs the _actual value_
in order to generate code.
For example, it doesn't work for the `template` property.

```
// ERROR
export let someTemplate: string; // exported but not initialized

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

The compiler needs the value of the `template` property _right now_ to generate the component factory.
The variable reference alone is insufficient.
Prefixing the declaration with `export` merely produces a new error, "[`Only initialized variables and constants can be referenced`](#only-initialized-variables)".

<hr>

{@a only-initialized-variables}
<h3 class="no-toc">Only initialized variables and constants</h3>

<div class="alert is-helpful">

_Only initialized variables and constants can be referenced because the value of this variable is needed by the template compiler._

</div>

The compiler found a reference to an exported variable or static field that wasn't initialized.
It needs the value of that variable to generate code.

The following example tries to set the component's `template` property to the value of
the exported `someTemplate` variable which is declared but _unassigned_.

```
// ERROR
export let someTemplate: string;

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

You'd also get this error if you imported `someTemplate` from some other module and neglected to initialize it there.

```
// ERROR - not initialized there either
import { someTemplate } from './config';

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

The compiler cannot wait until runtime to get the template information.
It must statically derive the value of the `someTemplate` variable from the source code
so that it can generate the component factory, which includes
instructions for building the element based on the template.

To correct this error, provide the initial value of the variable in an initializer clause _on the same line_.

```
// CORRECTED
export let someTemplate = '<h1>Greetings from Angular</h1>';

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

<hr>

<h3 class="no-toc">Reference to a non-exported class</h3>

<div class="alert is-helpful">

_Reference to a non-exported class <class name>. Consider exporting the class._

</div>

Metadata referenced a class that wasn't exported.

For example, you may have defined a class and used it as an injection token in a providers array
but neglected to export that class.

```
// ERROR
abstract class MyStrategy { }

  ...
  providers: [
    { provide: MyStrategy, useValue: ... }
  ]
  ...
```

Angular generates a class factory in a separate module and that
factory [can only access exported classes](#exported-symbols).
To correct this error, export the referenced class.

```
// CORRECTED
export abstract class MyStrategy { }

  ...
  providers: [
    { provide: MyStrategy, useValue: ... }
  ]
  ...
```
<hr>

<h3 class="no-toc">Reference to a non-exported function</h3>

Metadata referenced a function that wasn't exported.

For example, you may have set a providers `useFactory` property to a locally defined function that you neglected to export.

```
// ERROR
function myStrategy() { ... }

  ...
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  ...
```

Angular generates a class factory in a separate module and that
factory [can only access exported functions](#exported-symbols).
To correct this error, export the function.

```
// CORRECTED
export function myStrategy() { ... }

  ...
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  ...
```
<hr>

{@a function-calls-not-supported}
<h3 class="no-toc">Function calls are not supported</h3>

<div class="alert is-helpful">

_Function calls are not supported. Consider replacing the function or lambda with a reference to an exported function._

</div>

The compiler does not currently support [function expressions or lambda functions](#function-expression).
For example, you cannot set a provider's `useFactory` to an anonymous function or arrow function like this.

```
// ERROR
  ...
  providers: [
    { provide: MyStrategy, useFactory: function() { ... } },
    { provide: OtherStrategy, useFactory: () => { ... } }
  ]
  ...
```
You also get this error if you call a function or method in a provider's `useValue`.
```
// ERROR
import { calculateValue } from './utilities';

  ...
  providers: [
    { provide: SomeValue, useValue: calculateValue() }
  ]
  ...
```

To correct this error, export a function from the module and refer to the function in a `useFactory` provider instead.

<code-example linenums="false">
// CORRECTED
import { calculateValue } from './utilities';

export function myStrategy() { ... }
export function otherStrategy() { ... }
export function someValueFactory() {
  return calculateValue();
}
  ...
  providers: [
    { provide: MyStrategy, useFactory: myStrategy },
    { provide: OtherStrategy, useFactory: otherStrategy },
    { provide: SomeValue, useFactory: someValueFactory }
  ]
  ...
</code-example>

<hr>

{@a destructured-variable-not-supported}
<h3 class="no-toc">Destructured variable or constant not supported</h3>

<div class="alert is-helpful">

_Referencing an exported destructured variable or constant is not supported by the template compiler. Consider simplifying this to avoid destructuring._

</div>

The compiler does not support references to variables assigned by [destructuring](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#destructuring).

For example, you cannot write something like this:

<code-example linenums="false">
// ERROR
import { configuration } from './configuration';

// destructured assignment to foo and bar
const {foo, bar} = configuration;
  ...
  providers: [
    {provide: Foo, useValue: foo},
    {provide: Bar, useValue: bar},
  ]
  ...
</code-example>

To correct this error, refer to non-destructured values.

<code-example linenums="false">
// CORRECTED
import { configuration } from './configuration';
  ...
  providers: [
    {provide: Foo, useValue: configuration.foo},
    {provide: Bar, useValue: configuration.bar},
  ]
  ...
</code-example>

<hr>

<h3 class="no-toc">Could not resolve type</h3>

The compiler encountered a type and can't determine which module exports that type.

This can happen if you refer to an ambient type.
For example, the `Window` type is an ambiant type declared in the global `.d.ts` file.

You'll get an error if you reference it in the component constructor,
which the compiler must statically analyze.

```
// ERROR
@Component({ })
export class MyComponent {
  constructor (private win: Window) { ... }
}
```
TypeScript understands ambiant types so you don't import them.
The Angular compiler does not understand a type that you neglect to export or import.

In this case, the compiler doesn't understand how to inject something with the `Window` token.

Do not refer to ambient types in metadata expressions.

If you must inject an instance of an ambiant type,
you can finesse the problem in four steps:

1. Create an injection token for an instance of the ambiant type.
1. Create a factory function that returns that instance.
1. Add a `useFactory` provider with that factory function.
1. Use `@Inject` to inject the instance.

Here's an illustrative example.

<code-example linenums="false">
// CORRECTED
import { Inject } from '@angular/core';

export const WINDOW = new InjectionToken('Window');
export function _window() { return window; }

@Component({
  ...
  providers: [
    { provide: WINDOW, useFactory: _window }
  ]
})
export class MyComponent {
  constructor (@Inject(WINDOW) private win: Window) { ... }
}
</code-example>

The `Window` type in the constructor is no longer a problem for the compiler because it
uses the `@Inject(WINDOW)` to generate the injection code.

Angular does something similar with the `DOCUMENT` token so you can inject the browser's `document` object (or an abstraction of it, depending upon the platform in which the application runs).

<code-example linenums="false">
import { Inject }   from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

@Component({ ... })
export class MyComponent {
  constructor (@Inject(DOCUMENT) private doc: Document) { ... }
}
</code-example>
<hr>

<h3 class="no-toc">Name expected</h3>

The compiler expected a name in an expression it was evaluating.
This can happen if you use a number as a property name as in the following example.

```
// ERROR
provider: [{ provide: Foo, useValue: { 0: 'test' } }]
```

Change the name of the property to something non-numeric.

```
// CORRECTED
provider: [{ provide: Foo, useValue: { '0': 'test' } }]
```

<hr>

<h3 class="no-toc">Unsupported enum member name</h3>

Angular couldn't determine the value of the [enum member](https://www.typescriptlang.org/docs/handbook/enums.html)
that you referenced in metadata.

The compiler can understand simple enum values but not complex values such as those derived from computed properties.

<code-example linenums="false">
// ERROR
enum Colors {
  Red = 1,
  White,
  Blue = "Blue".length // computed
}

  ...
  providers: [
    { provide: BaseColor,   useValue: Colors.White } // ok
    { provide: DangerColor, useValue: Colors.Red }   // ok
    { provide: StrongColor, useValue: Colors.Blue }  // bad
  ]
  ...
</code-example>

Avoid referring to enums with complicated initializers or computed properties.

<hr>

{@a tagged-template-expressions-not-supported}
<h3 class="no-toc">Tagged template expressions are not supported</h3>

<div class="alert is-helpful">

_Tagged template expressions are not supported in metadata._

</div>

The compiler encountered a JavaScript ES2015 [tagged template expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals) such as,
```
// ERROR
const expression = 'funky';
const raw = String.raw`A tagged template ${expression} string`;
 ...
 template: '<div>' + raw + '</div>'
 ...
```
[`String.raw()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw)
is a _tag function_ native to JavaScript ES2015.

The AOT compiler does not support tagged template expressions; avoid them in metadata expressions.

<hr>

<h3 class="no-toc">Symbol reference expected</h3>

The compiler expected a reference to a symbol at the location specified in the error message.

This error can occur if you use an expression in the `extends` clause of a class.

<!--

Chuck: After reviewing your PR comment I'm still at a loss. See [comment there](https://github.com/angular/angular/pull/17712#discussion_r132025495).

-->
{@a binding-expression-validation}

  ## Phase 3: binding expression validation

  In the validation phase, the Angular template compiler uses the TypeScript compiler to validate the
  binding expressions in templates. Enable this phase explicitly by adding the compiler
  option `"fullTemplateTypeCheck"` in the `"angularCompilerOptions"` of the project's `tsconfig.json` (see
  [Angular Compiler Options](#compiler-options)).

  Template validation produces error messages when a type error is detected in a template binding
  expression, similar to how type errors are reported by the TypeScript compiler against code in a `.ts`
  file.

  For example, consider the following component:

  ```typescript
  @Component({
    selector: 'my-component',
    template: '{{person.addresss.street}}'
  })
  class MyComponent {
    person?: Person;
  }
  ```

  This will produce the following error:

  ```
  my.component.ts.MyComponent.html(1,1): : Property 'addresss' does not exist on type 'Person'. Did you mean 'address'?
  ```

  The file name reported in the error message, `my.component.ts.MyComponent.html`, is a synthetic file
  generated by the template compiler that holds contents of the `MyComponent` class template.
  Compiler never writes this file to disk. The line and column numbers are relative to the template string
  in the `@Component` annotation of the class, `MyComponent` in this case. If a component uses
  `templateUrl` instead of `template`, the errors are reported in the HTML file referenced by the
  `templateUrl` instead of a synthetic file.

  The error location is the beginning of the text node that contains the interpolation expression with
  the error. If the error is in an attribute binding such as `[value]="person.address.street"`, the error
  location is the location of the attribute that contains the error.

  The validation uses the TypeScript type checker and the options supplied to the TypeScript compiler to control
  how detailed the type validation is. For example, if the `strictTypeChecks` is specified, the error  ```my.component.ts.MyComponent.html(1,1): : Object is possibly 'undefined'``` is reported as well as the above error message.

  ### Type narrowing

  The expression used in an `ngIf` directive is used to narrow type unions in the Angular
  template compiler, the same way the `if` expression does in TypeScript. For example, to avoid
  `Object is possibly 'undefined'` error in the template above, modify it to only emit the
  interpolation if the value of `person` is initialized as shown below:

  ```typescript
  @Component({
    selector: 'my-component',
    template: '<span *ngIf="person"> {{person.addresss.street}} </span>'
  })
  class MyComponent {
    person?: Person;
  }
  ```

  Using `*ngIf` allows the TypeScript compiler to infer that the `person` used in the
  binding expression will never be `undefined`.

  #### Custom `ngIf` like directives

  Directives that behave like `*ngIf` can declare that they want the same treatment by including
  a static member marker that is a signal to the template compiler to treat them
  like `*ngIf`. This static member for `*ngIf` is:

  ```typescript
    public static ngIfUseIfTypeGuard: void;
  ```

  This declares that the input property `ngIf` of the `NgIf` directive should be treated as a
  guard to the use of its template, implying that the template will only be instantiated if
  the `ngIf` input property is true.


  ### Non-null type assertion operator

  Use the [non-null type assertion operator](guide/template-syntax#non-null-assertion-operator)
  to suppress the `Object is possibly 'undefined'` error when it is incovienent to use
  `*ngIf` or when some constraint in the component ensures that the expression is always
  non-null when the binding expression is interpolated.

  In the following example, the `person` and `address` properties are always set together,
  implying that `address` is always non-null if `person` is non-null. There is no convenient
  way to describe this constraint to TypeScript and the template compiler, but the error
  is suppressed in the example by using `address!.street`.

  ```typescript
  @Component({
    selector: 'my-component',
    template: '<span *ngIf="person"> {{person.name}} lives on {{address!.street}} </span>'
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

  The non-null assertion operator should be used sparingly as refactoring of the component
  might break this constraint.

  In this example it is recommended to include the checking of `address`
  in the `*ngIf`as shown below:

  ```typescript
  @Component({
    selector: 'my-component',
    template: '<span *ngIf="person && address"> {{person.name}} lives on {{address.street}} </span>'
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

  ### Disabling type checking using `$any()`

  Disable checking of a binding expression by surrounding the expression
  in a call to the [`$any()` cast pseudo-function](guide/template-syntax).
  The compiler treats it as a cast to the `any` type just like in TypeScript when a `<any>`
  or `as any` cast is used.

  In the following example, the error `Property addresss does not exist` is suppressed
  by casting `person` to the `any` type.

  ```typescript
  @Component({
    selector: 'my-component',
    template: '{{$any(person).addresss.street}}'
  })
  class MyComponent {
    person?: Person;
  }
  ```
## Summary

* What the AOT compiler does and why it is important.
* Why metadata must be written in a subset of JavaScript.
* What that subset is.
* Other restrictions on metadata definition.
* Macro-functions and macro-static methods.
* Compiler errors related to metadata.
* Validation of binding expressions
