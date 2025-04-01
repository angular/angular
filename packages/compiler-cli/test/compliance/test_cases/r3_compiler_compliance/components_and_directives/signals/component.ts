import {Component} from '@angular/core';

@Component({
  // @ts-ignore
  signals: true,
  selector: 'other-cmp',
  template: '',
})
export class OtherCmp {
}

@Component({
  // @ts-ignore
  signals: true,
  template: '<other-cmp></other-cmp>',
  imports: [OtherCmp],
})
export class SignalCmp {
}
