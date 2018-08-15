import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmbeddedStackblitzComponent, LiveExampleComponent } from './live-example.component';
import { WithCustomElementComponent } from '../element-registry';

@NgModule({
  imports: [ CommonModule ],
  declarations: [ LiveExampleComponent, EmbeddedStackblitzComponent ],
  entryComponents: [ LiveExampleComponent ]
})
export class LiveExampleModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = LiveExampleComponent;
}
