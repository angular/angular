/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Descriptor, NestedProp, PropType} from 'protocol';

import {getDescriptor, getKeys} from './object-utils';

// todo(aleksanderbodurri) pull this out of this file
const METADATA_PROPERTY_NAME = '__ngContext__';

type NestedType = PropType.Array|PropType.Object;

export interface CompositeType {
  type: Extract<PropType, NestedType>;
  prop: any;
}

export interface TerminalType {
  type: Exclude<PropType, NestedType>;
  prop: any;
}

export type PropertyData = TerminalType|CompositeType;

export type Formatter<Result> = {
  [key in PropType]: (data: any) => Result;
};

interface LevelOptions {
  currentLevel: number;
  level?: number;
}

const serializable: {[key in PropType]: boolean} = {
  [PropType.Boolean]: true,
  [PropType.String]: true,
  [PropType.Null]: true,
  [PropType.Number]: true,
  [PropType.Object]: true,
  [PropType.Undefined]: true,
  [PropType.Unknown]: true,
  [PropType.Array]: false,
  [PropType.Set]: false,
  [PropType.Map]: false,
  [PropType.BigInt]: false,
  [PropType.Function]: false,
  [PropType.HTMLNode]: false,
  [PropType.Symbol]: false,
  [PropType.Date]: false,
};

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

type Key = string|number;
const ignoreList: Set<Key> = new Set([METADATA_PROPERTY_NAME, '__ngSimpleChanges__']);

const shallowPropTypeToTreeMetaData:
    Record<Exclude<PropType, NestedType>, {editable: boolean, expandable: boolean}> = {
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

const isEditable =
    (descriptor: any, propName: string|number, propData: TerminalType,
     isGetterOrSetter: boolean) => {
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

const getPreview = (propData: TerminalType|CompositeType, isGetterOrSetter: boolean) => {
  return !isGetterOrSetter ? typeToDescriptorPreview[propData.type](propData.prop) :
                             typeToDescriptorPreview[PropType.Function]({name: ''});
};

export const createShallowSerializedDescriptor =
    (instance: any, propName: string|number, propData: TerminalType): Descriptor => {
      const {type} = propData;

      const descriptor = getDescriptor(instance, propName as string);
      const getterOrSetter: boolean = isGetterOrSetter(descriptor);

      const shallowSerializedDescriptor: Descriptor = {
        type,
        expandable: shallowPropTypeToTreeMetaData[type].expandable,
        editable: isEditable(descriptor, propName, propData, getterOrSetter),
        preview: getPreview(propData, getterOrSetter),
      };

      if (propData.prop !== undefined && serializable[type]) {
        shallowSerializedDescriptor.value = propData.prop;
      }

      return shallowSerializedDescriptor;
    };

export const createLevelSerializedDescriptor =
    (instance: {}, propName: string|number, propData: CompositeType, levelOptions: LevelOptions,
     continuation: (instance: any, propName: string|number, level?: number, max?: number) => void):
        Descriptor => {
          const {type, prop} = propData;

          const descriptor = getDescriptor(instance, propName as string);
          const getterOrSetter: boolean = isGetterOrSetter(descriptor);

          const levelSerializedDescriptor: Descriptor = {
            type,
            editable: false,
            expandable: !getterOrSetter && getKeys(prop).length > 0,
            preview: getPreview(propData, getterOrSetter),
          };

          if (levelOptions.level !== undefined && levelOptions.currentLevel < levelOptions.level) {
            const value = getLevelDescriptorValue(propData, levelOptions, continuation);
            if (value !== undefined) {
              levelSerializedDescriptor.value = value;
            }
          }

          return levelSerializedDescriptor;
        };

export const createNestedSerializedDescriptor =
    (instance: {}, propName: string|number, propData: CompositeType, levelOptions: LevelOptions,
     nodes: NestedProp[],
     nestedSerializer: (
         instance: any, propName: string|number, nodes: NestedProp[], currentLevel: number,
         level?: number) => void): Descriptor => {
      const {type, prop} = propData;

      const descriptor = getDescriptor(instance, propName as string);
      const getterOrSetter: boolean = isGetterOrSetter(descriptor);

      const nestedSerializedDescriptor: Descriptor = {
        type,
        editable: false,
        expandable: !getterOrSetter && getKeys(prop).length > 0,
        preview: getPreview(propData, getterOrSetter),
      };

      if (nodes?.length) {
        const value = getNestedDescriptorValue(propData, levelOptions, nodes, nestedSerializer);
        if (value !== undefined) {
          nestedSerializedDescriptor.value = value;
        }
      }
      return nestedSerializedDescriptor;
    };

function getNestedDescriptorValue(
    propData: CompositeType, levelOptions: LevelOptions, nodes: NestedProp[],
    nestedSerializer: (
        instance: any, propName: string|number, nodes: NestedProp[], currentLevel: number,
        level?: number) => void) {
  const {type, prop} = propData;
  const {currentLevel} = levelOptions;

  switch (type) {
    case PropType.Array:
      return nodes.map(
          (nestedProp) =>
              nestedSerializer(prop, nestedProp.name, nestedProp.children, currentLevel + 1));
    case PropType.Object:
      return nodes.reduce((accumulator, nestedProp) => {
        if (prop.hasOwnProperty(nestedProp.name) && !ignoreList.has(nestedProp.name)) {
          accumulator[nestedProp.name] =
              nestedSerializer(prop, nestedProp.name, nestedProp.children, currentLevel + 1);
        }
        return accumulator;
      }, {} as Record<string, void>);
  }
}

function getLevelDescriptorValue(
    propData: CompositeType, levelOptions: LevelOptions,
    continuation: (instance: any, propName: string|number, level?: number, max?: number) => void) {
  const {type, prop} = propData;
  const {currentLevel, level} = levelOptions;

  switch (type) {
    case PropType.Array:
      return prop.map((_: any, idx: number) => continuation(prop, idx, currentLevel + 1, level));
    case PropType.Object:
      return getKeys(prop).reduce((accumulator, propName) => {
        if (!ignoreList.has(propName)) {
          accumulator[propName] = continuation(prop, propName, currentLevel + 1, level);
        }
        return accumulator;
      }, {} as Record<string, void>);
  }
}

const truncate = (str: string, max = 20): string => {
  if (str.length > max) {
    return str.substring(0, max) + '...';
  }
  return str;
};
