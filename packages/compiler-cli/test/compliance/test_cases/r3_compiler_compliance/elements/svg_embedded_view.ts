import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <svg>
      <ng-template [ngIf]="condition">
        <text>Hello</text>
      </ng-template>
    </svg>
  `
})
export class MyComponent {
  condition = true;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
