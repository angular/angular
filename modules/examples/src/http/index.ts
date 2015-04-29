/// <reference path="../../../angular2/typings/rx/rx.all.d.ts" />

import {
  bootstrap,
  ElementRef,
  Component,
  Directive,
  View,
  Injectable,
  NgFor,
  NgIf,
  Inject
} from 'angular2/angular2';
import {bind} from 'angular2/di';
import {PipeRegistry, defaultPipes} from 'angular2/change_detection';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {httpBindings} from 'angular2/http';
import {Http} from 'angular2/src/http/http';
import {IHttp} from 'angular2/src/http/interfaces';
import {Response} from 'angular2/src/http/static_response';
import {LocalVariable} from './assign_local_directive';
import {RxPipeFactory} from './rx_pipe';
import {HttpCmp} from './http_comp';

export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  defaultPipes.rx = [new RxPipeFactory()] bootstrap(
      HttpCmp, [bind(PipeRegistry).toValue(new PipeRegistry(defaultPipes))]);
}
