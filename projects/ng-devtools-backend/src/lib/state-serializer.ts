import { Descriptor, PropType, NestedProp } from 'protocol';

const ignoreList = new Set(['__ngContext__', '__ngSimpleChanges__']);

const commonTypes = {
  boolean: PropType.Boolean,
  bigint: PropType.BigInt,
  function: PropType.Function,
  number: PropType.Number,
  string: PropType.String,
  symbol: PropType.Symbol,
};

const maxLevel = 1;

const getDescriptorPreview = (type: PropType, prop: any) => {
  switch (type) {
    case PropType.Array:
      return `Array(${prop.length})`;
    case PropType.BigInt:
    case PropType.Boolean:
      return truncate(prop.toString());
    case PropType.String:
      return `"${prop}"`;
    case PropType.Function:
      return `${prop.name}(...)`;
    case PropType.HTMLElement:
      return prop.constructor.name;
    case PropType.Null:
      return 'null';
    case PropType.Number:
      return parseInt(prop, 10);
    case PropType.Object:
      return Object.keys(prop).length > 0 ? '{...}' : '{}';
    case PropType.Symbol:
      return 'Symbol()';
    case PropType.Undefined:
      return 'undefined';
    case PropType.Unknown:
      return 'unknown';
  }
  return '';
};

const getPropType = (prop: any) => {
  if (prop === undefined) {
    return PropType.Undefined;
  }
  if (prop === null) {
    return PropType.Null;
  }
  if (prop instanceof HTMLElement) {
    return PropType.HTMLElement;
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
    } else {
      return PropType.Object;
    }
  }
  console.log(type, prop);
  return PropType.Unknown;
};

const truncate = (str: string, max = 20) => {
  if (str.length > max) {
    return str.substr(0, max) + '...';
  }
  return str;
};

const serializeShallowProperty = (prop: any) => {
  const type = getPropType(prop);
  switch (type) {
    case PropType.BigInt:
      return {
        type,
        value: truncate(prop.toString()),
        editable: false,
        expandable: false,
        preview: getDescriptorPreview(type, prop),
      };
    case PropType.String:
      return {
        type,
        value: truncate(prop.toString()),
        editable: true,
        expandable: false,
        preview: getDescriptorPreview(type, prop),
      };
    case PropType.Boolean:
    case PropType.Number:
    case PropType.Date:
      return {
        type,
        value: prop,
        editable: true,
        expandable: false,
        preview: getDescriptorPreview(type, prop),
      };
    case PropType.Null:
    case PropType.Undefined:
      return {
        type,
        editable: true,
        expandable: false,
        preview: getDescriptorPreview(type, prop),
      };
    case PropType.Symbol:
    case PropType.Function:
    case PropType.HTMLElement:
    case PropType.Unknown: {
      return {
        type,
        editable: false,
        expandable: false,
        preview: getDescriptorPreview(type, prop),
      };
    }
  }
};

export const nestedSerializer = (
  serializableInstance: any,
  nodes: NestedProp[],
  currentLevel = 0,
  level = maxLevel
) => {
  const type = getPropType(serializableInstance);
  if (currentLevel < level) {
    return levelSerializer(
      serializableInstance,
      undefined,
      currentLevel,
      level,
      (nestedProp: any, propName: string | number | undefined, nestedLevel: number) => {
        const idx = nodes.findIndex(v => v.name === propName);
        if (idx < 0) {
          // The property is not specified in the query.
          return nestedSerializer(nestedProp, [], nestedLevel, level);
        }
        return nestedSerializer(nestedProp, nodes[idx].children, nestedLevel, level);
      }
    );
  } else {
    switch (type) {
      case PropType.Array:
        const arr: Descriptor = {
          type,
          editable: true,
          expandable: serializableInstance.length > 0,
          preview: getDescriptorPreview(type, serializableInstance),
        };
        if (nodes && nodes.length) {
          arr.value = nodes.map(c => nestedSerializer(serializableInstance[c.name], c.children, currentLevel + 1));
        }
        return arr;
      case PropType.Object:
        const obj: Descriptor = {
          type,
          editable: true,
          expandable: Object.keys(serializableInstance).length > 0,
          preview: getDescriptorPreview(type, serializableInstance),
        };
        if (nodes && nodes.length) {
          obj.value = nodes.reduce((accum, c) => {
            if (serializableInstance.hasOwnProperty(c.name) && typeof c.name === 'string' && !ignoreList.has(c.name)) {
              accum[c.name] = nestedSerializer(serializableInstance[c.name], c.children, currentLevel + 1);
            }
            return accum;
          }, {});
        }
        return obj;
      default:
        return serializeShallowProperty(serializableInstance);
    }
  }
};

export const levelSerializer = (
  serializableInstance: any,
  _: string | number | undefined = undefined,
  currentLevel = 0,
  level = maxLevel,
  continuation = levelSerializer
): Descriptor => {
  const type = getPropType(serializableInstance);
  switch (type) {
    case PropType.Array:
      if (currentLevel < level) {
        return {
          type,
          value: serializableInstance.map((nested: any, idx: number) =>
            continuation(nested, idx, currentLevel + 1, level)
          ),
          editable: true,
          expandable: serializableInstance.length > 0,
          preview: getDescriptorPreview(type, serializableInstance),
        };
      }
      return {
        type,
        editable: true,
        expandable: serializableInstance.length > 0,
        preview: getDescriptorPreview(type, serializableInstance),
      };
    case PropType.Object:
      if (currentLevel < level) {
        return {
          type,
          value: Object.keys(serializableInstance).reduce((prev, key) => {
            if (typeof key === 'string' && !ignoreList.has(key)) {
              prev[key] = continuation(serializableInstance[key], key, currentLevel + 1, level);
            }
            return prev;
          }, {}),
          editable: true,
          expandable: Object.keys(serializableInstance).length > 0,
          preview: getDescriptorPreview(type, serializableInstance),
        };
      }
      return {
        type,
        editable: true,
        expandable: Object.keys(serializableInstance).length > 0,
        preview: getDescriptorPreview(type, serializableInstance),
      };
    default:
      return serializeShallowProperty(serializableInstance);
  }
};

export const serializeComponentState = (instance: object, levels = maxLevel) => {
  const result: { [key: string]: Descriptor } = {};
  for (const prop in instance) {
    if (instance.hasOwnProperty(prop) && !ignoreList.has(prop)) {
      result[prop] = levelSerializer(instance[prop], null, 0, levels);
    }
  }
  return result;
};

export const deeplySerializeSelectedProperties = (instance: any, props: NestedProp[]) => {
  const result: { [name: string]: Descriptor } = {};
  Object.keys(instance).forEach(propName => {
    if (ignoreList.has(propName)) {
      return;
    }
    const idx = props.findIndex(v => v.name === propName);
    if (idx < 0) {
      result[propName] = levelSerializer(instance[propName]);
    } else {
      result[propName] = nestedSerializer(instance[propName], props[idx].children);
    }
  });
  return result;
};
