/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Descriptor, NestedProp, PropType} from 'protocol';

import {getKeys} from './object-utils';

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
  [PropType.BigInt]: false,
  [PropType.Function]: false,
  [PropType.HTMLNode]: false,
  [PropType.Symbol]: false,
  [PropType.Date]: false,
};

const typeToDescriptorPreview: Formatter<string> = {
  [PropType.Array]: (prop: any) => `Array(${prop.length})`,
  [PropType.Set]: (prop: any) => `Set(${prop.size})`,
  [PropType.BigInt]: (prop: any) => truncate(prop.toString()),
  [PropType.Boolean]: (prop: any) => truncate(prop.toString()),
  [PropType.String]: (prop: any) => `"${prop}"`,
  [PropType.Function]: (prop: any) => `${prop.name}(...)`,
  [PropType.HTMLNode]: (prop: any) => prop.constructor.name,
  [PropType.Null]: (_: any) => 'null',
  [PropType.Number]: (prop: any) => parseInt(prop, 10).toString(),
  [PropType.Object]: (prop: any) => (getKeys(prop).length > 0 ? '{...}' : '{}'),
  [PropType.Symbol]: (_: any) => 'Symbol()',
  [PropType.Undefined]: (_: any) => 'undefined',
  [PropType.Date]: (prop: any) => {
    if (prop instanceof Date) {
      return `Date(${new Date(prop).toISOString()})`;
    }
    return prop;
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
    };

const isEditable = (instance: any, propName: string|number, propData: TerminalType) => {
  if (typeof propName === 'symbol') {
    return false;
  }
  const descriptor = Object.getOwnPropertyDescriptor(instance, propName as string);
  if (descriptor?.writable === false) {
    return false;
  }
  if (!descriptor?.set && descriptor && !('value' in descriptor)) {
    return false;
  }
  if (descriptor?.set && !descriptor?.get && !('value' in descriptor)) {
    return false;
  }
  return shallowPropTypeToTreeMetaData[propData.type].editable;
};

const hasValue = (obj: {}, prop: string|number) => {
  const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
  if (!descriptor?.get && descriptor?.set && typeof descriptor?.value === 'undefined') {
    return false;
  }
  return true;
};

const getPreview =
    (instance: {}, propName: string|number, propData: TerminalType|CompositeType) => {
      return hasValue(instance, propName) ? typeToDescriptorPreview[propData.type](propData.prop) :
                                            SETTER_FIELD_PREVIEW;
    };

const SETTER_FIELD_PREVIEW = '[setter]';

export const createShallowSerializedDescriptor =
    (instance: any, propName: string|number, propData: TerminalType): Descriptor => {
      const {type} = propData;

      const shallowSerializedDescriptor: Descriptor = {
        type,
        expandable: shallowPropTypeToTreeMetaData[type].expandable,
        editable: isEditable(instance, propName, propData),
        preview: getPreview(instance, propName, propData),
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

          const levelSerializedDescriptor: Descriptor = {
            type,
            editable: false,
            expandable: getKeys(prop).length > 0,
            preview: getPreview(instance, propName, propData),
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
         instance: any, propName: string, nodes: NestedProp[], currentLevel: number,
         level?: number) => void): Descriptor => {
      const {type, prop} = propData;

      const nestedSerializedDescriptor: Descriptor = {
        type,
        editable: false,
        expandable: getKeys(prop).length > 0,
        preview: getPreview(instance, propName, propData),
      };

      if (nodes && nodes.length) {
        const value = getNestedDescriptorValue(propData, levelOptions, nodes, nestedSerializer);
        if (value !== undefined) {
          nestedSerializedDescriptor.value = value;
        }
      }
      return nestedSerializedDescriptor;
    };

const getNestedDescriptorValue =
    (propData: CompositeType, levelOptions: LevelOptions, nodes: NestedProp[],
     nestedSerializer: (
         instance: any, propName: string|number, nodes: NestedProp[], currentLevel: number,
         level?: number) => void) => {
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
          }, {});
      }
    };

const getLevelDescriptorValue =
    (propData: CompositeType, levelOptions: LevelOptions,
     continuation: (instance: any, propName: string|number, level?: number, max?: number) =>
         void) => {
      const {type, prop} = propData;
      const {currentLevel, level} = levelOptions;

      switch (type) {
        case PropType.Array:
          return prop.map(
              (_: any, idx: number) => continuation(prop, idx, currentLevel + 1, level));
        case PropType.Object:
          return getKeys(prop).reduce((accumulator, propName) => {
            if (!ignoreList.has(propName)) {
              accumulator[propName] = continuation(prop, propName, currentLevel + 1, level);
            }
            return accumulator;
          }, {});
      }
    };

const truncate = (str: string, max = 20): string => {
  if (str.length > max) {
    return str.substring(0, max) + '...';
  }
  return str;
};
