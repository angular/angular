import {Component} from '@angular/core';
import {MatSnackBar} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'card-a11y',
  templateUrl: 'card-a11y.html',
  styleUrls: ['card-a11y.css'],
})
export class CardAccessibilityDemo {
  showProgress: boolean = false;

  constructor(private snackBar: MatSnackBar) {}

  openSnackbar(message: string) {
    this.snackBar.open(message, '', {duration: 2000});
  }
}
