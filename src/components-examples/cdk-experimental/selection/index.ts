import {CdkSelectionModule} from '@angular/cdk-experimental/selection';
import {CdkTableModule} from '@angular/cdk/table';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';

import {CdkSelectionColumnExample} from './cdk-selection-column/cdk-selection-column-example';
import {CdkSelectionListExample} from './cdk-selection-list/cdk-selection-list-example';

export {CdkSelectionColumnExample, CdkSelectionListExample};

const EXAMPLES = [CdkSelectionListExample, CdkSelectionColumnExample];

@NgModule({
  imports: [
    CdkSelectionModule,
    CdkTableModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatLegacyCheckboxModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CdkSelectionExamplesModule {}
