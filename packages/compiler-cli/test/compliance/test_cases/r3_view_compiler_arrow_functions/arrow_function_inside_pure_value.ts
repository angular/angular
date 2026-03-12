import {Component} from '@angular/core';

@Component({
  template: `
    {{[(a) => a + 1][0](1000)}}
    {{[(a) => a + 1 + componentProp][0](1000)}}
  `
})
export class TestComp {
  componentProp = 0;
}
