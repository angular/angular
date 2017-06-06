import {bootstrap, ElementRef, ComponentRef, Component, View} from 'angular2/angular2';
import {
  MdDialog,
  MdDialogRef,
  MdDialogConfig
} from 'angular2_material/src/components/dialog/dialog';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {commonDemoSetup, DemoUrlResolver} from '../demo_common';
import {bind, Injector} from 'angular2/di';
import {isPresent} from 'angular2/src/facade/lang';


@Component({
  selector: 'demo-app',
  appInjector: [MdDialog],
})
@View({
  templateUrl: './demo_app.html',
  directives: [],
})
class DemoApp {
  dialog: MdDialog;
  elementRef: ElementRef;
  dialogRef: MdDialogRef;
  dialogConfig: MdDialogConfig;
  injector: Injector;
  lastResult: string;

  constructor(mdDialog: MdDialog, elementRef: ElementRef, injector: Injector) {
    this.dialog = mdDialog;
    this.elementRef = elementRef;
    this.dialogConfig = new MdDialogConfig();
    this.injector = injector;

    this.dialogConfig.width = '60%';
    this.dialogConfig.height = '60%';
    this.lastResult = '';
  }

  open() {
    if (isPresent(this.dialogRef)) {
      return;
    }

    this.dialog.open(SimpleDialogComponent, this.elementRef, this.injector, this.dialogConfig)
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
  properties: ['numCoconuts'],
})
@View({
  template: `
    <h2>This is the dialog content</h2>
    <p>There are {{numCoconuts}} coconuts.</p>
    <p>Return: <input (input)="updateValue($event)"></p>
    <button type="button" (click)="done()">Done</button>
  `,
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
