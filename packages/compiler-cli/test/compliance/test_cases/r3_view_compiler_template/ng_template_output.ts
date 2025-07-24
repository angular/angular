import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: '<ng-template (outDirective)="$event.doSth()"></ng-template>',
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
