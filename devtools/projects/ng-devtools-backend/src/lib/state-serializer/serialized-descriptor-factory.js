/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {PropType} from '../../../../protocol';
import {isSignal, safelyReadSignalValue, unwrapSignal} from '../utils';
import {getDescriptor, getKeys} from './object-utils';
// todo(aleksanderbodurri) pull this out of this file
const METADATA_PROPERTY_NAME = '__ngContext__';
const serializable = new Set([
  PropType.Boolean,
  PropType.String,
  PropType.Null,
  PropType.Number,
  PropType.Object,
  PropType.Undefined,
  PropType.Unknown,
]);
const typeToDescriptorPreview = {
  [PropType.Array]: (prop) => `Array(${prop.length})`,
  [PropType.Set]: (prop) => `Set(${prop.size})`,
  [PropType.Map]: (prop) => `Map(${prop.size})`,
  [PropType.BigInt]: (prop) => truncate(prop.toString()),
  [PropType.Boolean]: (prop) => truncate(prop.toString()),
  [PropType.String]: (prop) => `"${prop}"`,
  [PropType.Function]: (prop) => `${prop.name}(...)`,
  [PropType.HTMLNode]: (prop) => prop.constructor.name,
  [PropType.Null]: (_) => 'null',
  [PropType.Number]: (prop) => parseInt(prop, 10).toString(),
  [PropType.Object]: (prop) => (getKeys(prop).length > 0 ? '{...}' : '{}'),
  [PropType.Symbol]: (symbol) => `Symbol(${symbol.description})`,
  [PropType.Undefined]: (_) => 'undefined',
  [PropType.Date]: (prop) => {
    if (prop instanceof Date) {
      return `Date(${new Date(prop).toISOString()})`;
    }
    return `${prop}`;
  },
  [PropType.Unknown]: (_) => 'unknown',
};
const ignoreList = new Set([METADATA_PROPERTY_NAME, '__ngSimpleChanges__']);
const shallowPropTypeToTreeMetaData = {
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
const isEditable = (descriptor, propName, propData, isGetterOrSetter) => {
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
const isGetterOrSetter = (descriptor) =>
  (descriptor?.set || descriptor?.get) && !('value' in descriptor);
const getPreview = (propData, isGetterOrSetter) => {
  if (propData.containerType === 'ReadonlySignal') {
    const {error, value} = safelyReadSignalValue(propData.prop);
    if (error) {
      return 'ERROR: Could not read signal value. See console for details.';
    }
    return `Readonly Signal(${typeToDescriptorPreview[propData.type](value)})`;
  } else if (propData.containerType === 'WritableSignal') {
    const {error, value} = safelyReadSignalValue(propData.prop);
    if (error) {
      return 'ERROR: Could not read signal value. See console for details.';
    }
    return `Signal(${typeToDescriptorPreview[propData.type](value)})`;
  }
  return !isGetterOrSetter
    ? typeToDescriptorPreview[propData.type](propData.prop)
    : typeToDescriptorPreview[PropType.Function]({name: ''});
};
export function createShallowSerializedDescriptor(instance, propName, propData, isReadonly) {
  const {type, containerType} = propData;
  const descriptor = getDescriptor(instance, propName);
  const getterOrSetter = isGetterOrSetter(descriptor);
  const shallowSerializedDescriptor = {
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
  instance,
  propName,
  propData,
  levelOptions,
  continuation,
) {
  const {type, prop, containerType} = propData;
  const descriptor = getDescriptor(instance, propName);
  const getterOrSetter = isGetterOrSetter(descriptor);
  const levelSerializedDescriptor = {
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
  instance,
  propName,
  propData,
  levelOptions,
  nodes,
  nestedSerializer,
) {
  const {type, prop, containerType} = propData;
  const descriptor = getDescriptor(instance, propName);
  const getterOrSetter = isGetterOrSetter(descriptor);
  const nestedSerializedDescriptor = {
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
function getNestedDescriptorValue(propData, levelOptions, nodes, nestedSerializer) {
  const {type, prop} = propData;
  const {currentLevel} = levelOptions;
  const value = unwrapSignal(prop);
  switch (type) {
    case PropType.Array:
      return nodes.map((nestedProp) =>
        nestedSerializer(value, nestedProp.name, nestedProp.children, false, currentLevel + 1),
      );
    case PropType.Object:
      return nodes.reduce((accumulator, nestedProp) => {
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
      }, {});
  }
}
function getLevelDescriptorValue(propData, levelOptions, continuation) {
  const {type, prop} = propData;
  const {currentLevel, level} = levelOptions;
  const value = unwrapSignal(prop);
  const isReadonly = isSignal(prop);
  switch (type) {
    case PropType.Array:
      return value.map((_, idx) => continuation(value, idx, isReadonly, currentLevel + 1, level));
    case PropType.Object:
      return getKeys(value).reduce((accumulator, propName) => {
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
      }, {});
  }
}
function truncate(str, max = 20) {
  return str.length > max ? str.substring(0, max) + '...' : str;
}
//# sourceMappingURL=serialized-descriptor-factory.js.map
