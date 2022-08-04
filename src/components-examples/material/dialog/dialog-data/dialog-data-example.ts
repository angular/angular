import {Component, Inject} from '@angular/core';
import {MatLegacyDialog, MAT_LEGACY_DIALOG_DATA} from '@angular/material/legacy-dialog';

export interface DialogData {
  animal: 'panda' | 'unicorn' | 'lion';
}

/**
 * @title Injecting data when opening a dialog
 */
@Component({
  selector: 'dialog-data-example',
  templateUrl: 'dialog-data-example.html',
})
export class DialogDataExample {
  constructor(public dialog: MatLegacyDialog) {}

  openDialog() {
    this.dialog.open(DialogDataExampleDialog, {
      data: {
        animal: 'panda',
      },
    });
  }
}

@Component({
  selector: 'dialog-data-example-dialog',
  templateUrl: 'dialog-data-example-dialog.html',
})
export class DialogDataExampleDialog {
  constructor(@Inject(MAT_LEGACY_DIALOG_DATA) public data: DialogData) {}
}
