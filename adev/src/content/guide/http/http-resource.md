# Reactive data fetching with `httpResource`

IMPORTANT: `httpResource` is [experimental](reference/releases#experimental). It's ready for you to try, but it might change before it is stable.

`httpResource` is a reactive wrapper around `HttpClient` that gives you the request status and response as signals. You can thus use these signals with `computed`, `effect`, `linkedSignal`, or any other reactive API. Because it's built on top of `HttpClient`, `httpResource` supports all the same features, such as interceptors.

For more about Angular's `resource` pattern, see [Async reactivity with `resource`](/guide/signals/resource).

## `Using httpResource`

TIP: Make sure to include `provideHttpClient` in your application providers. See [Setting up HttpClient](/guide/http/setup) for details.  


You can define an HTTP resource by returning a url: 

```ts
userId = input.required<string>();

user = httpResource(() => `/api/user/${userId()}`); // A reactive function as argument
```

`httResource` is reactive, meaning that whenever one of the signal it depends on changes (like `userId`), the resource will emit a new http request. 
If a request is already pending, the resource cancels the outstanding request before issuing a new one.  

HELPFUL: `httpResource` differs from the `HttpClient` as it initiates the request _eagerly_. In contrast, the `HttpClient` only initiates requests upon subscription to the returned `Observable`.

For more advanced requests, you can define a request object similar to the request taken by `HttpClient`.
Each property of the request object that should be reactive should be composed by a signal.

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
  transferCache: true,
  keepalive: true,  
  mode: 'cors', 
  redirect: 'error',
  priority: 'high',
  cache : 'force-cache',
  credentials: 'include',
  referrer: 'no-referrer',
  integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GhEXAMPLEKEY='
}));
```

TIP: Avoid using `httpResource` for _mutations_ like `POST` or `PUT`. Instead, prefer directly using the underlying `HttpClient` APIs.

The signals of the `httpResource` can be used in the template to control which elements should be displayed. 

```angular-html
@if(user.hasValue()) {
  <user-details [user]="user.value()">
} @else if (user.error()) {
  <div>Could not load user information</div>
} @else if (user.isLoading()) {
  <div>Loading user info...</div>
}
```

HELPFUL: Reading the `value` signal on a `resource` that is in error state throws at runtime. It is recommended to guard `value` reads with `hasValue()`.

### Response types 

By default, `httpResource` returns and parses the response as JSON. However, you can specify alternate return with additional functions on `httpResource`: 

```ts
httpResource.text(() => ({ … })); // returns a string in value()

httpResource.blob(() => ({ … })); // returns a Blob object in value()

httpResource.arrayBuffer(() => ({ … })); // returns an ArrayBuffer in value()
```

## Response parsing and validation

When fetching data, you may want to validate responses against a predefined schema, often using popular open-source libraries like [Zod](https://zod.dev) or [Valibot](https://valibot.dev). You can integrate validation libraries like this with `httpResource` by specifying a `parse` option. The return type of the `parse` function determines the type of the resource's `value`.

The following example uses Zod to parse and validate the response from the [StarWars API](https://swapi.info/). The resource is then typed the same as the output type of Zod’s parsing.

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
    () => `https://swapi.info/api/people/${this.id()}`,
    { parse: starWarsPersonSchema.parse }
  );
}
```

## Testing an httpResource

Because `httpResource` is a wrapper around `HttpClient`, you can test `httpResource` with the exact same APIs as `HttpClient`. See [HttpClient Testing](/guide/http/testing) for details.

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
const response = httpResource(() => `/data/${id()}`, {injector: TestBed.inject(Injector)});
TestBed.tick(); // Triggers the effect
const firstRequest = mockBackend.expectOne('/data/0');
firstRequest.flush(0);

// Ensures the values are propagated to the httpResource
await TestBed.inject(ApplicationRef).whenStable();

expect(response.value()).toEqual(0);
```
