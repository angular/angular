# Server-side rendering (SSR) with Angular Universal


Server-Side Rendering (SSR) is a process that involves rendering pages on the server, resulting in static HTML content that mirrors the application's state for each request. Once this server-generated HTML content is produced, Angular initializes the application and utilizes the data contained within the HTML.

The primary advantage of SSR is the enhanced speed at which applications typically render in a browser. This allows users to view the application's user interface before it becomes fully interactive. For more details, refer to the  ["Why use Server-Side Rendering?"](#why-use-ssr) section below.

If you're interested in exploring additional techniques and concepts related to SSR, you can refer to this [article](https://developers.google.com/web/updates/2019/02/rendering-on-the-web).

To enable SSR in your Angular application, follow the steps outlined below.

<a id="the-example"></a>

## Tutorial

The [Tour of Heroes tutorial](tutorial/tour-of-heroes) is the foundation for this walkthrough.

In this example, the Angular application is server rendered using based on client requests.

<div class="alert is-helpful">

<live-example downloadOnly>Download the finished sample code</live-example>, which runs in a [Node.js® Express](https://expressjs.com) server.

</div>

<a id="ssr-cli-command"></a>

### Step 1. Enable Server-Side Rendering

To add SSR to an existing project, use the Angular CLI `ng add` command.

<code-example format="shell" language="shell">

ng add &commat;angular/ssr

</code-example>

<div class="alert is-helpful">

To create an application with server-side rendering capabilities from the beginning use the [ng new --ssr](cli/new) command.

</div>

The command updates the application code to enable SSR and adds extra files to the project structure.

<code-example language="text">

my-app
|-- server.ts                       # application server
└── src
    |-- app
    |   └── app.config.server.ts    # server application configuration
    └── main.server.ts              # main server application bootstrapping

</code-example>

### Step 2. Run your application in a browser

Start the development server.

<code-example language="shell">

ng serve

</code-example>

After starting the dev-server, open your web browser and visit `http://localhost:4200`.
You should see the familiar Tour of Heroes dashboard page.

Navigation using `routerLinks` works correctly because they use the built-in anchor \(`<a>`\) elements.
You can seamlessly move from the Dashboard to the Heroes page and back.
Additionally, clicking on a hero within the Dashboard page will display its Details page.

If you throttle your network speed so that the client-side scripts take longer to download \(instructions following\), you'll notice:

- You can't add or delete a hero
- The search box on the Dashboard page is ignored
- The _Back_ and _Save_ buttons on the Details page don't work

The transition from the server-rendered application to the client application happens quickly on a development machine, but you should always test your applications in real-world scenarios.

You can simulate a slower network to see the transition more clearly as follows:

1. Open the Chrome Dev Tools and go to the Network tab.
1. Find the [Network Throttling](https://developers.google.com/web/tools/chrome-devtools/network-performance/reference#throttling) dropdown on the far right of the menu bar.
1. Try one of the "3G" speeds.

The server-rendered application still launches quickly but the full client application might take seconds to load.

## Why use SSR?

Compared to a client side rendered (CSR) only application the main advantages of SSR are;

### Improve search engine optimization (SEO)

Google, Bing, Facebook, Twitter, and other social media sites rely on web crawlers to index your application content and make that content searchable on the web.
These web crawlers might be unable to navigate and index your highly interactive Angular application as a human user could do.

You can generate a static version of your application that is easily searchable, linkable, and navigable without JavaScript and
make a site preview available because each URL returns a fully rendered page.

[Learn more about search engine optimization (SEO)](https://static.googleusercontent.com/media/www.google.com/en//webmasters/docs/search-engine-optimization-starter-guide.pdf).

### Show the page quicker

Displaying the page quickly can be critical for user engagement.
Pages that load faster perform better, [even with changes as small as 100ms](https://web.dev/shopping-for-speed-on-ebay).
Your application might have to launch faster to engage these users before they decide to do something else.

With server-side rendering, the application doesn't need to wait until all JavaScript has been downloaded and executed to be displayed. In additional HTTP requests done using [`HttpClient`](api/common/http/HttpClient) are done once on the server, as there are cached. See the ["Caching data when using HttpClient"](#caching-data-when-using-httpclient) section below for additional information.

This results in a performance improvement that can be measured using [Core Web Vitals (CWV)](https://web.dev/learn-core-web-vitals/) statistics, such as reducing the First-contentful paint ([FCP](https://developer.chrome.com/en/docs/lighthouse/performance/first-contentful-paint/)) and Largest Contentful Paint ([LCP](https://web.dev/lcp/)), as well as Cumulative Layout Shift ([CLS](https://web.dev/cls/)).

### Caching data when using HttpClient

When [hydration](guide/hydration) is enabled, [`HttpClient`](api/common/http/HttpClient) responses are cached while running on the server and transferring this cache to the client to avoid extra HTTP requests. After that this information is serialized and transferred to a browser as a part of the initial HTML sent from the server after server-side rendering. In a browser, [`HttpClient`](api/common/http/HttpClient) checks whether it has data in the cache and if so, reuses it instead of making a new HTTP request during initial application rendering. HttpClient stops using the cache once an application becomes [stable](api/core/ApplicationRef#isStable) while running in a browser.

Caching is performed by default for every `HEAD` and `GET` requests. You can include `POST` or filter caching for requests by using the [`withHttpTransferCacheOptions`](/api/platform-browser/withHttpTransferCacheOptions). You can also enable or disable caching by the `transferCache` option in the [HttpClient](/api/common/http/HttpClient) [`post`](/api/common/http/HttpClient#post), [`get`](/api/common/http/HttpClient#get) and [`head`](/api/common/http/HttpClient#head) methods.

### Rendering engine

The `server.ts` file configures the SSR rendering engine with Node.js Express server.

The `CommonEngine` is used to construct the rendering engine.

<code-example path="ssr/server.ts" region="CommonEngine"></code-example>

The contructor accepts an object with the following properties:

| Properties                   | Details                                                                                                                | Default Value |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------- |
| _`bootstrap`_                | A method that when invoked returns a promise that returns an `ApplicationRef` instance once resolved or an `NgModule`. |               |
| _`providers`_                | A set of platform level providers for the all request.                                                                 |               |
| _`enablePeformanceProfiler`_ | Enable request performance profiling data collection and printing the results in the server console.                   | `false`       |


The `commonEngine.render()` function which turns a client's requests for Angular pages into server-rendered HTML pages.

<code-example path="ssr/server.ts" region="navigation-request"></code-example>

The function accepts an object with the following properties:

| Properties            | Details                                                                                                                | Default Value |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------- |
| _`bootstrap`_         | A method that when invoked returns a promise that returns an `ApplicationRef` instance once resolved or an `NgModule`. |               |
| _`providers`_         | A set of platform level providers for the current request.                                                             |               |
| `url`                 | The url of the page to render.                                                                                         |               |
| _`inlineCriticalCss`_ | Reduce render blocking requests by inlining critical CSS.                                                              | `true`        |
| _`publicPath`_        | Base path for browser files and assets.                                                                                |               |
| _`document`_          | The initial DOM to use to bootstrap the server application.                                                            |               |
| _`documentFilePath`_  | File path of the initial DOM to use to bootstrap the server application.                                               |               |


### Working around the browser APIs

Some of the browser APIs and capabilities might be missing on the server.

Applications cannot make use of browser-specific global objects like `window`, `document`, `navigator`, or `location`.

Angular provides some injectable abstractions over these objects, such as [`Location`](api/common/Location) or [`DOCUMENT`](api/common/DOCUMENT); it might substitute adequately for these APIs.
If Angular doesn't provide it, it's possible to write new abstractions that delegate to the browser APIs while in the browser and to an alternative implementation while on the server \(also known as shimming\).

Server-side applications lack access to mouse or keyboard events, which means they can't depend on user interactions such as clicking a button to display a component.
In such cases, the application needs to determine what to render solely based on the client's incoming request.
This limitation underscores the importance of making the application [routable](guide/router), using a routing mechanism to navigate and display content as needed.


### Using Angular Service Worker

If you are using Angular on the server in combination with the Angular service worker, the behavior is deviates than the normal server-side rendering behavior. The initial server request will be rendered on the server as expected. However, after that initial request, subsequent requests are handled by the service worker. For subsequent requests, the `index.html` file is served statically and bypasses server-side rendering.

### Filtering request URLs

By default, if the application was only rendered by the server, _every_ application link clicked would arrive at the server as a navigation URL intended for the router.

However, most server implementations have to handle requests for at least three very different kinds of resources: _data_, _application pages_, and _static files_.
Fortunately, the URLs for these different requests are easily recognized.

| Routing request types | Details                         |
| :-------------------- | :------------------------------ |
| Data request          | Request URL that begins `/api`  |
| Static asset          | Request URL with file extension |
| App navigation        | All other requests              |

The `server.ts` generated by the CLI already makes these basic distinctions.
You may have to modify it to satisfy your specific application needs.

#### Serving Data

A Node.js Express server is a pipeline of middleware that filters and processes requests one after the other.

For data requests, you could configure the Node.js Express server pipeline with calls to `server.get()` as follows:

<code-example header="server.ts (data API)" path="ssr/server.ts" region="data-request"></code-example>

HELPFUL: This guide's `server.ts` _doesn't handle data requests_. It returns a `404 - Not Found` for all data API requests.

For demonstration purposes, this tutorial intercepts all HTTP data calls from the client _before they go to the server_ and simulates the behavior of a remote data server, using Angular's "in-memory web API" demo package.

In practice, you would remove the following "in-memory web API" code from `app.config.ts`.

<code-example header="app.config.ts (in-memory web API)" path="ssr/src/app/app.config.ts" region="in-mem"></code-example>

Then register your data API middleware in `server.ts`.

#### Serving Static Files Safely

All static asset requests such as for JavaScript, image, and style files have a file extension (examples: `main.js`, `assets/favicon.ico`, `src/app/styles.css`).
They won't be confused with navigation or data requests if you filter for files with an extension.

To ensure that clients can only download the files that they are permitted to see, put all client-facing asset files in the `dist/my-app/browser` directory.

The following Node.js Express code routes all requests for files with an extension (`*.*`) to `/dist`, and returns a `404 - NOT FOUND` error if the
file isn't found.

<code-example header="server.ts (static files)" path="ssr/server.ts" region="static"></code-example>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2023-10-26
