# Reactive data fetching with `httpResource`

IMPORTANT: `httpResource` is [experimental](reference/releases#experimental). It's ready for you to try, but it might change before it is stable.

Fetching data is by nature an asynchronous task. You can use a [`Resource`](/api/core/resource) to perform any kind of async operation.

<!-- mention reactive ?-->

`httpResource` is built on top of the `resource` primitive and uses `HttpClient` as loader. It acts as a frontend for `@angular/common/http`. It makes HTTP requests through the Angular HTTP stack, including interceptors. 

## Reactive HTTP requests  

`httpResource` makes a reactive HTTP request and exposes the response status and response value as a [`WritableResource`](/api/core/WritableResource). By default, it assumes that the backend will return JSON data. Like `resource`, it configures a reactive request. If any of the source signals in the request computation change, a new HTTP request will be made.

You can define an http resource by returning a url: 

```ts
userId = input.required<string>();

user = httpResource(() => `/api/user/${userId()}`); // A reactive function as argument
```

IMPORTANT: `httpResource` differs from the `HttpClient` as it initiates the request _eagerly_. In contrast, the `HttpClient` only initiates requests upon subscription to the returned `Observable`.

For more advanced requests, you can define a request object similar to the request taken by `HttpClient`.

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

TIP: Avoid using `httpResource` for _mutations_ like `POST` or `PUT`. Instead, prefer directly using the underlying `HttpClient` APIs.

### Response types 

By default, `httpResource` returns and parses the response as JSON. However, you can specify alternate return with additional functions on `httpResource`: 

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

## Response parsing and validation

When fetching data, you may want to validate responses against a predefined schema, often using popular open-source libraries like [Zod](https://zod.dev) or [Valibot](https://valibot.dev). You can integrate validation libraries like this with `httpResource` by specifying a `parse` option. The return type of the `parse` function determines the type of the resource's `value`.

The following example uses Zod to parse and validate the response from the [StarWars API](https://swapi.dev/). The resource is then typed the same as the output type of Zod’s parsing.

```ts
const starWarsPersonSchema = z.object({
  name: z.string(),
  height: z.number({ coerce: true }),
  edited: z.string().datetime(),
  films: z.array(z.string()),
});

export class CharacterViewer {
  id = signal(1);

  swPersonResource = httpResource(
    () => `https://swapi.dev/api/people/${this.id()}`,
    { parse: starWarsPersonSchema.parse }
  );
}
```

## Testing an httpResource

Because `httpResource` is a wrapper around `HttpClient`, you can test `httpResource` with the exact same APIs as `HttpResource. See [HttpClient Testing](/guide/http/testing) for details.

The following example shows a unit test for code using `httpResource`.

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
