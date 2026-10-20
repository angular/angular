# HTTP Testing

HTTP testing is the standard, preferred way to test Angular services and components that rely on `HttpClient`. It provides a robust, reliable API using `HttpTestingController` to mock backend responses and verify request parameters without making real network calls.

## Why Use HttpTestingController?

- **Robustness:** Tests don't rely on live network endpoints or brittle real backend configurations.
- **Precision:** Allows exact verification of request URLs, methods, and payloads using `expectOne()`.
- **Reliability:** Automatically ensures no unexpected or dangling requests remain unhandled via `verify()`.

## Using HTTP Testing in a Unit Test

The `provideHttpClient()` and `provideHttpClientTesting()` providers are the entry point for testing HTTP requests in unit tests.

### Example: Testing with `HttpTestingController`

```ts
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting, HttpTestingController} from '@angular/common/http/testing';
import {MyService} from './my.service';

describe('MyService', () => {
  let service: MyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MyService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(MyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Ensures that there are no outstanding unmatched requests
    httpMock.verify();
  });

  it('should fetch data via GET', () => {
    const mockData = { id: 1, name: 'Angular' };

    service.getData().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    // Expect a single request to the specified URL and method
    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
    
    // Return mock data
    req.flush(mockData);
  });
});