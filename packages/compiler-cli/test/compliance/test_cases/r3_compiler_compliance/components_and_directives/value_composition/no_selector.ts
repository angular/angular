import {Component, Directive, NgModule} from '@angular/core';

@Directive({
    selector: 'router-outlet',
    standalone: false
})
export class RouterOutlet {
}

@Component({
    template: '<router-outlet></router-outlet>',
    standalone: false
})
export class EmptyOutletComponent {
}

@NgModule({declarations: [EmptyOutletComponent, RouterOutlet]})
export class MyModule {
}
