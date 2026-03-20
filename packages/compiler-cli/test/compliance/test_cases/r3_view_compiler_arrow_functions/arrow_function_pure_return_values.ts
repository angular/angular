import {Component} from '@angular/core';

@Component({
  template: `
    {{(a => ({foo: a, bar: componentProp}))(1).foo}}
  `
})
export class TestComp {
  componentProp = 0;
}
