import {Directive, NgModule} from '@angular/core';

@Directive({
    selector: '[some-directive]', exportAs: 'someDir, otherDir',
    standalone: false
})
export class SomeDirective {
}

@NgModule({declarations: [SomeDirective]})
export class MyModule {
}
