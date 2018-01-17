import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { ItemsListComponent }    from './items-list.component';
import { ItemsDetailComponent }  from './items-detail.component';
import { ItemService }          from './items.service';
import { ItemsRoutingModule }    from './items-routing.module';

@NgModule({
  imports:      [ CommonModule, ItemsRoutingModule ],
  declarations: [ ItemsDetailComponent, ItemsListComponent ],
  providers:    [ ItemService ]
})
export class ItemsModule {}
