# Server-side Rendering (SSR): An intro to Angular Universal

This guide describes **Angular Universal**, a technology that renders Angular applications on the server.

A normal Angular application executes in the _browser_, rendering pages in the DOM in response to user actions.
Angular Universal executes on the _server_, generating _static_ application pages that later get bootstrapped on
the client. This means that the application generally renders more quickly, giving users a chance to view the application
layout before it becomes fully interactive.

For a more detailed look at different techniques and concepts surrounding SSR, please check out this
[article](https://developers.google.com/web/updates/2019/02/rendering-on-the-web).

You can easily prepare an app for server-side rendering using the [Angular CLI](guide/glossary#cli).
The CLI schematic `@nguniversal/express-engine` performs the required steps, as described below.

<div class="alert is-helpful">

  **Note:** [Download the finished sample code](generated/zips/universal/universal.zip),
  which runs in a [Node.js® Express](https://expressjs.com/) server.

</div>

{@a the-example}
## Universal tutorial

The [Tour of Heroes tutorial](tutorial) is the foundation for this walkthrough.

In this example, the Angular CLI compiles and bundles the Universal version of the app with the
[Ahead-of-Time (AoT) compiler](guide/aot-compiler).
A Node Express web server compiles HTML pages with Universal based on client requests.

To create the server-side app module, `app.server.module.ts`, run the following CLI command.

<code-example language="bash">

ng add @nguniversal/express-engine --clientProject angular.io-example

</code-example>

The command creates the following folder structure.

<code-example language="none">
src/
  index.html                 <i>app web page</i>
  main.ts                    <i>bootstrapper for client app</i>
  main.server.ts             <i>* bootstrapper for server app</i>
  style.css                  <i>styles for the app</i>
  app/ ...                   <i>application code</i>
    app.server.module.ts     <i>* server-side application module</i>
server.ts                    <i>* express web server</i>
tsconfig.json                <i>TypeScript client configuration</i>
tsconfig.app.json            <i>TypeScript client configuration</i>
tsconfig.server.json         <i>* TypeScript server configuration</i>
tsconfig.spec.json           <i>TypeScript spec configuration</i>
package.json                 <i>npm configuration</i>
webpack.server.config.js     <i>* webpack server configuration</i>
</code-example>

The files marked with `*` are new and not in the original tutorial sample.

### Universal in action

To start rendering your app with Universal on your local system, use the following command.

<code-example language="bash">
npm run build:ssr && npm run serve:ssr
</code-example>

Open a browser and navigate to http://localhost:4000/.
You should see the familiar Tour of Heroes dashboard page.

Navigation via `routerLinks` works correctly because they use the native anchor (`<a>`) tags.
You can go from the Dashboard to the Heroes page and back.
You can click a hero on the Dashboard page to display its Details page.

If you throttle your network speed so that the client-side scripts take longer to download (instructions below),
you'll notice:
* Clicking a hero on the Heroes page does nothing.
* You can't add or delete a hero.
* The search box on the Dashboard page is ignored.
* The *Back* and *Save* buttons on the Details page don't work.

User events other than `routerLink` clicks aren't supported.
You must wait for the full client app to bootstrap and run, or buffer the events using libraries like
[preboot](https://github.com/angular/preboot), which allow you to replay these events once the client-side scripts load.

The transition from the server-rendered app to the client app happens quickly on a development machine, but you should
always test your apps in real-world scenarios.

You can simulate a slower network to see the transition more clearly as follows:

1. Open the Chrome Dev Tools and go to the Network tab.
1. Find the [Network Throttling](https://developers.google.com/web/tools/chrome-devtools/network-performance/reference#throttling)
dropdown on the far right of the menu bar.
1. Try one of the "3G" speeds.

The server-rendered app still launches quickly but the full client app may take seconds to load.

{@a why-do-it}
## Why use server-side rendering?

There are three main reasons to create a Universal version of your app.

1. Facilitate web crawlers through [search engine optimization (SEO)](https://static.googleusercontent.com/media/www.google.com/en//webmasters/docs/search-engine-optimization-starter-guide.pdf)
1. Improve performance on mobile and low-powered devices
1. Show the first page quickly with a [first-contentful paint (FCP)](https://developers.google.com/web/tools/lighthouse/audits/first-contentful-paint)

{@a seo}
{@a web-crawlers}
### Facilitate web crawlers (SEO)

Google, Bing, Facebook, Twitter, and other social media sites rely on web crawlers to index your application content and
make that content searchable on the web.
These web crawlers may be unable to navigate and index your highly interactive Angular application as a human user could do.

Angular Universal can generate a static version of your app that is easily searchable, linkable, and navigable without JavaScript.
Universal also makes a site preview available since each URL returns a fully rendered page.

{@a no-javascript}
### Improve performance on mobile and low-powered devices

Some devices don't support JavaScript or execute JavaScript so poorly that the user experience is unacceptable.
For these cases, you may require a server-rendered, no-JavaScript version of the app.
This version, however limited, may be the only practical alternative for
people who otherwise couldn't use the app at all.

{@a startup-performance}
### Show the first page quickly

Displaying the first page quickly can be critical for user engagement.
[53 percent of mobile site visits are abandoned](https://www.thinkwithgoogle.com/marketing-resources/data-measurement/mobile-page-speed-new-industry-benchmarks/)
if pages take longer than 3 seconds to load.
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

Universal applications use the Angular `platform-server` package (as opposed to `platform-browser`), which provides
server implementations of the DOM, `XMLHttpRequest`, and other low-level features that don't rely on a browser.

The server ([Node Express](https://expressjs.com/) in this guide's example)
passes client requests for application pages to the NgUniversal `ngExpressEngine`. Under the hood, this
calls Universal's `renderModuleFactory()` function, while providing caching and other helpful utilities.

The `renderModuleFactory()` function takes as inputs a *template* HTML page (usually `index.html`),
an Angular *module* containing components,
and a *route* that determines which components to display.
The route comes from the client's request to the server.

Each request results in the appropriate view for the requested route.
The `renderModuleFactory()` function renders the view within the `<app>` tag of the template,
creating a finished HTML page for the client.

Finally, the server returns the rendered page to the client.

### Working around the browser APIs

Because a Universal app doesn't execute in the browser, some of the browser APIs and capabilities may be missing on the server.

For example, server-side applications can't reference browser-only global objects such as `window`, `document`, `navigator`, or `location`.

Angular provides some injectable abstractions over these objects, such as [`Location`](api/common/Location)
or [`DOCUMENT`](api/common/DOCUMENT); it may substitute adequately for these APIs.
If Angular doesn't provide it, it's possible to write new abstractions that delegate to the browser APIs while in the browser
and to an alternative implementation while on the server (aka shimming).

Similarly, without mouse or keyboard events, a server-side app can't rely on a user clicking a button to show a component.
The app must determine what to render based solely on the incoming client request.
This is a good argument for making the app [routable](guide/router).

{@a http-urls}
### Using absolute URLs for server requests

The tutorial's `HeroService` and `HeroSearchService` delegate to the Angular `HttpClient` module to fetch application data.
These services send requests to _relative_ URLs such as `api/heroes`.
In a Universal app, HTTP URLs must be _absolute_ (for example, `https://my-server.com/api/heroes`).
This means you need to change your services to make requests with absolute URLs when running on the server and with relative
URLs when running in the browser.

One solution is to provide the full URL to your application on the server, and write an interceptor that can retrieve this
value and prepend it to the request URL. If you're using the `ngExpressEngine`, as shown in the example in this guide, half
the work is already done. We'll assume this is the case, but it's trivial to provide the same functionality.

Start by creating an [HttpInterceptor](api/common/http/HttpInterceptor):

<code-example language="typescript">

import {Injectable, Inject, Optional} from '@angular/core';
import {HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders} from '@angular/common/http';
import {Request} from 'express';
import {REQUEST} from '@nguniversal/express-engine/tokens';

@Injectable()
export class UniversalInterceptor implements HttpInterceptor {

  constructor(@Optional() @Inject(REQUEST) protected request: Request) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let serverReq: HttpRequest<any> = req;
    if (this.request) {
      let newUrl = `${this.request.protocol}://${this.request.get('host')}`;
      if (!req.url.startsWith('/')) {
        newUrl += '/';
      }
      newUrl += req.url;
      serverReq = req.clone({url: newUrl});
    }
    return next.handle(serverReq);
  }
}

</code-example>

Next, provide the interceptor in the providers for the server `AppModule` (app.server.module.ts):

<code-example language="typescript">

import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {UniversalInterceptor} from './universal-interceptor';

@NgModule({
  ...
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: UniversalInterceptor,
    multi: true
  }],
})
export class AppServerModule {}

</code-example>

Now, on every HTTP request made on the server, this interceptor will fire and replace the request URL with the absolute
URL provided in the Express `Request` object.

{@a universal-engine}
### Universal template engine

The important bit in the `server.ts` file is the `ngExpressEngine()` function.

<code-example path="universal/server.ts" header="server.ts" region="ngExpressEngine">
</code-example>

The `ngExpressEngine()` function is a wrapper around Universal's `renderModuleFactory()` function which turns a client's
requests into server-rendered HTML pages.

* The first parameter is `AppServerModule`.
It's the bridge between the Universal server-side renderer and the Angular application.

* The second parameter, `extraProviders`, is optional. It lets you specify dependency providers that apply only when
running on this server.
You can do this when your app needs information that can only be determined by the currently running server instance.
One example could be the running server's *origin*, which could be used to [calculate absolute HTTP URLs](#http-urls) if
not using the `Request` token as shown above.

The `ngExpressEngine()` function returns a `Promise` callback that resolves to the rendered page.
It's up to the engine to decide what to do with that page.
This engine's `Promise` callback returns the rendered page to the web server,
which then forwards it to the client in the HTTP response.

<div class="alert is-helpful">

  **Note:**  These wrappers help hide the complexity of the `renderModuleFactory()` function. There are more wrappers
  for different backend technologies at the [Universal repository](https://github.com/angular/universal).

</div>

### Filtering request URLs

NOTE: the basic behavior described below is handled automatically when using the NgUniversal Express schematic, this
is helpful when trying to understand the underlying behavior or replicate it without using the schematic.

The web server must distinguish _app page requests_ from other kinds of requests.

It's not as simple as intercepting a request to the root address `/`.
The browser could ask for one of the application routes such as `/dashboard`, `/heroes`, or `/detail:12`.
In fact, if the app were only rendered by the server, _every_ app link clicked would arrive at the server
as a navigation URL intended for the router.

Fortunately, application routes have something in common: their URLs lack file extensions.
(Data requests also lack extensions but they're easy to recognize because they always begin with `/api`.)
All static asset requests have a file extension (such as `main.js` or `/node_modules/zone.js/dist/zone.js`).

Because we use routing, we can easily recognize the three types of requests and handle them differently.

1. **Data request**: request URL that begins `/api`.
1. **App navigation**: request URL with no file extension.
1. **Static asset**: all other requests.

A Node Express server is a pipeline of middleware that filters and processes requests one after the other.
You configure the Node Express server pipeline with calls to `app.get()` like this one for data requests.

<code-example path="universal/server.ts" header="server.ts (data URL)" region="data-request"></code-example>

<div class="alert is-helpful">

  **Note:** This sample server doesn't handle data requests.

  The tutorial's "in-memory web API" module, a demo and development tool, intercepts all HTTP calls and
  simulates the behavior of a remote data server.
  In practice, you would remove that module and register your web API middleware on the server here.

</div>

The following code filters for request URLs with no extensions and treats them as navigation requests.

<code-example path="universal/server.ts" header="server.ts (navigation)" region="navigation-request"></code-example>

### Serving static files safely

A single `app.use()` treats all other URLs as requests for static assets
such as JavaScript, image, and style files.

To ensure that clients can only download the files that they are permitted to see, put all client-facing asset files in
the `/dist` folder and only honor requests for files from the `/dist` folder.

The following Node Express code routes all remaining requests to `/dist`, and returns a `404 - NOT FOUND` error if the
file isn't found.

<code-example path="universal/server.ts" header="server.ts (static files)" region="static"></code-example>
