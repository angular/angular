import {Component} from '@angular/core';
import {MatSnackBar} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'snack-bar-a11y',
  templateUrl: 'snack-bar-a11y.html',
})
export class SnackBarAccessibilityDemo {
  constructor(private snackBar: MatSnackBar) {}

  openDiscoPartySnackBar() {
    this.snackBar.open('Disco party!', 'Dismiss', {duration: 5000});
  }

  openNotificationSnackBar() {
    this.snackBar.open('Thank you for your support!', '', {duration: 2000});
  }
}
