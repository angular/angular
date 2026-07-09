import { Component, NgModule } from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div *ngIf="showing">
      <div (click)="onClick(1)"></div>
      <button (click)="onClick2(2)"></button>
    </div>
  `,
    standalone: false
})
export class MyComponent {
  onClick(name: any) {}
  onClick2(name: any) {}
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
