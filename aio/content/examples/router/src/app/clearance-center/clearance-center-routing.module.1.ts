// #docplaster
// #docregion
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClearanceCenterHomeComponent } from './clearance-center-home/clearance-center-home.component';
import { ClearanceListComponent }       from './clearance-list/clearance-list.component';
import { ClearanceCenterComponent }     from './clearance-center/clearance-center.component';
import { ClearanceDetailComponent }     from './clearance-detail/clearance-detail.component';

// #docregion routes
const clearanceCenterRoutes: Routes = [
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
            component: ClearanceDetailComponent
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
// #enddocregion routes

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
