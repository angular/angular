import {Component} from '@angular/core';

@Component({
  signals: true,
  standalone: true,
  selector: 'other-cmp',
  template: '',
})
export class OtherCmp {
}

@Component({
  signals: true,
  standalone: true,
  template: '<other-cmp></other-cmp>',
  imports: [OtherCmp],
})
export class SignalCmp {
}
