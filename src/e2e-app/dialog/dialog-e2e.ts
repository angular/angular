import {Component, ViewChild, TemplateRef} from '@angular/core';
import {MdDialog, MdDialogRef, MdDialogConfig} from '@angular/material';

@Component({
  selector: 'dialog-e2e',
  moduleId: module.id,
  templateUrl: 'dialog-e2e.html'
})
export class DialogE2E {
  dialogRef: MdDialogRef<TestDialog>;

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  constructor (private _dialog: MdDialog) { }

  private _openDialog(config?: MdDialogConfig) {
    this.dialogRef = this._dialog.open(TestDialog, config);

    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;
    });
  }

  openDefault() {
    this._openDialog();
  }

  openDisabled() {
    this._openDialog({
      disableClose: true
    });
  }

  openTemplate() {
    this.dialogRef = this._dialog.open(this.templateRef);
  }
}

@Component({
  selector: 'dialog-e2e-test',
  template: `
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
  <input/>
  <button type="button" (click)="dialogRef.close()" id="close">CLOSE</button>`
})
export class TestDialog {
  constructor(public dialogRef: MdDialogRef<TestDialog>) { }
}
