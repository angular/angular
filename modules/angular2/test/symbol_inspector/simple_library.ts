// A library for the symbol inspector test

export class A {
  constructor(b: ConsParamType) {}

  field: FieldType;
  get getter(): GetterType { return null; }

  method(p: ParamType): MethodReturnType { return null; }

  methodWithFunc(closure: ClosureReturn) {}

  static staticField: StaticFieldType = null;
  static staticMethod() {}
}

export class ConsParamType {}
export class FieldType {}
export class GetterType {}
export class MethodReturnType {}
export class ParamType {}
export class StaticFieldType {}

export class ClosureReturn {}
export class ClosureParam {}

export class TypedefReturnType {}
export class TypedefParam {}


export class Generic<K> {  // Generic should be exported, but not K.
  get getter(): K { return null; }
}

export interface SomeInterface { someMethod(); }
