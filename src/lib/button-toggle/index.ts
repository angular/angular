import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MdButtonToggleGroup, MdButtonToggleGroupMultiple, MdButtonToggle} from './button-toggle';
import {
  UNIQUE_SELECTION_DISPATCHER_PROVIDER,
  MdCommonModule,
  StyleModule,
} from '../core';


@NgModule({
  imports: [FormsModule, MdCommonModule, StyleModule],
  exports: [
    MdButtonToggleGroup,
    MdButtonToggleGroupMultiple,
    MdButtonToggle,
    MdCommonModule,
  ],
  declarations: [MdButtonToggleGroup, MdButtonToggleGroupMultiple, MdButtonToggle],
  providers: [UNIQUE_SELECTION_DISPATCHER_PROVIDER]
})
export class MdButtonToggleModule {}


export * from './button-toggle';
