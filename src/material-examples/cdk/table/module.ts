import {CdkTableModule} from '@angular/cdk/table';
import {NgModule} from '@angular/core';
import {CdkTableBasicFlexExample} from './cdk-table-basic-flex/cdk-table-basic-flex-example';
import {CdkTableBasicExample} from './cdk-table-basic/cdk-table-basic-example';

export {
  CdkTableBasicExample,
  CdkTableBasicFlexExample,
};

const EXAMPLES = [
  CdkTableBasicExample,
  CdkTableBasicFlexExample,
];

@NgModule({
  imports: [
    CdkTableModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CdkTableExamplesModule {
}
