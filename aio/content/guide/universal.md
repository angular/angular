# Angular Universal

**Note: This build setup described in this guide is experimental and subject to change.**


## Overview

<b>Server-side Rendering for your Angular application</b>

Angular Universal is a technology that lets Angular applications run outside of the browser.  Using Universal, you can run your Angular application on any [Node.js](https://nodejs.org/en/) or  [ASP.NET Core](https://github.com/MarkPieszak/aspnetcore-angular2-universal) server.  You can use it to generate HTML output from your app on-demand, or generate HTML files ahead of time.  A Universal application is a server that generates HTML using your Angular application.

### How does it work? <a name="how-does-it-work"></a>

An *Angular* application renders its output to the browser DOM.  The output state of the DOM is determined by the initial HTML index page, the route in the application that determines the component tree to render, and any internal state in the application.

A *Universal* application renders its output to an HTML string.  The output HTML is determined by the initial HTML index page, the route in the application that determines the component tree to render, and any internal state in the application.

A Universal server app is a wrapper around the Angular application.  The wrapper asks the Angular app to render to HTML.  It passes the initial HTML page, the route, and data providers that together specify the HTML output. 

#### Implementation <a name="implementation"></a>

A Universal app is a normal Angular application that is compiled against the `platform-server` package instead of `platform-browser`.  The `platform-server` package has implementations of the DOM, XMLHttpRequest, and other low-level features, without relying on a browser.

To handle requests and return the output, the Universal app is wrapped in a server.  The server (NodeJS or ASP.NET Core) uses the `renderModuleFactory` function from `platform-server` to render the app's components into an internal DOM representation, which is then returned as a string.

The `renderModuleFactory` function uses a *template* HTML page, an Angular *module* containing components, and a *route* that determines which components get rendered.  It renders the components into the `<app>` tag of the template to create the HTML page, similar to the page that would be seen on the client.  The route comes from the HTTP request received by the server.  Each request to the server generates the appropriate view for the requested route.

#### Limitations <a name="limitations"></a>

Since it doesn't use an actual browser, a `platform-server` app has some limitations:

 1. No `window` or `location` object
 1. No direct access to the DOM
 1. No mouse or keyboard events
 1. Any HTTP requests from the app must use fully-qualified URLs

An Angular app should already avoid #1 and #2.  

Limitation #3 means that, on the server, the app must determine what to render based only on the incoming request; you can't rely on a user clicking a button to show a component.  It's a good argument for making your app [routeable](./router).

Limitation #4 occurs because there is no "current location" for a server-side app as there is in the browser.  You can pass the origin into your app using a [Provider](), as we'll show in the example later. 

#### Transition <a name="transition"></a>

A Universal app can be used as a dynamic "splash screen", which shows a view from your app while the real Angular application loads in behind it.  This gives the appearance of near-instant startup time, with the richness of an Angular app.

To make this work, your template HTML page contains the appropriate `<script>` tags to load the assets for the full Angular app.  Your Universal app renders the view of your app into the `<app>` tag of the template, and sends the completed HTML page to the client.  The client displays that page, then uses the `<script>` tags to load your full Angular app.  The Angular app starts up and replaces the contents of the `<app>` tag with the live application.

<div class="l-sub-section"> 
An available tool called <a href="https://universal.angular.io/api/preboot/index.html">Preboot</a> will record browser events during transition so they can be played back into the full Angular app once it is loaded.
</div>

### Why do it? <a name="why-do-it"></a>

Why would you want to create a static version of your app?  There are three main reasons:

1. SEO 
1. No JavaScript / Low Performance Device 
1. Startup performance

#### SEO (Search Engine Optimization) <a name="seo"></a>

Your highly-interactive Angular app may not be easily digestible to search engines.  Using Angular Universal, you can generate a static version of your app with navigation through the pages.  This makes the content of your app searchable, linkable, and navigable without JavaScript.  It also makes a site preview available to search engines and social media, since the URL returns a fully-rendered page.

#### No JavaScript / Low Performance Device <a name="no-javascript"></a>

Some devices don't support JavaScript, or have very slow performance.  For these cases, a No-JavaScript version of the app may be required.  Even if the functionality is limited, it can be a practical alternative for those that would otherwise not be able to use the app at all.

#### Startup Performance <a name="startup-performance"></a>

Application startup time is critical for user engagement.  While [AOT](aot-compiler) compilation speeds up application start times, it may not be enough, especially on mobile devices with slow connections.  [53% of mobile site visits are abandoned](https://www.doubleclickbygoogle.com/articles/mobile-speed-matters/) if pages take longer than 3 seconds to load.  Your app needs to load quickly, to engage users before they decide to do something else.

With Angular Universal, you can generate landing pages for the app that look like the complete app.  The pages are pure HTML, and can display even if JavaScript is disabled.  The pages do not handle browser events, but they _do_ support navigation through the site using [routerLink](../guide/router.html#!#router-link).

The recommended scenario is to serve a static version of the landing page, then load your Angular app behind it.  This gives the appearance of near-instant performance, and offers the full interactive experience once the full app is loaded.  Better than a "loading" spinner, it's a real screen that engages the user.

### The Example <a name="the-example"></a>

This guide uses the _Tour of Heroes_ app as an example.  The app files remain the same, but additional support files are created to support building and serving the Universal version.

The Universal version of the app is compiled by the AOT (Ahead-of-Time) compiler.  It is compiled into a web server that serves pages that are rendered from the app.  In this example we use Webpack to perform the AOT compilation and bundling.

<div class="l-sub-section">
Note that is is possible to create a Universal app that is not AOT-compiled, but this is not recommended because such an app would recompile on every request.
</div>

To build and run the Universal version, you need to create:

 * a server-side app module, `app.server.ts`
 * a Universal app renderer, `universal-engine.ts`
 * an express web server to handle requests, `server-aot.ts`
 * a TypeScript config file, `tsconfig-uni.json`
 * a Webpack config file, `webpack.config.uni.js`

Building upon _Tour of Heroes_, the folder structure will look like this:

<code-example format="." language="none" linenums="false">
src/  index.html                    <i>index file</i>
      main.ts                       <i>bootstrapper for client app</i>
      style.css                     <i>styles</i>
      systemjs.config.js            <i>SystemJS configuration for client app</i>
      systemjs-angular-loader.js    <i>component loader that allows relative paths</i>
      tsconfig.json                 <i>TypeScript configuration for client app</i>
      app/  app.module.ts           <i>application code</i>
            ...                     <i>...</i>
      uni/  app.server.module.ts    <i>server-side application module *</i>
            server-aot.ts           <i>express web server *</i>
            universal-engine.ts     <i>server-side app renderer *</i>
      dist/ server.js               <i>AOT-compiled server bundle *</i>
bs-config.json                      <i>config file for lite server</i>
package.json                        <i>npm configuration</i>
tsconfig-uni.json                   <i>TypeScript configuration for Universal app *</i>
webpack.config.uni.js               <i>Webpack configuration for Universal app *</i>
</code-example>

The files marked with * are new and not in the original Tour of Heroes demo.  This guide covers the new files in the sections below.

## Preparation <a name="preparation"></a>

### Installing the Tools <a name="installing-the-tools"></a>

To get started, you need to install the necessary modules for Universal and Webpack.

 * `@angular/compiler-cli` - The ngc compiler that compiles Angular applications 
 * `@angular/platform-server` - Server-side components needed for compilation
 * `@angular/animations` - Used for transitions from server to browser
 * `webpack` - The Webpack JavaScript bundler
 * `@ngtools/webpack` - The Webpack loader and plugin for bundling compiled applications
 * `raw-loader` - The Webpack loader for text files
 * `express` - The web server for serving the Universal application
 * `@types/express` - TypeScript type definitions for express

You can install them with the following commands:

<code-example format="." language="bash">
npm install @angular/compiler-cli @angular/platform-server @angular/animations express --save
npm install webpack @ngtools/webpack raw-loader @types/express --save-dev
</code-example>

### Component-relative URLs <a name="component-relative-urls"></a>

The AOT compiler requires that `@Component` URLs for external templates and css files be *component-relative*.
That means that the value of @Component.templateUrl is a URL value relative to the component class file.
For example, an `'./app.component.html'` URL means that the template file is a sibling of its companion app.component.ts file.
(The leading `./` is needed by Webpack to recognize that the string represents a path and not a module name.)

SystemJS allows both absolute and relative URLs (via [systemjs-angular-loader](https://github.com/angular/quickstart/blob/master/src/systemjs-angular-loader.js)), so you *could* have both in your app.  Before building your app with AOT and Universal, you will need to convert them.

From this:

<code-example format="." language="ts">
    @Component({
        selector: 'my-component',
        templateUrl: 'app/demo/components/my.component.html'
    })
</code-example>

To this:

<code-example format="." language="ts">
    @Component({
        selector: 'my-component',
        templateUrl: './my.component.html'
    })
</code-example>

### Server Transition <a name="server-transition"></a>

When a client-side Angular app bootstraps into a Universal page, it replaces the HTML that was there with its own rendered components, and removes any server-side styles.  This transition is enabled by a shared id between the client and server apps.  The id is added to styles that are rendered on the server, so that they can be identified and removed when the client app is initialized.  The id is defined using `BrowserModule.withServerTransition` in the AppModule that is shared by the client and server.

Open file `src/app/app.module.ts` and find the `BrowserModule` import.  Then replace this:

<code-example format="." language="ts">
@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ...
</code-example>

with this:

<code-example path="universal/src/app/app.module.ts" region="browsermodule" title="src/app/app.module.ts (withServerTransition)">
</code-example>

#### Absolute URLs for HTTP <a name="absolute-url-http"></a>

In our _Tour of Heroes_ sample, the `HeroService` uses the `Http` service to fetch the hero data.  (It uses the `in-memory-web-api` to simulate the server, but the `Http` service is still used.)

In a Universal app, the `Http` service needs all URLs to be absolute, because it doesn't know how to interpret relative URLs.  So the  `HeroService` must be changed to use an absolute URL when running in Universal.  How does `HeroService` know what URL to use?  By allowing it to be injected.

Change the constructor of `HeroService` (in `hero.service.ts`) to take a second, optional parameter that accepts the `APP_BASE_HREF` value.  The value, if provided, is prepended to the `heroesUrl` that is hardcoded in the class. 

From this:
<code-example format="." language="ts">
  constructor(private http: Http) {}
</code-example>
to this:
<code-example path="universal/src/app/hero.service.ts" region="ctor" title="src/app/hero.service.ts (constructor with optional origin)">
</code-example>
In the client version of the app, the `APP_BASE_HREF` is not provided, so the `heroesUrl` will remain relative.  In the Universal version, the `APP_BASE_HREF` will be provided (in the `AppServerModule`; see below), so the `heroesUrl` will be changed to an absolute URL.
 

## Server Code <a name="server-code"></a>

To run an Angular Universal application on the server, you need a server program that accepts the requests and returns the results.  That's not part of the core Angular app, so you need to add those pieces.

The code specific to Universal is in three files:

 1. The app server module
 2. The Universal engine
 3. The web server

We'll go through these one at a time.

### App Server Module <a name="app-server-module"></a>

The app server module is an Angular module that imports both the client-side app module and Angular's ServerModule.  It tells Angular how to bootstrap the application when running on the server.

Create an `app.server.module.ts` file in the `src/uni` directory and add the following code:

<code-example path="universal/src/uni/app.server.module.ts" title="src/uni/app.server.module.ts">
</code-example>
The APP_BASE_HREF value is provided to the application's router so that URLs are expressed relative to that value.  

In our application, we use APP_BASE_HREF value in the `HeroService` to fetch data using `Http`.  In platform-server, `Http` needs all URLs to be absolute, because it doesn't know how to interpret relative URLs.

### Universal Engine <a name="universal-engine"></a>

The Universal Engine is the heart of a Universal application.  It is the code that takes an HTML template and a route url, and renders the HTML for the page.  The HTML output is the result of rendering the components that are displayed for the given route.

The rendered output could be stored as static HTML files to be served later.  The demo code below serves the rendered pages directly, but it caches the output in memory, so that a given route only needs to be rendered once.

Create the `universal-engine.ts` file in the `src/uni` directory, and add the following code:

<code-example path="universal/src/uni/universal-engine.ts" title="src/uni/universal-engine.ts">
</code-example>

### Web Server <a name="web-server"></a>

The web server accepts HTTP requests and sends back the response.  For requests that are routes within the app, it creates the response by calling the Universal engine to render a page.  For static file requests, it returns the file contents.

This web server is based on the popular [Express](https://expressjs.com/) web framework.  Other web serving techniques would work for Universal, as long as they can send the appropriate requests to the universal engine.

Create the `server-aot.ts` file in the `src/uni` directory, and add the following code:

<code-example path="universal/src/uni/server-aot.ts" title="src/uni/server-aot.ts">
</code-example>
There's a chicken-and-egg problem here.  The server depends on `AppServerModuleNgFactory`, which won't exist until the app is compiled.  But the `server-aot.ts` won't compile because `AppServerModuleNgFactory` doesn't exist yet.

One way around this problem is to compile `app.server.module.ts` before `server-aot.ts`.  You can tell the compiler to do that using the `files` array in the `tsconfig-uni.json`, which you will create in the next section.

<code-example format="." language="ts" linenums="false">
  "files": [
    "src/uni/app.server.module.ts",
    "src/uni/server-aot.ts"
  ],
</code-example>

Since `app.server.module.ts` appears first in the array, it will be compiled into an `ngfactory` first.  So `AppServerModuleNgFactory` will be available for `server-aot.ts`.

## Configuration - Universal <a name="configuration-universal"></a>

The server code above, as well as the app code, needs to be compiled by the AOT compiler so it can run.  For Universal, special configuration of TypeScript and Webpack is required.

### TypeScript Configuration <a name="typescript-configuration"></a>

The AOT compiler transpiles TypeScript into JavaScript (like `tsc`), and compiles your app's components, services, etc. into executable JavaScript code. 
You configure it using a JSON file similar to `tsconfig.json`.  There are a few differences:

 * The `module` setting must be `es2015`.
 This creates JavaScript output with `import` statements (instead of `require()`) that can be compiled and bundled.
 * The `files` setting includes the app module followed by server bootstrapper.  These are described in the sections above.
 * There is a new `angularCompilerOptions` section with the following settings:

    * `genDir` - the output directory that will contain the compiled `ngfactory` code.  When compiling via Webpack, this is used as a temporary directory.
    * `entryModule` - the root module of the app, expressed as **path/to/file#ClassName**.
    * `skipMetadataEmit` - set to `true` because you don't need metadata in the bundled application

Create a `tsconfig-uni.json` file in the project root directory by copying your `tsconfig.json` and applying the changes described above.  It should look like this:

<code-example path="universal/tsconfig-uni.json" title="tsconfig-uni.json">
</code-example>

### Webpack Configuration <a name="webpack-configuration"></a>

The [Webpack Introduction](webpack.html) explains how to configure Webpack to bundle your Angular application.
Using Webpack for Universal AOT compilation is similar, but uses different [loaders](webpack.html#loaders) and [plugins](webpack.html#plugins).  

Create a `webpack.config.uni.js` file in the project root directory, and add the content shown below.  The salient parts are explained in the following sections.

<code-example path="universal/webpack.config.uni.js" title="webpack.config.uni.js">
</code-example>

#### Loader <a name="loader"></a>

For AOT, the **loader** to use for TypeScript files is `@ngtools/webpack`.
This loads TypeScript files and interprets the Angular decorators to prepare for AOT compilation.
Since it is used for TypeScript files, configure the loader for `*.ts`:

<code-example path="universal/webpack.config.uni.js" region="rules" title="webpack.config.uni.js (rules)">
</code-example>

When CSS and HTML files are encountered while processing the TypeScript, the [raw-loader](https://webpack.js.org/loaders/raw-loader/) is used.
It simply loads the file as a string, allowing Webpack to include it in the bundle.

For more complex loading scenarios, see the [Webpack Introduction](https://angular.io/docs/ts/latest/guide/webpack.html#loaders).

#### Plugin <a name="plugin"></a>

The AOT **plugin** is called `ngtools.AotPlugin`, and performs TypeScript compilation and Angular compilation
using the same underlying compiler as `ngc`.
The plugin accepts [several options](https://www.npmjs.com/package/@ngtools/webpack#options), but the only required option is `tsConfigPath`. 

<div class="l-sub-section">
Despite the <a href="https://www.npmjs.com/package/@ngtools/webpack#options">ngtools documentation</a>, the `entryModule` option must be in the `tsconfig-uni.json`, not inside the Webpack config.
</div>

<code-example path="universal/webpack.config.uni.js" region="plugins" title="webpack.config.uni.js (plugins)">
</code-example>

The `tsConfigPath` tells the plugin where to find the TypeScript configuration file to use when compiling.
This should be the Universal-specific `tsconfig-uni.json` described above.

#### Input <a name="input"></a>

Webpack's inputs are the source files for your application.
You just need to give it the [entry point(s)](webpack.html#entries-outputs), and
Webpack follows the dependency graph to find what files it needs to bundle.

For Universal, we name two entry points: the app server module and the web server.  Using these starting points, Webpack will pull in the app code and imported dependencies.
It will pull in the Angular libraries used by the app, but it will *not* pull in the Angular compiler, since it's not needed in an AOT-compiled app.

This ensures that the code for both appears in the final bundle.

<code-example path="universal/webpack.config.uni.js" region="entry" title="webpack.config.uni.js (entry)">
</code-example>

The [Webpack Introduction](webpack.html#entries-outputs) describes how to create separate bundles for 
app code, vendor libraries, and polyfills.  For simplicity, this example shows a single-bundle scenario.

#### Output <a name="output"></a>

After the plugin compiles the app files, Webpack bundles them into one or more output bundles.
The bundles contains the all the code necessary to run the web server and serve the app.

<code-example path="universal/webpack.config.uni.js" region="output" title="webpack.config.uni.js (output)">
</code-example>

We put them in a `dist` directory under `src`.  We will run the server from this directory with a script.


## Build and Serve - Universal <a name="build-and-serve-universal"></a>

Now that you've created the TypeScript and Webpack config files, you can build and run the Universal application.  First add the build and serve commands to the `scripts` section of your `package.json`:

<code-example format="." language="ts" linenums="false">
"scripts": {
    "build:uni": "webpack --config webpack.config.uni.js",
    "serve:uni": "node src/dist/server.js",
   ...
}
</code-example>

### Build <a name="build"></a>

From the command prompt, type

<code-example format="." language="bash" linenums="false">
npm run build:uni
</code-example>

As configured above, this transpiles the TypeScript files, Angular-compiles the components, and Webpacks the results into a single output file, `src/dist/server.js`.
It also generates a [source map](https://webpack.js.org/configuration/devtool/), `src/dist/server.js.map` that relates the bundle code to the source code.  

Source maps are primarily for the browser's [dev tools](https://developers.google.com/web/tools/chrome-devtools/javascript/source-maps), but on the server they help locate compilation errors in your components.

### Run <a name="run"></a>
Once the server bundle is created, type

<code-example format="." language="bash" linenums="false">
npm run serve:uni
</code-example>

to start the server.  The console window should say 

<code-example format="." language="bash" linenums="false">
listening on port 3200...
</code-example>

### Exercising Universal <a name="exercising-universal"></a>

Open a browser to http://localhost:3200/ and you should be greeted by the familiar Tour of Heroes dashboard page.  Meanwhile, the console window shows:

<code-example format="." language="bash" linenums="false">
building: /
/styles.css
/node_modules/core-js/client/shim.min.js
/node_modules/zone.js/dist/zone.js
/node_modules/systemjs/dist/system.src.js
/systemjs.config.js
/main.js
Error: ENOENT: no such file or directory, stat './src/main.js'
    at Error (native)
</code-example>

The first line shows that the server received a request for '/' and passed it to the Universal engine, which then built the HTML page from your Angular application.  If you reload the page for the same URL, the console will report 'from cache' instead of 'building', and the server will return HTML that was previously rendered for that URL.

The remaining lines in the console show static files that were requested and returned by the server.  The .js files are needed for running the browser version of the app.  When the .js files are loaded into the browser, the Universal-rendered page is replaced by the Angular client app.

_What about that error?_  The error says that the server cannot find a file, `main.js`, that the browser is requesting.  The main.js file does not exist because we haven't built the client version of the app.  Once it is built, the browser will load and run the client version, so test the Universal version first.

#### App Limitations <a name="app-limitations"></a>

Now you can see the limitations of the Universal app.  Navigation using `routerLink` works correctly: you can go from the Dashboard to the Heroes page and back, and you can click on a hero on the Dashboard page to display the Details page.  But you cannot go to the Details from the Heroes page, because that uses a click event rather than a router link.  The Hero Search on the Dashboard page does not work, nor does saving changes; both rely on browser events.

#### Client Transition <a name="client-transition"></a>

Now build the client-side version of the app described in the [Tour of Heroes tutorial](https://angular.io/docs/ts/latest/tutorial/).

<code-example format="." language="bash" linenums="false">
npm run build
</code-example>

This compiles the TypeScript so it can be loaded by SystemJS and run in the browser.

Now refresh the browser.  This time, the Universal app is displayed, but it is quickly replaced by the full Angular app.  Now you can use the event-based features that were missing.

#### Throttling <a name="throttling"></a>

The transition from Universal to Angular app happens quickly when running locally.  Simulate a slow network to see the transition.

Open the Chrome Dev Tools and go to the Network tab, and find the [Network Throttling](https://developers.google.com/web/tools/chrome-devtools/network-performance/reference#throttling) dropdown.  Try 3G and other network speeds to see how long it takes for the app to load under various conditions.

## Conclusion <a name="conclusion"></a>

This guide showed you how to take an existing Angular application and make it into a Universal app that does server-side rendering.  It also showed some of the reasons for doing so:

 - Search Engine Optimization
 - Supporting low-bandwidth or low-power devices
 - Improving perceived startup time

Angular Universal can greatly improve the perceived startup performance of your app.  The slower the network, the more advantageous it becomes to have Universal display the first page to the user.
