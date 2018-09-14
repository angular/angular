import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WithCustomElementComponent } from '../../element-registry';
import { InterpolationComponent } from './interpolation.component';
import { ContainerModule } from '../container/container.module';

@NgModule({
  imports: [ CommonModule, ContainerModule ],
  declarations: [ InterpolationComponent ],
  exports: [ InterpolationComponent ],
  entryComponents: [ InterpolationComponent ]
})
export class InterpolationModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = InterpolationComponent;
}
