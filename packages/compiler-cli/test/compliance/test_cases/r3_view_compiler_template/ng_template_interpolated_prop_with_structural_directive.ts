import {Component, Directive, Input} from '@angular/core';

@Directive({
    selector: '[dir]',
    standalone: false
})
class WithInput {
  @Input() dir: string = '';
}

@Component({
    selector: 'my-app',
    template: '<ng-template *ngIf="true" dir="{{ message }}"></ng-template>',
    standalone: false
})
export class TestComp {
  message = 'Hello';
}
