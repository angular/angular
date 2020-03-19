// #docplaster
// #docregion
import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';

import { AdminComponent }           from './admin/admin.component';
import { AdminDashboardComponent }  from './admin-dashboard/admin-dashboard.component';
import { ManageClearanceComponent }    from './manage-clearance/manage-clearance.component';
import { ManageItemsComponent }    from './manage-items/manage-items.component';

// #docregion admin-route
import { AuthGuard }                from '../auth/auth.guard';

const adminRoutes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        children: [
          { path: 'clearance', component: ManageClearanceComponent },
          { path: 'items', component: ManageItemsComponent },
          { path: '', component: AdminDashboardComponent }
        ],
        // #enddocregion admin-route
        canActivateChild: [AuthGuard]
        // #docregion admin-route
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(adminRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AdminRoutingModule {}
// #enddocregion
