import {Dir} from '@angular/cdk/bidi';
import {Component, ViewEncapsulation} from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'snack-bar-demo',
  styleUrls: ['snack-bar-demo.css'],
  templateUrl: 'snack-bar-demo.html',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class SnackBarDemo {
  message: string = 'Snack Bar opened.';
  actionButtonLabel: string = 'Retry';
  action: boolean = false;
  setAutoHide: boolean = true;
  autoHide: number = 10000;
  addExtraClass: boolean = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(public snackBar: MatSnackBar, private dir: Dir) {
  }

  open() {
    let config = new MatSnackBarConfig();
    config.verticalPosition = this.verticalPosition;
    config.horizontalPosition = this.horizontalPosition;
    config.duration = this.autoHide;
    config.extraClasses = this.addExtraClass ? ['party'] : undefined;
    config.direction = this.dir.value;
    this.snackBar.open(this.message, this.action ? this.actionButtonLabel : undefined, config);
  }
}
