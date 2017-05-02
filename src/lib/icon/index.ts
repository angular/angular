import {NgModule} from '@angular/core';
import {MdCommonModule} from '../core';
import {MdIcon} from './icon';
import {ICON_REGISTRY_PROVIDER} from './icon-registry';


@NgModule({
  imports: [MdCommonModule],
  exports: [MdIcon, MdCommonModule],
  declarations: [MdIcon],
  providers: [ICON_REGISTRY_PROVIDER],
})
export class MdIconModule {}


export * from './icon';
export * from './icon-errors';
export * from './icon-registry';
