import {NgModule} from '@angular/core';
import {MdCommonModule} from '../core';
import {MdToolbar, MdToolbarRow} from './toolbar';


@NgModule({
  imports: [MdCommonModule],
  exports: [MdToolbar, MdToolbarRow, MdCommonModule],
  declarations: [MdToolbar, MdToolbarRow],
})
export class MdToolbarModule {}


export * from './toolbar';
