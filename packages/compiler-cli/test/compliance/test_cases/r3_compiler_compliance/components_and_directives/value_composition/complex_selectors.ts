import {Directive, NgModule} from '@angular/core';

@Directive({
    selector: 'div.foo[some-directive]:not([title]):not(.baz)',
    standalone: false
})
export class SomeDirective {
}

@Directive({
    selector: ':not(span[title]):not(.baz)',
    standalone: false
})
export class OtherDirective {
}

@NgModule({declarations: [SomeDirective, OtherDirective]})
export class MyModule {
}
