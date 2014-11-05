import 'dart:mirrors';

typedef SetterFn(Object obj, value);

class ClosureMap {
  Function getter(String name) {
    var symbol = new Symbol(name);
    return (receiver) => reflect(receiver).getField(symbol).reflectee;
  }

  Function setter(String name) {
    var symbol = new Symbol(name);
    return (receiver, value) => reflect(receiver).setField(symbol, value).reflectee;
  }
}
