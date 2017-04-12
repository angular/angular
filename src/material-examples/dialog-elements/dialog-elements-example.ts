import {Component} from '@angular/core';
import {MdDialog} from '@angular/material';


@Component({
  selector: 'dialog-elements-example',
  templateUrl: './dialog-elements-example.html',
})
export class DialogElementsExample {
  constructor(public dialog: MdDialog) { }

  openDialog() {
    this.dialog.open(DialogElementsExampleDialog);
  }
}


@Component({
  selector: 'dialog-elements-example-dialog',
  templateUrl: './dialog-elements-example-dialog.html',
})
export class DialogElementsExampleDialog { }
