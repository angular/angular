export class Dep {}

export class OtherDep {}

export namespace nested {
  export class DeepDep {}
}

export class Model {}

export class Registered {}

export class Fallback {}

export class Box<T> {
  value!: T;
}

export function Custom(): PropertyDecorator {
  return () => {};
}
