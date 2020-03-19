// #docregion
import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';

import { AdminComponent }           from './admin/admin.component';
import { AdminDashboardComponent }  from './admin-dashboard/admin-dashboard.component';
import { ManageClearanceComponent }    from './manage-clearance/manage-clearance.component';
import { ManageItemsComponent }    from './manage-items/manage-items.component';

import { AdminRoutingModule }       from './admin-routing.module';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule
  ],
  declarations: [
    AdminComponent,
    AdminDashboardComponent,
    ManageClearanceComponent,
    ManageItemsComponent
  ]
})
export class AdminModule {}
