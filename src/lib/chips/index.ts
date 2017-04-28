import {NgModule} from '@angular/core';
import {MdChipList} from './chip-list';
import {MdChip} from './chip';


@NgModule({
  imports: [],
  exports: [MdChipList, MdChip],
  declarations: [MdChipList, MdChip]
})
export class MdChipsModule {}


export * from './chip-list';
export * from './chip';
