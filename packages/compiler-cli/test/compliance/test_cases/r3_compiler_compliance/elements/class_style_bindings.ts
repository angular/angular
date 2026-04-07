import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: '<div [class.error]="error" [style.background-color]="color"></div>',
    standalone: false
})
export class MyComponent {
  error = true;
  color = 'red';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
