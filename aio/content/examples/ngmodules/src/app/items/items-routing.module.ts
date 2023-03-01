import { NgModule } from '@angular/core';
import { Routes,
         RouterModule } from '@angular/router';

import { ItemsListComponent } from './items-list.component';
import { ItemsDetailComponent } from './items-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full'},
  { path: 'list',    component: ItemsListComponent },
  { path: ':id', component: ItemsDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemsRoutingModule {}

