import {bootstrap} from 'angular2/platform/browser';
import {Component} from 'angular2/core';

@Component({selector: '[svg-group]', template: `<svg:text x="20" y="20">Hello</svg:text>`})
class SvgGroup {
}


@Component({
  selector: 'svg-app',
  template: `<svg>
    <g svg-group></g>
  </svg>`,
  directives: [SvgGroup]
})
class SvgApp {
}


export function main() {
  bootstrap(SvgApp);
}
