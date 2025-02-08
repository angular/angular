# Server-side rendering

Server-side rendering (SSR) is a process that involves rendering pages on the server, resulting in initial HTML content which contains initial page state. Once the HTML content is delivered to a browser, Angular initializes the application and utilizes the data contained within the HTML.

## Why use SSR?

The main advantages of SSR as compared to client-side rendering (CSR) are:

- **Improved performance**: SSR can improve the performance of web applications by delivering fully rendered HTML to the client, which the browser can parse and display even before it downloads the application JavaScript. This can be especially beneficial for users on low-bandwidth connections or mobile devices.
- **Improved Core Web Vitals**: SSR results in performance improvements that can be measured using [Core Web Vitals (CWV)](https://web.dev/learn-core-web-vitals/) statistics, such as reduced First Contentful Paint ([FCP](https://developer.chrome.com/en/docs/lighthouse/performance/first-contentful-paint/)) and Largest Contentful Paint ([LCP](https://web.dev/lcp/)), as well as Cumulative Layout Shift ([CLS](https://web.dev/cls/)).
- **Better SEO**: SSR can improve the search engine optimization (SEO) of web applications by making it easier for search engines to crawl and index the content of the application.

## Enable server-side rendering

To create a **new** project with SSR, run:

```shell
ng new --ssr
```

To add SSR to an **existing** project, use the Angular CLI `ng add` command.

```shell
ng add @angular/ssr
```

Note: Interested in the latest SSR advancements in Angular? Take a look at the developer preview [hybrid rendering APIs](guide/hybrid-rendering).

These commands create and update application code to enable SSR and adds extra files to the project structure.

```
my-app
|-- server.ts                       # application server
└── src
    |-- app
    |   └── app.config.server.ts    # server application configuration
    └── main.server.ts              # main server application bootstrapping
```

To verify that the application is server-side rendered, run it locally with `ng serve`. The initial HTML request should contain application content.

## Configure server-side rendering

Note: In Angular v17 and later, `server.ts` is no longer used by `ng serve`. The dev server will use `main.server.ts` directly to perform server side rendering.

The `server.ts` file configures a Node.js Express server and Angular server-side rendering. `CommonEngine` is used to render an Angular application.

<docs-code path="adev/src/content/examples/ssr/server.ts" visibleLines="[33,47]"></docs-code>

Angular CLI will scaffold an initial server implementation focused on server-side rendering your Angular application. This server can be extended to support other features such as API routes, redirects, static assets, and more. See [Express documentation](https://expressjs.com/) for more details.

For more information on the APIs, refer to the [`CommonEngine` API reference](api/ssr/node/CommonEngineRenderOptions).

## Hydration

Hydration is the process that restores the server side rendered application on the client. This includes things like reusing the server rendered DOM structures, persisting the application state, transferring application data that was retrieved already by the server, and other processes. Hydration is enabled by default when you use SSR. You can find more info in [the hydration guide](guide/hydration).

## Caching data when using HttpClient

[`HttpClient`](api/common/http/HttpClient) cached outgoing network requests when running on the server. This information is serialized and transferred to the browser as part of the initial HTML sent from the server. In the browser, `HttpClient` checks whether it has data in the cache and if so, reuses it instead of making a new HTTP request during initial application rendering. `HttpClient` stops using the cache once an application becomes [stable](api/core/ApplicationRef#isStable) while running in a browser.

By default, `HttpClient` caches all `HEAD` and `GET` requests which don't contain `Authorization` or `Proxy-Authorization` headers. You can override those settings by using [`withHttpTransferCacheOptions`](api/platform-browser/withHttpTransferCacheOptions) when providing hydration.

```typescript
bootstrapApplication(AppComponent, {
  providers: [
    provideClientHydration(withHttpTransferCacheOptions({
      includePostRequests: true
    }))
  ]
});
```

## Authoring server-compatible components

Some common browser APIs and capabilities might not be available on the server. Applications cannot make use of browser-specific global objects like `window`, `document`, `navigator`, or `location` as well as certain properties of `HTMLElement`.

In general, code which relies on browser-specific symbols should only be executed in the browser, not on the server. This can be enforced through the [`afterRender`](api/core/afterRender) and [`afterNextRender`](api/core/afterNextRender) lifecycle hooks. These are only executed on the browser and skipped on the server.

```angular-ts
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
