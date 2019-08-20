import {CdkTreeModule} from '@angular/cdk/tree';
import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {CdkTreeFlatExample} from './cdk-tree-flat/cdk-tree-flat-example';
import {CdkTreeNestedExample} from './cdk-tree-nested/cdk-tree-nested-example';

const EXAMPLES = [
  CdkTreeFlatExample,
  CdkTreeNestedExample,
];

@NgModule({
  imports: [
    CdkTreeModule,
    MatIconModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CdkTreeExamplesModule {
}
