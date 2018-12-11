// #docregion
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * 비동기 모달 팝업 서비스
 * DialogService는 예제를 확인하기 위해 간단하게 구현한 서비스입니다.
 * TODO: window.confirm을 사용하지 않는 방식이 더 좋습니다.
 */
@Injectable({
  providedIn: 'root',
})
export class DialogService {
  /**
   * 어떤 행동을 할지 사용자에게 물어봅니다. `message`는 사용자에게 안내할 문구입니다.
   * `true`를 반환하면 사용자가 확정한 것으로 처리하고, `false`를 반환하면 취소한 것으로 처리합니다.
   * 결과는 Observable 타입으로 반환합니다.
   */
  confirm(message?: string): Observable<boolean> {
    const confirmation = window.confirm(message || 'Is it OK?');

    return of(confirmation);
  };
}
