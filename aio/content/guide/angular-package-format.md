# Angular package format

This document describes the Angular Package Format \(APF\).
APF is an Angular specific specification for the structure and format of npm packages that is used by all first-party Angular packages \(`@angular/core`, `@angular/material`, etc.\) and most third-party Angular libraries.

APF enables a package to work seamlessly under most common scenarios that use Angular.
Packages that use APF are compatible with the tooling offered by the Angular team as well as wider JavaScript ecosystem.
It is recommended that third-party library developers follow the same npm package format.

<div class="alert is-helpful">

APF is versioned along with the rest of Angular, and every major version improves the package format.
You can find the versions of the specification prior to v13 in this [google doc](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview).

</div>

## Why specify a package format?

In today's JavaScript landscape, developers consume packages in many different ways, using many different toolchains \(Webpack, rollup, esbuild, etc.\).
These tools may understand and require different inputs - some tools may be able to process the latest ES language version, while others may benefit from directly consuming an older ES version.

The Angular distribution format supports all of the commonly used development tools and workflows, and adds emphasis on optimizations that result either in smaller application payload size or faster development iteration cycle \(build time\).

Developers can rely on Angular CLI and [ng-packagr](https://github.com/ng-packagr/ng-packagr) \(a build tool Angular CLI uses\) to produce packages in the Angular package format.
See the [Creating Libraries](guide/creating-libraries) guide for more details.

## File layout

The following example shows a simplified version of the `@angular/core` package's file layout, with an explanation for each file in the package.

<div class='filetree'>
    <div class='file'>
      node_modules/@angular/core
    </div>
    <div class='children'>
        <div class='file'>
          README.md &nbsp; <!-- // &lt;-- Package README, used by npmjs web UI. -->
        </div>
        <div class='file'>
          package.json &nbsp; <!-- // &lt;-- Primary package.json, describing the package itself as well as all available entrypoints and code formats. This file contains the "exports" mapping used by runtimes and tools to perform module resolution. -->
        </div>
        <div class='file'>
          index.d.ts &nbsp; <!-- // &lt;-- Bundled .d.ts for the primary entrypoint &commat;angular/core. -->
        </div>
        <div class='file'>
          esm2022 &nbsp; <!-- // &lt;-- Tree of &commat;angular/core sources in unflattened ES2022 format. -->
        </div>
        <div class='children'>
            <div class='file'>
              core.mjs
            </div>
            <div class='file'>
              index.mjs
            </div>
            <div class='file'>
              public_api.mjs
            </div>
            <div class='file'>
              testing &nbsp; <!-- // &lt;-- Tree of the &commat;angular/core/testing entrypoint in unflattened ES2022 format. -->
            </div>
        </div>
        <div class='file'>
          fesm2022 &nbsp; <!-- // &lt;-- Code for all entrypoints in flattened \(FESM\) ES2022 format, along with sourcemaps. -->
        </div>
        <div class='children'>
            <div class='file'>
              core.mjs
            </div>
            <div class='file'>
              core.mjs.map
            </div>
            <div class='file'>
              testing.mjs
            </div>
            <div class='file'>
              testing.mjs.map
            </div>
        </div>
        <div class='file'>
          testing &nbsp; <!-- // &lt;-- Directory representing the "testing" entrypoint. -->
        </div>
        <div class='children'>
            <div class='file'>
              index.d.ts &nbsp; <!-- // &lt;-- Bundled .d.ts for the &commat;angular/core/testing entrypoint. -->
            </div>
        </div>
    </div>
</div>

This table describes the file layout under `node_modules/@angular/core` annotated to describe the purpose of files and directories:

| Files                                                                                                                                                     | Purpose |
|:---                                                                                                                                                       |:---     |
| `README.md`                                                                                                                                               | Package README, used by npmjs web UI.                                                                                                                                                                          |
| `package.json`                                                                                                                                            | Primary `package.json`, describing the package itself as well as all available entrypoints and code formats. This file contains the "exports" mapping used by runtimes and tools to perform module resolution. |
| `index.d.ts`                                                                                                                                               | Bundled `.d.ts` for the primary entrypoint `@angular/core`.                                                                                                                                                    |
| `esm2022/` <br /> &nbsp;&nbsp;─ `core.mjs` <br /> &nbsp;&nbsp;─ `index.mjs` <br /> &nbsp;&nbsp;─ `public_api.mjs`                                         | Tree of `@angular/core` sources in unflattened ES2022 format.                                                                                                                                                  |
| `esm2022/testing/`                                                                                                                                        | Tree of the `@angular/core/testing` entrypoint in unflattened ES2022 format.                                                                                                                                   |
| `fesm2022/` <br /> &nbsp;&nbsp;─ `core.mjs` <br /> &nbsp;&nbsp;─ `core.mjs.map` <br /> &nbsp;&nbsp;─ `testing.mjs` <br /> &nbsp;&nbsp;─ `testing.mjs.map` | Code for all entrypoints in flattened \(FESM\) ES2022 format, along with source maps.                                                                                                                           |
| `testing/`                                                                                                                                                | Directory representing the "testing" entrypoint.                                                                                                                                                               |
| `testing/index.d.ts`                                                                                                                                    | Bundled `.d.ts` for the `@angular/core/testing` entrypoint.                                                                                                                                                     |

## `package.json`

The primary `package.json` contains important package metadata, including the following:

*   It [declares](#esm-declaration) the package to be in EcmaScript Module \(ESM\) format
*   It contains an [`"exports"` field](#exports) which defines the available source code formats of all entrypoints
*   It contains [keys](#legacy-resolution-keys) which define the available source code formats of the primary `@angular/core` entrypoint, for tools which do not understand `"exports"`.
    These keys are considered deprecated, and could be removed as the support for `"exports"` rolls out across the ecosystem.

*   It declares whether the package contains [side effects](#side-effects)

### ESM declaration

The top-level `package.json` contains the key:

<code-example language="javascript">

{
  "type": "module"
}

</code-example>

This informs resolvers that code within the package is using EcmaScript Modules as opposed to CommonJS modules.

### `"exports"`

The `"exports"` field has the following structure:

<code-example language="javascript">

"exports": {
  "./schematics/*": {
    "default": "./schematics/*.js"
  },
  "./package.json": {
    "default": "./package.json"
  },
  ".": {
    "types": "./core.d.ts",
    "esm": "./esm2022/core.mjs",
    "esm2022": "./esm2022/core.mjs",
    "default": "./fesm2022/core.mjs"
  },
  "./testing": {
    "types": "./testing/testing.d.ts",
    "esm": "./esm2022/testing/testing.mjs",
    "esm2022": "./esm2022/testing/testing.mjs",
    "default": "./fesm2022/testing.mjs"
  }
}

</code-example>

Of primary interest are the `"."` and the `"./testing"` keys, which define the available code formats for the `@angular/core` primary entrypoint and the `@angular/core/testing` secondary entrypoint, respectively.
For each entrypoint, the available formats are:

| Formats                   | Details |
|:---                       |:---     |
| Typings \(`.d.ts` files\) | `.d.ts` files are used by TypeScript when depending on a given package.                                                                                                           |
| `es2022`                  | ES2022 code flattened into a single source file.                                                                                                                                  |
| `esm2022`                 | ES2022 code in unflattened source files \(this format is included for experimentation - see [this discussion of defaults](#note-about-the-defaults-in-packagejson) for details\). |
| `default`               | ES2022 code flattened into a single source.

Tooling that is aware of these keys may preferentially select a desirable code format from `"exports"`.

Libraries may want to expose additional static files which are not captured by the exports of the JavaScript-based entry-points such as Sass mixins or pre-compiled CSS.

For more information, see [Managing assets in a library](guide/creating-libraries#managing-assets-in-a-library).

### Legacy resolution keys

In addition to `"exports"`, the top-level `package.json` also defines legacy module resolution keys for resolvers that don't support `"exports"`.
For `@angular/core` these are:

<code-example language="javascript">

{
  "module": "./fesm2022/core.mjs",
  "typings": "./core.d.ts",
}

</code-example>

As shown in the preceding code snippet, a module resolver can use these keys to load a specific code format.

### Side effects

The last function of `package.json` is to declare whether the package has [side effects](#sideeffects-flag).

<code-example language="javascript">

{
  "sideEffects": false
}

</code-example>

Most Angular packages should not depend on top-level side effects, and thus should include this declaration.

## Entrypoints and code splitting

Packages in the Angular Package Format contain one primary entrypoint and zero or more secondary entrypoints \(for example, `@angular/common/http`\).
Entrypoints serve several functions.

1.  They define the module specifiers from which users import code \(for example, `@angular/core` and `@angular/core/testing`\).

    Users typically perceive these entrypoints as distinct groups of symbols, with different purposes or capability.

    Specific entrypoints might only be used for special purposes, such as testing.
    Such APIs can be separated out from the primary entrypoint to reduce the chance of them being used accidentally or incorrectly.

1.  They define the granularity at which code can be lazily loaded.

    Many modern build tools are only capable of "code splitting" \(aka lazy loading\) at the ES Module level.
    The Angular Package Format uses primarily a single "flat" ES Module per entry point. This means that most build tooling is not able to split code with a single entry point into multiple output chunks.

The general rule for APF packages is to use entrypoints for the smallest sets of logically connected code possible.
For example, the Angular Material package publishes each logical component or set of components as a separate entrypoint - one for Button, one for Tabs, etc.
This allows each Material component to be lazily loaded separately, if desired.

Not all libraries require such granularity.
Most libraries with a single logical purpose should be published as a single entrypoint.
`@angular/core` for example uses a single entrypoint for the runtime, because the Angular runtime is generally used as a single entity.

### Resolution of secondary entry points

Secondary entrypoints can be resolved via the `"exports"` field of the `package.json` for the package.

## README.md

The README file in the Markdown format that is used to display description of a package on npm and GitHub.

Example README content of &commat;angular/core package:

<code-example language="html">

Angular
&equals;&equals;&equals;&equals;&equals;&equals;&equals;

The sources for this package are in the main [Angular](https://github.com/angular/angular) repo.Please file issues and pull requests against that repo.

License: MIT

</code-example>

## Partial compilation

Libraries in the Angular Package Format must be published in "partial compilation" mode.
This is a compilation mode for `ngc` which produces compiled Angular code that is not tied to a specific Angular runtime version, in contrast to the full compilation used for applications, where the Angular compiler and runtime versions must match exactly.

To partially compile Angular code, use the `compilationMode` flag in the `angularCompilerOptions` property of your `tsconfig.json`:

<code-example language="javascript">

{
  &hellip;
  "angularCompilerOptions": {
    "compilationMode": "partial",
  }
}

</code-example>

Partially compiled library code is then converted to fully compiled code during the application build process by the Angular CLI.

If your build pipeline does not use the Angular CLI then refer to the [Consuming partial ivy code outside the Angular CLI](guide/creating-libraries#consuming-partial-ivy-code-outside-the-angular-cli) guide.

## Optimizations

### Flattening of ES modules

The Angular Package Format specifies that code be published in "flattened" ES module format.
This significantly reduces the build time of Angular applications as well as download and parse time of the final application bundle.
Please check out the excellent post ["The cost of small modules"](https://nolanlawson.com/2016/08/15/the-cost-of-small-modules) by Nolan Lawson.

The Angular compiler can generate index ES module files. Tools like Rollup can use these files to generate flattened modules in a *Flattened ES Module* (FESM) file format.

FESM is a file format created by flattening all ES Modules accessible from an entrypoint into a single ES Module.
It's formed by following all imports from a package and copying that code into a single file while preserving all public ES exports and removing all private imports.

The abbreviated name, FESM, pronounced *phe-som*, can be followed by a number such as FESM2020.
The number refers to the language level of the JavaScript inside the module.
Accordingly a FESM2022 file would be ESM+ES2022 and include import/export statements and ES2022 source code.

To generate a flattened ES Module index file, use the following configuration options in your tsconfig.json file:

<code-example language="javascript">

{
  "compilerOptions": {
    &hellip;
    "module": "esnext",
    "target": "es2022",
    &hellip;
  },
  "angularCompilerOptions": {
    &hellip;
    "flatModuleOutFile": "my-ui-lib.js",
    "flatModuleId": "my-ui-lib"
  }
}

</code-example>

Once the index file \(for example, `my-ui-lib.js`\) is generated by ngc, bundlers and optimizers like Rollup can be used to produce the flattened ESM file.

#### Note about the defaults in package.json

As of webpack v4, the flattening of ES modules optimization should not be necessary for webpack users. It should be possible to get better code-splitting without flattening of modules in webpack.
In practice, size regressions can still be seen when using unflattened modules as input for webpack v4.
This is why `module` and `es2022` package.json entries still point to FESM files.
This issue is being investigated. It is expected to switch the `module` and `es2022` package.json entry points to unflattened files after the size regression issue is resolved.
The APF currently includes unflattened ESM2022 code for the purpose of validating such a future change.

### "sideEffects" flag

By default, EcmaScript Modules are side-effectful: importing from a module ensures that any code at the top level of that module should run.
This is often undesirable, as most side-effectful code in typical modules is not truly side-effectful, but instead only affects specific symbols.
If those symbols are not imported and used, it's often desirable to remove them in an optimization process known as tree-shaking, and the side-effectful code can prevent this.

Build tools such as Webpack support a flag which allows packages to declare that they do not depend on side-effectful code at the top level of their modules, giving the tools more freedom to tree-shake code from the package.
The end result of these optimizations should be smaller bundle size and better code distribution in bundle chunks after code-splitting.
This optimization can break your code if it contains non-local side-effects - this is however not common in Angular applications and it's usually a sign of bad design.
The recommendation is for all packages to claim the side-effect free status by setting the `sideEffects` property to `false`, and that developers follow the [Angular Style Guide](https://angular.io/guide/styleguide) which naturally results in code without non-local side-effects.

More info: [webpack docs on side effects](https://github.com/webpack/webpack/tree/master/examples/side-effects)

### ES2022 language level

ES2022 Language level is now the default language level that is consumed by Angular CLI and other tooling.
The Angular CLI down-levels the bundle to a language level that is supported by all targeted browsers at application build time.

### d.ts bundling / type definition flattening

As of APF v8 it is now preferred to run [API Extractor](https://api-extractor.com), to bundle TypeScript definitions so that the entire API appears in a single file.

In prior APF versions each entry point would have a `src` directory next to the .d.ts entry point and this directory contained individual d.ts files matching the structure of the original source code.
While this distribution format is still allowed and supported, it is highly discouraged because it confuses tools like IDEs that then offer incorrect autocompletion, and allows users to depend on deep-import paths which are typically not considered to be public API of a library or a package.

### Tslib

As of APF v10, it is recommended to add tslib as a direct dependency of your primary entry-point.
This is because the tslib version is tied to the TypeScript version used to compile your library.

## Examples

*   [@angular/core package](https://unpkg.com/browse/@angular/core@13.0.0-rc.0)
*   [@angular/material package](https://unpkg.com/browse/@angular/material@13.0.0-rc.0)

## Definition of terms

The following terms are used throughout this document intentionally.
In this section are the definitions of all of them to provide additional clarity.

#### Package

The smallest set of files that are published to NPM and installed together, for example `@angular/core`.
This package includes a manifest called package.json, compiled source code, typescript definition files, source maps, metadata, etc.
The package is installed with `npm install @angular/core`.

#### Symbol

A class, function, constant, or variable contained in a module and optionally made visible to the external world via a module export.

#### Module

Short for ECMAScript Modules.
A file containing statements that import and export symbols.
This is identical to the definition of modules in the ECMAScript spec.

#### ESM

Short for ECMAScript Modules \(see above\).

#### FESM

Short for Flattened ES Modules and consists of a file format created by flattening all ES Modules accessible from an entry point into a single ES Module.

#### Module ID

The identifier of a module used in the import statements \(for example, `@angular/core`\).
The ID often maps directly to a path on the filesystem, but this is not always the case due to various module resolution strategies.

#### Module specifier

A module identifier \(see above\).

#### Module resolution strategy

Algorithm used to convert Module IDs to paths on the filesystem.
Node.js has one that is well specified and widely used, TypeScript supports several module resolution strategies, [Closure Compiler](https://developers.google.com/closure/compiler) has yet another strategy.

#### Module format

Specification of the module syntax that covers at minimum the syntax for the importing and exporting from a file.
Common module formats are CommonJS \(CJS, typically used for Node.js applications\) or ECMAScript Modules \(ESM\).
The module format indicates only the packaging of the individual modules, but not the JavaScript language features used to make up the module content.
Because of this, the Angular team often uses the language level specifier as a suffix to the module format, \(for example, ESM+ES2022 specifies that the module is in ESM format and contains ES2022 code\).

#### Bundle

An artifact in the form of a single JS file, produced by a build tool \(for example, [Webpack](https://webpack.js.org) or [Rollup](https://rollupjs.org)\) that contains symbols originating in one or more modules.
Bundles are a browser-specific workaround that reduce network strain that would be caused if browsers were to start downloading hundreds if not tens of thousands of files.
Node.js typically doesn't use bundles.
Common bundle formats are UMD and System.register.

#### Language level

The language of the code \(ES2022\).
Independent of the module format.

#### Entry point

A module intended to be imported by the user.
It is referenced by a unique module ID and exports the public API referenced by that module ID.
An example is `@angular/core` or `@angular/core/testing`.
Both entry points exist in the `@angular/core` package, but they export different symbols.
A package can have many entry points.

#### Deep import

A process of retrieving symbols from modules that are not Entry Points.
These module IDs are usually considered to be private APIs that can change over the lifetime of the project or while the bundle for the given package is being created.

#### Top-Level import

An import coming from an entry point.
The available top-level imports are what define the public API and are exposed in "&commat;angular/name" modules, such as `@angular/core` or `@angular/common`.

#### Tree-shaking

The process of identifying and removing code not used by an application - also known as dead code elimination.
This is a global optimization performed at the application level using tools like [Rollup](https://rollupjs.org), [Closure Compiler](https://developers.google.com/closure/compiler), or [Terser](https://github.com/terser/terser).

#### AOT compiler

The Ahead of Time Compiler for Angular.

#### Flattened type definitions

The bundled TypeScript definitions generated from [API Extractor](https://api-extractor.com).

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2023-03-06
