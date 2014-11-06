export var SetterFn = Function;

export class ClosureMap {
  getter(name:string) {
    return new Function('o', 'return o.' + name + ';');
  }

  setter(name:string) {
    return new Function('o', 'v', 'return o.' + name + ' = v;');
  }

  fn(name:string) {
    var method = `o.${name}`;
    return new Function('o', 'args',
      `if (!${method}) throw new Error('"${name}" is undefined');` +
      `return ${method}.apply(o, args);`);
  }
}
