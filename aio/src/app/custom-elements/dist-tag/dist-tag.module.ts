import { NgModule, Type } from '@angular/core';
import { WithCustomElementComponent } from '../element-registry';

import { DistTagComponent } from './dist-tag.component';

@NgModule({
  declarations: [DistTagComponent],
  entryComponents: [DistTagComponent],
})
export class MajorVersionModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = DistTagComponent;
}
