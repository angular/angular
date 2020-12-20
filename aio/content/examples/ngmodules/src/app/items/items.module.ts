import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemsComponent } from './items.component';
import { ItemsListComponent } from './items-list.component';
import { ItemsDetailComponent } from './items-detail.component';
import { ItemService } from './items.service';
import { ItemsRoutingModule } from './items-routing.module';

@NgModule({
  imports:      [ CommonModule, ItemsRoutingModule ],
  declarations: [ ItemsComponent, ItemsDetailComponent, ItemsListComponent ],
  providers:    [ ItemService ]
})
export class ItemsModule {}
