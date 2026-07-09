import {Component} from '@angular/core';

@Component({
  template: `
    {{(value => value?.a?.b?.c?.()?.()?.()?.())(componentProp)}}
    <hr>
    {{() => componentProp?.a?.b?.c?.()?.()?.()?.()}}
  `
})
export class TestComp {
  componentProp: {a?: {b?: {c?: () => () => () => () => string}}} = {};
}
