import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WithCustomElementComponent } from '../../element-registry';
import { PropertyBindingComponent } from './property-binding.component';
import { ContainerModule } from '../container/container.module';

@NgModule({
  imports: [ CommonModule, ContainerModule ],
  declarations: [ PropertyBindingComponent ],
  exports: [ PropertyBindingComponent ],
  entryComponents: [ PropertyBindingComponent ]
})
export class PropertyBindingModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = PropertyBindingComponent;
}
