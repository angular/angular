import {HelloCmp} from './index_common';
import {bootstrap} from 'angular2/angular2';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';

export function main() {
  // This entry point is not transformed and exists for testing purposes.
  // See index.js for an explanation.
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrap(HelloCmp);
}
