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
 *  - ngStyle and ngClass both **deep-watch** their binding values for changes each time CD runs
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
 * This [StylingDiffer] class handles this conversion by creating a new output value each time
 * the input value of the binding value has changed (either via identity change or deep collection
 * content change).
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
 * - Both ngClass/ngStyle should respect [class.name] and [style.prop] bindings (and not arbitrarily
 *   overwrite their changes)
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
export class StylingDiffer<T extends({[key: string]: string | null} | {[key: string]: true})> {
  /**
   * Normalized string map representing the last value set via `setValue()` or null if no value has
   * been set or the last set value was null
   */
  public readonly value: T|null = null;

  /**
   * The last set value that was applied via `setValue()`
   */
  private _inputValue: T|string|string[]|Set<string>|null = null;

  /**
   * The type of value that the `_lastSetValue` variable is
   */
  private _inputValueType: StylingDifferValueTypes = StylingDifferValueTypes.Null;

  /**
   * Whether or not the last value change occurred because the variable itself changed reference
   * (identity)
   */
  private _inputValueIdentityChangeSinceLastCheck = false;

  constructor(private _name: string, private _options: StylingDifferOptions) {}

  /**
   * Sets the input value for the differ and updates the output value if necessary.
   *
   * @param value the new styling input value provided from the ngClass/ngStyle binding
   */
  setInput(value: T|string[]|string|Set<string>|null): void {
    if (value !== this._inputValue) {
      let type: StylingDifferValueTypes;
      if (!value) {  // matches empty strings, null, false and undefined
        type = StylingDifferValueTypes.Null;
        value = null;
      } else if (Array.isArray(value)) {
        type = StylingDifferValueTypes.Array;
      } else if (value instanceof Set) {
        type = StylingDifferValueTypes.Set;
      } else if (typeof value === 'string') {
        if (!(this._options & StylingDifferOptions.AllowStringValue)) {
          throw new Error(this._name + ' string values are not allowed');
        }
        type = StylingDifferValueTypes.String;
      } else {
        type = StylingDifferValueTypes.StringMap;
      }

      this._inputValue = value;
      this._inputValueType = type;
      this._inputValueIdentityChangeSinceLastCheck = true;
      this._processValueChange(true);
    }
  }

  /**
   * Checks the input value for identity or deep changes and updates output value if necessary.
   *
   * This function can be called right after `setValue()` is called, but it can also be
   * called incase the existing value (if it's a collection) changes internally. If the
   * value is indeed a collection it will do the necessary diffing work and produce a
   * new object value as assign that to `value`.
   *
   * @returns whether or not the value has changed in some way.
   */
  updateValue(): boolean {
    let valueHasChanged = this._inputValueIdentityChangeSinceLastCheck;
    if (!this._inputValueIdentityChangeSinceLastCheck &&
        (this._inputValueType & StylingDifferValueTypes.Collection)) {
      valueHasChanged = this._processValueChange(false);
    } else {
      // this is set to false in the event that the value is a collection.
      // This way (if the identity hasn't changed), then the algorithm can
      // diff the collection value to see if the contents have mutated
      // (otherwise the value change was processed during the time when
      // the variable changed).
      this._inputValueIdentityChangeSinceLastCheck = false;
    }
    return valueHasChanged;
  }

  /**
   * Examines the last set value to see if there was a change in content.
   *
   * @param inputValueIdentityChanged whether or not the last set value changed in identity or not
   * @returns `true` when the value has changed (either by identity or by shape if its a
   * collection)
   */
  private _processValueChange(inputValueIdentityChanged: boolean): boolean {
    // if the inputValueIdentityChanged then we know that input has changed
    let inputChanged = inputValueIdentityChanged;

    let newOutputValue: T|string|null = null;
    const trimValues = (this._options & StylingDifferOptions.TrimProperties) ? true : false;
    const parseOutUnits = (this._options & StylingDifferOptions.AllowUnits) ? true : false;
    const allowSubKeys = (this._options & StylingDifferOptions.AllowSubKeys) ? true : false;

    switch (this._inputValueType) {
      // case 1: [input]="string"
      case StylingDifferValueTypes.String: {
        if (inputValueIdentityChanged) {
          // process string input only if the identity has changed since the strings are immutable
          const keys = (this._inputValue as string).split(/\s+/g);
          if (this._options & StylingDifferOptions.ForceAsMap) {
            newOutputValue = {} as T;
            for (let i = 0; i < keys.length; i++) {
              (newOutputValue as any)[keys[i]] = true;
            }
          } else {
            newOutputValue = keys.join(' ');
          }
        }
        break;
      }
      // case 2: [input]="{key:value}"
      case StylingDifferValueTypes.StringMap: {
        const inputMap = this._inputValue as T;
        const inputKeys = Object.keys(inputMap);

        if (!inputValueIdentityChanged) {
          // if StringMap and the identity has not changed then output value must have already been
          // initialized to a StringMap, so we can safely compare the input and output maps
          inputChanged = mapsAreEqual(inputKeys, inputMap, this.value as T);
        }

        if (inputChanged) {
          newOutputValue = bulidMapFromStringMap(
              trimValues, parseOutUnits, allowSubKeys, inputMap, inputKeys) as T;
        }
        break;
      }
      // case 3a: [input]="[str1, str2, ...]"
      // case 3b: [input]="Set"
      case StylingDifferValueTypes.Array:
      case StylingDifferValueTypes.Set: {
        const inputKeys = Array.from(this._inputValue as string[] | Set<string>);
        if (!inputValueIdentityChanged) {
          const outputKeys = Object.keys(this.value !);
          inputChanged = !keyArraysAreEqual(outputKeys, inputKeys);
        }
        if (inputChanged) {
          newOutputValue =
              bulidMapFromStringArray(this._name, trimValues, allowSubKeys, inputKeys) as T;
        }
        break;
      }
      // case 4: [input]="null|undefined"
      default:
        inputChanged = inputValueIdentityChanged;
        newOutputValue = null;
        break;
    }

    if (inputChanged) {
      // update the readonly `value` property by casting it to `any` first
      (this as any).value = newOutputValue;
    }

    return inputChanged;
  }
}

