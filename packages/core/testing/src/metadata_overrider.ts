/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵstringify as stringify} from '@angular/core';

import {MetadataOverride} from './metadata_override';

type StringMap = {
  [key: string]: any
};

let _nextReferenceId = 0;

export class MetadataOverrider {
  private _references = new Map<any, string>();
  /**
   * Creates a new instance for the given metadata class
   * based on an old instance and overrides.
   */
  overrideMetadata<C extends T, T>(
      metadataClass: {new(options: T): C;}, oldMetadata: C, override: MetadataOverride<T>): C {
    const props: StringMap = {};
    if (oldMetadata) {
      _valueProps(oldMetadata).forEach((prop) => props[prop] = (<any>oldMetadata)[prop]);
    }

    if (override.set) {
      if (override.remove || override.add) {
        throw new Error(`Cannot set and add/remove ${stringify(metadataClass)} at the same time!`);
      }
      setMetadata(props, override.set);
    }
    if (override.remove) {
      removeMetadata(props, override.remove, this._references);
    }
    if (override.add) {
      addMetadata(props, override.add);
    }
    return new metadataClass(<any>props);
  }
}

function removeMetadata(metadata: StringMap, remove: any, references: Map<any, string>) {
  const removeObjects = new Set<string>();
  for (const prop in remove) {
    const removeValue = remove[prop];
    if (Array.isArray(removeValue)) {
      removeValue.forEach((value: any) => {
        removeObjects.add(_propHashKey(prop, value, references));
      });
    } else {
      removeObjects.add(_propHashKey(prop, removeValue, references));
    }
  }

  for (const prop in metadata) {
    const propValue = metadata[prop];
    if (Array.isArray(propValue)) {
      metadata[prop] = propValue.filter(
          (value: any) => !removeObjects.has(_propHashKey(prop, value, references)));
    } else {
      if (removeObjects.has(_propHashKey(prop, propValue, references))) {
        metadata[prop] = undefined;
      }
    }
  }
}

function addMetadata(metadata: StringMap, add: any) {
  for (const prop in add) {
    const addValue = add[prop];
    const propValue = metadata[prop];
    if (propValue != null && Array.isArray(propValue)) {
      metadata[prop] = propValue.concat(addValue);
    } else {
      metadata[prop] = addValue;
    }
  }
}

function setMetadata(metadata: StringMap, set: any) {
  for (const prop in set) {
    metadata[prop] = set[prop];
  }
}

function _propHashKey(propName: any, propValue: any, references: Map<any, string>): string {
  let nextObjectId = 0;
  const objectIds = new Map<object, string>();
  const replacer = (key: any, value: any) => {
    if (value !== null && typeof value === 'object') {
      if (objectIds.has(value)) {
        return objectIds.get(value);
      }
      // Record an id for this object such that any later references use the object's id instead
      // of the object itself, in order to break cyclic pointers in objects.
      objectIds.set(value, `ɵobj#${nextObjectId++}`);

      // The first time an object is seen the object itself is serialized.
      return value;
    } else if (typeof value === 'function') {
      value = _serializeReference(value, references);
    }
    return value;
  };

  return `${propName}:${JSON.stringify(propValue, replacer)}`;
}

function _serializeReference(ref: any, references: Map<any, string>): string {
  let id = references.get(ref);
  if (!id) {
    id = `${stringify(ref)}${_nextReferenceId++}`;
    references.set(ref, id);
  }
  return id;
}


function _valueProps(obj: any): string[] {
  const props: string[] = [];
  // regular public props
  Object.keys(obj).forEach((prop) => {
    if (!prop.startsWith('_')) {
      props.push(prop);
    }
  });

  // getters
  let proto = obj;
  while (proto = Object.getPrototypeOf(proto)) {
    Object.keys(proto).forEach((protoProp) => {
      const desc = Object.getOwnPropertyDescriptor(proto, protoProp);
      if (!protoProp.startsWith('_') && desc && 'get' in desc) {
        props.push(protoProp);
      }
    });
  }
  return props;
}
