/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ContainerType, Descriptor, NestedProp, PropType} from '../../../../protocol';

import {isSignal, unwrapSignal} from '../utils';

import {getDescriptor, getKeys} from './object-utils';

// todo(aleksanderbodurri) pull this out of this file
const METADATA_PROPERTY_NAME = '__ngContext__';

type NestedType = PropType.Array | PropType.Object;

export interface CompositeType {
  type: Extract<PropType, NestedType>;
  prop: any;
  containerType: ContainerType;
}

export interface TerminalType {
  type: Exclude<PropType, NestedType>;
  prop: any;
  containerType: ContainerType;
}

export type PropertyData = TerminalType | CompositeType;

export type Formatter<Result> = {
  [key in PropType]: (data: any) => Result;
};

interface LevelOptions {
  currentLevel: number;
  level?: number;
}

const serializable: Set<PropType> = new Set([
  PropType.Boolean,
  PropType.String,
  PropType.Null,
  PropType.Number,
  PropType.Object,
  PropType.Undefined,
  PropType.Unknown,
]);

const typeToDescriptorPreview: Formatter<string> = {
  [PropType.Array]: (prop: Array<unknown>) => `Array(${prop.length})`,
  [PropType.Set]: (prop: Set<unknown>) => `Set(${prop.size})`,
  [PropType.Map]: (prop: Map<unknown, unknown>) => `Map(${prop.size})`,
  [PropType.BigInt]: (prop: bigint) => truncate(prop.toString()),
  [PropType.Boolean]: (prop: boolean) => truncate(prop.toString()),
  [PropType.String]: (prop: string) => `"${prop}"`,
  [PropType.Function]: (prop: Function) => `${prop.name}(...)`,
  [PropType.HTMLNode]: (prop: Node) => prop.constructor.name,
  [PropType.Null]: (_: null) => 'null',
  [PropType.Number]: (prop: any) => parseInt(prop, 10).toString(),
  [PropType.Object]: (prop: Object) => (getKeys(prop).length > 0 ? '{...}' : '{}'),
  [PropType.Symbol]: (symbol: symbol) => `Symbol(${symbol.description})`,
  [PropType.Undefined]: (_: undefined) => 'undefined',
  [PropType.Date]: (prop: unknown) => {
    if (prop instanceof Date) {
      return `Date(${new Date(prop).toISOString()})`;
    }
    return `${prop}`;
  },
  [PropType.Unknown]: (_: any) => 'unknown',
};

type Key = string | number;
type NestedSerializerFn = (
  instance: any,
  propName: string | number,
  nodes: NestedProp[],
  isReadonly: boolean,
  currentLevel: number,
  level?: number,
) => Descriptor;

const ignoreList: Set<Key> = new Set([METADATA_PROPERTY_NAME, '__ngSimpleChanges__']);

const shallowPropTypeToTreeMetaData: Record<
  Exclude<PropType, NestedType>,
  {editable: boolean; expandable: boolean}
> = {
  [PropType.String]: {
    editable: true,
    expandable: false,
  },
  [PropType.BigInt]: {
    editable: false,
    expandable: false,
  },
  [PropType.Boolean]: {
    editable: true,
    expandable: false,
  },
  [PropType.Number]: {
    editable: true,
    expandable: false,
  },
  [PropType.Date]: {
    editable: false,
    expandable: false,
  },
  [PropType.Null]: {
    editable: true,
    expandable: false,
  },
  [PropType.Undefined]: {
    editable: true,
    expandable: false,
  },
  [PropType.Symbol]: {
    editable: false,
    expandable: false,
  },
  [PropType.Function]: {
    editable: false,
    expandable: false,
  },
  [PropType.HTMLNode]: {
    editable: false,
    expandable: false,
  },
  [PropType.Unknown]: {
    editable: false,
    expandable: false,
  },
  [PropType.Set]: {
    editable: false,
    expandable: false,
  },
  [PropType.Map]: {
    editable: false,
    expandable: false,
  },
};

const isEditable = (
  descriptor: PropertyDescriptor | undefined,
  propName: string | number,
  propData: TerminalType,
  isGetterOrSetter: boolean,
) => {
  if (propData.containerType === 'ReadonlySignal') {
    return false;
  }

  if (typeof propName === 'symbol') {
    return false;
  }

  if (isGetterOrSetter) {
    return false;
  }

  if (descriptor?.writable === false) {
    return false;
  }

  return shallowPropTypeToTreeMetaData[propData.type].editable;
};

const isGetterOrSetter = (descriptor: any): boolean =>
  (descriptor?.set || descriptor?.get) && !('value' in descriptor);

const getPreview = (propData: TerminalType | CompositeType, isGetterOrSetter: boolean) => {
  if (propData.containerType === 'ReadonlySignal') {
    return `Readonly Signal(${typeToDescriptorPreview[propData.type](propData.prop())})`;
  } else if (propData.containerType === 'WritableSignal') {
    return `Signal(${typeToDescriptorPreview[propData.type](propData.prop())})`;
  }
  return !isGetterOrSetter
    ? typeToDescriptorPreview[propData.type](propData.prop)
    : typeToDescriptorPreview[PropType.Function]({name: ''});
};

