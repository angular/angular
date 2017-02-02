import {Component} from '@angular/core';
import {MdSnackBar} from '@angular/material';


@Component({
  selector: 'snack-bar-overview-example',
  templateUrl: './snack-bar-overview-example.html',
})
export class SnackBarOverviewExample {
  constructor(public snackBar: MdSnackBar) {}

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
