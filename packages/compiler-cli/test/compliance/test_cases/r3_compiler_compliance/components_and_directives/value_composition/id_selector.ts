import {Component, NgModule} from '@angular/core';

@Component({
    selector: '#my-app', template: '',
    standalone: false
})
export class SomeComponent {
}

@NgModule({declarations: [SomeComponent]})
export class MyModule {
}
