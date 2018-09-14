import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WithCustomElementComponent } from '../../element-registry';
import { NgIfComponent } from './ng-if.component';
import { ContainerModule } from '../container/container.module';
import { ProductService } from '../product.service';

@NgModule({
  imports: [ CommonModule, ContainerModule, MatTooltipModule ],
  declarations: [ NgIfComponent ],
  exports: [ NgIfComponent ],
  entryComponents: [ NgIfComponent ],
  providers: [ ProductService ]
})
export class NgIfModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = NgIfComponent;
}
