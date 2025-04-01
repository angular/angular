# Service Worker configuration file

This topic describes the properties of the service worker configuration file.

## Modifying the configuration

The `ngsw-config.json` JSON configuration file specifies which files and data URLs the Angular service worker should cache and how it should update the cached files and data.
The [Angular CLI](tools/cli) processes this configuration file during `ng build`.

All file paths must begin with `/`, which corresponds to the deployment directory — usually `dist/<project-name>` in CLI projects.

Unless otherwise commented, patterns use a **limited*** glob format that internally will be converted into regex:

| Glob formats | Details |
|:---          |:---     |
| `**`         | Matches 0 or more path segments                                                                        |
| `*`          | Matches 0 or more characters excluding `/`                                                             |
| `?`          | Matches exactly one character excluding `/`                                                            |
| `!` prefix   | Marks the pattern as being negative, meaning that only files that don't match the pattern are included |

<docs-callout important title="Special characters need to be escaped">
Pay attention that some characters with a special meaning in a regular expression are not escaped and also the pattern is not wrapped in `^`/`$` in the internal glob to regex conversion.

`$` is a special character in regex that matches the end of the string and will not be automatically escaped when converting the glob pattern to a regular expression.

If you want to literally match the `$` character, you have to escape it yourself (with `\\$`). For example, the glob pattern `/foo/bar/$value` results in an unmatchable expression, because it is impossible to have a string that has any characters after it has ended.

The pattern will not be automatically wrapped in `^` and `$` when converting it to a regular expression. Therefore, the patterns will partially match the request URLs.

If you want your patterns to match the beginning and/or end of URLs, you can add `^`/`$` yourself. For example, the glob pattern `/foo/bar/*.js` will match both `.js` and `.json` files. If you want to only match `.js` files, use `/foo/bar/*.js$`.
</docs-callout>

Example patterns:

| Patterns     | Details |
|:---          |:---     |
| `/**/*.html` | Specifies all HTML files              |
| `/*.html`    | Specifies only HTML files in the root |
| `!/**/*.map` | Exclude all sourcemaps                |

## Service worker configuration properties

The following sections describe each property of the configuration file.

### `appData`

This section enables you to pass any data you want that describes this particular version of the application.
The `SwUpdate` service includes that data in the update notifications.
Many applications use this section to provide additional information for the display of UI popups, notifying users of the available update.

### `index`

Specifies the file that serves as the index page to satisfy navigation requests.
Usually this is `/index.html`.

### `assetGroups`

*Assets* are resources that are part of the application version that update along with the application.
They can include resources loaded from the page's origin as well as third-party resources loaded from CDNs and other external URLs.
As not all such external URLs might be known at build time, URL patterns can be matched.

