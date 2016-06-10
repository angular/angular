import {Type, isPresent} from 'angular2/src/facade/lang';
import {RouteLifecycleHook} from './lifecycle_annotations_impl';
import {reflector} from 'angular2/src/core/reflection/reflection';

export function hasLifecycleHook(e: RouteLifecycleHook, instance): boolean {
  return e.name in instance;
}
