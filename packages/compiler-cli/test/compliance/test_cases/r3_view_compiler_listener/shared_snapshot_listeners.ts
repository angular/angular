import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <div *ngIf="showing">
      <div (click)="onClick(foo)"></div>
      <button (click)="onClick2(bar)"></button>
    </div>
  `
})
export class MyComponent {
  onClick(name: any) {}
  onClick2(name: any) {}
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
