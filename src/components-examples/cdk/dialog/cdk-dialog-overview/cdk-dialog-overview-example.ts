import {Component, Inject} from '@angular/core';
import {Dialog, DialogRef, DIALOG_DATA} from '@angular/cdk/dialog';

export interface DialogData {
  animal: string;
  name: string;
}

/**
 * @title CDK Dialog Overview
 */
@Component({
  selector: 'cdk-dialog-overview-example',
  templateUrl: 'cdk-dialog-overview-example.html',
})
export class CdkDialogOverviewExample {
  animal: string | undefined;
  name: string;

  constructor(public dialog: Dialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open<string>(CdkDialogOverviewExampleDialog, {
      width: '250px',
      data: {name: this.name, animal: this.animal},
    });

    dialogRef.closed.subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }
}

@Component({
  selector: 'cdk-dialog-overview-example-dialog',
  templateUrl: 'cdk-dialog-overview-example-dialog.html',
  styleUrls: ['cdk-dialog-overview-example-dialog.css'],
})
export class CdkDialogOverviewExampleDialog {
  constructor(public dialogRef: DialogRef<string>, @Inject(DIALOG_DATA) public data: DialogData) {}
}
