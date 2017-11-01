import {Component, ElementRef, Output, EventEmitter} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'fullscreen-e2e',
  templateUrl: 'fullscreen-e2e.html'
})
export class FullscreenE2E {

  dialogRef: MatDialogRef<TestDialogFullScreen> | null;

  constructor (private _element: ElementRef, private _dialog: MatDialog) { }

  openDialog() {
    this.dialogRef = this._dialog.open(TestDialogFullScreen);

    this.dialogRef.componentInstance.openFullscreen.subscribe(() => this.openFullscreen());
    this.dialogRef.componentInstance.exitFullscreen.subscribe(() => this.exitFullscreen());
    this.dialogRef.afterClosed().subscribe(() => this.dialogRef = null);
  }

  openFullscreen() {
    let element = this._element.nativeElement.querySelector('#fullscreen-pane');

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
  template: `
    <button id="dialog-fullscreen-open" (click)="openFullscreen.emit()">Open Fullscreen</button>
    <button id="dialog-fullscreen-exit" (click)="exitFullscreen.emit()">Exit Fullscreen</button>
    <button (click)="dialogRef.close()" id="close">Close Dialog</button>
  `
})
export class TestDialogFullScreen {
  @Output() openFullscreen = new EventEmitter<void>();
  @Output() exitFullscreen = new EventEmitter<void>();

  constructor(public dialogRef: MatDialogRef<TestDialogFullScreen>) {}
}
