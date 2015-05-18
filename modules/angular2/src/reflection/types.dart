library reflection.types;

typedef SetterFn(Object obj, value);
typedef GetterFn(Object obj);
typedef MethodFn(Object obj, List args);

abstract class IReflectionCapabilities {
  Function factory(Type type);
  List<List<Type>> parameters(Type type);
  List<Type> interfaces(Type type);
  List annotations(Type type);
  GetterFn getter(String name);
  SetterFn setter(String name);
  MethodFn method(String name);
}
