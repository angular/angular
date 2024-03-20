import {Component, Directive, Input} from '@angular/core';

@Directive({selector: '[dir]'})
class WithInput {
  @Input() dir: string = '';
}

@Component({
  selector: 'my-app',
  template: '<ng-template dir="{{ message }}"></ng-template>',
})
export class TestComp {
  message = 'Hello';
}
