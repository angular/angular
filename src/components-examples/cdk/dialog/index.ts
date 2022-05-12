import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DialogModule} from '@angular/cdk/dialog';
import {
  CdkDialogDataExample,
  CdkDialogDataExampleDialog,
} from './cdk-dialog-data/cdk-dialog-data-example';
import {
  CdkDialogOverviewExample,
  CdkDialogOverviewExampleDialog,
} from './cdk-dialog-overview/cdk-dialog-overview-example';
import {
  CdkDialogStylingExample,
  CdkDialogStylingExampleDialog,
} from './cdk-dialog-styling/cdk-dialog-styling-example';

export {
  CdkDialogDataExample,
  CdkDialogDataExampleDialog,
  CdkDialogOverviewExample,
  CdkDialogOverviewExampleDialog,
  CdkDialogStylingExample,
  CdkDialogStylingExampleDialog,
};

const EXAMPLES = [
  CdkDialogDataExample,
  CdkDialogDataExampleDialog,
  CdkDialogOverviewExample,
  CdkDialogOverviewExampleDialog,
  CdkDialogStylingExample,
  CdkDialogStylingExampleDialog,
];

@NgModule({
  imports: [CommonModule, DialogModule, FormsModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class DialogExamplesModule {}
