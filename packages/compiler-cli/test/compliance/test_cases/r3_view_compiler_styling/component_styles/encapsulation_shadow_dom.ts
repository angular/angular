import {Component, NgModule, ViewEncapsulation} from '@angular/core';

@Component({
    encapsulation: ViewEncapsulation.ShadowDom,
    selector: 'my-component',
    styles: ['div.cool { color: blue; }', ':host.nice p { color: gold; }'],
    template: '...',
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
