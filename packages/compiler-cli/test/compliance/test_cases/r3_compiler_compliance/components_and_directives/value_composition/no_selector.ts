import {Component, Directive, NgModule} from '@angular/core';

@Directive({selector: 'router-outlet'})
export class RouterOutlet {
}

@Component({template: '<router-outlet></router-outlet>'})
export class EmptyOutletComponent {
}

@NgModule({declarations: [EmptyOutletComponent, RouterOutlet]})
export class MyModule {
}
