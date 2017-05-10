@title
Third Party Library

@intro
Create a third party library with support for AOT, JIT and Tree Shaking.

@description



Libraries are the backbone of the Angular ecosystem.
They add functionality that would otherwise take a long time to implement from scratch and keep 
up to date.
Everyone benefits from a healthy library ecosystem.

Traditionally, third party JavaScript libraries have been published in the form of a single 
JavaScript file.
Consumers of the library have then included the library, "as is", somewhere on the page using a
`script` tag.

Modern web development has changed this process. 
Instead of publishing a "one size fits all" bundle, developers want to only include the parts of 
the library they actually need and in the format they need it in.

This cookbook shows how to publish a third party library in a way that makes it possible to 
fully benefit from techniques like Ahead of Time Compilation (AOT) and Tree Shaking.

The  **QuickStart Library seed** gives you a ready-to-go setup that implements the library
package format described in this guide.


<div class="alert is-important">
  The setup shown in this cookbook is only for Angular version 4 (and up) libraries.
</div>

## Table of contents

[Library package format](guide/third-party-lib#library-package-format)

[Building your library](guide/third-party-lib#building-your-library)

[What's in the QuickStart Library seed?](guide/third-party-lib#whats-in-the-quickstart-library-seed)

[The build step](guide/third-party-lib#the-build-step)

[Testing libraries](guide/third-party-lib#testing-libraries)

[Publishing your library](guide/third-party-lib#publishing-your-library)

[Appendix: Supporting AOT](guide/third-party-lib#appendix-supporting-aot)

[Appendix: Supporting JIT](guide/third-party-lib#appendix-supporting-jit)

[Appendix: Dependency Management](guide/third-party-lib#appendix-dependency-management)



## Library package format

In order to understand how to build and publish a library, you have to consider _how_ the library 
is going to be consumed.

Some users need to add it as a `<script>` tag.
Others might prefer to use a module loader like [SystemJS](https://github.com/systemjs/systemjs) 
or the native Node one.
Bundlers, like [Webpack](https://webpack.js.org/) are very popular as well.
[Typescript](guide/typescriptlang) users need type definitions.
[Rollup](https://github.com/rollup/rollup) users make use of ECMAScript Modules (ESM)
for tree-shaking.
Even though [AOT](guide/third-party-lib#appendix-supporting-aot) is preferred, 
[Just-in-time](guide/third-party-lib#appendix-supporting-jit) compilation should be supported.

It's daunting to think of all the ways your library might be used and how to accommodate it, 
but you don't need to have a "one-size-fits-all" library.

You can configure `package.json` with more entry points besides [main](https://docs.npmjs.com/files/package.json#main).

The recommended set of entry points is as follows:

- `main` (default): an ES5 [UMD](https://github.com/umdjs/umd) bundle that can be consumed anywhere.
- `module`: a flat ECMAScript Module (ESM) bundle containing ES5 code.
- `es2015`: a flat ESM bundle containing ES2015 code.
- `typings`: TypeScript and the AOT compiler will look at this entry for metadata.

In addition, a minimized version of the UMD bundle should also be provided, as well as full
sourcemaps (all the way back to the source) for all JS bundles.

This set of entry points satisfies the following consumers:

<table width="100%">
  <col width="40%">
  <col width="20%">
  <col width="40%">
  <tr>
    <th> Consumer </th>
    <th> Module format </th>
    <th> Entry point resolves to </th>
  </tr>
  <tr>
    <td> Webpack (es2015) / Closure Compiler </td>
    <td> ESM+ES2015 </td>
    <td> <code>library-name.js</code> </td>
  <tr>
    <td> Angular CLI / Webpack/ Rollup </td>
    <td> ESM+ES5 </td>
    <td> <code>library-name.es5.js</code> </td>
  </tr>
  <tr>
    <td> Plunker / Fiddle / ES5 / script tag </td>
    <td> UMD </td>
    <td> 
      Requires manual resolution to 
      <code>bundles/library-name.umd.js</code>/<code>bundles/library-name.umd.min.js</code>
    </td>
  </tr>
  <tr>
    <td> Node.js </td>
    <td> UMD </td>
    <td> <code>bundles/library-name.umd.js</code> </td>
  </tr>
  <tr>
    <td> TypeScript </td>
    <td> ESM+*.d.ts </td>
    <td> <code>library-name.d.ts</code> </td>
  </tr>
  <tr>
    <td> AOT compilation </td>
    <td> *.metadata.json </td>
    <td> <code>library-name.metadata.json</code> </td>
  </tr>
</table>

A library should have the following file layout when published:

<div class='filetree'>
  <div class='file'>
    node_modules/library-name
  </div>
  <div class='children'>
    <div class='file'>
      bundles
    </div>
    <div class='children'>
      <div class='file'>
        library-name.umd.js ('main' entry point)
      </div>
      <div class='file'>
        library-name.umd.js.map
      </div>
      <div class='file'>
        library-name.umd.min.js
      </div>
      <div class='file'>
        library-name.umd.min.js.map
      </div>
    </div>
    <div class='file'>
      src/*.d.ts
    </div>
    <div class='file'>
      library-name.d.ts ('typings' entry point)
    </div>
    <div class='file'>
      library-name.es5.js ('module' entry point)
    </div>
    <div class='file'>
      library-name.es5.js.map
    </div>
    <div class='file'>
      library-name.js ('es2015' entry point)
    </div>
    <div class='file'>
      library-name.js.map
    </div>
    <div class='file'>
      library-name.metadata.json
    </div>
    <div class='file'>
      index.d.ts
    </div>
    <div class='file'>
      LICENSE
    </div>
    <div class='file'>
      package.json (lists all entry points)
    </div>
    <div class='file'>
      README.md
    </div>
  </div>
</div>

<div class="l-sub-section">
  A flat ECMAScript module (FESM) is a bundled ECMAScript module where all imports were 
  copied onto the same file file.
  It always contains ES module import/export statements but can have different levels of ES code
  inside.
</div>


## Building your library

You can use any set of tools you choose to package your library.
The only tool that is mandatory is the AOT compiler `ngc`, which should have the following 
configuration in the used `tsconfig.json`:

<code-example language="json">
  {
    "compilerOptions": { ... },
    "angularCompilerOptions": {
      "annotateForClosureCompiler": true,
      "strictMetadataEmit": true,
      "skipTemplateCodegen": true,
      "flatModuleOutFile": "library-name.js",
      "flatModuleId": "library-name"
    }
  }
</code-example>

You shouldn't have a `library-name.js` file, as it will be auto generated by `ngc` in order to 
create a flat module, re-exporting the public API of your library.

Below is a handy list for you to check if your entry points files are correctly build:

- common to all entry points:
  - HTML and CSS templates inlined in your TypeScript files that will be compiled.
  - sourcemaps all the way back to the source files.
  - compiled using `"module": "es2015"` in `compilerOptions`
- `main` (`bundles/library-name.umd.js`)
  - compiled with `ngc`, using `"target": "es5"`.
  - bundled using a UMD format.
  - also produce a minimized copy.
- `module` (`library-name.es5.js`)
  - compiled with `ngc`, using `"target": "es5"`.
  - bundled using ES modules format.
- `es2015` (`library-name.js`)
  - compiled with `ngc`, using `"target": "es2015"`.
  - bundled using ES modules format.
- `typings` (`library-name.d.ts`)
  - compiled with `ngc`.
  - only publish `*.d.ts` and `library-name.metadata.json` files.


## The QuickStart Library seed

Setting up a new library project on your machine is quick and easy with the **QuickStart Library seed**,
maintained [on github](https://github.com/angular/quickstart-lib "Install the github QuickStart Library repo").

This example repository has an implemention of the described package format but is by no means
the only way you should publish a library.
Any setup that builds the necessary package format works just as well for a consumer.
You are encouraged to customize this process as you see fit.

Make sure you have at least Node 6.9 and NPM 3.0 installed.
Then ...

1. Create a project folder (you can call it `quickstart-lib` and rename it later).
1. [Clone](guide/third-party-lib#clone "Clone it from github") or [download](guide/third-party-lib#download "download it from github") the **QuickStart Library seed** into your project folder.
1. Install npm packages.
1. Run `npm start` to launch the sample application.


### Clone

Perform the _clone-to-launch_ steps with these terminal commands.

<code-example language="sh" class="code-shell">
  git clone https://github.com/angular/quickstart-lib.git quickstart-lib
  cd quickstart-lib
  npm install
  npm start
</code-example>


### Download
[Download the QuickStart Library seed](https://github.com/angular/quickstart-lib/archive/master.zip)
and unzip it into your project folder. Then perform the remaining steps with these terminal commands.

<code-example language="sh" class="code-shell">
  cd quickstart-lib
  npm install
  npm start
</code-example>


## Initialize your repository

If you cloned the package from github, it has a `.git` folder where the official repository's history lives.

You don't want that git history though - you'll want to make your own. 

Delete this folder and initialize this one as a new repository:

<code-example language="sh" class="code-shell">
  rm -rf .git # Linux or OS/X (bash)
  rd .git /S/Q # Windows
  git init
</code-example>

<div class="alert is-important">
  Do this only in the beginning to avoid accidentally deleting your own git setup!
</div>


## What's in the QuickStart Library seed?

The **QuickStart Library seed** contains a similar structure to the [Quickstart seed](https://github.com/angular/quickstart).
It's modified to build and test a library instead of an application.

Consequently, there are _many different files_ in the project, 
most of which you can [learn about later](guide/library-setup-anatomy "Library Setup Anatomy").

Focus on the following TypeScript (`.ts`) files in the **`/src`** folder.

<div class='filetree'>
  <div class='file'>
    src
  </div>
  <div class='children'>
    <div class='file'>
      demo
    </div>
    <div class='children'>
      <div class='file'>
        app
      </div>
      <div class='children'>
        <div class='file'>
          app.component.ts
        </div>
        <div class='file'>
          app.module.ts
        </div>
      </div>
    </div>
    <div class='file'>
      lib
    </div>
    <div class='children'>
      <div class='file'>
        src
      </div>
      <div class='children'>
        <div class='file'>
          component
        </div>
        <div class='children'>
          <div class='file'>
            lib.component.ts
          </div>
        </div>
        <div class='file'>
          service
        </div>
        <div class='children'>
          <div class='file'>
            lib.service.ts
          </div>
        </div>
        <div class='file'>
          module.ts
        </div>
      </div>
      <div class='file'>
        index.ts
      </div>
    </div>
  </div>
</div>

<code-tabs>
  <code-pane title="src/demo/app/app.component.ts" path="quickstart-lib/src/demo/app/app.component.ts">
  </code-pane>

  <code-pane title="src/demo/app/app.module.ts" path="quickstart-lib/src/demo/app/app.module.ts">
  </code-pane>

  <code-pane title="src/lib/src/component/lib.component.ts" path="quickstart-lib/src/lib/src/component/lib.component.ts">
  </code-pane>

  <code-pane title="src/lib/src/service/lib.service.ts" path="quickstart-lib/src/lib/src/service/lib.service.ts">
  </code-pane>

  <code-pane title="src/lib/src/module.ts" path="quickstart-lib/src/lib/src/module.ts
    quickstart-lib/ts/src/lib/index.ts">
  </code-pane>

  <code-pane title="src/lib/index.ts" path="third-party-lib">
  </code-pane>
</code-tabs>

Each file has a distinct purpose and evolves independently as the application grows.

Files outside `src/` concern building, deploying, and testing your app.
They include configuration files and external dependencies.

Files inside `src/lib` "belong" to your library, while `src/demo` contains a demo application
that loads your library.

Libraries do not run by themselves, so it's very useful to have this "demo" app while developing 
to see how your library would look like to consumers.

When you run `npm start`, the demo application is served.

The following are all in `src/`

<table width="100%">
  <col width="20%">
  </col>
  <col width="80%">
  </col>
  <tr>
    <th>
      File
    </th>
    <th>
      Purpose
    </th>
  </tr>
  <tr>
    <td>
      <code>demo/app/app.component.ts</code>
    </td>
    <td>
      A demo component that renders the library component and a value from the library service.
    </td>
  </tr>
  <tr>
    <td>
      <code>demo/app/app.module.ts</code>
    </td>
    <td>
      A demo <code>NgModule</code> that imports the Library <code>LibModule</code>.
    </td>
  </tr>
  <tr>
    <td>
      <code>lib/src/component/app.component.ts</code>
    </td>
    <td>
      A sample library component that renders an <code>h2</code> tag.
    </td>
  </tr>
  <tr>
    <td>
      <code>lib/src/service/lib.service.ts</code>
    </td>
    <td>
      A sample library service that exports a value.
    </td>
  </tr>
  <tr>
    <td>
      <code>lib/src/module.ts</code>
    </td>
    <td>
      The library's main <code>NgModule</code>, <code>LibModule</code>.
    </td>
  </tr>
  <tr>
    <td>
      <code>lib/index.ts</code>
    </td>
    <td>
      The public API of your library, where you choose what to export to consumers.
    </td>
  </tr>
</table>


## The build step

You can build the library by running `npm run build`. 
This will generate a `dist/` directory with all the entry points described above.

All the logic for creating the build can be found in `./build.js`. It consists of roughly 5 steps:

- Compile with the AOT Compiler (AOT compiler or `ngc`) for ES5 and ES2015.
- Inline html and css inside the generated JavaScript files.
- Copy typings, metatada, html and css.
- Create each bundle using Rollup.
- Copy `LICENSE`, `package.json` and `README.md` files


## Testing libraries

While testing is always important, it's **especially** important in libraries because consumer
applications might break due to bugs in libraries.

But the fact that a library is consumed by another application is also what makes it hard to test.

To properly test a library, you need to have an integration tests.
An integration test is to libraries what an end-to-end test is to applications.
It tests how an app would install and use your library.

The **QuickStart Library seed** includes a directory called `integration` containing a standalone
app that consumes your built library in both AOT and JIT modes, with end-to-end tests to verify
it works.

To run the integration tests, do `npm run integration` which does the following:
- Build your library.
- Enter the integration app's directory.
- Install dependencies.
- Build the app in AOT mode.
- Test the app in AOT mode.
- Test the app in JIT mode.

Running integration tests gives you greater confidence that your library is properly built.

In addition to integration tests, you can also run unit tests in watch mode via `npm run test`,
or single-run via `npm run test:once`.

You can also test your library by installing it in another local repository you have. 
To do so, first build your lib via `npm run build`.
Then install it from your other repo using a relative path to the dist folder: 
`npm install relative/path/to/library/dist`.


## Publishing your library

Every package on NPM has a unique name, and so should yours. 
If you haven't already, now is the time to change the name of your library.

Use your editor to search the project for all instances of `angular-quickstart-lib` and change it
to your intended name (also in `dash-case` format).
The library name is mentioned on at least these files: 

- `integration/src/app/app.component.ts`
- `integration/src/app/app.module.ts`
- `integration/src/systemjs.config.js`
- `integrations/package.json`
- `src/demo/app/app.component.ts`
- `src/demo/app/app.module.ts`
- `src/demo/systemjs.config.js`
- `src/demo/tsconfig.json`
- `src/lib/tsconfig.json`
- `src/lib/tsconfig.es5.json`
- `bs-config.json`
- `package.json`
- `README.md`

You'll also need to rename the `src/lib/angular-quickstart-lib.ts` file and the folder your 
project is in.

After you have changed the package name, you can publish it to NPM (read 
[this link](https://docs.npmjs.com/getting-started/publishing-npm-packages) for details).

First you'll need to create a NPM account and login on your local machine.
Then you can publish your package by running `npm publish dist/`.  
Since your package is built on the `dist/` folder this is the one you should publish.


<div class="l-sub-section">

### Be a good library maintainer

Now that you've published a library, you need to maintain it as well. 
Below are some of the most important points:

- Document your library.
- Keep an eye on the issue tracker.
- [Manage your dependencies properly](guide/third-party-lib#appendix-dependency-management)
- Follow [Semantic Versioning](http://semver.org/)
- Setup a Continuous Integration solution to test your library (included is a `.travis.yml` 
file for [Travis CI](https://docs.travis-ci.com/user/getting-started/))!
- Choose an [appropriate license](https://choosealicense.com/).

</div>


## Appendix: Supporting AOT

AOT plays an important role in optimizing Angular applications. 
It's therefore important that third party libraries be published in a format compatible with AOT
compilation.
Otherwise it will not be possible to include the library in an AOT compiled application.

Only code written in TypeScript can be AOT compiled.
 
Before publishing the library must first be compiled using the AOT compiler (`ngc`). 
`ngc` extends the `tsc` compiler by adding extensions to support AOT compilation in addition to
regular TypeScript compilation.   

AOT compilation outputs three files that must be included in order to be compatible with AOT.

*Transpiled JavaScript*

As usual the original TypeScript is transpiled to regular JavaScript.

*Typings files*

JavaScript has no way of representing typings. 
In order to preserve the original typings, `ngc` will generate `.d.ts` typings files.

*Meta Data JSON files*

`ngc` outputs a metadata.json file for every `Component` and `NgModule`.
These meta data files represent the information in the original `NgModule` and `Component`
decorators.   

The meta data may reference external templates or css files.
These external files must be included with the library.

### NgFactories

`ngc` generates a series of files with an `.ngfactory` suffix as well.
These files represent the AOT compiled source, but should not be included with the published library.

Instead the `ngc` compiler in the consuming application will generate `.ngfactory` files based
on the JavaScript, Typings and meta data shipped with the library. 

### Why not publish TypeScript?

Why not ship TypeScript source instead? 
After all the library will be part of another TypeScript compilation step when the library is
imported by the consuming application.

Generally it's discouraged to ship TypeScript with third party libraries. 
It would require the consumer to replicate the complete build environment of the library. 
Not only typings, but potentially a specific version of `ngc` as well.

Publishing plain JavaScript with typings and meta data allows the consuming application to 
remain agnostic of the library's build environment.


## Appendix: Supporting JIT

AOT compiled code is the preferred format for production builds, but due to the long compilation
time it may not be practical to use AOT during development.

To create a more flexible developer experience a JIT compatible build of the library should be
published as well. 
The format of the JIT bundle is `umd`, which stands for Universal Module Definition.
Shipping the bundle as `umd` ensures compatibility with most common module loading formats.

The `umd` bundle will ship as a single file containing ES5 JavaScript and inlined versions of 
any external templates or css. 


## Appendix: Dependency Management

As a library maintainer, it's important to properly manage your dependencies in `package.json`.

There are [three kinds of dependencies](https://docs.npmjs.com/files/package.json#dependencies):
 `dependencies`, `devDependencies` and `peerDependencies`.

- `dependencies`: here go all the other libraries yours depends on when being used.
A good way to figure out these is to go through your library source code (in `src/lib` **only**)
and list all the libraries there.
- `devDependencies`: libraries that you need while developing, testing and building your library
go here.
When a user installs your library, these won't be installed. 
Users don't need to develop, build or test your library, they just need to run it.
- `peerDependencies`: these are similar to `dependencies` since your library expects them to be
there at runtime.
The difference is that you don't want to install a new version of these, but instead use
the one already available. 

A good example of a peer dependency is `@angular/core` and all other main Angular libraries.
If you listed these in `dependencies`, a new one - with a different version! - could be installed
for your library to use.
This isn't what you wanted though. You want your library to use *the exact same* `@angular/core`
that the app is using.

You'll usually used `@angular/*` libraries listed in both `devDependencies` and 
`peerDependencies`.
This is normal and expected, because when you're developing your library also need a copy of
them installed.

Another thing to remember is to keep your dependencies from changing too much unexpectedly.
Different versions of libraries can have different features, and if you inadvertently are too
lenient with allowed versions your library might stop working because a dependency changed.

You can choose what versions you allow by using [ranges](https://docs.npmjs.com/misc/semver).

A good rule of thumb is to have all `dependencies` specified with a tilde `~`(`~1.2.3`),
while your `peerDependencies` have a range (`"@angular/core": ">=4.0.0 <5.0.0 || >=4.0.0-beta <5.0.0"`).

Any extra dependency or peer dependency that you add to `package.json` should also be added
to the `globals` and `external` array in the `rollupBaseConfig` variable in `./build.js`.

This ensures your library doesn't package extra libraries inside of it and instead uses the ones
available in the consuming app.