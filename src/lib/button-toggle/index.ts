import {NgModule, ModuleWithProviders} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MdButtonToggleGroup, MdButtonToggleGroupMultiple, MdButtonToggle} from './button-toggle';
import {
  UNIQUE_SELECTION_DISPATCHER_PROVIDER,
  CompatibilityModule,
  FocusOriginMonitor,
} from '../core';


@NgModule({
  imports: [FormsModule, CompatibilityModule],
  exports: [
    MdButtonToggleGroup,
    MdButtonToggleGroupMultiple,
    MdButtonToggle,
    CompatibilityModule,
  ],
  declarations: [MdButtonToggleGroup, MdButtonToggleGroupMultiple, MdButtonToggle],
  providers: [UNIQUE_SELECTION_DISPATCHER_PROVIDER, FocusOriginMonitor]
})
export class MdButtonToggleModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdButtonToggleModule,
      providers: []
    };
  }
}


export * from './button-toggle';
