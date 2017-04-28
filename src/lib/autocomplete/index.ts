import {NgModule} from '@angular/core';
import {MdOptionModule, OverlayModule, MdCommonModule} from '../core';
import {CommonModule} from '@angular/common';
import {MdAutocomplete} from './autocomplete';
import {MdAutocompleteTrigger} from './autocomplete-trigger';

@NgModule({
  imports: [MdOptionModule, OverlayModule, MdCommonModule, CommonModule],
  exports: [MdAutocomplete, MdOptionModule, MdAutocompleteTrigger, MdCommonModule],
  declarations: [MdAutocomplete, MdAutocompleteTrigger],
})
export class MdAutocompleteModule {}


export * from './autocomplete';
export * from './autocomplete-trigger';
