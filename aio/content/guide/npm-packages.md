@title
Npm Packages

@intro
Recommended npm packages, and how to specify package dependencies.

@description


Angular applications and Angular itself depend upon features and functionality provided by a variety of third-party packages.
These packages are maintained and installed with the Node Package Manager (<a href="https://docs.npmjs.com/">npm</a>).

<div class="l-sub-section">



Node.js and npm are essential to Angular development.

<a href="https://docs.npmjs.com/getting-started/installing-node" title="Installing Node.js and updating npm">
Get them now</a> if they're not already installed on your machine.

**Verify that you are running node `v4.x.x` or higher and npm `3.x.x` or higher**
by running the commands `node -v` and `npm -v` in a terminal/console window.
Older versions produce errors.

Consider using [nvm](https://github.com/creationix/nvm) for managing multiple
versions of node and npm. You may need [nvm](https://github.com/creationix/nvm) if
you already have projects running on your machine that use other versions of node and npm.


</div>



During [Setup](guide/setup), a <a href="https://docs.npmjs.com/files/package.json">package.json</a>
file is installed with a comprehensive starter set of
packages as specified in the `dependencies` and `devDependencies` sections.

You can use other packages but the packages in _this particular set_ work well together and include
everything you need to build and run the sample applications in this series.


<div class="l-sub-section">



Note: A cookbook or guide page may require an additional library such as *jQuery*.

</div>



You'll install more than you need for the QuickStart guide.
No worries!
You only serve to the client those packages that the application actually requests.

This page explains what each package does. You can make substitutions later to suit your tastes and experience.



## *dependencies* and *devDependencies*
The `package.json` includes two sets of packages,
[dependencies](guide/npm-packages#dependencies) and [devDependencies](guide/npm-packages#dev-dependencies).

The *dependencies* are essential to *running* the application.
The *devDependencies* are only necessary to *develop* the application.
You can exclude them from production installations by adding `--production` to the install command, as follows:

<code-example format="." language="bash">
  npm install my-application --production

</code-example>



{@a dependencies}



## *dependencies*
The `dependencies` section of `package.json` contains:

* ***Features***: Feature packages give the application framework and utility capabilities.

* ***Polyfills***: Polyfills plug gaps in the browser's JavaScript implementation.

* ***Other***: Other libraries that support the application such as `bootstrap` for HTML widgets and styling.



### Feature Packages

***@angular/core***: Critical runtime parts of the framework needed by every application.
Includes all metadata decorators, `Component`, `Directive`,  dependency injection, and the component lifecycle hooks.

***@angular/common***: The commonly needed services, pipes, and directives provided by the Angular team.

***@angular/compiler***: Angular's *Template Compiler*.
It understands templates and can convert them to code that makes the application run and render.
Typically you don’t interact with the compiler directly; rather, you use it indirectly via `platform-browser-dynamic` or the offline template compiler.

***@angular/platform-browser***: Everything DOM and browser related, especially
the pieces that help render into the DOM.
This package also includes the `bootstrapStatic()` method
for bootstrapping applications for production builds that pre-compile templates offline.

***@angular/platform-browser-dynamic***: Includes [Providers](api/core/Provider)
and a [bootstrap](guide/ngmodule#bootstrap) method for applications that
compile templates on the client. Don’t use offline compilation.
Use this package for bootstrapping during development and for bootstrapping plunker samples.

***@angular/http***: Angular's HTTP client.

***@angular/router***: Component router.

***@angular/upgrade***: Set of utilities for upgrading AngularJS applications to Angular.

***[system.js](https://github.com/systemjs/systemjs)***: A dynamic module loader compatible with the
[ES2015 module](http://www.2ality.com/2014/09/es6-modules-final.html) specification.
Other viable choices include the well-regarded [webpack](https://webpack.github.io/).

Your future applications are likely to require additional packages that provide
HTML controls, themes, data access, and various utilities.



{@a polyfills}



### Polyfill packages

Angular requires certain [polyfills](https://en.wikipedia.org/wiki/Polyfill) in the application environment.
Install these polyfills using the npm packages that Angular lists in the *peerDependencies* section of its `package.json`.

You must list these packages in the `dependencies` section of your own `package.json`.


<div class="l-sub-section">



For background on this requirement, see [Why peerDependencies?](guide/npm-packages#why-peer-dependencies).

</div>



***core-js***: Patches the global context (window) with essential features of ES2015 (ES6).
 You may substitute an alternative polyfill that provides the same core APIs.
 When these APIs are implemented by the major browsers, this dependency will become unnecessary.

***rxjs***: A polyfill for the [Observables specification](https://github.com/zenparsing/es-observable) currently before the
[TC39](http://www.ecma-international.org/memento/TC39.htm) committee that determines standards for the JavaScript language.
You can pick a preferred version of *rxjs* (within a compatible version range)
without waiting for Angular updates.

***zone.js***: A polyfill for the [Zone specification](https://gist.github.com/mhevery/63fdcdf7c65886051d55) currently before the
[TC39](http://www.ecma-international.org/memento/TC39.htm) committee that determines standards for the JavaScript language.
You can pick a preferred version of *zone.js* to use (within a compatible version range)
without waiting for Angular updates.


{@a other}



### Other helper libraries

***angular-in-memory-web-api***: An Angular-supported library that simulates a remote server's web api
without requiring an actual server or real HTTP calls.
Good for demos, samples, and early stage development (before you even have a server).
Read about it in the [HTTP Client](guide/http#in-mem-web-api) page.

***bootstrap***: [Bootstrap](http://getbootstrap.com/) is a popular HTML and CSS framework for designing responsive web apps.
Some of the samples improve their appearance with *bootstrap*.


{@a dev-dependencies}



## *devDependencies*
The packages listed in the *devDependencies* section of the `package.json` help you develop the application.
You don't have to deploy them with the production application although there is no harm in doing so.

***[concurrently](https://www.npmjs.com/package/concurrently)***:
A utility to run multiple *npm* commands concurrently on OS/X, Windows, and Linux operating systems.

***[lite-server](https://www.npmjs.com/package/lite-server)***:
A light-weight, static file server, by [John Papa](http://johnpapa.net/)
with excellent support for Angular apps that use routing.

***[typescript](https://www.npmjs.com/package/typescript)***:
the TypeScript language server, including the *tsc* TypeScript compiler.

***@types/\* ***: TypeScript definition files.
Learn more about it in the [TypeScript Configuration](guide/typescript-configuration#typings) guide.



{@a why-peer-dependencies}


## Why *peerDependencies*?

There isn't a [*peerDependencies*](https://nodejs.org/en/blog/npm/peer-dependencies/) section in the QuickStart `package.json`.
But Angular has a *peerDependencies* section in
*its* `package.json`, which has important consequences for your application.

This section explains why you load the [polyfill](guide/npm-packages#polyfills) *dependency*
packages in the QuickStart application's `package.json`,
and why you'll need those packages in your own applications.

Packages depend on other packages. For example, your application depends on the Angular package.

Two packages, "A" and "B", could depend on the same third package "C".
"A" and "B" might both list "C" among their *dependencies*.

What if "A" and "B" depend on different versions of "C" ("C1" and "C2"). The npm package system supports that.
It installs "C1" in the `node_modules` folder for "A" and "C2" in the `node_modules` folder for "B".
Now "A" and "B" have their own copies of "C" and they run without interferring with one another.

But there is a problem. Package "A" may require the presence of "C1" without actually calling upon it directly.
"A" may only work if *everyone is using "C1"*. It falls down if any part of the application relies on "C2".

The solution is for "A" to declare that "C1" is a *peer dependency*.

The difference between a `dependency` and a `peerDependency` is roughly this:

>A **dependency** says, "I need this thing directly available to *me*."
>
>A **peerDependency** says, "If you want to use me, you need this thing available to *you*."

The Angular `package.json` specifies several *peer dependency* packages,
each pinned to a particular version of a third-party package.

### You must install Angular's *peerDependencies* yourself.

When *npm* installs packages listed in *your* `dependencies` section,
it also installs the packages listed within *their* packages `dependencies` sections.
The process is recursive.

However, as of version 3, *npm* does *not* install packages listed in *peerDependencies* sections.

This means that when your application installs Angular, ***npm* doesn't automatically install
the packages listed in Angular's *peerDependencies* section**.

Fortunately, *npm* issues a warning (a) When any *peer dependencies* are missing, or (b)
When the application or any of its other dependencies
installs a different version of a *peer dependency*.

These warnings guard against accidental failures due to version mismatches.
They leave you in control of package and version resolution.

It is your responsibility to list all *peer dependency* packages **among your own *devDependencies***.


<div class="l-sub-section">



#### The future of *peerDependencies*

The Angular polyfill dependencies are hard requirements. Currently, there is no way to make them optional.

However, there is an npm feature request for "optional peerDependencies," which would allow you to model this relationship better.
When this feature request is implemented, Angular will switch from *peerDependencies* to *optionalPeerDependencies* for all polyfills.

</div>

