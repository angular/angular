/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Descriptor, NestedProp, PropType} from 'protocol';

import {getKeys} from './object-utils';
import {createLevelSerializedDescriptor, createNestedSerializedDescriptor, createShallowSerializedDescriptor, PropertyData,} from './serialized-descriptor-factory';

// todo(aleksanderbodurri) pull this out of this file
const METADATA_PROPERTY_NAME = '__ngContext__';

const ignoreList = new Set([METADATA_PROPERTY_NAME, '__ngSimpleChanges__']);

const commonTypes = {
  boolean: PropType.Boolean,
  bigint: PropType.BigInt,
  function: PropType.Function,
  number: PropType.Number,
  string: PropType.String,
  symbol: PropType.Symbol,
};

const MAX_LEVEL = 1;

const getPropType = (prop: any): PropType => {
  if (prop === undefined) {
    return PropType.Undefined;
  }
  if (prop === null) {
    return PropType.Null;
  }
  if (prop instanceof HTMLElement) {
    return PropType.HTMLNode;
  }
  const type = typeof prop;
  if (commonTypes[type] !== undefined) {
    return commonTypes[type];
  }
  if (type === 'object') {
    if (Array.isArray(prop)) {
      return PropType.Array;
    } else if (prop instanceof Set) {
      return PropType.Set;
    } else if (Object.prototype.toString.call(prop) === '[object Date]') {
      return PropType.Date;
    } else if (prop instanceof Node) {
      return PropType.HTMLNode;
    } else {
      return PropType.Object;
    }
  }
  return PropType.Unknown;
};

const nestedSerializer =
    (instance: any, propName: string|number, nodes: NestedProp[], currentLevel = 0,
     level = MAX_LEVEL): Descriptor => {
      const serializableInstance = instance[propName];
      const propData:
          PropertyData = {prop: serializableInstance, type: getPropType(serializableInstance)};

      if (currentLevel < level) {
        return levelSerializer(
            instance, propName, currentLevel, level, nestedSerializerContinuation(nodes, level));
      }

      switch (propData.type) {
        case PropType.Array:
        case PropType.Object:
          return createNestedSerializedDescriptor(
              instance, propName, propData, {level, currentLevel}, nodes, nestedSerializer);
        default:
          return createShallowSerializedDescriptor(instance, propName, propData);
      }
    };

const nestedSerializerContinuation = (nodes: NestedProp[], level: number) =>
    (instance: any, propName: string, nestedLevel: number) => {
      const idx = nodes.findIndex((v) => v.name === propName);
      if (idx < 0) {
        // The property is not specified in the query.
        return nestedSerializer(instance, propName, [], nestedLevel, level);
      }
      return nestedSerializer(instance, propName, nodes[idx].children, nestedLevel, level);
    };

const levelSerializer =
    (instance: any, propName: string|number, currentLevel = 0, level = MAX_LEVEL,
     continuation = levelSerializer): Descriptor => {
      const serializableInstance = instance[propName];
      const propData:
          PropertyData = {prop: serializableInstance, type: getPropType(serializableInstance)};

      switch (propData.type) {
        case PropType.Array:
        case PropType.Object:
          return createLevelSerializedDescriptor(
              instance, propName, propData, {level, currentLevel}, continuation);
        default:
          return createShallowSerializedDescriptor(instance, propName, propData);
      }
    };

export const serializeDirectiveState =
    (instance: object, levels = MAX_LEVEL): {[key: string]: Descriptor} => {
      const result = {};
      getKeys(instance).forEach((prop) => {
        if (typeof prop === 'string' && ignoreList.has(prop)) {
          return;
        }
        result[prop] = levelSerializer(instance, prop, null, 0, levels);
      });
      return result;
    };

export const deeplySerializeSelectedProperties =
    (instance: any, props: NestedProp[]): {[name: string]: Descriptor} => {
      const result = {};
      getKeys(instance).forEach((prop) => {
        if (ignoreList.has(prop)) {
          return;
        }
        const idx = props.findIndex((v) => v.name === prop);
        if (idx < 0) {
          result[prop] = levelSerializer(instance, prop);
        } else {
          result[prop] = nestedSerializer(instance, prop, props[idx].children);
        }
      });
      return result;
    };
