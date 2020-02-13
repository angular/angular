import {CdkTreeModule} from '@angular/cdk/tree';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {CdkTreeFlatExample} from './cdk-tree-flat/cdk-tree-flat-example';
import {CdkTreeNestedExample} from './cdk-tree-nested/cdk-tree-nested-example';

export {
  CdkTreeFlatExample,
  CdkTreeNestedExample,
};

const EXAMPLES = [
  CdkTreeFlatExample,
  CdkTreeNestedExample,
];

@NgModule({
  imports: [
    CdkTreeModule,
    MatButtonModule,
    MatIconModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class CdkTreeExamplesModule {
}
