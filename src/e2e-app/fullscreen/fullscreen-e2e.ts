import {Component, ElementRef, Output, EventEmitter} from '@angular/core';
import {MdDialog, MdDialogRef} from '@angular/material';

@Component({
  selector: 'fullscreen-e2e',
  moduleId: module.id,
  templateUrl: 'fullscreen-e2e.html'
})
export class FullscreenE2E {
  dialogRef: MdDialogRef<TestDialog>;

  constructor (private _element: ElementRef, private _dialog: MdDialog) { }

  openDialog() {
    this.dialogRef = this._dialog.open(TestDialog);
    this.dialogRef.componentInstance.fullscreen.subscribe(() => this.toggleFullScreen());
    this.dialogRef.componentInstance.exitfullscreen.subscribe(() => this.exitFullscreen());
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;
    });
  }

  toggleFullScreen() {
      let element = this._element.nativeElement.querySelector('#fullscreenpane');
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
      } else if ((element as any).mozRequestFullScreen) {
        (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullScreen) {
        (element as any).msRequestFullScreen();
      }
  }

  exitFullscreen() {
      if (document.exitFullscreen) {
          document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
      } else if ((document as any).mozExitFullScreen) {
          (document as any).mozExitFullScreen();
      } else if ((document as any).msExitFullScreen) {
          (document as any).msExitFullScreen();
      }
  }
}

@Component({
  selector: 'fullscreen-dialog-e2e-test',
  template: `
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
  <button id="fullscreenindialog" (click)="fullscreen.emit()">FULLSCREEN</button>
  <button id="exitfullscreenindialog" (click)="exitfullscreen.emit()">EXIT FULLSCREEN</button>
  <button type="button" (click)="dialogRef.close()" id="close">CLOSE</button>`
})
export class TestDialog {
  constructor(public dialogRef: MdDialogRef<TestDialog>) { }
  @Output() fullscreen = new EventEmitter<void>();
  @Output() exitfullscreen = new EventEmitter<void>();
}
