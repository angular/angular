import {Component, ViewChild} from '@angular/core';
import {MatLegacyDialog} from '@angular/material/legacy-dialog';
import {MatLegacyMenuTrigger} from '@angular/material/legacy-menu';
/**
 * @title Dialog launched from a menu
 */
@Component({
  selector: 'dialog-from-menu-example',
  templateUrl: 'dialog-from-menu-example.html',
})
export class DialogFromMenuExample {
  @ViewChild('menuTrigger') menuTrigger: MatLegacyMenuTrigger;

  constructor(public dialog: MatLegacyDialog) {}

  openDialog() {
    // #docregion focus-restoration
    const dialogRef = this.dialog.open(DialogFromMenuExampleDialog, {restoreFocus: false});

    // Manually restore focus to the menu trigger since the element that
    // opens the dialog won't be in the DOM any more when the dialog closes.
    dialogRef.afterClosed().subscribe(() => this.menuTrigger.focus());
    // #enddocregion focus-restoration
  }
}

@Component({
  selector: 'dialog-from-menu-dialog',
  templateUrl: 'dialog-from-menu-example-dialog.html',
})
export class DialogFromMenuExampleDialog {}
