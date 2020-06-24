# Angular Package Format

This document describes the Angular Package Format (APF).
APF is an Angular specific specification for layout of npm packages that is used by Angular framework packages (e.g. `@angular/core`, `@angular/forms`), Angular Material packages (e.g. `@angular/material`), as well as 3rd party Angular libraries.

APF enables a package to work seamlessly under most common scenarios that use Angular.
Packages that use APF are compatible with the tooling offered by the Angular team as well as wider JavaScript ecosystem.
It is recommended that third-party library developers follow the same npm package format.

<div class="alert is-helpful">

APF is versioned along with the rest of Angular, and every major version improves the package format.
You can find the versions of the specification prior to v10 in this [google doc](https://docs.google.com/document/d/1Vyqu-D2EkRbnfw4YEm4xxUZe_fAOg001nFfuU3pWMMs/edit#heading=h.k0mh3o8u5hx).

</div>


## Purpose

JavaScript developers consume npm packages in many different ways.
For example, many pre-process the packages and create "bundles" using tools like Webpack (used by Angular CLI), Rollup, or SystemJS.
Others consume packages directly from their Node.js applications, or load them directly in the browser as a UMD bundles.

APF supports all of the commonly used development tools and workflows, and adds emphasis on optimizations that result either in smaller application payload size or faster development iteration cycle (build times).


## Distributing libraries in APF

Developers can rely on Angular CLI and [ng-packagr](https://github.com/ng-packagr/ng-packagr) (a build tool Angular CLI uses) to produce packages in the Angular package format.

You can follow our documentation on [Creating libraries](guide/creating-libraries) to learn how to do it.

The rest of this document captures nuances of the Angular Package Format and explains its various components.


## File layout

The following is an abbreviated version of the `@angular/core` package layout with an explanation of the purpose of the various files.

<code-example language="html">
node_modules/@angular/core                              Package root

   --- paths part of the PUBLIC API ---
│
├── README.md                                           Readme file used by npmjs web UI
|
├── package.json                                        Primary package.json for the package.
|                                                       Also represents the primary entry point.
|                                                       This file contains a mapping used by runtimes
|                                                       and tools performing module resolution.
│   { ...
│       es2015: ./fesm2015/core.js                      Node.js will use the `main` field to resolve
|                                                       an import from `@angular/core` to
|                                                       ./bundles/core.umd.js,core.js
|
│         main: ./bundles/core.umd.js                   while Angular CLI will use the `es2015` field
|                                                       to map the same import to ./fesm2015/core.js.
|
│       module: ./fesm2015/core.js
│      typings: ./core.d.ts
│     fesm2015: ./fesm2015/core.js
│      esm2015: ./esm2015/core.js
│     ... }
│
├── testing                                             Secondary entry point @angular/core/testing
|   |                                                   that is colocated within the @angular/core
|   |                                                   package.
│   │
│   └── package.json                                    Secondary entry point package.json. Maps
|                                                       typings and JavaScript files similar to the
│       { ...                                           primary entry package.json.
│          es2015: ../fesm2015/testing.js
│            main: ../bundles/core-testing.umd.js
│          module: ../fesm2015/testing.js
│         typings: ./testing.d.ts
│        fesm2015: ../fesm2015/testing.js
│         esm2015: ../esm2015/testing/testing.js
│         ... }
│
├── bundles                                             Directory that contains all bundles (UMD/ES5)
|   |
│   ├── core.umd.js                                     Primary entry point bundle.
|   |                                                   Filename: $PKGNAME.umd.js
|   |
│   ├── core.umd.min.js                                 Primary entry point minified bundle.
|   |                                                   Filename: $PKGNAME.umd.min.js
|   |
│   ├── core-testing.umd.js                             Secondary entry point bundle.
|   |                                                   Filename: $PKGNAME-$NAME.umd.js
|   |
│   └── core-testing.umd.min.js                         Secondary entry point minified bundle.
|                                                       Filename: $PKGNAME-$NAME.umd.min.js


   --- paths part of the PRIVATE API ---
│
├── core.d.ts                                           Primary entry point: flattened type definitions
|
├── core.metadata.json                                  Primary entry point: metadata used by AOT compiler
|
├── testing
|   |
│   ├── testing.d.ts                                    Secondary entry point: flattened type definitions
|   |
│   └── testing.metadata.json                           Secondary entry point: metadata used by AOT compiler
│
├── fesm2015                                            Directory containing fesm2015 files
|   |
│   ├── core.js                                         Primary entry point ESM+ES2015 flat module (fesm)
|   |
│   ├── core.js.map                                     Source map
|   |
│   ├── testing.js                                      Secondary entry point ESM+ES2015 flat module (fesm)
|   |
│   └── testing.js.map                                  Source map
│
└── esm2015 (deprecated)                                esm2015 directory containing distribution with
    |                                                   individual (non-flattened/fine-grained/internal)
    |                                                   ES modules.
    │
    │                                                   This distribution is currently available only
    |                                                   for experimentation. It is deprecated as of v9,
    |                                                   might be removed in the future.
    │
    ├── core                                            Directory with ES Modules - all paths within
    |   |                                               this directory are private api.
    │   └── ....js
    ├── testing                                         Similar to "core" directory but core/testing
    |   |                                               which represents a secondary entry point
    │   └── ....js
    |
    ├── core.js (ESM/ES2015)                            Public module that reexports all symbols under core/
    |
    ├── core.js.map                                     Source map (.map files exist next to all .js files)
    |
    ├── testing.js                                      Public module that reexports all symbols
    |                                                   under testing/
    |
    └── testing.js.map                                  Source map
</code-example>

This package layout allows us to support the following usage-scenarios and environments.

<table>
<thead>
<tr>
<th>Build / Bundler / Consumer</th>
<th>Module Format</th>
<th>Primary Entry Point resolves to</th>
<th>Secondary Entry Points resolves to</th>
</tr>
</thead>
<tbody>
<tr>
<td>Bundlers / Modern Browsers</td>
<td>FESM2015<br>
<br>
(flattened ESM+ES2015)</td>
<td><p><pre>
fesm2015/core.js
</pre></p>

</td>
<td><p><pre>
fesm2015/testing.js
</pre></p>

</td>
</tr>
<tr>
<td>unused</td>
<td>ESM2015<br>
<br>
(non-flattened ESM+ES2015)</td>
<td><p><pre>
esm2015/core.js
</pre></p>

</td>
<td><p><pre>
esm2015/testing/testing.js
</pre></p>

</td>
</tr>
<tr>
<td>script tags</td>
<td>UMD</td>
<td><p><pre>
Requires manual resolution by the developer to:
<br>
bundles/core.umd.js and bundles/core.umd.min.js
</pre></p>

</td>
<td><p><pre>
Requires manual resolution by the developer to:
<br>
bundles/core-testing.umd.js
</pre></p>

</td>
</tr>
<tr>
<td>Node.js</td>
<td>UMD</td>
<td><p><pre>
bundles/core.umd.js
</pre></p>

</td>
<td><p><pre>
bundles/core-testing.umd.js
</pre></p>

</td>
</tr>
<tr>
<td >TypeScript</td>
<td>ESM+d.ts</td>
<td><p><pre>
core.d.ts
</pre></p>

</td>
<td><p><pre>
testing/testing.d.ts
</pre></p>

</td>
</tr>
<tr>
<td>AOT compilation</td>
<td>.metadata.json</td>
<td><p><pre>
core.metadata.json
</pre></p>

</td>
<td><p><pre>
testing/testing.metadata.json
</pre></p>

</td>
</tr>
</tbody>
</table>

## Library file layout

Angular libraries should use the same layout as packages.
However, there are characteristics in libraries that are different from the Angular framework.

Typically, libraries are split at the component or functional level. for example, consider Angular's Material project.

Angular Material publishes sets of components such as `Button` (a single component), `Tabs` (a set of components that work together), and so on.
These components use an `NgModule` that binds these functional areas together.
Each component has its own `NgModule`.

The general rule in the Angular Package Format is to produce a Flattened ES Module (FESM) file for the smallest set of logically connected code.
For example, the Angular package has a single FESM for `@angular/core`.
When you uses the `Component` symbol from `@angular/core`, you are very likely to also either directly or indirectly use symbols such as `Injectable`, `Directive`, and `NgModule`.
You should bundle these pieces together into a single FESM.
For most library cases, group a single logical group together into a single `NgModule`, and bundle these `NgModule` files as a single FESM file within the package which represents a single entry point in the npm package.

The following is an example of how the Angular Material project would look in this format.

<code-example language="html">
node_modules/@angular/material                          Package root

   --- paths part of the public PUBLIC API ---
│
├── README.md                                           Readme file used by npmjs web UI
|
├── package.json                                        Primary package.json used by npm/yarn.
|                                                       Since @angular/material doesn't any have primary
|                                                       entry points, no resolution configuration is
|                                                       present in this file.
│
├── bundles                                             Directory that contains all bundles (UMD/ES5)
|   |
│   ├── material.umd.js                                 Primary bundle. Filename: $PKGNAME.umd.js
|   |
│   ├── material.umd.min.js                             Primary minified bundle. $PKGNAME.umd.min.js
|   |
│   ├── material-button.umd.js                          Secondary bundles are prefixed with "$PKGNAME-
|   |
│   ├── material-button.umd.min.js                      Minified secondary bundle
|   |
│   ├── material-tabs.umd.js                            Others...
│   ├── material-tabs.umd.min.js
│   └── material-[component].umd.js
|
├── button
│   └── package.json
│        { ...
│       es2015: ../fesm2015/button/index.js             Directory containing ESM2015 files
|
│      typings: ./index.d.ts                            This index re-exports from
|                                                       @angular/material/button, tabs, etc.
│         main: ../bundles/material-button.umd.js
|
│       module: ../fesm2015/button/index.js             Secondary entry points are flattened into a
|                                                       single JavaScript file.
|
│     fesm2015: ../fesm2015/button.js
│      esm2015: ../esm2015/button/index.js
│          ... }
└── tabs
    └── package.json
         { ...
        es2015: ../fesm2015/tabs/index.js               Secondary entry point: flattened type definitions
       typings: ./index.d.ts                            Secondary entry point: metadata used by AOT compiler
          main: ../bundles/material-tabs.umd.js         Secondary entry point dir (button, tabs, etc)
        module: ../fesm2015/tabs/index.js               Type def reference to src directory
      fesm2015: ../fesm2015/tabs.js                     Flat Module metadata file
       esm2015: ../esm2015/tabs/index.js                Secondary entry point package.json. Maps typings and JavaScript files similar to the primary entry package.json
           ... }

   --- paths part of the public PRIVATE API ---
│
├── button                                              esm2015 directory containing distribution with
|   |                                                   individual non-flattened (fine-grained/internal)
|   |                                                   ES modules.
│   ├── index.d.ts
|   |
│   └── index.metadata.json                             This distribution is currently available only
|                                                       for experimentation. It is deprecated as of v9,
|                                                       might be removed in the future.
│
├── tabs
│   ├── index.d.ts
│   └── index.metadata.json
│
├── fesm2015
|   ├── button.js
|   ├── button.js.map
|   ├── tabs.js
|   ├── tabs.js.map
|   └── ...others
│
└── esm2015 (deprecated)
    ├── button
    │   ├── ....js
    └── tabs
        └── ....js
</code-example>

## README.md

The README file in the markdown format that displays a description of a package on npm and Github.

The following example is the readme content for the `@angular/core` package.

<code-example language="html">
Angular
=======

The sources for this package are in the main [Angular](https://github.com/angular/angular) repo. Please file issues and pull requests against that repo.

Licence: MIT
</code-example>

## Primary entry point

The primary entry point of a package is the module with a module ID that matches the name of the package. For example, for the `@angular/core` package, the import from the primary entry point looks like `import { Component, ...} from '@angular/core'`.

See the [definition in the Angular glossary](https://angular.io/guide/glossary#entry-point) for more information.

You configure the primary entry point primarily through the `package.json` file in the package root using the following properties.

<code-example language="js">
{
  "name": "@angular/core",
  "module": "./fesm2015/core.js",
  "es2015": "./fesm2015/core.js",
  "esm2015": "./esm2015/core.js",
  "fesm2015": "./fesm2015/core.js",
  "main": "bundles/core.umd.js",
  "typings": "core.d.ts",
  "sideEffects": false
}
</code-example>

<table>
<thead>
<tr>
<td><strong>Property Name</strong></th>
<td><strong>Purpose</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td>module</td>
<td>

Property used by modern bundlers like Rollup ([note on reasoning](#package-json-defaults-note)).

</td>
</tr>
<tr>
<td>es2015</td>
<td>Property is used by Angular CLI.<br>
<br>

This entry point currently points these tools to fesm2015 ([note on reasoning](#package-json-defaults-note)).

</td>
</tr>
<tr>
<td>fesm2015</td>
<td>Points to the entry point for the flattened ESM+ES2015 distribution.</td>
</tr>
<tr>
<td>esm2015</td>
<td>Points to the entry point for the unflattened ESM+ES2015 distribution.</td>
</tr>
<tr>
<td>main</td>
<td>Node.js</td>
</tr>
<tr>
<td>typings</td>
<td>typescript compiler (tsc)</td>
</tr>
<tr>
<td>sideEffects</td>
<td>

webpack v4+ specific flag to enable advanced optimizations and code splitting ([note on reasoning](#package-json-defaults-note))

</td>
</tr>
</tbody>
</table>

## Secondary entry point

Besides the primary entry point, a package can contain zero or more secondary entry points, such as `@angular/common/http`.
These entry points contain symbols that you don't want to group together with the symbols in the main entry point for two reasons:

1. Users typically perceive them as distinct from the main group of symbols, and if they were pertinent to the main group of symbols they would have already been there.
1. The symbols in the secondary group are typically only used in certain scenarios, such as when writing and running tests. Excluding these symbols from the main entry point can reduce the chance of them being accidentally used incorrectly. For example, using testing mocks in production code as used in `@angular/core/testing`.

The Module ID of an import for a secondary entry point directs a module loader to a directory by the secondary entry point's name.
For instance, `@angular/core/testing` resolves to a directory by the same name.
This directory contains a `package.json` file that directs the loader to the correct location for what it's looking for.
This allows us to create multiple entry points within a single package.

The following is an example of the contents of the `package.json` file for the secondary entry point.

<code-example language="js">
{
  "name": "@angular/common/http",
  "main": "../bundles/common-http.umd.js",
  "fesm2015": "../fesm2015/http.js",
  "esm2015": "../esm2015/http/http.js",
  "typings": "./http.d.ts",
  "module": "../fesm2015/http.js",
  "es2015": "../fesm2015/http.js",
  "sideEffects": false
}
</code-example>

The previous code example redirects `@angular/core/testing` imports to the appropriate bundle, flat module, or typings.

## Compilation and transpilation

To produce all of the required build artifacts, it is recommended that you use the Angular compiler, `ngc`, to compile your code with the following settings in the `tsconfig.json` file.

<code-example language="js">
{
  "compilerOptions": {
    ...
    "declaration": true,
    "module": "es2015",
    "target": "es2015"
  },
  "angularCompilerOptions": {
    "strictMetadataEmit": true,
    "skipTemplateCodegen": true,
    "flatModuleOutFile": "my-ui-lib.js",
    "flatModuleId": "my-ui-lib",
  }
}
</code-example>

## Optimizations

### Flattening of ES modules

It is recommended that you optimize the build artifacts before publishing your build artifacts to npm by flattening the ES modules.
This step significantly reduces the build time of Angular applications, as well as the download and parse times of the final application bundle.
For more information, see the post, [The cost of small modules](https://nolanlawson.com/2016/08/15/the-cost-of-small-modules/) by Nolan Lawson.

The Angular compiler supports generating the index ES module files that you can use to flatten the module using tools like Rollup, resulting in a file format that we call Flattened ES Module, or FESM.

FESM is a file format created by flattening all ES modules accessible from an entry point into a single ES module.
The file is formed by following all of the imports from a package and copying that code into a single file while preserving all public ES exports and removing all private imports.

The shortened name, FESM, can have a number after it such as `FESM5` or `FESM2015`.
The number refers to the language level of the JavaScript inside the module.
For example, a `FESM5` file would be for ESM+ES5 (import/export statements and ES5 source code).

To generate a flattened ES module index file, use the following configuration options in your `tsconfig.json` file.

<code-example language="js">
{
  "compilerOptions": {
    ...
    "module": "es2015",
    "target": "es2015",
    ...
  },
  "angularCompilerOptions": {
    ...
    "flatModuleOutFile": "my-ui-lib.js",
    "flatModuleId": "my-ui-lib"
  }
}
</code-example>

After `ngc` generates the index file, such as `my-ui-lib.js`, you can use bundlers and optimizers like Rollup to produce the flattened ESM file.

{@a package-json-defaults-note}

<div class='callout is-helpful'>
<header>Note about the defaults in package.json</header>
<p>As of Webpack version 4, the flattening of ES modules for optimization should not be necessary for Webpack users. In fact, theoretically you should be able to get better code-splitting without the flattening of modules in Webpack. In practice, you may still see size regressions when using non-flattened modules as input for Webpack version 4. This is why module and es2015 <code>package.json</code> entries still point to FESM files.
</div>

### Inlining of templates and stylesheets

Component libraries are typically implemented using stylesheets and HTML templates stored in separate files. While it's not required, we suggest that component authors inline the templates and stylesheets into their FESM files as well as `*.metadata.json` files by replacing the `styleUrls` and `templateUrl` with `styles` and `template` metadata properties, respectively. This simplifies consumption of the components by application developers.

### Non-local side effects in libraries

As of Webpack v4, packages that contain a special property called `"sideEffects"` set to false in their `package.json` file, will be processed by Webpack more aggressively than those that don't.

The end result of these optimizations should be smaller bundle sizes and better code distribution in bundle chunks after code-splitting.

This optimization can break your code if it contains non-local side effects; however, this is not common in Angular applications and it is usually a sign of bad design.

Our recommendation is for all packages to claim the side effect free status by setting the `sideEffects` property to `false`, and that developers follow the [Angular Style Guide](https://angular.io/guide/styleguide) which naturally results in code without non-local side effects.

If you need more information, the following links may be helpful.

* [Tree-shaking](https://webpack.js.org/guides/tree-shaking/)
* [Dealing with side effects and pure functions in JavaScript](https://dev.to/vonheikemen/dealing-with-side-effects-and-pure-functions-in-javascript-16mg)
* [How to deal with dirty side effects in your pure function JavaScript](https://jrsinclair.com/articles/2018/how-to-deal-with-dirty-side-effects-in-your-pure-functional-javascript/)


### ES2015 language level

ES2015 language level is now the default language level that is consumed by Angular CLI and other tooling.

If applications still need to support ES5 browsers, then the Angular CLI  can downlevel the bundle to ES5 at application build time via [differential loading and builds features](https://angular.io/guide/deployment#differential-loading).


### `d.ts` bundling and type definition flattening

As of APF v8 we now prefer to run the `.d.ts` bundler tool from [https://api-extractor.com/](https://api-extractor.com/) so that the entire API appears in a single file.

In prior APF versions, each entry point would have a `src` directory next to the `.d.ts` entry point and this directory contained individual `.d.ts` files matching the structure of the original source code.

While this distribution format is still allowed and supported, it is highly discouraged because it confuses tools like IDEs that then offer incorrect autocompletion, and allows users to depend on deep-import paths which are typically not considered to be public API of a library or a package.

## Examples

* [@angular/core package](https://github.com/angular/core-builds/tree/10.0.x)
* [@angular/material package](https://github.com/angular/material2-builds/tree/10.0.x)
* [jasonaden/simple-ui-lib](https://github.com/jasonaden/simple-ui-lib)
* [filipesilva/angular/quickstart-lib](https://github.com/filipesilva/angular-quickstart-lib)

## Definition of terms

The following terms are used throughout this document very intentionally. In this section, we define all of them to provide additional clarity.

<dl>
  <dt>Package</dt>
  <dd>The smallest set of files that are published to npm and installed together. An example of a package is <code>@angular/core</code>. This package includes a manifest called <code>package.json</code>, compiled source code, typescript definition files, source maps, metadata, and so on. The package is installed with <code>npm install @angular/core</code>.</dd>
  <dt>Symbol</dt>
  <dd>A class, function, constant or variable contained in a module and optionally made visible to the external world via a module export.</dd>
  <dt>Module</dt>
  <dd>Short for ECMAScript Modules. A file containing statements that import and export symbols. This is identical to the <a href="http://www.ecma-international.org/ecma-262/6.0/#sec-modules">definition of modules in the ECMAScript specification</a>.</dd>
  <dt>ESM</dt>
  <dd>Abbreviation for ECMAScript Modules.</dd>
  <dt>FESM</dt>
  <dd>Abbreviation for Flattened ES Modules and consists of a file format created by flattening all ES Modules accessible from an entry point into a single ES module.</dd>
  <dt>Module ID</dt>
  <dd>The identifier of a module used in the import statements, such as <code>@angular/core</code>. The ID often maps directly to a path on the filesystem, but this is not always the case due to various module resolution strategies.</dd>
  <dt>Module resolution strategy</dt>
  <dd>An algorithm used to convert module IDs to paths on the filesystem. Node.js has one that is <a href="https://nodejs.org/api/modules.html#modules_all_together">well specified</a> and widely used. TypeScript supports <a href="https://www.typescriptlang.org/docs/handbook/module-resolution.html">several module resolution strategies</a>. Closure also has its <a href="https://github.com/google/closure-compiler/wiki/JS-Modules">own strategy</a>.</dd>
  <dt>Module format</dt>
  <dd>The specification of the module syntax that covers at a minimum the syntax for the importing and exporting from a file. Common module formats are: CommonJS (CJS, typically used for Node.js applications), or ECMAScript Modules (ESM). The module format indicates only the packaging of the individual modules, but not the JavaScript language features used to make up the module content. Because of this, the Angular team often uses the language level specifier as a suffix to the module format. For example, ESM+ES5 specifies that the module is in EESM format and contains code down-leveled to ES5. Other commonly used combos: ESM+ES2015, CJS+ES5, and CJS+_ES2015.</dd>
  <dt>Bundle</dt>
  <dd>An artifact in the form of a single JS file, produced by a build tool, such as WEbpack or Rollup, that contains symbols originating in one or more modules. Bundles are a browser-specific workaround that reduces network strain that would be caused if browsers were to start downloading hundreds, if not tens of thousands of files. Node.js typically doesn't use bundles. Common bundle formats are <a href="https://github.com/umdjs/umd">UMD</a> and <a href="https://github.com/ModuleLoader/es-module-loader/blob/master/docs/system-register.md">System.register</a>.</dd>
  <dt>Language level</dt>
  <dd>The language of the code (ES5 or ES2015). Independent of the module format.</dd>
  <dt>Entry point</dt>
  <dd>A module intended to be imported by the user. It is referenced by a unique module ID and exports the public API referenced by that module ID. An example is <code>@angular/core</code> or <code>@angular/core/testing</code>. Both entry points exist in the <code>@angular/core</code> package, but they export different symbols. A package can have many entry points.</dd>
  <dt>Deep import</dt>
  <dd>The process of retrieving symbols from modules that are not entry points. These module IDs are usually considered to be private APIs that can change over the lifetime of the project or while the bundle for the given package is being created.</dd>
  <dt>Top-level import</dt>
  <dd>An import coming from an entry point. The available top-level imports are what define the public API and are exposed in the <code>@angular/name</code> modules, such as <code>@angular/core</code> or <code>@angular/common</code>.</dd>
  <dt>Tree-shaking</dt>
  <dd>The process of identifying and removing code not used by an application. Also known as dead code elimination. This is a global optimization performed at the application level using tools like Rollup, Closure, or Terser.</dd>
  <dt>AOT compiler</dt>
  <dd>The <a href="https://angular.io/docs/ts/latest/cookbook/aot-compiler.html">Ahead of Time compiler for Angular.</dd>
  <dt>Flattened type definitions</dt>
  <dd>The bundled TYpeScript definitions generated from <a href="https://api-extractor.com">api-extractor</a>.</dd>
</dl>
