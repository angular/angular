import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentLocationComponent } from './current-location.component';
import { WithCustomElements } from '../element-registry';

@NgModule({
  imports: [ CommonModule ],
  declarations: [ CurrentLocationComponent ],
  entryComponents: [ CurrentLocationComponent ]
})
export class CurrentLocationModule implements WithCustomElements {
  customElements: Type<any>[] = [ CurrentLocationComponent ];
}
