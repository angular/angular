// #docplaster
// #docregion imports
// Http testing module and mocking controller
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// Other imports
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

// #enddocregion imports
import { HttpHeaders } from '@angular/common/http';

interface Data {
  name: string;
}

const testUrl = '/data';

// #docregion setup
describe('HttpClient testing', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });

    // Inject the http service and test controller for each test
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });
  // #enddocregion setup
  // #docregion afterEach
  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });
  // #enddocregion afterEach
  // #docregion setup
  /// Tests begin ///
  // #enddocregion setup
  // #docregion get-test
  it('can test HttpClient.get', () => {
    const testData: Data = {name: 'Test Data'};

    // Make an HTTP GET request
    httpClient.get<Data>(testUrl)
      .subscribe(data =>
        // When observable resolves, result should match test data
        expect(data).toEqual(testData)
      );

    // The following `expectOne()` will match the request's URL.
    // If no requests or multiple requests matched that URL
    // `expectOne()` would throw.
    const req = httpTestingController.expectOne('/data');

    // Assert that the request is a GET.
    expect(req.request.method).toEqual('GET');

    // Respond with mock data, causing Observable to resolve.
    // Subscribe callback asserts that correct data was returned.
    req.flush(testData);

    // Finally, assert that there are no outstanding requests.
    httpTestingController.verify();
  });
  // #enddocregion get-test

  it('can test HttpClient.get with matching header', () => {
    const testData: Data = {name: 'Test Data'};

    // Make an HTTP GET request with specific header
    httpClient.get<Data>(testUrl, {
        headers: new HttpHeaders({Authorization: 'my-auth-token'})
      })
      .subscribe(data =>
        expect(data).toEqual(testData)
      );

      // Find request with a predicate function.
    // #docregion predicate
    // Expect one request with an authorization header
    const req = httpTestingController.expectOne(
      request => request.headers.has('Authorization')
    );
    // #enddocregion predicate
    req.flush(testData);
  });

  it('can test multiple requests', () => {
    const testData: Data[] = [
      { name: 'bob' }, { name: 'carol' },
      { name: 'ted' }, { name: 'alice' }
    ];

    // Make three requests in a row
    httpClient.get<Data[]>(testUrl)
      .subscribe(d => expect(d.length).withContext('should have no data').toEqual(0));

    httpClient.get<Data[]>(testUrl)
      .subscribe(d => expect(d).withContext('should be one element array').toEqual([testData[0]]));

    httpClient.get<Data[]>(testUrl)
      .subscribe(d => expect(d).withContext('should be expected data').toEqual(testData));

    // #docregion multi-request
    // get all pending requests that match the given URL
    const requests = httpTestingController.match(testUrl);
    expect(requests.length).toEqual(3);

    // Respond to each request with different results
    requests[0].flush([]);
    requests[1].flush([testData[0]]);
    requests[2].flush(testData);
    // #enddocregion multi-request
  });

  // #docregion 404
  it('can test for 404 error', () => {
    const emsg = 'deliberate 404 error';

    httpClient.get<Data[]>(testUrl).subscribe({
      next: () => fail('should have failed with the 404 error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).withContext('status').toEqual(404);
        expect(error.error).withContext('message').toEqual(emsg);
      },
    });

    const req = httpTestingController.expectOne(testUrl);

    // Respond with mock error
    req.flush(emsg, { status: 404, statusText: 'Not Found' });
  });
  // #enddocregion 404

  // #docregion network-error
  it('can test for network error', done => {
    // Create mock ProgressEvent with type `error`, raised when something goes wrong
    // at network level. e.g. Connection timeout, DNS error, offline, etc.
    const mockError = new ProgressEvent('error');

    httpClient.get<Data[]>(testUrl).subscribe({
      next: () => fail('should have failed with the network error'),
      error: (error: HttpErrorResponse) => {
        expect(error.error).toBe(mockError);
        done();
      },
    });

    const req = httpTestingController.expectOne(testUrl);

    // Respond with mock error
    req.error(mockError);
  });
  // #enddocregion network-error

  it('httpTestingController.verify should fail if HTTP response not simulated', () => {
    // Sends request
    httpClient.get('some/api').subscribe();

    // verify() should fail because haven't handled the pending request.
    expect(() => httpTestingController.verify()).toThrow();

    // Now get and flush the request so that afterEach() doesn't fail
    const req = httpTestingController.expectOne('some/api');
    req.flush(null);
  });

  // Proves that verify in afterEach() really would catch error
  // if test doesn't simulate the HTTP response.
  //
  // Must disable this test because can't catch an error in an afterEach().
  // Uncomment if you want to confirm that afterEach() does the job.
  // it('afterEach() should fail when HTTP response not simulated',() => {
  //   // Sends request which is never handled by this test
  //   httpClient.get('some/api').subscribe();
  // });
// #docregion setup
});
// #enddocregion setup
