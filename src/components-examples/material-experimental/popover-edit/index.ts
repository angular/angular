import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatPopoverEditModule} from '@angular/material-experimental/popover-edit';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTableModule} from '@angular/material/table';
import {
  PopoverEditCellSpanMatTableExample
} from './popover-edit-cell-span-mat-table/popover-edit-cell-span-mat-table-example';
import {
  PopoverEditMatTableFlexExample
} from './popover-edit-mat-table-flex/popover-edit-mat-table-flex-example';
import {PopoverEditMatTableExample} from './popover-edit-mat-table/popover-edit-mat-table-example';
import {
  PopoverEditTabOutMatTableExample
} from './popover-edit-tab-out-mat-table/popover-edit-tab-out-mat-table-example';

export {
  PopoverEditCellSpanMatTableExample,
  PopoverEditMatTableExample,
  PopoverEditMatTableFlexExample,
  PopoverEditTabOutMatTableExample,
};

const EXAMPLES = [
  PopoverEditCellSpanMatTableExample,
  PopoverEditMatTableExample,
  PopoverEditMatTableFlexExample,
  PopoverEditTabOutMatTableExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatPopoverEditModule,
    MatSnackBarModule,
    MatTableModule,
    FormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class PopoverEditExamplesModule {
}
