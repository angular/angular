import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    // NOTE: The template has escaped `\r\n` line-endings markers that will be converted to real
    // `\r\n` line-ending chars when loaded from the test file-system.
    templateUrl: 'template.html',
    standalone: false
})
export class MyComponent {
  value!: any;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
