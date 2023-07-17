import {Component} from '@angular/core';

@Component({
  standalone: true,
  selector: 'other-cmp',
  template: '',
})
export class OtherCmp {
}

@Component({
  standalone: true,
  template: '<other-cmp></other-cmp>',
  imports: [OtherCmp],
})
export class StandaloneCmp {
}
