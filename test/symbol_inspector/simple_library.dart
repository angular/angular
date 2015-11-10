// A library for the symbol inspector test
library angular2.test.symbol_inspector.simple_library;

class A {
  A(ConsParamType b) {}
  FieldType field;
  GetterType get getter {
    return null;
  }

  MethodReturnType method(ParamType p) {
    return null;
  }

  methodWithFunc(ClosureReturn closure) {}
  static StaticFieldType staticField = null;
  static staticMethod() {}
}

class ConsParamType {}

class FieldType {}

class GetterType {}

class MethodReturnType {}

class ParamType {}

class StaticFieldType {}

class ClosureReturn {}

class ClosureParam {}

class TypedefReturnType {}

class TypedefParam {}

class Generic<K> {
  K get getter {
    return null;
  }
}

abstract class SomeInterface {
  someMethod();
}
