import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `<div
    class="    foo  "
    style="width:100px"
    [attr.class]="'round'"
    [attr.style]="'height:100px'"></div>`,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
