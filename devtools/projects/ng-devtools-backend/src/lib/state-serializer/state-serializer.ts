/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ContainerType, Descriptor, NestedProp, PropType} from '../../../../protocol';

import {isSignal, unwrapSignal} from '../utils';

import {getKeys} from './object-utils';
import {getPropType} from './prop-type';
import {
  createLevelSerializedDescriptor,
  createNestedSerializedDescriptor,
  createShallowSerializedDescriptor,
  PropertyData,
} from './serialized-descriptor-factory';

// todo(aleksanderbodurri) pull this out of this file
const METADATA_PROPERTY_NAME = '__ngContext__';

const ignoreList = new Set([METADATA_PROPERTY_NAME, '__ngSimpleChanges__']);

const MAX_LEVEL = 1;

function nestedSerializer(
  instance: any,
  propName: string | number,
  nodes: NestedProp[],
  isReadonly: boolean,
  currentLevel = 0,
  level = MAX_LEVEL,
): Descriptor {
  instance = unwrapSignal(instance);
  const serializableInstance = instance[propName];
  const propData: PropertyData = {
    prop: serializableInstance,
    type: getPropType(serializableInstance),
    containerType: getContainerType(serializableInstance),
  };

  if (currentLevel < level) {
    const continuation = (
      instance: any,
      propName: string | number,
      isReadonly: boolean,
      nestedLevel?: number,
      _?: number,
    ) => {
      const nodeChildren = nodes.find((v) => v.name === propName)?.children ?? [];
      return nestedSerializer(instance, propName, nodeChildren, isReadonly, nestedLevel, level);
    };

    return levelSerializer(instance, propName, isReadonly, currentLevel, level, continuation);
  }

  switch (propData.type) {
    case PropType.Array:
    case PropType.Object:
      return createNestedSerializedDescriptor(
        instance,
        propName,
        propData,
        {level, currentLevel},
        nodes,
        nestedSerializer,
      );
    default:
      return createShallowSerializedDescriptor(instance, propName, propData, isReadonly);
  }
}

function levelSerializer(
  instance: any,
  propName: string | number,
  isReadonly: boolean,
  currentLevel = 0,
  level = MAX_LEVEL,
  continuation = levelSerializer,
): Descriptor {
  const serializableInstance = instance[propName];
  const propData: PropertyData = {
    prop: serializableInstance,
    type: getPropType(serializableInstance),
    containerType: getContainerType(serializableInstance),
  };

  switch (propData.type) {
    case PropType.Array:
    case PropType.Object:
      return createLevelSerializedDescriptor(
        instance,
        propName,
        propData,
        {level, currentLevel},
        continuation,
      );
    default:
      return createShallowSerializedDescriptor(instance, propName, propData, isReadonly);
  }
}

export function serializeDirectiveState(instance: object): Record<string, Descriptor> {
  const result: Record<string, Descriptor> = {};
  const value = unwrapSignal(instance);
  const isReadonly = isSignal(instance);
  getKeys(value).forEach((prop) => {
    if (typeof prop === 'string' && ignoreList.has(prop)) {
      return;
    }
    result[prop] = levelSerializer(value, prop, isReadonly, 0, 0);
  });
  return result;
}

export function deeplySerializeSelectedProperties(
  instance: object,
  props: NestedProp[],
): Record<string, Descriptor> {
  const result: Record<string, Descriptor> = {};
  const isReadonly = isSignal(instance);
  getKeys(instance).forEach((prop) => {
    if (ignoreList.has(prop)) {
      return;
    }
    const childrenProps = props.find((v) => v.name === prop)?.children;
    if (!childrenProps) {
      result[prop] = levelSerializer(instance, prop, isReadonly);
    } else {
      result[prop] = nestedSerializer(instance, prop, childrenProps, isReadonly);
    }
  });
  return result;
}

function getContainerType(instance: unknown): ContainerType {
  if (isSignal(instance)) {
    return isWritableSignal(instance) ? 'WritableSignal' : 'ReadonlySignal';
  }

  return null;
}

function isWritableSignal(s: any): boolean {
  return typeof s['set'] === 'function';
}
