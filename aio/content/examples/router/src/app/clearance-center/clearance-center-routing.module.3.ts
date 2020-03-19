// #docplaster
// #docregion
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClearanceCenterHomeComponent } from './clearance-center-home/clearance-center-home.component';
import { ClearanceListComponent }       from './clearance-list/clearance-list.component';
import { ClearanceCenterComponent }     from './clearance-center/clearance-center.component';
import { ClearanceDetailComponent }     from './clearance-detail/clearance-detail.component';

// #docregion can-deactivate-guard
import { CanDeactivateGuard }    from '../can-deactivate.guard';

const clearanceCenterRoutes: Routes = [
  {
    path: 'crisis-center',
    component: ClearanceCenterComponent,
    children: [
      {
        path: '',
        component: ClearanceListComponent,
        children: [
          {
            path: ':id',
            component: ClearanceDetailComponent,
            canDeactivate: [CanDeactivateGuard]
          },
          {
            path: '',
            component: ClearanceCenterHomeComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(clearanceCenterRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class ClearanceCenterRoutingModule { }
// #enddocregion
