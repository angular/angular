// #docregion
import { Injectable }             from '@angular/core';
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router';

import { Crisis, CrisisService } from './crisis.service';

@Injectable()
export class CrisisDetailResolver implements Resolve<Crisis> {
  constructor(private cs: CrisisService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Crisis> {
    let id = route.params['id'];

    return this.cs.getCrisis(id).then(crisis => {
      if (crisis) {
        return crisis;
      } else { // id not found
        this.router.navigate(['/crisis-center']);
        return null;
      }
    });
  }
}
