import {Component} from '@angular/core';

@Component({
  selector: 'my-comp',
  template: `
  <div i18n>
    <span title="{{foo}}-{{foo}}"></span>
    <span>{foo, select, other {<span title="{{foo}}-{{foo}}">foo</span>}}</span>
    <span>{foo, select, other {{{foo}}-{{foo}}}}</span>
  </div>
  `
})
export class MyComponent {
  foo: any;
}
