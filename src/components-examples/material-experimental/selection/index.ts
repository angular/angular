import {MatSelectionModule} from '@angular/material-experimental/selection';
import {MatTableModule} from '@angular/material/table';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';

import {MatSelectionColumnExample} from './mat-selection-column/mat-selection-column-example';
import {MatSelectionListExample} from './mat-selection-list/mat-selection-list-example';

export {MatSelectionListExample, MatSelectionColumnExample};

const EXAMPLES = [MatSelectionListExample, MatSelectionColumnExample];

@NgModule({
  imports: [
    MatSelectionModule,
    MatTableModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatLegacyCheckboxModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class MatSelectionExamplesModule {}
