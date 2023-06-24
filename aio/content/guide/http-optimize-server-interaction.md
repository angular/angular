# HTTP - Optimize server interaction with debouncing

If you need to make an HTTP request in response to user input, it's not efficient to send a request for every keystroke. It's better to wait until the user stops typing and then send a request. This technique is known as debouncing.

## Implement debouncing

Consider the following template, which lets a user enter a search term to find a package by name. When the user enters a name in a search-box, the `PackageSearchComponent` sends a search request for a package with that name to the package search API.

<code-example header="app/package-search/package-search.component.html (search)" path="http/src/app/package-search/package-search.component.html" region="search"></code-example>

Here, the `keyup` event binding sends every keystroke to the component's `search()` method.

<div class="alert is-helpful">

The type of `$event.target` is only `EventTarget` in the template.
In the `getValue()` method, the target is cast to an `HTMLInputElement` to let type-safe have access to its `value` property.

<code-example path="http/src/app/package-search/package-search.component.ts" region="getValue"></code-example>

</div>

The following snippet implements debouncing for this input using RxJS operators.

<code-example header="app/package-search/package-search.component.ts (excerpt)" path="http/src/app/package-search/package-search.component.ts" region="debounce"></code-example>

The `searchText$` is the sequence of search-box values coming from the user.
It's defined as an RxJS `Subject`, which means it is a multicasting `Observable` that can also emit values for itself by calling `next(value)`, as happens in the `search()` method.

Rather than forward every `searchText` value directly to the injected `PackageSearchService`, the code in `ngOnInit()` pipes search values through three operators, so that a search value reaches the service only if it's a new value and the user stopped typing.

| RxJS operators           | Details |
|:---                      |:---     |
| `debounceTime(500)`⁠      | Wait for the user to stop typing, which is 1/2 second in this case. |
| `distinctUntilChanged()` | Wait until the search text changes.                           |
| `switchMap()`⁠            | Send the search request to the service.                       |

The code sets `packages$` to this re-composed `Observable` of search results.
The template subscribes to `packages$` with the [AsyncPipe](api/common/AsyncPipe) and displays search results as they arrive.

<div class="alert is-helpful">

See [Using interceptors to request multiple values](guide/http-interceptor-use-cases#cache-refresh) for more about the `withRefresh` option.

</div>

## Using the `switchMap()` operator

The `switchMap()` operator takes a function argument that returns an `Observable`.
In the example, `PackageSearchService.search` returns an `Observable`, as other data service methods do.
If a previous search request is still in-flight, such as when the network connection is poor, the operator cancels that request and sends a new one.

<div class="alert is-helpful">

**NOTE**: <br />
`switchMap()` returns service responses in their original request order, even if the server returns them out of order.

</div>

<div class="alert is-helpful">

If you think you'll reuse this debouncing logic, consider moving it to a utility function or into the `PackageSearchService` itself.

</div>

@reviewed 2023-02-27
