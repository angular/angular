import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'a-component',
  template: `
    <div *ngFor="let item of items">
      <p *ngIf="item < 10">less than 10</p>
      <p *ngIf="item < 10">less than 10</p>
    </div>
    <div *ngFor="let item of items">
      <p *ngIf="item > 10">more than 10</p>
    </div>
  `,
})
export class AComponent {
  items = [4, 2];
}

@NgModule({declarations: [AComponent]})
export class AModule {
}

@Component({
  selector: 'b-component',
  template: `
    <div *ngFor="let item of items">
      <ng-container *ngFor="let subitem of item.subitems">
        <p *ngIf="subitem < 10">less than 10</p>
        <p *ngIf="subitem < 10">less than 10</p>
      </ng-container>
      <ng-container *ngFor="let subitem of item.subitems">
        <p *ngIf="subitem < 10">less than 10</p>
      </ng-container>
    </div>
    <div *ngFor="let item of items">
      <ng-container *ngFor="let subitem of item.subitems">
        <p *ngIf="subitem > 10">more than 10</p>
      </ng-container>
    </div>
  `,
})
export class BComponent {
  items = [
    {subitems: [1, 3]},
    {subitems: [3, 7]},
  ];
}

@NgModule({declarations: [BComponent]})
export class BModule {
}
