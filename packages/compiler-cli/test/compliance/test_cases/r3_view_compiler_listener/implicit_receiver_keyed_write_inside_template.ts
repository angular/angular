import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <ng-template #template>
      <button (click)="this['mes' + 'sage'] = 'hello'">Click me</button>
    </ng-template>
  `
})
export class MyComponent {
  message = '';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
