import {Component} from '@angular/core';

@Component({
  selector: 'other-cmp',
  template: '',
})
export class OtherCmp {
}

@Component({
  template: '<other-cmp></other-cmp>',
  imports: [OtherCmp],
})
export class StandaloneCmp {
}
