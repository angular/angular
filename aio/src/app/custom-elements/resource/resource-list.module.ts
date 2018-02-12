import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceListComponent } from './resource-list.component';
import { ResourceService } from './resource.service';
import { WithCustomElements } from '../element-registry';

@NgModule({
  imports: [ CommonModule ],
  declarations: [ ResourceListComponent ],
  entryComponents: [ ResourceListComponent ],
  providers: [ ResourceService ]
})
export class ResourceListModule implements WithCustomElements {
  customElements: Type<any>[] = [ ResourceListComponent ];
}
