# UNUSED SNIPPETS 

DO NOT ADD TO NAV. DELETE BEFORE RELEASE.

|Symbol   |Name   |Example   |
|---|---|---|
|{{ }}   |interpolation   |`<p>Welcome to {{storeName}}</p>`   |
|[ ]   |property binding   |`<img [src]="sourceUrl">`   |
|( )   |event binding   |`<button (hover)="doHover()">Buy</button>`   |
|*ngIf   |ngIf   |`<div *ngIf="products.length < 1">No products are currently available</div>`   |
| *ngFor  |ngFor   |`<div *ngFor="let product of products">{{product.name}}</div>`   |

There are many more things you can do using Angular's template syntax that aren't show here. You can see and play with each of these in the embedded examples below.

<div class="alert is-important">

 **Note:** The `$` used to suffix the `products` property is a convention to denote the variable as an observable
 stream. It's used to easily glance at a property to distinguish it from other class properties. 

</div>

{@a key-concepts}
## Key concepts


{@a transforming}

### Transforming Data

To take a stream of events, and create a new stream of event statuses, use the `pipe()` method and provide the `map()` operator from the RxJS library.

```ts
events.pipe(
  map(events => event.statuses),
)
```

The `map` operator uses a function to transform the value from the source stream into a new value. The new value is returned as a stream to the subscriber.

Another example of this is a JSON object returned from an external API:

```json
{
  status: 'success',
  results_count: 42,
  items: [
    {...},
    {...},
    ...
  ]
}
```

To only return the `items` from the results, use the `map()` operator to define a new stream that only returns the `items` property.

```ts
data.pipe(
  map(result => result.items),
)
```
{@a combining}

### Combining Multiple Streams

It's a very common need to combine multiple streams. This is needed to have multiple HTTP requests, or to combine information from the Router with an HTTP request.

```ts
router.paramMap.pipe(
  switchMap(params => http.get(`/items/${params.get('id')}`)),
)
```

The `switchMap()` operator will take the parameters of the current route and use it to create a new stream to request data for that route. If the user visits the same route again only with different parameters, the stream will automatically make an additional HTTP request.

The three most common tasks users will do with a stream of data are to transform the data, combine multiple streams, and to perform an action for each of the pieces of data in a stream. Streams are created and managed using [RxJS](https://rxjs.dev/) in Angular.

Any operation you would like to define on a stream is defined with the use of RxJS operators. These will return a new stream, and the operations defined on the stream will only execute when one of your components or services is subscribed to the stream of data.

Read more about observable streams in the [Observables guide](guide/observables).


### How routing works

Navigation is done through the `RouterLink` directive provided by the `Router` in a template, or imperatively using the `Router` service. Navigation is always done by string, or by array of URL paths, such as `['path', 'to', variable]` which results in a URL that looks like 'https://example.org/path/to/42'. 

After you set up the router, you can continue to create more components and routes in your `RouteConfig`.
