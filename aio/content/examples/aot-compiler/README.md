# AOT Mixin Demo

This app demonstrates a way to define Angular application components, using the mixin technique described in the 
[TS 2.2 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html)

This sample shows that, when compiled with JIT, the app discovers and executes mixed-in code.
But when compiled with AOT, the generated code is unaware of the mixed-in behaviors that depend upon Angular metadata.

The sample also provides an unpalatable workaround around the AOT problem.
We'd like to see an alternative that preserves the DX and
architectural benefits of mix-ins

## Code of interest

This demo hijacks the sample code from the documentation’s AOT Compiler guide.
That sample has some nice properties:
* Can demo an app in both AOT and JIT
* Simple build without the CLI and webpack complexity
* Documented in the guide page

To see source code for the mixin version, navigate to `~angular/aio/content/examples/aot-compiler/src`
(which is where this README resides).

The following is a walk through of the most interesting parts.

### `app.component.ts`

 Presents two components,
`MixedComponent` and `MixedShimComponent`.
They are intended to be identical except for their names.

They display:
* a title with the component name ("Bob Mix" and "Joe Shim" respectively).
* the result of calling the mixed-in `foo()` function
* a datagrid component (imagine something spectacular that is managed by mixin code)

The first is defined with mixins the way we think we want to do it. 
This component works in JIT but not AOT.

The second requires a workaround for AOT. 
It's undesireable because of its complexity and lack of encapsulation.

### `mixed.component.ts`

Defines `MixedComponent` with mix-ins fns from `mixins.ts`

For convenience, we create a local constant that's the anonymous class result of
the chain of mixin function calls.
_Then_ we base the component on that constant.

```
const demoMix = fooMixin(lcHookMixin(dgMixinDefault));
...
export class MixedComponent extends demoMix
```

FWIW, inlining the mixin function calls as follows makes no difference to the story. 
AOT still doesn't understand it.
```
export class MixedComponent extends fooMixin(lcHookMixin(dgMixinDefault))
```

The `MixedComponent` _should exhibit the mixed-in behavior_.
We should see the console output from the lifecycle hook methods.
We do see the console output when compiled with JIT 
but not when compiled with AOT.

### `mixed-shim.component.ts`

`MixedShimComponent` works around the problem by defining an intermediate "shim" class, `DemoMixShim`, based on the same mixin constant.

`DemoMixShim` overrides the properties and methods of the
composite mixin class _that matter to Angular_.
The override methods delegate to the inherited mixin methods.
The override properties repeat the inherited definition for the sole purpose of surfacing the Angular decorators.

Then the `MixedShimComponent` extends the `DemoMixShim` class.

>**The shim is the problem**
>
>It adds unwanted complexity.
>Worse, it breaks encapsulation by forcing the author of `MixedShimComponent` to become deeply aware of the mixin's Angular dependencies.
>
>These deficiencies are painfully obvious when you compare the two component files side-by-side.

### `mixins.ts`

This file defines the mix-ins for the app, based on the
technique described in the 
[TS 2.2 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html)

In that technique, you write a function for each mixin. 
The mixin function returns a class that extends some previous "base" class, perhaps the anonymous class product of another mixin function.

This module exports three mixins
* `fooMixin`
* `lcHookMixin`
* `dgMixin`

The `fooMixin` adds a `foo()` method to a class.
It's super simple. 
Angular doesn't care about it.
It works under AOT in both components.

The `lcHookMixin` adds `ngOnInit` and `ngOnDestroy` to the component.
This will be a common scenario.
Developers often standarize on these hooks.
I can imagine implementing our recommended `Observable.takeUntil` pattern with a mixin.

Unfortunately, AOT doesn't detect these mixed-in methods so we have to resort to the shim class in `MixedShimComponent`.

The `dgMixin` adds processing of the `DataGridComponent` that the outer component is presumed to display somewhere in its template.

This one is a bit tricky. 
We can't use decorators within a mixin (_sad face_) 
so we couldn't teach the mixin
to grab the `DataGridComponent` with the Angular `@ViewChild` decorator.

We got around that by defining a class whose sole purpose is to get the `DataGridComponent`.
Then we pass that to the invocation of `dgMixin`.
For convenience, we captured the result of that call in `dgMixinDefault`.

Unfortunately, AOT doesn't detect the `@ViewChild` or the `ngAfterViewInit` hook so we have to resort to the shim class in `MixedShimComponent`.

### `datagrid.component.ts`

A simplified version of a class that could do marvelous things
with data.

The `dgMixin` might have added logic to ease communication between the component and the datagrid.

### `index.html` and `index-jit.html`

We want to see the app running in both AOT and JIT in order to see the differences in compilation of mixins.

The `index.html` displays the AOT compiled version of the app.

The `index-jit.html` displays the JIT compiled version of the app.

## Build and run

As with any sample in angular/aio, you must setup the local build environment.

* `yarn` - install all the dependencies.
* `yarn setup` - Install all the dependencies, boilerplate, plunkers, zips and runs dgeni on the docs.

That's a one-time thing.

Then open a terminal on this directory (`~angular/aio/content/examples/aot-compiler`)
and run the commands that:

1. Compile with AOT and rollup
1. Compile with JIT (for comparison) and start the server

```
npm run build:aot
npm start
```
That launches the application in a browser that shows the AOT version (`index.html`).

### Inspect AOT version

Open the dev tools and look at the console. 
You'll see mixin output for the second, shimmed component but not the first, unshimmed component.

```
VM151 build.js:7 Running AOT compiled
VM151 build.js:7 initializing component for Joe Shim
VM151 build.js:7 The datagrid id is 2
VM151 build.js:3 Angular is running in the development mode. Call enableProdMode() to enable the production mode.
```

### Inspect the JIT version

Change the address bar so it looks at `index-jit.html`

```
http://localhost:3000/index-jit.html
```

In the console you'll see mixin output for BOTH the first (unshimmed) component and the second, shimmed component:

```
Running JIT compiled
mixins.ts:19 initializing component for Bob Mix
mixins.ts:19 initializing component for Joe Shim
mixins.ts:28 The datagrid id is 1
mixins.ts:28 The datagrid id is 2
core.umd.js:2957 Angular is running in the development mode. Call enableProdMode() to enable the production mode.
```