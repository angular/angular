import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { OfflineDialogComponent} from './offline-dialog.component';

@Component({
  selector: 'aio-offline',
  template: '<a (click)="openDialog()">Download</a>',
  styles: []
})
export class OfflineComponent {

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openDialog(): void {
    this.dialog.open(OfflineDialogComponent, {
      width: '520px',
    });
  }

  
}
