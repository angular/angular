import {bootstrap} from 'angular2/bootstrap';
import {reflector} from 'angular2/src/core/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/core/reflection/reflection_capabilities';

import {Renderer, ElementRef, Component, Directive, Injectable} from 'angular2/core';
import {MyCmp} from './my_cmp/my_cmp';

export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrap(RelativeApp);
}

@Component({
  selector: 'relative-app',
  directives: [MyCmp],
  template: `component = <my-cmp></my-cmp>`,
})
export class RelativeApp {
}
