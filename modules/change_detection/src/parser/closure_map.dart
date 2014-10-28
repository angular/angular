import 'dart:mirrors';

class ClosureMap {
  Function getter(String name) {
    var symbol = new Symbol(name);
    return (receiver) => reflect(receiver).getField(symbol).reflectee;
  }
}