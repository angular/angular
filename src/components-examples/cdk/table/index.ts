import {CdkTableModule} from '@angular/cdk/table';
import {NgModule} from '@angular/core';
import {CdkTableFlexBasicExample} from './cdk-table-flex-basic/cdk-table-flex-basic-example';
import {CdkTableBasicExample} from './cdk-table-basic/cdk-table-basic-example';
import {
  CdkTableFixedLayoutExample,
} from './cdk-table-fixed-layout/cdk-table-fixed-layout-example';

export {
  CdkTableBasicExample,
  CdkTableFlexBasicExample,
  CdkTableFixedLayoutExample,
};

const EXAMPLES = [
  CdkTableBasicExample,
  CdkTableFlexBasicExample,
  CdkTableFixedLayoutExample,
];

@NgModule({
  imports: [
    CdkTableModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class CdkTableExamplesModule {
}
