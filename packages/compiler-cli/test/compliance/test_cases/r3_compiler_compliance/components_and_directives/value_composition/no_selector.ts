import {Component, Directive, NgModule} from '@angular/core';

@Component({template: '<router-outlet></router-outlet>'})
export class EmptyOutletComponent {
}

@NgModule({declarations: [EmptyOutletComponent]})
export class MyModule {
}
