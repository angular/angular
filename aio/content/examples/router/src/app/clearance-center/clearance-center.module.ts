// #docregion
import { NgModule }       from '@angular/core';
import { FormsModule }    from '@angular/forms';
import { CommonModule }   from '@angular/common';

import { ClearanceCenterHomeComponent } from './clearance-center-home/clearance-center-home.component';
import { ClearanceListComponent }       from './clearance-list/clearance-list.component';
import { ClearanceCenterComponent }     from './clearance-center/clearance-center.component';
import { ClearanceDetailComponent }     from './clearance-detail/clearance-detail.component';

import { ClearanceCenterRoutingModule } from './clearance-center-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ClearanceCenterRoutingModule
  ],
  declarations: [
    ClearanceCenterComponent,
    ClearanceListComponent,
    ClearanceCenterHomeComponent,
    ClearanceDetailComponent
  ]
})
export class ClearanceCenterModule {}
