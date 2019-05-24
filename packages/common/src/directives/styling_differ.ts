/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Used to diff and convert ngStyle/ngClass instructions into [style] and [class] bindings.
 *
 * ngStyle and ngClass both accept various forms of input and behave differently than that
 * of how [style] and [class] behave in Angular.
 *
 * The differences are:
 *  - ngStyle and ngClass both **watch** their binding values for changes each time CD runs
 *    while [style] and [class] bindings do not (they check for identity changes)
 *  - ngStyle allows for unit-based keys (e.g. `{'max-width.px':value}`) and [style] does not
 *  - ngClass supports arrays of class values and [class] only accepts map and string values
 *  - ngClass allows for multiple className keys (space-separated) within an array or map
 *     (as the * key) while [class] only accepts a simple key/value map object
 *
 * Having Angular understand and adapt to all the different forms of behavior is complicated
 * and unnecessary. Instead, ngClass and ngStyle should have their input values be converted
 * into something that the core-level [style] and [class] bindings understand.
 *
 * This [StylingDiffer] class handles this conversion by creating a new input value each time
 * the inner representation of the binding value have changed.
 *
 * ## Why do we care about ngStyle/ngClass?
 * The styling algorithm code (documented inside of `render3/interfaces/styling.ts`) needs to
 * respect and understand the styling values emitted through ngStyle and ngClass (when they
 * are present and used in a template).
 *
 * Instead of having these directives manage styling on their own, they should be included
 * into the Angular styling algorithm that exists for [style] and [class] bindings.
 *
 * Here's why:
 *
 * - If ngStyle/ngClass is used in combination with [style]/[class] bindings then the
 *   styles and classes would fall out of sync and be applied and updated at
 *   inconsistent times
 * - Both ngClass/ngStyle do not respect [class.name] and [style.prop] bindings
 *   (they will write over them given the right combination of events)
 *
 *   ```
 *   <!-- if `w1` is updated then it will always override `w2`
 *        if `w2` is updated then it will always override `w1`
 *        if both are updated at the same time then `w1` wins -->
 *   <div [ngStyle]="{width:w1}" [style.width]="w2">...</div>
 *
 *   <!-- if `w1` is updated then it will always lose to `w2`
 *        if `w2` is updated then it will always override `w1`
 *        if both are updated at the same time then `w2` wins -->
 *   <div [style]="{width:w1}" [style.width]="w2">...</div>
 *   ```
 * - ngClass/ngStyle were written as a directives and made use of maps, closures and other
 *   expensive data structures which were evaluated each time CD runs
 */
export class StylingDiffer<T> {
  public readonly value: T|null = null;

  private _lastSetValue: {[key: string]: any}|string|string[]|null = null;
  private _lastSetValueType: StylingDifferValueTypes = StylingDifferValueTypes.Null;
  private _lastSetValueIdentityChange = false;

  constructor(private _name: string, private _options: StylingDifferOptions) {}

  /**
   * Sets (updates) the styling value within the differ.
   *
   * Only when `hasValueChanged` is called then this new value will be evaluted
   * and checked against the previous value.
   *
   * @param value the new styling value provided from the ngClass/ngStyle binding
   */
  setValue(value: {[key: string]: any}|string[]|string|null) {
    if (Array.isArray(value)) {
      this._lastSetValueType = StylingDifferValueTypes.Array;
    } else if (value instanceof Set) {
      this._lastSetValueType = StylingDifferValueTypes.Set;
    } else if (value && typeof value === 'string') {
      if (!(this._options & StylingDifferOptions.AllowStringValue)) {
        throw new Error(this._name + ' string values are not allowed');
      }
      this._lastSetValueType = StylingDifferValueTypes.String;
    } else {
      this._lastSetValueType = value ? StylingDifferValueTypes.Map : StylingDifferValueTypes.Null;
    }

    this._lastSetValueIdentityChange = true;
    this._lastSetValue = value || null;
  }

