import {Component} from '@angular/core';
import {MdSnackBar} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'snack-bar-demo',
  templateUrl: 'snack-bar-demo.html',
})
export class SnackBarDemo {
  message: string = 'Snack Bar opened.';
  actionButtonLabel: string = 'Retry';
  action: boolean = false;

  constructor(
      public snackBar: MdSnackBar) { }

  open() {
    this.snackBar.open(this.message, this.action && this.actionButtonLabel);
  }
}
