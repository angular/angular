import {Component, ViewChild, TemplateRef} from '@angular/core';
import {
  MatLegacyDialog,
  MatLegacyDialogConfig,
  MatLegacyDialogRef,
} from '@angular/material/legacy-dialog';

@Component({
  selector: 'legacy-dialog-e2e',
  templateUrl: 'legacy-dialog-e2e.html',
})
export class LegacyDialogE2e {
  dialogRef: MatLegacyDialogRef<TestDialog> | null;

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  constructor(private _dialog: MatLegacyDialog) {}

  private _openDialog(config?: MatLegacyDialogConfig) {
    this.dialogRef = this._dialog.open(TestDialog, config);
    this.dialogRef.afterClosed().subscribe(() => (this.dialogRef = null));
  }

  openDefault() {
    this._openDialog();
  }

  openDisabled() {
    this._openDialog({
      disableClose: true,
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
  <button type="button" (click)="dialogRef.close()" id="close">CLOSE</button>`,
})
export class TestDialog {
  constructor(public dialogRef: MatLegacyDialogRef<TestDialog>) {}
}