  /**
   * Determines whether or not the value has changed.
   *
   * This function can be called right after `setValue()` is called, but it can also be
   * called incase the existing value (if it's a collection) changes internally. If the
   * value is indeed a collection it will do the necessary diffing work and produce a
   * new object value as assign that to `value`.
   *
   * @returns whether or not the value has changed in some way.
   */
  hasValueChanged(): boolean {
    let valueHasChanged = this._lastSetValueIdentityChange;
    if (!valueHasChanged && !(this._lastSetValueType & StylingDifferValueTypes.Collection))
      return false;

    let finalValue: {[key: string]: any}|string|null = null;
    const trimValues = (this._options & StylingDifferOptions.TrimProperties) ? true : false;
    const parseOutUnits = (this._options & StylingDifferOptions.AllowUnits) ? true : false;
    const allowSubKeys = (this._options & StylingDifferOptions.AllowSubKeys) ? true : false;

    switch (this._lastSetValueType) {
      // case 1: [input]="string"
      case StylingDifferValueTypes.String:
        const tokens = (this._lastSetValue as string).split(/\s+/g);
        if (this._options & StylingDifferOptions.ForceAsMap) {
          finalValue = {};
          tokens.forEach((token, i) => (finalValue as{[key: string]: any})[token] = true);
        } else {
          finalValue = tokens.reduce((str, token, i) => str + (i ? ' ' : '') + token);
        }
        break;

      // case 2: [input]="{key:value}"
      case StylingDifferValueTypes.Map:
        const map: {[key: string]: any} = this._lastSetValue as{[key: string]: any};
        const keys = Object.keys(map);
        if (!valueHasChanged) {
          if (this.value) {
            // we know that the classExp value exists and that it is
            // a map (otherwise an identity change would have occurred)
            valueHasChanged = mapHasChanged(keys, this.value as{[key: string]: any}, map);
          } else {
            valueHasChanged = true;
          }
        }

        if (valueHasChanged) {
          finalValue =
              bulidMapFromValues(this._name, trimValues, parseOutUnits, allowSubKeys, map, keys);
        }
        break;

      // case 3a: [input]="[str1, str2, ...]"
      // case 3b: [input]="Set"
      case StylingDifferValueTypes.Array:
      case StylingDifferValueTypes.Set:
        const values = Array.from(this._lastSetValue as string[] | Set<string>);
        if (!valueHasChanged) {
          const keys = Object.keys(this.value !);
          valueHasChanged = !arrayEqualsArray(keys, values);
        }
        if (valueHasChanged) {
          finalValue =
              bulidMapFromValues(this._name, trimValues, parseOutUnits, allowSubKeys, values);
        }
        break;

      // case 4: [input]="null|undefined"
      default:
        finalValue = null;
        break;
    }

    if (valueHasChanged) {
      (this as any).value = finalValue !;
    }

    return valueHasChanged;
  }
}

/**
 * Various options that are consumed by the [StylingDiffer] class.
 */
export const enum StylingDifferOptions {
  None = 0b00000,
  TrimProperties = 0b00001,
  AllowSubKeys = 0b00010,
  AllowStringValue = 0b00100,
  AllowUnits = 0b01000,
  ForceAsMap = 0b10000,
}

/**
 * The different types of inputs that the [StylingDiffer] can deal with
 */
const enum StylingDifferValueTypes {
  Null = 0b0000,
  String = 0b0001,
  Map = 0b0010,
  Array = 0b0100,
  Set = 0b1000,
  Collection = 0b1110,
}


/**
 * builds and returns a map based on the values input value
 *
 * If the `keys` param is provided then the `values` param is treated as a
 * string map. Otherwise `values` is treated as a string array.
 */
function bulidMapFromValues(
    errorPrefix: string, trim: boolean, parseOutUnits: boolean, allowSubKeys: boolean,
    values: {[key: string]: any} | string[], keys?: string[]) {
  const map: {[key: string]: any} = {};
  if (keys) {
    // case 1: map
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      key = trim ? key.trim() : key;
      const value = (values as{[key: string]: any})[key];
      setMapValues(map, key, value, parseOutUnits, allowSubKeys);
    }
  } else {
    // case 2: array
    for (let i = 0; i < values.length; i++) {
      let value = (values as string[])[i];
      assertValidValue(errorPrefix, value);
      value = trim ? value.trim() : value;
      setMapValues(map, value, true, false, allowSubKeys);
    }
  }

  return map;
}

function assertValidValue(errorPrefix: string, value: any) {
  if (typeof value !== 'string') {
    throw new Error(
        `${errorPrefix} can only toggle CSS classes expressed as strings, got ${value}`);
  }
}

function setMapValues(
    map: {[key: string]: any}, key: string, value: any, parseOutUnits: boolean,
    allowSubKeys: boolean) {
  if (allowSubKeys && key.indexOf(' ') > 0) {
    const innerKeys = key.split(/\s+/g);
    for (let j = 0; j < innerKeys.length; j++) {
      setIndividualMapValue(map, innerKeys[j], value, parseOutUnits);
    }
  } else {
    setIndividualMapValue(map, key, value, parseOutUnits);
  }
}

function setIndividualMapValue(
    map: {[key: string]: any}, key: string, value: any, parseOutUnits: boolean) {
  if (parseOutUnits) {
    const values = normalizeStyleKeyAndValue(key, value);
    value = values.value;
    key = values.key;
  }
  map[key] = value;
}

function normalizeStyleKeyAndValue(key: string, value: string | null) {
  const index = key.indexOf('.');
  if (index > 0) {
    const unit = key.substr(index + 1);  // ignore the . ([width.px]="'40'" => "40px")
    key = key.substring(0, index);
    if (value != null) {  // we should not convert null values to string
      value += unit;
    }
  }
  return {key, value};
}

function mapHasChanged(keys: string[], a: {[key: string]: any}, b: {[key: string]: any}) {
  const oldKeys = Object.keys(a);
  const newKeys = keys;

  // the keys are different which means the map changed
  if (!arrayEqualsArray(oldKeys, newKeys)) {
    return true;
  }

  for (let i = 0; i < newKeys.length; i++) {
    const key = newKeys[i];
    if (a[key] !== b[key]) {
      return true;
    }
  }

  return false;
}

function arrayEqualsArray(a: any[] | null, b: any[] | null) {
  if (a && b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (b.indexOf(a[i]) === -1) return false;
    }
    return true;
  }
  return false;
}
