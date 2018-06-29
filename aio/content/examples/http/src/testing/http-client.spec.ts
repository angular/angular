// #docplaster
// #docregion imports
// Http 테스트 모듈과 목업 컨트롤러를 로드합니다.
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// 다른 심볼도 로드합니다.
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

    // http 서비스와 테스트 컨트롤러를 각 테스트 케이스에 주입합니다.
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
  });
  // #enddocregion setup
  // #docregion afterEach
  afterEach(() => {
    // 각 테스트 케이스가 끝나기 전에, 보내지 않고 남아있는 HTTP 요청이 없는지 확인합니다.
    httpTestingController.verify();
  });
  // #enddocregion afterEach
  // #docregion setup
  /// 테스트 케이스 시작 ///
  // #enddocregion setup
  // #docregion get-test
  it('can test HttpClient.get', () => {
    const testData: Data = {name: 'Test Data'};

    // HTTP GET 요청을 발생시킵니다.
    httpClient.get<Data>(testUrl)
      .subscribe(data =>
        // 옵저버블이 처리되고 받은 응답이 테스트 데이터와 같은지 검사합니다.
        expect(data).toEqual(testData)
      );

    // `expectOne()`은 HTTP 요청의 URL과 매칭됩니다.
    // 이 주소로 HTTP 요청이 발생하지 않거나 여러번 요청되면 에러를 반환합니다.
    const req = httpTestingController.expectOne('/data');

    // HTTP 요청 방식이 GET인지 검사합니다.
    expect(req.request.method).toEqual('GET');

    // 목업 데이터로 응답을 보내면 옵저버블이 종료됩니다.
    // 옵저버블로 받은 데이터는 구독 함수에서 검사합니다.
    req.flush(testData);

    // 마지막으로, 보내지 않고 남아있는 HTTP 요청이 있는지 검사합니다.
    httpTestingController.verify();
  });
  // #enddocregion get-test
  it('can test HttpClient.get with matching header', () => {
    const testData: Data = {name: 'Test Data'};

    // Make an HTTP GET request with specific header
    httpClient.get<Data>(testUrl, {
        headers: new HttpHeaders({'Authorization': 'my-auth-token'})
      })
      .subscribe(data =>
        expect(data).toEqual(testData)
      );

      // Find request with a predicate function.
    // #docregion predicate
    // 헤더에 인증 토큰이 있는지 검사합니다.
    const req = httpTestingController.expectOne(
      req => req.headers.has('Authorization')
    );
    // #enddocregion predicate
    req.flush(testData);
  });

  it('can test multiple requests', () => {
    let testData: Data[] = [
      { name: 'bob' }, { name: 'carol' },
      { name: 'ted' }, { name: 'alice' }
    ];

    // Make three requests in a row
    httpClient.get<Data[]>(testUrl)
      .subscribe(d => expect(d.length).toEqual(0, 'should have no data'));

    httpClient.get<Data[]>(testUrl)
      .subscribe(d => expect(d).toEqual([testData[0]], 'should be one element array'));

    httpClient.get<Data[]>(testUrl)
      .subscribe(d => expect(d).toEqual(testData, 'should be expected data'));

    // #docregion multi-request
    // 지정된 URL과 매칭되는 HTTP 요청을 모두 가져옵니다.
    const requests = httpTestingController.match(testUrl);
    expect(requests.length).toEqual(3);

    // 각각의 요청에 서로 다른 응답을 보냅니다.
    requests[0].flush([]);
    requests[1].flush([testData[0]]);
    requests[2].flush(testData);
    // #enddocregion multi-request
  });

  // #docregion 404
  it('can test for 404 error', () => {
    const emsg = 'deliberate 404 error';

    httpClient.get<Data[]>(testUrl).subscribe(
      data => fail('should have failed with the 404 error'),
      (error: HttpErrorResponse) => {
        expect(error.status).toEqual(404, 'status');
        expect(error.error).toEqual(emsg, 'message');
      }
    );

    const req = httpTestingController.expectOne(testUrl);

    // 에러 응답을 보냅니다.
    req.flush(emsg, { status: 404, statusText: 'Not Found' });
  });
  // #enddocregion 404

  // #docregion network-error
  it('can test for network error', () => {
    const emsg = 'simulated network error';

    httpClient.get<Data[]>(testUrl).subscribe(
      data => fail('should have failed with the network error'),
      (error: HttpErrorResponse) => {
        expect(error.error.message).toEqual(emsg, 'message');
      }
    );

    const req = httpTestingController.expectOne(testUrl);

    // ErrorEvent 객체를 생성합니다. 이 에러는 네트워크 계층에서 발생하는 에러를 의미합니다.
    // 타임아웃, DNS 에러, 오프라인 상태일 때 발생하는 에러가 이런 종류에 해당합니다.
    const mockError = new ErrorEvent('Network error', {
      message: emsg,
      // #enddocregion network-error
      // The rest of this is optional and not used.
      // Just showing that you could provide this too.
      filename: 'HeroService.ts',
      lineno: 42,
      colno: 21
    // #docregion network-error
    });

    // 에러 응답을 보냅니다.
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
