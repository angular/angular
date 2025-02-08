import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <label [for]="forValue"></label>`,
    standalone: false
})
export class MyComponent {
  forValue = 'some-input';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
