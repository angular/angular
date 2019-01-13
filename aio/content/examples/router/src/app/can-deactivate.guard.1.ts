// #docregion
import { Injectable }           from '@angular/core';
import { Observable }           from 'rxjs';
import { CanDeactivate,
         ActivatedRouteSnapshot,
         RouterStateSnapshot }  from '@angular/router';

import { CrisisDetailComponent } from './crisis-center/crisis-detail/crisis-detail.component';

@Injectable({
  providedIn: 'root',
})
export class CanDeactivateGuard implements CanDeactivate<CrisisDetailComponent> {

  canDeactivate(
    component: CrisisDetailComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    // 위기 관리 센터의 ID를 가져옵니다.
    console.log(route.paramMap.get('id'));

    // 현재 URL을 확인합니다.
    console.log(state.url);

    // 위기 목록이 없거나 변경되지 않았으면 `true`를 바로 반환합니다.
    if (!component.crisis || component.crisis.name === component.editName) {
      return true;
    }
    // 내용이 변경된 경우에는 사용자에게 물어보는 팝업을 띄웁니다.
    // 그리고 사용자가 응답한 값을 Observable 타입으로 반환합니다.
    return component.dialogService.confirm('Discard changes?');
  }
}
