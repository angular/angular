import { Descriptor, NestedProp, PropType } from 'protocol';
import {
  createLevelSerializedDescriptor,
  createNestedSerializedDescriptor,
  createShallowSerializedDescriptor,
  PropertyData,
} from './serialized-descriptor-factory';
import { METADATA_PROPERTY_NAME } from '../directive-forest';

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

export const nestedSerializer = (
  serializableInstance: any,
  nodes: NestedProp[],
  currentLevel = 0,
  level = MAX_LEVEL
): Descriptor => {
  const propData: PropertyData = { prop: serializableInstance, type: getPropType(serializableInstance) };
  const levelOptions = { level, currentLevel };

  if (currentLevel < level) {
    return levelSerializer(
      serializableInstance,
      undefined,
      currentLevel,
      level,
      nestedSerializerContinuation(nodes, level)
    );
  }

  switch (propData.type) {
    case PropType.Array:
    case PropType.Object:
      return createNestedSerializedDescriptor(propData, levelOptions, nodes, nestedSerializer);
    default:
      return createShallowSerializedDescriptor(propData);
  }
};

const nestedSerializerContinuation = (nodes: NestedProp[], level: number) => (
  nestedProp: any,
  propName: string | number | undefined,
  nestedLevel: number
) => {
  const idx = nodes.findIndex((v) => v.name === propName);
  if (idx < 0) {
    // The property is not specified in the query.
    return nestedSerializer(nestedProp, [], nestedLevel, level);
  }
  return nestedSerializer(nestedProp, nodes[idx].children, nestedLevel, level);
};

export const levelSerializer = (
  serializableInstance: any,
  _: string | number | undefined = undefined,
  currentLevel = 0,
  level = MAX_LEVEL,
  continuation = levelSerializer
): Descriptor => {
  const propData: PropertyData = { prop: serializableInstance, type: getPropType(serializableInstance) };
  const levelOptions = { level, currentLevel };

  switch (propData.type) {
    case PropType.Array:
    case PropType.Object:
      return createLevelSerializedDescriptor(propData, levelOptions, continuation);
    default:
      return createShallowSerializedDescriptor(propData);
  }
};

export const serializeDirectiveState = (instance: object, levels = MAX_LEVEL): { [key: string]: Descriptor } => {
  const result = {};
  for (const prop in instance) {
    if (instance.hasOwnProperty(prop) && !ignoreList.has(prop)) {
      result[prop] = levelSerializer(instance[prop], null, 0, levels);
    }
  }
  return result;
};

export const deeplySerializeSelectedProperties = (
  instance: any,
  props: NestedProp[]
): { [name: string]: Descriptor } => {
  const result = {};
  Object.keys(instance).forEach((propName) => {
    if (ignoreList.has(propName)) {
      return;
    }
    const idx = props.findIndex((v) => v.name === propName);
    if (idx < 0) {
      result[propName] = levelSerializer(instance[propName]);
    } else {
      result[propName] = nestedSerializer(instance[propName], props[idx].children);
    }
  });
  return result;
};
