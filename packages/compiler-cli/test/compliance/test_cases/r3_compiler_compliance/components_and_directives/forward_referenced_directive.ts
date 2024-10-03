import {Component, Directive, NgModule} from '@angular/core';

@Component({
    selector: 'host-binding-comp',
    template: `
    <my-forward-directive></my-forward-directive>
  `,
    standalone: false
})
export class HostBindingComp {
}

@Directive({
    selector: 'my-forward-directive',
    standalone: false
})
class MyForwardDirective {
}

@NgModule({declarations: [HostBindingComp, MyForwardDirective]})
export class MyModule {
}
