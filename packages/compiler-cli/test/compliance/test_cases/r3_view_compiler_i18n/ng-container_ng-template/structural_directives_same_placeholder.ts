import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n>
    <div *ngIf="someFlag">Content</div>
    <div *ngIf="someFlag">
      <div *ngIf="someFlag">Content</div>
    </div>

    <img *ngIf="someOtherFlag" />
    <img *ngIf="someOtherFlag" />
  </div>
`,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
