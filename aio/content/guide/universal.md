# Angular Universal: server-side rendering

This guide describes **Angular Universal**, a technology that runs your Angular application on the server.

A normal Angular application executes in the _browser_, rendering pages in the DOM in response to user actions. 
Angular Universal generates _static_ application pages on the _server_
through a process called _server-side rendering_ (SSR). 
When Universal is integrated with your app, it can generate and serve those pages in response to requests from browsers.
It can also pre-generate pages as HTML files that you serve later.

You can easily prepare an app for server-side rendering using the [Angular CLI](guide/glossary#cli). The CLI schematic `@nguniversal/express-engine` performs the required steps, as described below. 

This guide describes a Universal sample application that launches quickly as a server-rendered page.
Meanwhile, the browser downloads the full client version and switches to it automatically after the code loads.

<div class="alert is-helpful">

  **Note:** [Download the finished sample code](generated/zips/universal/universal.zip),
  which runs in a [Node.js® Express](https://expressjs.com/) server.

</div>

{@a why-do-it}

## Why use server-side rendering?

There are three main reasons to create a Universal version of your app.

1. Facilitate web crawlers (SEO)
1. Improve performance on mobile and low-powered devices
1. Show the first page quickly

{@a seo}
{@a web-crawlers}
### Facilitate web crawlers

Google, Bing, Facebook, Twitter, and other social media sites rely on web crawlers to index your application content and make that content searchable on the web.
These web crawlers may be unable to navigate and index your highly interactive Angular application as a human user could do.

Angular Universal can generate a static version of your app that is easily searchable, linkable, and navigable without JavaScript.
Universal also makes a site preview available since each URL returns a fully rendered page.

Enabling web crawlers is often referred to as
[search engine optimization (SEO)](https://static.googleusercontent.com/media/www.google.com/en//webmasters/docs/search-engine-optimization-starter-guide.pdf).

{@a no-javascript}

### Improve performance on mobile and low-powered devices

Some devices don't support JavaScript or execute JavaScript so poorly that the user experience is unacceptable.
For these cases, you may require a server-rendered, no-JavaScript version of the app.
This version, however limited, may be the only practical alternative for
people who otherwise couldn't use the app at all.

{@a startup-performance}

### Show the first page quickly

Displaying the first page quickly can be critical for user engagement.
[53 percent of mobile site visits are abandoned](https://www.thinkwithgoogle.com/marketing-resources/data-measurement/mobile-page-speed-new-industry-benchmarks/) if pages take longer than 3 seconds to load.
Your app may have to launch faster to engage these users before they decide to do something else.

With Angular Universal, you can generate landing pages for the app that look like the complete app.
The pages are pure HTML, and can display even if JavaScript is disabled.
The pages don't handle browser events, but they _do_ support navigation through the site using [`routerLink`](guide/router#router-link).

In practice, you'll serve a static version of the landing page to hold the user's attention.
At the same time, you'll load the full Angular app behind it. 
The user perceives near-instant performance from the landing page
and gets the full interactive experience after the full app loads.

{@a how-does-it-work}

## Universal web servers

A Universal web server responds to application page requests with static HTML rendered by the [Universal template engine](#universal-engine). 
The server receives and responds to HTTP requests from clients (usually browsers), and serves static assets such as scripts, CSS, and images.
It may respond to data requests, either directly or as a proxy to a separate data server.

The sample web server for this guide is based on the popular [Express](https://expressjs.com/) framework.

<div class="alert is-helpful">

  **Note:** _Any_ web server technology can serve a Universal app as long as it can call Universal's `renderModuleFactory()` function.
  The principles and decision points discussed here apply to any web server technology.

</div>

The `platform-server` package, provides server implementations 
of the DOM, `XMLHttpRequest`, and other low-level features that don't rely on a browser.
Compile the client application with the `platform-server` module (instead of the `platform-browser` module)
and run the resulting Universal app on a web server.

The server ([Node Express](https://expressjs.com/) in this guide's example)
passes client requests for application pages to Universal's `renderModuleFactory()` function.

The `renderModuleFactory()` function takes as inputs a *template* HTML page (usually `index.html`),
an Angular *module* containing components,
and a *route* that determines which components to display.
The route comes from the client's request to the server.

Each request results in the appropriate view for the requested route.
The `renderModuleFactory()` function renders the view within the `<app>` tag of the template, 
creating a finished HTML page for the client. 

Finally, the server returns the rendered page to the client.

{@a summary}
## Step 1: Add universal to an existing application

To add Universal support to an existing application use the `ng add` command.

<code-example format="." language="bash">

ng add @nguniversal/express-engine --clientProject <project-name>

</code-example>

The command installs the required dependencies and creates the following folder structure.

<code-example format="." language="none" linenums="false">
src/
  index.html                 <i>app web page</i>
  main.ts                    <i>bootstrapper for client app</i>
  main.server.ts             <i>* bootstrapper for server app</i>
  tsconfig.app.json          <i>TypeScript client configuration</i>
  tsconfig.server.json       <i>* TypeScript server configuration</i>
  tsconfig.spec.json         <i>TypeScript spec configuration</i>
  style.css                  <i>styles for the app</i>
  app/ ...                   <i>application code</i>
    app.server.module.ts     <i>* server-side application module</i>
server.ts                    <i>* express web server</i>
tsconfig.json                <i>TypeScript client configuration</i>
package.json                 <i>npm configuration</i>
webpack.server.config.js     <i>* webpack server configuration</i>
</code-example>

The files marked with `*` are newly generated files.

A few handy scripts are also added in the `scripts` section of the `package.json`.

<code-example format="." language="none" linenums="false">
compile:server                  <i>compile the `server.ts` file and bundle all dependencies</i>
serve:ssr                       <i>run the app on the server</i>
build:ssr                       <i>build the server bundle</i>
build:client-and-server-bundles <i>build the client and server bundles</i>
</code-example>


<div class="alert is-helpful">

  **Note:** The [Universal tutorial](#the-example) below walks you through the steps using the Tour of Heroes sample app, and goes into more detail about what you can do and why you might want to do it. 
 
  To see a working version of an app with server-side rendering, clone the [Angular Universal starter](https://github.com/angular/universal-starter). 

</div>

<div class="callout is-critical">

<header>Security for server requests</header>

HTTP requests issued from a browser app aren't the same as those issued by the Universal app on the server.
Universal HTTP requests have different security requirements

When a browser makes an HTTP request, the server can make assumptions about cookies, XSRF headers, and so on. 
For example, the browser automatically sends authentication cookies for the current user.
Angular Universal can't forward these credentials to a separate data server.
If your server handles HTTP requests, you'll have to add your own security plumbing.

</div>

## Step 2: Build the client and server bundles

To build the client and server bundles and pack the server application into a single file `server.js`, use the helper script `build:ssr`.

<code-example format="." language="none" linenums="false">
npm run build:ssr

Date: 2019-01-18T10:53:24.730Z
Hash: ca215a8b40dbbe2599b5
Time: 17003ms
chunk {0} runtime.b57bf819d5bdce77f1c7.js (runtime) 1.41 kB [entry] [rendered]
chunk {1} main.cefb84fae611a65366a1.js (main) 264 kB [initial] [rendered]
chunk {2} polyfills.20d0bb3b90b253b298ff.js (polyfills) 41 kB [initial] [rendered]
chunk {3} styles.3ff695c00d717f2d2a11.css (styles) 0 bytes [initial] [rendered]

Date: 2019-01-18T10:53:37.124Z
Hash: 5cd6732082cb3d2274c8
Time: 7273ms
chunk {main} main.js, main.js.map (main) 52.4 kB [entry] [rendered]

Hash: cc14f8aa4dc4677bbd2e
Version: webpack 4.28.4
Time: 10125ms
Built at: 01/18/2019 11:53:49 AM
    Asset      Size  Chunks             Chunk Names
server.js  5.58 MiB       0  [emitted]  server
Entrypoint server = server.js
  [0] ./server.ts 1.58 KiB {0} [built]
  [2] external "events" 42 bytes {0} [built]
  [3] external "fs" 42 bytes {0} [built]
  [4] external "timers" 42 bytes {0} [optional] [built]
  [5] external "crypto" 42 bytes {0} [built]
[208] ./src lazy namespace object 160 bytes {0} [built]
[220] external "url" 42 bytes {0} [built]
[275] external "http" 42 bytes {0} [built]
[276] external "https" 42 bytes {0} [built]
[277] external "os" 42 bytes {0} [built]
[287] external "path" 42 bytes {0} [built]
[296] external "util" 42 bytes {0} [built]
[304] external "net" 42 bytes {0} [built]
[309] external "buffer" 42 bytes {0} [built]
[414] ./dist/server/main.js 52.4 KiB {0} [built]
</code-example>


The project's `dist/` folder now contains both browser and server folders.

<code-example format="." language="none" linenums="false">
dist/
   browser/
   server/
</code-example>

## Step 3: Run the server

To run the app on the server, type the following in a command shell.

<code-example format="." language="bash" linenums="false">
npm run serve:ssr
</code-example>


### Working around the browser APIs

Because a Universal `platform-server` app doesn't execute in the browser, you may have to work around some of the browser APIs and capabilities that are missing on the server.

For example, your server-side page can't reference browser-only native objects such as `window`, `document`, `navigator`, or `location`. 
If you don't need these on the server-rendered page, you can side-step them with conditional logic.
Alternatively, you can find an injectable Angular abstraction over the object you need such as `Location` or `Document`;
it may substitute adequately for the specific API that you're calling.
If Angular doesn't provide it, you can write your own abstraction that delegates to the browser API while in the browser and to a satisfactory alternative implementation while on the server.

Similarly, without mouse or keyboard events, a server-side app can't rely on a user clicking a button to show a component.
The app must determine what to render based solely on the incoming client request.
This is a good argument for making the app [routable](guide/router).

Because the user of a server-rendered page can't do much more than click links,
you should swap in the real client app as quickly as possible for a proper interactive experience.

{@a the-example}

## Universal tutorial 

The [Tour of Heroes tutorial](tutorial) is the foundation for this walkthrough. 

The core application files are mostly untouched, with a few exceptions described below.
You'll add more files to support building and serving with Universal.

In this example, the Angular CLI compiles and bundles the Universal version of the app with the
[Ahead-of-Time (AoT) compiler](guide/aot-compiler).
A Node Express web server turns client requests into the HTML pages rendered by Universal.

To create server-side app module, `app.server.module.ts`, run the following CLI command.

<code-example format="." language="bash">

ng add @nguniversal/express-engine --clientProject angular.io-example

</code-example>


{@a http-urls}

### Using absolute URLs for server requests

The tutorial's `HeroService` and `HeroSearchService` delegate to the Angular `HttpClient` module to fetch application data.
These services send requests to _relative_ URLs such as `api/heroes`.
In a Universal app, HTTP URLs must be _absolute_ (for example, `https://my-server.com/api/heroes`) even when the Universal web server is capable of handling relative requests.
This means you need to change your services to make requests with absolute URLs when running on the server and with relative URLs when running in the browser.

One solution is to provide the server's runtime origin under Angular's [`APP_BASE_HREF`](api/common/APP_BASE_HREF) token,
inject it into the service, and prepend the origin to the request URL.

Start by changing the `HeroService` constructor to take a second `origin` parameter that is optionally injected via the `APP_BASE_HREF` token.

<code-example path="universal/src/app/hero.service.ts" region="ctor" header="src/app/hero.service.ts (constructor with optional origin)">
</code-example>

The constructor uses the `@Optional()` directive to prepend the origin to `heroesUrl` _if it exists_.
You don't provide `APP_BASE_HREF` in the browser version, so `heroesUrl` remains relative.

<div class="alert is-helpful">

  **Note:** You can ignore `APP_BASE_HREF` in the browser if you've specified `<base href="/">` in the `index.html` file to satisfy the router's need for a base address (as the tutorial sample does).

</div>

{@a universal-engine}
### Universal template engine

The important bit in the `server.ts` file is the `ngExpressEngine()` function.

<code-example path="universal/server.ts" header="server.ts" region="ngExpressEngine">
</code-example>

The `ngExpressEngine()` function is a wrapper around Universal's `renderModuleFactory()` function which turns a client's requests into server-rendered HTML pages.
You'll call that function within a _template engine_ that's appropriate for your server stack.

* The first parameter is `AppServerModule`.
It's the bridge between the Universal server-side renderer and your application.

* The second parameter, `extraProviders`, is optional. It lets you specify dependency providers that apply only when running on this server.
You can do this when your app needs information that can only be determined by the currently running server instance. 
The required information in this case is the running server's *origin*, provided under the `APP_BASE_HREF` token, so that the app can [calculate absolute HTTP URLs](#http-urls).

The `ngExpressEngine()` function returns a `Promise` callback that resolves to the rendered page. 
It's up to your engine to decide what to do with that page.
This engine's `Promise` callback returns the rendered page to the web server,
which then forwards it to the client in the HTTP response.

<div class="alert is-helpful">

  **Note:**  These wrappers help hide the complexity of the `renderModuleFactory()` function. There are more wrappers for different backend technologies
  at the [Universal repository](https://github.com/angular/universal).

</div>

### Filtering request URLs

The web server must distinguish _app page requests_ from other kinds of requests.

It's not as simple as intercepting a request to the root address `/`.
The browser could ask for one of the application routes such as `/dashboard`, `/heroes`, or `/detail:12`.
In fact, if the app were only rendered by the server, _every_ app link clicked would arrive at the server
as a navigation URL intended for the router.

Fortunately, application routes have something in common: their URLs lack file extensions. 
(Data requests also lack extensions but they're easy to recognize because they always begin with `/api`.)
All static asset requests have a file extension (such as `main.js` or `/node_modules/zone.js/dist/zone.js`).

Because we use routing, we can easily recognize the three types of requests and handle them differently.

1. Data request -  request URL that begins `/api`.
2. App navigation - request URL with no file extension.
3. Static asset - all other requests.

A Node Express server is a pipeline of middleware that filters and processes URL requests one after the other. 
You configure the Node Express server pipeline with calls to `app.get()` like this one for data requests.

<code-example path="universal/server.ts" header="server.ts (data URL)" region="data-request" linenums="false">
</code-example>

<div class="alert is-helpful">

  **Note:** This sample server doesn't handle data requests.

  The tutorial's "in-memory web API" module, a demo and development tool, intercepts all HTTP calls and
  simulates the behavior of a remote data server.
  In practice, you would remove that module and register your web API middleware on the server here.

</div>

The following code filters for request URLs with no extensions and treats them as navigation requests.

<code-example path="universal/server.ts" header="server.ts (navigation)" region="navigation-request" linenums="false">
</code-example>

### Serving static files safely

A single `app.use()` treats all other URLs as requests for static assets
such as JavaScript, image, and style files.

To ensure that clients can only download the files that they are permitted to see, put all client-facing asset files in the `/dist` folder and only honor requests for files from the `/dist` folder.

The following Node Express code routes all remaining requests to `/dist`, and returns a `404 - NOT FOUND` error if the file isn't found.

<code-example path="universal/server.ts" header="server.ts (static files)" region="static" linenums="false">
</code-example>


### Universal in action

Open a browser to http://localhost:4000/.
You should see the familiar Tour of Heroes dashboard page.

Navigation via `routerLinks` works correctly.
You can go from the Dashboard to the Heroes page and back.
You can click a hero on the Dashboard page to display its Details page.

Notice, however, that clicks, mouse-moves, and keyboard entries are inert.

* Clicking a hero on the Heroes page does nothing.
* You can't add or delete a hero.
* The search box on the Dashboard page is ignored.
* The *Back* and *Save* buttons on the Details page don't work.

User events other than `routerLink` clicks aren't supported.
You must wait for the full client app to arrive.
It won't arrive until you compile the client app
and move the output into the `dist/` folder.

The transition from the server-rendered app to the client app happens quickly on a development machine.
You can simulate a slower network to see the transition more clearly and
better appreciate the launch-speed advantage of a Universal app running on a low-powered, poorly connected device.

Open the Chrome Dev Tools and go to the Network tab.
Find the [Network Throttling](https://developers.google.com/web/tools/chrome-devtools/network-performance/reference#throttling) dropdown on the far right of the menu bar.

Try one of the "3G" speeds.
The server-rendered app still launches quickly but the full client app may take seconds to load.
