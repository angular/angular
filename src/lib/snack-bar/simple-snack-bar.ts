import {Component} from '@angular/core';
import {MdSnackBarRef} from './snack-bar-ref';


/**
 * A component used to open as the default snack bar, matching material spec.
 * This should only be used internally by the snack bar service.
 */
@Component({
  moduleId: module.id,
  selector: 'simple-snack-bar',
  templateUrl: 'simple-snack-bar.html',
  styleUrls: ['simple-snack-bar.css'],
  host: {
    '[class.mat-simple-snackbar]': 'true',
  }
})
export class SimpleSnackBar {
  /** The message to be shown in the snack bar. */
  message: string;

  /** The label for the button in the snack bar. */
  action: string;

  /** The instance of the component making up the content of the snack bar. */
  snackBarRef: MdSnackBarRef<SimpleSnackBar>;

  /** Dismisses the snack bar. */
  dismiss(): void {
    this.snackBarRef._action();
  }

  /** If the action button should be shown. */
  get hasAction(): boolean { return !!this.action; }
}
