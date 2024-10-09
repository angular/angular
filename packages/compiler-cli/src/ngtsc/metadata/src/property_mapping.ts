/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InputOutputPropertySet} from '@angular/compiler';

/**
 * The name of a class property that backs an input or output declared by a directive or component.
 *
 * This type exists for documentation only.
 */
export type ClassPropertyName = string;

/**
 * The name by which an input or output of a directive or component is bound in an Angular template.
 *
 * This type exists for documentation only.
 */
export type BindingPropertyName = string;

/**
 * An input or output of a directive that has both a named JavaScript class property on a component
 * or directive class, as well as an Angular template property name used for binding.
 */
export interface InputOrOutput {
  /**
   * The name of the JavaScript property on the component or directive instance for this input or
   * output.
   */
  readonly classPropertyName: ClassPropertyName;

  /**
   * The property name used to bind this input or output in an Angular template.
   */
  readonly bindingPropertyName: BindingPropertyName;

  /** Whether the input or output is signal based. */
  readonly isSignal: boolean;
}

/**
 * A mapping of component property and template binding property names, for example containing the
 * inputs of a particular directive or component.
 *
 * A single component property has exactly one input/output annotation (and therefore one binding
 * property name) associated with it, but the same binding property name may be shared across many
 * component property names.
 *
 * Allows bidirectional querying of the mapping - looking up all inputs/outputs with a given
 * property name, or mapping from a specific class property to its binding property name.
 */
export class ClassPropertyMapping<T extends InputOrOutput = InputOrOutput>
  implements InputOutputPropertySet
{
  /**
   * Mapping from class property names to the single `InputOrOutput` for that class property.
   */
  private forwardMap: Map<ClassPropertyName, T>;

  /**
   * Mapping from property names to one or more `InputOrOutput`s which share that name.
   */
  private reverseMap: Map<BindingPropertyName, T[]>;

  private constructor(forwardMap: Map<ClassPropertyName, T>) {
    this.forwardMap = forwardMap;
    this.reverseMap = reverseMapFromForwardMap(forwardMap);
  }

  /**
   * Construct a `ClassPropertyMapping` with no entries.
   */
  static empty<T extends InputOrOutput>(): ClassPropertyMapping<T> {
    return new ClassPropertyMapping(new Map());
  }

  /**
   * Construct a `ClassPropertyMapping` from a primitive JS object which maps class property names
   * to either binding property names or an array that contains both names, which is used in on-disk
   * metadata formats (e.g. in .d.ts files).
   */
  static fromMappedObject<T extends InputOrOutput>(obj: {
    [classPropertyName: string]: BindingPropertyName | T;
  }): ClassPropertyMapping<T> {
    const forwardMap = new Map<ClassPropertyName, T>();

    for (const classPropertyName of Object.keys(obj)) {
      const value = obj[classPropertyName];
      let inputOrOutput: InputOrOutput;

      if (typeof value === 'string') {
        inputOrOutput = {
          classPropertyName,
          bindingPropertyName: value,
          // Inputs/outputs not captured via an explicit `InputOrOutput` mapping
          // value are always considered non-signal. This is the string shorthand.
          isSignal: false,
        };
      } else {
        inputOrOutput = value;
      }

      forwardMap.set(classPropertyName, inputOrOutput as T);
    }

    return new ClassPropertyMapping(forwardMap);
  }

  /**
   * Merge two mappings into one, with class properties from `b` taking precedence over class
   * properties from `a`.
   */
  static merge<T extends InputOrOutput>(
    a: ClassPropertyMapping<T>,
    b: ClassPropertyMapping<T>,
  ): ClassPropertyMapping<T> {
    const forwardMap = new Map<ClassPropertyName, T>(a.forwardMap.entries());
    for (const [classPropertyName, inputOrOutput] of b.forwardMap) {
      forwardMap.set(classPropertyName, inputOrOutput);
    }

    return new ClassPropertyMapping(forwardMap);
  }

  /**
   * All class property names mapped in this mapping.
   */
  get classPropertyNames(): ClassPropertyName[] {
    return Array.from(this.forwardMap.keys());
  }

  /**
   * All binding property names mapped in this mapping.
   */
  get propertyNames(): BindingPropertyName[] {
    return Array.from(this.reverseMap.keys());
  }

  /**
   * Check whether a mapping for the given property name exists.
   */
  hasBindingPropertyName(propertyName: BindingPropertyName): boolean {
    return this.reverseMap.has(propertyName);
  }

  /**
   * Lookup all `InputOrOutput`s that use this `propertyName`.
   */
  getByBindingPropertyName(propertyName: string): ReadonlyArray<T> | null {
    return this.reverseMap.has(propertyName) ? this.reverseMap.get(propertyName)! : null;
  }

  /**
   * Lookup the `InputOrOutput` associated with a `classPropertyName`.
   */
  getByClassPropertyName(classPropertyName: string): T | null {
    return this.forwardMap.has(classPropertyName) ? this.forwardMap.get(classPropertyName)! : null;
  }

  /**
   * Convert this mapping to a primitive JS object which maps each class property directly to the
   * binding property name associated with it.
   */
  toDirectMappedObject(): {[classPropertyName: string]: BindingPropertyName} {
    const obj: {[classPropertyName: string]: BindingPropertyName} = {};
    for (const [classPropertyName, inputOrOutput] of this.forwardMap) {
      obj[classPropertyName] = inputOrOutput.bindingPropertyName;
    }
    return obj;
  }

  /**
   * Convert this mapping to a primitive JS object which maps each class property either to itself
   * (for cases where the binding property name is the same) or to an array which contains both
   * names if they differ.
   *
   * This object format is used when mappings are serialized (for example into .d.ts files).
   * @param transform Function used to transform the values of the generated map.
   */
  toJointMappedObject<O = T>(transform: (value: T) => O): {[classPropertyName: string]: O} {
    const obj: {[classPropertyName: string]: O} = {};
    for (const [classPropertyName, inputOrOutput] of this.forwardMap) {
      obj[classPropertyName] = transform(inputOrOutput);
    }
    return obj;
  }

  /**
   * Implement the iterator protocol and return entry objects which contain the class and binding
   * property names (and are useful for destructuring).
   */
  *[Symbol.iterator](): IterableIterator<T> {
    for (const inputOrOutput of this.forwardMap.values()) {
      yield inputOrOutput;
    }
  }
}

function reverseMapFromForwardMap<T extends InputOrOutput>(
  forwardMap: Map<ClassPropertyName, T>,
): Map<BindingPropertyName, T[]> {
  const reverseMap = new Map<BindingPropertyName, T[]>();
  for (const [_, inputOrOutput] of forwardMap) {
    if (!reverseMap.has(inputOrOutput.bindingPropertyName)) {
      reverseMap.set(inputOrOutput.bindingPropertyName, []);
    }

    reverseMap.get(inputOrOutput.bindingPropertyName)!.push(inputOrOutput);
  }
  return reverseMap;
}
