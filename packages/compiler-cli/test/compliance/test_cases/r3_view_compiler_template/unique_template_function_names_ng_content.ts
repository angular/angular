import { Component, Directive, NgModule } from '@angular/core';

@Directive({selector: '[ngIf]', standalone: false})
export class FakeNgIf {}

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

@NgModule({declarations: [AComponent, BComponent, FakeNgIf]})
export class AModule {
}
