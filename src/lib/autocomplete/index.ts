import {ModuleWithProviders, NgModule} from '@angular/core';

import {MdOptionModule, OverlayModule, OVERLAY_PROVIDERS, CompatibilityModule} from '../core';
import {CommonModule} from '@angular/common';
import {MdAutocomplete} from './autocomplete';
import {MdAutocompleteTrigger} from './autocomplete-trigger';

@NgModule({
  imports: [MdOptionModule, OverlayModule, CompatibilityModule, CommonModule],
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


export * from './autocomplete';
export * from './autocomplete-trigger';
