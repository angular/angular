import { NgModule, Type } from '@angular/core';
import { WithCustomElementComponent } from '../element-registry';

import { MajorVersionComponent } from './major-version.component';

@NgModule({
  declarations: [MajorVersionComponent],
  entryComponents: [MajorVersionComponent],
})
export class MajorVersionModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = MajorVersionComponent;
}
