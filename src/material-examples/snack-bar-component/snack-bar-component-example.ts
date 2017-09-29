import {Component} from '@angular/core';
import {MatSnackBar} from '@angular/material';

/**
 * @title Snack-bar with a custom component
 */
@Component({
  selector: 'snack-bar-component-example',
  templateUrl: 'snack-bar-component-example.html',
})
export class SnackBarComponentExample {
  constructor(public snackBar: MatSnackBar) {}

  openSnackBar() {
    this.snackBar.openFromComponent(PizzaPartyComponent, {
      duration: 500,
    });
  }
}


@Component({
  selector: 'snack-bar-component-example-snack',
  templateUrl: 'snack-bar-component-example-snack.html',
  styles: [`.example-pizza-party { color: hotpink; }`],
})
export class PizzaPartyComponent {}
