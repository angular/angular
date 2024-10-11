import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'a-component',
    template: `
    <ng-content *ngIf="show"></ng-content>
  `,
    standalone: false
})
export class AComponent {
  show = true;
}

@Component({
    selector: 'b-component',
    template: `
    <ng-content *ngIf="show"></ng-content>
  `,
    standalone: false
})
export class BComponent {
  show = true;
}

@NgModule({declarations: [AComponent, BComponent]})
export class AModule {
}
