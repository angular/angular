import {Type, isPresent} from 'angular2/src/facade/lang';
import {LifecycleEvent, Directive} from 'angular2/src/core/annotations_impl/annotations';

export function hasLifecycleHook(e: LifecycleEvent, type, annotation: Directive): boolean {
  if (isPresent(annotation.lifecycle)) {
    return annotation.lifecycle.indexOf(e) !== -1;
  } else {
    if (!(type instanceof Type)) return false;
    return e.name in(<any>type).prototype;
  }
}