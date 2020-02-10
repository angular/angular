// export for convenience.
export { ActivatedRoute } from '@angular/router';

// #docregion activated-route-stub
import { convertToParamMap, ParamMap, Params } from '@angular/router';
import { ReplaySubject } from 'rxjs';

/**
 * `paramMap` 옵저버블을 제공하는 ActivatedRoute 클래스의 목 클래스를 정의합니다.
 * `paramMap`으로 데이터를 보낼 때는 `setParamMap()` 메소드를 활용합니다.
 */
export class ActivatedRouteStub {
  // 구독자가 이전 값을 참조할 수 있도록 ReplaySubject를 사용합니다.
  // `paramMap` 옵저버블로 제공되는 데이터도 이 객체로 전달됩니다.
  private subject = new ReplaySubject<ParamMap>();

  constructor(initialParams?: Params) {
    this.setParamMap(initialParams);
  }

  /** 목 paramMap 옵저버블 */
  readonly paramMap = this.subject.asObservable();

  /** paramMap 옵저버블로 데이터를 전달합니다. */
  setParamMap(params?: Params) {
    this.subject.next(convertToParamMap(params));
  }
}
// #enddocregion activated-route-stub
