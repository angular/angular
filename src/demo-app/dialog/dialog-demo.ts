import {Component} from '@angular/core';
import {MdDialog, MdDialogRef, MdDialogConfig} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'dialog-demo',
  templateUrl: 'dialog-demo.html',
  styleUrls: ['dialog-demo.css'],
})
export class DialogDemo {
  dialogRef: MdDialogRef<JazzDialog>;
  lastCloseResult: string;
  config: MdDialogConfig = {
    disableClose: false,
    width: '',
    height: '',
    position: {
      top: '',
      bottom: '',
      left: '',
      right: ''
    }
  };

  constructor(public dialog: MdDialog) { }

  open() {
    this.dialogRef = this.dialog.open(JazzDialog, this.config);

    this.dialogRef.afterClosed().subscribe(result => {
      this.lastCloseResult = result;
      this.dialogRef = null;
    });
  }
}


@Component({
  selector: 'demo-jazz-dialog',
  template: `
  <p>It's Jazz!</p>
  <p><label>How much? <input #howMuch></label></p>
  <p> {{ jazzMessage }} </p>
  <button type="button" (click)="dialogRef.close(howMuch.value)">Close dialog</button>`
})
export class JazzDialog {
  jazzMessage = 'Jazzy jazz jazz';

  constructor(public dialogRef: MdDialogRef<JazzDialog>) { }
}
