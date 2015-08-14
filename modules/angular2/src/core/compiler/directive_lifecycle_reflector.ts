import {Type, isPresent} from 'angular2/src/facade/lang';
import {LifecycleEvent, DirectiveMetadata} from 'angular2/metadata';

export function hasLifecycleHook(e: LifecycleEvent, type, annotation: DirectiveMetadata): boolean {
  if (isPresent(annotation.lifecycle)) {
    return annotation.lifecycle.indexOf(e) !== -1;
  } else {
    if (!(type instanceof Type)) return false;
    var proto = (<any>type).prototype;
    switch (e) {
      case LifecycleEvent.onAllChangesDone:
        return !!proto.onAllChangesDone;
      case LifecycleEvent.onChange:
        return !!proto.onChange;
      case LifecycleEvent.onCheck:
        return !!proto.onCheck;
      case LifecycleEvent.onDestroy:
        return !!proto.onDestroy;
      case LifecycleEvent.onInit:
        return !!proto.onInit;
      default:
        return false;
    }
  }
}
