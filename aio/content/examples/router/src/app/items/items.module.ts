// #docplaster
// #docregion
// #docregion v1
import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';

import { ItemListComponent }    from './item-list/item-list.component';
import { ItemDetailComponent }  from './item-detail/item-detail.component';

// #enddocregion v1
import { ItemsRoutingModule } from './items-routing.module';

// #docregion v1
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
// #enddocregion v1
    ItemsRoutingModule
// #docregion v1
  ],
  declarations: [
    ItemListComponent,
    ItemDetailComponent
  ]
})
export class ItemsModule {}
// #enddocregion v1
// #enddocregion
