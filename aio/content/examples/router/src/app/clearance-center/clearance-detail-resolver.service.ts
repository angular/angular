
// #docregion
import { Injectable }             from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
}                                 from '@angular/router';
import { Observable, of, EMPTY }  from 'rxjs';
import { mergeMap, take }         from 'rxjs/operators';

import { ClearanceService }  from './clearance.service';
import { ClearanceItem } from './clearance-item';

@Injectable({
  providedIn: 'root',
})
export class ClearanceDetailResolverService implements Resolve<ClearanceItem> {
  constructor(private clearanceService: ClearanceService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ClearanceItem> | Observable<never> {
    let id = route.paramMap.get('id');

    return this.clearanceService.getClearanceItem(id).pipe(
      take(1),
      mergeMap(clearanceItem => {
        if (clearanceItem) {
          return of(clearanceItem);
        } else { // id not found
          this.router.navigate(['/clearance-item-center']);
          return EMPTY;
        }
      })
    );
  }
}
