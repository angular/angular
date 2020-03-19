// #docregion
import { Injectable }           from '@angular/core';
import { Observable }           from 'rxjs';
import { CanDeactivate,
         ActivatedRouteSnapshot,
         RouterStateSnapshot }  from '@angular/router';

// import { ClearanceDetailComponent } from './clearance-center/clearance-detail/clearance-detail.component';
import { ClearanceDetailComponent} from './clearance-center/clearance-detail/clearance-detail.component';

@Injectable({
  providedIn: 'root',
})
export class CanDeactivateGuard implements CanDeactivate<ClearanceDetailComponent> {

  canDeactivate(
    component: ClearanceDetailComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    // Get the Clearance Center ID
    console.log(route.paramMap.get('id'));

    // Get the current URL
    console.log(state.url);

    // Allow synchronous navigation (`true`) if no clearance or the clearance is unchanged
    if (!component.clearanceItem || component.clearanceItem.name === component.editName) {
      return true;
    }
    // Otherwise ask the user with the dialog service and return its
    // observable which resolves to true or false when the user decides
    return component.dialogService.confirm('Discard changes?');
  }
}
