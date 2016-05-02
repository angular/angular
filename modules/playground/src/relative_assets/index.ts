import {bootstrap} from '@angular/platform-browser-dynamic';

import {Renderer, ElementRef, Component, Directive, Injectable} from '@angular/core';
import {MyCmp} from './app/my_cmp';

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
