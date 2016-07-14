import {Component, ViewContainerRef} from '@angular/core';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular2-material/dialog/dialog';
import {OVERLAY_PROVIDERS} from '@angular2-material/core/overlay/overlay';

@Component({
  moduleId: module.id,
  selector: 'dialog-demo',
  templateUrl: 'dialog-demo.html',
  styleUrls: ['dialog-demo.css'],
  providers: [MdDialog, OVERLAY_PROVIDERS]
})
export class DialogDemo {
  dialogRef: MdDialogRef<JazzDialog>;

  constructor(
      public dialog: MdDialog,
      public viewContainerRef: ViewContainerRef) { }

  open() {
    let config = new MdDialogConfig();
    config.viewContainerRef = this.viewContainerRef;

    this.dialog.open(JazzDialog, config).then(ref => {
      this.dialogRef = ref;
    });
  }
}


@Component({
  selector: 'demo-jazz-dialog',
  template: `<p>It's Jazz!</p>`
})
export class JazzDialog { }
