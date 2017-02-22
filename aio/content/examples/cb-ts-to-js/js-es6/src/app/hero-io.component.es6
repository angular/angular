import { Component } from '@angular/core';

export class HeroIOComponent {
  constructor() {
    this.okClicked     = false;
    this.cancelClicked = false;
  }

  onOk() {
    this.okClicked = true;
  }

  onCancel() {
    this.cancelClicked = true;
  }
}

HeroIOComponent.annotations = [
  new Component({
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
];
