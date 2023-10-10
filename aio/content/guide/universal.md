# Server-side rendering (SSR) with Angular Universal

This guide describes **Angular Universal**, a technology that allows Angular to render applications on the server.

By default, Angular renders applications only in a *browser*. Angular Universal allows Angular to render an application on the *server*, generating *static* HTML content, which represents an application state. Once the HTML content is rendered in a browser, Angular bootstraps an application and reuses the information available in the server-generated HTML.

With server-side rendering an application generally renders in a browser faster, giving users a chance to view the application UI before it becomes fully interactive. See the ["Why use Server-Side Rendering?"](#why-do-it) section below for additional information.

Also for a more detailed look at different techniques and concepts surrounding SSR, check out this [article](https://developers.google.com/web/updates/2019/02/rendering-on-the-web).

You can enable server-side rendering in your Angular application using the `@nguniversal/express-engine` package as described below.

<div class="alert is-helpful">

Angular Universal requires an [active LTS or maintenance LTS](https://nodejs.org/about/releases) version of Node.js.
For information see the [version compatibility](guide/versions) guide to learn about the currently supported versions.

</div>

<a id="the-example"></a>

## Universal tutorial

The [Tour of Heroes tutorial](tutorial/tour-of-heroes) is the foundation for this walkthrough.

In this example, the Angular CLI compiles and bundles the Universal version of the application with the [Ahead-of-Time (AOT) compiler](guide/aot-compiler).
A Node.js Express web server compiles HTML pages with Universal based on client requests.

<div class="alert is-helpful">

<live-example downloadOnly>Download the finished sample code</live-example>, which runs in a [Node.js® Express](https://expressjs.com) server.

</div>

<div class="alert is-helpful">

This is the guide for Angular Universal with [Standalone Applications](guide/standalone-components).
If your application is built with [NgModules](guide/ngmodules), see [Angular Universal applications with NgModules](guide/universal-ngmodule).

</div>


<a id="universal-cli-command"></a>

### Step 1. Enable Server-Side Rendering

Run the following Angular CLI command to add SSR support into your application:

<code-example format="shell" language="shell">

ng add &commat;nguniversal/express-engine

</code-example>

The command updates the application code to enable SSR and adds extra files to the project structure (files that are marked with the `*` symbol).

</div>

<div class='filetree'>
    <div class='file'>
        src
    </div>
    <div class='children'>
        <div class='file'>
          index.html &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // &lt;-- app web page
        </div>
        <div class='file'>
          main.ts &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // &lt;-- bootstrapper for client app
        </div>
        <div class='file'>
          main.server.ts &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // &lt;-- &ast; bootstrapper for server app
        </div>
        <div class='file'>
          style.css &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // &lt;-- styles for the app
        </div>
        <div class='file'>
          app/ &nbsp;&hellip; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // &lt;-- application code
        </div>
        <div class='children'>
            <div class='file'>
              app.config.ts &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // &lt;-- client-side application configuration
            </div>
        </div>
        <div class='children'>
            <div class='file'>
              app.config.server.ts &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // &lt;-- &ast; server-side application configuration
            </div>
        </div>
        <div class='children'>
            <div class='file'>
              app.routes.ts &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // &lt;-- client-side application routes
            </div>
        </div>
        <div class='file'>
          server.ts &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // &lt;-- &ast; express web server
        </div>
        <div class='file'>
          tsconfig.json &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // &lt;-- TypeScript base configuration
        </div>
        <div class='file'>
          tsconfig.app.json &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // &lt;-- TypeScript browser application configuration
        </div>
        <div class='file'>
          tsconfig.server.json &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // &lt;-- TypeScript server application configuration
        </div>
        <div class='file'>
          tsconfig.spec.json &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // &lt;-- TypeScript tests configuration
        </div>
    </div>
</div>


<div class="alert is-important">

This CLI command succeeds _only if your standalone application is bootstrapped in the recommended way_ with `app.config.ts` and `app.routes.ts` files.

If your Angular application doesn't follow this practice, you can quickly and easily refactor to that practice, as [explained below](#boot-with-app-config), before you run the command.

</div>

### Step 2. Enable Client Hydration

Hydration is the process that restores the server side rendered application on the client. This includes things like reusing the server rendered DOM structures, persisting the application state, transferring application data that was retrieved already by the server, and other processes. Learn more about hydration in [this guide](guide/hydration).

<div class="alert is-important">

The hydration feature is available for [developer preview](/guide/releases#developer-preview). It's ready for you to try, but it might change before it is stable.

</div>

You can enable hydration by updating the `app.config.ts` file. 

Import the `provideClientHydration` function from `@angular/platform-browser` and add the function call to the `providers` section as shown below.

<code-example path="universal/src/app/app.config.ts" region="client-hydration"></code-example>


### Step 3. Start the server

To start rendering your application with Universal on your local system, use the following command.

<code-example format="shell" language="shell">

npm run dev:ssr

</code-example>

### Step 4. Run your application in a browser

Once the web server starts, open a browser and navigate to `http://localhost:4200`.
You should see the familiar Tour of Heroes dashboard page.

Navigation using `routerLinks` works correctly because they use the built-in anchor \(`<a>`\) elements.
You can go from the Dashboard to the Heroes page and back.
Click a hero on the Dashboard page to display its Details page.

If you throttle your network speed so that the client-side scripts take longer to download \(instructions following\), you'll notice:

*   You can't add or delete a hero
*   The search box on the Dashboard page is ignored
*   The *Back* and *Save* buttons on the Details page don't work

The transition from the server-rendered application to the client application happens quickly on a development machine, but you should always test your applications in real-world scenarios.

You can simulate a slower network to see the transition more clearly as follows:

1.  Open the Chrome Dev Tools and go to the Network tab.
1.  Find the [Network Throttling](https://developers.google.com/web/tools/chrome-devtools/network-performance/reference#throttling) dropdown on the far right of the menu bar.
1.  Try one of the "3G" speeds.

The server-rendered application still launches quickly but the full client application might take seconds to load.

<a id="why-do-it"></a>

## Why use Server-Side Rendering?

There are three main reasons to create a Universal version of your application.

*   Facilitate web crawlers through [search engine optimization (SEO)](https://static.googleusercontent.com/media/www.google.com/en//webmasters/docs/search-engine-optimization-starter-guide.pdf)
*   Improve performance on mobile and low-powered devices
*   Show the first page quickly with a [first-contentful paint (FCP)](https://developers.google.com/web/tools/lighthouse/audits/first-contentful-paint)

<a id="seo"></a>
<a id="web-crawlers"></a>

### Facilitate web crawlers (SEO)

Google, Bing, Facebook, Twitter, and other social media sites rely on web crawlers to index your application content and make that content searchable on the web.
These web crawlers might be unable to navigate and index your highly interactive Angular application as a human user could do.

Angular Universal can generate a static version of your application that is easily searchable, linkable, and navigable without JavaScript.
Universal also makes a site preview available because each URL returns a fully rendered page.

<a id="no-javascript"></a>

### Improve performance on mobile and low-powered devices

Some devices don't support JavaScript or execute JavaScript so poorly that the user experience is unacceptable.
For these cases, you might require a server-rendered, no-JavaScript version of the application.
This version, however limited, might be the only practical alternative for people who otherwise couldn't use the application at all.

<a id="startup-performance"></a>

### Show the first page quickly

Displaying the first page quickly can be critical for user engagement.
Pages that load faster perform better, [even with changes as small as 100ms](https://web.dev/shopping-for-speed-on-ebay).
Your application might have to launch faster to engage these users before they decide to do something else.

With Angular Universal, you can generate landing pages for the application that look like the complete application.
The pages are pure HTML, and can display even if JavaScript is disabled.
The pages don't handle browser events, but they *do* support navigation through the site using [`routerLink`](guide/router-reference#router-link).

In practice, you'll serve a static version of the landing page to hold the user's attention.
At the same time, you'll load the full Angular application behind it.
The user perceives near-instant performance from the landing page and gets the full interactive experience after the full application loads.

<a id="how-does-it-work"></a>

## Universal web servers

A Universal web server responds to application page requests with static HTML rendered by the [Universal template engine](#universal-engine).
The server receives and responds to requests from clients \(usually browsers\), and serves static assets such as scripts, CSS, and images.
It might respond to data requests, either directly or as a proxy to a separate data server.

Universal applications use the Angular `platform-server` package \(as opposed to `platform-browser`\), which provides
server implementations of the DOM, `XMLHttpRequest`, and other low-level features that don't rely on a browser.

The web server for this guide is [Node.js Express](https://expressjs.com), configured to pass client requests for application pages to Angular's `ngExpressEngine`. This engine renders the app while also providing caching and other helpful utilities.

The engine's render function takes as inputs a *template* page \(usually `index.html`\), a function returning a `Promise` that resolves to an `ApplicationRef`, and a *route* that determines which components to display. The route comes from the client's request to the server.

Each request results in the appropriate view for the requested route.
The render function renders the view within the `<app>` tag of the template, creating a finished HTML page for the client.

Finally, the server returns the rendered page to the client.

### Caching data when using HttpClient
By default, the [`provideClientHydration()`](api/platform-browser/provideClientHydration) function enables the recommended set of features for the optimal performance for most of the applications. It includes the following features:
* Reconciling DOM hydration (learn more about it [here](guide/hydration)).
* [`HttpClient`](api/common/http/HttpClient) response caching while running on the server and transferring this cache to the client to avoid extra HTTP requests.

While running on the server, data caching is performed for every `HEAD` and `GET` requests done by the [`HttpClient`](api/common/http/HttpClient). After that this information is serialized and transferred to a browser as a part of the initial HTML sent from the server after server-side rendering. In a browser, [`HttpClient`](api/common/http/HttpClient) checks whether it has data in the cache and if so, reuses it instead of making a new HTTP request during initial application rendering. HttpClient stops using the cache once an application becomes [stable](api/core/ApplicationRef#isStable) while running in a browser.

### Working around the browser APIs

Because a Universal application doesn't execute in the browser, some of the browser APIs and capabilities might be missing on the server.

For example, server-side applications can't reference browser-only global objects such as `window`, `document`, `navigator`, or `location`.

Angular provides some injectable abstractions over these objects, such as [`Location`](api/common/Location) or [`DOCUMENT`](api/common/DOCUMENT); it might substitute adequately for these APIs.
If Angular doesn't provide it, it's possible to write new abstractions that delegate to the browser APIs while in the browser and to an alternative implementation while on the server \(also known as shimming\).

Similarly, without mouse or keyboard events, a server-side application can't rely on a user clicking a button to show a component.
The application must determine what to render based solely on the incoming client request.
This is a good argument for making the application [routable](guide/router).

<a id="service-worker"></a>
### Universal and the Angular Service Worker

If you are using Universal in conjunction with the Angular service worker, the behavior is different than the normal server side rendering behavior. The initial server request will be rendered on the server as expected. However, after that initial request, subsequent requests are handled by the service worker. For subsequent requests, the `index.html` file is served statically and bypasses server side rendering.

<a id="universal-engine"></a>

### Universal template engine

The `server.ts` file configures the Universal template engine. The core of a typical implementation looks like this:

<code-example header="server.ts (excerpt)" path="universal/server.ts" region="core"></code-example>

Focus on the `ngExpressEngine()` function which turns a client's requests for Angular pages into server-rendered HTML pages.

<code-example path="universal/server.ts" region="ngExpressEngine"></code-example>

The function accepts an object with the following properties:

| Properties       | Details |
|:---              |:---     |
| `bootstrap`      | The bootstrapping function that returns a `Promise` resolving to an `ApplicationRef` for the application to render on the server. It's the bridge between the Universal server-side renderer and the Angular application. |
| _`extraProviders`_ | This _optional_ property lets you specify dependency providers that apply only when rendering the application on the server. Do this when your application needs information that can only be determined by the currently running server instance.       |

The `bootstrap` function comes from `main.server.ts`, generated by the CLI command that created your universal app.

<code-example header="main.server.ts (excerpt)" path="universal/src/main.server.ts" region="bootstrap"></code-example>

The `ngExpressEngine()` function returns a `Promise` callback that resolves to the rendered page. The web server resolves the promise and forwards the page to the client.

### Filtering request URLs

By default, if the application were only rendered by the server, *every* application link clicked would arrive at the server as a navigation URL intended for the router.

However, most server implementations have to handle requests for at least three very different kinds of resources: _data_, _application pages_, and _static files_.
Fortunately, the URLs for these different requests are easily recognized.

| Routing request types | Details |
|:---                   |:---     |
| Data request          | Request URL that begins `/api`     |
| App navigation        | Request URL with no file extension |
| Static asset          | Request URL with file extension    |

The `server.ts` generated by the CLI already makes these basic distinctions.
You may have to modify it to satisfy your specific application needs.

#### Serving Data

A Node.js Express server is a pipeline of middleware that filters and processes requests one after the other.

For data requests, you could configure the Node.js Express server pipeline with calls to `server.get()` as follows:

<code-example header="server.ts (data API)" path="universal/server.ts" region="data-request"></code-example>

<div class="alert is-helpful">

This guide's `server.ts` _doesn't handle data requests_. It returns a `404 - Not Found` for all data API requests.

For demonstration purposes, this tutorial intercepts all HTTP data calls from the client _before they go to the server_ and simulates the behavior of a remote data server, using Angular's "in-memory web API" demo package. 

In practice, you would remove the following "in-memory web API" code from `app.config.ts`.

<code-example header="app.config.ts (in-memory web API)" path="universal/src/app/app.config.ts" region="in-mem"></code-example>

Then register your data API middleware in `server.ts`.

</div>

#### App Navigation

Application routes look like this: `/dashboard`, `/heroes`, `/detail:12`. 
While they have a lot of variety, what they all have in common is `no file extension`.

The following code filters for request URLs with no extensions and treats them as navigation requests:

<code-example header="server.ts (navigation)" path="universal/server.ts" region="navigation-request"></code-example>

#### Serving Static Files Safely

All static asset requests such as for JavaScript, image, and style files have a file extension (examples: `main.js`, `assets/favicon.ico`, `src/app/styles.css`).
They won't be confused with navigation or data requests if you filter for files with an extension.

To ensure that clients can only download the files that they are permitted to see, put all client-facing asset files in the `/dist` folder and only honor requests for files from the `/dist` folder.

The following Node.js Express code routes all requests for files with an extension (`*.*`) to `/dist`, and returns a `404 - NOT FOUND` error if the
file isn't found.

<code-example header="server.ts (static files)" path="universal/server.ts" region="static"></code-example>

### Useful scripts

| Scripts                                                                                                    | Details |
|:---                                                                                                        |:---     |
| <code-example format="shell" language="shell"> npm run dev:ssr </code-example>                            | Similar to [`ng serve`](cli/serve), which offers live reload during development, but uses server-side rendering. The application runs in watch mode and refreshes the browser after every change. This command is slower than the actual `ng serve` command.                                                                                                                                                  |
| <code-example format="shell" language="shell"> ng build &amp;&amp; ng run app-name:server </code-example> | Builds both the server script and the application in production mode. Use this command when you want to build the project for deployment.                                                                                                                                                                                                                                                                     |
| <code-example format="shell" language="shell"> npm run serve:ssr </code-example>                          | Starts the server script for serving the application locally with server-side rendering. It uses the build artifacts created by `npm run build:ssr`, so make sure you have run that command as well. <div class="alert is-helpful">`serve:ssr` is not intended to be used to serve your application in production, but only for testing the server-side rendered application locally. </div> |
| <code-example format="shell" language="shell"> npm run prerender </code-example>                          | Used to prerender an application's pages. Read more about prerendering [here](guide/prerendering).                                                                                                                                                                                                                                                                                                            |

<a id="boot-with-app-config"></a>

## Bootstrapping the client with `app.config.ts`

The [CLI command](#universal-cli-command) to generate a Universal Application assumes that your standalone application's`main.ts` bootstraps with the `appConfig` object exported from your `app.config.ts` like this.

<code-example header="main.ts (extract)" path="universal/src/main.ts" region="bootstrap"></code-example>

If your existing app doesn't follow this practice, you can quickly refactor before running the CLI command.

### Refactoring Example

Suppose your standalone application has a do-everything`main.ts` something like this:

<code-example header="main.ts (before refactoring)" path="universal/doc-files/main.old.ts"></code-example>

It defines all of the application routes and bootstraps with an inline `ApplicationConfig` object that lists providers. 
You'll need to extract these configuration details into their own files.

1. Extract the routes into a separate file called `app.routes.ts`:

<code-example header="app/app.routes.ts" path="universal/src/app/app.routes.ts"></code-example>

2. Extract the configuration object into a separate file called `app.config.ts`:

<code-example header="app/app.config.ts" path="universal/src/app/app.config.ts" region="core"></code-example>

3. Reduce `main.ts` to a streamlined form that references the `appConfig` object exported by `app.config.ts`:

<code-example header="main.ts" path="universal/src/main.ts"></code-example>

### Why this is a good idea

The Universal server needs the same configuration as your client.
You'd prefer to maintain that configuration _in one place_ so that configuration stays in sync on both the client and the universal server. 

This simplicity also enables the CLI command to generate a `main.server.ts` that looks so much like `main.ts`:

<code-example header="main.server.ts" path="universal/src/main.server.ts"></code-example>

The exported `bootstrap` function is exactly what the `ngExpressEngine()` function requires in `server.ts`.

<code-example path="universal/server.ts" region="ngExpressEngine"></code-example>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2023-08-29
