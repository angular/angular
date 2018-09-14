import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WithCustomElementComponent } from '../../element-registry';
import { NgForComponent } from './ng-for.component';
import { ContainerModule } from '../container/container.module';
import { ProductService } from '../product.service';

@NgModule({
  imports: [ CommonModule, ContainerModule, MatTooltipModule ],
  declarations: [ NgForComponent ],
  exports: [ NgForComponent ],
  entryComponents: [ NgForComponent ],
  providers: [ ProductService ]
})
export class NgForModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = NgForComponent;
}
