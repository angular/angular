import {Component} from '@angular/core';

@Component({
  selector: 'test-cmp',
  template: '',
  host: {
    '[animate.enter]': "disabled ? undefined : 'enter-class'",
  }
})
export class TestCmp {
  disabled = false;
}
