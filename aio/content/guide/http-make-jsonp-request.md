# HTTP: Make a JSONP request

“JSON with Padding” (JSONP) is a method to deceive a web browser into carrying out requests with a `<script>` tag that uses the SRC attribute to make a special API request.

Apps can use the `HttpClient` to make [JSONP](https://en.wikipedia.org/wiki/JSONP) requests across domains when a server doesn't support [CORS protocol](https://developer.mozilla.org/docs/Web/HTTP/CORS).

Angular JSONP requests return an `Observable`.
Follow the pattern for subscribing to observables and use the RxJS `map` operator to transform the response before using the [async pipe](api/common/AsyncPipe) to manage the results.

Enable JSONP by providing the `HttpClientJsonpModule` in the `ApplicationConfig` providers array in `app.config.ts` like this:

<code-example header="app.config.ts (excerpt)" path="http/src/app/app.config.ts" region="jsonp"></code-example>

In the following example, the `searchHeroesJsonp()` method uses a JSONP request to query for heroes whose names contain the search term acquired from the user.

<code-example path="http/src/app/heroes/heroes.service.ts" region="searchHeroesJsonp">
</code-example>

This request passes the `heroesUrl` with the search term as the first parameter and the standard callback function name, `callback`, as the second parameter.

You may have to `map` the Observable response from the `http.jsonp` method to the intended data type 
as this example does with `jsonpResultToHeroes`.

## Request non-JSON data

Not all APIs return JSON data.
In this next example, a `DownloaderService` method reads a text file from the server and logs the file contents, before returning those contents to the caller as an `Observable<string>`.

<code-example header="app/downloader/downloader.service.ts (getTextFile)" linenums="false" path="http/src/app/downloader/downloader.service.ts" region="getTextFile"></code-example>

`HttpClient.get()` returns a string rather than the default JSON because of the `responseType` option.

The RxJS `tap` operator lets the code inspect both success and error values passing through the observable without disturbing them.

A `download()` method in the `DownloaderComponent` initiates the request by subscribing to the service method.

<code-example header="app/downloader/downloader.component.ts (download)" linenums="false" path="http/src/app/downloader/downloader.component.ts" region="download"></code-example>

<a id="error-handling"></a>

@reviewed 2023-08-17
