import {Type} from '@angular/core';
import {RouteLifecycleHook, CanActivate} from './lifecycle_annotations_impl';
import {reflector} from '../../core_private';

export function hasLifecycleHook(e: RouteLifecycleHook, type: any /** TODO #9100 */): boolean {
  if (!(type instanceof Type)) return false;
  return e.name in(<any>type).prototype;
}

export function getCanActivateHook(type: any /** TODO #9100 */): Function {
  var annotations = reflector.annotations(type);
  for (let i = 0; i < annotations.length; i += 1) {
    let annotation = annotations[i];
    if (annotation instanceof CanActivate) {
      return annotation.fn;
    }
  }

  return null;
}
