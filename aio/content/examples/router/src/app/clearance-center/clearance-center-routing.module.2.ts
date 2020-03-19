// #docplaster
// #docregion routes
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClearanceCenterHomeComponent } from './clearance-center-home/clearance-center-home.component';
import { ClearanceListComponent }       from './clearance-list/clearance-list.component';
import { ClearanceCenterComponent }     from './clearance-center/clearance-center.component';
import { ClearanceDetailComponent }     from './clearance-detail/clearance-detail.component';
// #enddocregion routes

// #docregion can-deactivate-guard
import { CanDeactivateGuard }    from '../can-deactivate.guard';
// #enddocregion can-deactivate-guard
// #docregion crisis-detail-resolver
import { ClearanceDetailResolverService }  from './clearance-detail-resolver.service';

// #enddocregion crisis-detail-resolver
// #docregion routes

const clearanceCenterRoutes: Routes = [
// #enddocregion routes
  // #docregion routes
  {
    path: 'clearance-center',
    component: ClearanceCenterComponent,
    children: [
      {
        path: '',
        component: ClearanceListComponent,
        children: [
          {
            path: ':id',
            component: ClearanceDetailComponent,
  // #enddocregion routes
            // #docregion can-deactivate-guard
            canDeactivate: [CanDeactivateGuard],
            // #enddocregion can-deactivate-guard
            // #docregion crisis-detail-resolver
            resolve: {
              clearance: ClearanceDetailResolverService
            }
            // #enddocregion crisis-detail-resolver
  // #docregion routes
          },
          {
            path: '',
            component: ClearanceCenterHomeComponent
          }
        ]
      }
    ]
  }
  // #enddocregion routes
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
