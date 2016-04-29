import {bootstrap} from '@angular/platform-browser';

import {Renderer, ElementRef, Component, Directive, Injectable} from '@angular/core';
import {MyCmp} from './my_cmp/my_cmp';

export function main() {
  bootstrap(RelativeApp);
}

@Component({
  selector: 'relative-app',
  directives: [MyCmp],
  template: `component = <my-cmp></my-cmp>`,
})
export class RelativeApp {
}
