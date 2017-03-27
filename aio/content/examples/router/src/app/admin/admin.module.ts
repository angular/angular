// #docregion
import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';

import { AdminComponent }           from './admin.component';
import { AdminDashboardComponent }  from './admin-dashboard.component';
import { ManageCrisesComponent }    from './manage-crises.component';
import { ManageHeroesComponent }    from './manage-heroes.component';

import { AdminRoutingModule }       from './admin-routing.module';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule
  ],
  declarations: [
    AdminComponent,
    AdminDashboardComponent,
    ManageCrisesComponent,
    ManageHeroesComponent
  ]
})
export class AdminModule {}
