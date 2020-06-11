import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsComponent } from './events.component';
import { EventsService } from './events.service';
import { WithCustomElementComponent } from '../element-registry';

@NgModule({
  imports: [ CommonModule ],
  declarations: [ EventsComponent ],
  entryComponents: [ EventsComponent ],
  providers: [ EventsService]
})
export class EventsModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = EventsComponent;
}
