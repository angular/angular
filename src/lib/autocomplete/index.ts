import {ModuleWithProviders, NgModule} from '@angular/core';
import {DefaultStyleCompatibilityModeModule} from '../core';
import {MdAutocomplete} from './autocomplete';
export * from './autocomplete';

@NgModule({
  imports: [DefaultStyleCompatibilityModeModule],
  exports: [MdAutocomplete, DefaultStyleCompatibilityModeModule],
  declarations: [MdAutocomplete],
})
export class MdAutocompleteModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdAutocompleteModule,
      providers: []
    };
  }
}
