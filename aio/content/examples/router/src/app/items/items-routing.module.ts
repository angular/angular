// #docregion
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ItemListComponent }    from './item-list/item-list.component';
import { ItemDetailComponent }  from './item-detail/item-detail.component';

const itemsRoutes: Routes = [
  { path: 'items', redirectTo: '/exclusive-items' },
  { path: 'item/:id', redirectTo: '/exclusive-item/:id' },
  { path: 'exclusive-items',  component: ItemListComponent, data: { animation: 'items' } },
  { path: 'exclusive-item/:id', component: ItemDetailComponent, data: { animation: 'item' } }
];

@NgModule({
  imports: [
    RouterModule.forChild(itemsRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class ItemsRoutingModule { }
// #enddocregion
