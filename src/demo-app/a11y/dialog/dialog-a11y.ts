import {Component} from '@angular/core';
import {MatDialog} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'dialog-a11y',
  templateUrl: 'dialog-a11y.html',
  styleUrls: ['dialog-a11y.css'],
})
export class DialogAccessibilityDemo {
  fruitSelectedOption: string = '';

  constructor(public dialog: MatDialog) {}

  openFruitDialog() {
    let dialogRef = this.dialog.open(DialogFruitExampleDialog);
    dialogRef.afterClosed().subscribe(result => {
      this.fruitSelectedOption = result;
    });
  }

  openWelcomeDialog() {
    this.dialog.open(DialogWelcomeExampleDialog);
  }

  openNeptuneDialog() {
    this.dialog.open(DialogNeptuneExampleDialog);
  }

  openAddressDialog() {
    this.dialog.open(DialogAddressFormDialog);
  }
}

@Component({
  moduleId: module.id,
  selector: 'dialog-fruit-a11y',
  templateUrl: 'dialog-fruit-a11y.html'
})
export class DialogFruitExampleDialog {}

@Component({
  moduleId: module.id,
  selector: 'dialog-welcome-a11y',
  templateUrl: 'dialog-welcome-a11y.html'
})
export class DialogWelcomeExampleDialog {}

@Component({
  moduleId: module.id,
  selector: 'dialog-neptune-a11y-dialog',
  templateUrl: './dialog-neptune-a11y.html'
})
export class DialogNeptuneExampleDialog {
  constructor(public dialog: MatDialog) { }

  showInStackedDialog() {
    this.dialog.open(DialogNeptuneIFrameDialog);
  }
}

@Component({
  moduleId: module.id,
  selector: 'dialog-neptune-iframe-dialog',
  styles: [
    `iframe {
      width: 800px;
    }`
  ],
  templateUrl: './dialog-neptune-iframe-a11y.html'
})
export class DialogNeptuneIFrameDialog {}

@Component({
  moduleId: module.id,
  selector: 'dialog-address-form-a11y',
  templateUrl: 'dialog-address-form-a11y.html'
})
export class DialogAddressFormDialog {}
