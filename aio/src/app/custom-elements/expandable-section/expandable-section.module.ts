import { NgModule, Type } from '@angular/core';
import { ExpandableSectionComponent } from './expandable-section.component';
import { WithCustomElements } from '../element-registry';
import { MatExpansionModule } from '@angular/material';

@NgModule({
  imports: [ MatExpansionModule ],
  declarations: [ ExpandableSectionComponent, ],
  entryComponents: [ ExpandableSectionComponent ]
})
export class ExpandableSectionModule implements WithCustomElements {
  customElements: Type<any>[] = [ ExpandableSectionComponent ];
}
