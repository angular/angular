import {Type, isPresent} from 'angular2/src/core/facade/lang';
import {LifecycleEvent, DirectiveMetadata} from 'angular2/metadata';

export function hasLifecycleHook(e: LifecycleEvent, type, annotation: DirectiveMetadata): boolean {
  if (isPresent(annotation.lifecycle)) {
    return annotation.lifecycle.indexOf(e) !== -1;
  } else {
    if (!(type instanceof Type)) return false;
    var proto = (<any>type).prototype;
    switch (e) {
      case LifecycleEvent.AfterContentInit:
        return !!proto.afterContentInit;
      case LifecycleEvent.AfterContentChecked:
        return !!proto.afterContentChecked;
      case LifecycleEvent.AfterViewInit:
        return !!proto.afterViewInit;
      case LifecycleEvent.AfterViewChecked:
        return !!proto.afterViewChecked;
      case LifecycleEvent.OnChanges:
        return !!proto.onChanges;
      case LifecycleEvent.DoCheck:
        return !!proto.doCheck;
      case LifecycleEvent.OnDestroy:
        return !!proto.onDestroy;
      case LifecycleEvent.OnInit:
        return !!proto.onInit;
      default:
        return false;
    }
  }
}
