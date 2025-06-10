# Data fetching with `httpResource`

IMPORTANT: `httpResource` is [experimental](reference/releases#experimental). It's ready for you to try, but it might change before it is stable.

Fetching data is by nature an asynchronous task. You can use a [`Resource`](/api/core/resource) to perform any kind of async operation.

<!-- mention reactive ?-->

`httpResource` is built on top of the `resource` primitive and uses `HttpClient` as loader. It acts as a frontend for `@angular/common/http`. It makes HTTP requests through the Angular HTTP stack, including interceptors. 

## Reactive HTTP requests  

`httpResource` makes a reactive HTTP request and exposes the request status and response value as a [`WritableResource`](/api/core/WritableResource). By default, it assumes that the backend will return JSON data. Like `resource`, it configures a reactive request. If any of the source signals in the request computation change, a new HTTP request will be made.

You can define an http resource by returning a url: 

```ts
userId = input.required<string>();

user = httpResource(() => `/api/user/${userId()}`); // A reactive function as argument
```

IMPORTANT: `httpResource` differs from the `HttpClient` as it initiates the request eagerly (unlike the `HttpClient` `Observable`-based requests which must be subscribed).

For more advanced requests, it is possible to define a request object similar to `HttpClient`‘s request.

```ts
user = httpResource(() => ({
  url: `/api/user/${userId()}`,
  method: 'GET',
  headers: {
    'X-Special': 'true',
  },
  params: {
    'fast': 'yes',
  },
  reportProgress: true,
  withCredentials: true,
  transferCache: true,
}));
```

While the resource pattern is meant only for retrieving asynchronous data, `httpResource` will allow any request method (like `POST` in the previous example). This still doesn’t mean that you should be using `httpResource` to change data on the server. For instance, if you need to submit form data, use the `HttpClient` methods.

### Response types 

An `httpResource` will return and parse the response as JSON but it is possible to use it for other return types.

The API has multiple dedicated methods available for other response types:

```ts
httpResource.text(() => ({ … })); // returns a string in value()

httpResource.blob(() => ({ … })); // returns a Blob object in value()

httpResource.arrayBuffer(() => ({ … })); // returns an ArrayBuffer in value()
```

## Shape of an HttpResource

An httpResource , similar to other `resource`, exposes several signals:

- `value()` — which contains the result of the http request (when successful) and is programmatically overwritable
- `status()` — with the status of the resource (idle, loading, error etc)
- `error()` — with the request error / parsing error
- `isLoading()` — which is `true` while the request is pending

It also includes dedicated signals for metadata about the response:

- `​​headers()` — with the response’s headers
- `statusCode()` — with the response’s status code
- `progress()` — with the progress of the request (if required in the request object)

## Parsing typesafety 

When performing http requests you often want to ensure that the data we receive conforms the shape that we expect. This is commonly known as schema validation.

In the JavaScript ecosystem it is common to reach out for battle-tested libraries like [Zod](https://zod.dev/) or [Valibot](https://valibot.dev/) for schema validation. `httpResource` offers direct integration for those libraries by using the `parse` parameter. The returned type of this parse function will provide the type to the resource itself, ensuring type safety alongside the schema validation.

The following example uses Zod to parse and validate the response from the [StarWars API](https://swapi.dev/). The resource is then typed the same as the output type of Zod’s parsing.

```ts
export class AppComponent {
  id = signal(1);

  swPersonResource = httpResource(
    () => `https://swapi.dev/api/people/${this.id()}`,
    { parse: starWarsPersonSchema.parse }
  );
}

const starWarsPersonSchema = z.object({
  name: z.string(),
  height: z.number({ coerce: true }),
  edited: z.string().datetime(),
  films: z.array(z.string()),
});
```

## Testing an httpResource

With `httpResource` as a frontend for `@angular/common/http`, it makes HTTP requests through the Angular HTTP stack. 
This means you can use the same utilities as [`HttpClient` testing](/guide/http/testing).

Here an example to illustrate testing of a `httpResource`

```ts
TestBed.configureTestingModule({
  providers: [
    provideHttpClient(),
    provideHttpClientTesting(),
  ],
});

const id = signal(0);
const mockBackend = TestBed.inject(HttpTestingController);
const res = httpResource(() => `/data/${id()}`, {injector: TestBed.inject(Injector)});
TestBed.tick(); // Triggers the effect
const req1 = mockBackend.expectOne('/data/0');
req1.flush(0);

// Ensures the values are propagated to the httpResource
await TestBed.inject(ApplicationRef).whenStable();

expect(res.value()).toEqual(0);
```
