import {Component} from '@angular/core';
import {Dialog, DialogRef} from '@angular/cdk/dialog';

/**
 * @title CDK Dialog Styling
 */
@Component({
  selector: 'cdk-dialog-styling-example',
  templateUrl: 'cdk-dialog-styling-example.html',
})
export class CdkDialogStylingExample {
  constructor(public dialog: Dialog) {}

  openDialog(): void {
    this.dialog.open<string>(CdkDialogStylingExampleDialog);
  }
}

@Component({
  selector: 'cdk-dialog-styling-example-dialog',
  templateUrl: 'cdk-dialog-styling-example-dialog.html',
  styleUrls: ['cdk-dialog-styling-example-dialog.css'],
})
export class CdkDialogStylingExampleDialog {
  constructor(public dialogRef: DialogRef) {}
}
