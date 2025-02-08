import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    styles: [
        'div.foo { color: red; }', ':host p:nth-child(even) { --webkit-transition: 1s linear all; }'
    ],
    template: '...',
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
