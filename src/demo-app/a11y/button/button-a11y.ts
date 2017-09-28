import {Component} from '@angular/core';
import {MatSnackBar} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'button-a11y',
  templateUrl: 'button-a11y.html',
  styleUrls: ['button-a11y.css'],
})
export class ButtonAccessibilityDemo {
  counter: number = 0;

  constructor(public snackBar: MatSnackBar) {}

  openSnackBar(message: string) {
    this.snackBar.open(message,  '',  {
      duration: 2000,
    });
  }

  increase() {
    this.counter++;
    this.openSnackBar(`Click counter is set to ${this.counter}`);
  }
}
