import {NgModule} from '@angular/core';
import {MdChipList} from './chip-list';
import {MdChip, MdBasicChip} from './chip';


@NgModule({
  imports: [],
  exports: [MdChipList, MdChip, MdBasicChip],
  declarations: [MdChipList, MdChip, MdBasicChip]
})
export class MdChipsModule {}


export * from './chip-list';
export * from './chip';
