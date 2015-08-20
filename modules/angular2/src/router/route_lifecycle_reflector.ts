import {Type, isPresent} from 'angular2/src/core/facade/lang';
import {RouteLifecycleHook, CanActivate} from './lifecycle_annotations_impl';
import {reflector} from 'angular2/src/core/reflection/reflection';

export function hasLifecycleHook(e: RouteLifecycleHook, type): boolean {
  if (!(type instanceof Type)) return false;
  return e.name in(<any>type).prototype;
}

export function getCanActivateHook(type): Function {
  var annotations = reflector.annotations(type);
  for (let i = 0; i < annotations.length; i += 1) {
    let annotation = annotations[i];
    if (annotation instanceof CanActivate) {
      return annotation.fn;
    }
  }

  return null;
}
