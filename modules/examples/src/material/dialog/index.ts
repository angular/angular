import {bootstrap} from 'angular2/bootstrap';
import {
  bind,
  ElementRef,
  ComponentRef,
  Component,
  UrlResolver,
  View,
  ViewEncapsulation
} from 'angular2/core';
import {
  MdDialog,
  MdDialogRef,
  MdDialogConfig
} from 'angular2_material/src/components/dialog/dialog';
import {commonDemoSetup, DemoUrlResolver} from '../demo_common';
import {isPresent} from 'angular2/src/core/facade/lang';


@Component({
  selector: 'demo-app',
  viewBindings: [MdDialog],
})
@View({
  templateUrl: './demo_app.html',
  directives: [],
  encapsulation: ViewEncapsulation.None,
})
class DemoApp {
  dialog: MdDialog;
  elementRef: ElementRef;
  dialogRef: MdDialogRef;
  dialogConfig: MdDialogConfig;
  lastResult: string;

  constructor(mdDialog: MdDialog, elementRef: ElementRef) {
    this.dialog = mdDialog;
    this.elementRef = elementRef;
    this.dialogConfig = new MdDialogConfig();

    this.dialogConfig.width = '60%';
    this.dialogConfig.height = '60%';
    this.lastResult = '';
  }

  open() {
    if (isPresent(this.dialogRef)) {
      return;
    }

    this.dialog.open(SimpleDialogComponent, this.elementRef, this.dialogConfig)
        .then(ref => {
          this.dialogRef = ref;
          ref.instance.numCoconuts = 777;

          ref.whenClosed.then(result => {
            this.dialogRef = null;
            this.lastResult = result;
          });
        });
  }

  close() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'simple-dialog',
  inputs: ['numCoconuts'],
})
@View({
  encapsulation: ViewEncapsulation.None,
  template: `
    <h2>This is the dialog content</h2>
    <p>There are {{numCoconuts}} coconuts.</p>
    <p>Return: <input (input)="updateValue($event)"></p>
    <button type="button" (click)="done()">Done</button>
  `
})
class SimpleDialogComponent {
  numCoconuts: number;
  dialogRef: MdDialogRef;
  toReturn: string;

  constructor(dialogRef: MdDialogRef) {
    this.numCoconuts = 0;
    this.dialogRef = dialogRef;
    this.toReturn = '';
  }

  updateValue(event) {
    this.toReturn = event.target.value;
  }

  done() {
    this.dialogRef.close(this.toReturn);
  }
}


export function main() {
  commonDemoSetup();
  bootstrap(DemoApp, [bind(UrlResolver).toValue(new DemoUrlResolver())]);
}
