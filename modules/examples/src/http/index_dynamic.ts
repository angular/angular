import {HttpCmp} from './http_comp';
import {bootstrap} from 'angular2/angular2';
import {bind} from 'angular2/di';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {PipeRegistry, defaultPipes} from 'angular2/change_detection';
import {RxPipeFactory} from './rx_pipe';

export function main() {
  // This entry point is not transformed and exists for testing purposes.
  // See index.js for an explanation.
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  defaultPipes.rx = [new RxPipeFactory()] bootstrap(
      HttpCmp, [bind(PipeRegistry).toValue(new PipeRegistry(defaultPipes))]);
}
