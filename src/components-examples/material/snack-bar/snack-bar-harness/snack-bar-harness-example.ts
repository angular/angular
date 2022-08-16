import {Component} from '@angular/core';
import {MatLegacySnackBar, MatLegacySnackBarConfig} from '@angular/material/legacy-snack-bar';

/**
 * @title Testing with MatSnackBarHarness
 */
@Component({
  selector: 'snack-bar-harness-example',
  templateUrl: 'snack-bar-harness-example.html',
})
export class SnackBarHarnessExample {
  constructor(readonly snackBar: MatLegacySnackBar) {}

  open(message: string, action = '', config?: MatLegacySnackBarConfig) {
    return this.snackBar.open(message, action, config);
  }
}
