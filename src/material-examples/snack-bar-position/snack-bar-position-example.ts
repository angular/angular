import {Component} from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material';

/**
 * @title Snack-bar with configurable position
 */
@Component({
  selector: 'snack-bar-position-example',
  templateUrl: 'snack-bar-position-example.html',
})
export class SnackBarPositionExample {

  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(public snackBar: MatSnackBar) {}

  openSnackBar() {
    this.snackBar.open('Canonball!!', 'End now', {
      duration: 500,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
}
