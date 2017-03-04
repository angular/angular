import {NgModule} from '@angular/core';
import {MdPseudoCheckbox} from './pseudo-checkbox/pseudo-checkbox';


@NgModule({
  exports: [MdPseudoCheckbox],
  declarations: [MdPseudoCheckbox]
})
export class MdSelectionModule { }


export * from './pseudo-checkbox/pseudo-checkbox';
