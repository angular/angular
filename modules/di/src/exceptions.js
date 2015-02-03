import {ListWrapper, List} from 'facade/src/collection';
import {stringify} from 'facade/src/lang';
import {Key} from './key';

function findFirstClosedCycle(keys:List) {
  var res = [];
  for(var i = 0; i < keys.length; ++i) {
    if (ListWrapper.contains(res, keys[i])) {
      ListWrapper.push(res, keys[i]);
      return res;
    } else {
      ListWrapper.push(res, keys[i]);
    }
  }
  return res;
}

function constructResolvingPath(keys:List) {
  if (keys.length > 1) {
    var reversed = findFirstClosedCycle(ListWrapper.reversed(keys));
    var tokenStrs = ListWrapper.map(reversed, (k) => stringify(k.token));
    return " (" + tokenStrs.join(' -> ') + ")";
  } else {
    return "";
  }
}

export class KeyMetadataError extends Error {}

export class ProviderError extends Error {
  keys:List;
  constructResolvingMessage:Function;
  message;
  constructor(key:Key, constructResolvingMessage:Function) {
    this.keys = [key];
    this.constructResolvingMessage = constructResolvingMessage;
    this.message = this.constructResolvingMessage(this.keys);
  }

  addKey(key:Key) {
    ListWrapper.push(this.keys, key);
    this.message = this.constructResolvingMessage(this.keys);
  }

  toString() {
    return this.message;
  }
}

export class NoProviderError extends ProviderError {
  constructor(key:Key) {
    super(key, function (keys:List) {
      var first = stringify(ListWrapper.first(keys).token);
      return `No provider for ${first}!${constructResolvingPath(keys)}`;
    });
  }
}

export class AsyncBindingError extends ProviderError {
  constructor(key:Key) {
    super(key, function (keys:List) {
      var first = stringify(ListWrapper.first(keys).token);
      return `Cannot instantiate ${first} synchronously. ` +
        `It is provided as a promise!${constructResolvingPath(keys)}`;
    });
  }
}

export class CyclicDependencyError extends ProviderError {
  constructor(key:Key) {
    super(key, function (keys:List) {
      return `Cannot instantiate cyclic dependency!${constructResolvingPath(keys)}`;
    });
  }
}

export class InstantiationError extends ProviderError {
  constructor(originalException, key:Key) {
    super(key, function (keys:List) {
      var first = stringify(ListWrapper.first(keys).token);
      return `Error during instantiation of ${first}!${constructResolvingPath(keys)}.` +
        ` ORIGINAL ERROR: ${originalException}`;
    });
  }
}

export class InvalidBindingError extends Error {
  message:string;
  constructor(binding) {
    this.message = `Invalid binding ${binding}`;
  }

  toString() {
    return this.message;
  }
}

export class NoAnnotationError extends Error {
  message:string;
  constructor(typeOrFunc) {
    this.message = `Cannot resolve all parameters for ${stringify(typeOrFunc)}`;
  }

  toString() {
    return this.message;
  }
}
