import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MdButtonToggleGroup, MdButtonToggleGroupMultiple, MdButtonToggle} from './button-toggle';
import {
  UNIQUE_SELECTION_DISPATCHER_PROVIDER,
  MdCommonModule,
  FocusOriginMonitor,
} from '../core';


@NgModule({
  imports: [FormsModule, MdCommonModule],
  exports: [
    MdButtonToggleGroup,
    MdButtonToggleGroupMultiple,
    MdButtonToggle,
    MdCommonModule,
  ],
  declarations: [MdButtonToggleGroup, MdButtonToggleGroupMultiple, MdButtonToggle],
  providers: [UNIQUE_SELECTION_DISPATCHER_PROVIDER, FocusOriginMonitor]
})
export class MdButtonToggleModule {}


export * from './button-toggle';
