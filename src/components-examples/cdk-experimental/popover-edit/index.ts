import {CdkPopoverEditModule} from '@angular/cdk-experimental/popover-edit';
import {CdkTableModule} from '@angular/cdk/table';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  CdkPopoverEditCdkTableFlexExample
} from './cdk-popover-edit-cdk-table-flex/cdk-popover-edit-cdk-table-flex-example';
import {
  CdkPopoverEditCdkTableExample
} from './cdk-popover-edit-cdk-table/cdk-popover-edit-cdk-table-example';
import {
  CdkPopoverEditCellSpanVanillaTableExample
  // tslint:disable-next-line:max-line-length
} from './cdk-popover-edit-cell-span-vanilla-table/cdk-popover-edit-cell-span-vanilla-table-example';
import {
  CdkPopoverEditTabOutVanillaTableExample
} from './cdk-popover-edit-tab-out-vanilla-table/cdk-popover-edit-tab-out-vanilla-table-example';
import {
  CdkPopoverEditVanillaTableExample
} from './cdk-popover-edit-vanilla-table/cdk-popover-edit-vanilla-table-example';

export {
  CdkPopoverEditCdkTableFlexExample,
  CdkPopoverEditCdkTableExample,
  CdkPopoverEditCellSpanVanillaTableExample,
  CdkPopoverEditTabOutVanillaTableExample,
  CdkPopoverEditVanillaTableExample
};

const EXAMPLES = [
  CdkPopoverEditCdkTableExample,
  CdkPopoverEditCdkTableFlexExample,
  CdkPopoverEditCellSpanVanillaTableExample,
  CdkPopoverEditTabOutVanillaTableExample,
  CdkPopoverEditVanillaTableExample,
];

@NgModule({
  imports: [
    CdkPopoverEditModule,
    CdkTableModule,
    FormsModule,
    CommonModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class CdkPopoverEditExamplesModule {
}
