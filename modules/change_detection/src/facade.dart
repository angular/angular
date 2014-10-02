library change_detection.facade;

@MirrorsUsed(targets: const [FieldGetterFactory], metaTargets: const [] )
import 'dart:mirrors';

typedef SetterFn(Object obj, value);

class FieldGetterFactory {
  getter(Object object, String name) {
    Symbol symbol = new Symbol(name);
    InstanceMirror instanceMirror = reflect(object);
    return (Object object) => instanceMirror.getField(symbol).reflectee;
  }
}
