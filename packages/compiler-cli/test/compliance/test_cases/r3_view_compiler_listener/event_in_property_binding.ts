import {Component, Directive, Input, NgModule} from '@angular/core';

@Directive({
    selector: 'div',
    standalone: false
})
export class DivDir {
  @Input() event!: any;
}

@Component({
    template: '<div [event]="$event"></div>',
    standalone: false
})
class Comp {
  $event = 1;
}

@NgModule({declarations: [Comp, DivDir]})
export class MyMod {
}
