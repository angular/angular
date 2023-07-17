# HTTP: Send data to a server

In addition to fetching data from a server, `HttpClient` supports other HTTP methods such as PUT, POST, and DELETE, which you can use to modify the remote data.

The sample app for this guide includes an abridged version of the "Tour of Heroes" example that fetches heroes and enables users to add, delete, and update them.
The following sections show examples of the data-update methods from the sample's `HeroesService`.

## Make a POST request

Apps often send data to a server with a POST request when submitting a form.
In the following example, the `HeroesService` makes an HTTP POST request when adding a hero to the database.

<code-example header="app/heroes/heroes.service.ts (addHero)" path="http/src/app/heroes/heroes.service.ts" region="addHero"></code-example>

The `HttpClient.post()` method is similar to `get()` in that it has a type parameter, which you can use to specify that you expect the server to return data of a given type.
The method takes a resource URL and two additional parameters:

| Parameter | Details |
|:---       |:---     |
| body      | The data to POST in the body of the request.                                                          |
| options   | An object containing method options which, in this case, specify required headers. |

The example catches errors as [described above](guide/http-handle-request-errors#error-details).

The `HeroesComponent` initiates the actual POST operation by subscribing to the `Observable` returned by this service method.

<code-example header="app/heroes/heroes.component.ts (addHero)" path="http/src/app/heroes/heroes.component.ts" region="add-hero-subscribe"></code-example>

When the server responds successfully with the newly added hero, the component adds that hero to the displayed `heroes` list.

## Make a DELETE request

This application deletes a hero with the `HttpClient.delete` method by passing the hero's ID in the request URL.

<code-example header="app/heroes/heroes.service.ts (deleteHero)" path="http/src/app/heroes/heroes.service.ts" region="deleteHero"></code-example>

The `HeroesComponent` initiates the actual DELETE operation by subscribing to the `Observable` returned by this service method.

<code-example header="app/heroes/heroes.component.ts (deleteHero)" path="http/src/app/heroes/heroes.component.ts" region="delete-hero-subscribe"></code-example>

The component isn't expecting a result from the delete operation, so it subscribes without a callback.
Even though you are not using the result, you still have to subscribe.
Calling the `subscribe()` method *executes* the observable, which is what initiates the DELETE request.

<div class="alert is-important">

You must call `subscribe()` or nothing happens.
Just calling `HeroesService.deleteHero()` does not initiate the DELETE request.

</div>

<code-example path="http/src/app/heroes/heroes.component.ts" region="delete-hero-no-subscribe"></code-example>


## Make a PUT request

An app can send PUT requests using the HTTP client service.
The following `HeroesService` example, like the POST example, replaces a resource with updated data.

<code-example header="app/heroes/heroes.service.ts (updateHero)" path="http/src/app/heroes/heroes.service.ts" region="updateHero"></code-example>

As for any of the HTTP methods that return an observable, the caller, `HeroesComponent.update()` [must `subscribe()`](guide/http-request-data-from-server#always-subscribe "Why you must always subscribe.") to the observable returned from the `HttpClient.put()` in order to initiate the request.

## Add and updating headers

Many servers require extra headers for save operations.
For example, a server might require an authorization token, or "Content-Type" header to explicitly declare the MIME type of the request body.

### Add headers

The `HeroesService` defines such headers in an `httpOptions` object that are passed to every `HttpClient` save method.

<code-example header="app/heroes/heroes.service.ts (httpOptions)" path="http/src/app/heroes/heroes.service.ts" region="http-options"></code-example>

### Update headers

You can't directly modify the existing headers within the previous options
object because instances of the `HttpHeaders` class are immutable.
Use the `set()` method instead, to return a clone of the current instance with the new changes applied.

The following example shows how, when an old token expires, you can update the authorization header before making the next request.

<code-example linenums="false" path="http/src/app/heroes/heroes.service.ts" region="update-headers"></code-example>

<a id="url-params"></a>

@reviewed 2023-03-16
