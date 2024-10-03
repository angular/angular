import {ChangeDetectorRef, Component, ElementRef, NgModule, ViewContainerRef} from '@angular/core';

@Component({
    selector: 'my-component', template: '',
    standalone: false
})
export class MyComponent {
  constructor(public el: ElementRef, public vcr: ViewContainerRef, public cdr: ChangeDetectorRef) {}
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
