export function bind(fn: Function, scope: any): Function {
  return fn.bind(scope);
}
