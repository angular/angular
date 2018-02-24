import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmbeddedStackblitzComponent, LiveExampleComponent } from './live-example.component';
import { WithCustomElement } from '../element-registry';

@NgModule({
  imports: [ CommonModule ],
  declarations: [ LiveExampleComponent, EmbeddedStackblitzComponent ],
  entryComponents: [ LiveExampleComponent ]
})
export class LiveExampleModule implements WithCustomElement {
  customElement: Type<any> = LiveExampleComponent;
}
