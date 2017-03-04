import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdChipList} from './chip-list';
import {MdChip} from './chip';


@NgModule({
  imports: [],
  exports: [MdChipList, MdChip],
  declarations: [MdChipList, MdChip]
})
export class MdChipsModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdChipsModule,
      providers: []
    };
  }
}


export * from './chip-list';
export * from './chip';
