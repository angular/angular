import { Component } from '@angular/core';

@Component({
  selector: 'hero-io',
  template: `
    <app-confirm [okMsg]="'OK'"
                 [cancelMsg]="'Cancel'"
                 (ok)="onOk()"
                 (cancel)="onCancel()">
    </app-confirm>
    <span *ngIf="okClicked">OK clicked</span>
    <span *ngIf="cancelClicked">Cancel clicked</span>
  `
})
export class HeroIOComponent {
  okClicked     = false;
  cancelClicked = false;

  onOk() {
    this.okClicked = true;
  }

  onCancel() {
    this.cancelClicked = true;
  }
}
