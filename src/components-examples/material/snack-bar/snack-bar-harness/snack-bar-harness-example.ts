import {Component} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';

/**
 * @title Testing with MatSnackBarHarness
 */
@Component({
  selector: 'snack-bar-harness-example',
  templateUrl: 'snack-bar-harness-example.html',
})
export class SnackBarHarnessExample {
  constructor(readonly snackBar: MatSnackBar) {}

  open(message: string, action = '', config?: MatSnackBarConfig) {
    return this.snackBar.open(message, action, config);
  }
}
