/// <reference path="../../../angular2/typings/rx/rx.all.d.ts" />

import {bootstrap} from 'angular2/angular2';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {httpInjectables} from 'angular2/http';
import {HttpCmp} from './http_comp';

export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrap(HttpCmp, [httpInjectables]);
}
