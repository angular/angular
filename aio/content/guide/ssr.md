# Server-side rendering

Server-side rendering (SSR) is a process that involves rendering pages on the server, resulting in initial HTML content which contains initial page state. Once the HTML content is delivered to a browser, Angular initializes the application and utilizes the data contained within the HTML.

## Why use SSR?

The main advantages of SSR as compared to client-side rendering (CSR) are:

* **Improved performance**: SSR can improve the performance of web applications by delivering fully rendered HTML to the client, which can be parsed and displayed even before the application JavaScript is downloaded. This can be especially beneficial for users on low-bandwidth connections or mobile devices.
* **Improved Core Web Vitals**: SSR results in performance improvements that can be measured using [Core Web Vitals (CWV)](https://web.dev/learn-core-web-vitals/) statistics, such as reduced First Contentful Paint ([FCP](https://developer.chrome.com/en/docs/lighthouse/performance/first-contentful-paint/)) and Largest Contentful Paint ([LCP](https://web.dev/lcp/)), as well as Cumulative Layout Shift ([CLS](https://web.dev/cls/)).
* **Better SEO**: SSR can improve the search engine optimization (SEO) of web applications by making it easier for search engines to crawl and index the content of the application.

## Enable server-side rendering

To create a **new** application with SSR, run:

<code-example format="shell" language="shell">

ng new --ssr

</code-example>

To add SSR to an **existing** project, use the Angular CLI `ng add` command.

<code-example format="shell" language="shell">

ng add &commat;angular/ssr

</code-example>

These commands create and update application code to enable SSR and adds extra files to the project structure.

<code-example language="text">

my-app
|-- server.ts                       # application server
└── src
    |-- app
    |   └── app.config.server.ts    # server application configuration
    └── main.server.ts              # main server application bootstrapping

</code-example>

To verify that the application is server-side rendered, run it locally with `ng serve`. The initial HTML request should contain application content.

## Configure server-side rendering

The `server.ts` file configures a Node.js Express server and Angular server-side rendering. `CommonEngine` is used to render an Angular application.

<code-example path="ssr/server.ts" region="navigation-request"></code-example>

The `render` method of `CommonEngine` accepts an object with the following properties:

| Properties          | Details                                                                                  | Default Value |
| ------------------- | ---------------------------------------------------------------------------------------- | ------------- |
| `bootstrap`         | A method which returns an `NgModule` or a promise which resolves to an `ApplicationRef`. |               |
| `providers`         | An array of platform level providers for the current request.                            |               |
| `url`               | The url of the page to render.                                                           |               |
| `inlineCriticalCss` | Whether to reduce render blocking requests by inlining critical CSS.                     | `true`        |
| `publicPath`        | Base path for browser files and assets.                                                  |               |
| `document`          | The initial DOM to use for bootstrapping the server application.                         |               |
| `documentFilePath`  | File path of the initial DOM to use to bootstrap the server application.                 |               |

Angular CLI will scaffold an initial server implementation focused on server-side rendering your Angular application. This server can be extended to support other features such as API routes, redirects, static assets, and more. See [Express documentation](https://expressjs.com/) for more details.

## Hydration

Hydration is the process that restores the server side rendered application on the client. This includes things like reusing the server rendered DOM structures, persisting the application state, transferring application data that was retrieved already by the server, and other processes. Hydration is enabled by default when you use SSR. You can find more info in [the hydration guide](guide/hydration).

## Caching data when using HttpClient

When SSR is enabled, [`HttpClient`](api/common/http/HttpClient) responses are cached while running on the server. After that this information is serialized and transferred to a browser as a part of the initial HTML sent from the server. In a browser, [`HttpClient`](api/common/http/HttpClient) checks whether it has data in the cache and if so, reuses it instead of making a new HTTP request during initial application rendering. `HttpClient` stops using the cache once an application becomes [stable](api/core/ApplicationRef#isStable) while running in a browser.

Caching is performed by default for all `HEAD` and `GET` requests. You can configure this cache by using [`withHttpTransferCacheOptions`](/api/platform-browser/withHttpTransferCacheOptions) when providing hydration.

```ts
bootstrapApplication(AppComponent, {
  providers: [
    provideClientHydration(
      withHttpTransferCacheOptions({
        includePostRequests: true,
      }),
    ),
  ],
});
```

## Authoring server-compatible components

Some common browser APIs and capabilities might not be available on the server. Applications cannot make use of browser-specific global objects like `window`, `document`, `navigator`, or `location` as well as certain properties of `HTMLElement`.

In general, code which relies on browser-specific symbols should only be executed in the browser, not on the server. This can be enforced through the [`afterRender`](api/core/afterRender) and [`afterNextRender`](api/core/afterNextRender) lifecycle hooks. These are only executed on the browser and skipped on the server.

```ts
import { Component, ViewChild, afterNextRender } from '@angular/core';

@Component({
  selector: 'my-cmp',
  template: `<span #content>{{ ... }}</span>`,
})
export class MyComponent {
  @ViewChild('content') contentRef: ElementRef;

  constructor() {
    afterNextRender(() => {
      // Safe to check `scrollHeight` because this will only run in the browser, not the server.
      console.log('content height: ' + this.contentRef.nativeElement.scrollHeight);
    });
  }
}
```

## Using Angular Service Worker

If you are using Angular on the server in combination with the Angular service worker, the behavior deviates from the normal server-side rendering behavior. The initial server request will be rendered on the server as expected. However, after that initial request, subsequent requests are handled by the service worker and always client-side rendered.

## Enable performance profiling

The `CommonEngine` offers an option for initiating the collection of performance profiling data and displaying the results in the server console.
This can be done by setting `enablePerformanceProfiler` to `true`.

```ts
const commonEngine = new CommonEngine({
  enablePerformanceProfiler: true,
});
```

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2023-11-03
