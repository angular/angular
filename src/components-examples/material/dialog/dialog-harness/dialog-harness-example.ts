import {Component, TemplateRef, ViewChild} from '@angular/core';
import {MatLegacyDialog, MatLegacyDialogConfig} from '@angular/material/legacy-dialog';

/**
 * @title Testing with MatDialogHarness
 */
@Component({
  selector: 'dialog-harness-example',
  templateUrl: 'dialog-harness-example.html',
})
export class DialogHarnessExample {
  @ViewChild(TemplateRef) dialogTemplate: TemplateRef<any>;

  constructor(readonly dialog: MatLegacyDialog) {}

  open(config?: MatLegacyDialogConfig) {
    return this.dialog.open(this.dialogTemplate, config);
  }
}
