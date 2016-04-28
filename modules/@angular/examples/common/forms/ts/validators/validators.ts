import {Component} from 'angular2/core';
import {MinLengthValidator, MaxLengthValidator} from 'angular2/common';

// #docregion min
@Component({
  selector: 'min-cmp',
  directives: [MinLengthValidator],
  template: `
<form>
  <p>Year: <input ngControl="year" minlength="2"></p>
</form>
`
})
class MinLengthTestComponent {
}
// #enddocregion

// #docregion max
@Component({
  selector: 'max-cmp',
  directives: [MaxLengthValidator],
  template: `
<form>
  <p>Year: <input ngControl="year" maxlength="4"></p>
</form>
`
})
class MaxLengthTestComponent {
}
// #enddocregion
