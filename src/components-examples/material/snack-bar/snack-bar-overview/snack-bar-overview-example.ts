import {Component} from '@angular/core';
import {MatLegacySnackBar} from '@angular/material/legacy-snack-bar';

/**
 * @title Basic snack-bar
 */
@Component({
  selector: 'snack-bar-overview-example',
  templateUrl: 'snack-bar-overview-example.html',
  styleUrls: ['snack-bar-overview-example.css'],
})
export class SnackBarOverviewExample {
  constructor(private _snackBar: MatLegacySnackBar) {}

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }
}
