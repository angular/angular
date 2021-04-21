import {Component} from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

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

  constructor(private _snackBar: MatSnackBar) {}

  openSnackBar() {
    this._snackBar.open('Cannonball!!', 'Splash', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
}
