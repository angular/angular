import {global} from './lang';

export function setGlobalVar(name: string, value: any) {
  global[name] = value;
}

export function getGlobalVar(name: string) {
  return global[name];
}

export function invokeJsFunction(fn: Function, self: any, args: List<any>) {
  return fn.apply(self, args);
}
