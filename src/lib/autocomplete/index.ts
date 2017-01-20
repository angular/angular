import {ModuleWithProviders, NgModule} from '@angular/core';
import {MdOptionModule, OverlayModule, OVERLAY_PROVIDERS, CompatibilityModule} from '../core';
import {MdAutocomplete} from './autocomplete';
import {MdAutocompleteTrigger} from './autocomplete-trigger';
export * from './autocomplete';
export * from './autocomplete-trigger';

@NgModule({
  imports: [MdOptionModule, OverlayModule, CompatibilityModule],
  exports: [MdAutocomplete, MdOptionModule, MdAutocompleteTrigger, CompatibilityModule],
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
