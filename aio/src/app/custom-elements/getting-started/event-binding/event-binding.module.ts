import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WithCustomElementComponent } from '../../element-registry';
import { EventBindingComponent } from './event-binding.component';
import { ContainerModule } from '../container/container.module';

@NgModule({
  imports: [ CommonModule, ContainerModule ],
  declarations: [ EventBindingComponent ],
  exports: [ EventBindingComponent ],
  entryComponents: [ EventBindingComponent ]
})
export class EventBindingModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = EventBindingComponent;
}
