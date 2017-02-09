import {Component, Inject, ViewChild, TemplateRef} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import {MdDialog, MdDialogRef, MdDialogConfig, MD_DIALOG_DATA} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'dialog-demo',
  templateUrl: 'dialog-demo.html',
  styleUrls: ['dialog-demo.css'],
})
export class DialogDemo {
  dialogRef: MdDialogRef<JazzDialog>;
  lastCloseResult: string;
  actionsAlignment: string;
  config: MdDialogConfig = {
    disableClose: false,
    width: '',
    height: '',
    position: {
      top: '',
      bottom: '',
      left: '',
      right: ''
    },
    data: {
      message: 'Jazzy jazz jazz'
    }
  };
  numTemplateOpens = 0;

  @ViewChild(TemplateRef) template: TemplateRef<any>;

  constructor(public dialog: MdDialog, @Inject(DOCUMENT) doc: any) {
    // Possible useful example for the open and closeAll events.
    // Adding a class to the body if a dialog opens and
    // removing it after all open dialogs are closed
    dialog.afterOpen.subscribe((ref: MdDialogRef<any>) => {
      if (!doc.body.classList.contains('no-scroll')) {
        doc.body.classList.add('no-scroll');
      }
    });
    dialog.afterAllClosed.subscribe(() => {
      doc.body.classList.remove('no-scroll');
    });
  }

  openJazz() {
    this.dialogRef = this.dialog.open(JazzDialog, this.config);

    this.dialogRef.afterClosed().subscribe((result: string) => {
      this.lastCloseResult = result;
      this.dialogRef = null;
    });
  }

  openContentElement() {
    let dialogRef = this.dialog.open(ContentElementDialog, this.config);
    dialogRef.componentInstance.actionsAlignment = this.actionsAlignment;
  }

  openTemplate() {
    this.numTemplateOpens++;
    this.dialog.open(this.template, this.config);
  }
}


@Component({
  selector: 'demo-jazz-dialog',
  template: `
  <p>It's Jazz!</p>
  <p><label>How much? <input #howMuch></label></p>
  <p> {{ data.message }} </p>
  <button type="button" (click)="dialogRef.close(howMuch.value)">Close dialog</button>`
})
export class JazzDialog {
  constructor(
    public dialogRef: MdDialogRef<JazzDialog>,
    @Inject(MD_DIALOG_DATA) public data: any) { }
}


@Component({
  selector: 'demo-content-element-dialog',
  styles: [
    `img {
      max-width: 100%;
    }`
  ],
  template: `
    <h2 md-dialog-title>Neptune</h2>

    <md-dialog-content>
      <img src="https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg"/>

      <p>
        Neptune is the eighth and farthest known planet from the Sun in the Solar System. In the
        Solar System, it is the fourth-largest planet by diameter, the third-most-massive planet,
        and the densest giant planet. Neptune is 17 times the mass of Earth and is slightly more
        massive than its near-twin Uranus, which is 15 times the mass of Earth and slightly larger
        than Neptune. Neptune orbits the Sun once every 164.8 years at an average distance of 30.1
        astronomical units (4.50×109 km). It is named after the Roman god of the sea and has the
        astronomical symbol ♆, a stylised version of the god Neptune's trident.
      </p>
    </md-dialog-content>

    <md-dialog-actions [attr.align]="actionsAlignment">
      <button
        md-raised-button
        color="primary"
        md-dialog-close>Close</button>

      <a
        md-button
        color="primary"
        href="https://en.wikipedia.org/wiki/Neptune"
        target="_blank">Read more on Wikipedia</a>

      <button
        md-button
        color="secondary"
        (click)="showInStackedDialog()">
        Show in Dialog</button>
    </md-dialog-actions>
  `
})
export class ContentElementDialog {
  actionsAlignment: string;

  constructor(public dialog: MdDialog) { }

  showInStackedDialog() {
    this.dialog.open(IFrameDialog);
  }
}

@Component({
  selector: 'demo-iframe-dialog',
  styles: [
    `iframe {
      width: 800px;
    }`
  ],
  template: `
    <h2 md-dialog-title>Neptune</h2>

    <md-dialog-content>
      <iframe frameborder="0" src="https://en.wikipedia.org/wiki/Neptune"></iframe>
    </md-dialog-content>

    <md-dialog-actions>
      <button
        md-raised-button
        color="primary"
        md-dialog-close>Close</button>
    </md-dialog-actions>
  `
})
export class IFrameDialog {
}
