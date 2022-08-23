import {Component, inject} from '@angular/core';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';

/**
 * @title Snack-bar with an annotated custom component
 */
@Component({
  selector: 'snack-bar-annotated-component-example',
  templateUrl: 'snack-bar-annotated-component-example.html',
  styleUrls: ['snack-bar-annotated-component-example.css'],
})
export class SnackBarAnnotatedComponentExample {
  durationInSeconds = 5;

  constructor(private _snackBar: MatSnackBar) {}

  openSnackBar() {
    this._snackBar.openFromComponent(PizzaPartyAnnotatedComponent, {
      duration: this.durationInSeconds * 1000,
    });
  }
}

@Component({
  selector: 'snack-bar-annotated-component-example-snack',
  templateUrl: 'snack-bar-annotated-component-example-snack.html',
  styles: [
    `
    :host {
      display: flex;
    }

    .example-pizza-party {
      color: hotpink;
    }
  `,
  ],
})
export class PizzaPartyAnnotatedComponent {
  snackBarRef = inject(MatSnackBarRef);
}
