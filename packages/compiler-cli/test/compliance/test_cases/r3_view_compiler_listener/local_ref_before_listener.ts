import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <button (click)="onClick(user.value)">Save</button>
    <input #user>
  `
})
export class MyComponent {
  onClick(v: any) {}
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