/**
 * Various options that are consumed by the [StylingDiffer] class
 */
export const enum StylingDifferOptions {
  None = 0b00000,              //
  TrimProperties = 0b00001,    //
  AllowSubKeys = 0b00010,      //
  AllowStringValue = 0b00100,  //
  AllowUnits = 0b01000,        //
  ForceAsMap = 0b10000,        //
}

/**
 * The different types of inputs that the [StylingDiffer] can deal with
 */
const enum StylingDifferValueTypes {
  Null = 0b0000,        //
  String = 0b0001,      //
  StringMap = 0b0010,   //
  Array = 0b0100,       //
  Set = 0b1000,         //
  Collection = 0b1110,  //
}


/**
 * @param trim whether the keys should be trimmed of leading or trailing whitespace
 * @param parseOutUnits whether units like "px" should be parsed out of the key name and appended to
 *   the value
 * @param allowSubKeys whether key needs to be subsplit by whitespace into multiple keys
 * @param values values of the map
 * @param keys keys of the map
 * @return a normalized string map based on the input string map
 */
function bulidMapFromStringMap(
    trim: boolean, parseOutUnits: boolean, allowSubKeys: boolean,
    values: {[key: string]: string | null | true},
    keys: string[]): {[key: string]: string | null | true} {
  const map: {[key: string]: string | null | true} = {};

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let value = values[key];

    if (value !== undefined) {
      if (typeof value !== 'boolean') {
        value = '' + value;
      }
      // Map uses untrimmed keys, so don't trim until passing to `setMapValues`
      setMapValues(map, trim ? key.trim() : key, value, parseOutUnits, allowSubKeys);
    }
  }

  return map;
}

/**
 * @param trim whether the keys should be trimmed of leading or trailing whitespace
 * @param parseOutUnits whether units like "px" should be parsed out of the key name and appended to
 *   the value
 * @param allowSubKeys whether key needs to be subsplit by whitespace into multiple keys
 * @param values values of the map
 * @param keys keys of the map
 * @return a normalized string map based on the input string array
 */
function bulidMapFromStringArray(
    errorPrefix: string, trim: boolean, allowSubKeys: boolean,
    keys: string[]): {[key: string]: true} {
  const map: {[key: string]: true} = {};

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    ngDevMode && assertValidValue(errorPrefix, key);
    key = trim ? key.trim() : key;
    setMapValues(map, key, true, false, allowSubKeys);
  }

  return map;
}

function assertValidValue(errorPrefix: string, value: any) {
  if (typeof value !== 'string') {
    throw new Error(
        `${errorPrefix} can only toggle CSS classes expressed as strings, got: ${value}`);
  }
}

function setMapValues(
    map: {[key: string]: unknown}, key: string, value: string | null | true, parseOutUnits: boolean,
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
    map: {[key: string]: unknown}, key: string, value: string | true | null,
    parseOutUnits: boolean) {
  if (parseOutUnits && typeof value === 'string') {
    // parse out the unit (e.g. ".px") from the key and append it to the value
    // e.g. for [width.px]="40" => ["width","40px"]
    const unitIndex = key.indexOf('.');
    if (unitIndex > 0) {
      const unit = key.substr(unitIndex + 1);  // skip over the "." in "width.px"
      key = key.substring(0, unitIndex);
      value += unit;
    }
  }
  map[key] = value;
}


/**
 * Compares two maps and returns true if they are equal
 *
 * @param inputKeys value of `Object.keys(inputMap)` it's unclear if this actually performs better
 * @param inputMap map to compare
 * @param outputMap map to compare
 */
function mapsAreEqual(
    inputKeys: string[], inputMap: {[key: string]: unknown},
    outputMap: {[key: string]: unknown}, ): boolean {
  const outputKeys = Object.keys(outputMap);

  if (inputKeys.length !== outputKeys.length) {
    return true;
  }

  for (let i = 0, n = inputKeys.length; i <= n; i++) {
    let key = inputKeys[i];
    if (key !== outputKeys[i] || inputMap[key] !== outputMap[key]) {
      return true;
    }
  }

  return false;
}


/**
 * Compares two Object.keys() arrays and returns true if they are equal.
 *
 * @param keyArray1 Object.keys() array to compare
 * @param keyArray1 Object.keys() array to compare
 */
function keyArraysAreEqual(keyArray1: string[] | null, keyArray2: string[] | null): boolean {
  if (!Array.isArray(keyArray1) || !Array.isArray(keyArray2)) {
    return false;
  }

  if (keyArray1.length !== keyArray2.length) {
    return false;
  }

  for (let i = 0; i < keyArray1.length; i++) {
    if (keyArray1[i] !== keyArray2[i]) {
      return false;
    }
  }

  return true;
}
