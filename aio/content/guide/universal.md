# Angular Universal: server-side rendering

This guide describes **Angular Universal**, a technology that runs your Angular application on the server.

<div class="alert is-important">

This is a **preview guide**. 
The Angular CLI is adding support for universal apps and
we will realign this guide with the CLI as soon as possible.

</div>

A normal Angular application executes in the _browser_, rendering pages in the DOM in response to user actions.

**Angular Universal** generates _static_ application pages on the _server_
through a process called **server-side rendering (SSR)**.

It can generate and serve those pages in response to requests from browsers.
It can also pre-generate pages as HTML files that you serve later.

This guide describes a Universal sample application that launches quickly as a server-rendered page.
Meanwhile, the browser downloads the full client version and switches to it automatically after the code loads. 

<div class="l-sub-section">

[Download the finished sample code](generated/zips/universal/universal.zip),
which runs in a [node express](https://expressjs.com/) server.

</div>

{@a why-do-it}

### Why Universal

There are three main reasons to create a Universal version of your app.

1. Facilitate web crawlers (SEO)
1. Improve performance on mobile and low-powered devices 
1. Show the first page quickly

{@a seo}
{@a web-crawlers}
#### Facilitate web crawlers

Google, Bing, Facebook, Twitter and other social media sites rely on web crawlers to index your application content and make that content searchable on the web. 

These web crawlers may be unable to navigate and index your highly-interactive, Angular application as a human user could do.

Angular Universal can generate a static version of your app that is easy searchable, linkable, and navigable without JavaScript.
It also makes a site preview available since each URL returns a fully-rendered page.

Enabling web crawlers is often referred to as 
[Search Engine Optimization (SEO)](https://static.googleusercontent.com/media/www.google.com/en//webmasters/docs/search-engine-optimization-starter-guide.pdf).

{@a no-javascript}

#### Performance on mobile and low performance devices

Some devices don't support JavaScript or execute JavaScript so poorly that the user experience is unacceptable.
For these cases, you may require a server-rendered, no-JavaScript version of the app.
This version, however limited, may be the only practical alternative for 
people who otherwise would not be able to use the app at all.

{@a startup-performance}

#### Show the first page quickly

Displaying the first page quickly can be critical for user engagement. 

[53% of mobile site visits are abandoned](https://www.doubleclickbygoogle.com/articles/mobile-speed-matters/) if pages take longer than 3 seconds to load.
Your app may have to launch faster to engage these users before they decide to do something else.

With Angular Universal, you can generate landing pages for the app that look like the complete app.
The pages are pure HTML, and can display even if JavaScript is disabled.
The pages do not handle browser events, but they _do_ support navigation through the site using [routerLink](guide/router.html#router-link).

In practice, you'll serve a static version of the landing page to hold the user's attention.
At the same time, you'll load the full Angular app behind it in the manner [explained below](#transition).
The user perceives near-instant performance from the landing page
and gets the full interactive experience after the full app loads.

{@a how-does-it-work}
### How it works

To make a Universal app, you install the `platform-server` package.
The `platform-server` package has server implementations of the DOM, `XMLHttpRequest`, and other low-level features that do not rely on a browser.

You compile the client application with the `platform-server` module instead of the `platform-browser` module.
and run the resulting Universal app on a web server.

The server (a [Node Express](https://expressjs.com/) server in _this_ guide's example)
passes client requests for application pages to Universal's `renderModuleFactory` function. 

The `renderModuleFactory` function takes as inputs a *template* HTML page (usually `index.html`), 
an Angular *module* containing components, 
and a *route* that determines which components to display.

The route comes from the client's request to the server.
Each request results in the appropriate view for the requested route.

The `renderModuleFactory` renders that view within the `<app>` tag of the template, creating a finished HTML page for the client.

Finally, the server returns the rendered page to the client.

### Working around the browser APIs

Because a Universal `platform-server` app doesn't execute in the browser, you may have to work around some of the browser APIs and capabilities that are missing on the server.

You won't be able reference browser-only native objects such as `window`, `document`, `navigator` or `location`.
If you don't need them on the server-rendered page, side-step them with conditional logic.

Alternatively, look for an injectable Angular abstraction over the object you need such as `Location` or `Document`; 
it may substitute adequately for the specific API that you're calling.
If Angular doesn't provide it, you may be able to write your own abstraction that delegates to the browser API while in the browser and to a satisfactory alternative implementation while on the server.

Without mouse or keyboard events, a universal app can't rely on a user clicking a button to show a component. 
A universal app should determine what to render based solely on the incoming client request.
This is a good argument for making the app [routeable](guide/router).

Because the user of a server-rendered page can't do much more than click links,
you should [swap in the real client app](#transition) as quickly as possible for a proper interactive experience.

{@a the-example}

## The example

The _Tour of Heroes_ tutorial is the foundation for the Universal sample described in this guide.

The core application files are mostly untouched, with a few exceptions described below.
You'll add more files to support building and serving with Universal.

In this example, Webpack tools compile and bundle the Universal version of the app with the 
[AOT (Ahead-of-Time) compiler](guide/aot-compiler).
A node/express web server turns client requests into the HTML pages rendered by Universal.

You will create:

 * a server-side app module, `app.server.module.ts`
 * a Universal app renderer, `universal-engine.ts`
 * an express web server to handle requests, `server.ts`
 * a TypeScript config file, `tsconfig.universal.json`
 * a Webpack config file, `webpack.config.universal.js`

When you're done, the folder structure will look like this:

<code-example format="." language="none" linenums="false">
src/  
  index.html                 <i>app web page</i>
  index-universal.html       <i>* universal app web page template</i>
  main.ts                    <i>bootstrapper for client app</i>
  style.css                  <i>styles for the app</i>
  systemjs.config.js         <i>SystemJS client configuration</i>
  systemjs-angular-loader.js <i>SystemJS add-in</i>
  tsconfig.json              <i>TypeScript client configuration</i>
  app/ ...                   <i>application code</i>
  dist/                      <i>* Post-build files</i>
    client.js                <i>* AOT-compiled client bundle</i>
    server.js                <i>* express server & universal app bundle</i>
    index-universal.html     <i>* copy of the app web page template</i>
    ...                      <i>* copies of other asset files</i>
  universal/                 <i>* folder for universal code</i>
    app-server.module.ts     <i>* server-side application module</i>
    server.ts                <i>* express web server</i>
    universal-engine.ts      <i>* express template engine</i>
bs-config.json               <i>config file for lite server</i>
package.json                 <i>npm configuration</i>
tsconfig.client.json         <i>* TypeScript client AOT configuration</i>
tsconfig.universal.json      <i>* TypeScript Universal configuration</i>
webpack.config.aot.js        <i>* Webpack client AOT configuration</i>
webpack.config.universal.js  <i>* Webpack Universal configuration</i>
</code-example>

The files marked with `*` are new and not in the original tutorial sample.
This guide covers them in the sections below.

{@a preparation}

## Preparation

{@a install-the-tools}

### Install the tools

To get started, install these Universal and Webpack packages.

 * `@angular/compiler-cli` - contains the AOT compiler.
 * `@angular/platform-server` - Universal server-side components.
 * `webpack` - Webpack JavaScript bundler.
 * `@ngtools/webpack` - Webpack loader and plugin for bundling compiled applications.
 * `copy-webpack-plugin` - Webpack plugin to copy asset files to the output folder.
 * `raw-loader` - Webpack loader for text files.
 * `express` - node web server.
 * `@types/express` - TypeScript type definitions for express.

Install them with the following commands:

<code-example format="." language="bash">
npm install @angular/compiler-cli @angular/platform-server express --save
npm install webpack @ngtools/webpack copy-webpack-plugin raw-loader @types/express --save-dev
</code-example>

{@a transition}

### Modify the client app

A Universal app can act as a dynamic, content-rich "splash screen" that engages the user.
It gives the appearance of a near-instant application.

Meanwhile, the browser downloads the client app scripts in background.
Once loaded, Angular transitions from the static server-rendered page to the dynamically rendered views of the interactive client app.

You must make a few changes to your application code to support both server-side rendering and the transition to the client app.

#### The root `AppModule`

Open file `src/app/app.module.ts` and find the `BrowserModule` import in the `NgModule` metadata.
Replace that import with this one:

<code-example path="universal/src/app/app.module.ts" region="browsermodule" title="src/app/app.module.ts (withServerTransition)">
</code-example>

Angular adds the `appId` value (which can be _any_ string) to the style-names of the server-rendered pages, 
so that they can be identified and removed when the client app starts.

You can get runtime information about the current platform and the `appId` by injection.

<code-example path="universal/src/app/app.module.ts" region="platform-detection" title="src/app/app.module.ts (platform detection)">
</code-example>

{@a http-urls}

#### Absolute HTTP URLs

The tutorial's `HeroService` and `HeroSearchService` delegate to the Angular `Http` module to fetch application data.
These services send requests to _relative_ URLs such as `api/heroes`.

In a Universal app, `Http` URLs must be _absolute_ (e.g., `https://my-server.com/api/heroes`) 
even when the Universal web server is capable of handling those requests.

You'll have to change the services to make requests with absolute URLs when running on the server
and with relative URLs when running in the browser.

One solution is to provide the server's runtime origin under the Angular [`APP_BASE_REF` token](api/common/APP_BASE_HREF),
inject it into the service, and prepend the origin to the request URL.

Start by changing the `HeroService` constructor to take a second `origin` parameter that is optionally injected via the `APP_BASE_HREF` token.

<code-example path="universal/src/app/hero.service.ts" region="ctor" title="src/app/hero.service.ts (constructor with optional origin)">
</code-example>

Note how the constructor prepends the origin (if it exists) to the `heroesUrl`.

You don't provide `APP_BASE_HREF` in the browser version, so the `heroesUrl` remains relative.

<div class="l-sub-section">

You can ignore `APP_BASE_HREF` in the browser if you've specified `<base href="/">` in the `index.html` 
to satisfy the router's need for a base address, as the tutorial sample does.

</div>

You will provide the `APP_BASE_HREF` in the universal version of the app (see how [below](#provide-origin)),
so the `heroesUrl` becomes absolute.

Do the same thing to the `HttpSearchService` constructor.
You'll have to adjust the `http.get` call in the `search()` method as well.
Here's the revised class.

<code-example path="universal/src/app/hero-search.service.ts" region="class" title="src/app/hero-search.service.ts (with injected origin)" linenums="false">
</code-example>

{@a build-client-app}

#### Try locally first

Open a terminal window and confirm that the client app still works in the browser.

<code-example format="." language="bash">
npm start
</code-example>

When you are done, shut down the server with `ctrl-C`.

<div class="alert is-important">

If you get a "Cannot find module" error, see the explanation and resolution [below](#cannot-find-module)

</div>

<hr>
 
{@a server-code}

## Server code

To run an Angular Universal application, you'll need a server that accepts client requests and returns rendered pages.

Create a `universal/` folder as a sibling to the `app/` folder.

Add to it the following three universal parts:

 1. the [app server module](#app-server-module)
 2. the [Universal engine](#universal-engine)
 3. the [web server](#web-server)

{@a app-server-module}

### App server module

The app server module class (conventionally named `AppServerModule`) is an Angular module that wraps the application's root module (`AppModule`) so that Universal can mediate between your application and the server.
`AppServerModule` also tells Angular how to bootstrap your application when running as a Universal app.

Create an `app-server.module.ts` file in the `src/universal` directory with the following `AppServerModule` code:

<code-example path="universal/src/universal/app-server.module.ts" title="src/universal/app-server.module.ts">
</code-example>

Notice that it imports first the client app's `AppModule` and then Angular Universal's `ServerModule`.

This is also the place to register providers that are specific to running your app under Universal.

{@a universal-engine}

### Universal template engine

The Universal `renderModuleFactory` function turns a client's requests into server-rendered HTML pages.
You'll call that function within a _template engine_ that's appropriate for your server stack.

This guide's sample is written for [Node Express](https://expressjs.com/)
so the engine takes the form of [Express template engine middleware](https://expressjs.com/en/guide/using-template-engines.html).

Create a `universal-engine.ts` file in the `src/universal` directory with the following code.

<code-example path="universal/src/universal/universal-engine.ts" title="src/universal/universal-engine.ts">
</code-example>

{@a render-module-factory}

#### Rendering the page
The call to Universal's `renderModuleFactory` is where the rendering magic happens.

<code-example path="universal/src/universal/universal-engine.ts" title="src/universal/universal-engine.ts (rendering)" region="render">
</code-example>

The first parameter is the `AppServerModule` that you wrote [earlier](#app-server-module).
It's the bridge between the Universal server-side renderer and your application.

The second parameter is an options object

* `document` is the template for the page to render (typically `index.html`).


* `url` is the application route (e.g., `/dashboard`), extracted from the client's request.
Universal should render the appropriate page for that route.


* `extraProviders` are optional Angular dependency injection providers, applicable when running on this server

{@a provide-origin}

You supply `extraProviders` when your app needs information that can only be determined by the currently running server instance.

The required information in this case is the running server's origin, provided under the `APP_BASE_HREF` token, so that the app can [calculate absolute HTTP URLs](#http-urls).

The `renderModuleFactory` function returns a _promise_ that resolves to the rendered page.

It's up to your engine to decide what to do with that page.
_This engine's_ promise callback returns the rendered page to the [web server](#web-server), 
which then forwards it to the client in the HTTP response.

{@a web-server}

### Universal web server

A _Universal_ web server responds to application _page_ requests with static HTML rendered by the [Universal template engine](#universal-engine).

It receives and responds to HTTP requests from clients (usually browsers). 
It serves static assets such as scripts, css, and images. 
It may respond to data requests, perhaps directly or as a proxy to a separate data server.

The sample web server for _this_ guide is based on the popular [Express](https://expressjs.com/) framework.

<div class="l-sub-section">

_Any_ web server technology can serve a Universal app as long as it can call Universal's `renderModuleFactory`.
The principles and decision points discussed below apply to any web server technology that you chose.

</div>

Create a `server.ts` file in the `src/universal` directory and add the following code:

<code-example path="universal/src/universal/server.ts" title="src/universal/server.ts">
</code-example>

<div class="alert is-critical">

**This sample server is not secure!**
Be sure to add middleware to authenticate and authorize users
just as you would for a normal Angular application server.

</div>

{@a import-app-server-module-factory}

#### Import AppServerModule factory

Most of this server code is re-usable across many applications. 
The import of the `AppServerModule` couples it specifically to a single application.

<code-example path="universal/src/universal/server.ts" title="src/universal/server.ts"  region="import-app-server-factory">
</code-example>

Your code editor may tell you that this import is incorrect.
It refers to the source file for the `AppServerModule` factory which doesn't exist at design time.

That file _will exist_, briefly, during compilation. But it's never physically in the file system when you're editing `server.ts` and you must tell the compiler to generate this module factory file _before_ it compiles `server.ts`.
[Learn how below](#universal-typescript-configuration).

#### Add the Universal template engine

Express supports template engines such as the [Universal template engine](#universal-engine) you wrote earlier.
You import that engine and register it with Express like this:

<code-example path="universal/src/universal/server.ts" title="src/universal/server.ts (Universal template engine)" region="universal-engine">
</code-example>

#### Filter request URLs

The web server must distinguish _app page requests_ from other kinds of requests.

It's not as simple as intercepting a request to the root address `/`.
The browser could ask for one of the application routes such as `/dashboard`, `/heroes`, or `/detail:12`. 
In fact, if the app were _only_ rendered by the server, _every_ app link clicked would arrive at the server
as a navigation URL intended for the router.

Fortunately, application routes have something in common: their URLs lack file extensions.

Data requests also lack extensions but they're easy to recognize because they always begin with `/api`.

All static asset requests have a file extension (e.g., `main.js` or `/node_modules/zone.js/dist/zone.js`).

So we can easily recognize the three types of requests and handle them differently.

1. data request -  request URL that begins `/api`
2. app navigation - request URL with no file extension
3. static asset - all other requests.

An Express server is a pipeline of middleware that filters and processes URL requests one after the other.

You configure the Express server pipeline with calls to `server.get()` like this one for data requests.

<code-example path="universal/src/universal/server.ts" title="src/universal/server.ts (data URL)" region="data-request" linenums="false">
</code-example>

<div class="l-sub-section">

This sample server doesn't handle data requests.

The tutorial's "in-memory web api" module, a demo and development tool, intercepts all HTTP calls and
simulates the behavior of a remote data server.
In practice, you would remove that module and register your web api middleware on the server here.

</div>

<div class="alert is-critical">

**Universal HTTP requests have different security requirements**

HTTP requests issued from a browser app are not the same as when issued by the universal app on the server.

When a browser makes an HTTP request, the server can make assumptions about cookies, XSRF headers, etc.

For example, the browser automatically sends auth cookies for the current user.
Angular Universal cannot forward these credentials to a separate data server.
If your server handles HTTP requests, you'll have to add your own security plumbing.

</div>

The following code filters for request URLs with no extensions and treats them as navigation requests.

<code-example path="universal/src/universal/server.ts" title="src/universal/server.ts (navigation)" region="navigation-request" linenums="false">
</code-example>

#### Serve static files safely

A single `server.use()` treats all other URLs as requests for static assets
such as JavaScript, image, and style files.

To ensure that clients can only download the files that they are _permitted_ to see, you will [put all client-facing asset files in the `/dist` folder](#universal-webpack-configuration)
and will only honor requests for files from the `/dist` folder.

The following express code routes all remaining requests to `/dist`; it returns a `404 - NOT FOUND` if the file is not found.

<code-example path="universal/src/universal/server.ts" title="src/universal/server.ts (static files)" region="static" linenums="false">
</code-example>

{@a universal-configuration}

## Configure for Universal

The server application requires its own web page and its own build configuration.

{@a index-universal}

### Universal web page

The universal app renders pages based on a host web page template.
Simple universal apps make do with a slightly modified copy of the original `index.html`.

<div class="alert is-helpful">

If you build a production version of the client app with the CLI's `ng build --prod` command, you do not need a separate universal `index.html`.
The CLI constructs a suitable `index.html` for you. You can skip this subsection and continue to [universal TypeScript configuration](#universal-typescript-configuration).

Read on if you're building the app without the CLI.

</div>

Create an `index-universal.html` as follows, shown next to the development `index.html` for comparison.

<code-tabs>

  <code-pane title="src/index-universal.html" path="universal/src/index-universal.html">
  </code-pane>

  <code-pane title="src/index.html" path="universal/src/index.html">
  </code-pane>

</code-tabs>

The differences are few.

* Load the minified versions of the `shim` and `zone` polyfills from the root (which will be `/dist`)

* You won't use SystemJS for universal nor to load the client app.

* Instead you'll load the [production version of the client app](#build-client), `client.js`, which is the result of AOT compilation, minification, and bundling.

That's it for `index-universal.html`.
Next you'll create two universal configuration files, one for TypeScript and one for Webpack.

{@a universal-typescript-configuration}

### Universal TypeScript configuration

Create a `tsconfig.universal.json` file in the project root directory to configure TypeScript and AOT compilation of the universal app.

<code-example path="universal/tsconfig.universal.json" title="tsconfig.universal.json">
</code-example>

Certain settings are noteworthy for their difference from the `tsconfig.json` in the `src/` folder.

* The `module` property must be **es2015** because
 the transpiled JavaScript will use `import` statements instead of `require()` calls.


* Point `"typeRoots"` to `"./node_modules/@types/"`


* Set the `files` property (instead of `exclude`) to compile the `app-server.module` before the `universal-engine`,
 for the reason [explained above](#import-app-server-module-factory).


* The `angularCompilerOptions` section guides the AOT compiler:

  * `genDir` - the temporary output directory for AOT compiled code.
  * `entryModule` - the root module of the client application, expressed as `path/to/file#ClassName`.
  * `skipMetadataEmit` - set `true` because you don't need metadata in the bundled application.

### Universal Webpack configuration

Create a `webpack.config.universal.js` file in the project root directory with the following code.

<code-example path="universal/webpack.config.universal.js" title="webpack.config.universal.js">
</code-example>

**Webpack configuration** is a rich topic beyond the scope of this guide.
A few observations may clarify some of the choices.

* Webpack walks the dependency graph from the two entry points to find all necessary universal application files.


* The `@ngtools/webpack` loader loads and prepares the TypeScript files for compilation.


* The `AotPlugin` runs the AOT compiler (`ngc`) over the prepared TypeScript, guided by the `tsconfig.universal.json` you created [above](#universal-typescript-configuration).


* The `raw-loader` loads imported CSS and HTML files as strings.
You may need additional loaders or configuration for other file types.


* The compiled output is bundled into `dist/server.js`.


* The `CopyWebpackPlugin` copies specific static files from their source locations into the `/dist` folder.
These files include the universal app's web page template, `index-universal.html`, 
and the JavaScript and CSS files mentioned in it
... with the notable exception of `client.js` [to be discussed below](#build-client).

<div class="alert is-helpful">

The `CopyWebpackPlugin` step is unnecessary if you [build the client](#build-client) with the CLI.

</div>

## Build and run with universal

Now that you've created the TypeScript and Webpack config files, you can build and run the Universal application.

First add the _build_ and _serve_ commands to the `scripts` section of the `package.json`:

<code-example format="." language="ts">
"scripts": {
    ...
    "build:uni": "webpack --config webpack.config.universal.js",
    "serve:uni": "node dist/server.js",
    ...
}
</code-example>

{@a build}

#### Build

From the command prompt, type

<code-example format="." language="bash">
npm run build:uni
</code-example>

Webpack compiles and bundles the universal app into a single output file, `dist/server.js`, per the [configuration above](#universal-configuration).
It also generates a [source map](https://webpack.js.org/configuration/devtool/), `dist/server.js.map` that correlates the bundle code to the source code.

Source maps are primarily for the browser's [dev tools](https://developers.google.com/web/tools/chrome-devtools/javascript/source-maps), but on the server they help locate compilation errors in your components.

{@a serve}

#### Serve
After building the server bundle, start the server.

<code-example format="." language="bash">
npm run serve:uni
</code-example>

The console window should say 

<code-example format="." language="bash">
listening on port 3200...
</code-example>

## Universal in action

Open a browser to http://localhost:3200/. 
You should see the familiar Tour of Heroes dashboard page.

Navigation via `routerLinks` works correctly.
You can go from the Dashboard to the Heroes page and back.
You can click on a hero on the Dashboard page to display its Details page.

But clicks, mouse-moves, and keyboard entries are inert.

* Clicking a hero on the Heroes page does nothing.
* You can't add or delete a hero.
* The search box on the Dashboard page is ignored.
* The _back_ and _save_ buttons on the Details page don't work.

User events other than `routerLink` clicks aren't supported.
The user must wait for the full client app to arrive.

It will never arrive until you compile the client app 
and move the output into the `dist/` folder,
a step you'll take in just a moment.

#### Review the console log

Open the browser's development tools.
In the console window you should see output like the following:

<code-example format="." language="bash" linenums="false">
listening on port 3200...
Running in the browser with appId=uni
/styles.css
/shim.min.js
/zone.min.js
/client.js
Error: ENOENT: no such file or directory, stat '... dist/client.js' ...
</code-example>

Most of the console log lines report requests for static files coming from the `<link>` and `<script>` tags in the `index-universal.html`.
The `.js` files in particular are needed to run the client version of the app in the browser.
Once they're loaded, Angular  _should_ replace the Universal-rendered page with the full client app.

Except that it didn't!

#### Missing _client.js_ error

Note the error at the bottom of the console log that complains about a missing `client.js` file.

<code-example format="." language="bash">
Error: ENOENT: no such file or directory, stat '... dist/client.js' ...
</code-example>

The full client app doesn't launch because `client.js` doesn't exist.
And `client.js` doesn't exist because you have not yet built the client version of the app. 

{@a build-client}
## Build the client app

The express server is sending the universal server-side rendered pages to the client.
But it isn't serving the interactive client app because you haven't built it yet.

A key motivation for universal is to quickly render the first page on the client so of course
you want to transition to the client app as quickly as possible too.
You should build a small, _production_ version of the client app with that AOT compiler that loads and runs fast.

#### Build the client with the CLI

If you're using the CLI to build the client app, you simply run the following command and you're done.

<code-example format="." language="bash">
ng build --prod
</code-example>

The CLI takes care of the rest, including copying all necessary files to the `/dist` folder.
By default the CLI produces two separate client app bundles, one with the vendor packages (`vendor.bundle.js`) and one with your application code (`inline.bundle.js`).

Alternatively, you can build the client using CLI _tools_ but **_without the CLI itself_**.
Read the following sub-sections if that interests you.
If not, skip ahead to the section on [throttling](#throttling).

#### Build the client by hand

You can build the application without the considerable help of the CLI.
You'll still compile with AOT.
You'll still bundle and minify with Webpack.

You'll need two configuration files, just as you did for the universal server: one for TypeScript and one for Webpack.  

The client app versions are only slightly different from the corresponding server files.
Here they are, followed by notes that call out the differences:

<code-tabs>

  <code-pane title="tsconfig.client.json" path="universal/tsconfig.client.json">
  </code-pane>

  <code-pane title="webpack.config.client.js" path="universal/webpack.config.client.js">
  </code-pane>
  
</code-tabs>

The **_tsconfig.client.json_** inherits (via `extends`) most settings from the universal `tsconfig`. The _only_ substantive difference is in the `files` section which identifies the client app bootstrapping file, `main.ts`, from which the compiler discovers all other required files.

The **_webpack.config.client.js_** has a few differences, 
all of them obvious.

* There is only one `entry.main` file, `main.ts`.

* The output filename is `client.js`.

* The `AotPlugin` references the `./tsconfig.client.json`.

* There's no need to copy asset files because the [universal Webpack config](#universal-webpack-configuration) 
took care of them.

* Add the `UglifyJSPlugin` to minify the client app code.

Why minify the client code and not the server code?
You minify client code to reduce the payload transmitted to the browser. The universal server code stays on the server where minification is pointless.

#### Run Webpack for the client

Add an `npm` script to make it easy to build the client from the terminal window.
<code-example format="." language="ts">
"scripts": {
    ...
    "build:uni-client": "webpack --config webpack.config.client.js",
    ...
}
</code-example>
Now run that command

<code-example format="." language="bash">
npm run build:uni-client
</code-example>

Refresh the browser. 
The console log shows that the server can find `client.js`
The Universal app is quickly replaced by the full client app.

Most importantly, the event-based features now work as expected.

<div class="alert is-critical">

When you make application changes, remember to rebuild _both_ the universal server _and_ the client versions of the app.

</div>

## Throttling

The transition from the server-rendered app to the client app happens quickly on a development machine.
You can simulate a slower network to see the transition more clearly and 
better appreciate the launch-speed advantage of a universal app running on a low powered, poorly connected device.

Open the Chrome Dev Tools and go to the Network tab. 
Find the [Network Throttling](https://developers.google.com/web/tools/chrome-devtools/network-performance/reference#throttling) dropdown on the far right of the menu bar.

Try one of the "3G" speeds.
The server-rendered app still launches quickly but the full client app may take seconds to load.

{@a conclusion}

## Conclusion

This guide showed you how to take an existing Angular application and make it into a Universal app that does server-side rendering.
It also explained some of the key reasons for doing so.

 - Facilitate web crawlers (SEO)
 - Support low-bandwidth or low-power devices
 - Fast first page load

Angular Universal can greatly improve the perceived startup performance of your app.
The slower the network, the more advantageous it becomes to have Universal display the first page to the user.


{@a cannot-find-module}

#### Appendix: _Cannot find module_ error

As you continue to develop the application locally,
running the `npm start` command outside of universal, the compiler may fail with the following error:

<code-example format="." language="bash">
 error TS2307: Cannot find module '../../aot/src/universal/app-server.module.ngfactory'.
</code-example>

The likely cause is that you've been through these guide steps before and now have a `/universal` folder. 
That folder holds server-side artifacts that are irrelevant to the client app and are confusing the compiler.

You must exclude the _server-side_ `/universal` folder files from _client app_ compilation.

Open `tsconfig.json`, find the `"exclude"` node and add `"universal/*"` to the array. 
The result might look something like this:

```
  "exclude": [
    "node_modules/*",
    "universal/*"
  ]
```

Compile and run again with `npm start`.