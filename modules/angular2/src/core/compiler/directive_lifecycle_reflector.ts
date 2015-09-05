import {Type} from 'angular2/src/core/facade/lang';
import * as Interfaces from './interfaces';

export function hasLifecycleHook(lcInterface, type): boolean {
  if (!(type instanceof Type)) return false;

  var proto = (<any>type).prototype;

  switch (lcInterface) {
    case Interfaces.AfterContentInit:
      return !!proto.afterContentInit;
    case Interfaces.AfterContentChecked:
      return !!proto.afterContentChecked;
    case Interfaces.AfterViewInit:
      return !!proto.afterViewInit;
    case Interfaces.AfterViewChecked:
      return !!proto.afterViewChecked;
    case Interfaces.OnChanges:
      return !!proto.onChanges;
    case Interfaces.DoCheck:
      return !!proto.doCheck;
    case Interfaces.OnDestroy:
      return !!proto.onDestroy;
    case Interfaces.OnInit:
      return !!proto.onInit;
    default:
      return false;
  }
}