export function createShallowSerializedDescriptor(
  instance: any,
  propName: string | number,
  propData: TerminalType,
  isReadonly: boolean,
): Descriptor {
  const {type, containerType} = propData;

  const descriptor = getDescriptor(instance, propName as string);
  const getterOrSetter: boolean = isGetterOrSetter(descriptor);

  const shallowSerializedDescriptor: Descriptor = {
    type,
    expandable: shallowPropTypeToTreeMetaData[type].expandable,
    editable: isEditable(descriptor, propName, propData, getterOrSetter) && !isReadonly,
    preview: getPreview(propData, getterOrSetter),
    containerType,
  };

  if (propData.prop !== undefined && serializable.has(type)) {
    shallowSerializedDescriptor.value = unwrapSignal(propData.prop);
  }

  return shallowSerializedDescriptor;
}

export function createLevelSerializedDescriptor(
  instance: {},
  propName: string | number,
  propData: CompositeType,
  levelOptions: LevelOptions,
  continuation: (
    instance: any,
    propName: string | number,
    isReadonly: boolean,
    level?: number,
    max?: number,
  ) => Descriptor,
): Descriptor {
  const {type, prop, containerType} = propData;

  const descriptor = getDescriptor(instance, propName as string);
  const getterOrSetter: boolean = isGetterOrSetter(descriptor);

  const levelSerializedDescriptor: Descriptor = {
    type,
    editable: false,
    expandable: !getterOrSetter && getKeys(prop).length > 0,
    preview: getPreview(propData, getterOrSetter),
    containerType,
  };

  if (levelOptions.level !== undefined && levelOptions.currentLevel < levelOptions.level) {
    const value = getLevelDescriptorValue(propData, levelOptions, continuation);
    if (value !== undefined) {
      levelSerializedDescriptor.value = value;
    }
  }

  return levelSerializedDescriptor;
}

export function createNestedSerializedDescriptor(
  instance: {},
  propName: string | number,
  propData: CompositeType,
  levelOptions: LevelOptions,
  nodes: NestedProp[],
  nestedSerializer: NestedSerializerFn,
): Descriptor {
  const {type, prop, containerType} = propData;

  const descriptor = getDescriptor(instance, propName as string);
  const getterOrSetter: boolean = isGetterOrSetter(descriptor);

  const nestedSerializedDescriptor: Descriptor = {
    type,
    editable: false,
    expandable: !getterOrSetter && getKeys(prop).length > 0,
    preview: getPreview(propData, getterOrSetter),
    containerType,
  };

  if (nodes?.length) {
    const value = getNestedDescriptorValue(propData, levelOptions, nodes, nestedSerializer);
    if (value !== undefined) {
      nestedSerializedDescriptor.value = value;
    }
  }
  return nestedSerializedDescriptor;
}

function getNestedDescriptorValue(
  propData: CompositeType,
  levelOptions: LevelOptions,
  nodes: NestedProp[],
  nestedSerializer: NestedSerializerFn,
) {
  const {type, prop} = propData;
  const {currentLevel} = levelOptions;
  const value = unwrapSignal(prop);

  switch (type) {
    case PropType.Array:
      return nodes.map((nestedProp) =>
        nestedSerializer(value, nestedProp.name, nestedProp.children, false, currentLevel + 1),
      );
    case PropType.Object:
      return nodes.reduce(
        (accumulator, nestedProp) => {
          if (prop.hasOwnProperty(nestedProp.name) && !ignoreList.has(nestedProp.name)) {
            accumulator[nestedProp.name] = nestedSerializer(
              value,
              nestedProp.name,
              nestedProp.children,
              false,
              currentLevel + 1,
            );
          }
          return accumulator;
        },
        {} as Record<string, Descriptor>,
      );
  }
}

function getLevelDescriptorValue(
  propData: CompositeType,
  levelOptions: LevelOptions,
  continuation: (
    instance: any,
    propName: string | number,
    isReadonly: boolean,
    level?: number,
    max?: number,
  ) => Descriptor,
) {
  const {type, prop} = propData;
  const {currentLevel, level} = levelOptions;
  const value = unwrapSignal(prop);
  const isReadonly = isSignal(prop);
  switch (type) {
    case PropType.Array:
      return value.map((_: any, idx: number) =>
        continuation(value, idx, isReadonly, currentLevel + 1, level),
      );
    case PropType.Object:
      return getKeys(value).reduce(
        (accumulator, propName) => {
          if (!ignoreList.has(propName)) {
            accumulator[propName] = continuation(
              value,
              propName,
              isReadonly,
              currentLevel + 1,
              level,
            );
          }
          return accumulator;
        },
        {} as Record<string, Descriptor>,
      );
  }
}

function truncate(str: string, max = 20): string {
  return str.length > max ? str.substring(0, max) + '...' : str;
}
