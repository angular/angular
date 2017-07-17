import {Component, Inject} from '@angular/core';
import {MdDialog, MD_DIALOG_DATA} from '@angular/material';

/**
 * @title Injecting data when opening a dialog
 */
@Component({
  selector: 'dialog-data-example',
  templateUrl: 'dialog-data-example.html',
})
export class DialogDataExample {
  constructor(public dialog: MdDialog) {}

  openDialog() {
    this.dialog.open(DialogDataExampleDialog, {
      data: {
        animal: 'panda'
      }
    });
  }
}

@Component({
  selector: 'dialog-data-example-dialog',
  templateUrl: 'dialog-data-example-dialog.html',
})
export class DialogDataExampleDialog {
  constructor(@Inject(MD_DIALOG_DATA) public data: any) {}
}
