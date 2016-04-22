import {Type} from 'angular2/src/facade/lang';

export function hasLifecycleHook(name: string, obj: Object): boolean {
  let type = obj.constructor;
  if (!(type instanceof Type)) return false;
  return name in(<any>type).prototype;
}
