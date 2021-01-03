import {Component, EventEmitter, NgModule, Output} from '@angular/core';

@Component({
  selector: 'some-comp',
  template: '',
})
export class SomeComp {
  @Output() update = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
}

@Component({
  selector: 'my-component',
  template: `
      <div (click)="click()" (change)="change()"></div>
      <some-comp (update)="update()" (delete)="delete()"></some-comp>
    `
})
export class MyComponent {
  click() {}
  change() {}
  delete() {}
  update() {}
}

@NgModule({declarations: [MyComponent, SomeComp]})
export class MyModule {
}
