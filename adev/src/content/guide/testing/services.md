# Testing services

To check that your services are working as you intend, you can write tests specifically for them.

Services are often the smoothest files to unit test.
Here are some synchronous and asynchronous unit tests of the `ValueService` written without assistance from Angular testing utilities.

```ts
describe('ValueService', () => {
  let service: ValueService;

  beforeEach(() => {
    // Only works if the service doesn't rely on Angular inject()
    service = new ValueService();
  });

  it('getValue should return real value', () => {
    expect(service.getValue()).toBe('real value');
  });

  it('getObservableValue should return value from observable', async () => {
    const value = await new Promise<string>((resolve) => {
      service.getObservableValue().subscribe(resolve);
    });

    expect(value).toBe('observable value');
  });

  it('getPromiseValue should return value from a promise', async () => {
    const value = await service.getPromiseValue();
    expect(value).toBe('promise value');
  });
});
```

## Testing services with the `TestBed`

Your application relies on Angular [dependency injection (DI)](guide/di) to create services.
When a service has a dependent service, DI finds or creates that dependent service.
And if that dependent service has its own dependencies, DI finds-or-creates them as well.

As a service _consumer_, you don't worry about any of this.
You don't worry about the order of constructor arguments or how they're created.

As a service _tester_, you must at least think about the first level of service dependencies but you _can_ let Angular DI do the service creation and deal with constructor argument order when you use the `TestBed` testing utility to provide and create services.

## Angular `TestBed`

The `TestBed` is the most important of the Angular testing utilities.
The `TestBed` creates a dynamically-constructed Angular _test_ module that emulates an Angular [@NgModule](guide/ngmodules/overview).

The `TestBed.configureTestingModule()` method takes a metadata object that can have most of the properties of an [@NgModule](guide/ngmodules/overview).

To test a service, you set the `providers` metadata property with an array of the services that you'll test or mock.

```ts
let service: ValueService;
beforeEach(() => {
  TestBed.configureTestingModule({providers: [ValueService]});
});
```

Then inject it inside a test by calling `TestBed.inject()` with the service class as the argument.

```ts
it('should use ValueService', () => {
  service = TestBed.inject(ValueService);
  expect(service.getValue()).toBe('real value');
});
```

Or inside the `beforeEach()` if you prefer to inject the service as part of your setup.

```ts
beforeEach(() => {
  TestBed.configureTestingModule({providers: [ValueService]});
  service = TestBed.inject(ValueService);
});
```

When testing a service with a dependency, provide the mock in the `providers` array.

In the following example, the mock is a spy object.

```ts
let masterService: MainService;
let valueServiceSpy: Mocked<ValueService>;

beforeEach(() => {
  const spy: Mocked<ValueService> = {getValue: vi.fn()};

  TestBed.configureTestingModule({
    providers: [MainService, {provide: ValueService, useValue: spy}],
  });

  masterService = TestBed.inject(MainService);
  valueServiceSpy = TestBed.inject(ValueService) as Mocked<ValueService>;
});
```

The test consumes that spy in the same way it did earlier.

```ts
it('getValue should return stubbed value from a spy', () => {
  const stubValue = 'stub value';

  valueServiceSpy.getValue.mockReturnValue(stubValue);

  expect(masterService.getValue(), 'service returned stub value').toBe(stubValue);
  expect(valueServiceSpy.getValue, 'spy method was called once').toHaveBeenCalledTimes(1);
  expect(valueServiceSpy.getValue.mock.results.at(-1)?.value).toBe(stubValue);
});
```

## Testing HTTP services

For testing services that rely on the `HttpClient`, refer to the [dedicated guide](/guide/http/testing).
