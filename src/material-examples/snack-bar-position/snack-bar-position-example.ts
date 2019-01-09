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
  styleUrls: ['snack-bar-position-example.css'],
})
export class SnackBarPositionExample {

  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(private snackBar: MatSnackBar) {}

  openSnackBar() {
    this.snackBar.open('Canonball!!', 'End now', {
      duration: 500,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
}
