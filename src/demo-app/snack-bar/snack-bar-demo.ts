import {Component, ViewEncapsulation} from '@angular/core';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'snack-bar-demo',
  styleUrls: ['snack-bar-demo.css'],
  templateUrl: 'snack-bar-demo.html',
  encapsulation: ViewEncapsulation.None,
})
export class SnackBarDemo {
  message: string = 'Snack Bar opened.';
  actionButtonLabel: string = 'Retry';
  action: boolean = false;
  setAutoHide: boolean = true;
  autoHide: number = 10000;
  addExtraClass: boolean = false;

  constructor(public snackBar: MdSnackBar) { }

  open() {
    let config = new MdSnackBarConfig();
    config.duration = this.autoHide;
    config.extraClasses = this.addExtraClass ? ['party'] : null;
    this.snackBar.open(this.message, this.action && this.actionButtonLabel, config);
  }
}
