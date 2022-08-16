import {Component} from '@angular/core';
import {
  MatLegacySnackBar,
  MatLegacySnackBarHorizontalPosition,
  MatLegacySnackBarVerticalPosition,
} from '@angular/material/legacy-snack-bar';

/**
 * @title Snack-bar with configurable position
 */
@Component({
  selector: 'snack-bar-position-example',
  templateUrl: 'snack-bar-position-example.html',
  styleUrls: ['snack-bar-position-example.css'],
})
export class SnackBarPositionExample {
  horizontalPosition: MatLegacySnackBarHorizontalPosition = 'start';
  verticalPosition: MatLegacySnackBarVerticalPosition = 'bottom';

  constructor(private _snackBar: MatLegacySnackBar) {}

  openSnackBar() {
    this._snackBar.open('Cannonball!!', 'Splash', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
}
