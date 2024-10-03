import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-comp', template: 'hello',
    standalone: false
})
export class MyComp {
}

@Component({
    template: `<my-comp/>`,
    standalone: false
})
export class App {
}

@NgModule({declarations: [App, MyComp]})
export class MyModule {
}
