import {Component, TemplateRef, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';

/**
 * @title Testing with MatDialogHarness
 */
@Component({
  selector: 'dialog-harness-example',
  templateUrl: 'dialog-harness-example.html',
})
export class DialogHarnessExample {
  @ViewChild(TemplateRef) dialogTemplate: TemplateRef<any>;

  constructor(readonly dialog: MatDialog) {}

  open(config?: MatDialogConfig) {
    return this.dialog.open(this.dialogTemplate, config);
  }
}
