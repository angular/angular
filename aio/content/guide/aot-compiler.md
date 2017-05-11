@title
Ahead-of-Time Compilation

@intro
Learn how to use ahead-of-time compilation.

@description

This cookbook describes how to radically improve performance by compiling _ahead-of-time_ (AOT)
during a build process.

{@a toc}
<!--
# Contents

* [Overview](guide/aot-compiler#overview)
* [Ahead-of-time (AOT) vs just-in-time (JIT)](guide/aot-compiler#aot-jit)
* [Why do AOT compilation?](guide/aot-compiler#why-aot)
* [Compile with AOT](guide/aot-compiler#compile)
* [Bootstrap](guide/aot-compiler#bootstrap)
* [Tree shaking](guide/aot-compiler#tree-shaking)
  * [Rollup](guide/aot-compiler#rollup)
  * [Rollup Plugins](guide/aot-compiler#rollup-plugins)
  * [Run Rollup](guide/aot-compiler#run-rollup)
* [Load the bundle](guide/aot-compiler#load)
* [Serve the app](guide/aot-compiler#serve)
* [AOT QuickStart source code](guide/aot-compiler#source-code)
* [Workflow and convenience script](guide/aot-compiler#workflow)
  * [Develop JIT along with AOT](guide/aot-compiler#run-jit)
* [Tour of Heroes](guide/aot-compiler#toh)
  * [JIT in development, AOT in production](guide/aot-compiler#jit-dev-aot-prod)
  * [Tree shaking](guide/aot-compiler#shaking)
  * [Running the application](guide/aot-compiler#running-app)
  * [Inspect the Bundle](guide/aot-compiler#inspect-bundle)

-->

{@a overview}

## Overview

An Angular application consists largely of components and their HTML templates.
Before the browser can render the application,
the components and templates must be converted to executable JavaScript by the _Angular compiler_.

<div class="l-sub-section">

  <a href="https://www.youtube.com/watch?v=kW9cJsvcsGo">Watch compiler author Tobias Bosch explain the Angular Compiler</a> at AngularConnect 2016.

</div>

You can compile the app in the browser, at runtime, as the application loads, using the **_just-in-time_ (JIT) compiler**.
This is the standard development approach shown throughout the documentation.
It's great but it has shortcomings.

JIT compilation incurs a runtime performance penalty.
Views take longer to render because of the in-browser compilation step.
The application is bigger because it includes the Angular compiler
and a lot of library code that the application won't actually need.
Bigger apps take longer to transmit and are slower to load.

Compilation can uncover many component-template binding errors.
JIT compilation discovers them at runtime, which is late in the process.

The **_ahead-of-time_ (AOT) compiler** can catch template errors early and improve performance
by compiling at build time.

{@a aot-jit}

## _Ahead-of-time_ (AOT) vs _just-in-time_ (JIT)

There is actually only one Angular compiler. The difference between AOT and JIT is a matter of timing and tooling.
With AOT, the compiler runs once at build time using one set of libraries;
with JIT it runs every time for every user at runtime using a different set of libraries.

{@a why-aot}

## Why do AOT compilation?

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

{@a compile}

## Compile with AOT

Preparing for offline compilation takes a few simple steps.
Take the <a href='../guide/setup.html'>Setup</a> as a starting point.
A few minor changes to the lone `app.component` lead to these two class and HTML files:

<code-tabs>
  <code-pane title="src/app/app.component.html" path="aot-compiler/src/app/app.component.html">
  </code-pane>
  <code-pane title="src/app/app.component.ts" path="aot-compiler/src/app/app.component.ts">
  </code-pane>
</code-tabs>

Install a few new npm dependencies with the following command:

<code-example language="none" class="code-shell">
  npm install @angular/compiler-cli @angular/platform-server --save
</code-example>

You will run the `ngc` compiler provided in the `@angular/compiler-cli` npm package
instead of the TypeScript compiler (`tsc`).

`ngc` is a drop-in replacement for `tsc` and is configured much the same way.

`ngc` requires its own `tsconfig.json` with AOT-oriented settings.
Copy the original `src/tsconfig.json` to a file called `tsconfig-aot.json` on the project root,
then modify it as follows.

<code-example path="aot-compiler/tsconfig-aot.json" title="tsconfig-aot.json" linenums="false">
</code-example>

The `compilerOptions` section is unchanged except for one property.
**Set the `module` to `es2015`**.
This is important as explained later in the [Tree Shaking](guide/aot-compiler#tree-shaking) section.

What's really new is the `ngc` section at the bottom called `angularCompilerOptions`.
Its `genDir` property tells the compiler
to store the compiled output files in a new `aot` folder.

The `"skipMetadataEmit" : true` property prevents the compiler from generating metadata files with the compiled application.
Metadata files are not necessary when targeting TypeScript files, so there is no reason to include them.

***Component-relative template URLS***

The AOT compiler requires that `@Component` URLS for external templates and CSS files be _component-relative_.
That means that the value of `@Component.templateUrl` is a URL value _relative_ to the component class file.
For example, an `'app.component.html'` URL means that the template file is a sibling of its companion `app.component.ts` file.

While JIT app URLs are more flexible, stick with _component-relative_ URLs for compatibility with AOT compilation.

***Compiling the application***

Initiate AOT compilation from the command line using the previously installed `ngc` compiler by executing:

<code-example language="none" class="code-shell">
  node_modules/.bin/ngc -p tsconfig-aot.json
</code-example>

<div class="l-sub-section">

  Windows users should surround the `ngc` command in double quotes:
  <code-example format='.'>
    "node_modules/.bin/ngc" -p tsconfig-aot.json
  </code-example>

</div>

`ngc` expects the `-p` switch to point to a `tsconfig.json` file or a folder containing a `tsconfig.json` file.

After `ngc` completes, look for a collection of _NgFactory_ files in the `aot` folder.
The `aot` folder is the directory specified as `genDir` in `tsconfig-aot.json`.

These factory files are essential to the compiled application.
Each component factory creates an instance of the component at runtime by combining the original class file
and a JavaScript representation of the component's template.
Note that the original component class is still referenced internally by the generated factory.

<div class="l-sub-section">

  The curious can open `aot/app.component.ngfactory.ts` to see the original Angular template syntax
  compiled to TypeScript, its intermediate form.

  JIT compilation generates these same _NgFactories_ in memory where they are largely invisible.
  AOT compilation reveals them as separate, physical files.

</div>

<div class="alert is-important">

  Do not edit the _NgFactories_! Re-compilation replaces these files and all edits will be lost.

</div>

{@a bootstrap}

## Bootstrap

The AOT approach changes application bootstrapping.

Instead of bootstrapping `AppModule`, you bootstrap the application with the generated module factory, `AppModuleNgFactory`.

Make a copy of `main.ts` and name it `main-jit.ts`.
This is the JIT version; set it aside as you may need it [later](guide/aot-compiler#run-jit "Running with JIT").

Open `main.ts` and convert it to AOT compilation.
Switch from the `platformBrowserDynamic.bootstrap` used in JIT compilation to
`platformBrowser().bootstrapModuleFactory` and pass in the AOT-generated `AppModuleNgFactory`.

Here is AOT bootstrap in `main.ts` next to the original JIT version:

<code-tabs>
  <code-pane title="src/main.ts" path="aot-compiler/src/main.ts">
  </code-pane>
  <code-pane title="src/main-jit.ts" path="aot-compiler/src/main-jit.ts">
  </code-pane>
</code-tabs>

Be sure to [recompile](guide/aot-compiler#compile) with `ngc`!

{@a tree-shaking}

## Tree shaking

AOT compilation sets the stage for further optimization through a process called _tree shaking_.
A tree shaker walks the dependency graph, top to bottom, and _shakes out_ unused code like
dead leaves in a tree.

Tree shaking can greatly reduce the downloaded size of the application
by removing unused portions of both source and library code.
In fact, most of the reduction in small apps comes from removing unreferenced Angular features.

For example, this demo application doesn't use anything from the `@angular/forms` library.
There is no reason to download forms-related Angular code and tree shaking ensures that you don't.

Tree shaking and AOT compilation are separate steps.
Tree shaking can only target JavaScript code.
AOT compilation converts more of the application to JavaScript,
which in turn makes more of the application "tree shakable".

{@a rollup}

### Rollup

This cookbook illustrates a tree shaking utility called _Rollup_.

Rollup statically analyzes the application by following the trail of `import` and `export` statements.
It produces a final code _bundle_ that excludes code that is exported, but never imported.

Rollup can only tree shake `ES2015` modules which have `import` and `export` statements.

<div class="l-sub-section">

  Recall that `tsconfig-aot.json` is configured to produce `ES2015` modules.
  It's not important that the code itself be written with `ES2015` syntax such as `class` and `const`.
  What matters is that the code uses ES `import` and `export` statements rather than `require` statements.

</div>

In the terminal window, install the Rollup dependencies with this command:

<code-example language="none" class="code-shell">
  npm install rollup rollup-plugin-node-resolve rollup-plugin-commonjs rollup-plugin-uglify --save-dev
</code-example>

Next, create a configuration file (`rollup-config.js`)
in the project root directory to tell Rollup how to process the application.
The cookbook configuration file looks like this.

<code-example path="aot-compiler/rollup-config.js" title="rollup-config.js" linenums="false">
</code-example>

This config file tells Rollup that the app entry point is `src/app/main.js` .
The `dest` attribute tells Rollup to create a bundle called `build.js` in the `dist` folder.
It overrides the default `onwarn` method in order to skip annoying messages about the AOT compiler's use of the `this` keyword.

The next section covers the plugins in more depth.

{@a rollup-plugins}

### Rollup Plugins

Optional plugins filter and transform the Rollup inputs and output.

*RxJS*

Rollup expects application source code to use `ES2015` modules.
Not all external dependencies are published as `ES2015` modules.
In fact, most are not. Many of them are published as _CommonJS_ modules.

The _RxJs_ Observable library is an essential Angular dependency published as an ES5 JavaScript _CommonJS_ module.

Luckily, there is a Rollup plugin that modifies _RxJs_
to use the ES `import` and `export` statements that Rollup requires.
Rollup then preserves the parts of `RxJS` referenced by the application
in the final bundle. Using it is straigthforward. Add the following to
the `plugins` array in `rollup-config.js`:

<code-example path="aot-compiler/rollup-config.js" region="commonjs" title="rollup-config.js (CommonJs to ES2015 Plugin)" linenums="false">
</code-example>

*Minification*

Rollup tree shaking reduces code size considerably.  Minification makes it smaller still.
This cookbook relies on the _uglify_ Rollup plugin to minify and mangle the code.
Add the following to the `plugins` array:

<code-example path="aot-compiler/rollup-config.js" region="uglify" title="rollup-config.js (CommonJs to ES2015 Plugin)" linenums="false">
</code-example>

<div class="l-sub-section">

  In a production setting, you would also enable gzip on the web server to compress
  the code into an even smaller package going over the wire.

</div>

{@a run-rollup}

### Run Rollup

Execute the Rollup process with this command:

<code-example language="none" class="code-shell">
  node_modules/.bin/rollup -c rollup-config.js
</code-example>

<div class="l-sub-section">

  Windows users should surround the `rollup` command in double quotes:
  <code-example language="none" class="code-shell">
    "node_modules/.bin/rollup"  -c rollup-config.js
  </code-example>

</div>

{@a load}

## Load the bundle

Loading the generated application bundle does not require a module loader like SystemJS.
Remove the scripts that concern SystemJS.
Instead, load the bundle file using a single `<script>` tag **_after_** the `</body>` tag:

<code-example path="aot-compiler/src/index.html" region="bundle" title="index.html (load bundle)" linenums="false">
</code-example>

{@a serve}

## Serve the app

You'll need a web server to host the application.
Use the same `lite-server` employed elsewhere in the documentation:

<code-example language="none" class="code-shell">
  npm run lite
</code-example>

The server starts, launches a browser, and the app should appear.

{@a source-code}

## AOT QuickStart source code

Here's the pertinent source code:

<code-tabs>
  <code-pane title="src/app/app.component.html" path="aot-compiler/src/app/app.component.html">
  </code-pane>
  <code-pane title="src/app/app.component.ts" path="aot-compiler/src/app/app.component.ts">
  </code-pane>
  <code-pane title="src/main.ts" path="aot-compiler/src/main.ts">
  </code-pane>
  <code-pane title="src/index.html" path="aot-compiler/src/index.html">
  </code-pane>
  <code-pane title="tsconfig-aot.json" path="aot-compiler/tsconfig-aot.json">
  </code-pane>
  <code-pane title="rollup-config.js" path="aot-compiler/rollup-config.js">
  </code-pane>
</code-tabs>

{@a workflow}

## Workflow and convenience script

You'll rebuild the AOT version of the application every time you make a change.
Those _npm_ commands are long and difficult to remember.

Add the following _npm_ convenience script to the `package.json` so you can compile and rollup in one command.

Open a terminal window and try it.

<code-example language="none" class="code-shell">
  npm run build:aot
</code-example>

{@a run-jit}

### Develop JIT along with AOT

AOT compilation and rollup together take several seconds.
You may be able to develop iteratively a little faster with SystemJS and JIT.
The same source code can be built both ways. Here's one way to do that.

* Make a copy of `index.html` and call it `index-jit.html`.
* Delete the script at the bottom of `index-jit.html` that loads `bundle.js`
* Restore the SystemJS scripts like this:

<code-example path="aot-compiler/src/index-jit.html" region="jit" title="src/index-jit.html (SystemJS scripts)" linenums="false">
</code-example>

Notice the slight change to the `system.import` which now specifies `src/app/main-jit`.
That's the JIT version of the bootstrap file that we preserved [above](guide/aot-compiler#bootstrap).

Open a _different_ terminal window and enter `npm start`.

<code-example language="none" class="code-shell">
  npm start
</code-example>

That compiles the app with JIT and launches the server.
The server loads `index.html` which is still the AOT version, which you can confirm in the browser console.
Change the address bar to `index-jit.html` and it loads the JIT version.
This is also evident in the browser console.

Develop as usual.
The server and TypeScript compiler are in "watch mode" so your changes are reflected immediately in the browser.

To see those changes in AOT, switch to the original terminal and re-run `npm run build:aot`.
When it finishes, go back to the browser and use the back button to
return to the AOT version in the default `index.html`.

Now you can develop JIT and AOT, side-by-side.

{@a toh}

## Tour of Heroes

The sample above is a trivial variation of the QuickStart application.
In this section you apply what you've learned about AOT compilation and tree shaking
to an app with more substance, the [_Tour of Heroes_](tutorial/toh-pt6) application.

{@a jit-dev-aot-prod}

### JIT in development, AOT in production

Today AOT compilation and tree shaking take more time than is practical for development. That will change soon.
For now, it's best to JIT compile in development and switch to AOT compilation before deploying to production.

Fortunately, the source code can be compiled either way without change _if_ you account for a few key differences.

***index.html***

The JIT and AOT apps require their own `index.html` files because they setup and launch so differently.

Here they are for comparison:

<code-tabs>
  <code-pane title="aot/index.html (AOT)" path="toh-pt6/aot/index.html">
  </code-pane>
  <code-pane title="src/index.html (JIT)" path="toh-pt6/src/index.html">
  </code-pane>
</code-tabs>


The JIT version relies on `SystemJS` to load individual modules.
Its scripts appear in its `index.html`.

The AOT version loads the entire application in a single script, `aot/dist/build.js`.
It does not need `SystemJS`, so that script is absent from its `index.html`

***main.ts***

JIT and AOT applications boot in much the same way but require different Angular libraries to do so.
The key differences, covered in the [Bootstrap](guide/aot-compiler#bootstrap) section above,
are evident in these `main` files which can and should reside in the same folder:

<code-tabs>
  <code-pane title="main-aot.ts (AOT)" path="toh-pt6/src/main-aot.ts">
  </code-pane>
  <code-pane title="main.ts (JIT)" path="toh-pt6/src/main.ts">
  </code-pane>
</code-tabs>

***TypeScript configuration***

JIT-compiled applications transpile to `commonjs` modules.
AOT-compiled applications transpile to _ES2015_/_ES6_ modules to facilitate tree shaking.
AOT requires its own TypeScript configuration settings as well.

You'll need separate TypeScript configuration files such as these:

<code-tabs>
  <code-pane title="tsconfig-aot.json (AOT)" path="toh-pt6/tsconfig-aot.json">
  </code-pane>
  <code-pane title="src/tsconfig.json (JIT)" path="toh-pt6/src/tsconfig.1.json">
  </code-pane>
</code-tabs>

<div class="callout is-helpful">

  <header>
    @Types and node modules
  </header>

  In the file structure of _this particular sample project_,
  the `node_modules` folder happens to be two levels up from the project root.
  Therefore, `"typeRoots"` must be set to `"../../node_modules/@types/"`.

  In a more typical project, `node_modules` would be a sibling of `tsconfig-aot.json`
  and `"typeRoots"` would be set to `"node_modules/@types/"`.
  Edit your `tsconfig-aot.json` to fit your project's file structure.

</div>

{@a shaking}

### Tree shaking

Rollup does the tree shaking as before.

<code-example path="toh-pt6/rollup-config.js" title="rollup-config.js" linenums="false">
</code-example>

{@a running-app}

### Running the application

<div class="alert is-important">

  The general audience instructions for running the AOT build of the Tour of Heroes app are not ready.

  The following instructions presuppose that you have downloaded the
  <a href="generated/zips/toh-pt6/toh-pt6.zip" target="_blank">Tour of Heroes' zip</a>
  and run `npm install` on it.

</div>

Run the JIT-compiled app with `npm start` as for all other JIT examples.

Compiling with AOT presupposes certain supporting files, most of them discussed above.

<code-tabs>
  <code-pane title="src/index.html" path="toh-pt6/src/index.html">
  </code-pane>
  <code-pane title="copy-dist-files.js" path="toh-pt6/copy-dist-files.js">
  </code-pane>
  <code-pane title="rollup-config.js" path="toh-pt6/rollup-config.js">
  </code-pane>
  <code-pane title="tsconfig-aot.json" path="toh-pt6/tsconfig-aot.json">
  </code-pane>
</code-tabs>

Extend the `scripts` section of the `package.json` with these npm scripts:

Copy the AOT distribution files into the `/aot` folder with the node script:

<code-example language="none" class="code-shell">
  node copy-dist-files
</code-example>

<div class="l-sub-section">

  You won't do that again until there are updates to `zone.js` or the `core-js` shim for old browsers.

</div>

Now AOT-compile the app and launch it with the `lite-server`:

<code-example language="none" class="code-shell">
  npm run build:aot && npm run serve:aot
</code-example>

{@a inspect-bundle}

### Inspect the Bundle

It's fascinating to see what the generated JavaScript bundle looks like after Rollup.
The code is minified, so you won't learn much from inspecting the bundle directly.
But the <a href="https://github.com/danvk/source-map-explorer/blob/master/README.md">source-map-explorer</a>
tool can be quite revealing.

Install it:

<code-example language="none" class="code-shell">
  npm install source-map-explorer --save-dev
</code-example>

Run the following command to generate the map.

<code-example language="none" class="code-shell">
  node_modules/.bin/source-map-explorer aot/dist/build.js
</code-example>

The `source-map-explorer` analyzes the source map generated with the bundle and draws a map of all dependencies,
showing exactly which application and Angular modules and classes are included in the bundle.

Here's the map for _Tour of Heroes_.

<a href="generated/images/guide/aot-compiler/toh-pt6-bundle.png" title="View larger image">
  <figure>
    <img src="generated/images/guide/aot-compiler/toh-pt6-bundle-700w.png" alt="toh-pt6-bundle">
  </figure>
</a>
