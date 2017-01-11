import {ModuleWithProviders, NgModule} from '@angular/core';
import {
  MdOptionModule, OverlayModule, OVERLAY_PROVIDERS, DefaultStyleCompatibilityModeModule
} from '../core';
import {MdAutocomplete} from './autocomplete';
import {MdAutocompleteTrigger} from './autocomplete-trigger';
export * from './autocomplete';
export * from './autocomplete-trigger';

@NgModule({
  imports: [MdOptionModule, OverlayModule, DefaultStyleCompatibilityModeModule],
  exports: [
      MdAutocomplete, MdOptionModule, MdAutocompleteTrigger, DefaultStyleCompatibilityModeModule
  ],
  declarations: [MdAutocomplete, MdAutocompleteTrigger],
})
export class MdAutocompleteModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdAutocompleteModule,
      providers: [OVERLAY_PROVIDERS]
    };
  }
}
