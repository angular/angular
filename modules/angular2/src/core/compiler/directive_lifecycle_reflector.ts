import {Type} from 'angular2/src/core/facade/lang';
import {LifecycleHooks} from './interfaces';

export function hasLifecycleHook(lcInterface: LifecycleHooks, token): boolean {
  if (!(token instanceof Type)) return false;

  var proto = (<any>token).prototype;

  switch (lcInterface) {
    case LifecycleHooks.AfterContentInit:
      return !!proto.afterContentInit;
    case LifecycleHooks.AfterContentChecked:
      return !!proto.afterContentChecked;
    case LifecycleHooks.AfterViewInit:
      return !!proto.afterViewInit;
    case LifecycleHooks.AfterViewChecked:
      return !!proto.afterViewChecked;
    case LifecycleHooks.OnChanges:
      return !!proto.onChanges;
    case LifecycleHooks.DoCheck:
      return !!proto.doCheck;
    case LifecycleHooks.OnDestroy:
      return !!proto.onDestroy;
    case LifecycleHooks.OnInit:
      return !!proto.onInit;
    default:
      return false;
  }
}