HELPFUL: For the service worker to handle resources that are loaded from different origins, make sure that [CORS](https://developer.mozilla.org/docs/Web/HTTP/CORS) is correctly configured on each origin's server.

This field contains an array of asset groups, each of which defines a set of asset resources and the policy by which they are cached.

<docs-code language="json">

{
  "assetGroups": [
    {
      …
    },
    {
      …
    }
  ]
}

</docs-code>

HELPFUL: When the ServiceWorker handles a request, it checks asset groups in the order in which they appear in `ngsw-config.json`.
The first asset group that matches the requested resource handles the request.

It is recommended that you put the more specific asset groups higher in the list.
For example, an asset group that matches `/foo.js` should appear before one that matches `*.js`.

Each asset group specifies both a group of resources and a policy that governs them.
This policy determines when the resources are fetched and what happens when changes are detected.

Asset groups follow the Typescript interface shown here:

<docs-code language="typescript">

interface AssetGroup {
  name: string;
  installMode?: 'prefetch' | 'lazy';
  updateMode?: 'prefetch' | 'lazy';
  resources: {
    files?: string[];
    urls?: string[];
  };
  cacheQueryOptions?: {
    ignoreSearch?: boolean;
  };
}

</docs-code>

Each `AssetGroup` is defined by the following asset group properties.

#### `name`

A `name` is mandatory.
It identifies this particular group of assets between versions of the configuration.

#### `installMode`

The `installMode` determines how these resources are initially cached.
The `installMode` can be either of two values:

| Values     | Details |
|:---        |:---     |
| `prefetch` | Tells the Angular service worker to fetch every single listed resource while it's caching the current version of the application. This is bandwidth-intensive but ensures resources are available whenever they're requested, even if the browser is currently offline.                                                                                                                       |
| `lazy`     | Does not cache any of the resources up front. Instead, the Angular service worker only caches resources for which it receives requests. This is an on-demand caching mode. Resources that are never requested are not cached. This is useful for things like images at different resolutions, so the service worker only caches the correct assets for the particular screen and orientation. |

Defaults to `prefetch`.

#### `updateMode`

For resources already in the cache, the `updateMode` determines the caching behavior when a new version of the application is discovered.
Any resources in the group that have changed since the previous version are updated in accordance with `updateMode`.

| Values     | Details |
|:---        |:---     |
| `prefetch` | Tells the service worker to download and cache the changed resources immediately.                                                                                                                                                        |
| `lazy`     | Tells the service worker to not cache those resources. Instead, it treats them as unrequested and waits until they're requested again before updating them. An `updateMode` of `lazy` is only valid if the `installMode` is also `lazy`. |

Defaults to the value `installMode` is set to.

#### `resources`

This section describes the resources to cache, broken up into the following groups:

| Resource groups | Details |
|:---             |:---     |
| `files`         | Lists patterns that match files in the distribution directory. These can be single files or glob-like patterns that match a number of files.                                                                                                                                                                                                                                                                   |
| `urls`          | Includes both URLs and URL patterns that are matched at runtime. These resources are not fetched directly and do not have content hashes, but they are cached according to their HTTP headers. This is most useful for CDNs such as the Google Fonts service. <br />  *(Negative glob patterns are not supported and `?` will be matched literally; that is, it will not match any character other than `?`.)* |

#### `cacheQueryOptions`

These options are used to modify the matching behavior of requests.
They are passed to the browsers `Cache#match` function.
See [MDN](https://developer.mozilla.org/docs/Web/API/Cache/match) for details.
Currently, only the following options are supported:

| Options        | Details |
|:---            |:---     |
| `ignoreSearch` | Ignore query parameters. Defaults to `false`. |

### `dataGroups`

Unlike asset resources, data requests are not versioned along with the application.
They're cached according to manually-configured policies that are more useful for situations such as API requests and other data dependencies.

This field contains an array of data groups, each of which defines a set of data resources and the policy by which they are cached.

<docs-code language="json">

{
  "dataGroups": [
    {
      …
    },
    {
      …
    }
  ]
}

</docs-code>

HELPFUL: When the ServiceWorker handles a request, it checks data groups in the order in which they appear in `ngsw-config.json`.
The first data group that matches the requested resource handles the request.

It is recommended that you put the more specific data groups higher in the list.
For example, a data group that matches `/api/foo.json` should appear before one that matches `/api/*.json`.

Data groups follow this Typescript interface:

<docs-code language="typescript">

export interface DataGroup {
  name: string;
  urls: string[];
  version?: number;
  cacheConfig: {
    maxSize: number;
    maxAge: string;
    timeout?: string;
    refreshAhead?: string;
    strategy?: 'freshness' | 'performance';
  };
  cacheQueryOptions?: {
    ignoreSearch?: boolean;
  };
}

</docs-code>

Each `DataGroup` is defined by the following data group properties.

#### `name`

Similar to `assetGroups`, every data group has a `name` which uniquely identifies it.

#### `urls`

A list of URL patterns.
URLs that match these patterns are cached according to this data group's policy.
Only non-mutating requests (GET and HEAD) are cached.

* Negative glob patterns are not supported
* `?` is matched literally; that is, it matches *only* the character `?`

#### `version`

Occasionally APIs change formats in a way that is not backward-compatible.
A new version of the application might not be compatible with the old API format and thus might not be compatible with existing cached resources from that API.

`version` provides a mechanism to indicate that the resources being cached have been updated in a backwards-incompatible way, and that the old cache entries —those from previous versions— should be discarded.

`version` is an integer field and defaults to `1`.

#### `cacheConfig`

The following properties define the policy by which matching requests are cached.

##### `maxSize`

The maximum number of entries, or responses, in the cache.

CRITICAL: Open-ended caches can grow in unbounded ways and eventually exceed storage quotas, resulting in eviction.

##### `maxAge`

The `maxAge` parameter indicates how long responses are allowed to remain in the cache before being considered invalid and evicted. `maxAge` is a duration string, using the following unit suffixes:

| Suffixes | Details |
|:---      |:---     |
| `d`      | Days         |
| `h`      | Hours        |
| `m`      | Minutes      |
| `s`      | Seconds      |
| `u`      | Milliseconds |

For example, the string `3d12h` caches content for up to three and a half days.

##### `timeout`

This duration string specifies the network timeout.
The network timeout is how long the Angular service worker waits for the network to respond before using a cached response, if configured to do so.
`timeout` is a duration string, using the following unit suffixes:

| Suffixes | Details |
|:---      |:---     |
| `d`      | Days         |
| `h`      | Hours        |
| `m`      | Minutes      |
| `s`      | Seconds      |
| `u`      | Milliseconds |

For example, the string `5s30u` translates to five seconds and 30 milliseconds of network timeout.


##### `refreshAhead`

This duration string specifies the time ahead of the expiration of a cached resource when the Angular service worker should proactively attempt to refresh the resource from the network.
The `refreshAhead` duration is an optional configuration that determines how much time before the expiration of a cached response the service worker should initiate a request to refresh the resource from the network.

| Suffixes | Details |
|:---      |:---     |
| `d`      | Days         |
| `h`      | Hours        |
| `m`      | Minutes      |
| `s`      | Seconds      |
| `u`      | Milliseconds |

For example, the string `1h30m` translates to one hour and 30 minutes ahead of the expiration time.

##### `strategy`

The Angular service worker can use either of two caching strategies for data resources.

| Caching strategies | Details |
|:---                |:---     |
| `performance`      | The default, optimizes for responses that are as fast as possible. If a resource exists in the cache, the cached version is used, and no network request is made. This allows for some staleness, depending on the `maxAge`, in exchange for better performance. This is suitable for resources that don't change often; for example, user avatar images. |
| `freshness`        | Optimizes for currency of data, preferentially fetching requested data from the network. Only if the network times out, according to `timeout`, does the request fall back to the cache. This is useful for resources that change frequently; for example, account balances.                                                                              |

HELPFUL: You can also emulate a third strategy, [staleWhileRevalidate](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#stale-while-revalidate), which returns cached data if it is available, but also fetches fresh data from the network in the background for next time.
To use this strategy set `strategy` to `freshness` and `timeout` to `0u` in `cacheConfig`.

This essentially does the following:

1. Try to fetch from the network first.
2. If the network request does not complete immediately, that is after a timeout of 0&nbsp;ms, ignore the cache age and fall back to the cached value.
3. Once the network request completes, update the cache for future requests.
4. If the resource does not exist in the cache, wait for the network request anyway.

##### `cacheOpaqueResponses`

Whether the Angular service worker should cache opaque responses or not.

If not specified, the default value depends on the data group's configured strategy:

| Strategies                             | Details |
|:---                                    |:---     |
| Groups with the `freshness` strategy   | The default value is `true` and the service worker caches opaque responses. These groups will request the data every time and only fall back to the cached response when offline or on a slow network. Therefore, it doesn't matter if the service worker caches an error response. |
| Groups with the `performance` strategy | The default value is `false` and the service worker doesn't cache opaque responses. These groups would continue to return a cached response until `maxAge` expires, even if the error was due to a temporary network or server issue. Therefore, it would be problematic for the service worker to cache an error response. |

<docs-callout title="Comment on opaque responses">

In case you are not familiar, an [opaque response](https://fetch.spec.whatwg.org#concept-filtered-response-opaque) is a special type of response returned when requesting a resource that is on a different origin which doesn't return CORS headers.
One of the characteristics of an opaque response is that the service worker is not allowed to read its status, meaning it can't check if the request was successful or not.
See [Introduction to `fetch()`](https://developers.google.com/web/updates/2015/03/introduction-to-fetch#response_types) for more details.

If you are not able to implement CORS — for example, if you don't control the origin — prefer using the `freshness` strategy for resources that result in opaque responses.

</docs-callout>

#### `cacheQueryOptions`

See [assetGroups](#assetgroups) for details.

### `navigationUrls`

This optional section enables you to specify a custom list of URLs that will be redirected to the index file.

#### Handling navigation requests

The ServiceWorker redirects navigation requests that don't match any `asset` or `data` group to the specified [index file](#index).
A request is considered to be a navigation request if:

* Its [method](https://developer.mozilla.org/docs/Web/API/Request/method) is `GET`
* Its [mode](https://developer.mozilla.org/docs/Web/API/Request/mode) is `navigation`
* It accepts a `text/html` response as determined by the value of the `Accept` header
* Its URL matches the following criteria:
  * The URL must not contain a file extension (that is, a `.`) in the last path segment
  * The URL must not contain `__`

HELPFUL: To configure whether navigation requests are sent through to the network or not, see the [navigationRequestStrategy](#navigationrequeststrategy) section and [applicationMaxAge](#application-max-age) sections.

#### Matching navigation request URLs

While these default criteria are fine in most cases, it is sometimes desirable to configure different rules.
For example, you might want to ignore specific routes, such as those that are not part of the Angular app, and pass them through to the server.

This field contains an array of URLs and [glob-like](#modifying-the-configuration) URL patterns that are matched at runtime.
It can contain both negative patterns (that is, patterns starting with `!`) and non-negative patterns and URLs.

Only requests whose URLs match *any* of the non-negative URLs/patterns and *none* of the negative ones are considered navigation requests.
The URL query is ignored when matching.

If the field is omitted, it defaults to:

<docs-code language="typescript">

[
  '/**',           // Include all URLs.
  '!/**/*.*',      // Exclude URLs to files (containing a file extension in the last segment).
  '!/**/*__*',     // Exclude URLs containing `__` in the last segment.
  '!/**/*__*/**',  // Exclude URLs containing `__` in any other segment.
]

</docs-code>

### `navigationRequestStrategy`

This optional property enables you to configure how the service worker handles navigation requests:

<docs-code language="json">

{
  "navigationRequestStrategy": "freshness"
}

</docs-code>

| Possible values | Details |
|:---             |:---     |
| `'performance'` | The default setting. Serves the specified [index file](#index-file), which is typically cached. |
| `'freshness'`   | Passes the requests through to the network and falls back to the `performance` behavior when offline. This value is useful when the server redirects the navigation requests elsewhere using a `3xx` HTTP redirect status code. Reasons for using this value include: <ul> <li> Redirecting to an authentication website when authentication is not handled by the application </li> <li> Redirecting specific URLs to avoid breaking existing links/bookmarks after a website redesign </li> <li> Redirecting to a different website, such as a server-status page, while a page is temporarily down </li> </ul> |

IMPORTANT: The `freshness` strategy usually results in more requests sent to the server, which can increase response latency. It is recommended that you use the default performance strategy whenever possible.

### `applicationMaxAge`

This optional property enables you to configure how long the service worker will cache any requests. Within the `maxAge`, files will be served from cache. Beyond it, all requests will only be served from the network, including asset and data requests.
