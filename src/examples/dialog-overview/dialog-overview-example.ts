import {Component} from '@angular/core';
import {MdDialog} from '@angular/material';


@Component({
  selector: 'dialog-overview-example',
  templateUrl: './dialog-overview-example.html',
})
export class DialogOverviewExample {
  constructor(public dialog: MdDialog) {}

  openDialog() {
    this.dialog.open(DialogOverviewExampleDialog);
  }
}


@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: './dialog-overview-example-dialog.html',
})
export class DialogOverviewExampleDialog {}
