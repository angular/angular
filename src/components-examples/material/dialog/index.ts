import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {
  DialogContentExample,
  DialogContentExampleDialog
} from './dialog-content/dialog-content-example';
import {DialogDataExample, DialogDataExampleDialog} from './dialog-data/dialog-data-example';
import {
  DialogElementsExample,
  DialogElementsExampleDialog
} from './dialog-elements/dialog-elements-example';
import {
  DialogOverviewExample,
  DialogOverviewExampleDialog
} from './dialog-overview/dialog-overview-example';
import {
  DialogFromMenuExample,
  DialogFromMenuExampleDialog
} from './dialog-from-menu/dialog-from-menu-example';
import {DialogHarnessExample} from './dialog-harness/dialog-harness-example';

export {
  DialogContentExample,
  DialogContentExampleDialog,
  DialogDataExample,
  DialogDataExampleDialog,
  DialogElementsExample,
  DialogElementsExampleDialog,
  DialogFromMenuExample,
  DialogFromMenuExampleDialog,
  DialogHarnessExample,
  DialogOverviewExample,
  DialogOverviewExampleDialog,
};

const EXAMPLES = [
  DialogContentExample,
  DialogContentExampleDialog,
  DialogDataExample,
  DialogDataExampleDialog,
  DialogElementsExample,
  DialogElementsExampleDialog,
  DialogFromMenuExample,
  DialogFromMenuExampleDialog,
  DialogHarnessExample,
  DialogOverviewExample,
  DialogOverviewExampleDialog,
];

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatMenuModule,
    FormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class DialogExamplesModule {
}
