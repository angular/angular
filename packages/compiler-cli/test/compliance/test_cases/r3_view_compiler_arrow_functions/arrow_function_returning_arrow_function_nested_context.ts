import {Component} from '@angular/core';

@Component({
  template: `
    @let topLevelLet = 1;

    @if (true) {
      @let nestedLet = 2;

      @if (true) {
        {{(a => b => c => d => a + b + c + d + componentProp + topLevelLet + nestedLet)(1)(2)(3)(4)}}
      }
    }
  `,
})
export class TestComp {
  componentProp = 0;
}
