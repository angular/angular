import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div *ngIf="true" (click)="greet(this)"></div>
    <div *ngIf="true" [id]="this"></div>
  `,
    standalone: false
})
export class MyComponent {
  greet(val: any) {}
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
