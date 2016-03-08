import {isPresent} from 'angular2/src/facade/lang';


declare var Symbol: any;


/**
 * Annotation Factory that only allows a set of values to be set for a property.
 * @param values The list of allowed values. The first value listed will be used as a default if
 *     the set value isn't part of the list of accepted values.
 */
function oneOfFactory(values: any[]) {
  return function oneOfMetadata(target: any, key: string): void {
    const defaultValue = values[0];

    // Use a fallback if Symbol isn't available.
    const localKey = isPresent(Symbol) ? Symbol(key) : `@@$${key}_`;
    target[localKey] = defaultValue;

    Object.defineProperty(target, key, {
      get() { return this[localKey]; },
      set(v) {
        if (values.indexOf(v) == -1) {
          this[localKey] = defaultValue;
        } else {
          this[localKey] = v;
        }
      }
    });
  };
}

export { oneOfFactory as OneOf };
