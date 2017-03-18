// #docplaster
// #docregion
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CrisisCenterHomeComponent } from './crisis-center-home.component';
import { CrisisListComponent }       from './crisis-list.component';
import { CrisisCenterComponent }     from './crisis-center.component';
import { CrisisDetailComponent }     from './crisis-detail.component';

import { CanDeactivateGuard }     from '../can-deactivate-guard.service';

// #docregion crisis-detail-resolver
import { CrisisDetailResolver }   from './crisis-detail-resolver.service';

// #enddocregion crisis-detail-resolver
const crisisCenterRoutes: Routes = [
  // #docregion redirect
  {
    path: '',
    redirectTo: '/crisis-center',
    pathMatch: 'full'
  },
  // #enddocregion redirect
  {
    path: 'crisis-center',
    component: CrisisCenterComponent,
    children: [
      {
        path: '',
        component: CrisisListComponent,
        children: [
          {
            path: ':id',
            component: CrisisDetailComponent,
            canDeactivate: [CanDeactivateGuard],
            resolve: {
              crisis: CrisisDetailResolver
            }
          },
          {
            path: '',
            component: CrisisCenterHomeComponent
          }
        ]
      }
    ]
  }
];

// #docregion crisis-detail-resolver
@NgModule({
  imports: [
    RouterModule.forChild(crisisCenterRoutes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    CrisisDetailResolver
  ]
})
export class CrisisCenterRoutingModule { }
// #enddocregion crisis-detail-resolver
// #enddocregion
