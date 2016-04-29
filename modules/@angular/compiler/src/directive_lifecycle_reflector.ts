import {LifecycleHooks} from '../core_private';

import {Type} from '../src/facade/lang';


export function hasLifecycleHook(lcInterface: LifecycleHooks, token): boolean {
  if (!(token instanceof Type)) return false;

  var proto = (<any>token).prototype;

  switch (lcInterface) {
    case LifecycleHooks.AfterContentInit:
      return !!proto.ngAfterContentInit;
    case LifecycleHooks.AfterContentChecked:
      return !!proto.ngAfterContentChecked;
    case LifecycleHooks.AfterViewInit:
      return !!proto.ngAfterViewInit;
    case LifecycleHooks.AfterViewChecked:
      return !!proto.ngAfterViewChecked;
    case LifecycleHooks.OnChanges:
      return !!proto.ngOnChanges;
    case LifecycleHooks.DoCheck:
      return !!proto.ngDoCheck;
    case LifecycleHooks.OnDestroy:
      return !!proto.ngOnDestroy;
    case LifecycleHooks.OnInit:
      return !!proto.ngOnInit;
    default:
      return false;
  }
}
